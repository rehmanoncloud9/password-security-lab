# Release Checklist

**Current state: NOT READY.** The release preflight workflow will not pass without
a committed npm lockfile, and the browser/SDK stack has not been built or tested.

| Gate | Status | Evidence/remaining work |
|---|---|---|
| M0 audit, reconciliation, checkpoint | PASSED for available workspace | `FINAL-REPOSITORY-AUDIT.md`; archive checksum recorded; historical docs-only audit marked superseded |
| Python crypto/API/attack behavior | PASSED for current suite | 48 tests passed; stress/process-kill acceptance remains limited |
| Python lint/format | PASSED | Ruff check and format checks pass |
| TypeScript core tests/build | NOT RUN | npm package install blocked by environment/proxy |
| React build and browser journeys | NOT RUN | no installed dependencies or runnable bundle |
| Visual reference and responsive review | BLOCKED/NOT RUN | approved screenshot unavailable; source layout not rendered |
| Accessibility keyboard/screen reader/contrast | NOT RUN | run after browser build |
| Analyzer network canary/storage inspection | NOT RUN | boundary lint is source-only; browser inspection pending |
| npm dependency lock and clean install | BLOCKED | registry access unavailable; do not fabricate package-lock |
| Python clean install and hashes | BLOCKED | new venv has no cached wheels; generate hashes from approved package index |
| Dependency, CodeQL, and secret scans | NOT RUN | workflows configured; execute in GitHub and review reports |
| CI and release preflight | NOT RUN | GitHub Actions not run; release workflow fails until package lock is committed |
| Benchmark evidence | PASSED for one local run | artifact and environment metadata preserved; not generalizable |
| Ownership/license review | OPEN | confirm project and contributor rights before redistribution |
| Exposure screening | DEFERRED P1 | explicitly not checked; no fake result |
| Public publish/deployment | NOT AUTHORIZED/PERFORMED | none made |

Before release: resolve registry access; produce/review and commit npm lock; create
Python hash lock; run clean installs; run CI and all tests; verify real browser
journeys, security/privacy, accessibility, visual reference, and mobile layouts;
review security scan results; update traceability/report; confirm ownership and
contributor rights. Do not publish or deploy without explicit authorization.
