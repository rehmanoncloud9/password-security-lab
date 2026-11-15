# External Verification Procedure

This runbook covers checks that the current managed Windows environment could not execute. It does not imply those steps passed. Use a trusted process-capable machine with authorized npm/Python registry access and an installed Chromium browser. Do not bypass TLS verification.

## JavaScript install, tests and audit

The genuine npm lockfile is already present. It resolves Vite 7.3.8 and Vitest/`@vitest/mocker` 4.1.12. Registry metadata was checked against Node 24 and the existing `@vitejs/plugin-react` 5.1.1 peer range. Live npm audit reports zero vulnerabilities.

On a machine where the inherited shell settings do not block registry/process access:

```powershell
npm ci
npm ls --depth=0
npm run lint
npm run typecheck
npm test
npm run build
node examples/sdk-consumer/dist/index.js
npm audit
```

If the environment inherits `NPM_CONFIG_OFFLINE=true` or proxy settings, inspect their source first. Use only a process-scoped, authorized registry configuration. The present shell required clearing process `HTTP_PROXY`/`HTTPS_PROXY`/`ALL_PROXY` variables and using a temporary npm cache; normal lifecycle startup still failed with `spawn EPERM`. Do not hand-edit the lockfile or use forced audit fixes.

## Python clean install and dependency audit

The current environment sets `PIP_NO_INDEX=1`. Removing that variable exposed a PyPI TLS issuer-verification error, and the Windows HTTP request to PyPI closed unexpectedly. Do not use `--trusted-host` or disable certificate verification. On a machine with trusted PyPI access and a valid certificate chain:

```powershell
cd apps/lab-api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-test.lock
ruff format --check app tests
ruff check app tests
python -m pytest -q tests
pip-audit --requirement requirements-test.lock
```

The Python requirement pins currently have no artifact hashes; record that limitation or prepare a separately reviewed hash lock before release.

## Browser, privacy and responsive acceptance

Start the API from `apps/lab-api` with `python -m app.main`. Start the web app from the repository root with `npm run dev`. Open Chromium and exercise analysis, policy, reuse, generation, all four hashes, attacks/cancellation, benchmarks, reports, navigation/search and theme persistence. Inspect browser requests, storage, console and exports using synthetic samples.

Capture actual application screenshots at 1648×928, 1440×900, 1024×768 and 390×844. Inspect every major screen, compare desktop with the approved reference, and test keyboard/focus/screen-reader behavior. Do not create placeholder screenshots or claim privacy/visual acceptance from server-render tests.

## Security scanners and GitHub Actions

Run the actual authorized workflows in `.github/workflows/ci.yml`, `security.yml` and `release.yml`. Inspect npm audit, pip-audit, Gitleaks and CodeQL logs. A workflow file or YAML parse is not evidence of a passed run. Do not publish or deploy as part of verification.

## Clean source archive

After all evidence documents are final, run `python scripts/package-source.py`. Inspect the archive member list for `.git`, environments, `node_modules`, caches, generated output, secrets, audit diagnostics and self-inclusion; record its actual SHA-256. Preserve the original checkpoint separately.
