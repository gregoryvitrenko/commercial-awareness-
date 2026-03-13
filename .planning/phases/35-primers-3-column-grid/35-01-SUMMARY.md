---
phase: 35-primers-3-column-grid
plan: "01"
subsystem: primers
tags: [ui, layout, primers, card-redesign]
dependency_graph:
  requires: []
  provides: [primers-3col-grid, primer-card-mockup]
  affects: [app/primers/page.tsx, components/PrimerCard.tsx]
tech_stack:
  added: []
  patterns: [outlined-chip, serif-title-card, strapline-display]
key_files:
  modified:
    - app/primers/page.tsx
    - components/PrimerCard.tsx
decisions:
  - "Used pre-existing strapline field from Primer type rather than description — field was already populated in primers-data.ts"
  - "Pre-existing archive TypeScript error (formatColumnDate) deferred — out of scope"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-13"
---

# Phase 35 Plan 01: Primers 3-Column Grid + PrimerCard Redesign Summary

Rebuilt primers page grid (2-col → 3-col at lg breakpoint) and PrimerCard component to match the mockup: outlined category chip + clock/read time on one top row, large 28px serif title, strapline text, thin divider, "READ PRIMER ↗" uppercase link.

## What Changed

### app/primers/page.tsx
- Container widened from `max-w-5xl` to `max-w-6xl` to accommodate 3 cards
- Grid updated from `grid-cols-1 sm:grid-cols-2 gap-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`

### components/PrimerCard.tsx (before vs after)

**Before:**
- Category shown via `section-label` utility class (mono font, no border)
- Clock icon below the title
- No strapline text shown
- "Read Primer ↗" in mixed case, smaller tracking
- No top row layout (chip and clock not paired)

**After:**
- Top row: outlined category chip (`border border-stone-300 rounded px-2 py-0.5`) left, clock + "X MIN" right — both on one `flex justify-between` row
- Large serif title (`font-serif text-[28px] font-bold`) as the primary visual element
- Strapline paragraph below title (`line-clamp-2`)
- `mt-auto` divider pushes "READ PRIMER ↗" (all-caps, `tracking-[0.15em]`) to the card bottom
- Zero section counts, key terms counts, or coloured dots

## Deviations from Plan

None — plan executed exactly as written.

## Deferred Issues

- `app/archive/page.tsx`: `formatColumnDate` referenced but not defined — pre-existing bug, deferred. See `deferred-items.md`.

## Self-Check

- [x] `app/primers/page.tsx` exists and contains `lg:grid-cols-3`
- [x] `components/PrimerCard.tsx` exists and contains "READ PRIMER"
- [x] Commit `1d271d8` exists
- [x] TypeScript errors in modified files: zero (archive error is pre-existing/out-of-scope)
