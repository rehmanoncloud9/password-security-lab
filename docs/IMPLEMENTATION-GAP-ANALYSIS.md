# Implementation Gap Analysis

## Current remediation state — 2026-11-15

This section supersedes the earlier environment snapshot below for the listed
areas. The npm lock is genuine; Vite 7.3.8 and Vitest/`@vitest/mocker` 4.1.12 are
resolved, and a live npm audit reports zero vulnerabilities. Clean-output
TypeScript checks, nine web server-render checks, compiled-core behavior checks,
49 Python tests, live API crypto checks, and the SDK consumer have evidence. Normal
npm lifecycle startup, Vitest, Vite builds/server, clean Python installation,
Python/deep security scans, browser tests/screenshots, and GitHub Actions remain
blocked or unrun. See the current [Implementation Status](../IMPLEMENTATION-STATUS.md)
and [Requirement Traceability](REQUIREMENT-TRACEABILITY.md).

## Acceptance addendum — 2026-11-15

This is a snapshot of the earlier gap review. The genuine root package-lock.json is
now present and `npm ls --depth=0` passes after cached installation. Root TypeScript
typechecks pass from deleted generated output. Remaining current gaps are plain npm
lifecycle installation in a subprocess-capable environment, the live npm audit and
Vite/Vitest updates, core Vitest execution, production Vite build, browser runtime,
security scanners, and screenshots. See current [Implementation Status](../IMPLEMENTATION-STATUS.md).

This is the post-implementation state relative to the audited baseline. The
workbench redesign and backend extensions are in source, while several acceptance
gaps remain because the browser toolchain could not be installed or executed.

| Area | Implemented now | Evidence | Remaining gap/next action |
|---|---|---|---|
| TypeScript analysis and policies | zxcvbn-ts analysis, policy profiles, reuse logic, suggestions, generator | Clean-output typecheck and direct compiled-core behavior checks pass; boundary lint passes | Core Vitest remains blocked by process `EPERM` |
| Secure generator | Web Crypto rejection sampling; character and passphrase modes; local list and entropy metadata | Behavioral test source exists | Tests and browser clipboard/privacy behavior not run |
| Python crypto | SHA-256 baseline, PBKDF2, bcrypt, Argon2id; random salt and verification | Actual Python API tests pass | Full browser journeys and isolated clean install pending |
| Attacks | Dictionary, brute force, pattern, suffix, substitution, word combinations against fixed targets | Six strategy tests/API behavior included in 49 passing suite | Browser poll/cancel, deep stress and strict process termination pending |
| Benchmarks/health | Repeated hash/verify timings and actual host/process readings; candidate throughput | Python tests and saved local benchmark | Rendered chart/table and exports not exercised |
| React workbench | White-first and dark themes; top nav; 11-module sidebar; central views; operational rail; topology, console and quick actions | Components/styles and real API wiring in source | TypeScript build, browser screenshots and keyboard/mobile behavior blocked |
| Learning center | Nine structured guided lessons tied to real module destinations | Lesson content in source | Browser workflow verification pending |
| API contracts | Strict body/schema limits, health metrics, OpenAPI, benchmark alias, synthetic target IDs | API tests included in 49 pass | Browser integration and live OpenAPI smoke for current build not repeated |
| Git/CI/security | Local work branch, ignore/attributes, pinned GitHub CI/security/release workflows and Dependabot | Files are present | No remote Actions execution; no scanner result |
| JavaScript dependency reproducibility | Exact direct manifest versions | Environment diagnosis documented | No lockfile because offline npm and refused proxy prevent registry resolution |
| Python clean installation | Exact runtime/test version requirements | Existing environment suite passes, 49 tests | No artifact hashes; PIP_NO_INDEX/TLS restrictions prevented clean venv install |
| Security/privacy | Source boundary lint, strict API regressions, bounded behavior | Selected checks pass | Browser network/storage review and dependency scans remain unverified |
| Visual reference | Written layout and colors implemented as source design | UI design docs and source | Original screenshot was unavailable for rendered comparison |
| Docker | Decision to keep local Vite/API process architecture | Host metrics now real; Docker daemon unavailable | Compose intentionally not implemented; there are no container status controls |
| Release | Release preflight validates versions, changelog and npm lock before build; artifact upload is configured | Source/workflow configuration | Workflow cannot reach release build until lock is committed; no release/publication performed |

The complete per-requirement evidence, statuses, and remaining issues are in
[Requirement Traceability](REQUIREMENT-TRACEABILITY.md). npm registry access worked
after clearing the inherited proxy variables and using a temporary cache; the
remaining JavaScript execution blocker is child-process `spawn EPERM`. Python
package access is blocked by inherited `PIP_NO_INDEX=1` and a TLS validation error
when bypassing that setting. No result is inferred from those blocked checks.
