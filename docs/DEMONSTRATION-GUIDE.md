# Demonstration Guide

1. After the browser build has passed, start the web client and loopback API. Show the measured API health and service status.
2. Enter a made-up predictable value on Analyze. Explain actual dictionary/repeat/sequence findings and the model-estimated score. Clear it.
3. Enter a longer synthetic passphrase and distinguish guessability feedback from the modern policy checks.
4. Compare two repeated and one modified synthetic example in the reuse lab. Explain the threshold and false-positive limits.
5. Hash one synthetic value with SHA-256, then Argon2id/PBKDF2/bcrypt. Explain why SHA-256 is an unsafe fast baseline, why adaptive hashes include salts/parameters, and how correct/incorrect verification works.
6. Generate a synthetic password and passphrase; explain cryptographic random selection and caller responsibility for not persisting it.
7. Use a synthetic value longer than 72 UTF-8 bytes with bcrypt and show safe rejection.
8. Run dictionary, brute force, pattern, suffix, substitution and word-combination experiments. Show actual attempts/search space and explain cancellation/limit states.
9. Run the measured benchmark and explain the local environment, five raw samples, median, IQR, and variability.
10. Import the core in `examples/sdk-consumer` and explain that it has no lab or attack dependency.
11. State that HIBP screening is deferred and that frontend runtime verification, security scans, and public package release are incomplete.

The live UI steps are a planned teaching sequence only until browser build and E2E verification are completed.

Never use a real password in a live demonstration, recording or screenshot.
