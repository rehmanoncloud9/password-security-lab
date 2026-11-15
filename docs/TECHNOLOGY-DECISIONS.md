# Technology Decisions

**Status:** Current decisions as of 2026-11-15. GitHub workflow files now exist but have not run; npm install and TypeScript build remain blocked locally.

## Runtime and repository

- Use a single npm workspace with `packages/core` for reusable framework-independent TypeScript and `apps/web` for React/Vite. Keep the Python API separately installable under `apps/lab-api` with exact runtime/test requirement pins; transitive artifact hashes remain absent.
- Target Node.js 24/npm 11 and Python 3.10–3.12. CI matrices Python 3.10, 3.11, and 3.12; workflows are configured but have not executed.
- TypeScript core exposes analysis, policy, reuse, and browser-secure generation functions. It has no React, persistence, network, Python, hashing-lab, or attack imports. The generator uses Web Crypto and returns the generated value to its caller; callers must avoid persistence.
- FastAPI listens on `127.0.0.1` only, with a fixed UI origin, request models that reject extra fields, bounded payloads, and no request-body logging.

## Guessability estimator

Use the official `@zxcvbn-ts/core` and English/common language packages from the `zxcvbn-ts/zxcvbn` project. The project is a maintained TypeScript rewrite of Dropbox zxcvbn, with typed match output and pattern matchers for dictionary words, repeats, sequences, keyboard patterns, dates and l33t substitutions. Its published code is MIT-licensed. The current documentation lists the core and language packages and explains their separate dictionary setup. Lock exact versions and inspect package manifests, dictionary attribution and transitive dependencies before release.

The estimator's guesses and 0-4 score are relative model outputs, not measured crack times or guarantees. Map its actual match sequence and feedback; do not invent confidence. No standalone entropy formula will be used as the primary score. Input length is measured in Unicode code points. Inputs over a documented ceiling will be rejected, never silently truncated.

## Cryptographic implementation

- SHA-256 demonstration uses Python `hashlib` and is labeled an unsafe fast-hash baseline.
- PBKDF2 uses Python `hashlib.pbkdf2_hmac` with HMAC-SHA-256, fresh `secrets` salts, bounded iterations and stored parameters.
- bcrypt uses the maintained `bcrypt` binding. Reject UTF-8 inputs over 72 bytes before invoking it; do not rely on backend truncation behavior.
- Argon2id uses `argon2-cffi`'s high-level password hasher/PHC encoding with fixed allowed parameters. Parse and bound encoded costs before verification.
- Start at OWASP's documented Argon2id 19 MiB, 2 iterations, parallelism 1; bcrypt cost 10; PBKDF2-HMAC-SHA-256 600,000 when demonstrating the FIPS-oriented baseline. Benchmark locally and never lower a minimum without an explicit documented decision.
- Use Python's `secrets` for identifiers and salts; algorithms are provided by established implementations, never custom code.
- Backend health and attack throughput fields are measurements (psutil/perf counters), not estimates or generated demonstration values. Docker status is omitted because Compose was not adopted.

## Reuse heuristic

Exact duplicates compare original code-point sequences. Similarity uses normalized Levenshtein similarity over NFKC-normalized, case-folded strings, with no whitespace stripping. Only compare distinct entries, exclude exact equality from similarity findings, and require both a minimum length and a high documented similarity threshold to reduce short-word false positives. Return indices and reasons, never sample values. All inputs are bounded and memory-only.

## State and attacks

- Store demo verifiers and attack job metadata only in a bounded, TTL-governed in-memory registry.
- Use cryptographically random opaque job IDs; accept only internal fixture IDs for attack targets. Never accept an imported hash or password candidate list.
- One active attack at a time, with 10 s, 10,000 attempt, 1,000 dictionary-entry, input-size and fixed Argon2 memory ceilings enforced by the service.
- Candidates are generated in deterministic order. Poll/cancel endpoints return only counters, algorithm/settings and terminal state; never the recovered candidate.

## Exposure screening

Deferred until P0 is demonstrated. If added, implement a dedicated explicit-opt-in adapter using the official Pwned Passwords range protocol, fixed HTTPS endpoint, timeout, response cap, and a test that observes only the five-character prefix leaving the browser.

## Official guidance reviewed 2026-11-15

- [NIST SP 800-63B-4, Password Authenticators](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/): 15-character single-factor minimum; MFA password minimum may be 8; permit at least 64; count Unicode code points; do not impose composition rules; compare the full value to a blocklist.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): Argon2id, bcrypt, and PBKDF2 parameters cited above; fast SHA-256 is not suitable as a password-storage hash.
- [zxcvbn-ts project and documentation](https://github.com/zxcvbn-ts/zxcvbn), [TypeScript API](https://zxcvbn-ts.github.io/zxcvbn/guide/typescript/), [matcher documentation](https://zxcvbn-ts.github.io/zxcvbn/guide/matcher/): typed output and supported built-in patterns.
- [argon2-cffi parameter guidance](https://github.com/hynek/argon2-cffi/blob/main/docs/parameters.md): measure parameters on the target machine; use Argon2id for password hashing and store encoded parameters with verifier.

Current TypeScript package compatibility and transitive dependency contents are not
verified because registry resolution is blocked. The root has no npm lockfile. This
does not imply package publication or release readiness.
