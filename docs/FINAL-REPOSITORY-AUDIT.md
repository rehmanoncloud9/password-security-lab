# Final Repository Audit

**Audit date:** 2026-11-15  
**Scope:** Current project workspace after the previous partial implementation and before changes in this assignment. This report is a fresh baseline audit; it does not treat existing code or its prior report as proof of acceptance.

## 1. Workspace inventory

The workspace contains the current application source, tests, documentation pack, prior audit/status reports, benchmark JSON, and the pre-implementation archive. Relevant areas:

- `apps/lab-api/app/`: FastAPI routes, request schemas, process-local state, cryptography, synthetic attacks, and benchmark runner.
- `apps/lab-api/tests/`: Python cryptographic, attack, and API behavior tests.
- `apps/web/src/`: one large `App.tsx`, one `main.tsx`, and one compressed stylesheet. The app currently has four navigation destinations.
- `packages/core/src/` and `packages/core/test/`: analysis, policy, reuse, zxcvbn-ts setup, public types, and behavior tests.
- `examples/sdk-consumer/`: standalone example source and package metadata.
- `docs/`: implementation guidance, partial verification reports, threat/privacy documents, and benchmark methodology/results.
- `artifacts/`: a benchmark capture and `pre-implementation-checkpoint.zip`.
- `.github/workflows/`: absent. `.git/`: absent. The workspace is not a Git repository.

The screenshot referenced by the new prompt is not available as a file or attachment in the inspected workspace. Only the supplied Master PRD PDF/DOCX and Technical Plan PDF are present. The detailed written visual specification is sufficient to proceed with a reference-inspired redesign, but exact screenshot comparison cannot be claimed without the image.

## 2. Existing implementation by module

| Module | Existing behavior found | Baseline condition |
|---|---|---|
| TypeScript analysis | zxcvbn-ts adapter, score/band/guess estimate, generic pattern findings, suggestions, code-point limit and privacy-safe result types | Source and tests exist; tests/build were not runnable before dependency resolution |
| Policy | Modern single-factor and MFA profiles, an educational composition preset, full-value dictionary match, explicit per-check states | Source and tests exist; runtime unverified |
| Reuse | Exact duplicates and NFKC/lowercase Levenshtein comparison with caps and index-only output | Source and tests exist; Unicode code-point regression source exists but was unrun |
| Python storage API | SHA-256, PBKDF2-HMAC-SHA256, bcrypt, Argon2id; generated verifier IDs, verify and delete; capped cost settings | Functional Python tests exist; baseline suite passes |
| Python attack API | Seven authored dictionary entries, one tiny brute-force fixture, threaded single job, status/cancel and server ceilings | Functional tests exist; cooperative native-KDF cancellation limitation remains |
| Benchmark API | Warm-up plus five real timings per method, median/IQR and host/runtime metadata | Measured artifact and endpoint test exist |
| React app | Analyze, Storage, Attack and Results destinations; loopback API calls; local analysis; measurement chart/table; light content is not supported | Existing UI is dark, monolithic and does not match the new layout specification |
| SDK example | Separate consumer source imports the core | Not built or executed |
| Security/configuration | Loopback binding, exact CORS origin, Host/Origin checks, request limits, KDF slots, opaque IDs, process-memory TTL | Python behavior has meaningful tests; full browser/dependency audit is incomplete |

## 3. Existing dependency and runtime state

| Item | Observed state |
|---|---|
| OS / Python / Node / npm / pnpm / Git | Windows; Python 3.10.11; Node 24.14.1; npm 11.12.1; pnpm 11.14.0; Git 2.51.1.windows.1 |
| Python baseline | `python -m pytest -q` from `apps/lab-api/`: **40 passed in 26.57 s**. `ruff format --check app tests` and `ruff check app tests` passed. |
| Root privacy lint | `npm run lint`: passed, scanning six core and three web source files. |
| npm test/typecheck/build | Failed because `vitest` and `tsc` are not installed. |
| npm installation configuration | `NPM_CONFIG_OFFLINE=true` is present in the process environment; configured registry is `https://registry.npmjs.org/`. `npm config get userconfig` reports a user-profile npmrc, but there is no evidence that this file sets offline mode. The cache lacks pinned package metadata needed for this workspace. HTTP(S)/ALL proxy variables point to `http://127.0.0.1:9`. |
| pnpm offline resolution | `pnpm install --offline --no-frozen-lockfile` previously failed with `ERR_PNPM_NO_OFFLINE_META` for `vite@7.2.2`. pnpm also does not honor the npm `workspaces` field without `pnpm-workspace.yaml`. No usable pnpm lock remains. |
| npm lock | `package-lock.json` absent. |
| Python lock | Only direct dependency versions are pinned in `pyproject.toml`; no transitive/hash lock is present. |
| Docker | Docker CLI and Compose v5.1.1 are installed; `docker info` cannot connect to the Docker Desktop Linux engine named pipe. No daemon is running. |
| CI and Git | No workflow, no `.git`, no branch or commit. A `.gitignore` exists. |
| Visual reference | No approved screenshot file was present. |

## 4. Baseline commands and outcomes

| Command | Outcome |
|---|---|
| `python -m pytest -q` (`apps/lab-api/`) | Passed: 40 tests in 26.57 s |
| `ruff format --check app tests` (`apps/lab-api/`) | Passed: 10 files already formatted |
| `ruff check app tests` (`apps/lab-api/`) | Passed |
| `npm run lint` (repository root) | Passed: privacy/architecture boundary check |
| `npm test` | Failed: `vitest` not recognized in the core and web workspaces |
| `npm run typecheck` | Failed: `tsc` not recognized in the core and web workspaces |
| `npm run build` | Failed: `tsc` not recognized in the core, web, and SDK consumer workspaces |
| `npm install --ignore-scripts --no-audit --no-fund` (earlier baseline) | Failed with offline mode enabled and incomplete cache |
| Process-scoped online npm attempt with `npm_config_offline=false`, 20 s fetch timeout, retries disabled | Failed with `ECONNREFUSED 127.0.0.1:9`; the configured proxy endpoint is unavailable in this environment. No lockfile or `node_modules` was produced. |
| `docker info --format '{{.ServerVersion}}'` | Failed: Docker Desktop Linux engine named pipe is unavailable |
| `git status --short --branch` / `git log` | Failed: not a Git repository |

The current Python suite includes behavior assertions for real hash generation/verification, salts, malformed values, limits, synthetic target recovery, lifecycle, and measured benchmarks. It is not browser integration or E2E evidence. JavaScript dependencies are not installed; no browser suite can run until package access is restored or the exact dependency cache is made available.

## 5. Checkpoint

The prior checkpoint exists at `artifacts/pre-implementation-checkpoint.zip`; SHA-256 is `1E16752E3006A1EB65BC03A9BBA56D550FAE83E740D18879A1C71950A2801AE3`. `python -m zipfile -l` listed the 14 original supplied documents and `SHA256SUMS.txt`. This audit did not modify or replace it. The checksum and archive contents must be preserved through the redesign.

## 6. Existing work to preserve

- All Python crypto, API, attack, benchmark code and its 40 passing behavior tests.
- The core analysis/policy/reuse implementation and tests; fix demonstrated issues, retain public interfaces where practical.
- The independent SDK boundary and synthetic-only attack target model.
- The actual benchmark JSON and its metadata.
- All supplied requirement documents and the verified checkpoint.
- Current local-only security defaults.

## 7. Audit conclusion

This is a meaningful partial product, not an empty project. The Python laboratory is behaviorally tested; the browser/core/SDK layer is source-only until a reproducible JavaScript install succeeds. The major requested work is a structural UI redesign, additional educational functionality, verified TypeScript/browser behavior, package/lock resolution, real service telemetry, Git/CI setup, security/dependency verification, and synchronized documentation. Detailed actions and blockers are in [Implementation Gap Analysis](IMPLEMENTATION-GAP-ANALYSIS.md).
