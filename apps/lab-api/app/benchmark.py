"""Repeatable local hash/verify measurements over a fixed synthetic input."""

from __future__ import annotations

import os
import platform
import ssl
import statistics
import time
from importlib.metadata import PackageNotFoundError, version
from typing import Any

import psutil

from .crypto import hash_password, verify_password

SAMPLE = "PSA educational benchmark value"
REPETITIONS = 5


def package_version(name: str) -> str | None:
    try:
        return version(name)
    except PackageNotFoundError:
        return None


def quartiles(values: list[float]) -> tuple[float, float]:
    quartiles_value = statistics.quantiles(values, n=4, method="inclusive")
    return quartiles_value[0], quartiles_value[2]


def measure() -> dict[str, Any]:
    """Warm up once, then measure five actual generations and verifications per method."""
    results: list[dict[str, Any]] = []
    for algorithm in ("sha256", "pbkdf2_sha256", "bcrypt", "argon2id"):
        warmup = hash_password(SAMPLE, algorithm)
        if not verify_password(SAMPLE, algorithm, warmup.encoded):
            raise RuntimeError("Benchmark warm-up verification failed")
        generation: list[float] = []
        verification: list[float] = []
        parameters: dict[str, int] = {}
        for _ in range(REPETITIONS):
            material = hash_password(SAMPLE, algorithm)
            generation.append(material.elapsed_ms)
            parameters = material.parameters
            started = time.perf_counter_ns()
            matched = verify_password(SAMPLE, algorithm, material.encoded)
            verification.append((time.perf_counter_ns() - started) / 1_000_000)
            if not matched:
                raise RuntimeError("A locally generated benchmark verifier did not match")
        gen_q1, gen_q3 = quartiles(generation)
        ver_q1, ver_q3 = quartiles(verification)
        results.append(
            {
                "algorithm": algorithm,
                "parameters": parameters,
                "repetitions": REPETITIONS,
                "hashGenerationMs": {
                    "individual": [round(value, 3) for value in generation],
                    "median": round(statistics.median(generation), 3),
                    "iqr": round(gen_q3 - gen_q1, 3),
                },
                "verificationMs": {
                    "individual": [round(value, 3) for value in verification],
                    "median": round(statistics.median(verification), 3),
                    "iqr": round(ver_q3 - ver_q1, 3),
                },
            }
        )
    return {
        "kind": "local-measurement",
        "method": (
            "One unreported warm-up generation and verification, followed by five measured "
            "generations and correct-password verifications per algorithm; perf_counter_ns."
        ),
        "limitations": [
            "Single run on this machine; results vary with load, thermal state, runtime, "
            "and library versions.",
            "The synthetic workload is for comparison only and is not a universal attacker rate.",
            "No extrapolated attack totals are reported.",
        ],
        "environment": {
            "os": f"{platform.system()} {platform.release()}",
            "cpu": platform.processor() or "unreported by operating system",
            "logicalCpus": os.cpu_count(),
            "totalMemoryBytes": psutil.virtual_memory().total,
            "availableMemoryBytes": psutil.virtual_memory().available,
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
