# Local Laboratory API Reference

**Base URL:** `http://127.0.0.1:8000`  
**Intended use:** local classroom demonstrations with synthetic examples.  
**Interactive schema:** `/docs`, `/redoc`, and `/openapi.json` on the loopback server.

The launcher binds only to `127.0.0.1`; allowed browser origin is exactly
`http://127.0.0.1:5173`. Request bodies are not logged. Bodies are capped at
16,384 bytes, unknown fields are rejected, and validation errors do not echo inputs.

## Health

### `GET /lab/health`

Returns current measured local status: `status`, `scope`, `processId`,
`uptimeSeconds`, sampled host `cpuPercent`, API process RSS in bytes, host memory
capacity, active experiment count, and in-memory verifier count. Resource values
are measurements from this process/host, not Docker/container statistics.

## Hashing and verification

### `POST /lab/hash`

Example synthetic request: `{"password":"made-up sample","algorithm":"argon2id"}`.
Supported algorithms: `sha256`, `pbkdf2_sha256`, `bcrypt`, `argon2id`.

| Parameter | Algorithm | Default | Accepted range |
|---|---|---:|---:|
| `iterations` | PBKDF2-HMAC-SHA256 | 600,000 | 600,000–1,200,000 |
| `work_factor` | bcrypt | 10 | 10–14 |
| `memory_kib` | Argon2id | 19,456 | 19,456–65,536 |
| `time_cost` | Argon2id | 2 | 2–4 |
| `parallelism` | Argon2id | 1 | 1–2 |

Password inputs are limited to 1,024 code points and 4,096 UTF-8 bytes. bcrypt
rejects inputs over its 72-byte limit without truncation. SHA-256 is an intentionally
insecure fast-hash comparison baseline, not a password-storage recommendation.

The response contains an opaque `hashId`, algorithm, encoded verifier, parameters,
display salt, measured `generationMs`, and expiry duration. The verifier is held
in process memory for up to 10 minutes; plaintext is not retained.

### `POST /lab/verify`

Example synthetic request: `{"hash_id":"<opaque-id>","password":"candidate"}`.
Only IDs created by this process are accepted; imported verifier strings are not.
The response contains `matched`, algorithm, and actual `verificationMs`.

### `DELETE /lab/hash/{hash_id}`

Delete a generated in-memory verifier early. Unknown/expired IDs return 404.

## Controlled synthetic attacks

### `POST /lab/attacks`

Returns HTTP 202 and a generated `jobId`. The caller selects a fixed target and
strategy; no password, hash, wordlist, external account, or path is accepted.

| Strategy | Fixed target ID | Candidate plan |
|---|---|---|
| `dictionary` | `dictionary-first`, `dictionary-last` | Seven authored words in deterministic order |
| `bruteforce` | `bruteforce-two` | `binary` or `digits-small` alphabet, lengths 1–3 |
| `pattern` | `pattern-date` | Five fixed word/date pattern candidates |
| `suffix` | `suffix-year` | Five fixed common-suffix candidates |
| `substitution` | `substitution-basic` | Four fixed character-substitution candidates |
| `word_combination` | `word-combination-two` | Ordered pairs from the seven-word fixture |

Defaults and server hard limits: at most 10 seconds, 10,000 attempts, one active
job, and at most 1,000 strategy candidates. The currently authored dictionary
contains seven words. Brute-force search-space size is the sum of alphabet sizes
to each selected length; other strategies report candidate-plan size. `searchSpace`
and actual verified attempts are returned separately.

Status responses include `state`, attempts, total elapsed time, accumulated
candidate-verification time, actual candidate throughput, parameters, search
space, stop reason, and whether the synthetic target was recovered. The target
value is never returned. Possible states are `queued`, `running`, `recovered`,
`not_found_within_budget`, `cancelled`, `time_limit`, `attempt_limit`, and `error`.

### `GET /lab/attacks/{job_id}` and `DELETE /lab/attacks/{job_id}`

Read status or request cooperative cancellation. IDs are opaque and malformed or
unknown IDs return 404. State expires shortly after completion. A candidate check
already in progress may finish before cancellation or a time limit takes effect.

## Benchmarks

### `POST /lab/benchmarks` (compatibility alias: `POST /lab/benchmark`)

Accepts an empty JSON object and measures one warm-up plus five actual hash
generations and successful verifications per algorithm. Returns individual
observations, median, inclusive interquartile range, parameters, operating system,
CPU, memory, Python/library versions, method, and limitations. Only one benchmark
runs at a time. Measurements are local and are not universal attack rates.

## Error behavior

| Status | Meaning |
|---|---|
| 400 | Host validation failure |
| 403 | Disallowed mutation origin |
| 404 | Unknown/expired verifier or experiment ID |
| 409 | Another attack job is active |
| 413 | Request body or input exceeds a limit |
| 422 | Invalid request or unsafe algorithm parameters |
| 429 | Bounded expensive-operation capacity is busy |
| 503 | Bounded in-memory state capacity is full |

No error handler logs request bodies. The API is a local educational process, not
a multi-user or production credential service.
