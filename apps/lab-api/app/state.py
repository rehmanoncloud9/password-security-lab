"""Bounded, process-memory-only demo verifier and job state."""

from __future__ import annotations

import secrets
import threading
import time
from dataclasses import dataclass, field
from typing import Any

TTL_SECONDS = 600
MAX_HASH_RECORDS = 100
MAX_JOBS = 100
LOCK = threading.RLock()


@dataclass
class HashRecord:
    material: Any
    expires_at: float
    fixture_id: str = "fixture-alpha-baseline"


@dataclass
class JobRecord:
    job_id: str
    state: str
    experiment: str
    algorithm: str
    parameters: dict[str, Any]
    attempts: int = 0
    search_space: int | None = None
    elapsed_ms: float = 0.0
    candidate_elapsed_ms: float = 0.0
    stop_reason: str | None = None
    cancel: threading.Event = field(default_factory=threading.Event)
    expires_at: float = field(default_factory=lambda: time.monotonic() + TTL_SECONDS)


hash_records: dict[str, HashRecord] = {}
jobs: dict[str, JobRecord] = {}
active_job_id: str | None = None


def cleanup() -> None:
    now = time.monotonic()
    with LOCK:
        for key in [key for key, item in hash_records.items() if item.expires_at <= now]:
            hash_records.pop(key, None)
        for key in [key for key, item in jobs.items() if item.expires_at <= now]:
            jobs.pop(key, None)


def new_id() -> str:
    return secrets.token_urlsafe(32)
