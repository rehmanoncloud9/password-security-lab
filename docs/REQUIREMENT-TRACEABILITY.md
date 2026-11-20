# Requirement Traceability Matrix

**Specification:** `PASSWORD-SECURITY-LAB-AGENT-IMPLEMENTATION-PLAN.md`  
**Last Updated:** 2026-11-20  
**Overall Status:** **ALL PHASES (P0 THROUGH P10) VERIFIED & COMPLETE**

| Phase & Req ID | Description | Source / Standard | Implementation Module(s) | Status | Test Suites / Evidence | Acceptance Verification |
|---|---|---|---|---|---|---|
| **Phase 0: Reconnaissance** | | | | | | |
| P0-REQ-01 | Baseline inspection & zero regressions | Plan § Phase 0 | Root manifests, git tracking | **VERIFIED** | Baseline logs: 55 Pytest, 31 Vitest, 9 SSR, 0 npm vuln | Baseline execution verified without regression |
| P0-REQ-02 | Product boundary & documentation freeze | Plan § 0–5 | `docs/PHASE-0-BASELINE-REPORT.md`, `docs/THREAT-MODEL.md` | **VERIFIED** | Dual-domain boundary diagram & threat model | Traceability & architecture diagrams established |
| **Phase 1: Password Generator** | | | | | | |
| P1-REQ-01 | Web Crypto CSPRNG & rejection sampling | Plan § 1.2, 4.1 | `packages/core/src/generate.ts` | **VERIFIED** | `packages/core/test/core.test.ts` (31 tests) | Unbiased sampling ($256 \pmod{|\Sigma|}$, $65536 \pmod{7776}$), fail-closed |
| P1-REQ-02 | Configurable length (8–128), default 20 | Plan § 1.2, § Phase 1 | `packages/core/src/generate.ts`, UI | **VERIFIED** | Range & boundary tests in Vitest & web SSR | No forced character-class composition |
| P1-REQ-03 | Sourced passphrase list (7,776 words) & selection entropy | Plan § 1.2, RFC/EFF | `packages/core/src/generate.ts`, `wordlist.ts` | **VERIFIED** | EFF wordlist SHA-256 verified; theoretical entropy formulas | Documented provenance (CC-BY-3.0), exact entropy formula |
| P1-REQ-04 | User-initiated copy & clear (no auto-copy) | Plan § 1.1, 3.2 | `apps/web/src/features/AnalysisLaboratory.tsx` | **VERIFIED** | UI runtime check passed | Explicit button interaction; clipboard message feedback |
| P1-REQ-05 | In-memory local analysis action (no storage/network) | Plan § 1.1, 5.2 | Generator UI & core | **VERIFIED** | `scripts/verify-privacy-canary.mjs`, boundary lint | Ephemeral state, send to analysis callback |
| **Phase 2: Analyzer & Policy Engine** | | | | | | |
| P2-REQ-01 | zxcvbn-ts estimator without shared mutable state | Plan § 1.3, 4.8 | `packages/core/src/estimator.ts`, `analyze.ts` | **VERIFIED** | Vitest concurrent call tests | Pure matcher function without monkey-patching |
| P2-REQ-02 | Unicode code points counting & limit handling | NIST SP 800-63B-4 | `packages/core/src/analyze.ts` | **VERIFIED** | Astral emoji & multi-byte code point tests | Code point counts (`Array.from`), max 256 code points limit |
| P2-REQ-03 | NIST SP 800-63B-4 single-factor (15 chars) profile | NIST SP 800-63B-4 §3.1.1 | `packages/core/src/policy.ts` | **VERIFIED** | Policy unit tests in Vitest | Minimum 15, no composition rules, versioned standard |
| P2-REQ-04 | NIST SP 800-63B-4 MFA-only (8 chars) profile | NIST SP 800-63B-4 §3.1.1 | `packages/core/src/policy.ts` | **VERIFIED** | Policy unit tests in Vitest | Permitted minimum 8, explicitly labelled MFA-only |
| P2-REQ-05 | Educational legacy composition & custom policies | Plan § 3.4 | `packages/core/src/policy.ts` | **VERIFIED** | Policy unit tests in Vitest | Marked educational legacy / service compatibility |
| P2-REQ-06 | Secret-free serialized analysis results | Plan § 1.1, 5.2 | `packages/core/src/analyze.ts`, `types.ts` | **VERIFIED** | `scripts/verify-privacy-canary.mjs` | Plaintext candidate omitted from result serialization |
| **Phase 3: Local Blocklist, Exposure & Reuse** | | | | | | |
| P3-REQ-01 | Bundled local common-password blocklist | Plan § 3.6 | `packages/core/src/blocklist/` | **VERIFIED** | Blocklist unit tests in Vitest | 1,000 common passwords, SHA-256 checksum verified, offline |
| P3-REQ-02 | Optional consented HIBP k-anonymity range check | Plan § 3.6, HIBP API v3 | `packages/core/src/exposure/`, Web UI | **VERIFIED** | `scripts/verify-privacy-canary.mjs`, unit tests | 5-hex prefix only, Add-Padding: true, explicit consent |
| P3-REQ-03 | In-memory reuse comparison (indices only) | Plan § 1.1, 3.5 | `packages/core/src/reuse.ts` | **VERIFIED** | Vitest reuse tests, runtime SSR check | Levenshtein similarity, zero plaintext in results |
| **Phase 4: Personal Tools / Research Boundary** | | | | | | |
| P4-REQ-01 | Complete decoupling of Personal Tools from API | Plan § 0, 5.1 | `apps/web/src/` | **VERIFIED** | Boundary lint, offline runtime test | Personal tools operate with backend offline |
| P4-REQ-02 | Research Lab API: no free-form passwords | Plan § 1.4, 8 | `apps/lab-api/app/schemas.py`, `main.py` | **VERIFIED** | `test_api.py` in Pytest suite | Free-form `password` field rejected with HTTP 422 |
| P4-REQ-03 | Loopback-only binding, strict CORS & host validation | Plan § 5.3, 8 | `apps/lab-api/app/main.py` | **VERIFIED** | `test_api.py` adversarial requests | 127.0.0.1 binding, TrustedHost, security headers |
| **Phase 5: Cryptographic Correctness** | | | | | | |
| P5-REQ-01 | Argon2id, bcrypt, PBKDF2, SHA-256 conformance | OWASP, RFC 9106, RFC 6070 | `apps/lab-api/app/crypto.py` | **VERIFIED** | NIST FIPS 180-4, RFC 6070, RFC 9106 KATs | All published test vectors pass |
| P5-REQ-02 | Non-default Argon2 parameter verification | RFC 9106, argon2-cffi | `apps/lab-api/app/crypto.py` | **VERIFIED** | `test_crypto.py` non-default cost tests | Verified across memory (19–64 MiB), time (2–4), threads |
| P5-REQ-03 | Strict verifier parsing & cost ceilings | Plan § 5 | `apps/lab-api/app/crypto.py` | **VERIFIED** | `test_crypto.py` malformed tests | Reject out-of-bound / malformed verifiers; bcrypt 72B check |
| **Phase 6: Attack Simulation Engine** | | | | | | |
| P6-REQ-01 | Bounded synthetic strategies (6 types) | Plan § 6 | `apps/lab-api/app/attacks.py` | **VERIFIED** | `test_attacks.py` in Pytest suite | Dictionary, bruteforce, pattern, suffix, substitution, word |
| P6-REQ-02 | Synthetic-only targets, secret-free job outputs | Plan § 1.4, 6 | `apps/lab-api/app/attacks.py` | **VERIFIED** | `test_attacks.py` secret-free checks | No candidate strings or target plaintext in output |
| P6-REQ-03 | Honest attempt accounting & termination reasons | Plan § 6 | `apps/lab-api/app/attacks.py` | **VERIFIED** | `test_attacks.py` accounting checks | Exact attempts, censored/inconclusive stop states |
| **Phase 7: Benchmarking & Statistics** | | | | | | |
| P7-REQ-01 | Configurable repetitions, warm-ups, raw timing | Plan § 7 | `apps/lab-api/app/benchmark.py` | **VERIFIED** | `test_api.py` benchmark endpoint tests | 3–20 repetitions, wall & CPU time, both verify paths |
| P7-REQ-02 | Statistical reporting (median, IQR, std dev) | Plan § 7 | `apps/lab-api/app/benchmark.py` | **VERIFIED** | `test_api.py` statistics assertions | High-precision timing, RSS memory delta, SHA-256 checksum |
| P7-REQ-03 | Sanitized benchmark manifest & export | Plan § 7 | `apps/lab-api/app/benchmark.py` | **VERIFIED** | API schema assertions | System environment metadata, zero secrets |
| **Phase 8: Multilingual & Estimator Study** | | | | | | |
| P8-REQ-01 | Synthetic research populations & Roman Urdu | Plan § 8 | `research/datasets/manifests/` | **VERIFIED** | Manifest JSON files generated | 1,000 structured English, 500 Roman Urdu tokens |
| P8-REQ-02 | Rank correlation & calibration analysis | Plan § 8 | `research/results/sanitized/` | **VERIFIED** | `generate_and_evaluate.py` execution | Spearman correlation (0.999 English, 0.995 Roman Urdu) |
| **Phase 9: Workstation UX & Accessibility** | | | | | | |
| P9-REQ-01 | Personal Password Tools default landing experience | Plan § 3.1, 9 | `apps/web/src/App.tsx`, nav | **VERIFIED** | `test/runtime-check.mjs` | Generator & Analyzer primary, initial page: generator |
| P9-REQ-02 | Clear privacy indicators & offline status | Plan § 9 | `apps/web/src/components/` | **VERIFIED** | Web SSR render checks | Local-only badges, Research Lab synthetic banner |
| P9-REQ-03 | Accessible, responsive, high-contrast UI | WCAG 2.1 AA | `apps/web/src/styles.css` | **VERIFIED** | `scripts/check-contrast.mjs` | Semantic markup, keyboard shortcuts, AA contrast tokens |
| **Phase 10: Security Assurance & Release Readiness** | | | | | | |
| P10-REQ-01 | Privacy canary test (zero storage/network leak) | Plan § 10 | `scripts/verify-privacy-canary.mjs` | **VERIFIED** | Automated canary test script (7/7 passed) | Plaintext never disclosed in outputs/storage/logs/requests |
| P10-REQ-02 | Adversarial network & CORS tests | Plan § 10 | `apps/lab-api/tests/test_api.py` | **VERIFIED** | Security header & origin rejection tests | Rejects hostile origins, CSP, nosniff, frame-options |
| P10-REQ-03 | SBOM generation & release documentation | Plan § 10 | `docs/SBOM.md`, Audit reports | **VERIFIED** | `docs/SBOM.md` published | Complete dependency & dataset provenance recorded |
