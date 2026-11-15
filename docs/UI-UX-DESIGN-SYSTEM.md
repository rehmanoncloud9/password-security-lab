# UI/UX Design System

## Direction

The web client is a light-first technical workstation for the Password Security
Laboratory. It adapts the supplied written Wireshark/Docker Desktop composition:
compact top navigation, a module sidebar, a dense central workspace, live
operational rail, and three lower inspection panels. The reference screenshot file
was not present in the repository, so pixel comparison is not claimed.

The public 21st.dev Sidebar and Project Management Table examples were reviewed.
Their interaction patterns informed navigation and tabular inspection; native
React/CSS components were used to fit the existing app without adding Tailwind or
copying premium templates. Sources: [Sidebar](https://docs.21st.dev/@wensity/components/sidebar)
and [Project Management Table](https://docs.21st.dev/@shadcnspace/components/table-01).

## Tokens

Light theme uses a `#F5F7FA` workspace, white cards, `#F8FAFC` inset surfaces,
`#1677FF` primary blue, `#0958D9` deep blue, `#00B8D9` cyan, `#16A34A` success,
`#EF4444` error, `#111827` primary text, `#526174` secondary text, and `#DCE5EF`
borders. Dark mode remaps semantic tokens to graphite and charcoal surfaces while
retaining blue selection, cyan technical accents, emerald success and red errors.
The implementation's full values are in `apps/web/src/styles.css`.

Color is paired with text/status labels. No warning, pass, or failure depends on
color alone. Typography uses local system sans and monospace stacks; the app does
not fetch remote fonts.

## Interaction rules

- Use compact labels and tables for technical values; expose detailed explanation
  next to the result that it interprets.
- Show measured values with units and distinguish estimates from measurements.
- Show service unavailable, empty, loading, and operation errors as separate states.
- Never render a plausible-looking sample measurement when no run has occurred.
- Keep the analyzer local; lab submissions require an explicit action.
- Use visible focus styles, semantic headings, native controls, reduced-motion
  preferences, and text alternatives for chart measurements.

## Theme preference and privacy

The theme toggle stores only the display key `psl-theme` in local storage. Password,
generated values, and sample reuse entries are not stored there or in session
storage. Theme defaults to the operating-system preference when no saved choice exists.

## Verification state

The current CSS and component source have not been rendered in a browser in this
environment. Contrast ratios, layout behavior, and visual fidelity remain unverified;
see [UI Verification](UI-VERIFICATION.md).
