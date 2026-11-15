# Known Limitations

## Release blockers

- JavaScript dependencies cannot be installed in the supplied environment. npm is
  forced into cache-only mode (`NPM_CONFIG_OFFLINE=true`); an environment-scoped
  online attempt was refused by proxy `127.0.0.1:9`. Consequently there is no
  reviewed `package-lock.json`, no TypeScript compile/test/build, and no browser
  verification. The GitHub CI workflow may resolve dependencies on a network-enabled
  runner but uses dynamic npm resolution until a lock is committed.
- The release candidate workflow intentionally requires `package-lock.json` and
  `npm ci`, so it will stop until a reviewed lockfile is present.
- Python tests and lint were run in the existing global environment, not a clean
  project virtual environment. Python version pins are exact, but requirements files
  do not include package artifact hashes; isolated installation has not been proven.
- No end-to-end browser automation, visual screenshot comparison, keyboard-only
  browser test, screen reader check, measured color contrast audit, or responsive
  browser test was executed. The approved screenshot referenced in the prompt was
  not present as an accessible workspace file.
- GitHub CI, dependency audit, Gitleaks, and CodeQL workflows are configured but
  have not executed from this local checkout.
- The separate latest project ZIP, original PRD PDF, and Project Overview/Abstract
  PDF were not accessible in the repository workspace. Requirement reconciliation
  uses the available expanded documentation and Technical Plan.
- The project includes a draft license for repository-authored material. Ownership,
  contributor rights, and third-party notice obligations need confirmation before
  redistribution. Nothing was published or deployed.

## Product/security scope

- Pattern-aware strength output is an estimate from zxcvbn-ts and its bundled
  dictionaries/matchers. It cannot know private context or guarantee resistance.
- Policy blocklist coverage is the bundled common/English data and is not a
  comprehensive current compromise corpus. A pass means only that the implemented
  local checks found no failing condition.
- Reuse detection is an in-memory heuristic with false-positive/negative risk. It
  cannot detect cross-site reuse.
- The authored dictionary contains seven words, and other candidate plans are fixed
  and intentionally small. Attack demonstrations are educational and synthetic.
- Cancellation and timeout checks are cooperative between candidate verifications.
  A native KDF already in progress cannot be interrupted; it may finish after the
  request for cancellation or nominal budget deadline.
- API verifier/job state exists only in process memory. It is cleared on restart;
  managed-runtime strings are not guaranteed to be zeroized.
- Local CPU/memory health readings use psutil and represent the host process/system.
  There is no Docker runtime or container metric.
- Benchmarks are actual local measurements with a small repetition count; they are
  not universal rankings or attacker-rate estimates.
- HIBP exposure screening, PDF export, package publication, deployment, and Docker
  Compose are not implemented. JSON/CSV session exports contain current-session
  allowlisted result data, not plaintext input values.

These limitations are tracked in [Requirement Traceability](REQUIREMENT-TRACEABILITY.md),
[Security Audit](SECURITY-AUDIT.md), and [Implementation Status](../IMPLEMENTATION-STATUS.md).
