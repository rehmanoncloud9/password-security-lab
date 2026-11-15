# Security Audit

**Scope/date:** Source, dependencies and available execution evidence reviewed on 2026-11-15.
**Result:** PARTIAL; not release-ready. The live npm audit is clean, but Python dependency scanning, browser inspection, Gitleaks and CodeQL were not run.

## Controls observed

- The analyzer result omits the original password; compiled-core runtime assertions confirmed this for tested samples. Boundary lint constrains core source from network/storage/logging.
- The API binds to loopback, constrains Host/Origin, validates strict schemas and request sizes, disables access logging, and sanitizes validation errors.
- Password hashing uses established Python libraries, salts and stored parameters; bcrypt input above 72 UTF-8 bytes is rejected.
- Attack requests accept only finite internal synthetic target identifiers, bounded strategies, one active job and server-side work limits.
- The UI uses a fixed loopback API origin. Only the selected light/dark theme is intended to persist.

## Findings and status

| ID | Severity | Finding/impact | Remediation/status | Verification |
|---|---|---|---|---|
| SA-01 | Resolved | Vite 7.2.2 was affected by high-severity Vite advisories. | Upgraded to 7.3.8; current live npm audit reports zero findings. | Registry-backed `npm audit` exit 0; `npm ls` valid |
| SA-02 | Resolved | Vitest 4.0.8 and `@vitest/mocker` 4.0.8 were in affected ranges including critical/moderate advisories. | Aligned both workspaces to Vitest/`@vitest/mocker` 4.1.12; no override used. | Registry-backed `npm audit` reports zero findings |
| SA-03 | Medium | Browser request/storage/log/export behavior has no runtime inspection. | Run browser network canary, storage/log/URL/export inspection and screen journeys. OPEN. | Boundary lint and direct secret-free checks pass; browser unavailable |
| SA-04 | Medium | Normal npm lifecycle and Vite/Vitest process execution are blocked in this host. | Repeat plain npm ci, Vitest, Vite build/dev on a subprocess-capable host. OPEN. | `spawn EPERM` in npm lifecycle, Vitest workers/Vite/esbuild |
| SA-05 | Medium | Python package pins lack artifact hashes and pip-audit did not run. | Clean Python install and audit with trusted PyPI TLS; consider a reviewed hash lock. OPEN. | Existing-environment API tests pass; fresh venv install fails TLS/index setup |
| SA-06 | Medium | No Gitleaks or CodeQL scan result is available. | Run actual scanners/workflows with authorized access. OPEN. | Tools/workflows unavailable in this session |
| SA-07 | Medium | A native KDF already in progress cannot be forcibly stopped immediately by cooperative cancellation/time checks. | Preserve bounded costs and one active attack; hard deadline requires terminable worker process. Residual. | Python cancellation/time tests pass; process termination is not claimed |
| SA-08 | Low | Educational dictionary and candidate plans are deliberately small. | Keep bounded synthetic scope explicit; do not present it as a breach corpus or unrestricted cracker. | API schemas/tests use fixed internal target IDs |

## Commands and outcomes

- `npm ls vite vitest @vitest/mocker`: **passed**; Vite 7.3.8 and Vitest/`@vitest/mocker` 4.1.12.
- Registry-backed `npm audit`: **passed**, `found 0 vulnerabilities`.
- `npm ci --ignore-scripts`: **passed twice**, 104 packages each, identical lock hash. Plain `npm ci`: **failed** at lifecycle spawn with `EPERM`.
- `python -m pytest -q tests` from `apps/lab-api`: **49 passed in 38.14 seconds**.
- `npm run lint`: **passed**; 7 core and 14 web files checked, selected light/dark semantic contrast tokens passed.
- Compiled-core behavior checks: **passed** for pattern combinations, input boundaries, Unicode, privacy, policy, reuse and generator behavior. Core Vitest itself was blocked before assertions.
- `npm test --workspace @psa/web`: **9 React server-render checks passed**, not browser E2E.
- Root clean-output `npm run typecheck`: **passed** for core, web and SDK.
- `npm run build` / `npm run dev`: **blocked** by Vite/esbuild `spawn EPERM`.
- Clean Python venv: **blocked**; `PIP_NO_INDEX=1` was inherited; after removing it, PyPI TLS issuer validation failed. No TLS bypass was attempted.
- pip-audit, Gitleaks, CodeQL, browser privacy checks and GitHub Actions: **not run**.

An earlier ignored `audit-report.json` records the pre-remediation vulnerable versions; it is stale and excluded from the source archive. The current registry audit is the authoritative npm result for the updated lock. See [Security Test Results](SECURITY-TEST-RESULTS.md), [Privacy Verification](PRIVACY-VERIFICATION.md), and [Known Limitations](KNOWN-LIMITATIONS.md).

This document does not claim a complete or clean security audit.
