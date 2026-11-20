# Synthetic Research Dataset Registry

All datasets registered in this catalog are 100% synthetically generated for educational and evaluation purposes. They contain no real-world credentials, personal account identifiers, or proprietary credential verifiers.

---

## Registered Datasets

| Dataset ID | Version | Category | Item Count | Generator Seed | License | Manifest Path | SHA-256 Checksum |
|---|---|---|---|---|---|---|---|
| `DS-SYNTH-STRUCT-V1` | 1.0.0 | Structured English Patterns | 1,000 | `0x50534131` | CC0-1.0 | `research/datasets/manifests/synthetic-corpus-v1.json` | Recorded in manifest |
| `DS-SYNTH-URDU-V1` | 1.0.0 | Roman Urdu & Code-Switching | 500 | `0x50534132` | CC0-1.0 | `research/datasets/manifests/synthetic-corpus-v1.json` | Recorded in manifest |
| `DS-EFF-LARGE-PASSPHRASE` | 2016-07-18 | EFF Large Wordlist | 7,776 | N/A (Standard) | CC-BY-3.0 | `packages/core/src/wordlist.ts` | `addd35536511597a02fa0a9ff1e5284677b8883b83e986e43f15a3db996b903e` |
| `DS-TOP1000-BLOCKLIST` | 1.0.0 | High-frequency Blocklist | 1,000 | N/A (Standard) | MIT | `packages/core/src/blocklist/data.ts` | `0b681d2d126f56bc877e41e22963bb75b659cb66db15111f23549ee6825d7a23` |

---

## Synthetic Corpus Composition Rules

1. **Structured English (`DS-SYNTH-STRUCT-V1`):**
   - 250 pure dictionary multi-word passphrases.
   - 250 spatial keyboard patterns (`qwerty`, `dvorak`, keypad).
   - 250 hybrid dictionary-date-suffix constructions.
   - 250 l33t substitution variations.
2. **Roman Urdu & Multilingual (`DS-SYNTH-URDU-V1`):**
   - 200 common Roman Urdu lexical words (e.g. `dil`, `chabi`, `darwaza`, `roshni`, `kitab`, `manzil`).
   - 150 phonetic transliteration variants (e.g. `khawab`, `khwaab`, `xawab`).
   - 150 mixed-language code-switching constructions (e.g. `myPasswordHeHai123`, `safeChabi2026`).
