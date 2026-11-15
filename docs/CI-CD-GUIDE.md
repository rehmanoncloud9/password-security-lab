# CI/CD Guide

## Workflows

- `.github/workflows/ci.yml` runs Python 3.10–3.12 format/lint/tests and JavaScript
  boundary lint, type checks, unit tests, production builds, and the SDK consumer.
- `.github/workflows/security.yml` runs pip-audit, npm audit, Gitleaks directory
  scanning, and CodeQL for Python and JavaScript/TypeScript.
- `.github/workflows/release.yml` runs a no-publication preflight, version/changelog
  checks, tests/builds and creates a short-lived workflow artifact. It does not
  publish a package, create a public release, or deploy the API.
- `.github/dependabot.yml` requests weekly npm, Python, and GitHub Actions updates.

External GitHub Actions are referenced by immutable commit SHA. Python dependencies
are installed from exact version files. npm installation in CI currently uses
`npm install` because the repository has no reviewed `package-lock.json`; once a
registry-backed lock is committed, change CI to `npm ci` and enable npm cache keyed
by that lock. The release preflight already requires the lock and uses `npm ci`.

## Local equivalents

From the repository root:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run start --workspace @psa/example-consumer
```

From `apps/lab-api/`:

```powershell
python -m pip install -r requirements-test.lock
ruff format --check app tests
ruff check app tests
python -m pytest -q
```

## Limitations

No GitHub Actions workflow was executed from this local checkout. npm currently
resolves dynamically in regular CI, so those builds are not yet reproducible across
time. CodeQL upload availability depends on repository code-scanning permissions.
Scanner output must be reviewed; a workflow file is not evidence of a clean scan.
Gitleaks requires its free `GITLEAKS_LICENSE` secret for GitHub organization
repositories; personal-account repositories do not require that secret.
