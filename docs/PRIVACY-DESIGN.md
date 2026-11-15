# Privacy Design

## Data inventory

| Value | Where processed | Transmission | Retention |
|---|---|---|---|
| Analyzer candidate | Browser memory/core call | None; analyzer uses no request | Cleared from UI state on clear/navigation; JS memory release best-effort |
| Policy candidate | Browser memory/core call | None | Same as analyzer input |
| Reuse samples | Browser memory/core call | None | React state only; clear action |
| Generated password/passphrase | Browser Web Crypto and core analyzer | None | Shown in current feature state; copied only by explicit user action; not persisted |
| Theme preference | Browser display settings | None | Local storage key `psl-theme` only |
| Storage-lab sample | Local browser control, then loopback request on explicit submit | Local machine API only | Python stack for operation; not stored; generated verifier is memory-only for 10 minutes |
| Verify candidate | Request body to local loopback API on explicit submit | Local machine API only; not URL | Operation lifetime only |
| Attack target/candidate | Python process internal fixture/worker | None | Worker memory; opaque job counters kept up to 60 seconds after terminal |
| Benchmark sample | Fixed synthetic API constant | None | Operation lifetime only |
| Exposure input/prefix | Not implemented | None | Not applicable |

No account, analytics, cookies, sessionStorage, telemetry, persistence database,
or report field for plaintext exists in the current implementation. Local storage is
used only for the display preference key `psl-theme`. The browser polls a health
route; requests carry no candidate data.

## User notice

Use made-up examples only. Browser Analyze, Policy and Reuse remain local to the tab. Separate Storage Lab values are sent to the local loopback API only when submitted. Attack targets are internally generated. No service sends user values to an external endpoint. The product cannot protect a compromised device or guarantee secret memory erasure.

## Verification still required

The TypeScript application has not installed/built in this environment, so browser developer-tools network inspection and automated secret-canary interception remain pending. Source inspection shows no network call tied to analyzer input, but that is not a substitute for runtime verification. Optional exposure status remains `not checked`.
