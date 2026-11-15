# Module Responsibilities

| Module | Responsibility | Input/output contract | Dependencies and security notes |
|---|---|---|---|
| `core/src/estimator.ts` | Configure zxcvbn-ts common/English dictionaries and analysis ceiling | Password string to estimator output internally | zxcvbn-ts dependencies; local only; no persistence/network |
| `core/src/analyze.ts` | Map estimator output to secret-free assessment, warnings and suggestions | Bounded Unicode string to score, band, findings and limitations | Omits password and matched tokens; never calls API |
| `core/src/policy.ts` | Evaluate distinct modern and educational rules | Input, preset/options to rule-by-rule status | Modern profile has no composition rules; bundled dictionary is limited |
| `core/src/reuse.ts` | Find duplicates and explain near-match pairs | At most 20 bounded values to indexes/reasons | NFKC/casefold normalization, configured similarity threshold; memory-only |
| `core/src/generate.ts` | Generate password/passphrase with Web Crypto | Options to generated string and theoretical selection entropy | Rejection sampling avoids modulo bias; browser Web Crypto required; caller must not persist |
| `core/src/types.ts` | Public typed SDK output and limits | TypeScript interfaces/errors | No React, API, storage, crypto lab, or attack dependency |
| `web/src/App.tsx` | Coordinate navigation, local core calls, API actions, theme/session state | User actions to rendered state and explicit loopback requests | Theme key only is persisted; password is omitted from result/export shapes |
| `web/src/app/navigation.ts` | Single 11-module registry and top-level links | Static labels/icons/page IDs | Lucide icons; UI routing state only |
| `web/src/components/AppShell.tsx` | Navigation, search, theme toggle, status metrics | Current module and measured API/session state | Semantic controls; status shown unavailable if API unavailable |
| `web/src/components/OperationalPanels.tsx` | Environment rail, experiment console, topology and actions | Health, safe events, current experiment | CPU/memory/uptime come from health endpoint; no fake Docker metrics |
| `web/src/features/AnalysisLaboratory.tsx` | Analyzer, policy, reuse and generation views | Core function calls to view state | Reuses core behavior; no duplicate scoring/policy code |
| `web/src/features/HashingPage.tsx` | Hash, verify, independent-salt experiment and reset | Explicit synthetic input to API, actual response metrics | bcrypt limit error is surfaced; no input in URL or session result |
| `web/src/features/AttackPage.tsx` | Bounded strategy selection, pre-run search-space view, polling/cancel | Fixed target/strategy request to safe job status | API enforces all limits; UI cannot choose arbitrary password/hash target |
| `web/src/features/BenchmarkReports.tsx` | Actual comparison, session report list, safe export | Benchmark result and allowlisted session summaries | No sample password or verifier export by design |
| `web/src/features/OverviewTopologyLearning.tsx` | Overview, trust map, guided educational procedures | API readiness and lessons linking to real modules | Lesson examples are synthetic; browser behavior not yet verified |
| `api/schemas.py` | Strict request schemas and fixed literals | JSON bodies to validated dataclasses/models | Extra fields rejected; bound string/int fields |
| `api/crypto.py` | Four hashing methods and verification | Bounded string/algorithm/options to stored verifier/metrics | `hashlib`, `bcrypt`, `argon2-cffi`, `secrets`; KDF costs are capped |
| `api/attacks.py` | Deterministic internal candidate plans and actual verification | Internal target + bounded request to state/counters | No imported credential/hash/file/network input; one active job |
| `api/state.py` | Bounded in-memory verifier and job records | Opaque IDs and TTL state | Locks and cleanup; no file/database writes |
| `api/benchmark.py` | Warm-up and repeated actual hash/verify timings | Fixed synthetic value to raw measurements/metadata | perf counter, psutil, library versions; no fabricated rates |
| `api/main.py` | Loopback API routes, lifecycle, validation, health and middleware | HTTP requests to JSON responses | Host/Origin/CORS/body ceilings; access logging disabled by launcher |
| `examples/sdk-consumer` | Import/reuse core without React or API | Synthetic value to console demonstration | No attack or API imports; build/run unverified |

The Python modules were behavior-tested. TypeScript package and UI dependencies
could not be installed in the supplied environment; the listed frontend interfaces
are based on source inspection and remain unverified at runtime.
