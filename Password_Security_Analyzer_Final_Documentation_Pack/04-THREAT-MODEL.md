# Threat Model

## 1. Scope and assumptions
Assets include password-like input, synthetic lab targets, generated hashes, benchmark results, local service availability and product integrity. The product assumes the user's operating system and browser are not already compromised; this limitation must be visible.

## 2. Assets
- A1: analyzer input (high confidentiality).
- A2: synthetic target/candidate values (confidential within demo session).
- A3: generated password hashes and salts (integrity/confidentiality appropriate to demo).
- A4: policy and analysis results (integrity).
- A5: dataset assets and estimator versions (integrity/provenance).
- A6: local lab process and job state (availability/integrity).
- A7: build artifacts and release pipeline (integrity).

## 3. Trust boundaries
- TB1: user/browser input to core analysis.
- TB2: browser UI to local lab API.
- TB3: optional browser to external Pwned Passwords endpoint.
- TB4: repository/dependency supply chain to build/release.
- TB5: export from application to user-controlled file.

## 4. Threat register

| ID | STRIDE | Threat | Impact | Mitigation | Verification |
|---|---|---|---|---|---|
| T-01 | Information disclosure | Input appears in network request | Secret exposure | Local-only core; no telemetry | Network canary test |
| T-02 | Information disclosure | Input leaks through logs/errors | Secret exposure | No request-body logs; safe errors | Log-scrubbing tests |
| T-03 | Information disclosure | Report contains target/password | Secret disclosure | Allowlisted export schema | Export secret scan |
| T-04 | Tampering | API caller requests extreme hash cost | Resource exhaustion | Server-side parameter allowlist/ranges | Boundary tests |
| T-05 | DoS | Oversized input or wordlist | CPU/memory exhaustion | Size caps and deadlines | Fuzz and load tests |
| T-06 | DoS | Many concurrent jobs | Resource exhaustion | Single active job and queue rejection | Concurrency test |
| T-07 | Spoofing | Remote site reaches local API | Local service abuse | Loopback bind, origin/host checks | Remote-origin test |
| T-08 | Tampering | Arbitrary hash target submitted | Dual-use misuse | No arbitrary hash import endpoint | API contract tests |
| T-09 | Repudiation | Benchmark provenance missing | Invalid conclusions | Record environment and parameters | Report schema test |
| T-10 | Information disclosure | HIBP sends full hash/password | Privacy breach | Prefix-only protocol | Mock transport inspection |
| T-11 | Elevation of privilege | Dependency vulnerability | Code execution/compromise | Pin, audit, update and review | CI audit |
| T-12 | Tampering | Dataset silently replaced | Incorrect detection | Version, checksum and provenance | Dataset integrity test |
| T-13 | Spoofing | Fake release artifact | User installs malicious build | Tagged releases, checksums/signing where feasible | Release checklist |
| T-14 | Information disclosure | Browser extension or malware reads input | Secret exposure | Explicit limitation; no false promise | User-facing notice |

## 5. Abuse cases and security invariants
- The lab must never accept a real account, remote endpoint or arbitrary imported hash.
- The browser analyzer must work when the network is disabled.
- No secret-bearing value may appear in telemetry or exported artifacts.
- Every lab job must stop within hard limits.
- A negative breach lookup must not be described as proof of safety.
- An incomplete attack must not be reported as “not crackable”.
- A policy pass must not be described as a strong password.

## 6. Residual risks
The local machine can be compromised; third-party dependencies can contain vulnerabilities; public breach datasets can be incomplete; heuristic similarity can produce false positives; and password strength is contextual. These residual risks are documented, not hidden behind a numeric score.

## 7. Review cadence
Review this threat model before adding external services, persistence, browser extensions, remote hosting, new lab endpoints, or major cryptographic changes. Re-run the security test suite for every change to a trust boundary.
