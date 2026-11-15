# Troubleshooting

## npm install reports `ENOTCACHED`

The local npm configuration is cache-only and the package cache lacks project dependencies. Check `npm config get offline` and `npm config get prefer-offline`; install from an approved registry/cache, then generate and review `package-lock.json`. Do not claim a frontend build until typecheck/tests/build run.

## UI says local lab unavailable

Start the API from `apps/lab-api/` with `python -m app.main`. Confirm `GET http://127.0.0.1:8000/lab/health` locally. The API only allows the web origin `http://127.0.0.1:5173` and loopback Host values.

## bcrypt rejects the value

bcrypt accepts at most 72 UTF-8 bytes in this demonstration. The API rejects longer values instead of truncating. Try a shorter synthetic example or a different lab algorithm.

## Attack returns a limit state

The run performed only the reported candidates and hit the attempt/time budget. The result is inconclusive; it is not evidence that no candidate exists.

## PBKDF2/Argon2 seems slow

KDF costs are intentionally nontrivial. The server allows at most two concurrent KDF operations, one active attack job, and bounded costs. Retry after the operation ends; do not lower the documented minimum to speed up the demo.
