"""Local-only FastAPI laboratory API. Do not enable access-body logging."""

from __future__ import annotations

import asyncio
import logging
import os
import threading
import time
from collections.abc import Awaitable, Callable
from contextlib import asynccontextmanager
from typing import Any

import psutil
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, Response

from .attacks import public_job, run_job
from .benchmark import measure
from .crypto import ResourceBusyError, hash_password, verify_password
from .schemas import AttackRequest, HashRequest, VerifyRequest
from .state import (
    LOCK,
    MAX_HASH_RECORDS,
    MAX_JOBS,
    TTL_SECONDS,
    HashRecord,
    JobRecord,
    active_job_id,
    cleanup,
    hash_records,
    jobs,
    new_id,
)

MAX_BODY_BYTES = 16_384
UI_ORIGIN = "http://127.0.0.1:5173"
BENCHMARK_LOCK = threading.Lock()
PROCESS = psutil.Process(os.getpid())
PROCESS.cpu_percent(interval=None)
STARTED_AT = time.monotonic()
LOGGER = logging.getLogger("psa.lab")


class BodyLimitMiddleware:
    """Reject oversized request bodies while buffering no more than the cap."""

    def __init__(self, app: Any, max_bytes: int = MAX_BODY_BYTES) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(
        self,
        scope: dict[str, Any],
        receive: Callable[[], Awaitable[dict[str, Any]]],
        send: Callable[..., Awaitable[None]],
    ) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = dict(scope.get("headers", []))
        content_length = headers.get(b"content-length")
        if content_length:
            try:
                if int(content_length) > self.max_bytes:
                    await self._too_large(scope, send)
                    return
            except ValueError:
                await self._too_large(scope, send)
                return
        chunks: list[bytes] = []
        total = 0
        more = True
        while more:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            total += len(chunk)
            if total > self.max_bytes:
                await self._too_large(scope, send)
                return
            chunks.append(chunk)
            more = message.get("more_body", False)
        body = b"".join(chunks)
        sent = False

        async def replay() -> dict[str, Any]:
            nonlocal sent
            if sent:
                return {"type": "http.request", "body": b"", "more_body": False}
            sent = True
            return {"type": "http.request", "body": body, "more_body": False}

        await self.app(scope, replay, send)

    @staticmethod
    async def _too_large(scope: dict[str, Any], send: Callable[..., Awaitable[None]]) -> None:
        response = JSONResponse({"detail": "Request body exceeds the lab limit."}, status_code=413)
        await response(scope, lambda: None, send)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    async def expire_state() -> None:
        while True:
            await asyncio.sleep(15)
            cleanup()

    cleanup_task = asyncio.create_task(expire_state())
    try:
        yield
    finally:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Password Security Laboratory API",
    version="0.1.0",
    description=(
        "Loopback educational password storage and bounded synthetic attack laboratory. "
        "Use synthetic examples only. Request bodies are not logged."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)
app.add_middleware(BodyLimitMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=[UI_ORIGIN],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)


@app.middleware("http")
async def origin_guard(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    origin = request.headers.get("origin")
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and origin and origin != UI_ORIGIN:
        return JSONResponse({"detail": "Origin is not allowed."}, status_code=403)
    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def validation_error(_request: Request, _exc: RequestValidationError) -> JSONResponse:
    # Pydantic details may include the submitted password under `input`; never echo it.
    return JSONResponse(
        {"detail": "Invalid request. Check the documented field formats and limits."},
        status_code=422,
    )


@app.get("/lab/health")
def health() -> dict[str, Any]:
    """Return measured local service status and current in-memory resource counts."""
    cleanup()
    cpu_percent = psutil.cpu_percent(interval=0.05)
    memory = PROCESS.memory_info().rss
    total_memory = psutil.virtual_memory().total
    with LOCK:
        running_jobs = sum(job.state in {"queued", "running"} for job in jobs.values())
        stored_hashes = len(hash_records)
    return {
        "status": "ok",
        "scope": "loopback educational laboratory",
        "processId": PROCESS.pid,
        "uptimeSeconds": round(time.monotonic() - STARTED_AT, 1),
        "cpuPercent": round(cpu_percent, 1),
        "processMemoryBytes": memory,
        "hostMemoryBytes": total_memory,
        "activeExperiments": running_jobs,
        "storedVerifiers": stored_hashes,
    }


@app.post("/lab/benchmark", operation_id="runBenchmarkSingular")
@app.post("/lab/benchmarks", operation_id="runBenchmark")
def benchmark() -> dict[str, Any]:
    if not BENCHMARK_LOCK.acquire(blocking=False):
        raise HTTPException(status_code=429, detail="A benchmark is already running.")
    try:
        return measure()
    except ResourceBusyError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from None
    finally:
        BENCHMARK_LOCK.release()


@app.post("/lab/hash")
def create_hash(payload: HashRequest) -> dict[str, Any]:
    if len(payload.password.encode("utf-8")) > 4096:
        raise HTTPException(status_code=413, detail="Input exceeds the lab byte limit.")
    try:
        options = {
            key: value
            for key, value in {
                "iterations": payload.iterations,
                "workFactor": payload.work_factor,
                "memoryKiB": payload.memory_kib,
                "timeCost": payload.time_cost,
                "parallelism": payload.parallelism,
            }.items()
            if value is not None
        }
        material = hash_password(payload.password, payload.algorithm, options)
    except ResourceBusyError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from None
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from None
    cleanup()
    with LOCK:
        if len(hash_records) >= MAX_HASH_RECORDS:
            raise HTTPException(
                status_code=503, detail="The short-lived demo store is full; retry shortly."
            )
        hash_id = new_id()
        hash_records[hash_id] = HashRecord(material, time.monotonic() + TTL_SECONDS)
    return {
        "hashId": hash_id,
        "algorithm": material.algorithm,
        "storedHash": material.encoded,
        "parameters": material.parameters,
        "salt": material.salt_display,
        "generationMs": round(material.elapsed_ms, 3),
        "expiresInSeconds": TTL_SECONDS,
    }


@app.post("/lab/verify")
def verify(payload: VerifyRequest) -> dict[str, Any]:
    cleanup()
    with LOCK:
        record = hash_records.get(payload.hash_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Demo verifier expired or does not exist.")
    started = time.perf_counter_ns()
    try:
        matched = verify_password(
            payload.password, record.material.algorithm, record.material.encoded
        )
    except ResourceBusyError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from None
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from None
    return {
        "matched": matched,
        "algorithm": record.material.algorithm,
        "verificationMs": round((time.perf_counter_ns() - started) / 1_000_000, 3),
    }


@app.delete("/lab/hash/{hash_id}")
def delete_hash(hash_id: str) -> dict[str, str]:
    if len(hash_id) < 32 or len(hash_id) > 64 or not all(c.isalnum() or c in "_-" for c in hash_id):
        raise HTTPException(status_code=404, detail="Demo verifier not found.")
    with LOCK:
        if hash_records.pop(hash_id, None) is None:
            raise HTTPException(status_code=404, detail="Demo verifier expired or does not exist.")
    return {"status": "cleared"}


def _run_and_release(job: JobRecord, payload: AttackRequest) -> None:
    global active_job_id
    try:
        run_job(job, payload)
    except Exception as exc:
        # Keep the job terminal and observable without logging exception text,
        # which could include request-derived data from a native crypto library.
        LOGGER.error("Synthetic attack worker failed with %s", type(exc).__name__)
        with LOCK:
            job.state = "error"
            job.stop_reason = "error"
            job.expires_at = time.monotonic() + 60
    finally:
        with LOCK:
            if active_job_id == job.job_id:
                active_job_id = None


@app.post("/lab/attacks", status_code=202)
def create_attack(payload: AttackRequest) -> dict[str, Any]:
    global active_job_id
    from .attacks import TARGETS

    cleanup()
    if TARGETS[payload.target_id][0] != payload.experiment:
        raise HTTPException(
            status_code=422, detail="Target is not available for this experiment type."
        )
    with LOCK:
        if active_job_id is not None:
            active = jobs.get(active_job_id)
            if active and active.state in {"queued", "running"}:
                raise HTTPException(status_code=409, detail="One experiment is already active.")
        if len(jobs) >= MAX_JOBS:
            raise HTTPException(
                status_code=503, detail="The short-lived job store is full; retry shortly."
            )
        job_id = new_id()
        job = JobRecord(job_id, "queued", payload.experiment, payload.algorithm, {})
        jobs[job_id] = job
        active_job_id = job_id
        job.state = "running"
        worker = threading.Thread(target=_run_and_release, args=(job, payload), daemon=True)
        try:
            worker.start()
        except RuntimeError:
            job.state = "error"
            job.stop_reason = "error"
            job.expires_at = time.monotonic() + 60
            active_job_id = None
            raise HTTPException(
                status_code=503, detail="The experiment worker could not be started."
            ) from None
    return public_job(job)


@app.get("/lab/attacks/{job_id}")
def get_attack(job_id: str) -> dict[str, Any]:
    if len(job_id) < 32 or len(job_id) > 64 or not all(c.isalnum() or c in "_-" for c in job_id):
        raise HTTPException(status_code=404, detail="Experiment not found.")
    cleanup()
    with LOCK:
        job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return public_job(job)


@app.delete("/lab/attacks/{job_id}")
def cancel_attack(job_id: str) -> dict[str, Any]:
    if len(job_id) < 32 or len(job_id) > 64 or not all(c.isalnum() or c in "_-" for c in job_id):
        raise HTTPException(status_code=404, detail="Experiment not found.")
    cleanup()
    with LOCK:
        job = jobs.get(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Experiment not found.")
        if job.state in {"queued", "running"}:
            job.cancel.set()
    return public_job(job)


def main() -> None:
    """Run a loopback-only server with HTTP access logs disabled."""
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, access_log=False, log_level="warning")


if __name__ == "__main__":
    main()
