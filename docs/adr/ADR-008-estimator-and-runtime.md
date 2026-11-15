# ADR-008: TypeScript Estimator and Initial Runtime

**Status:** Accepted for initial implementation  
**Date:** 2026-11-15

## Context

The audited repository already contained a partial FastAPI service, a React application, and a TypeScript core with an existing `zxcvbn-ts` integration. The Master PRD requires a maintained pattern-aware estimate, typed findings, browser-local execution, and no invented confidence value. The decision therefore preserves and validates the existing estimator choice rather than replacing the architecture.

## Decision

Use `@zxcvbn-ts/core` with its English/common language data from the `zxcvbn-ts/zxcvbn` project as the estimator adapter. Keep data setup inside the TypeScript core. Treat the library's score and guess estimate as modeled values. Map actual `sequence` matches and feedback to findings. Use React/Vite in an npm workspace for the demonstration UI and a separate FastAPI/Python service for cryptography and bounded synthetic attacks. Initially target the detected Node 24 and Python 3.10 runtimes.

## Alternatives considered

- **Composition-only entropy:** rejected because it is not a realistic human-password guessability estimator.
- **Original JavaScript zxcvbn:** the TypeScript project directly supports typed integration and exposes matcher output.
- **`zxcvbn-ts` package by an unrelated single-repository fork:** not selected; the established `zxcvbn-ts/zxcvbn` organization project and its `@zxcvbn-ts/*` packages show ongoing releases and maintainership.
- **Backend-only analysis:** rejected because it violates the browser-local privacy boundary.

## Consequences

- English/common estimator data is part of the local web bundle; inspect its licenses and size before final acceptance.
- The model can miss user context and its guess estimate is not a guarantee or exact crack-time measurement.
- Exact versions and transitive dependency security must be rechecked from the generated lockfile and scanner results.
- Python runtime is an initial compatibility target, not a supported-platform claim until clean install/CI evidence exists.

## References

- [Official zxcvbn-ts project](https://github.com/zxcvbn-ts/zxcvbn)
- [TypeScript guide and result types](https://zxcvbn-ts.github.io/zxcvbn/guide/typescript/)
- [Official NIST SP 800-63B-4 Password Authenticators](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/)
- [Official OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
