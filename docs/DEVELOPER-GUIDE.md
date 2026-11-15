# Developer Guide

## Structure

See [Architecture](ARCHITECTURE.md) and [Module Responsibilities](MODULE-RESPONSIBILITIES.md). Keep analysis and policy pure in `packages/core`; keep cryptography and bounded attacks in `apps/lab-api`; keep React presentation in `apps/web`.

## Python lab

From `apps/lab-api/`, create a virtual environment and install the exact-version
test requirements with `python -m pip install -r requirements-test.lock`. Run
`python -m app.main` from that directory. The API binds only to `127.0.0.1:8000`,
disables access logs in its launcher, and serves local OpenAPI docs at `/docs`.
The lock does not yet include artifact hashes and has not been clean-installed.

## Web and SDK

From repository root, install dependencies with npm, then run `npm run dev`. The root development launcher builds the TypeScript core before Vite starts and watches the core for changes while the UI is running. Stop both processes with Ctrl+C. The example consumer imports only the core and uses synthetic data. No attack, API, hashing or network module is exported by the SDK.

The current environment inherits `NPM_CONFIG_OFFLINE=true`; the cache lacks the
workspace packages and the configured proxy at `127.0.0.1:9` refused a scoped online
attempt. The root CI workflow uses registry installation as an interim check but
cannot guarantee a stable transitive graph. The release workflow requires a reviewed
`package-lock.json` and runs `npm ci`. Do not treat web/SDK commands as verified until
they pass in a network-enabled environment.

The `npm run dev` launcher is implemented in `scripts/dev.mjs`; its source passes
Node syntax checking, but its TypeScript/Vite imports and runtime lifecycle have not
been executed because the workspace packages could not be installed.

The local development UI and API run as separate loopback processes; Docker Compose
is not part of the project. See [Docker Decision](DOCKER-GUIDE.md) and [CI/CD Guide](CI-CD-GUIDE.md).

## Security review for changes

For password or trust-boundary changes, review request/response errors for reflected inputs, storage/logging paths, CORS/Host, KDF caps, cancellation races, output exports, tests and documentation. Do not log a password to diagnose failures.
