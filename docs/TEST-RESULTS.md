# Test Results — Acceptance Remediation

**Date:** 2026-11-15
**Status:** PARTIAL — several core checks are blocked before execution by the managed Windows process policy.

## Environment

- Node.js 24.14.1; npm 11.12.1.
- Python 3.10.11.
- npm lock SHA-256: `8E4198A7DACE9E3366A9252D058EE06BFB89E4E77074C159A74A36B14789F91A`.
- Resolved web toolchain: Vite 7.3.8, Vitest 4.1.12, `@vitest/mocker` 4.1.12, `@vitejs/plugin-react` 5.1.1.

## Executed checks

| Check | Result | Evidence |
|---|---|---|
| npm install / lock regeneration | PASSED with scripts disabled | Registry install generated the real lock; `npm ls` showed a valid tree |
| Reproducible npm install | PASSED with limitation | Two `npm ci --ignore-scripts` runs each installed 104 packages; lock SHA stayed identical |
| Normal `npm ci` | BLOCKED by host | Failed when npm launched a lifecycle child process: `spawn EPERM`; cleanup also returned `EPERM` |
| Dependency tree | PASSED | `npm ls --depth=0` and `npm ls vite vitest @vitest/mocker` showed valid, patched, deduplicated versions |
| npm audit | PASSED | Registry-backed `npm audit` reported `found 0 vulnerabilities` (exit 0) |
| Clean-output TypeScript typecheck | PASSED | Removed core/web/SDK generated outputs and build-info files; `npm run typecheck` passed all three workspaces |
| Core behavior | PASSED as direct runtime assertions | Compiled-core checks covered qwerty/asdfgh spatial findings, sequence, repeat, l33t, mixed dictionary/spatial findings, policy, reuse privacy, secure generation, Unicode and 256/257 code-point boundary |
| Core Vitest | BLOCKED before assertions | Fork pool failed to spawn; thread pool failed in Vite Windows path probing. Vitest reported zero tests executed |
| Web tests | PASSED, server-render scope only | `npm test --workspace @psa/web`: 9 React render checks passed for navigation states, themes, analysis, policy, generator/reuse, hashing unavailable state, attack caps, reports/benchmarks and theme preference storage |
| Root `npm test` | FAILED overall due environment | Core Vitest failed before assertions; npm continued and the 9 web render checks passed |
| Lint | PASSED | `npm run lint`: privacy/architecture boundary checks and selected 4.5:1 semantic text/action token contrast checks passed |
| Production build | BLOCKED | `npm run build` compiled core and SDK TypeScript, then Vite 7.3.8 failed loading config because esbuild child process returned `spawn EPERM` |
| Development startup | BLOCKED | `npm run dev` built/watched core with zero TypeScript errors, then Vite config loading failed with esbuild `spawn EPERM`; frontend did not start |
| SDK consumer | PASSED | `node examples/sdk-consumer/dist/index.js` printed real analysis, policy and reuse results |
| Python API tests | PASSED in existing Python environment | From `apps/lab-api`: `python -m pytest -q tests` — 49 passed in 38.14s |
| Python API tests from repository root | FAILED invocation only | Running with root cwd failed collection (`ModuleNotFoundError: app`); documented package-root command above passed |
| Clean Python installation | BLOCKED | `PIP_NO_INDEX=1` initially disabled index access. After removing it, direct PyPI install failed TLS issuer verification; Windows HTTP request also closed unexpectedly. No clean venv install was claimed |
| Live loopback API | PASSED in earlier run this pass | `/lab/health` returned `status=ok`; health fields reflected actual host/API state |
| Live crypto API | PASSED in earlier run this pass | SHA-256, PBKDF2-HMAC-SHA256, bcrypt and Argon2id: actual hash, correct verify, incorrect verify, and verifier deletion |
| Python security audit | NOT RUN | `pip-audit` unavailable; its isolated installation was blocked by PyPI TLS/index restrictions |
| Gitleaks / CodeQL | NOT RUN | Executables and authenticated workflow execution unavailable |
| GitHub Actions | NOT RUN | Workflow YAML/configuration is not presented as a workflow pass |
| Browser, E2E, screenshots and accessibility | NOT RUN | No browser surface was available; Vite could not start; no screenshot files were fabricated |

## Commands to repeat on a process-capable environment

From the repository root:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
node examples/sdk-consumer/dist/index.js
npm audit
```

From `apps/lab-api/` with a trusted Python package index and a fresh venv:

```powershell
python -m pip install -r requirements-test.lock
ruff format --check app tests
ruff check app tests
python -m pytest -q tests
pip-audit --requirement requirements-test.lock
```

Run and inspect the real application in Chromium before release; see [UI Verification](UI-VERIFICATION.md).
