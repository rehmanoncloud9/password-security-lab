# Local Run Guide

This implementation is for a local classroom demonstration, not public deployment.
The API launcher binds to `127.0.0.1`; Host validation permits only loopback names.
Do not expose it through a tunnel, reverse proxy, container port publish, or LAN bind.

Install Node.js 24/npm 11 and Python 3.10–3.12. Install npm dependencies in the
repository root and Python runtime/test dependencies from
`apps/lab-api/requirements-test.lock`. Run `npm run dev` for the UI and
`python -m app.main` from `apps/lab-api/` for the API. See [README](../README.md) for
PowerShell and macOS/Linux commands.

The clean-install procedure has not been verified: npm inherits cache-only resolution
and an online attempt was refused by proxy `127.0.0.1:9`; the Python clean venv could
not find its pinned wheels offline. Python versions are pinned without artifact hashes.
CI workflows exist but have not been executed. Do not describe the current workspace
as release-ready.
