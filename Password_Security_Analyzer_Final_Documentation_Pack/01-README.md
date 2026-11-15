# Password Security Analyzer

A privacy-first password-security assessment and learning workbench. Analyze password guessability locally, evaluate policy separately, explore secure password storage, and run bounded attack demonstrations against synthetic targets.

> **Important:** Use synthetic examples only. Never enter a password you currently use. The analyzer provides estimates and education; it cannot prove that a password is safe or uncrackable.

## What it does
- Pattern-aware password assessment with explanations and suggestions.
- Separate policy evaluation (modern and educational legacy presets).
- Short-lived exact-reuse and similarity demonstration.
- Local password-storage lab: SHA-256 baseline, Argon2id, bcrypt and PBKDF2.
- Bounded dictionary and brute-force demonstrations against synthetic targets only.
- Reproducible benchmark reporting and developer integration path.

## Privacy model
- Core analysis runs locally in the browser.
- Passwords are not stored, logged, placed in URLs, or sent to analytics.
- The local laboratory accepts synthetic demonstration values only.
- Optional breach screening, if enabled, uses the Pwned Passwords range protocol: only a five-character hash prefix is sent; the remainder is matched locally.
- Reports exclude passwords and synthetic target plaintext.

## Architecture
- `apps/web/` — React/TypeScript application.
- `apps/lab-api/` — local Python/FastAPI security laboratory.
- `packages/core/` — framework-independent analysis and policy functions.
- `packages/react/` — optional React integration.
- `tests/` — unit, integration, security and acceptance tests.
- `docs/` — PRD, architecture, security, threat model, testing and roadmap.

The SDK is deliberately independent from the lab API. Attack functionality must never be included in the production-facing SDK.

## Status
This repository documentation defines the product baseline and target architecture. Do not describe features as implemented until the corresponding code and tests exist. Track implementation status in GitHub issues/milestones.

## Quick start
The exact commands depend on the implementation and package manager selected by the team. Once scaffolded, keep the commands here synchronized with CI and the lockfiles. The intended developer workflow is:

1. Install supported Node.js and Python versions listed in `.tool-versions`/`package.json`/`pyproject.toml`.
2. Install dependencies from lockfiles.
3. Start the web app.
4. Start the local lab API bound to `127.0.0.1`.
5. Run unit, integration, security and type checks.

Do not add placeholder commands or pretend the repository is runnable before the implementation exists.

## Security design rules
- No real credentials in tests, screenshots, bug reports or demos.
- No plaintext secret logging or telemetry.
- No arbitrary hash imports, real account targets, domains or remote endpoints in the attack lab.
- Every experiment has server-side time, attempt, size and concurrency limits.
- A timeout or limit reached is inconclusive.

## Documentation
- [Master PRD](docs/00-MASTER-PRD.md)
- [Architecture](docs/02-ARCHITECTURE.md)
- [Security and Privacy](docs/03-SECURITY-PRIVACY.md)
- [Threat Model](docs/04-THREAT-MODEL.md)
- [Testing Strategy](docs/05-TESTING-STRATEGY.md)
- [Roadmap and Release](docs/06-ROADMAP-RELEASE.md)
- [API Contracts](docs/07-API-CONTRACTS.md)
- [Governance and Contribution](docs/08-GOVERNANCE.md)
- [Decision Log](docs/09-DECISION-LOG.md)

## Contributing
Read `docs/08-GOVERNANCE.md` before opening a pull request. Security-sensitive changes require tests and review. Never include real passwords in issues or fixtures.

## License
Choose and add a recognized open-source license before public release. Do not claim a license until the actual `LICENSE` file is committed.
