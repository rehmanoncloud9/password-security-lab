# ADR-012: Upgrade Vite and Vitest to Patched Releases

**Status:** Accepted  
**Date:** 2026-11-15

## Context

The live npm audit reported affected versions of Vite 7.2.2, Vitest 4.0.8, and
their Vitest mocker dependency. A registry request using the inherited proxy failed;
retrying with proxy environment variables removed reached the official npm registry.
Registry metadata confirmed Vite 7.3.8 supports Node 20.19+, 22.12+, and later,
including Node 24. Vitest 4.1.12 supports Node 20, 22, and 24+, and declares Vite
`^6 || ^7 || ^8` as a peer range. Existing `@vitejs/plugin-react` 5.1.1 accepts
Vite `^4 || ^5 || ^6 || ^7`.

## Decision

Upgrade the direct Vite version to 7.3.8 and align Vitest to 4.1.12 in both workspaces.
Regenerate the root lockfile from the registry and audit the resolved tree. Do not
use a forced audit fix or an override. Validate the resulting installation, tests,
typechecks, and build; if the managed environment blocks execution, record that
limitation separately from the dependency-resolution result.

## Verification result

The real registry-generated lock resolves Vite 7.3.8 and Vitest/`@vitest/mocker`
4.1.12. `npm ls` is valid and the live `npm audit` reports zero vulnerabilities.
Two `npm ci --ignore-scripts` runs installed 104 packages each with an identical
lock hash. Normal `npm ci`, Vitest workers, and Vite/esbuild startup are still blocked
by `spawn EPERM`; no test/build pass is inferred from dependency remediation.

