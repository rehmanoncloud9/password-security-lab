# Known Limitations

## Release and verification blockers

- The root npm lock is genuine and resolves Vite 7.3.8 plus Vitest/`@vitest/mocker` 4.1.12; live `npm audit` reports zero vulnerabilities. Two clean `npm ci --ignore-scripts` runs installed 104 packages and preserved the lock hash. A normal `npm ci` lifecycle child process fails with host `spawn EPERM`.
- Root typecheck passes from removed generated outputs. Core Vitest cannot start a worker; its thread-pool attempt hits Vite's Windows `net use` process probe. Vite/esbuild also cannot spawn, so the production build and dev server do not complete.
- The npm registry was reachable only after clearing inherited proxy variables that pointed at `127.0.0.1:9` and using a writable temporary npm cache. No global settings were changed.
- Python tests passed in the existing Python 3.10.11 environment (49 tests). A clean environment installation remains unverified: `PIP_NO_INDEX=1` was inherited; after removing it, PyPI TLS verification failed with `CERTIFICATE_VERIFY_FAILED`. The Python pins also have no artifact hashes.
- `pip-audit`, Gitleaks and CodeQL were unavailable locally. GitHub Actions were not executed. No scanner or workflow pass is claimed.
- No browser surface was available and Vite did not start. Browser E2E, required viewport screenshots, visual reference comparison, keyboard/screen-reader review and runtime network/storage privacy inspection remain unverified.
- No after-splitting bundle size was generated; the prior 2,015.91 kB JS / 946.04 kB gzip is only the baseline.
- The TypeScript analyzer adapter captures actual zxcvbn-ts matcher findings through a runtime-private property. Keep its regression cases when upgrading the pinned estimator library.
- The clean source archive was generated and validated; regenerate it after any further documentation or source change.
- The supplied UI reference and some original source PDFs were not accessible as files in this workspace; the implementation was reviewed against available source/docs, not an actual rendered screenshot comparison.
- Ownership and third-party notice obligations still need review before redistribution. No public release/deployment occurred.

## Product and security scope

- Guessability is a zxcvbn-ts estimate, not an exact attack time or safety guarantee.
- Local policy blocklist checks use bundled English/common dictionary data, not a comprehensive current breach corpus.
- Reuse checks compare only an in-memory supplied sample set and can produce false positives/negatives; they cannot detect cross-site reuse.
- The bundled educational wordlist and attack plans are intentionally small and target only synthetic lab verifiers. A native KDF already running cannot be interrupted immediately by cooperative cancellation.
- API demo verifier/job state is in process memory and is not guaranteed to be zeroized from managed-runtime memory.
- Host CPU/memory readings use psutil; there is no Docker runtime or container metric.
- Benchmarks are actual local measurements, but small local samples are not universal algorithm rankings or attacker-rate predictions.
- HIBP exposure screening, PDF export, package publication, deployment and Docker Compose remain unimplemented/deferred. JSON/CSV session exports are allowlisted result data and must not include plaintext credentials.

Track current status in [Implementation Status](../IMPLEMENTATION-STATUS.md) and [Requirement Traceability](REQUIREMENT-TRACEABILITY.md).
