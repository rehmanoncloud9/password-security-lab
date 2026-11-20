# Design System & UI/UX Specification
**Password Security Laboratory — Enterprise & Academic Workstation**

---

## 1. Core Design Philosophy & Principles

### 1.1 Senior Interface & Experience Standards
- **Zero Pill-Shaped Slop:** Eliminate generic capsule/pill buttons and overly rounded pill tags. Use crisp, purposeful geometry: `6px`–`10px` border-radii for buttons, cards, and inputs.
- **De-Cluttered Information Hierarchy:** Replace long didactic paragraphs and walls of text with scannable visual structures: structured stat rows, badges, icon tiles, and concise microcopy ($\le 2$ lines per block).
- **100% Zoom Ergonomics:** Design the viewport grid so that key workflows, inputs, results, and operational monitors are visible without excessive vertical scrolling on standard desktop viewports (1366×768 to 1920×1080).
- **Decoupled Trust Domains:** Visually distinguish client-only **Personal Password Tools** (green "Browser-Only (Private)" badge, blue accents) from the loopback **Research Lab** (cyan/indigo accents, clear "Synthetic Fixture" warnings).

---

## 2. Visual Identity & Logo

```
  ┌──────────────┐
  │  ╔════════╗  │    PASSWORD SECURITY LABORATORY
  │  ║ 🛡️ PSL ║  │    Information Security Lab
  │  ╚════════╝  │    ─────────────────────────────
  └──────────────┘    Local Workstation · Zero Telemetry
```

- **Logo Mark:** Modern geometric shield badge (`36×36px`) with an inner layered shield motif and subtle diagonal linear gradient (`#1677ff` to `#0958d9` in light mode, `#2b6cb0` to `#1a365d` in dark mode).
- **Typography:** Bold uppercase/title-case title (`13px`, weight 700, letter-spacing `0.02em`) with a muted subtitle (`11px`, weight 500).

---

## 3. Typography Hierarchy

Using high-legibility system sans-serif font stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`, paired with `JetBrains Mono, "Cascadia Code", Consolas, monospace` for cryptographic values.

| Token | Size | Weight | Line Height | Letter Spacing | Purpose |
|---|---|---|---|---|---|
| `display-lg` | `28px` | 800 | `1.2` | `-0.025em` | Hero titles |
| `heading-1` | `22px` | 700 | `1.25` | `-0.015em` | Main section headings |
| `heading-2` | `16px` | 600 | `1.3` | `-0.01em` | Card titles, group headers |
| `heading-3` | `14px` | 600 | `1.35` | `0` | Sub-section headers |
| `body-base` | `13px` | 400/500 | `1.45` | `0` | Standard body & form text |
| `body-sm` | `12px` | 400/500 | `1.4` | `0.01em` | Secondary descriptions, hints |
| `caption` | `11px` | 500/600 | `1.3` | `0.02em` | Badges, metadata, timestamps |
| `mono-code` | `12px` | 500 | `1.4` | `0` | Hashes, prefixes, metrics |

---

## 4. Color Palette & Accessibility Tokens (WCAG 2.1 AA $\ge 4.5:1$)

### Light Theme
- **App Background (`--app-bg`):** `#f4f6f9` (clean, soft cool gray)
- **Surface (`--surface`):** `#ffffff` (crisp card base)
- **Subtle Surface (`--surface-subtle`):** `#f8fafc` (card headers, secondary tiles)
- **Selected Surface (`--surface-blue`):** `#eef4ff` (selected nav items, active state)
- **Primary Text (`--text`):** `#0f172a` (high contrast slate-900, 15.8:1)
- **Muted Text (`--text-muted`):** `#475569` (slate-600, 6.2:1)
- **Subtle Text (`--text-subtle`):** `#526174` (slate-500, 5.0:1)
- **Border (`--border`):** `#e2e8f0` (clean, subtle boundary)
- **Brand Primary (`--blue-action`):** `#0958d9` (accessible blue fill, white text $\ge 5.2:1$)
- **Action Hover (`--blue-action-hover`):** `#0647b4`
- **Success (`--green` / `--green-soft`):** `#16803c` / `#eaf8ef`
- **Warning / Destructive (`--red` / `--red-soft`):** `#c5222a` / `#fff0f0`
- **Cyan / Info (`--cyan-ink`):** `#006f84`

### Dark Theme
- **App Background (`--app-bg`):** `#0d1117`
- **Surface (`--surface`):** `#161b22`
- **Subtle Surface (`--surface-subtle`):** `#21262d`
- **Selected Surface (`--surface-blue`):** `#1c2d42`
- **Primary Text (`--text`):** `#f0f6fc`
- **Muted Text (`--text-muted`):** `#b0becc`
- **Brand Action (`--blue-action`):** `#1558b0`

---

## 5. Layout Architecture & Navigation Grid

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER: [Logo + PSL Title]   [Top Nav Links]    [Global Search Ctrl+K] [Theme] [Dot] │
├───────────────────┬─────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR (240px)   │ MAIN CANVAS (Flex 1)                                                    │
│                   │                                                                         │
│ [Primary Tools]   │  ┌───────────────────────────────────────────────────────────────────┐  │
│  - Home           │  │ Hero Banner / Page Heading                                        │  │
│  - Generate       │  └───────────────────────────────────────────────────────────────────┘  │
│  - Analyze        │  ┌───────────────────────────────┐ ┌─────────────────────────────────┐  │
│  - Policy         │  │ Primary Action / Form Column  │ │ Visualization / Results Column  │  │
│  - Reuse          │  │ (e.g. Inputs, Sliders)        │ │ (e.g. Live Gauge, Empty State)  │  │
│                   │  └───────────────────────────────┘ └─────────────────────────────────┘  │
│ [Research Lab]    ├─────────────────────────────────────────────────────────────────────────┤
│  - Hashing        │ LOWER OPERATIONAL RAIL (Compact 3-Card Dock)                            │
│  - Attack Sim     │ ┌───────────────────────┐ ┌───────────────────┐ ┌─────────────────────┐ │
│  - Benchmarks     │ │ Laboratory Topology   │ │ Experiment Console│ │ Quick Actions Card  │ │
│  - Reports        │ └───────────────────────┘ └───────────────────┘ └─────────────────────┘ │
│                   ├─────────────────────────────────────────────────────────────────────────┤
│ [Local Status]    │ FOOTER STATUS BAR: [Local API State] · [No Analytics] · [Strict Privacy] │
└───────────────────┴─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Page Specifications & Transformations

### 6.1 Home / Dashboard (`OverviewTopologyLearning.tsx`)
- **Hero Banner:** Elegant dark gradient with cosmic curve, crisp typography, and 2 direct CTA buttons ("Generate Password →", "Run Experiment").
- **Quick Launch Cards:** 4 high-value cards (`Generate`, `Analyze`, `Policy`, `Reuse`) with distinct icons, 1-line description, and subtle right arrow.
- **2-Column Split:**
  - Left: **Recent Experiments** table with status badges (`Completed`, `Running`, `Cancelled`) and duration.
  - Right: **Lab Environment** telemetry summary (Local Offline/Online dot, CPU, Memory, Worker pool) + **Next Up** guided interactive checklist.

### 6.2 Password Analysis (`AnalysisLaboratory.tsx`)
- **Left Column:**
  - Candidate inspection input with reveal toggle and code point counter.
  - "Browser-Only (Private)" badge.
  - Compact "Your Privacy" notice (2 sentences).
  - 3-tile grid: Pattern Matching, Local Blocklist, Model Limits.
- **Right Column:**
  - Initial State: Illustrated lock graphic + 4-step process flow (`Analyze` → `Check` → `Detect` → `Recommend`).
  - Active State: Strength score track, estimated guesses, pattern badges, suggestions, and optional consented HIBP k-anonymity check.

### 6.3 Password Generator
- **Mode Switcher:** Segmented control (`Random Password` vs `Passphrase`).
- **Controls:** Slider for length (8–128) / word count (4–20), character set checkboxes, separator dropdown.
- **Output Area:** Masked/unmasked output, 1-click copy with feedback, "Analyze with local estimator" link, exact theoretical selection entropy ($H = L \cdot \log_2|\Sigma|$).
- **Security Guidance:** 4 bullet cards (Password manager, uniqueness, MFA/passkeys, ephemeral memory).

### 6.4 Hashing Laboratory & Synthetic Attack Simulator
- **Hashing Lab:** Server-owned fixture picker with candidate preview, algorithm dropdown (Argon2id, bcrypt, PBKDF2, SHA-256 baseline), parameter sliders, verifier cards with candidate variant tester (`correct`, `wrong`, `modified`).
- **Attack Simulator:** Bounded strategies (dictionary, bruteforce, pattern, suffix, substitution, word combo), live progress bar, honest attempt accounting, zero secrets disclosure.
