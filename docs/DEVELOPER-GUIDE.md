# Developer Guide

## Structure

See [Architecture](ARCHITECTURE.md) and [Module Responsibilities](MODULE-RESPONSIBILITIES.md). Keep local analysis/policy in `packages/core`, cryptography and bounded attacks in `apps/lab-api`, and React presentation in `apps/web`.

## Runtimes

- Node.js 24.x and npm 11.x (enforced in the root manifest).
- Python 3.10–3.12 for the API and tests.

## JavaScript workspaces

From the repository root on a host that permits npm lifecycle subprocesses:

```powershell
npm ci
npm run typecheck
npm test
npm run lint
npm run build
node examples/sdk-consumer/dist/index.js
```

`npm run typecheck` uses TypeScript project references, so it builds the core declarations before checking the web and SDK from a clean output tree. `npm run dev` builds and watches the core before starting Vite; Ctrl+C stops both. The root `package-lock.json` is generated from the npm registry and currently resolves Vite 7.3.8 and Vitest/`@vitest/mocker` 4.1.12.

In this managed Windows sandbox, normal `npm ci` fails at lifecycle process launch (`spawn EPERM`). Two registry-backed `npm ci --ignore-scripts` runs passed and left the lock unchanged, but are not a substitute for lifecycle verification. The same host restriction stops Vitest workers and Vite/esbuild. Live `npm audit` did run after clearing inherited proxy variables and reported zero vulnerabilities. See [External Verification Procedure](REGISTRY-ENABLED-SETUP.md) for outstanding checks.

## Python lab

From `apps/lab-api/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-test.lock
ruff format --check app tests
ruff check app tests
python -m pytest -q tests
python -m app.main
```

The API binds to `127.0.0.1:8000`. Python tests passed in the existing Python 3.10.11 environment (49 tests), but the clean venv install could not be verified here: `PIP_NO_INDEX=1` was inherited; after removing it, PyPI certificate validation failed. Do not disable TLS validation. The pinned Python requirements currently lack artifact hashes.

## Clean source archive

Run `python scripts/package-source.py` from any checkout directory to create `artifacts/releases/password-security-laboratory-source.zip`. It excludes Git metadata, environments, installed packages, caches, build/test output, local environment/diagnostic files, TypeScript build information and the preserved pre-implementation checkpoint. It validates the member list and prints size and SHA-256. Regenerate after documentation changes.

## Security review for changes

Review request/response errors, input logs/storage, CORS/Host rules, KDF caps, cancellation races, exports and tests. Never log a password to diagnose a failure.
