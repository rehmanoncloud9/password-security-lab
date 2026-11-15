# Benchmark Methodology

## Hash generation and verification

`POST /lab/benchmark` holds one in-process lock and uses a fixed project-authored synthetic string. For each allowlisted algorithm, it performs one unreported warm-up generation and correct-password verification, followed by five sequential timed generations and five timed correct-password verifications. It uses `time.perf_counter_ns`; the generation time comes from `hash_password`; verification is timed around the library call. It records all five observations, median, and inclusive quartile spread (Q3−Q1). Algorithm settings are reported with each row.

The measurement records Windows version, CPU string, logical CPU count, total and currently available memory, Python runtime, cryptographic/library implementation versions, and OpenSSL version. Each local run is one sample on one machine; no fixed benchmark values are embedded in application code.

## Attack experiments

Attempt counts increment only after a real candidate verification. Elapsed time is measured around internal target creation and candidate work. The result records the actual search-space size for brute force and the exact terminal reason. A stop at the timer/attempt ceiling is inconclusive. No extrapolated attack totals are presented.

## Limits

Short, sequential measurements on a shared Windows machine vary with load and thermal state. The first capture includes PBKDF2 outliers, retained in its raw data; the latest acceptance run is separately preserved at `artifacts/benchmarks/2026-11-15-acceptance-loopback.json`. The SHA-256 value measures an intentionally fast baseline, not an acceptable password-storage configuration. These measurements do not predict attacker hardware or universal cracking rates.
