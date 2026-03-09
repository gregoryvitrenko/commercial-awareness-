---
phase: 04-conversion-surfaces
plan: "02"
subsystem: ui
tags: [tailwind, design-tokens, hero, landing, conversion]

# Dependency graph
requires:
  - phase: 01-design-tokens
    provides: rounded-chrome, rounded-card, text-caption, text-label, section-label tokens in tailwind.config.ts and globals.css
  - phase: 03-content-surfaces
    provides: hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors pattern established as codebase standard
provides:
  - Token-compliant LandingHero.tsx with no arbitrary values or deprecated radius/hover classes
affects: [04-conversion-surfaces]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ".section-label utility class used instead of manual font-mono text-[10px] tracking-widest combination"
    - "rounded-chrome for all button/CTA/link chrome elements in hero"
    - "rounded-card for editorial panel containers in hero"
    - "text-caption replaces text-[13px] and text-[14px] throughout"
    - "text-label replaces text-[12px] throughout"
    - "hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors on dark-bg CTAs (no hover:opacity)"

key-files:
  created: []
  modified:
    - components/LandingHero.tsx

key-decisions:
  - "hero CTA hover: hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors (not hover:opacity-80) — consistent with Phase 3 standard"
  - "Hero headline text-3xl sm:text-4xl intentionally left unchanged — no clean single-token mapping for the 30/36px responsive pair"

patterns-established:
  - "section-label: use utility class alone, never combine with explicit text-stone-400 (already encoded)"

requirements-completed: [CONV-04]

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 4 Plan 02: LandingHero Token Migration Summary

**LandingHero.tsx fully migrated to design tokens: rounded-chrome on all buttons/CTA/links, rounded-card on recommendation panel, text-caption/text-label replacing all arbitrary text-[Npx] values, and hover:bg-stone-700 replacing hover:opacity on the primary CTA**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T23:01:25Z
- **Completed:** 2026-03-09T23:03:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced all 9 arbitrary CSS values in LandingHero.tsx with named design tokens
- Eliminated `rounded-xl` and `rounded-lg` from the hero — `rounded-chrome` (4px) now used consistently on all interactive chrome elements
- `rounded-card` (2px) applied to the recommendation panel for editorial feel
- CTA hover updated from `hover:opacity-80 transition-opacity` to `hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors` — matches Phase 3 established standard
- Top label replaced with `.section-label` utility (font-mono + text-label + tracking-widest + uppercase bundled)

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply radius tokens, text tokens, and hover fix to LandingHero** - `84f6d41` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `/Users/gregoryvitrenko/Documents/Folio/components/LandingHero.tsx` - Migrated to design tokens: section-label, text-caption, text-label, rounded-chrome, rounded-card, hover:bg-stone-700

## Decisions Made
- Hero headline `text-3xl sm:text-4xl` left unchanged — no clean single-token mapping exists for the 30/36px responsive range, and the plan explicitly confirmed this as the correct approach.
- `.section-label` used alone without accompanying `text-stone-400` — the colour is already encoded in the utility class.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- LandingHero is now fully token-compliant, consistent with the design system established in Phases 1-3
- All hero interactive elements (stage buttons, recommendation links, primary CTA) use `rounded-chrome`
- No remaining arbitrary text sizes or deprecated radius/hover classes in this component
- Ready for the next conversion surface plan

---
*Phase: 04-conversion-surfaces*
*Completed: 2026-03-09*
