"""Deterministic synthetic-only bounded guessing experiments."""

from __future__ import annotations

import itertools
import time
from collections.abc import Iterable

from .crypto import hash_password, verify_password
from .schemas import AttackRequest
from .state import LOCK, JobRecord

WORDLIST = ("amber", "birch", "cobalt", "dune", "ember", "granite", "willow")
TARGETS = {
    "dictionary-first": ("dictionary", "amber"),
    "dictionary-last": ("dictionary", "willow"),
    "bruteforce-two": ("bruteforce", "ba"),
    "pattern-date": ("pattern", "granite2024"),
    "suffix-year": ("suffix", "cobalt2024"),
    "substitution-basic": ("substitution", "3mb3r"),
    "word-combination-two": ("word_combination", "amberbirch"),
}
ALPHABETS = {"binary": "ab", "digits-small": "0123"}
MAX_STRATEGY_CANDIDATES = 1_000
PATTERN_CANDIDATES = ("granite", "granite1", "granite123", "granite2024", "granite2025")
SUFFIX_CANDIDATES = ("cobalt", "cobalt1", "cobalt123", "cobalt2023", "cobalt2024")
SUBSTITUTION_CANDIDATES = ("ember", "3mber", "emb3r", "3mb3r")


def brute_candidates(alphabet: str, maximum_length: int) -> Iterable[str]:
    """Enumerate short strings deterministically by length then alphabet order."""
    for length in range(1, maximum_length + 1):
        for symbols in itertools.product(alphabet, repeat=length):
            yield "".join(symbols)


def candidate_plan(request: AttackRequest) -> tuple[str, ...]:
    """Build a deterministic, fixed candidate list for one synthetic target."""
    if request.experiment == "dictionary":
        candidates = WORDLIST[:4] if request.target_id == "dictionary-first" else WORDLIST
    elif request.experiment == "bruteforce":
        candidates = tuple(brute_candidates(ALPHABETS[request.alphabet_id], request.max_length))
    elif request.experiment == "pattern":
        candidates = PATTERN_CANDIDATES
    elif request.experiment == "suffix":
        candidates = SUFFIX_CANDIDATES
    elif request.experiment == "substitution":
        candidates = SUBSTITUTION_CANDIDATES
    elif request.experiment == "word_combination":
        candidates = tuple("".join(words) for words in itertools.product(WORDLIST, repeat=2))
    else:
        raise ValueError("Unsupported educational experiment strategy.")
    if len(candidates) > MAX_STRATEGY_CANDIDATES:
        raise ValueError("Educational candidate plan exceeds its fixed safety limit.")
    return candidates


def run_job(job: JobRecord, request: AttackRequest) -> None:
    """Run a synthetic target check, publishing only counters and terminal state."""
    kind, target = TARGETS[request.target_id]
    started = time.perf_counter()
    deadline = started + request.timeout_seconds
    if job.cancel.is_set():
        with LOCK:
            job.state = "cancelled"
            job.stop_reason = "cancelled"
            job.elapsed_ms = (time.perf_counter() - started) * 1000
            job.expires_at = time.monotonic() + 60
        return
    material = hash_password(target, request.algorithm)
    job.parameters = material.parameters
    candidates = candidate_plan(request)
    if kind == "bruteforce":
        job.search_space = sum(
            len(ALPHABETS[request.alphabet_id]) ** n for n in range(1, request.max_length + 1)
        )
    else:
        job.search_space = len(candidates)
    terminal: str | None = None
    if time.perf_counter() >= deadline:
        terminal = "time_limit"
    for candidate in () if terminal else candidates:
        if job.cancel.is_set():
            terminal = "cancelled"
            break
        if time.perf_counter() >= deadline:
            terminal = "time_limit"
            break
        if job.attempts >= request.max_attempts:
            terminal = "attempt_limit"
            break
        candidate_started = time.perf_counter_ns()
        matched = verify_password(candidate, request.algorithm, material.encoded)
        candidate_elapsed_ms = (time.perf_counter_ns() - candidate_started) / 1_000_000
        with LOCK:
            job.attempts += 1
            job.candidate_elapsed_ms += candidate_elapsed_ms
            job.elapsed_ms = (time.perf_counter() - started) * 1000
        if matched:
            terminal = "recovered"
            break
    if terminal is None:
        terminal = "not_found_within_budget"
    if job.cancel.is_set() and terminal != "recovered":
        terminal = "cancelled"
    if time.perf_counter() >= deadline and terminal not in {"recovered", "cancelled"}:
        terminal = "time_limit"
    job.elapsed_ms = (time.perf_counter() - started) * 1000
    with LOCK:
        job.state = terminal
        job.stop_reason = terminal
        job.expires_at = time.monotonic() + 60


def public_job(job: JobRecord) -> dict[str, object]:
    with LOCK:
        return {
            "jobId": job.job_id,
            "state": job.state,
            "attempts": job.attempts,
            "elapsedMs": round(job.elapsed_ms, 3),
            "candidateElapsedMs": round(job.candidate_elapsed_ms, 3),
            "candidateThroughputPerSecond": (
                round(job.attempts / (job.candidate_elapsed_ms / 1000), 3)
                if job.candidate_elapsed_ms > 0
                else 0.0
            ),
            "algorithm": job.algorithm,
            "parameters": dict(job.parameters),
            "searchSpace": job.search_space,
            "stopReason": job.stop_reason,
            "targetRecovered": job.state == "recovered",
        }
