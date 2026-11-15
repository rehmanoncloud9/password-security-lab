# Password Security Analyzer
## Master Product Requirements Document (PRD)

**Product codename:** Password Security Analyzer (PSA)  
**Repository recommendation:** `password-security-lab`  
**Document version:** 2.0  
**Status:** Product baseline for implementation planning  
**Audience:** Product, engineering, security reviewers, course evaluators, future maintainers

---

## 1. Executive summary

Password Security Analyzer is a privacy-first password-security assessment and education platform. It combines:

1. **Passphrase assessment:** a browser-local, pattern-aware assessment that explains likely guessability and provides actionable improvements.
2. **Password policy evaluation:** independent, configurable policy checks grounded in current guidance.
3. **Exposure screening:** optional privacy-preserving checks against a public compromised-password corpus.
4. **Password-storage laboratory:** a local-only environment for understanding salts, password hashing, verification and work factors.
5. **Controlled attack experiments:** bounded dictionary and brute-force demonstrations against synthetic targets generated inside the local lab.
6. **Developer toolkit:** a framework-independent TypeScript core and optional React integration, kept separate from attack/lab capabilities.
7. **Evidence and learning:** reproducible benchmarks, explanations, test evidence and exportable reports that never contain entered secrets.

The product is not a password manager, authentication provider, vault, enterprise identity platform, or production cracking suite. It must never claim to prove that a password is uncrackable or guaranteed safe.

### Product thesis

Most password meters reduce security to length and character-class checkboxes. PSA teaches the more important distinction between **memorability, guessability, policy compliance, known exposure, and verifier-storage cost**. It makes those dimensions understandable without collecting users' real passwords.

## 2. Product vision and positioning

**Vision:** Make password security understandable, testable and privacy-preserving for everyday users, developers and cybersecurity learners.

**Positioning:** An open-source password-security assessment and learning workbench—not merely another strength meter.

**Differentiators**
- Local-first assessment with no account required.
- Pattern-aware guessability assessment rather than simplistic complexity arithmetic.
- Separate outputs for strength, policy, exposure and storage.
- A safe, reproducible lab that demonstrates password hashing and bounded offline guessing.
- A reusable SDK that does not include attack functionality.
- Transparent methods, limitations, test fixtures and benchmark provenance.

**Product promise:** Explain what the tool observed, what it inferred, what it did not check, and what the user can do next.

## 3. Problem statement

Users often choose predictable passwords, reuse secrets across services, and misunderstand what character diversity or a high numeric score means. Developers may know that passwords should be hashed but lack an intuitive way to compare salts, adaptive password hashing and offline guessing. Existing lightweight meters can reward arbitrary composition rules while missing common words, patterns, substitutions and contextual predictability.

PSA addresses this by giving users clear, separate assessments and by providing a controlled laboratory for the underlying security concepts.

## 4. Goals and non-goals

### Goals
- Assess password guessability using a documented, pattern-aware method.
- Explain the strongest reasons a candidate may be predictable.
- Evaluate configurable password policies independently from strength.
- Detect exact reuse and near-duplicates only within a short-lived, user-provided sample set.
- Offer optional breached-password screening without sending the password or full hash.
- Demonstrate secure password storage using established libraries.
- Demonstrate dictionary and brute-force concepts only against synthetic, locally generated targets under strict limits.
- Produce reproducible, honest benchmark and test evidence.
- Publish a reusable analysis core with a stable, typed API.
- Make the application accessible, understandable and maintainable.

### Non-goals
- Password storage, vaulting, autofill, account creation or authentication.
- Checking passwords against a user's real accounts.
- Monitoring clipboard, keystrokes, browser activity or other applications.
- Accepting arbitrary hash dumps, credential lists, domains or remote targets.
- Distributed cracking, GPU cracking, password spraying or credential stuffing.
- Claiming comprehensive breach coverage or certifying a password as safe.
- Building a production enterprise policy-management or identity governance suite.
- Collecting entered passwords for analytics, telemetry, training or debugging.

## 5. Users and use cases

| Persona | Need | Primary journey |
|---|---|---|
| Everyday user | Understand whether a candidate is predictable | Enter a synthetic candidate, review reasons and suggestions, clear it |
| Developer | Embed consistent feedback in a sign-up form | Import core SDK, call analysis and policy APIs, render accessible feedback |
| Cybersecurity student | Understand storage and offline guessing | Compare hash algorithms, salts, verification and bounded experiments |
| Instructor/evaluator | Verify technical correctness | Inspect methods, tests, safety controls and reproducible measurements |
| Maintainer/contributor | Extend safely | Read architecture/security docs, run tests, submit reviewed changes |

## 6. Product principles

1. **Privacy by default:** analysis is local; no secret-bearing telemetry.
2. **Explainability over vanity scores:** a score never stands alone.
3. **No arbitrary complexity theatre:** composition categories are descriptive, not mandatory modern policy rules.
4. **Separation of concerns:** assessment SDK is not the lab or attack engine.
5. **Safe demonstrations:** synthetic targets only, localhost only, bounded jobs.
6. **Honest uncertainty:** estimates and unavailable checks are explicit.
7. **Accessibility as a requirement:** no color-only meaning; keyboard and screen-reader support.
8. **Reproducibility:** measured results include environment and parameter details.
9. **Secure defaults:** use mature cryptographic libraries; never invent cryptography.
10. **Small trusted surface:** no accounts, backend, or persistence unless a documented need emerges.

## 7. Product information architecture

### Primary application areas
- **Analyze:** password field, visibility toggle, live local feedback, explanation and suggestions.
- **Policy:** selected preset, individual checks, compliant/non-compliant/not-checked states.
- **Exposure:** optional breach lookup, clear privacy explanation, found/not-found/unavailable states.
- **Reuse Lab:** short-lived sample set, exact duplicate and similarity warnings.
- **Storage Lab:** hashing, salt demonstration, verification and algorithm comparison.
- **Attack Lab:** synthetic target selection, dictionary/brute-force configuration, bounded run, cancellation.
- **Results & Learning:** benchmark results, methodology, limitations, glossary and references.

### UX rules
- Clearly label all inputs as examples; warn users not to enter a password they currently use.
- Keep the password field masked by default.
- Provide an explicit clear/reset action.
- Do not persist secret input in localStorage, cookies, URL parameters, analytics, crash reports or exports.
- Never display a password in result summaries, screenshots, reports or logs.
- Explain each result in plain language and offer a technical detail view.
- Make unavailable external checks visibly different from a negative result.

## 8. Functional requirements

### FR-01 — Local password analysis (P0)
- Analyze input in the browser without a network request.
- Support spaces, Unicode and long passphrases; do not silently trim or truncate.
- Enforce a documented resource ceiling and return a clear validation state if exceeded.
- Detect common passwords, dictionary components, repeated runs, sequences, keyboard walks, predictable suffixes and common substitutions where supported by the selected estimator.
- Use a maintained pattern-aware estimator (e.g. zxcvbn-compatible approach) rather than treating `length × log2(charset)` as realistic guessability.
- Return structured findings, an estimate/qualitative band, and prioritized suggestions.
- Do not expose the entered password in the returned result object.

### FR-02 — Strength/guessability interpretation (P0)
- Treat the numeric score as a product presentation layer, not a cryptographic measurement.
- Provide a qualitative band and explain the top drivers.
- Do not show exact crack-time claims unless assumptions, attacker model and calculation are disclosed.
- Distinguish theoretical entropy from empirical/pattern-aware guessability.
- Avoid suggesting that adding one symbol necessarily makes a password strong.

### FR-03 — Policy evaluation (P0)
- Evaluate policy separately from strength.
- Include a modern NIST-aligned preset and an explicitly educational legacy complexity preset.
- Modern preset must not require uppercase/lowercase/digit/symbol mixtures.
- Support policy configuration for minimum length and blocklist behavior.
- Show each rule and state: pass, fail, not checked, or unavailable.
- Clearly label that policy settings are a reference profile, not legal/compliance certification.

### FR-04 — Exposure screening (P1; optional extension)
- Implement Pwned Passwords range lookup only after local SHA-1 computation.
- Send only the first five hexadecimal characters of the hash; compare returned suffixes locally.
- Never send the password or complete hash.
- Use TLS, a fixed trusted endpoint, timeout, response-size cap and clear user opt-in.
- Distinguish `found`, `not_found_in_dataset`, `unavailable`, and `not_checked`.
- Explain that SHA-1 is used only as a lookup identifier in this protocol, not for password storage.
- Do not imply that absence from this dataset means the password has never been exposed.

### FR-05 — Sample-set reuse lab (P0)
- Accept a small, bounded list of synthetic examples.
- Detect exact duplicates and clearly explain heuristic similarity findings.
- Keep all values in memory only and clear them on reset/navigation/session end.
- Do not claim to detect reuse across unrelated accounts or external services.

### FR-06 — Password storage laboratory (P0)
- Demonstrate SHA-256 as an intentionally unsafe fast-hash baseline only.
- Demonstrate Argon2id, bcrypt and PBKDF2-HMAC-SHA256 using established libraries.
- Generate independent cryptographically random salts where applicable.
- Support verify-success and verify-failure demonstrations.
- Show algorithm parameters, salt metadata and measured operation time.
- Explain that salts are not secret and are stored with the verifier.
- Handle bcrypt's byte-length behavior explicitly; never silently truncate.
- No custom cryptographic algorithms.

### FR-07 — Controlled attack simulator (P0)
- Use only bundled synthetic targets or targets generated in the lab session.
- Never accept arbitrary external hashes, credential files, domains or remote targets.
- Bind to localhost by default; no public network exposure.
- One active job initially; configurable hard ceilings for duration, attempts, wordlist size, input length and memory.
- Provide cancellation and automatic cleanup.
- Report `recovered`, `not_found_within_budget`, `cancelled`, `time_limit`, `attempt_limit`, and `error` distinctly.
- Display actual attempts and elapsed time; never claim unexecuted guesses were attempted.
- A capped or timed-out run is inconclusive, not proof of strength.

### FR-08 — Results and reproducibility (P0)
- Show algorithm, parameters, runtime environment, sample size, repetitions and statistic.
- Separate measured values from extrapolations.
- Do not ship invented benchmark values.
- Export only non-secret configuration and results; omit sample passwords and target plaintext.
- Include a limitations statement with each benchmark export.

### FR-09 — Developer SDK (P1)
- Publish a framework-independent TypeScript core.
- Provide stable typed contracts for analysis and policy evaluation.
- Keep all lab, hash-generation and attack functions out of the SDK.
- Provide an optional React adapter and minimal integration example.
- Document privacy responsibilities for integrators, including avoiding telemetry of password values.

### FR-10 — Education and accessibility (P0)
- Provide concise explanations for entropy, guessability, salts, password hashing, offline attacks and blocklists.
- Support keyboard-only navigation, visible focus, labels, screen-reader announcements and reduced motion.
- Do not rely on color alone; meet WCAG 2.2 AA as the target.
- Ensure contrast and text scaling are usable.

## 9. Non-functional requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| NFR-01 | Privacy | Network inspection shows no password sent during local analysis |
| NFR-02 | Secret hygiene | Tests verify no password in logs, exports, URLs or result objects |
| NFR-03 | Responsiveness | Analysis does not block typing; benchmark targets documented on supported hardware |
| NFR-04 | Resource safety | Input and lab job limits are enforced server-side and client-side |
| NFR-05 | Reliability | Deterministic tests cover core functions and failure states |
| NFR-06 | Maintainability | Typed boundaries, modular packages, documented setup and CI |
| NFR-07 | Accessibility | Keyboard and screen-reader smoke tests; WCAG 2.2 AA audit target |
| NFR-08 | Portability | Clean setup on documented OS/runtime matrix |
| NFR-09 | Observability | Operational errors may be logged only after secret scrubbing; default telemetry off |
| NFR-10 | Integrity | Dependencies pinned/locked; automated dependency and static checks |

## 10. System architecture

### Logical components
1. **Web client (React/TypeScript):** UI, local analysis, policy evaluation and user education.
2. **Core analysis package:** pure functions, pattern-aware estimator adapter, findings and policy contracts.
3. **Local lab API (Python/FastAPI):** isolated hashing, verification, bounded attack jobs and benchmark execution.
4. **Static data assets:** versioned common-password and demonstration wordlists with provenance, license and update process.
5. **Test and evidence layer:** unit, integration, security, accessibility and reproducibility suites.

### Trust boundaries
- User input → browser analysis: sensitive data; no network egress.
- Browser → local lab API: synthetic demo data only; localhost and strict schema.
- Optional exposure service → HIBP: hash prefix only; explicit opt-in.
- Build/release pipeline → package registry: signed/tagged artifacts where feasible; no secrets in CI logs.

### Critical separation
The public-facing analysis SDK must not import or depend on the Python lab service. The attack simulator is a teaching environment, not a production feature or public API.

## 11. Data handling and retention

| Data | Processing | Persistence |
|---|---|---|
| Analyzer input | Browser memory | None |
| Analysis result | Browser memory; excludes original input | None by default |
| Reuse sample set | Browser memory | None; clear on reset |
| Lab synthetic target | Local lab process memory | None |
| Hash demonstration output | Local UI/session | Export only if user explicitly exports, and never with plaintext |
| HIBP hash prefix | Sent only after opt-in | No local persistence |
| Diagnostics | Sanitized operational metadata | Optional, short retention; default off |

## 12. Security and privacy requirements

- Never collect real credentials; prominently instruct users to use synthetic examples.
- Never log, persist or transmit plaintext passwords.
- Do not include passwords in exception messages, stack traces, analytics, crash dumps, URLs or clipboard by default.
- Use mature cryptographic libraries and OS-backed secure randomness.
- Validate all API inputs; impose maximum lengths and request sizes.
- Keep lab service bound to loopback; reject non-loopback Host/Origin requests where applicable.
- Apply per-job deadlines, attempt caps, concurrency caps and cleanup.
- Use dependency pinning, vulnerability scanning and static analysis.
- Document the local-machine compromise limitation.
- Avoid claims such as “unhackable”, “uncrackable” or “100% secure”.

## 13. Threat model summary

| Threat | Example | Primary controls |
|---|---|---|
| Information disclosure | Password appears in telemetry or logs | No secret telemetry, redaction tests, no persistence |
| Tampering | Malicious request changes lab settings | Schema validation, fixed algorithm allowlist, server-side caps |
| Denial of service | Huge input or many attack jobs | Input ceiling, one active job, time/memory/attempt caps |
| Unauthorized exposure | Lab API reachable on LAN | Bind localhost, host/origin validation, no remote target API |
| Supply-chain compromise | Vulnerable or malicious dependency | Lockfiles, audit tools, minimal dependencies, review |
| Misleading output | User interprets timeout as safe | Explicit inconclusive states and methodology labels |
| Dataset misuse | Common-password corpus has unclear origin/license | Provenance, licensing, versioning, update review |
| UI leakage | Password exposed in DOM snapshots or exports | Masked input, no secret rendering outside field, export tests |

## 14. Acceptance criteria

The semester-grade baseline is complete only when:
- A clean clone runs the web client and local lab with documented commands.
- All P0 journeys work without production credentials or external services.
- Local analyzer requests produce no network traffic containing the entered value.
- The analyzer explains patterns and does not use composition-only scoring.
- Policy, strength and exposure statuses are separate.
- Hashing demonstrations use correct salts and verification.
- Attack experiments use synthetic targets and enforce all configured limits.
- Timed-out/cancelled experiments are not misreported as successful or exhaustive.
- Benchmark reports contain actual measurements and environment metadata.
- Automated tests cover core behavior, security controls and failure paths.
- No secret appears in logs, exports, URLs or telemetry.
- Team members can explain the design and limitations.

## 15. Success metrics

### Product quality
- 100% of P0 acceptance tests pass in CI.
- Zero plaintext password values in logs, analytics, URLs or exported reports in regression tests.
- Zero network egress from local analysis path in automated browser tests.
- 100% of attack jobs terminate within enforced time and attempt budgets.
- All benchmark claims trace to raw measurements and recorded environment.

### Usability and education
- At least 80% of test participants correctly identify the top weakness after reviewing feedback.
- At least 80% distinguish a policy failure from a weak guessability assessment.
- At least 80% understand that a timeout is inconclusive.
- No critical keyboard-navigation blockers in the primary flows.

These are proposed evaluation targets, not claims about achieved performance.

## 16. Roadmap

### Phase 0 — Product and engineering foundation
- Confirm architecture, interfaces, threat model and data boundaries.
- Create repo, CI, lint/typecheck/test setup and dependency policy.
- Agree on synthetic-only lab fixtures.

**Exit gate:** clean environment and architecture decisions documented.

### Phase 1 — Trustworthy core
- Implement pattern-aware analyzer adapter and result contract.
- Implement policy presets independently.
- Build local-first analyzer UI and reuse lab.
- Add privacy regression tests and accessibility baseline.

**Exit gate:** analyzer/policy/reuse tests pass; no network leakage.

### Phase 2 — Security laboratory
- Implement Argon2id, bcrypt, PBKDF2 and SHA-256 baseline.
- Implement verification and salt demonstrations.
- Implement bounded dictionary and brute-force experiments.
- Add cancellation, cleanup, caps and safety tests.

**Exit gate:** all lab scenarios terminate safely and produce truthful outcomes.

### Phase 3 — Evidence and product polish
- Add reproducible benchmark harness and Results screen.
- Add learning content, report export without secrets, accessibility review.
- Run clean-install and user-acceptance tests.

**Exit gate:** evidence package complete; no fabricated benchmark claims.

### Phase 4 — Open-source readiness
- Harden docs, contribution process, issue templates, license and release checklist.
- Add SDK integration example and package build.
- Optional HIBP integration only after privacy review.
- Publish first tagged release only after security checklist passes.

**Exit gate:** maintainers can reproduce build, tests and release from a clean clone.

### Later research (not promised)
- Additional policy profiles, localization, broader accessibility validation, more nuanced similarity analysis, optional integrations and research-grade evaluation. No password vault or real-account attack features.

## 17. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Scope exceeds semester capacity | Incomplete core | P0 exit gates; defer SDK publishing and HIBP |
| Weak estimator produces false confidence | User harm | Use maintained estimator, explain limits, validate test corpus |
| Attack lab becomes dual-use | Misuse | Synthetic targets only, no arbitrary hash/target input, strict local caps |
| Team overstates benchmarks | Incorrect conclusions | Raw measurements, environment metadata, no extrapolation presented as fact |
| External dataset license unclear | Legal/reputation | Track source, license and update provenance; omit if uncertain |
| Privacy claim not verified | Trust failure | Browser network tests, secret-canary tests, manual review |
| UI complexity | Poor learning experience | Progressive disclosure and task-based navigation |

## 18. Open decisions (must be resolved before implementation)
- Exact maintained estimator/library and version.
- Exact common-password dataset, license, provenance and update cadence.
- Maximum accepted analyzer input length and lab payload sizes.
- Supported operating systems and browser matrix.
- Final package scope and license.
- Whether HIBP is included in the assessed release or deferred.
- Final default Argon2id parameters after benchmarking on target hardware.
- Whether PDF export is essential or a non-secret JSON/Markdown export is sufficient.

## 19. Release definition

A release is not “done” because the UI looks complete. It is releasable only when requirements, tests, privacy checks, threat-model mitigations, documentation and reproducibility evidence agree with the actual implementation. Every advertised feature must be implemented, tested and accurately described.
