# Testing and Validation Strategy

## 1. Testing objectives
Prove functional correctness, privacy properties, bounded resource use, honest reporting and accessibility. Tests must use synthetic fixtures only.

## 2. Test layers

### Unit tests
- Length counting, whitespace and Unicode semantics.
- Estimator adapter normalization.
- Pattern findings and recommendation mapping.
- Policy rules and independent status states.
- Exact duplicate and similarity logic.
- Export allowlist and redaction.

### Integration tests
- Web app calls the core without network egress.
- React adapter displays core results without duplicating scoring.
- Lab API hashes and verifies correctly.
- Attack jobs report attempts, duration and terminal reason.
- UI handles lab offline, invalid settings and cancellation.
- Optional HIBP lookup sends only a five-character prefix.

### Security tests
- Secret canary absent from requests, URLs, logs, errors, analytics and exports.
- Non-loopback bind rejected.
- Unexpected Origin/Host rejected.
- Arbitrary hash/target payload rejected.
- Input and wordlist size limits enforced.
- Excessive cost settings rejected.
- Concurrent job limit enforced.
- Job cleanup and TTL enforced.
- No raw passwords in CI artifacts.

### Fuzz and edge tests
- Empty input, whitespace-only, long passphrase, Unicode normalization cases, emoji, control characters, repeated sequences, embedded common words, unusual punctuation.
- Malformed JSON, missing fields, unknown algorithms, negative/oversized limits, malformed job IDs.
- Cancellation races, timeout races and API process shutdown.

### Accessibility tests
- Keyboard-only primary flows.
- Focus order and visible focus.
- Labels and accessible names.
- Screen-reader announcements for result updates.
- Color-independent status communication.
- Contrast, zoom/text scaling and reduced-motion behavior.

## 3. Acceptance test catalogue

| ID | Scenario | Expected result |
|---|---|---|
| AT-01 | Common weak sample | Relevant finding and useful recommendation |
| AT-02 | Long passphrase | Not penalized merely for missing symbols/case classes |
| AT-03 | Repeated sample values | Exact duplicates detected in session |
| AT-04 | Small variation set | Similarity warning is explained as heuristic |
| AT-05 | Modern vs legacy policy | Distinct checks; modern does not require class mixtures |
| AT-06 | Same sample hashed twice | Independent salts produce different stored hashes |
| AT-07 | Correct verification | Success |
| AT-08 | Incorrect verification | Failure |
| AT-09 | bcrypt over byte limit | Explicit safe rejection/handling; no silent truncation |
| AT-10 | Dictionary target in fixture | Recovered within budget |
| AT-11 | Target absent from fixture | Not found within budget or limit reached |
| AT-12 | Tiny brute-force fixture | Search-space calculation matches enumeration |
| AT-13 | Job cancellation | Stops and returns cancelled |
| AT-14 | Time/attempt ceiling | Stops and returns correct limit state |
| AT-15 | Lab API offline | Analyzer still works; lab reports unavailable |
| AT-16 | HIBP timeout | unavailable, not not-found |
| AT-17 | Secret canary network test | No password or full hash leaves local analysis path |
| AT-18 | Report export | No plaintext, target, candidate or raw sample values |
| AT-19 | Keyboard navigation | All primary actions reachable and operable |
| AT-20 | Clean clone | Documented setup, tests and demo succeed |

## 4. Benchmark protocol
1. Record OS, CPU, RAM, runtime, library versions and algorithm parameters.
2. Define exact input sizes and operation counts.
3. Warm up where relevant.
4. Run multiple repetitions under the same conditions.
5. Report median and spread (e.g. interquartile range) rather than a single cherry-picked value.
6. Separate hash creation and verification.
7. Do not extrapolate a large attack from a tiny run without showing the arithmetic and assumptions.
8. Label results as local measurements, not universal attacker performance.
9. Store raw non-secret measurements and the script/configuration used to produce them.

## 5. CI quality gates
- formatting and lint,
- type checking,
- unit and integration tests,
- Python static analysis,
- dependency vulnerability audit,
- secret scanning,
- build verification,
- privacy regression tests.

No release should bypass failing security or privacy tests without a documented, approved exception and remediation issue.
