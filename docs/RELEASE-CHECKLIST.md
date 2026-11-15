# Release Checklist

**Current state: NOT READY.** See [Final Engineering Report](FINAL-ENGINEERING-REPORT.md).

| Gate | Status | Evidence/remaining work |
|---|---|---|
| Repository/checkpoint | PRESERVED | No destructive Git operation, commit or push; checkpoint preserved |
| Genuine npm lock | PASSED | Registry-generated root package-lock; current SHA is recorded in test results |
| npm clean install | PARTIAL | Two `npm ci --ignore-scripts` runs passed; normal lifecycle spawn fails `EPERM` |
| npm dependency audit | PASSED | Live registry audit reports 0 vulnerabilities after Vite/Vitest patch upgrade |
| Workspace typechecks | PASSED | Core, web and SDK pass after generated output removal |
| Core Vitest suite | BLOCKED | No tests discovered/executed because fork/thread process/path probing gets `EPERM` |
| Web tests | PASSED, SSR only | 9 React component render checks; no browser interaction coverage |
| Python API/crypto/attack tests | PASSED in existing environment | 49 tests passed; clean Python install and pip-audit remain blocked |
| Production build/development server | BLOCKED | Vite/esbuild process creation fails with host `spawn EPERM` |
| SDK consumer | PASSED | Real Node consumer execution passed |
| Browser/privacy/screenshots | NOT RUN | No browser; no fabricated screenshots; network/storage/keyboard review required |
| Python dependency scan | NOT RUN | PyPI index/TLS restriction prevented pip-audit installation/run |
| Gitleaks/CodeQL | NOT RUN | No local tools or workflow results |
| GitHub Actions | NOT RUN | Configuration is not evidence of workflow success |
| Source ZIP | PASSED | `scripts/package-source.py` generated and validated 131 files; deterministic output verified |
| Ownership/license review | OPEN | Confirm rights before redistribution |
| Exposure screening | DEFERRED P1 | No fake exposure result is shown |
| Publish/deployment | NOT AUTHORIZED/PERFORMED | None made |

Before release, run plain `npm ci`, all Vitest/build checks, and Python clean installation/audit on a process-capable, registry-enabled machine. Then execute CI/security workflows; inspect all browser journeys, screenshots, responsive layouts, keyboard behavior and privacy; regenerate and inspect the source archive; review licensing/ownership. Do not publish or deploy without explicit authorization.
