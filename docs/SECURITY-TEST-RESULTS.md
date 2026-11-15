# Security Test Results

**Assessment:** Partial; not a complete security acceptance.
**npm dependency audit:** PASS after patched Vite/Vitest upgrade.
**Overall release security gate:** OPEN because other scanners and browser inspection were not run.

| Control/check | Result | Evidence |
|---|---|---|
| npm dependency audit | PASSED | Live registry `npm audit` after lock regeneration: `found 0 vulnerabilities`; exit code 0 |
| Resolved JavaScript versions | PASSED | Vite 7.3.8; Vitest and `@vitest/mocker` 4.1.12; `npm ls` valid and deduplicated |
| Analyzer result privacy | PASSED for direct checks | Serialized compiled-core results did not include the supplied plaintext; browser network canary not run |
| Privacy/architecture boundary lint | PASSED | `npm run lint` scanned 7 core and 14 web files |
| Light/dark semantic contrast tokens | PASSED for selected tokens | Lint checked 4.5:1 text/action tokens in both themes; not a complete rendered contrast audit |
| Python crypto/input/attack regressions | PASSED | 49 Python tests in 38.14s; includes validation, bounded synthetic attacks, cancellation and hash verification cases |
| Live hashing and verification | PASSED | Correct and incorrect password checks on SHA-256, PBKDF2-HMAC-SHA256, bcrypt and Argon2id; verifier records deleted |
| API health | PASSED | Loopback `/lab/health` returned current status and measured health values |
| Secure random generator | PASSED for compiled core checks | Browser Web Crypto path executed with category and ambiguous-character assertions; no `Math.random` path |
| npm lock reproducibility | PARTIAL | Two real registry `npm ci --ignore-scripts` installs, 104 packages each, stable lock hash; normal lifecycle execution fails with host `spawn EPERM` |
| Python clean install | BLOCKED | `PIP_NO_INDEX=1` was inherited; after removing it, PyPI TLS validation failed (`CERTIFICATE_VERIFY_FAILED`); no TLS bypass used |
| Python dependency audit | NOT RUN | `pip-audit` unavailable and PyPI tool installation blocked by the same index/TLS restriction |
| Secret scan | NOT RUN | Gitleaks unavailable; source archive generation/inspection is separate and not a substitute |
| CodeQL | NOT RUN | No local executable or actual GitHub Actions run |
| Browser network/storage/log privacy | NOT RUN | No browser surface; Vite did not start because esbuild process spawn is denied |
| CORS/host/browser integration | Partial | Python tests and live loopback API checks passed; browser-to-API security inspection not run |

## Dependency remediation

The initially affected Vite 7.2.2, Vitest 4.0.8 and `@vitest/mocker` 4.0.8 were upgraded to Vite 7.3.8 and Vitest/`@vitest/mocker` 4.1.12 in the lockfile. Registry metadata confirmed compatibility with Node 24 and the installed React Vite plugin peer ranges. The current registry audit reports zero findings. See [ADR-012](adr/ADR-012-patched-vite-vitest.md).

## Residual security work

Run the Python dependency audit, Gitleaks and CodeQL in an authorized runner. Run the app in a browser and inspect requests, storage, logs and exports with synthetic inputs. The private zxcvbn matcher adapter is isolated and tested by direct behavior checks; because it uses a runtime-private library property, regression testing is required when upgrading zxcvbn-ts.

No full security audit or clean security status is claimed.
