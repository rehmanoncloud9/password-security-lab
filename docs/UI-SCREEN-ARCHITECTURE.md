# UI Screen Architecture

The module registry in `apps/web/src/app/navigation.ts` provides 11 destinations:

| Destination | Actual behavior |
|---|---|
| Overview | Current API readiness and recent session actions |
| Lab Topology | Browser/core/API/worker trust boundaries |
| Password Analysis | Local estimate, findings, warnings and suggestions |
| Policy Checker | Modern and educational policy comparison via core logic |
| Reuse Laboratory | Short-lived exact/similar sample analysis |
| Password Generator | Browser Web Crypto random password/passphrase generation |
| Hashing Laboratory | Four algorithms, independent salts, verify and clear |
| Attack Simulator | Six bounded strategies against internal synthetic targets |
| Benchmarks | Actual API measurements and metadata |
| Results & Reports | Current-session secret-free history and JSON/CSV exports |
| Learning Center | Guided lesson procedure, expected behavior, limitations and questions |

Top navigation links Lab, Experiments, Analysis, Reports, and Learn into this same
registry. The selected module becomes the central workspace while the operational
rail and lower topology/console/quick-actions panels remain available. Browser
navigation is internal state; no password values are placed in URLs.

The current implementation combines analysis, policy, reuse, and generation in one
feature module. If component tests or growth make this difficult to maintain, those
views can be split without moving any business logic out of the framework-independent
core.
