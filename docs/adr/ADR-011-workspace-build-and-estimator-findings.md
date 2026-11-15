# ADR-011: Dependency-Aware TypeScript Checks and Estimator Findings

**Status:** Accepted  
**Date:** 2026-11-15

## Context

The web and SDK workspaces import the core package through its generated declaration
exports. A clean checkout has no generated `dist/index.d.ts`. In addition, the
zxcvbn-ts public `check()` result contains only the optimal scoring sequence. This
can omit valid alternate classifications, such as a keyboard walk that also matches
a dictionary entry.

## Decision

Use TypeScript composite project references and build mode for the core, web, and
SDK typecheck/build commands. TypeScript resolves project dependencies in order and
creates declarations from a clean tree. For analysis results, preserve the score
from `zxcvbn-ts` and capture actual findings from the same configured matcher pass,
then merge those classifications with its optimal sequence. Keep the adapter
isolated in `packages/core/src/estimator.ts` and expose only classification fields.

The matcher interception uses a runtime-private property of the pinned
`@zxcvbn-ts/core` implementation because the public result omits alternate matches.
This is a compatibility risk: tests must cover it whenever estimator packages are
upgraded. It does not add a hardcoded password exception or change the scoring result.

## Verification

Root `npm run typecheck` passed for core, web, and SDK after generated build outputs
were removed. Compiled analyzer checks observed `spatial` for `qwerty` and `asdfgh`
alongside dictionary findings. The Vitest suite itself remains blocked in the
managed Windows environment by worker-process `EPERM`.

