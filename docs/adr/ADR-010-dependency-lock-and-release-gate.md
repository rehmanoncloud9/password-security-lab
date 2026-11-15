# ADR-010: Do Not Fabricate Dependency Lock Metadata

- **Status:** Superseded by registry-enabled remediation (ADR-012)
- **Date:** 2026-11-15

## Supersession note

This decision records the earlier restricted environment accurately. A subsequent
registry-enabled remediation generated and verified a genuine root `package-lock.json`.
The original decision below remains as historical context; the current dependency
state and audit evidence are recorded in ADR-012 and the final engineering report.

## Context

The JavaScript workspace has exact direct dependency versions but no npm lockfile.
The supplied environment sets `NPM_CONFIG_OFFLINE=true`; packages are absent from
cache, and a process-scoped online attempt is refused by proxy `127.0.0.1:9`. Python
versions are pinned, but artifact hashes have not been generated. The assignment
requires reproducibility and does not allow fabricated test/dependency claims.

## Decision

Do not hand-author or infer `package-lock.json` metadata. Regular CI currently uses
`npm install` to exercise the source on a registry-enabled runner, and it documents
that the resolved transitive graph is not yet reproducible. The release preflight
requires a reviewed `package-lock.json` and uses `npm ci`; without it, release
verification stops. Generate npm/Python hashes only in an approved environment
that can resolve actual package artifacts, then commit the reviewed lock through the
project's normal authorized workflow.

## Consequences

- This checkout is not a complete clean-install/release-ready delivery.
- CI may expose build issues in a network-enabled runner, but it cannot be described
  as reproducible until the lock is committed.
- The Python suite may run against an existing environment but does not prove clean
  environment installation.
- No network proxy/global configuration is changed to work around the sandbox.
