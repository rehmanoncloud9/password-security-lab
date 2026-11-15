# User Guide

## Before starting

Use only made-up examples. Do not enter an account password. Analyzer, policy and reuse values remain in the current browser tab; separate storage-lab values are sent only to the local API when submitted.

## Analyze

Enter a synthetic example in the masked field. The browser shows zxcvbn-ts score/band, estimated guesses, detected patterns, targeted suggestions, and loaded estimator version. Clear removes the field and result. Estimates model likely patterns; they do not guarantee safety.

Choose one of three separate policy profiles:

- **Modern single factor:** minimum 15 Unicode code points and exact complete-value lookup in bundled English/common dictionary data.
- **Modern MFA factor:** minimum 8 code points and the same whole-value dictionary screen.
- **Educational traditional:** an explicitly legacy 8-character baseline and three-of-four character classes.

The modern profiles do not require character-class mixtures. The bundled dictionary is not a comprehensive breach dataset; “pass” does not mean the value was never exposed.

The reuse lab compares up to twenty short examples entered in the current tab. It reports exact groups and heuristic similar pairs by example index. It cannot compare accounts or websites.

The generator creates random character passwords or multiword passphrases in the browser using Web Crypto. Length and character sets can be adjusted; the generator does not save values automatically. Copy sends the selected result to the browser clipboard only after the explicit action.

Exposure screening is not implemented. Its state is shown as `not checked`.

## Storage Lab

Submit a made-up sample to SHA-256, PBKDF2-HMAC-SHA256, bcrypt, or Argon2id. The lab shows the stored verifier, salt metadata, algorithm parameters, and measured time. Verify correct and incorrect synthetic candidates. Hash generation creates independent random salts for adaptive methods. bcrypt input over 72 UTF-8 bytes is rejected.

Clear lab state removes browser records and deletes generated verifiers from the local process. Server records expire automatically after 10 minutes.

## Attack Lab

Choose one internally defined synthetic target and one of the bounded dictionary, brute-force, pattern, suffix, substitution, or word-combination strategies. The UI shows the candidate count/search-space before start. You can cancel a running job. States distinguish recovery, attempt/time limit, cancellation, and error; the result includes actual candidate checks, elapsed time, and candidate verification throughput. A limit reached is inconclusive.

## Results & Learning

Run five real hash-generation and verification repetitions per algorithm. The table and chart use the returned measured values. Environment, parameters, raw observations, median and IQR are included. Current-session reports can be exported as JSON or CSV and omit entered samples/verifiers by design.

The frontend has not yet been built or exercised in a browser in the supplied environment. The instructions describe source behavior; confirm it after npm dependencies are installed and browser verification is complete.
