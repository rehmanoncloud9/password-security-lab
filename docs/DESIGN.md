---
name: Liquid Security Spec
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#4648d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#6063ee'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  canvas-base: '#f4f6fb'
  surface-glass-low: rgba(255, 255, 255, 0.70)
  surface-glass-mid: rgba(255, 255, 255, 0.85)
  surface-glass-high: rgba(255, 255, 255, 0.92)
  glass-border-specular: rgba(255, 255, 255, 0.80)
  glass-border-structural: rgba(15, 23, 42, 0.08)
  telemetry-emerald: '#059669'
  telemetry-amber: '#f59e0b'
  telemetry-crimson: '#ef4444'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  code-display:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: 0.05em
  code-display-mobile:
    fontFamily: JetBrains Mono
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0.03em
  code-body:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses high-assurance cryptographic utility through the optical lens of Liquid Glass. It bridges the tactile, physical refraction of precision optical instruments with the meticulous engineering of modern security software.

### Core Ethos
- **Crystalline Clarity:** Visual affordances simulate refractive, multi-layered silica sheets. Layering conveys functional depth, separating telemetry inputs, evaluation engines, and generated entropy displays.
- **Surgical Precision:** Every border, divider, and hairline metric is calibrated to sub-pixel exactness. Functional data does not compete with decoration; glass textures exist exclusively to create perceptual spatial layering.
- **Calm Authority:** Eliminates cybersecurity tropes of abrasive neon-on-black terminal interfaces. The environment defaults to an ambient, crystalline light space where security strength is conveyed via deep obsidian contrast, cold sapphire telemetry, and sharp emerald validation.

### Design Movement
**Liquid Glass & Utility Minimalist Hybrid.** Characterized by multi-layered translucent substrate panels (`backdrop-filter: blur(20px)` to `blur(36px)`), directional specular light borders, and deep obsidian text rendering ensuring uncompromising WCAG AAA legibility.

## Colors

The palette establishes an optical daylight environment grounded by high-density obsidian inks and illuminated by tactical cryptographic accents.

### Palette Architecture
- **Primary (`#0284c7` - Security Cyan / Azure):** Drives primary actions, active input focus rings, entropy progress rails, and selected segmented control states.
- **Secondary (`#10b981` - Cryptographic Emerald):** Reserved strictly for verified security telemetry: 128-bit+ entropy markers, CSPRNG status confirmations, leak checks returning negative, and copy confirmations.
- **Tertiary (`#6366f1` - Indigo / Hash Metric):** Applied to secondary telemetry, hash algorithm switches (Argon2id, PBKDF2), and non-critical cryptographic metadata badges.
- **Neutral (`#0f172a` - Deep Obsidian Slate):** Provides WCAG AAA contrast for body typography, structural icon glyphs, and high-readability password output streams.

### Glass Substrates & Ambient Tones
- **Canvas Base:** Solid `#f4f6fb` overlaid with soft radial ambient light pools (`rgba(2, 132, 199, 0.04)` and `rgba(99, 102, 241, 0.03)`).
- **Glass Panel Surface:** Translucent white gradients (`rgba(255, 255, 255, 0.70)` to `rgba(255, 255, 255, 0.92)`) configured with refractive inner specular glows.
- **Specular Glass Borders:** Directional lighting (`linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.2) 100%)`) providing structural definition against ambient backgrounds.

## Typography

Typography establishes an intentional dichotomy between clean interface controls (`Inter`) and raw cryptographic artifacts (`JetBrains Mono`).

### Application Hierarchy
- **Inter (Interface & Controls):** Used for structural navigation, field labels, system messaging, and instructional copy. Headlines employ tight negative tracking (`-0.01em` to `-0.03em`) to replicate machined hardware badging.
- **JetBrains Mono (Cryptographic Telemetry):** Used for password output fields, hash representations, entropy scores (`bits`), character pool counts, and byte counters.
- **Glyph Discrimination:** Monospace outputs must preserve distinct glyph rendering for ambiguous characters (`0` vs `O`, `1` vs `l` vs `I`).
- **High-Density Telemetry:** `label-caps` uses uppercase JetBrains Mono with expanded tracking (`0.08em`) to designate status labels (e.g., `CSPRNG ACTIVE`, `NIST SP 800-63B`, `ENTROPY: 128 BITS`).

## Layout & Spacing

The layout is governed by a responsive 12-column grid designed for utility density and balanced visual breathing room.

### Layout Mechanics
- **Max Content Container:** `1280px` centered horizontal container width for laboratory dashboards.
- **Desktop (1024px+):** 12-column structure with `1.5rem` (`24px`) gutters and `2rem` (`32px`) margins. Supports an asymmetrical split: 4 columns for parameter controls (character pools, salt length, algorithm toggles) and 8 columns for live entropy telemetry, generation visualizers, and raw output streams.
- **Tablet (768px - 1023px):** 8-column layout with `1.25rem` (`20px`) gutters and `1.5rem` (`24px`) margins. Controls and displays collapse into a unified vertical stack.
- **Mobile (Below 768px):** 4-column layout with `0.75rem` (`12px`) gutters and `1rem` (`16px`) canvas margins. Floating action bars anchor to the bottom edge with liquid glass backdrop blur.

### Spacing Scale
- `space-xs` (4px): Micro-gaps between telemetry metric numbers and units (e.g., `128` and `bits`).
- `space-sm` (8px): Gaps between segmented control items, inner checkbox label alignment, and chip tags.
- `space-md` (16px): Internal padding for modular glass cards, input fields, and standard component stacks.
- `space-lg` (24px): Padding for primary generation panels and vertical separation between metric groupings.
- `space-xl` (40px): Section-level vertical separation and layout header offsets.

## Elevation & Depth

Depth is conveyed through real-time glass refraction, precise directional light transmission, and multi-layered surface occlusion rather than heavy drop shadows.

### Glassmorphism & Surface Stack
- **Surface Level 0 (Canvas Base):** Ground substrate at `#f4f6fb`. Does not blur.
- **Surface Level 1 (Primary Glass Cards & Sidebars):**
  - Background: `rgba(255, 255, 255, 0.70)`
  - Filter: `backdrop-filter: blur(20px) saturate(160%)`
  - Border: `1px solid rgba(255, 255, 255, 0.60)`
  - Shadow: `0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)`
- **Surface Level 2 (Interactive Floating Modules & Generated Displays):**
  - Background: `rgba(255, 255, 255, 0.85)`
  - Filter: `backdrop-filter: blur(28px) saturate(180%)`
  - Border: `1px solid rgba(255, 255, 255, 0.80)`
  - Inner Glow: `inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)`
  - Shadow: `0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.03)`
- **Surface Level 3 (Modals, Command Bars & Popovers):**
  - Background: `rgba(255, 255, 255, 0.92)`
  - Filter: `backdrop-filter: blur(36px) saturate(200%)`
  - Border: `1px solid #ffffff`
  - Shadow: `0 24px 48px -12px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.05)`

### Specular Highlighting
All elevated borders utilize an angled linear gradient that simulates a single light source from the top-left:
`linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.15) 100%)`.
When a component receives keyboard or mouse focus, the border seamlessly transitions to:
`linear-gradient(135deg, rgba(2, 132, 199, 0.8) 0%, rgba(14, 165, 233, 0.25) 100%)`.

## Shapes

The design system employs a refined curvature scale (`roundedness: 2`) that evokes machined optical lenses and continuous curvature Apple-style squircles.

### Corner Radii Guidelines
- **Base Components (`0.5rem` / `8px`):** Used for inner control elements, high-density checkboxes, segmented control pills, and small input fields.
- **Large Panels & Glass Containers (`rounded-lg: 1rem` / `16px`):** Applied to primary control cards, telemetry stat displays, and code output panels.
- **Top-Level Floating Surfaces (`rounded-xl: 1.5rem` / `24px`):** Applied to main dashboard window containers, modals, and floating telemetry HUDs.
- **Pill Form Factors (`9999px`):** Applied selectively to status chips (e.g., `128 BITS`), CSPRNG operational badges, copy confirmation buttons, and slider thumbs.

## Components

### Ephemeral Password Output Display
The core component of the laboratory. It renders generated cryptographic values with maximum clarity.
- **Surface:** Level 2 glass container with an expanded `padding: 1.5rem`.
- **Text Rendering:** `code-display` typography with dynamic color-coding: letters in `#0f172a`, numbers in `#0284c7`, symbols in `#6366f1`, and ambiguous characters highlighted with a subtle amber badge when excluded.
- **Floating Action Deck:** Glass action buttons (`Copy`, `Regenerate`, `Inspect Entropy`) anchored inside the right edge of the display with `backdrop-filter: blur(12px)` and `rounded: 0.5rem`.
- **Entropy Indicator Rail:** A 3px tall line running along the bottom border of the output card. Transitions dynamically between `#ef4444` (&lt;40 bits), `#f59e0b` (40-64 bits), `#0284c7` (65-127 bits), and `#10b981` (128+ bits).

### Segmented Controls (Tabbed Selectors)
- **Container:** Recessed pill track with `background: rgba(15, 23, 42, 0.05)`, `padding: 3px`, and `border-radius: 0.5rem`.
- **Active Indicator:** Smoothly sliding tactile frosted pill (`background: #ffffff`, `backdrop-filter: blur(8px)`, `box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08)`).
- **Text:** `body-md` weight; transitions from muted slate (`#64748b`) when inactive to obsidian (`#0f172a`) with font-weight `600` when active.

### Interactive Slider (Length & Entropy Parameter)
- **Track:** 6px height with `background: rgba(15, 23, 42, 0.08)`, `border-radius: 9999px`. Active fill uses an electric azure gradient (`linear-gradient(90deg, #0ea5e9, #0284c7)`).
- **Thumb:** 22px diameter circle. `background: #ffffff`, `border: 2px solid #0284c7`, with a soft ambient luminescence: `box-shadow: 0 0 12px rgba(2, 132, 199, 0.35), 0 2px 4px rgba(15, 23, 42, 0.1)`. Active drag state expands thumb scale to `1.15x`.

### High-Density Security Checkboxes & Radio Buttons
- **Box Size:** 18px x 18px with `border-radius: 5px` (checkboxes) or circular `9999px` (radios).
- **Inactive State:** `background: rgba(255, 255, 255, 0.8)`, `border: 1.5px solid rgba(15, 23, 42, 0.2)`.
- **Checked State:** `background: #0284c7`, `border-color: #0284c7`. Crisp white SVG glyph rendered at center.
- **Labeling:** Paired with descriptive sublabels set in `body-sm` (`#64748b`).

### Status Badges & Chips
- **Container:** Pill-shaped (`9999px`), `padding: 2px 10px`, `border: 1px solid`.
- **Cryptographic Green State:** `background: rgba(16, 185, 129, 0.12)`, `border-color: rgba(16, 185, 129, 0.3)`, text in `#059669`. Prepended with an animated 6px pulsing dot.
- **Azure Active State:** `background: rgba(2, 132, 199, 0.10)`, `border-color: rgba(2, 132, 199, 0.25)`, text in `#0284c7`.

### Keyboard Shortcut Badges
- **Container:** Inline micro-pill with `background: rgba(255, 255, 255, 0.9)`, `border: 1px solid rgba(15, 23, 42, 0.12)`, `box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05)`, and `border-radius: 4px`.
- **Typography:** `label-caps` set in `JetBrains Mono` (`10px`), text in `#0f172a`.