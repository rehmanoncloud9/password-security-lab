# Roadmap, Milestones and Release Management

## 1. Delivery philosophy
Deliver a trustworthy core before breadth. A polished interface cannot compensate for misleading scoring, privacy leakage or unsafe lab behavior.

## 2. Milestones

| Milestone | Scope | Exit criteria |
|---|---|---|
| M0 Foundation | Repo, CI, architecture, threat model, dependency choices | Clean clone, agreed contracts, tests run |
| M1 Analyzer | Pattern-aware assessment, findings, recommendations | Core tests pass; browser network canary proves local-only |
| M2 Policy and reuse | Modern/legacy presets, sample reuse lab | Independent states; no persistence; edge tests pass |
| M3 Storage lab | Argon2id, bcrypt, PBKDF2, SHA-256 baseline, verify | Salt and verification tests pass; parameters visible |
| M4 Attack lab | Synthetic dictionary/brute-force, caps, cancel, cleanup | Every run ends within server-enforced budget |
| M5 Evidence | Benchmarks, results screen, report export | Actual measurements, metadata, no secrets in exports |
| M6 Product readiness | Accessibility, docs, clean install, user test | Acceptance checklist complete |
| M7 Open-source release | License, contribution, release notes, SDK example | Maintainer can reproduce build and release |

## 3. Priority policy
- **P0:** required for the course prototype and safety baseline.
- **P1:** reusable SDK and optional integration after P0 is stable.
- **P2:** optional exposure lookup, package publication and further polish.
- **Research:** future work without a delivery promise.

## 4. Release gates
A release candidate requires:
- all P0 acceptance tests passing,
- no known critical/high unresolved vulnerability in shipped dependencies without an explicit risk decision,
- no secret leakage in regression tests,
- no external bind or arbitrary target support in lab,
- complete documentation and known limitations,
- benchmark data generated from the tagged code,
- license and dataset provenance resolved.

## 5. Versioning
Use semantic versioning after the first public API is declared stable:
- `0.x`: pre-stable development; breaking changes expected.
- `1.0.0`: stable documented core API and reproducible release.
- Patch: backward-compatible fixes.
- Minor: backward-compatible features.
- Major: breaking public API changes.

Do not tag a `1.0.0` release while the implementation is still a classroom prototype with unstable contracts.

## 6. Release checklist
- [ ] Version and changelog updated.
- [ ] CI green on tagged commit.
- [ ] Dependency and secret scans reviewed.
- [ ] Threat model reviewed for changes.
- [ ] Dataset licenses/provenance included.
- [ ] No real passwords in fixtures, screenshots or examples.
- [ ] Build artifacts and checksums produced.
- [ ] Documentation matches shipped behavior.
- [ ] Known limitations and upgrade notes published.
- [ ] Rollback/revocation plan documented for compromised artifacts.
