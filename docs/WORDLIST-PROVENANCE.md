# Candidate and Passphrase Wordlist Provenance

## Educational Candidate Fixture Provenance

`apps/lab-api/app/attacks.py` contains the seven ordered entries `amber`, `birch`, `cobalt`, `dune`, `ember`, `granite`, and `willow`. They were authored as a tiny classroom fixture for this project and were not copied from a breach corpus or third-party wordlist. The brute-force target is a fixed short synthetic value generated in the same module. No external wordlist file is downloaded or accepted.

The fixture demonstrates deterministic enumeration and bounded stopping only. It is far too small to represent real attacker coverage and must not be presented as a security benchmark or complete dictionary. No third-party data license applies to this authored fixture; the project software license does not change any third-party dependency data notices. If the fixture is replaced or expanded, record the source, version, redistribution license, checksum, and update process before shipping it.

## Passphrase Generator Wordlist Provenance

`packages/core/src/wordlist.ts` bundles the standardized Electronic Frontier Foundation (EFF) Large Wordlist:

- **List Name:** Electronic Frontier Foundation (EFF) Large Wordlist for Passphrases
- **Source URL:** https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt
- **Author:** Joseph Bonneau / Electronic Frontier Foundation
- **Release Date:** 2016-07-18
- **License:** Creative Commons Attribution 3.0 United States (CC BY 3.0 US)
- **SHA-256 Checksum:** `addd35536511597a02fa0a9ff1e5284677b8883b83e986e43f15a3db996b903e`
- **Total Entries:** Exactly 7,776 distinct entries ($6^5$, equivalent to 5 dice rolls)
- **Theoretical Entropy Per Word:** $\log_2(7776) \approx 12.9248125$ bits
- **Sampling Method:** Unbiased rejection sampling using `crypto.getRandomValues(new Uint16Array(1))` with acceptance ceiling `62,208` ($\lfloor 65536 / 7776 \rfloor \times 7776$). Zero modulo bias.
- **Recommended Default:** 6 words ($\approx 77.55$ bits of theoretical selection entropy).
- **Assumptions:** Theoretical selection entropy assumes independent, identically distributed uniform sampling with replacement from the full 7,776-word corpus. Separators are fixed presentation tokens and do not contribute entropy bits.
