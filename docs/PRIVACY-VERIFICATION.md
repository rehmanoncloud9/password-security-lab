# Privacy Verification

## Data paths and evidence

| Data | Intended handling | Current evidence/status |
|---|---|---|
| Analysis input | Local TypeScript core; omitted from result | Direct core assertion confirmed serialized output omits sample. Boundary lint passes. Browser network canary NOT RUN. |
| Policy/reuse samples | Local in-memory calculation, reset on screen lifecycle | Direct core checks and React SSR render passed. Browser clearing/lifecycle not inspected. |
| Generated value | Browser Web Crypto, shown in page memory on request | Core generator behavior passed; UI initial state rendered. Browser generation/copy/storage inspection NOT RUN. |
| Theme setting | Only `psl-theme` in local storage | Preference helper tested with a storage fixture. Actual browser storage not inspected. |
| Hash value | Explicit submission to loopback API only from hashing controls | Live API tests with synthetic values passed; response/history excluded plaintext. Browser request/log inspection NOT RUN. |
| Attack target | Fixed internal synthetic target ID | Python API suite verifies allowlists and boundaries; no imported hashes or external target API. |
| Benchmark/report output | Measured values and allowlisted result summaries | Python measurement tests passed; browser JSON/CSV exports were not downloaded or inspected. |

## Verification performed

- `npm run lint` passed; it checks that the core has no network/storage/logging path and constrains web API calls to the fixed loopback origin.
- Direct compiled-core checks passed for secret-free result serialization, mixed findings, Unicode, and boundaries.
- The Python API suite passed 49 tests, covering strict schemas, body limits, Host/Origin checks, sanitized validation errors, hashing and attack boundaries.
- A live loopback health request and correct/wrong verification for all four algorithms passed. Each verifier record was deleted after use.
- Nine web tests rendered actual React components with synthetic inputs. These tests do not run browser effects or network panels.

## Not verified

No browser surface was available. Therefore this pass did not inspect network requests while typing an analysis value, browser console/URLs, local/session storage, clipboard behavior, report downloads, external requests, or real theme persistence. No screenshot or browser privacy acceptance is claimed. Repeat the procedure in [UI Verification](UI-VERIFICATION.md) after Vite starts in a browser-enabled environment.
