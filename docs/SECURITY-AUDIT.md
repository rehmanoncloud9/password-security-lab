# Security Audit

**Scope/date:** source and available tests reviewed on 2026-11-15. **Result: partial;
not a clean audit.** Python behavior tests and selected source checks ran. The React
client could not be built, dependency scanners and CodeQL were not run locally, and
the configured GitHub workflows have not executed.

## Controls observed

- Python API launcher binds to loopback and disables access logs. Host and mutation
  Origin are constrained, CORS permits one local UI origin, and request bodies are
  capped. Pydantic models are strict and validation errors do not return field input.
- Hashing uses Python `hashlib`, `bcrypt`, and `argon2-cffi`; adaptive algorithms use
  random salts and bounded cost parameters. bcrypt inputs above 72 UTF-8 bytes fail
  rather than truncate.
- Attack schemas accept only fixed synthetic target IDs and finite strategy choices.
  Server limits enforce one active attack, maximum attempts/time/candidate plans,
  opaque IDs, and bounded in-memory state.
- The TypeScript boundary lint rejects network/storage APIs in the core and constrains
  the web API to fixed loopback. Source scan passes for seven core and fourteen web
  files. The only intended browser persistence is the theme preference key.
- Result history/export uses a safe-result shape and no plaintext field by design;
  runtime browser inspection has not been performed.

## Findings

| ID | Severity | Finding/impact | Remediation and current state | Verification |
|---|---|---|---|---|
| SA-01 | Medium | Frontend and SDK have not been built or run; TypeScript/API integration, browser storage/network behavior, and rendered error handling are unverified. | Run install, typecheck, unit tests, production build and browser journeys after registry access is available. | Source boundary lint passes; npm install failed with `ENOTCACHED`, proxy refused connection. |
| SA-02 | Medium | npm lockfile is absent; Python requirements lack artifact hashes; dependency advisory scanners have not run. | Generate/review npm lock and hashed Python lock in an approved registry-enabled environment; resolve scanner findings. Workflows are configured but unexecuted. | No local npm audit/pip-audit/GitHub scan result. |
| SA-03 | Medium | A native KDF operation cannot be forcibly interrupted by cooperative attack cancellation/time checks. One candidate check may complete after a cancellation/deadline. | State this limitation; keep KDF costs and one job bounded. If strict kill time is required, use a terminable worker process and test lifecycle on target OS. | Existing Python cancellation/time cases pass; hard wall-clock kill is not claimed. |
| SA-04 | Medium | Browser-local analysis and no-password persistence have only source-level evidence; runtime network/storage/console inspection is pending. | Run a browser network canary, inspect console, local/session storage and exports across all routes. | `npm run lint` source boundary passes; no browser run. |
| SA-05 | Low | The internal blocklist and educational candidate wordlist are intentionally small; a pass/recovery result is limited to those bundled patterns. | Keep limits in UI/docs; never call it a comprehensive breach corpus. | Source uses local curated data; exposure lookup is deferred. |
| SA-06 | Low | No external penetration test or full threat-led review was conducted. | Treat the product as local educational software, not production authentication infrastructure. | No penetration test run. |

## Commands and outcomes

- `python -m pytest -q` in `apps/lab-api/`: **49 passed in 38.22 seconds** on 2026-11-15.
- `ruff check apps/lab-api/app apps/lab-api/tests`: **passed**.
- `ruff format --check apps/lab-api/app apps/lab-api/tests`: **passed**.
- `npm run lint`: **passed**, 7 core and 14 web source files scanned; semantic token contrast checks passed at 4.5:1 in both themes.
- pip-audit/npm audit/Gitleaks/CodeQL and browser security checks: **not run**.

No claim is made that the project has zero known vulnerabilities. See [Security Test
Results](SECURITY-TEST-RESULTS.md), [Privacy Verification](PRIVACY-VERIFICATION.md),
and [Known Limitations](KNOWN-LIMITATIONS.md).
