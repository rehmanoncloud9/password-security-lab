# CI/CD Guide

## Workflows

- `.github/workflows/ci.yml`: Python format/lint/tests; npm lock install; privacy lint; TypeScript typechecks/tests; production builds; SDK consumer execution.
- `.github/workflows/security.yml`: Python `pip-audit`, npm audit, Gitleaks and CodeQL.
- `.github/workflows/release.yml`: version/changelog/test/build preflight and short-lived workflow artifact. It does not publish a package, create a public release or deploy the API.
- `.github/dependabot.yml`: weekly npm, Python and GitHub Actions update proposals.

GitHub Actions are pinned to immutable action revisions. The CI and security workflows use `npm ci` and the root lockfile. The current npm dependency tree audits clean locally, but no GitHub workflow has been executed; configured YAML is not a pass. In this sandbox normal npm lifecycle processes fail `spawn EPERM`, while Python registry access fails TLS verification. See [External Verification Procedure](REGISTRY-ENABLED-SETUP.md).

## Local equivalents

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

From `apps/lab-api/`:

```powershell
python -m pip install -r requirements-test.lock
ruff format --check app tests
ruff check app tests
python -m pytest -q tests
pip-audit --requirement requirements-test.lock
```

## Limits and release use

Run workflows only with the authorized repository identity and permissions. No commit, push, publication or deployment is included in this verification pass. Review actual job logs and scanner results; a workflow file or successful YAML parse does not establish a pass. CodeQL availability depends on repository permissions. Gitleaks license requirements depend on repository ownership/account type.
