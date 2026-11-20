# Research Proposal: Reproducible Evaluation of Pattern-Aware Password Strength Estimators Under Structured and Multilingual Guessing Models

**Document version:** 1.0.0  
**Date:** 2026-11-20  
**Project:** Password Security Laboratory (`rehmanoncloud9/password-security-lab`)  
**Domain:** Information Security / Empirical Cryptographic Engineering  

---

## 1. Executive Summary & Problem Formulation

Modern authentication guidance (e.g., NIST SP 800-63B-4) has moved away from rigid character-composition rules (uppercase/lowercase/numbers/symbols) toward length, random generation, password managers, and multi-factor authentication. In parallel, client-side pattern-aware guessability estimators (such as `zxcvbn-ts`) are widely deployed to provide real-time user feedback.

However, existing empirical evaluations of password-strength estimators often suffer from significant methodological shortcomings:
1. Conflation of model-derived theoretical entropy with real-world attacker throughput.
2. Lack of reproducible synthetic populations, relying instead on unverified breach corpora with dubious ethical and licensing provenance.
3. Severe English-centric dictionary bias, failing to assess estimator calibration on multilingual populations, transliterated constructions (e.g., Roman Urdu), and code-switching patterns.
4. Over-simplification of crack-time promises without explicit hardware, algorithm, and attacker budget parameters.

This research program designs and executes a controlled, ethical, and reproducible framework to evaluate pattern-aware strength estimators against defined synthetic guessing models.

---

## 2. Research Questions & Hypotheses

### Research Question 1 (RQ1) — Estimator Calibration Across Structural Pattern Classes
*How accurately does a pattern-aware estimator rank structured and random passwords under deterministic and heuristic candidate-ordering strategies?*
- **Hypothesis 1 (H1):** On structured candidates with common pattern primitives (spatial keyboard walks, dates, sequences), pattern-aware estimates correlate strongly (Spearman $\rho \ge 0.80$) with optimal dictionary/mutation guess rank, but systematically overestimate search difficulty for chained hybrid transformations.

### Research Question 2 (RQ2) — Multilingual and Transliteration Blindspots (Roman Urdu)
*How do Roman Urdu and mixed-language constructions affect the accuracy of an English-centric estimator?*
- **Hypothesis 2 (H2):** Roman Urdu dictionary phrases and phonetic substitutions will be classified by an English-centric estimator primarily as pseudo-random brute-force strings, leading to an overestimation of effective guess resistance by at least two orders of magnitude compared to an attacker utilizing localized frequency corpora.

### Research Question 3 (RQ3) — Cryptographic Verification Latency & Concurrency Trade-offs
*How do Argon2id memory, time, and parallelism configurations affect verification latency, memory footprint, and concurrency on bounded defender systems?*
- **Hypothesis 3 (H3):** Scaling Argon2id memory cost from 19 MiB to 64 MiB increases memory-bandwidth competition linearly under concurrent verification, requiring strict server-side semaphore bounding to prevent denial-of-service in low-concurrency environments.

### Research Question 4 (RQ4) — Heuristic Reuse Similarity Threshold Selection
*How does threshold tuning in normalized Levenshtein-based reuse comparison affect precision and recall over synthetic mutation families?*
- **Hypothesis 4 (H4):** A similarity threshold of $0.80$ on NFKC-normalized code-point distances achieves $>95\%$ precision in detecting intentional incremental password variations while limiting false positives across independent common-template passwords.

---

## 3. Scope, Boundaries & Ethical Commitments

1. **Synthetic-Only Data:** Absolutely no real user credentials, live corporate hashes, or unlicensed breach dumps are utilized or accepted. All evaluation data is synthetically generated via transparent, reproducible algorithms with fixed seeds.
2. **Defensive Research:** The research engine evaluates defensive estimator calibration, credential policy verification, and KDF overhead. It does not construct distributed botnet crackers or automated credential stuffing tools.
3. **Local Evaluation:** All personal analyzer interactions occur strictly in-memory in the client browser with zero network transmission.
