# Learning Glossary

- **Entropy:** a measure of uncertainty for a source with a defined probability distribution. Human-chosen passwords do not follow a uniform random distribution, so length and character-class arithmetic alone can overstate their real guessability.
- **Guessability:** how soon a realistic pattern-aware guessing model might try a value. zxcvbn estimates this from dictionaries, repeats, sequences, dates, keyboard patterns and substitutions. It is an estimate, not a measured attack or guarantee.
- **Password policy:** acceptance rules such as minimum length and a full-value blocklist. A policy pass does not imply the password is hard to guess; a long passphrase can be strong without character-class mixtures.
- **Hashing:** a one-way computation used to compare a candidate to a stored verifier. It is not reversible encryption.
- **Salt:** a unique random value included in a password hash. The salt is stored with the verifier and need not be secret. Unique salts cause identical passwords to produce different stored values and defeat shared precomputed tables.
- **Adaptive password hashing:** a KDF configured to make each guess cost meaningful CPU and/or memory. PBKDF2, bcrypt and Argon2id have stored work parameters. SHA-256 is intentionally fast and is not suitable by itself for password storage.
- **Offline guessing:** testing candidate values against stolen password verifiers without contacting the login service; online rate limits do not apply.
- **Dictionary experiment:** testing candidates from a fixed ordered list. The local educational fixture is intentionally tiny.
- **Brute-force experiment:** enumerating every value in a small defined alphabet/length space. Search space is the sum of alphabet-size powers for each allowed length.
- **Measured benchmark:** actual timings from the current machine and implementation. Measurements vary with hardware/runtime/load and do not represent universal attacker speeds.
- **Limit reached:** an experiment stopped at its configured time/attempt budget. It is inconclusive and does not prove the target is unguessable.
