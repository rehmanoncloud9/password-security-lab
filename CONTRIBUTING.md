# Contributing

This is a security education project. Keep changes small, testable, and explicit about what has and has not been verified.

## Development boundaries

- Keep guessability, policy, and reuse logic in `packages/core`; do not duplicate it in React.
- Keep the attack engine in `apps/lab-api`; never add it to the SDK exports.
- Use synthetic values only. Do not add account credentials, imported hashes, external cracking lists, remote targets, or plaintext logging.
- Keep the analyzer path local and free of network, storage, analytics, and URL side effects.
- Add server-side limits for every expensive operation and preserve loopback-only service defaults.
- Do not publish packages, deploy services, or include secrets in examples.

## Before submitting

Run the relevant commands from [Testing Strategy](docs/TESTING-STRATEGY.md). For Python, run Ruff formatting, Ruff lint, and pytest from `apps/lab-api/`. For JavaScript, install from a lockfile once available, then run the root lint, type-check, tests, and production build. If a check cannot run, report the exact command and blocker.

Add a regression test for each bug. Update requirement traceability, implementation status, API and security documentation when behavior changes. Never mark acceptance verified from source inspection or a successful build alone.

## Git and pull requests

Work on a focused branch from the agreed project baseline. Keep generated build,
coverage, environment, and secret files untracked; `.gitignore` and `.gitattributes`
define the repository defaults. Use the pull request template to record requirement
IDs, actual checks, and security implications. Do not commit, push, tag, publish, or
deploy without project-owner authorization. Never amend/force-push shared history or
discard another contributor's changes.
