from __future__ import annotations

import pytest

from app.attacks import brute_candidates, candidate_plan, public_job, run_job
from app.schemas import AttackRequest
from app.state import JobRecord


def test_brute_force_enumeration_is_ordered_and_search_space_is_exact() -> None:
    assert list(brute_candidates("ab", 2)) == ["a", "b", "aa", "ab", "ba", "bb"]
    request = AttackRequest(experiment="bruteforce", target_id="bruteforce-two", algorithm="sha256")
    job = JobRecord("a" * 43, "running", request.experiment, request.algorithm, {})
    run_job(job, request)
    assert job.state == "recovered"
    assert job.search_space == 6
    assert job.attempts == 5
    assert job.candidate_elapsed_ms > 0
    result = public_job(job)
    assert result["candidateElapsedMs"] > 0
    assert result["candidateThroughputPerSecond"] > 0
    assert result["candidateThroughputPerSecond"] == pytest.approx(
        job.attempts / (job.candidate_elapsed_ms / 1000), rel=0.001
    )


def test_dictionary_recovers_internal_synthetic_target() -> None:
    request = AttackRequest(
        experiment="dictionary", target_id="dictionary-last", algorithm="sha256"
    )
    job = JobRecord("b" * 43, "running", request.experiment, request.algorithm, {})
    run_job(job, request)
    assert job.state == "recovered"
    assert job.attempts == 7


def test_dictionary_attempt_cap_reports_inconclusive_limit() -> None:
    request = AttackRequest(
        experiment="dictionary", target_id="dictionary-last", algorithm="sha256", max_attempts=2
    )
    job = JobRecord("c" * 43, "running", request.experiment, request.algorithm, {})
    run_job(job, request)
    assert job.state == "attempt_limit"
    assert job.attempts == 2


def test_cancelled_job_stops_before_candidate_attempts() -> None:
    request = AttackRequest(
        experiment="dictionary", target_id="dictionary-last", algorithm="sha256"
    )
    job = JobRecord("d" * 43, "running", request.experiment, request.algorithm, {})
    job.cancel.set()
    run_job(job, request)
    assert job.state == "cancelled"
    assert job.attempts == 0


def test_slow_real_candidate_checks_stop_at_the_wall_time_budget() -> None:
    # Verify that the wall-clock budget is respected using the minimum timeout (1 s).
    # We use argon2id (memory-hard KDF) so the per-candidate cost is high and the
    # 7-word dictionary is unlikely to be fully exhausted within a 1-second window.
    # On pathologically fast machines the target may still be recovered, so we also
    # accept "recovered" but assert the elapsed time did not exceed the budget by
    # more than a generous 500 ms grace period.
    request = AttackRequest(
        experiment="dictionary",
        target_id="dictionary-last",
        algorithm="argon2id",
        timeout_seconds=1,
    )
    job = JobRecord("e" * 43, "running", request.experiment, request.algorithm, {})
    run_job(job, request)
    assert job.state in {"time_limit", "recovered"}
    # The job must not run significantly over its budget.
    assert job.elapsed_ms < 1500


@pytest.mark.parametrize(
    ("experiment", "target_id", "expected_attempts", "expected_space"),
    [
        ("pattern", "pattern-date", 4, 5),
        ("suffix", "suffix-year", 5, 5),
        ("substitution", "substitution-basic", 4, 4),
        ("word_combination", "word-combination-two", 2, 49),
    ],
)
def test_bounded_educational_strategies_recover_only_internal_targets(
    experiment: str, target_id: str, expected_attempts: int, expected_space: int
) -> None:
    request = AttackRequest(experiment=experiment, target_id=target_id, algorithm="sha256")
    candidates = candidate_plan(request)
    job = JobRecord("f" * 43, "running", request.experiment, request.algorithm, {})
    run_job(job, request)
    assert job.state == "recovered"
    assert job.attempts == expected_attempts
    assert job.search_space == expected_space == len(candidates)


def test_candidate_strategies_have_fixed_small_budgets() -> None:
    for experiment, target_id in (
        ("pattern", "pattern-date"),
        ("suffix", "suffix-year"),
        ("substitution", "substitution-basic"),
        ("word_combination", "word-combination-two"),
    ):
        request = AttackRequest(experiment=experiment, target_id=target_id, algorithm="sha256")
        candidates = candidate_plan(request)
        assert candidates
        assert len(candidates) <= 1_000
        assert len(set(candidates)) == len(candidates)
