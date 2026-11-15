# Docker Decision and Guide

Docker Compose was not adopted. The application has one loopback Vite process and
one loopback FastAPI process, with no database or persistent service to orchestrate.
The Docker CLI was present during audit, but the Docker Desktop daemon was unavailable.
Adding container claims or controls would not improve the tested local architecture.

The UI therefore reports actual API health, process RSS, host CPU/memory, uptime,
active experiments, and short-lived verifier count from `/lab/health`. It does not
claim container status. Start the API using `python -m app.main` from `apps/lab-api/`
and the UI using `npm run dev` from the root. The API binds to `127.0.0.1` only.

If a future course deployment adopts Compose, it must preserve loopback/restricted
network exposure, read-only source where practical, explicit CPU/memory limits,
health checks, no persisted verifier state, and verified graceful shutdown. Those
containers are not part of this implementation.
