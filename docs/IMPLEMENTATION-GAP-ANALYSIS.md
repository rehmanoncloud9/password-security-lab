# Implementation Gap Analysis

This is the post-implementation state relative to the audited baseline. The
workbench redesign and backend extensions are in source, while several acceptance
gaps remain because the browser toolchain could not be installed or executed.

| Area | Implemented now | Evidence | Remaining gap/next action |
|---|---|---|---|
| TypeScript analysis and policies | zxcvbn-ts analysis, policy profiles, reuse logic, suggestions, generator | Source and tests present; boundary lint passes | Run test/typecheck/build when npm registry is available |
| Secure generator | Web Crypto rejection sampling; character and passphrase modes; local list and entropy metadata | Behavioral test source exists | Tests and browser clipboard/privacy behavior not run |
| Python crypto | SHA-256 baseline, PBKDF2, bcrypt, Argon2id; random salt and verification | Actual Python API tests pass | Full browser journeys and isolated clean install pending |
| Attacks | Dictionary, brute force, pattern, suffix, substitution, word combinations against fixed targets | Six strategy tests/API behavior included in 49 passing suite | Browser poll/cancel, deep stress and strict process termination pending |
| Benchmarks/health | Repeated hash/verify timings and actual host/process readings; candidate throughput | Python tests and saved local benchmark | Rendered chart/table and exports not exercised |
| React workbench | White-first and dark themes; top nav; 11-module sidebar; central views; operational rail; topology, console and quick actions | Components/styles and real API wiring in source | TypeScript build, browser screenshots and keyboard/mobile behavior blocked |
| Learning center | Nine structured guided lessons tied to real module destinations | Lesson content in source | Browser workflow verification pending |
| API contracts | Strict body/schema limits, health metrics, OpenAPI, benchmark alias, synthetic target IDs | API tests included in 49 pass | Browser integration and live OpenAPI smoke for current build not repeated |
| Git/CI/security | Local work branch, ignore/attributes, pinned GitHub CI/security/release workflows and Dependabot | Files are present | No remote Actions execution; no scanner result |
| JavaScript dependency reproducibility | Exact direct manifest versions | Environment diagnosis documented | No lockfile because offline npm and refused proxy prevent registry resolution |
| Python clean installation | Exact runtime/test version requirements | Existing environment suite passes | No artifact hashes or clean venv installation evidence |
| Security/privacy | Source boundary lint, strict API regressions, bounded behavior | Selected checks pass | Browser network/storage review and dependency scans remain unverified |
| Visual reference | Written layout and colors implemented as source design | UI design docs and source | Original screenshot was unavailable for rendered comparison |
| Docker | Decision to keep local Vite/API process architecture | Host metrics now real; Docker daemon unavailable | Compose intentionally not implemented; there are no container status controls |
| Release | Release preflight validates versions, changelog and npm lock before build; artifact upload is configured | Source/workflow configuration | Workflow cannot reach release build until lock is committed; no release/publication performed |

The complete per-requirement evidence, statuses, and remaining issues are in
[Requirement Traceability](REQUIREMENT-TRACEABILITY.md). The controlling external
environment issue is the inherited `NPM_CONFIG_OFFLINE=true` plus a proxy endpoint
at `127.0.0.1:9` that refuses registry requests. This is not treated as a successful
install or as a reason to invent lock metadata.
