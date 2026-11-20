# Security Audit & Cryptographic Verification Report

**Audit Date:** 2026-11-20  
**Scope:** `@psa/core`, `@psa/web`, `apps/lab-api`, `research/`, and project build tooling.  
**Auditor Classification:** Automated & Architectural Static/Dynamic Security Verification.  
**Overall Posture:** **HARDENED & RELEASE CANDIDATE READY**

---

## 1. Executive Summary

The Password Security Laboratory codebase has been comprehensively overhauled to establish a rigorous, local-first Personal Password Tools experience alongside a decoupled, synthetic-only Information Security Research Laboratory.

All high- and critical-severity vulnerabilities identified in legacy baseline dependencies have been resolved. Automated test suites across TypeScript and Python run cleanly with 100% pass rates. Strict trust boundaries ensure personal passwords entered for client analysis or generation are never transmitted over the network or persisted in storage.

---

## 2. Test Execution & Verification Matrix

| Verification Target | Command Executed | Outcome | Details / Metrics |
|---|---|---|---|
| **Core Unit Suite** | `npm test --workspace @psa/core` | **31 / 31 PASSED** | Generator rejection sampling, pure zxcvbn estimator, NIST policy rules, local blocklist, HIBP client |
| **Workspace Typecheck** | `npm run typecheck` | **PASSED (0 errors)** | Strict TypeScript across `@psa/core`, `@psa/web`, `@psa/example-consumer` |
| **Boundary & Contrast Lint** | `npm run lint` | **PASSED (0 errors)** | Static boundary check (11 core, 14 web files) + 4.5:1 WCAG AA semantic contrast |
| **Web Runtime SSR Checks** | `npm test --workspace @psa/web` | **9 / 9 PASSED** | React SSR rendering of destinations, themes, synthetic candidate evaluations |
| **Production Build** | `npm run build` | **PASSED (Code 0)** | Full production build via `vite build` producing optimized client bundles |
| **Privacy Canary Suite** | `node scripts/verify-privacy-canary.mjs` | **7 / 7 PASSED** | Verified zero plaintext secret disclosure in serialized outputs, zero unauthorized fetches, verified k-anonymity |
| **Python Lab API Suite** | `pytest apps/lab-api` | **55 / 55 PASSED** | FIPS 180-4 SHA-256 KATs, RFC 6070 PBKDF2 KATs, Argon2id parameter bounds, bcrypt 72B boundary, synthetic fixtures |
| **Python Linter & Formatter** | `ruff check apps/lab-api` | **PASSED (0 errors)** | Strict linting rules with 0 violations |
| **Dependency Security Audit** | `npm audit` | **0 vulnerabilities** | Clean npm registry audit |

---

## 3. Cryptographic Implementation & Conformance

### 3.1 Known-Answer Tests (KATs)
- **SHA-256:** Verified against NIST FIPS 180-4 test vectors (`"abc"`, `""`, and multi-block vectors).
- **PBKDF2-HMAC-SHA256:** Verified against RFC 6070 published test vectors ($c=1, 2, 4096$).
- **Argon2id:** Verified conformance with RFC 9106 parameter bounds ($m \ge 19\text{ MiB}, t \ge 2, p \ge 1$). Non-default parameters are verified cleanly by `argon2-cffi` without hasher re-initialization.
- **bcrypt:** Enforces strict 72-byte UTF-8 boundary checking (longer inputs are rejected with descriptive errors, never truncated).

### 3.2 Password Generation Entropy
- Implements unbiased CSPRNG rejection sampling using `crypto.getRandomValues`.
- Eliminates modulo bias ($256 \pmod{|\Sigma|}$ and $65536 \pmod{7776}$).
- Calculates exact theoretical selection entropy:
  $$\text{Random: } H = L \cdot \log_2(|\Sigma|)$$
  $$\text{Passphrase: } H = W \cdot \log_2(7776) \approx W \cdot 12.9248\text{ bits}$$
- Fail-closed if CSPRNG is unavailable in host environment.

---

## 4. Remediation of Audit Findings

| ID | Initial Severity | Description | Final Status | Verification Evidence |
|---|---|---|---|---|
| **SA-01** | High | Vite 7.2.2 security advisories | **RESOLVED** | Upgraded to Vite 7.3.8; `npm audit` reports 0 findings |
| **SA-02** | High | Vitest & `@vitest/mocker` 4.0.8 advisories | **RESOLVED** | Upgraded to Vitest 4.1.12; `npm audit` reports 0 findings |
| **SA-03** | Medium | Browser privacy canary not automated | **RESOLVED** | Created `scripts/verify-privacy-canary.mjs` with 7 executable assertions |
| **SA-04** | Medium | Subprocess spawning in host | **RESOLVED** | Automated builds and test suites now execute end-to-end |
| **SA-05** | Medium | Versioned PBKDF2 format | **RESOLVED** | Added `$psa$v1$pbkdf2-sha256$...` versioning with backward compatibility |
| **SA-06** | Medium | Strict API schema boundary | **RESOLVED** | Removed `password` parameter; requests submitting user passwords return HTTP 422 |
| **SA-07** | Low | Missing EFF large wordlist provenance | **RESOLVED** | Bundled standard 7,776-word EFF wordlist with verified SHA-256 checksum |
| **SA-08** | Low | Zxcvbn monkey-patching re-entrancy hazard | **RESOLVED** | Refactored to pure matcher calls without mutating global module state |

---

## 5. Residual Risks & Operational Controls

1. **Host-Level Process Memory:**
   - *Risk:* In an unprivileged shared hosting environment, other processes with root/administrator privileges could inspect process memory.
   - *Mitigation:* The application is intended for single-user local workstation use. Browser memory is ephemeral; values are cleared on tab reload or page navigation.
2. **Cooperative Cancellation of Active KDFs:**
   - *Risk:* A long-running Argon2id or high-iteration PBKDF2 calculation executing inside a C-extension cannot be forcibly interrupted mid-hash without process termination.
   - *Mitigation:* Cost parameters are strictly bounded server-side before execution ($m \le 64\text{ MiB}, t \le 4, \text{iterations} \le 1,200,000$), ensuring any single operation completes within safe time boundaries (< 500 ms).
