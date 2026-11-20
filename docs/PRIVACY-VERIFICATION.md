# Privacy Verification & Non-Disclosure Audit

**Date of Execution:** 2026-11-20  
**Verification Tooling:** `node scripts/verify-privacy-canary.mjs`, `node scripts/lint-boundaries.mjs`, `@psa/core` Vitest suite (31 tests), `@psa/web` SSR checks (9 checks), `apps/lab-api` Pytest suite (55 tests).  
**Overall Privacy Status:** **VERIFIED (PASS)** — Architectural decoupling and zero plaintext disclosure are rigorously enforced and backed by automated test suites.

---

## 1. Trust Domain Separation

The application strictly separates personal password tooling from the research laboratory across two disjoint domains:

```
+-------------------------------------------------------------------------------+
|                             CLIENT BROWSER PROCESS                            |
|                                                                               |
|  [ PERSONAL PASSWORD TOOLS ] (Primary Domain)                                 |
|  - Password Generator (CSPRNG rejection sampling)                             |
|  - Password Analyzer (zxcvbn-ts client evaluation)                            |
|  - Policy Checker (NIST SP 800-63B-4 evaluation)                              |
|  - Reuse Laboratory (In-memory similarity calculation)                        |
|  - Local Blocklist (Bundled 1,000 common passwords)                           |
|  - Opt-In Breach Check (HIBP range API via k-anonymity; 5 hex chars only)     |
|                                                                               |
|  Zero Server Transmission | Zero Storage Persistence | Zero Telemetry         |
+-------------------------------------------------------------------------------+
                                      ||
                             AIR-GAPPED INTERFACE
                       (No Personal Password Transmission)
                                      ||
+-------------------------------------------------------------------------------+
|                       LOOPBACK RESEARCH LAB (127.0.0.1:8000)                  |
|                                                                               |
|  [ RESEARCH LABORATORY API ] (Secondary Synthetic Domain)                     |
|  - Operates STRICTLY on server-owned synthetic fixtures                       |
|    (fixture-alpha-baseline, fixture-beta-structured, fixture-gamma-compact)   |
|  - Endpoints REJECT any payload containing 'password' with HTTP 422           |
|  - Verification tests candidate variants: 'correct', 'wrong', 'modified'      |
|  - Bounded attack simulations against fixed synthetic targets                 |
|  - Reproducible cryptographic latency & memory benchmarks                     |
+-------------------------------------------------------------------------------+
```

---

## 2. Privacy Canary Verification Results

The automated script `scripts/verify-privacy-canary.mjs` was executed against compiled release artifacts using an active network interceptor and distinct canary token (`CANARY-SECRET-UNIQUE-TOKEN-9876543210-TEST`):

| Test Case | Scope | Verified Invariant | Status | Evidence |
|---|---|---|---|---|
| **Canary 1** | `analyzePassword()` | Canary string is never present in serialized outputs, findings, or suggestions | **PASS** | `assert(!serialized.includes(canary))` |
| **Canary 2** | `evaluatePolicy()` | Canary string is omitted from all policy evaluations across all profiles | **PASS** | Tested 4 profiles; 0 disclosures |
| **Canary 3** | `analyzeReuse()` | Canary string is never returned in similarity pair indices or explanation strings | **PASS** | Only pair index labels returned |
| **Canary 4** | `checkLocalBlocklist()` | Canary string is not echoed in blocklist match/miss messages | **PASS** | Message returns static guidance |
| **Canary 5** | `generatePassword()` | Values are generated via Web Crypto CSPRNG with zero network calls | **PASS** | 0 network requests recorded |
| **Canary 6** | `checkExposureHibp()` (Unconsented) | Gated fail-closed; makes ZERO network requests when consent is false | **PASS** | Returns `not_checked` immediately |
| **Canary 7** | `checkExposureHibp()` (Consented) | Transmits strictly 5 uppercase hex characters with padding over HTTPS | **PASS** | URL: `.../range/[0-9A-F]{5}`, 0 canary tokens |

---

## 3. Boundary & Persistence Protections

1. **Source Code Static Boundary Lint:**
   - Script: `scripts/lint-boundaries.mjs`
   - Verified 11 core source files and 14 web files.
   - Enforces that `@psa/core` contains zero access to `XMLHttpRequest`, `localStorage`, `sessionStorage`, `indexedDB`, or `sendBeacon`.
   - Excludes dictionary word `"fetch"` in the EFF wordlist and the explicit opt-in client in `exposure/hibp.ts`.
2. **Storage Constraints:**
   - Web application source allows `localStorage` ONLY for the user appearance key (`psl-theme`).
   - Any attempt to persist password, candidate, verifier, or generated tokens in browser storage fails boundary lint.
3. **HTTP API Safeguards:**
   - Pydantic models in `apps/lab-api` use `extra="forbid"`.
   - Submitting `{"password": "..."}` to `/lab/hash` or `/lab/verify` is rejected with `HTTP 422 Unprocessable Entity`.
   - Verification requests accept only `candidate_variant: "correct" | "wrong" | "modified"`.
   - Server-side access logs are disabled to prevent query-string or header leakage.
   - Response security headers enforced:
     - `Content-Security-Policy: default-src 'self'`
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: no-referrer`
