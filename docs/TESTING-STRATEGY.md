# Testing Strategy

## Current layers

- **Core unit tests:** analyzer patterns/score, secret-free output, Unicode/space length, input ceiling, policy boundaries, reuse duplicates/similarity/false positives, generator bounds/alphabet/passphrase metadata and secure RNG path. Tests are present but have not run because npm dependencies are unavailable.
- **Python unit tests:** four algorithm success/failure, independent salts, SHA-256 determinism, bcrypt byte limit, malformed verifier and cost bounds, deterministic candidate/search-space behavior for six synthetic strategies, attempt/time limits, measured candidate-check timings, and cancellation.
- **Python API integration tests:** health metrics/OpenAPI, all hash/verify routes, salts and server-side IDs, delete/expiry behavior, sanitized validation errors, loopback Host/Origin, fixed synthetic attack targets, concurrency, job cancellation, payload ceilings, plural benchmark alias and actual benchmark result schema.
- **Browser/E2E tests (not implemented or run):** network canary for analyzer, actual screen journeys, keyboard-only checks, service-unavailable behavior, reset/privacy flows, charts/export redaction.

All test inputs are synthetic. Assertions exercise outputs and behavior, not symbol existence. No production input is used.

## Commands

From `apps/lab-api/`:

```powershell
ruff format --check app tests
ruff check app tests
python -m pytest -q
```

From repository root after npm dependencies are available:

```powershell
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm run start --workspace @psa/example-consumer
```

The commands are not runnable in this environment because `NPM_CONFIG_OFFLINE=true`
is inherited, required packages are absent from cache, and a process-scoped registry
attempt was refused by proxy `127.0.0.1:9`. The release workflow requires a committed
`package-lock.json` and `npm ci`; the regular CI workflow temporarily uses npm
resolution without claiming reproducibility. See [Test results](TEST-RESULTS.md).

## Acceptance and security cases

See the supplied PRD acceptance catalogue and [Requirement Traceability](REQUIREMENT-TRACEABILITY.md). Missing checks include browser network interception, React/TypeScript compilation, clean isolated install, accessibility screen-reader review, dependency scanning, release workflow run, full job-state TTL stress, and malicious-origin browser test.
