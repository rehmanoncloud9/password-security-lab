# UI Accessibility Review

## Source-level provisions

- Native button, input, select, heading, table, and navigation semantics are used.
- Interactive controls have visible labels or accessible names; state badges include
  text, not color alone.
- Keyboard focus styling and a `prefers-reduced-motion` rule are present.
- `scripts/check-contrast.mjs` checks the semantic light/dark foreground/background
  token pairs and white action-button text against the WCAG AA 4.5:1 target. This is
  a source-token regression check, not a rendered-component or full-page audit.
- The theme toggle has an explicit accessible label.
- Form and API errors are rendered in the relevant feature area.
- Benchmark results have table/text representations alongside visual bars.

## Verification not completed

No browser, keyboard-only walkthrough, screen reader, automated accessibility scan,
or rendered WCAG contrast audit could run because the npm dependencies could not be
installed. The token contrast check passed for its selected semantic pairs. Do not
claim WCAG 2.2 AA conformance until full-page checks are executed in both themes and
at narrow/mobile widths. Record tool and browser versions in
[UI Verification](UI-VERIFICATION.md).
