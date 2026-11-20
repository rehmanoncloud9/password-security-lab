# Experimental Methodology & Statistical Evaluation Protocols

**Document version:** 1.0.0  
**Date:** 2026-11-20  
**Project:** Password Security Laboratory  

---

## 1. Experimental Protocols

### 1.1 Estimator Evaluation Protocol (Protocol ID: `EVAL-EST-2026-V1`)

- **Objective:** Evaluate the correlation between `zxcvbn-ts` log-guess scores and empirical candidate rank under defined guessing strategies.
- **Independent Variables:**
  - Password pattern category: `random_ascii`, `dictionary_phrase`, `spatial_walk`, `date_suffix`, `l33t_substitution`, `roman_urdu_phrase`, `code_switching`.
  - Password length: 8, 12, 16, 20, 24 Unicode code points.
- **Dependent Variables:**
  - Estimator score ($0–4$) and estimated log10 guesses.
  - Empirical search rank under bounded strategy generators.
  - Relative log-scale prediction error: $\epsilon = \log_{10}(\text{estimatedGuesses}) - \log_{10}(\text{empiricalRank})$.
- **Sampling Strategy:** 250 synthetically generated items per category ($N = 1,750$ total items), generated via deterministic PRNG with published seed `0xPSA2026`.

### 1.2 Statistical Treatment & Metrics

1. **Non-parametric Rank Correlation:**
   - Evaluated using Spearman's rank correlation coefficient ($\rho$) and Kendall's $\tau_b$ to account for non-normal score distributions and tied ranks.
2. **Distributional Dispersion:**
   - Interquartile Range (IQR = $Q_3 - Q_1$) and median values are reported alongside sample standard deviations. Raw sample vectors are preserved in sanitized JSON artifacts.
3. **Censoring for Non-recovered Candidates:**
   - Any candidate not recovered within the strategy's search ceiling ($10^4$ candidates) is recorded as right-censored at $10^4$, rather than assigned an arbitrary infinite rank.

---

## 2. Hardware and Environment Documentation

Each experimental record must preserve:
- Operating system release and platform architecture.
- CPU model, physical core count, and logical thread count.
- Memory snapshot: process RSS before, peak process memory, total and available host RAM.
- Python runtime version, OpenSSL version, cryptography library versions (`argon2-cffi`, `bcrypt`, `fastapi`).
- Application Git commit hash and repository state.
- Cryptographic hash (SHA-256) of raw observation vectors.
