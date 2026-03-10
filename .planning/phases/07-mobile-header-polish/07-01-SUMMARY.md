---
phase: 07-mobile-header-polish
plan: 01
subsystem: ui
tags: [css, tailwind, css-custom-properties, header, bg-paper]

# Dependency graph
requires: []
provides:
  - "--paper CSS variable stores bare HSL channel values (40 20% 98% light / 20 10% 6% dark)"
  - "bg-paper Tailwind class resolves to opaque warm off-white (light) and warm dark (dark)"
  - "Sticky header background is opaque when user scrolls any page"
affects: [07-02, 07-03, any component using bg-paper]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS custom properties used with Tailwind's hsl(var(--token)) pattern must store bare channel values only — no hsl() wrapper in the variable itself"

key-files:
  created: []
  modified:
    - app/globals.css

key-decisions:
  - "Store --paper as bare HSL channels (40 20% 98%) not wrapped in hsl() — Tailwind config already applies hsl(var(--paper)) so the variable must not include a second hsl() call"

patterns-established:
  - "Tailwind hsl(var()) pattern: CSS variable stores H S% L% only; tailwind.config.ts wraps with hsl()"

requirements-completed: [MOBILE-01]

# Metrics
duration: 1min
completed: 2026-03-10
---

# Phase 7 Plan 01: Fix --paper CSS double-wrap Summary

**Removed invalid hsl() double-wrap from --paper CSS variable so bg-paper resolves to an opaque warm color instead of transparent, fixing the sticky header background on scroll**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-10T16:12:54Z
- **Completed:** 2026-03-10T16:13:45Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Fixed `--paper` light mode: changed `hsl(40 20% 98%)` to bare channels `40 20% 98%`
- Fixed `--paper` dark mode: changed `hsl(20 10% 6%)` to bare channels `20 10% 6%`
- Both fixes in `app/globals.css` — the only file in scope

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix --paper CSS variable to store channel values only** - `cbd5cc5` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/globals.css` - Removed `hsl()` wrapper from both `--paper` declarations (lines 35 and 81)

## Decisions Made
None - followed plan as specified. The fix was exactly as described in the plan: Tailwind config uses `hsl(var(--paper))`, so the CSS variable must contain only the HSL channel values without an additional `hsl()` wrapper.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- bg-paper now resolves correctly in both light and dark mode
- Plans 07-02 (hamburger + mobile drawer) and 07-03 (StoryCard min-w-0 fix) are independent and ready to execute
- No blockers for remaining Phase 7 work

---
*Phase: 07-mobile-header-polish*
*Completed: 2026-03-10*
