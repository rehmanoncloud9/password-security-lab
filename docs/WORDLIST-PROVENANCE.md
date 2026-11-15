# Educational Candidate Fixture Provenance

`apps/lab-api/app/attacks.py` contains the seven ordered entries `amber`, `birch`, `cobalt`, `dune`, `ember`, `granite`, and `willow`. They were authored as a tiny classroom fixture for this project and were not copied from a breach corpus or third-party wordlist. The brute-force target is a fixed short synthetic value generated in the same module. No external wordlist file is downloaded or accepted.

The fixture demonstrates deterministic enumeration and bounded stopping only. It is far too small to represent real attacker coverage and must not be presented as a security benchmark or complete dictionary. No third-party data license applies to this authored fixture; the project software license does not change any third-party dependency data notices. If the fixture is replaced or expanded, record the source, version, redistribution license, checksum, and update process before shipping it.

## Passphrase generator list

`packages/core/src/generate.ts` contains a separate, 176-entry list of common
English nature/object words authored for this educational generator. It is not
Diceware, does not carry Diceware's provenance or security properties, and was not
copied from a breach corpus. The generator samples uniformly with replacement from
these entries using Web Crypto rejection sampling. Its reported selection bits are
theoretical under the independent uniform-choice assumption; they are not a
guessability estimate. The analyzer's pattern-aware estimate is shown separately.
