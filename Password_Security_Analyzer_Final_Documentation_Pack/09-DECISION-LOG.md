# Architecture Decision Log

## ADR-001 — Separate the assessment core from the security laboratory
**Status:** Accepted  
**Decision:** Keep a pure TypeScript analysis SDK separate from a local Python lab service.  
**Reason:** A website integration should not need hashing experiments or attack functionality. Separation reduces attack surface and keeps the user-facing product simpler.  
**Consequences:** Two runtimes and integration boundary to test; lab service is not imported by the SDK.

## ADR-002 — Use pattern-aware guessability, not charset entropy as the primary score
**Status:** Accepted  
**Decision:** Use a maintained pattern-aware estimator as the baseline; present entropy only as a carefully qualified educational concept.  
**Reason:** Character-set entropy assumes uniform random selection and can dramatically overstate human-chosen password strength.  
**Consequences:** Estimator choice/version and known limitations must be documented. Do not invent confidence values.

## ADR-003 — Keep policy separate from strength
**Status:** Accepted  
**Decision:** Report policy compliance independently from guessability and exposure.  
**Reason:** A password can meet a policy and still be predictable; a strong passphrase may not meet a legacy composition rule.  
**Consequences:** UI and result types need independent statuses.

## ADR-004 — Synthetic-only attack lab
**Status:** Accepted  
**Decision:** Generate targets internally from synthetic fixtures; do not accept arbitrary hashes, accounts or remote targets.  
**Reason:** The educational objective does not require real target capability.  
**Consequences:** Lab has strict limits, localhost binding, cancellation and cleanup.

## ADR-005 — No persistence by default
**Status:** Accepted  
**Decision:** No account, database, password history or server-side storage in the initial product.  
**Reason:** Persistent storage creates risk without supporting the primary learning and analysis use cases.  
**Consequences:** Session reset clears samples and lab state; exports exclude secrets.

## ADR-006 — HIBP lookup is optional and deferred behind privacy review
**Status:** Accepted  
**Decision:** If included, use the Pwned Passwords k-anonymity range protocol with explicit opt-in.  
**Reason:** Exposure screening is useful but introduces a network boundary and can be misunderstood.  
**Consequences:** Found/not-found-in-dataset/unavailable/not-checked must remain distinct.

## ADR-007 — Avoid premature public package release
**Status:** Accepted  
**Decision:** Build the package integration example before publishing to a registry.  
**Reason:** Stable public APIs require test coverage, semantic versioning, documentation and release operations.  
**Consequences:** SDK publication is P1/P2, not a P0 dependency.
