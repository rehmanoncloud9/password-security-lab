from __future__ import annotations

import json
import time

import pytest
from fastapi.testclient import TestClient

import app.main as main_module
from app import state
from app.main import app


def client() -> TestClient:
    return TestClient(app, base_url="http://127.0.0.1")


def test_health_is_local_and_contains_no_user_values() -> None:
    response = client().get("/lab/health")
    assert response.status_code == 200
    status = response.json()
    assert status["status"] == "ok"
    assert status["processId"] > 0
    assert status["uptimeSeconds"] >= 0
    assert 0 <= status["cpuPercent"] <= 100
    assert status["processMemoryBytes"] > 0
    assert status["hostMemoryBytes"] >= status["processMemoryBytes"]
    assert status["activeExperiments"] >= 0
    assert status["storedVerifiers"] >= 0


def test_openapi_documents_health_and_both_benchmark_paths() -> None:
    with client() as c:
        schema = c.get("/openapi.json")
        docs = c.get("/docs")
    assert schema.status_code == docs.status_code == 200
    paths = schema.json()["paths"]
    assert "/lab/health" in paths
    assert "/lab/benchmark" in paths
    assert "/lab/benchmarks" in paths


def test_hash_api_creates_two_random_salts_and_verifies_both() -> None:
    with client() as c:
        one = c.post(
            "/lab/hash", json={"password": "synthetic example", "algorithm": "pbkdf2_sha256"}
        )
        two = c.post(
            "/lab/hash", json={"password": "synthetic example", "algorithm": "pbkdf2_sha256"}
        )
        assert one.status_code == two.status_code == 200
        a, b = one.json(), two.json()
        assert a["storedHash"] != b["storedHash"]
        assert a["salt"] != b["salt"]
        assert c.post(
            "/lab/verify", json={"hash_id": a["hashId"], "password": "synthetic example"}
        ).json()["matched"]
        assert (
            c.post("/lab/verify", json={"hash_id": b["hashId"], "password": "wrong sample"}).json()[
                "matched"
            ]
            is False
        )
        assert c.delete(f"/lab/hash/{a['hashId']}").json()["status"] == "cleared"
        assert (
            c.post(
                "/lab/verify", json={"hash_id": a["hashId"], "password": "synthetic example"}
            ).status_code
            == 404
        )


@pytest.mark.parametrize("algorithm", ["sha256", "pbkdf2_sha256", "bcrypt", "argon2id"])
def test_hash_and_verify_endpoints_cover_every_algorithm(algorithm: str) -> None:
    with client() as c:
        created = c.post(
            "/lab/hash", json={"password": "synthetic endpoint value", "algorithm": algorithm}
        )
        assert created.status_code == 200
        item = created.json()
        assert item["algorithm"] == algorithm
        good = c.post(
            "/lab/verify",
            json={"hash_id": item["hashId"], "password": "synthetic endpoint value"},
        )
        wrong = c.post(
            "/lab/verify", json={"hash_id": item["hashId"], "password": "wrong endpoint value"}
        )
        assert good.json()["matched"] is True
        assert wrong.json()["matched"] is False


def test_api_enforces_cost_floor_and_bcrypt_byte_limit() -> None:
    c = client()
    below_floor = c.post(
        "/lab/hash",
        json={"password": "synthetic", "algorithm": "pbkdf2_sha256", "iterations": 599_999},
    )
    too_long = c.post("/lab/hash", json={"password": "é" * 37, "algorithm": "bcrypt"})
    assert below_floor.status_code == 422
    assert too_long.status_code == 422


def test_validation_never_echoes_submitted_secret() -> None:
    canary = "CANARY-SYNTHETIC-DO-NOT-ECHO"
    response = client().post("/lab/hash", json={"password": canary, "algorithm": "unknown"})
    assert response.status_code == 422
    assert canary not in response.text


def test_cross_origin_mutation_is_rejected_and_untrusted_host_is_rejected() -> None:
    c = client()
    response = c.post(
        "/lab/hash",
        json={"password": "synthetic", "algorithm": "sha256"},
        headers={"Origin": "https://attacker.invalid"},
    )
    assert response.status_code == 403
    bad_host = TestClient(app, base_url="http://attacker.invalid").get("/lab/health")
    assert bad_host.status_code == 400


def test_attack_api_only_accepts_matching_synthetic_target_and_exposes_no_target() -> None:
    with client() as c:
        response = c.post(
            "/lab/attacks",
            json={
                "experiment": "dictionary",
                "target_id": "dictionary-first",
                "algorithm": "sha256",
            },
        )
        assert response.status_code == 202
        result = response.json()
        assert "amber" not in json.dumps(result)
        assert result["jobId"]
        assert result["state"] in {"queued", "running", "recovered"}
        wrong = c.post(
            "/lab/attacks",
            json={
                "experiment": "bruteforce",
                "target_id": "dictionary-first",
                "algorithm": "sha256",
            },
        )
        assert wrong.status_code == 422
        assert c.get(f"/lab/attacks/{result['jobId']}").status_code == 200


def test_additional_attack_strategy_executes_real_bounded_candidates() -> None:
    with client() as c:
        response = c.post(
            "/lab/attacks",
            json={
                "experiment": "word_combination",
                "target_id": "word-combination-two",
                "algorithm": "sha256",
            },
        )
        assert response.status_code == 202
        job_id = response.json()["jobId"]
        deadline = time.monotonic() + 2
        result = c.get(f"/lab/attacks/{job_id}").json()
        while result["state"] in {"queued", "running"} and time.monotonic() < deadline:
            time.sleep(0.01)
            result = c.get(f"/lab/attacks/{job_id}").json()
        assert result["state"] == "recovered"
        assert result["attempts"] == 2
        assert result["searchSpace"] == 49
        assert result["candidateElapsedMs"] > 0
        assert result["candidateThroughputPerSecond"] > 0
        assert "amberbirch" not in json.dumps(result)


def test_fast_attack_completion_is_not_overwritten_by_running_state(monkeypatch) -> None:
    class ImmediateThread:
        def __init__(self, *, target, args, daemon):
            self.target = target
            self.args = args

        def start(self) -> None:
            self.target(*self.args)

    monkeypatch.setattr("app.main.threading.Thread", ImmediateThread)
    response = client().post(
        "/lab/attacks",
        json={
            "experiment": "dictionary",
            "target_id": "dictionary-first",
            "algorithm": "sha256",
        },
    )
    assert response.status_code == 202
    assert response.json()["state"] == "recovered"


def test_worker_start_failure_leaves_a_terminal_job_and_releases_slot(monkeypatch) -> None:
    class FailingThread:
        def __init__(self, *, target, args, daemon):
            self.target = target
            self.args = args

        def start(self) -> None:
            raise RuntimeError("thread capacity unavailable")

    monkeypatch.setattr("app.main.threading.Thread", FailingThread)
    with state.LOCK:
        previous_ids = set(state.jobs)
    response = client().post(
        "/lab/attacks",
        json={
            "experiment": "dictionary",
            "target_id": "dictionary-first",
            "algorithm": "sha256",
        },
    )
    assert response.status_code == 503
    with state.LOCK:
        created = [state.jobs[job_id] for job_id in set(state.jobs) - previous_ids]
        assert len(created) == 1
        assert created[0].state == "error"
        assert main_module.active_job_id is None


def test_worker_error_is_observable_without_logging_candidate_text(monkeypatch, caplog) -> None:
    payload = main_module.AttackRequest(
        experiment="dictionary",
        target_id="dictionary-first",
        algorithm="sha256",
    )
    job = state.JobRecord("opaque-job-id", "running", "dictionary", "sha256", {})
    error_marker = "INTERNAL_ERROR_MARKER"

    def failed_worker(_job, _payload) -> None:
        raise RuntimeError(error_marker)

    monkeypatch.setattr(main_module, "run_job", failed_worker)
    main_module.active_job_id = job.job_id
    with caplog.at_level("ERROR", logger="psa.lab"):
        main_module._run_and_release(job, payload)

    assert job.state == "error"
    assert job.stop_reason == "error"
    assert main_module.active_job_id is None
    assert "RuntimeError" in caplog.text
    assert error_marker not in caplog.text


def test_attack_job_can_be_cancelled_and_concurrency_is_limited() -> None:
    with client() as c:
        first = c.post(
            "/lab/attacks",
            json={
                "experiment": "dictionary",
                "target_id": "dictionary-last",
                "algorithm": "pbkdf2_sha256",
            },
        )
        assert first.status_code == 202
        second = c.post(
            "/lab/attacks",
            json={
                "experiment": "dictionary",
                "target_id": "dictionary-last",
                "algorithm": "pbkdf2_sha256",
            },
        )
        assert second.status_code == 409
        job_id = first.json()["jobId"]
        c.delete(f"/lab/attacks/{job_id}")
        deadline = time.monotonic() + 3
        result = c.get(f"/lab/attacks/{job_id}").json()
        while result["state"] in {"queued", "running"} and time.monotonic() < deadline:
            time.sleep(0.02)
            result = c.get(f"/lab/attacks/{job_id}").json()
        assert result["state"] == "cancelled"


def test_oversized_body_is_rejected() -> None:
    response = client().post(
        "/lab/hash",
        content=b"{" + b" " * 16_500 + b"}",
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 413


def test_unpaired_surrogate_is_rejected_as_sanitized_validation_error() -> None:
    response = client().post(
        "/lab/hash",
        content=b'{"password":"\\ud800","algorithm":"sha256"}',
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 422
    assert "ud800" not in response.text


def test_invalid_job_identifier_is_not_found() -> None:
    assert client().get("/lab/attacks/../../secrets").status_code in {404, 405}


def test_benchmark_returns_repeated_actual_measurements_and_environment() -> None:
    result = client().post("/lab/benchmark", json={}).json()
    assert result["kind"] == "local-measurement"
    assert result["environment"]["python"]
    assert {row["algorithm"] for row in result["results"]} == {
        "sha256",
        "pbkdf2_sha256",
        "bcrypt",
        "argon2id",
    }
    for row in result["results"]:
        assert row["repetitions"] == 5
        assert len(row["hashGenerationMs"]["individual"]) == 5
        assert len(row["verificationMs"]["individual"]) == 5
        assert all(value > 0 for value in row["hashGenerationMs"]["individual"])
        assert all(value > 0 for value in row["verificationMs"]["individual"])


def test_plural_benchmark_alias_runs_the_same_measurement_path() -> None:
    response = client().post("/lab/benchmarks", json={})
    assert response.status_code == 200
    assert response.json()["kind"] == "local-measurement"
    assert response.json()["method"].startswith("One unreported warm-up")


def test_cleanup_expires_old_hashes_and_terminal_jobs(monkeypatch) -> None:
    expired_hash = "expired-hash-test"
    live_hash = "live-hash-test"
    expired_job = "expired-job-test"
    live_job = "live-job-test"
    with state.LOCK:
        state.hash_records[expired_hash] = state.HashRecord(None, 99)
        state.hash_records[live_hash] = state.HashRecord(None, 101)
        old_job = state.JobRecord(expired_job, "recovered", "dictionary", "sha256", {})
        old_job.expires_at = 99
        current_job = state.JobRecord(live_job, "cancelled", "dictionary", "sha256", {})
        current_job.expires_at = 101
        state.jobs[expired_job] = old_job
        state.jobs[live_job] = current_job
    monkeypatch.setattr(state.time, "monotonic", lambda: 100)
    try:
        state.cleanup()
        assert expired_hash not in state.hash_records
        assert expired_job not in state.jobs
        assert live_hash in state.hash_records
        assert live_job in state.jobs
    finally:
        with state.LOCK:
            state.hash_records.pop(live_hash, None)
            state.jobs.pop(live_job, None)


def test_hash_store_capacity_is_enforced(monkeypatch) -> None:
    monkeypatch.setattr(main_module, "MAX_HASH_RECORDS", 0)
    response = client().post("/lab/hash", json={"password": "synthetic", "algorithm": "sha256"})
    assert response.status_code == 503


def test_job_store_capacity_is_enforced(monkeypatch) -> None:
    monkeypatch.setattr(main_module, "MAX_JOBS", 0)
    response = client().post(
        "/lab/attacks",
        json={
            "experiment": "dictionary",
            "target_id": "dictionary-first",
            "algorithm": "sha256",
        },
    )
    assert response.status_code == 503
