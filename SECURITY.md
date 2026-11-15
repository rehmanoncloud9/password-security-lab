# Security policy

This application is a local educational laboratory, not a production password manager, verifier service, or cracking tool. Use synthetic values only.

## Reporting a vulnerability

Do not include real passwords, account data, or live hashes in a report. Send findings privately to the project maintainers through the course or organization channel that supplied this repository. Include affected version/commit, impact, minimal synthetic reproduction, and any mitigation. Do not publish an exploit before coordinating with the maintainers.

No dedicated security contact or response-time commitment has been configured. The current implementation has unresolved verification gaps listed in [Security Audit](docs/SECURITY-AUDIT.md); do not treat this as an audited or production-ready system.

## Safe use

The API is designed to bind to `127.0.0.1` and should not be exposed through a tunnel, reverse proxy, LAN bind, or public deployment. The attack simulator accepts only internal synthetic target identifiers. Do not modify it to accept account credentials, external hash dumps, or remote targets.
