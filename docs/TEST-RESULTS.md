# Test Results

Results below are only for commands actually executed in this workspace. A Python
pass does not verify the unbuilt TypeScript, web, or browser application.

## Latest checks — 2026-11-15

| Check | Command and working directory | Result |
|---|---|---|
| Python behavior/API suite | `python -m pytest -q` in `apps/lab-api/` | **PASSED: 49 tests in 38.22 seconds** (latest run, 2026-11-15) |
| Python lint | `ruff check apps/lab-api/app apps/lab-api/tests` from root | **PASSED** |
| Python formatting | `ruff format --check apps/lab-api/app apps/lab-api/tests` from root | **PASSED: 10 files already formatted** |
| Frontend/core boundary and color-token checks | `npm run lint` from root | **PASSED:** 7 core/14 web files scanned; semantic contrast tokens meet the 4.5:1 check in light and dark themes |
| Development and contrast script syntax | `node --check scripts/dev.mjs; node --check scripts/check-contrast.mjs` | **PASSED** |
| npm installation | `npm install --ignore-scripts --no-audit --no-fund` from root | **FAILED: ENOTCACHED**; `NPM_CONFIG_OFFLINE=true` is provided by environment |
| Real lockfile resolution | `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` from root | **FAILED: ENOTCACHED** for `@types/react`; no lockfile was created |
| Scoped registry connectivity check | process-scoped `npm_config_offline=false` install attempt | **FAILED: proxy at `127.0.0.1:9` refused connection**; environment/global configuration was not changed |
| pnpm offline resolution | `pnpm install --offline --no-frozen-lockfile` from root | **FAILED: ERR_PNPM_NO_OFFLINE_META** for Vite 7.2.2 |
| Isolated Python install | `apps/lab-api/.venv/Scripts/python.exe -m pip install --no-index --requirement apps/lab-api/requirements-test.lock` | **FAILED:** wheel for `annotated-doc==0.0.4` is not cached; venv is Git-ignored |
| TypeScript tests/build | `npm test`, `npm run build` | **NOT RUN:** dependencies and executables unavailable |
| TypeScript type check | `npm run typecheck` | **BLOCKED:** command ran but `tsc` was not found because dependencies are unavailable |
| Root development startup | `npm run dev` | **BLOCKED:** launcher now builds and watches core first, but cannot load its `typescript` module until npm dependencies are installed |
| Runtime version | `python --version`, `node --version`, `npm --version` | **PASSED:** Python 3.10.11 (supported), Node 24.14.1, npm 11.12.1 |
| Release metadata gate | `node scripts/release-check.mjs` | **Expected release block:** manifests/changelog are consistent, but `package-lock.json` is absent |
| Independent SDK consumer build/run | `npm run build`, `npm run start --workspace @psa/example-consumer` | **NOT RUN:** dependencies unavailable |
| Browser integration/E2E/network canary | No runnable frontend bundle or browser harness | **NOT RUN**; CUA browser inventory returned no browser surfaces |
| Visual/accessibility/assistive technology | No rendered UI or browser session | **NOT RUN**; reference screenshot file was absent and no browser surface was available |
| pip-audit/npm audit/Gitleaks/CodeQL | GitHub workflow definitions added; local scanners unavailable | **NOT RUN** |
| GitHub workflows | No Git remote is configured; no Actions run available | **NOT RUN** |
| Workflow YAML/action pin syntax | PyYAML parse plus Node SHA reference check | **PASSED:** four YAML files parsed; 16 external action references use full 40-character SHAs |
| Clean isolated install | No registry/cache package resolution | **BLOCKED** |

## Python test coverage exercised

The 49 tests execute real algorithm and API behavior across SHA-256, PBKDF2-HMAC-
SHA256, bcrypt, and Argon2id; successful and unsuccessful verification; random salt
behavior; bcrypt byte-boundary rejection; invalid cost and malformed verifier
handling; dictionary/brute-force/pattern/suffix/substitution/word-combination
recovery; deterministic candidate ordering; search-space math; measured
candidate-verification time and throughput; cancellation, attempt/time limits,
concurrency, worker failure, cleanup, and bounded state stores; strict request,
body, host, origin and Unicode validation; secret-safe errors; and real benchmark
result schema/content.

## Fresh loopback API evidence

Started `python -m app.main` from `apps/lab-api/` and called the loopback API with
PowerShell `Invoke-RestMethod`. `GET /lab/health` returned `status=ok`, measured
process/host fields, and zero active jobs/verifiers. With a synthetic sample,
`POST /lab/hash`, correct and incorrect `POST /lab/verify`, and `DELETE /lab/hash/{id}`
were run for all four algorithms; every correct value matched, every different
value failed, and all four verifier records were cleared.

| Live synthetic attack strategy | Terminal state | Attempts / search space | Elapsed ms |
|---|---|---:|---:|
| Dictionary | recovered | 1 / 4 | 0.442 |
| Brute force | recovered | 5 / 6 | 0.789 |
| Pattern/date | recovered | 4 / 5 | 0.460 |
| Predictable suffix | recovered | 5 / 5 | 0.610 |
| Substitution | recovered | 4 / 4 | 0.833 |
| Word combination | recovered | 2 / 49 | 0.712 |

An Argon2id dictionary job was cancelled; its final state was `cancelled`, with zero
candidate attempts and stop reason `cancelled`. `POST /lab/benchmark` then ran the
real one-warm-up/five-repetition workload. The new raw artifact is
[`2026-11-15-acceptance-loopback.json`](../artifacts/benchmarks/2026-11-15-acceptance-loopback.json);
the earlier capture remains preserved at
[`2026-11-15-windows-local.json`](../artifacts/benchmarks/2026-11-15-windows-local.json).
These are API results, not a browser run; JavaScript analysis, UI navigation, exports,
theme persistence, search, and rendered responsive behavior remain unverified.

## Local commands after restoring dependency availability

JavaScript, from the root:

```powershell
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm run start --workspace @psa/example-consumer
```

Python, from `apps/lab-api/`:

```powershell
python -m pip install -r requirements-test.lock
ruff format --check app tests
ruff check app tests
python -m pytest -q
```

Do not mark these JavaScript, browser, scan, or clean-install checks passed until
the commands are run and the resulting behaviors are inspected.
