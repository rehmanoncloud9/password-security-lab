# ADR-009: Local CSS Workbench and Browser-Secure Generator

- **Status:** Accepted
- **Date:** 2026-11-15

## Context

The new visual specification asks for a desktop-style technical workbench, full
light/dark themes, resource panels, and a local password generator. The existing
frontend uses React and local CSS. The screenshot file itself is unavailable. A
Docker-inspired visual style does not establish that Docker is part of the product.

## Decision

Retain React/Vite and implement the workbench using local semantic components and
CSS design tokens, adapting public 21st.dev navigation/table patterns rather than
adding Tailwind or copying paid templates. Generate passwords in the browser with
Web Crypto and rejection sampling. Keep local service metrics tied to the real API
health endpoint. Do not add Docker Compose without a concrete tested need.

## Consequences

- Existing core/API boundaries remain unchanged and no UI component framework is
  added.
- Generator values are never automatically persisted; the UI calls the core
  analyzer locally to display an estimate.
- CPU/memory/experiment values reflect actual host/API data or display unavailable.
- The source layout follows the written reference, but exact screenshot comparison
  and browser visual/accessibility testing are still required.
- The npm lock and live audit are now verified; Vite's build/server remain blocked
  in this managed Windows sandbox by child-process `spawn EPERM`.
