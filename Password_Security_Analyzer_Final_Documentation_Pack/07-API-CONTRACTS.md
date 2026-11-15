# API and Module Contracts

These are design contracts, not claims that endpoints or packages already exist. Implement only after the team approves exact names and validation limits.

## 1. Core TypeScript API

```ts
analyzePassword(password, options?) -> AnalysisResult
evaluatePolicy(password, policyId) -> PolicyResult
analyzeReuse(samplePasswords) -> ReuseResult
```

Rules:
- Pure functions; no network, storage, logging or framework imports.
- The result must not contain the original password.
- No telemetry callback may receive raw input.
- Estimator/library and version are exposed for reproducibility.
- Findings are structured; UI owns localization and presentation.

## 2. Local Lab API

Base URL: loopback only, for example `http://127.0.0.1:<port>`. Exact port and origin must be fixed in implementation configuration.

| Method | Path | Purpose |
|---|---|---|
| GET | `/lab/health` | Health status; no secrets |
| POST | `/lab/hash` | Hash a synthetic demo value using an allowlisted algorithm |
| POST | `/lab/verify` | Verify a synthetic candidate against a session-generated demo hash |
| POST | `/lab/attacks` | Start a bounded experiment against an internally generated synthetic target |
| GET | `/lab/attacks/{job_id}` | Retrieve progress and terminal state |
| DELETE | `/lab/attacks/{job_id}` | Cancel active experiment |

### Request rules
- No password in URL, query string or path.
- No arbitrary imported hashes.
- No external target, account, domain or file path.
- Algorithm selected from a fixed allowlist.
- Parameter values constrained server-side.
- Request bodies never logged.
- Payload and input sizes capped.
- Job IDs are random, short-lived and in-memory.

### Attack result states
`queued`, `running`, `recovered`, `not_found_within_budget`, `cancelled`, `time_limit`, `attempt_limit`, `error`.

Never collapse all non-recovered outcomes into “failed” or “uncrackable”.

## 3. Example response shape

```json
{
  "jobId": "opaque-session-id",
  "state": "time_limit",
  "attempts": 4200,
  "elapsedMs": 10000,
  "algorithm": "argon2id",
  "parameters": {
    "memoryKiB": 19456,
    "iterations": 2,
    "parallelism": 1
  },
  "stopReason": "time_limit",
  "targetRecovered": false
}
```

This example is illustrative. Never include target plaintext, candidate plaintext or raw request values.

## 4. HIBP adapter contract (optional)
- Input is held locally.
- Adapter computes SHA-1 locally for protocol compatibility.
- Sends exactly the first five hex characters to the official range endpoint.
- Matches suffix locally.
- Returns `found`, `not_found_in_dataset`, `unavailable`, `not_checked`.
- Timeout, response size and endpoint are constrained.
- No full hash or password is transmitted.

## 5. Compatibility and change control
Any public contract change requires:
- updated type definitions,
- migration note,
- tests for old/new behavior,
- changelog entry,
- review of privacy and security implications.
