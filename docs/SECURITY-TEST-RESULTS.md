# Security Test Results

**Assessment state: PARTIAL; not a clean security audit.**

| Control/test | Result | Evidence |
|---|---|---|
| Python static rules | PASSED | `ruff check apps/lab-api/app apps/lab-api/tests` |
| Python behavior/security regression suite | PASSED | 49 tests in 38.22 seconds on 2026-11-15; exact run recorded in `TEST-RESULTS.md` |
| Analyzer boundary and semantic contrast lint | PASSED | `npm run lint`; 7 core and 14 web source files inspected and selected light/dark token contrast pairs measured against 4.5:1 |
| API privacy headers/body/schema behavior | PASSED for tested cases | API tests cover no request body logging, strict body/schema/origin/host handling and no secret echo |
| Fresh loopback synthetic hash and verify | PASSED | Four algorithms; correct values accepted, different values rejected, and all stored verifier records deleted |
| Attack restrictions and server caps | PASSED for tested cases | Fixed target enum, one active job, attempt/time limits, cleanup and cancellation tests |
| Fresh loopback bounded strategies and cancellation | PASSED | Six internal target strategies recovered; an Argon2id dictionary experiment cancelled with zero candidates attempted |
| npm dependency audit | NOT RUN locally | npm dependency installation blocked; CI workflow added but not executed |
| Python dependency advisory scan | NOT RUN locally | `pip-audit` unavailable; workflow pins pip-audit and scans the lock |
| Secret scan | NOT RUN locally | Pinned Gitleaks container workflow added; not executed on GitHub |
| CodeQL | NOT RUN locally | Workflow added; GitHub code scanning permissions/repository support required |
| Browser network/storage/password exposure | NOT RUN | npm dependencies are missing and the browser inventory returned no browser surfaces |
| E2E and accessibility testing | NOT RUN | No browser test suite/runtime available |

This report does not claim that dependency or static scanners found no issues.
Review any workflow alerts and dependency findings before using a release candidate.
