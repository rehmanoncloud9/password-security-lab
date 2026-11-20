# Software Bill of Materials (SBOM)

**Document Version:** 1.0.0  
**Generated Date:** 2026-11-20  
**Repository:** Password Security Laboratory  
**Compliance Profile:** CycloneDX / SPDX aligned metadata for academic and operational audit.

---

## 1. Top-Level Architectural Components

| Component Identifier | Type | Description | Primary Language | License |
|---|---|---|---|---|
| `@psa/core` | Library | Zero-telemetry password analysis, generation, policy & reuse engine | TypeScript | MIT |
| `@psa/web` | Application | Local-first browser workstation & research lab interface | TypeScript (React) | MIT |
| `apps/lab-api` | Microservice | Synthetic-only loopback cryptography & bounded attack research API | Python (FastAPI) | MIT |
| `research/` | Dataset & Protocol | Empirical entropy estimation & benchmark evaluation suites | Python / JSON | CC-BY-4.0 |

---

## 2. Bundled Datasets & Cryptographic Artifacts

| Dataset Identifier | Version / Date | License | SHA-256 Hash | Purpose |
|---|---|---|---|---|
| **EFF Large Wordlist** | 2016-07-18 | CC-BY-3.0-US | `addd35536511597a02fa0a9ff1e5284677b8883b83e986e43f15a3db996b903e` | 7,776-word dictionary for unbiased CSPRNG passphrase generation |
| **Common 1,000 Passwords Blocklist** | 1.0.0 (2026-11-20) | CC0-1.0 | `0b681d2d126f56bc877e41e22963bb75b659cb66db15111f23549ee6825d7a23` | High-frequency password screening dictionary |
| **DS-SYNTH-STRUCT-V1** | 1.0.0 (2026-11-20) | CC-BY-4.0 | `47f3f350cbe1a8be13dc59424e6a8e8f773ff4af45df199cb1b4c3bf50f6dd98` | 1,000 synthetic structured English benchmark tokens |
| **DS-SYNTH-URDU-V1** | 1.0.0 (2026-11-20) | CC-BY-4.0 | `72c918ec30113c4a0aa157cf6c986c73bb1b596f1b32d29487c6cf7a18bb1bb3` | 500 synthetic Roman Urdu benchmark tokens |

---

## 3. Node.js & TypeScript Direct Dependencies

### Core Engine (`packages/core`)
| Package Name | Version | License | Direct Dependency | Scope |
|---|---|---|---|---|
| `@zxcvbn-ts/core` | 4.2.0 | MIT | Yes | Production (Pattern matching engine) |
| `@zxcvbn-ts/language-common` | 4.2.0 | MIT | Yes | Production (Common dictionary data) |
| `@zxcvbn-ts/language-en` | 4.2.0 | MIT | Yes | Production (English language dictionary data) |
| `typescript` | ^5.8.0 | Apache-2.0 | Dev | Build / Typechecking |
| `vitest` | 4.1.12 | MIT | Dev | Test runner |

### Web Interface (`apps/web`)
| Package Name | Version | License | Direct Dependency | Scope |
|---|---|---|---|---|
| `react` | ^19.0.0 | MIT | Yes | UI framework |
| `react-dom` | ^19.0.0 | MIT | Yes | DOM renderer |
| `lucide-react` | ^0.475.0 | ISC | Yes | Iconography |
| `vite` | 7.3.8 | MIT | Dev | Production bundler |

---

## 4. Python Backend Dependencies (`apps/lab-api`)

| Package Name | Version | License | Cryptographic / Operational Role |
|---|---|---|---|
| `fastapi` | 0.115.11 | MIT | Strict schema HTTP API framework |
| `uvicorn` | 0.34.0 | BSD-3-Clause | Loopback-bound ASGI server |
| `pydantic` | 2.10.6 | MIT | Strict input validation (forbids free-form passwords) |
| `argon2-cffi` | 23.1.0 | MIT | Memory-hard Argon2id KDF implementation (RFC 9106) |
| `bcrypt` | 4.3.0 | Apache-2.0 | Adaptive bcrypt KDF implementation (72-byte limit enforced) |
| `cryptography` | 44.0.2 | Apache-2.0 / BSD | Standard PBKDF2-HMAC-SHA256 and FIPS SHA-256 implementations |
| `psutil` | 7.0.0 | BSD-3-Clause | Real-time process CPU & RSS memory instrumentation |
| `pytest` | 9.2.0 | MIT | Test harness |
| `ruff` | 0.15.0 | MIT | Linter and code formatter |

---

## 5. Security & Provenance Audit Summary

1. **Zero High/Critical Advisories:** Current registry-backed `npm audit` reports 0 vulnerabilities.
2. **Deterministic Builds:** Dependency locks (`package-lock.json` and virtualenv specifications) are tracked in version control.
3. **No Unlicensed Secret Data:** No leaked databases (e.g. RockYou, Collections) or proprietary corpora are bundled; all datasets are authored or CC/public domain with cryptographic checksums.
