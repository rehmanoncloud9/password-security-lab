# UI Component Inventory

| Component/module | Source | Responsibility | Data source |
|---|---|---|---|
| `App` | `apps/web/src/App.tsx` | Page state, local core calls, API operations, current-session result/event state | TypeScript core and loopback API |
| `AppShell` | `apps/web/src/components/AppShell.tsx` | Top navigation, module navigation/search, theme toggle, real status and resource meters | Navigation registry, theme preference, current API state |
| `PageHeading` | `apps/web/src/components/PageHeading.tsx` | Consistent page title, description and action slot | Feature page props |
| `OperationsRail` | `apps/web/src/components/OperationalPanels.tsx` | Backend health, process metrics, active experiment and secret-safe console | `/lab/health`, operation events |
| `BottomPanels` | `apps/web/src/components/OperationalPanels.tsx` | Topology, console, quick actions | Actual health state and current session |
| Analysis/policy/reuse/generator | `apps/web/src/features/AnalysisLaboratory.tsx` | Local pattern analysis, core policy rules, sample comparisons, secure local generation | `@psa/core`, browser Web Crypto |
| Hashing | `apps/web/src/features/HashingPage.tsx` | Generate/verify SHA-256, PBKDF2, bcrypt, Argon2id; compare salt outputs | `/lab/hash`, `/lab/verify`, verifier deletion |
| Attack simulator | `apps/web/src/features/AttackPage.tsx` | Select fixed synthetic strategies, show search space, poll/cancel actual jobs | `/lab/attacks` |
| Benchmarks/reports | `apps/web/src/features/BenchmarkReports.tsx` | Actual measurements, current-session secret-free result export | `/lab/benchmarks`, allowlisted in-memory summaries |
| Overview/topology/learning | `apps/web/src/features/OverviewTopologyLearning.tsx` | Service overview, trust-boundary diagram and guided educational material | API health and feature links |

The UI uses Lucide icons and local CSS design tokens. It does not use Docker status
or a remote UI component service. This is a source inventory; build/runtime behavior
has not yet been verified.
