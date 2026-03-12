---
phase: 20-design-system-tokens
plan: "01"
subsystem: design-system
tags: [tokens, radius, colour, tailwind, css-variables]
dependency_graph:
  requires: []
  provides: [rounded-card-24px, rounded-chrome-16px, oxford-blue-colour]
  affects: [all-components-using-rounded-card, all-components-using-rounded-chrome]
tech_stack:
  added: []
  patterns: [css-variable-token-propagation, tailwind-extend-colors]
key_files:
  created: []
  modified:
    - app/globals.css
    - tailwind.config.ts
decisions:
  - "radius-card updated to 1.5rem (24px) — replaces editorial flat 2px with premium rounded-3xl aesthetic"
  - "radius-chrome updated to 1rem (16px) — softened from 4px badge style to rounded-2xl"
  - "oxford-blue registered with DEFAULT/light/dark variants to support all Tailwind utility patterns"
metrics:
  duration: "< 1 min"
  completed: "2026-03-12T22:10:37Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 20 Plan 01: Design System Tokens Summary

**One-liner:** CSS variable radius tokens updated to 24px/16px premium aesthetic and oxford-blue (#002147) colour registered in Tailwind config.

## What Was Built

Two design token files updated to establish the v2 Premium Experience aesthetic foundation:

1. **globals.css** — `--radius-card` changed from `0.125rem` (2px) to `1.5rem` (24px); `--radius-chrome` changed from `0.25rem` (4px) to `1rem` (16px). These CSS variables propagate automatically via Tailwind JIT to all 17+ components using `rounded-card` and `rounded-chrome` — no component edits needed.

2. **tailwind.config.ts** — `oxford-blue` colour token added to `theme.extend.colors` with `DEFAULT: '#002147'`, `light: '#1a3a5c'`, and `dark: '#001530'`. Enables `bg-oxford-blue`, `text-oxford-blue`, `border-oxford-blue`, and hover/dark variants.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update radius CSS variables in globals.css | 2f8a01b | app/globals.css |
| 2 | Register oxford-blue colour in tailwind.config.ts | e094dfc | tailwind.config.ts |

## Verification

- `--radius-card: 1.5rem` confirmed in globals.css :root block
- `--radius-chrome: 1rem` confirmed in globals.css :root block
- `oxford-blue` with DEFAULT/light/dark confirmed in tailwind.config.ts colors block
- `npx tsc --noEmit` passes with zero errors
- No other tokens, safelist entries, or component files touched

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- app/globals.css: FOUND with updated radius tokens
- tailwind.config.ts: FOUND with oxford-blue colour
- Commit 2f8a01b: FOUND
- Commit e094dfc: FOUND
