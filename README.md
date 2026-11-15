# Password Security Laboratory

**A Hands-On Information Security Lab** for synthetic, local classroom experiments.

The product combines a local pattern-aware analyzer and policy core, a React
workbench, and a separate loopback Python laboratory for cryptographic operations,
bounded synthetic guessing experiments, and measured benchmarks. Use made-up values
only. This is not a credential checker or production authentication service.

## Current delivery state

This workspace contains substantial implementation, but it is **not a verified
release**. The Python API, cryptographic operations, and bounded attack logic pass
their current automated suite. TypeScript/React/SDK source and tests are present but
could not be compiled or run here because npm cannot reach the configured proxy and
has no cached packages. Browser, visual, and accessibility behavior remain unverified.
See [Implementation Status](IMPLEMENTATION-STATUS.md), [Test Results](docs/TEST-RESULTS.md),
and [Known Limitations](docs/KNOWN-LIMITATIONS.md).

## Product areas

- **Overview and topology:** actual local API health, system resource readings,
  service boundary diagram, current-session events, and working shortcuts.
- **Analysis:** pattern-aware zxcvbn-ts estimate, independent modern/educational
  policy checks, explainable in-memory reuse comparison, and local secure generation.
- **Hashing Laboratory:** SHA-256 educational baseline, PBKDF2-HMAC-SHA256, bcrypt,
  and Argon2id generation and verification, independent salts, actual timings.
- **Attack Simulator:** deterministic dictionary, brute-force, pattern, suffix,
  substitution, and word-pair experiments against fixed internal synthetic targets.
- **Benchmarks and reports:** actual per-run local timings and environment data,
  plus current-session secret-free JSON/CSV exports.
- **Learning Center:** guided experiment objectives, procedures, explanations,
  misconceptions, limitations, and questions.

Optional exposure screening is deferred and remains not checked. No fabricated
benchmark or attack output is used.

## Requirements

- Node.js 24.14.1 and npm 11 (workspace metadata requires Node 24 and npm 11).
- Python 3.10–3.12.
- Local ports 5173 and 8000 available.
- Package registry access for JavaScript packages. The repository does not yet
  contain `package-lock.json`; a reviewed lock is a release blocker.

Python runtime/test versions are pinned in `apps/lab-api/requirements.lock` and
`requirements-test.lock`; artifact hashes are not recorded. These files have not
been clean-installed in this environment.

## Run locally

From the repository root, install the workspace and start the React UI:

```powershell
npm install
npm run dev
```

The root development launcher builds the TypeScript core before starting Vite,
then watches the core and rebuilds it when its sources change. Stop both local
development processes with Ctrl+C.

In a second terminal, from the repository root:

```powershell
python -m venv apps/lab-api/.venv
apps/lab-api/.venv/Scripts/python.exe -m pip install -r apps/lab-api/requirements-test.lock
Set-Location apps/lab-api
.\.venv\Scripts\python.exe -m app.main
```

On macOS/Linux, from the repository root:

```bash
python3 -m venv apps/lab-api/.venv
apps/lab-api/.venv/bin/python -m pip install -r apps/lab-api/requirements-test.lock
cd apps/lab-api
.venv/bin/python -m app.main
```

The API starts on `http://127.0.0.1:8000`; the Vite development server uses
`http://127.0.0.1:5173`. Local API documentation is available at
`http://127.0.0.1:8000/docs`.

**Important:** npm installation did not complete in the supplied environment.
`NPM_CONFIG_OFFLINE=true` is inherited from the environment, and a process-scoped
online attempt reached a proxy at `127.0.0.1:9` that refused the connection. Do not
assume the frontend commands have been verified here. Run them in a normal
registry-enabled developer or CI environment.

## Checks

From the repository root, after npm dependencies are installed:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run start --workspace @psa/example-consumer
```

From the repository root for Python checks:

```powershell
apps/lab-api/.venv/Scripts/python.exe -m ruff format --check apps/lab-api/app apps/lab-api/tests
apps/lab-api/.venv/Scripts/python.exe -m ruff check apps/lab-api/app apps/lab-api/tests
apps/lab-api/.venv/Scripts/python.exe -m pytest -q apps/lab-api/tests
```

Current run evidence is in [Test Results](docs/TEST-RESULTS.md). CI definitions
are in `.github/workflows`; GitHub Actions have not been run from this workspace.

## Safety and privacy

- Password analysis runs synchronously in the TypeScript core in the browser; it
  does not call the Python service or any external endpoint.
- The theme preference is the only browser-persisted app value (`psl-theme`).
- Hashing and attacks send synthetic lab inputs only to the fixed loopback service.
- The API accepts fixed synthetic attack target identifiers, never imported hashes,
  account data, arbitrary lists, files, or remote targets.
- API request bodies are not logged; short-lived verifier/job state is held in
  process memory only.
- Attacks enforce server-side candidate, time, concurrency, and state limits.

Read [Security](SECURITY.md), [Threat Model](docs/THREAT-MODEL.md),
[Privacy Verification](docs/PRIVACY-VERIFICATION.md), and [API Reference](docs/API-REFERENCE.md).

## Engineering references

- [Architecture](docs/ARCHITECTURE.md) · [Data Flow](docs/DATA-FLOW.md) · [Module Responsibilities](docs/MODULE-RESPONSIBILITIES.md)
- [User Guide](docs/USER-GUIDE.md) · [Developer Guide](docs/DEVELOPER-GUIDE.md) · [SDK Guide](docs/SDK-GUIDE.md)
- [UI Design System](docs/UI-UX-DESIGN-SYSTEM.md) · [CI/CD Guide](docs/CI-CD-GUIDE.md) · [Docker Decision](docs/DOCKER-GUIDE.md)
- [Requirement Reconciliation](docs/REQUIREMENT-RECONCILIATION.md) · [Traceability](docs/REQUIREMENT-TRACEABILITY.md)
- [Final Engineering Report](docs/FINAL-ENGINEERING-REPORT.md) · [Known Limitations](docs/KNOWN-LIMITATIONS.md)

The workspace includes the verified original-material archive at
`artifacts/pre-implementation-checkpoint.zip`. No commit, push, publication, or
deployment has been performed. The draft license is not confirmation of ownership
or redistribution rights; see [License](LICENSE).
