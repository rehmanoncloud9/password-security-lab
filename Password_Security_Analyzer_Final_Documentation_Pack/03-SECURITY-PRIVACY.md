# Security and Privacy Design

## 1. Security posture
PSA handles password-like strings. Treat all entered values as secrets even though users are instructed to use synthetic examples. The safest default is to avoid collection, persistence and transmission entirely.

## 2. Secret-handling rules
- Do not store raw passwords in databases, files, browser storage, cookies, URLs, analytics, logs, crash reports or telemetry.
- Do not echo password values in errors, exceptions, debug output or test failure messages.
- Do not include input values in exported reports or screenshots.
- Keep values in memory only for the minimum operation lifetime.
- Clear UI state on explicit reset and when the relevant lab session ends.
- Avoid unnecessary copies of sensitive strings; acknowledge that garbage-collected runtimes cannot guarantee secure memory zeroization.
- Use synthetic fixtures in all automated tests and demos.

## 3. Local analysis
The core analyzer must run in the browser and must not make network calls. Validate this with browser-level network interception tests using a unique synthetic canary string. The canary must not appear in any request, URL, console output or telemetry event.

## 4. Optional Pwned Passwords lookup
If implemented:
1. Require explicit user opt-in and explain what is sent.
2. Compute SHA-1 locally solely to participate in the Pwned Passwords range protocol.
3. Send only the first five hexadecimal characters.
4. Receive matching suffixes and prevalence counts; compare the complete hash locally.
5. Apply a timeout and response-size limit.
6. Return one of `found`, `not_found_in_dataset`, `unavailable`, `not_checked`.
7. Do not cache a password, full hash or suffix result beyond the in-memory interaction.
8. Explain that `not_found_in_dataset` means only that the current dataset did not return a match.

The SHA-1 digest in this flow is not a password-storage hash and must not be represented as one.

## 5. Password storage laboratory
- Use established implementations for Argon2id, bcrypt and PBKDF2.
- Demonstrate SHA-256 only as a deliberately insecure fast-hash baseline.
- Generate independent salts with a cryptographically secure random generator.
- Store salt and algorithm parameters with the verifier in realistic examples; salts are not secret.
- Tune costs on target hardware and report exact settings.
- Enforce bcrypt byte limits explicitly. Never silently truncate.
- Do not invent a custom KDF, salt scheme or comparison primitive.

Reference baseline from OWASP Password Storage Cheat Sheet: Argon2id at least 19 MiB memory, 2 iterations, parallelism 1; bcrypt work factor at least 10 for legacy use, with a 72-byte input limit; PBKDF2-HMAC-SHA256 600,000 iterations when FIPS-oriented requirements call for it. These are reference minima, not universal performance settings; re-check current guidance and benchmark the actual target environment before release.

## 6. Local lab hardening
- Bind to `127.0.0.1` only.
- Reject wildcard/public bind configuration.
- Restrict CORS to the expected local UI origin.
- Validate `Host` and `Origin` where appropriate to reduce DNS-rebinding exposure.
- Do not expose endpoints for arbitrary hash import, account lists, domains or remote targets.
- Use a fixed allowlist of algorithms and validated parameter ranges.
- Limit to one active job initially.
- Enforce server-side time, attempt, input-size, wordlist-size and memory limits.
- Add cancellation and automatic in-memory cleanup.
- Never log request bodies or target/candidate values.
- Disable debug mode in release builds.

## 7. Dependencies and supply chain
- Pin dependencies and commit lockfiles.
- Review transitive dependencies for maintenance, license and known vulnerabilities.
- Run dependency audit and static analysis in CI.
- Keep cryptographic dependencies minimal and maintained.
- Review release artifacts and build provenance.
- Do not paste secrets or private credentials into CI variables unless a future release workflow truly requires them.

## 8. Privacy notice (user-facing draft)
“Your analysis is performed in this browser. We do not need your account password and you should use a made-up example. The analyzer does not save or send the value. Optional exposure lookup, if enabled, sends only a short prefix of a locally calculated hash to the selected breach-check service; the full password and full hash are not sent. Results are estimates, not guarantees.”

## 9. Known limitations
- A compromised local device can observe input before or during analysis.
- Browser extensions, malware, screen recording and shoulder surfing are outside the product's protection.
- No estimator can know every attacker's dictionaries, personal context or future leaked data.
- Breach datasets are incomplete and time-dependent.
- Memory clearing in managed runtimes is best-effort, not guaranteed secure erasure.
- A local demo is not a production security audit or certification.
