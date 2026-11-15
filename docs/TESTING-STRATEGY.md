# Testing Strategy

## Test layers

- **Core unit suite:** Vitest covers patterns, privacy, Unicode/limits, policy, reuse and secure generation. It is meaningful, but this managed Windows host denies worker/path-probe processes with `spawn EPERM`; the suite did not execute assertions here.
- **Core direct behavior:** Node assertions against compiled core verified keyboard/dictionary overlap, sequence/repeat/substitution, policy, reuse output privacy, secure generation, Unicode and max-length behavior. This complements but does not replace Vitest.
- **Web component checks:** Node compiles and server-renders actual React components without an added DOM dependency. Nine checks pass for navigation/theme markup, analysis, policy, generator/reuse, unavailable hashing, bounded attack controls and report/benchmark states. Browser event handlers are not exercised.
- **Python tests:** 49 API/unit tests passed for hashing algorithms, salts, verification, validation, all six synthetic strategies, cancellation/limits, job lifecycle and measured benchmark behavior.
- **Browser E2E/privacy/accessibility:** No browser tests ran. Runtime network/storage privacy, responsive screenshots, keyboard, screen-reader and download behavior remain open.
- **Dependency security:** Live npm audit passed with zero vulnerabilities. Python pip-audit, Gitleaks, CodeQL and actual GitHub Actions remain unrun.

All test fixtures use synthetic values. No production credentials or real account data are used.

## Commands

From repository root on a process-capable host:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
node examples/sdk-consumer/dist/index.js
npm audit
```

Web SSR tests can be run independently:

```powershell
npm test --workspace @psa/web
```

Python from `apps/lab-api/`:

```powershell
python -m pip install --requirement requirements-test.lock
ruff format --check app tests
ruff check app tests
python -m pytest -q tests
pip-audit --requirement requirements-test.lock
```

## Current environment limits

Two real registry-backed `npm ci --ignore-scripts` runs passed with 104 packages and the same lock SHA; normal `npm ci` failed when lifecycle scripts spawned a child process (`EPERM`). Vitest and Vite/esbuild also fail to start child processes. Typechecks, web server-render tests, lint, npm audit and Python tests did execute. Python clean install was blocked by inherited `PIP_NO_INDEX=1` and PyPI TLS issuer verification after removing that setting. Actual outcomes are in [Test Results](TEST-RESULTS.md).

## Remaining acceptance cases

Run the complete Vitest/Vite/build suite, plain `npm ci`, and clean Python install/audit in a suitable environment. Then run the actual browser journeys; inspect network, storage, logs and exports; capture the four required viewports; verify keyboard and screen-reader behavior; and execute actual CI/security workflows. A workflow file, source presence or typecheck is not a substitute for these checks.
