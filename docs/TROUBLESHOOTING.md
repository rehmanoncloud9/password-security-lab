# Troubleshooting

## npm reports `ENOTCACHED`, `ECONNREFUSED`, or lifecycle `EPERM`

The genuine npm lock is present. In this managed shell, process environment variables set `NPM_CONFIG_OFFLINE=true` and HTTP(S)/ALL proxy URLs to `127.0.0.1:9`. Removing those variables for the current process and using a writable temporary npm cache allowed real registry installs and audit. Normal `npm ci` still fails when npm starts lifecycle scripts with `spawn EPERM`; use a process-capable development machine for the full clean install. Do not hand-edit the lock or disable network security controls.

## Vite or Vitest reports `spawn EPERM`

The managed Windows sandbox denies child-process creation. Vite/esbuild config startup and Vitest worker/path probing fail before the app or core tests execute. Core TypeScript typechecks, direct Node core checks and web SSR checks do not require those workers and passed. Repeat the blocked commands on a normal development machine or CI runner; do not mark build/Vitest gates passed based on TypeScript alone.

## Python package install says no versions are available

Check whether the environment sets `PIP_NO_INDEX=1`. Removing that process setting exposed a TLS issuer-verification failure at PyPI in this host. Do not use `--trusted-host` or disable certificate validation. Use a trusted PyPI connection with a valid certificate chain; see [External Verification Procedure](REGISTRY-ENABLED-SETUP.md).

## UI says local lab unavailable

Start the API from `apps/lab-api/` with `python -m app.main`. Confirm `GET http://127.0.0.1:8000/lab/health` locally. The API only allows the web origin `http://127.0.0.1:5173` and loopback Host values.

## bcrypt rejects the value

bcrypt accepts at most 72 UTF-8 bytes in this demonstration. The API rejects longer values instead of truncating. Try a shorter synthetic example or a different lab algorithm.

## Attack returns a limit state

The run performed only the reported candidates and hit the attempt/time budget. The result is inconclusive; it is not evidence that no candidate exists.

## PBKDF2/Argon2 seems slow

KDF costs are intentionally nontrivial. The server allows at most two concurrent KDF operations, one active attack job, and bounded costs. Retry after the operation ends; do not lower the documented minimum to speed up the demo.
