# Governance and Contribution Guide

## 1. Project governance
The project begins as a student-built open-source candidate. The team owns implementation decisions until maintainers are formally assigned. No contributor should imply a security certification or production suitability without evidence.

## 2. Contribution workflow
1. Open or select an issue with scope and acceptance criteria.
2. Assign one implementation owner and at least one reviewer.
3. Create a focused branch.
4. Add/update tests and documentation with the code.
5. Run formatting, lint, type, unit, integration and security checks.
6. Submit a pull request describing behavior, risks and evidence.
7. Require review for changes to cryptography, privacy boundaries, lab endpoints, datasets or release workflows.

## 3. Security-sensitive changes
Require explicit reviewer attention:
- password handling, logs and telemetry,
- cryptographic algorithm or parameter changes,
- HIBP/network integrations,
- attack simulator scope or limits,
- dataset updates,
- export/report schema,
- dependencies with access to secrets or network.

Never submit a real password, leaked credential or private hash in an issue or PR. Use synthetic examples.

## 4. Issue reporting
Bug reports should include:
- affected version/commit,
- operating system and runtime versions,
- steps to reproduce using synthetic input,
- expected vs actual behavior,
- sanitized logs only.

For suspected vulnerabilities, use a private reporting channel if available; do not publish exploit details before maintainers can assess and coordinate a fix. Add `SECURITY.md` with the project's chosen contact before public release.

## 5. Team responsibility model
Suggested five-person division:
- Core analysis and policy.
- Hashing and verification lab.
- Bounded attack engine.
- Web UX and accessibility.
- Integration, QA, benchmarks and documentation.

Each owner must provide code, tests, a short design explanation and a demo. Ownership does not remove shared responsibility for understanding the complete system.

## 6. Licensing and datasets
Before public release:
- select a recognized open-source software license,
- add the actual `LICENSE` file,
- document third-party dependencies and notices,
- verify dataset license and redistribution permissions,
- record dataset source, version, checksum and update date.

Do not reuse a third-party dataset merely because it is publicly downloadable.

## 7. Code of conduct
Adopt a standard contributor code of conduct before opening external contributions. Keep project discussions respectful, technical and evidence-based.
