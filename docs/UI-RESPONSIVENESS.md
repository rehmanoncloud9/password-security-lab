# UI Responsiveness

CSS breakpoints are currently defined at 1420, 1160, 800, and 560 CSS pixels in
`apps/web/src/styles.css`. The wide workstation presents the sidebar, central
workspace, right rail, and lower panels together. Narrower layouts reduce columns,
move the right rail/lower panels into document flow, and collapse navigation for
small screens. Tables and long verifier strings have local overflow/word-wrap rules.

The stylesheet includes reduced-motion handling. No screenshot or browser viewport
test was run in the supplied environment, so the described layout is source intent,
not demonstrated responsive acceptance. See [UI Verification](UI-VERIFICATION.md).
