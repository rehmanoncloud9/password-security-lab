# Security Architecture

## Security scope

The product processes password-like values. The analyzer treats every browser input as a secret. The lab is an intentionally separate local demonstration service; it accepts only values the user submits in lab-specific controls and internal synthetic target IDs for attacks.

## Controls implemented

- Analyzer/core source contains no fetch, storage, analytics or logging path. Its result types omit the original value and matched token.
- Web runtime uses a fixed loopback API origin; the Vite server binds to `127.0.0.1`.
- FastAPI launcher binds to `127.0.0.1`; TrustedHost accepts `127.0.0.1`/`localhost`, exact CORS origin is `http://127.0.0.1:5173`, and non-allowlisted mutation origins are rejected.
- API buffers a maximum of 16 KiB, validates strict models/allowlists, does not log request bodies, and sanitizes Pydantic validation responses to omit submitted values.
- Password values are not stored in the demo verifier registry; only generated verifier material, safe metadata, and short-lived job counters are held in process memory.
- Verifier/job identifiers use `secrets.token_urlsafe(32)`. Verifier TTL is 10 minutes; completed jobs expire after one minute; a background cleanup runs every 15 seconds.
- At most two KDF operations run concurrently; one attack job is admitted at a time; resource costs, candidate count, duration, body size and input lengths are bounded.
- SHA-256 is labeled unsafe. PBKDF2, bcrypt and Argon2id use established implementations and stored algorithm parameters. bcrypt inputs above 72 UTF-8 bytes are rejected.
- The attack API only accepts enumerated internal synthetic fixtures. It returns no target/candidate plaintext.
- UI reports unavailable lab status separately. Optional exposure screening is not implemented and cannot imply a negative result.

## Security review status

Python API/crypto behavior has unit and TestClient coverage, Ruff static checks pass,
and source boundary lint passes. No browser build, network-interception test,
dependency advisory scanner, external penetration test, or accessibility audit has
run. GitHub scanner workflows are configured but unexecuted. npm resolution was
blocked by cache-only mode plus a refused proxy; Python clean venv validation failed
because wheels were unavailable offline. See [Security Audit](SECURITY-AUDIT.md),
[Security Test Results](SECURITY-TEST-RESULTS.md), and
[Privacy Verification](PRIVACY-VERIFICATION.md).

## Residual risks

The process shares a machine with the user; malware/extensions/screen capture can see input. Managed runtimes cannot guarantee zeroization. The cooperative thread worker checks timeout/cancel between bounded KDF calls, so a single in-progress native KDF can finish after the nominal deadline by its operation duration. No remote deployment is supported. Results are educational, not production certification.
