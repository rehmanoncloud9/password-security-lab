"""Repeatable local hash/verify measurements over fixed synthetic inputs."""

from __future__ import annotations

import hashlib
import json
import os
import platform
import ssl
import statistics
import time
from importlib.metadata import PackageNotFoundError, version
from typing import Any

import psutil

from .crypto import hash_password, verify_password

BENCHMARK_FIXTURE_SAMPLE = "correct-horse-battery"
BENCHMARK_WRONG_SAMPLE = "incorrect-horse-battery"
DEFAULT_REPETITIONS = 5
MIN_REPETITIONS = 3
MAX_REPETITIONS = 20


def package_version(name: str) -> str | None:
    try:
        return version(name)
    except PackageNotFoundError:
        return None


def quartiles(values: list[float]) -> tuple[float, float]:
    if len(values) < 2:
        return (values[0], values[0]) if values else (0.0, 0.0)
    quartiles_value = statistics.quantiles(values, n=4, method="inclusive")
    return quartiles_value[0], quartiles_value[2]


def calculate_stats(values: list[float]) -> dict[str, Any]:
    if not values:
        return {
            "individual": [],
            "median": 0.0,
            "mean": 0.0,
            "stddev": 0.0,
            "iqr": 0.0,
            "min": 0.0,
            "max": 0.0,
        }
    q1, q3 = quartiles(values)
    mean_val = statistics.mean(values)
    stddev_val = statistics.stdev(values) if len(values) > 1 else 0.0
    return {
        "individual": [round(v, 3) for v in values],
        "median": round(statistics.median(values), 3),
        "mean": round(mean_val, 3),
        "stddev": round(stddev_val, 3),
        "iqr": round(q3 - q1, 3),
        "min": round(min(values), 3),
        "max": round(max(values), 3),
    }


def measure(repetitions: int = DEFAULT_REPETITIONS) -> dict[str, Any]:
    """Measure actual KDF generation and verification over fixed synthetic fixtures.

    Captures wall-clock latency, CPU process time, and both correct and incorrect
    verification paths. Never processes or records real user credentials.
    """
    if not (MIN_REPETITIONS <= repetitions <= MAX_REPETITIONS):
        raise ValueError(
            f"Repetitions must be an integer between {MIN_REPETITIONS} and {MAX_REPETITIONS}."
        )

    process = psutil.Process(os.getpid())
    rss_before = process.memory_info().rss

    results: list[dict[str, Any]] = []
    raw_data_collector: dict[str, Any] = {}

    for algorithm in ("sha256", "pbkdf2_sha256", "bcrypt", "argon2id"):
        # Warmup pass
        warmup = hash_password(BENCHMARK_FIXTURE_SAMPLE, algorithm)
        if not verify_password(BENCHMARK_FIXTURE_SAMPLE, algorithm, warmup.encoded):
            raise RuntimeError("Benchmark warm-up verification failed")

        gen_wall_ms: list[float] = []
        gen_cpu_ms: list[float] = []
        ver_correct_wall_ms: list[float] = []
        ver_correct_cpu_ms: list[float] = []
        ver_wrong_wall_ms: list[float] = []
        ver_wrong_cpu_ms: list[float] = []
        parameters: dict[str, int] = {}

        for _ in range(repetitions):
            # Generation timing
            cpu_start = time.process_time_ns()
            material = hash_password(BENCHMARK_FIXTURE_SAMPLE, algorithm)
            cpu_elapsed = (time.process_time_ns() - cpu_start) / 1_000_000

            gen_wall_ms.append(material.elapsed_ms)
            gen_cpu_ms.append(cpu_elapsed)
            parameters = material.parameters

            # Correct password verification timing
            cpu_start = time.process_time_ns()
            wall_start = time.perf_counter_ns()
            matched = verify_password(BENCHMARK_FIXTURE_SAMPLE, algorithm, material.encoded)
            wall_elapsed = (time.perf_counter_ns() - wall_start) / 1_000_000
            cpu_elapsed = (time.process_time_ns() - cpu_start) / 1_000_000

            if not matched:
                raise RuntimeError("Benchmark correct-sample verification unexpectedly failed.")
            ver_correct_wall_ms.append(wall_elapsed)
            ver_correct_cpu_ms.append(cpu_elapsed)

            # Incorrect password verification timing
            cpu_start = time.process_time_ns()
            wall_start = time.perf_counter_ns()
            matched_wrong = verify_password(BENCHMARK_WRONG_SAMPLE, algorithm, material.encoded)
            wall_elapsed = (time.perf_counter_ns() - wall_start) / 1_000_000
            cpu_elapsed = (time.process_time_ns() - cpu_start) / 1_000_000

            if matched_wrong:
                raise RuntimeError("Benchmark incorrect-sample verification unexpectedly matched.")
            ver_wrong_wall_ms.append(wall_elapsed)
            ver_wrong_cpu_ms.append(cpu_elapsed)

        algo_result = {
            "algorithm": algorithm,
            "parameters": parameters,
            "repetitions": repetitions,
            "hashGenerationMs": calculate_stats(gen_wall_ms),
            "hashGenerationCpuMs": calculate_stats(gen_cpu_ms),
            "verificationMs": calculate_stats(ver_correct_wall_ms),
            "verificationCpuMs": calculate_stats(ver_correct_cpu_ms),
            "verificationWrongMs": calculate_stats(ver_wrong_wall_ms),
            "verificationWrongCpuMs": calculate_stats(ver_wrong_cpu_ms),
        }
        results.append(algo_result)
        raw_data_collector[algorithm] = {
            "gen_wall_ms": gen_wall_ms,
            "ver_correct_wall_ms": ver_correct_wall_ms,
            "ver_wrong_wall_ms": ver_wrong_wall_ms,
        }

    rss_after = process.memory_info().rss
    raw_json = json.dumps(raw_data_collector, sort_keys=True).encode("utf-8")
    raw_sha256 = hashlib.sha256(raw_json).hexdigest()

    return {
        "kind": "local-measurement",
        "schemaVersion": "2.0.0",
        "protocolId": "psa-crypto-bench-v2",
        "rawChecksumSha256": raw_sha256,
        "method": (
            "One unreported warm-up pass per algorithm, followed by bounded repetitions "
            "measuring wall-clock latency (perf_counter_ns) and CPU time (process_time_ns) "
            "for generation, correct verification, and incorrect verification."
        ),
        "limitations": [
            "Single host run; measurements vary with thermal throttling and load.",
            "Defender-side CPU/memory metrics cannot be extrapolated to GPU speeds.",
            "Only fixed synthetic fixtures are used; no user credentials evaluated.",
        ],
        "environment": {
            "os": f"{platform.system()} {platform.release()}",
            "cpu": platform.processor() or "unreported by operating system",
            "logicalCpus": os.cpu_count(),
            "totalMemoryBytes": psutil.virtual_memory().total,
            "availableMemoryBytes": psutil.virtual_memory().available,
            "processRssBeforeBytes": rss_before,
            "processRssAfterBytes": rss_after,
            "python": platform.python_version(),
            "libraries": {
                "fastapi": package_version("fastapi"),
                "argon2-cffi": package_version("argon2-cffi"),
                "bcrypt": package_version("bcrypt"),
                "hashlibOpenSSL": ssl.OPENSSL_VERSION,
            },
        },
        "results": results,
    }
