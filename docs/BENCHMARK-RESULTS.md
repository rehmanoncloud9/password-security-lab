# Benchmark Results

**Status:** Two actual local runs recorded. Results below show the latest loopback run and are specific to this environment and run.

Latest raw observations and full metadata: [`artifacts/benchmarks/2026-11-15-acceptance-loopback.json`](../artifacts/benchmarks/2026-11-15-acceptance-loopback.json). Earlier capture: [`artifacts/benchmarks/2026-11-15-windows-local.json`](../artifacts/benchmarks/2026-11-15-windows-local.json). Measurement procedure: [Benchmark methodology](BENCHMARK-METHODOLOGY.md).

| Algorithm | Parameters | Hash median ms (IQR) | Verify median ms (IQR) |
|---|---|---:|---:|
| SHA-256 baseline | none; unsalted | 0.006 (0.001) | 0.035 (0.003) |
| PBKDF2-HMAC-SHA256 | 600,000 iterations | 581.678 (23.234) | 579.438 (69.343) |
| bcrypt | cost 10 | 179.944 (9.042) | 182.528 (10.103) |
| Argon2id | 19,456 KiB, time 2, parallelism 1 | 105.554 (1.536) | 107.846 (7.264) |

**Environment:** Windows 10; Intel64 Family 6 Model 186 Stepping 3 (12 logical CPUs reported); 8,259,321,856 bytes total memory; 773,283,840 bytes available at measurement; Python 3.10.11; FastAPI 0.128.0; argon2-cffi 25.1.0; bcrypt 5.0.0; OpenSSL 1.1.1t.

Each algorithm had one warm-up and five measured generations/verifications. Raw timing arrays are in the JSON artifact. The prior run is preserved separately and produced different values under different system load; both runs remain unedited. These are local microbenchmarks, not cross-algorithm security rankings or attacker speed estimates.
