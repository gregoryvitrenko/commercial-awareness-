---
phase: 07-mobile-header-polish
plan: 02
subsystem: ui
tags: [react, next.js, tailwind, mobile, hamburger, nav, touch]

# Dependency graph
requires: []
provides:
  - Hamburger button visible on mobile (flex md:hidden) in Header.tsx
  - Mobile drawer with all nav sections (Daily, Learn, Archive, Practice, Saved) and 44px tap targets
  - Desktop NavDropdowns hidden on mobile (hidden md:flex wrapper)
  - Outside-click listener in NavDropdowns using pointerdown (fires on touch + mouse)
affects: [08-firms-expansion, any plan touching Header.tsx or NavDropdowns.tsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Client component conversion: add 'use client' + useState when server component needs interactivity"
    - "Mobile-first nav: hamburger + flat drawer on mobile, dropdown nav on md+"
    - "pointerdown instead of mousedown for outside-click listeners on touch devices"

key-files:
  created: []
  modified:
    - components/Header.tsx
    - components/NavDropdowns.tsx

key-decisions:
  - "MOBILE_NAV_LINKS defined in Header.tsx (not imported from NavDropdowns) to avoid circular dependency"
  - "Design spec tokens used throughout: text-caption, section-label, rounded-chrome — not raw pixel values from plan sample code"
  - "onMouseEnter/onMouseLeave handlers in NavDropdowns left unchanged — desktop-only, acceptable on md+ where mouse input is expected"

patterns-established:
  - "Mobile drawer: md:hidden, bg-paper, divide-y, min-h-[44px] per link row"
  - "section-label utility class for mobile drawer group headings (not raw font-mono text-[10px])"

requirements-completed: [MOBILE-02]

# Metrics
duration: 1min
completed: 2026-03-10
---

# Phase 7 Plan 02: Mobile Hamburger Menu Summary

**Hamburger button and full-width mobile drawer added to Header.tsx; NavDropdowns outside-click fixed to fire on touch devices via pointerdown**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-10T16:13:05Z
- **Completed:** 2026-03-10T16:14:27Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Header.tsx converted from server to client component; hamburger button (flex md:hidden) added in Row 1 right-side; NavDropdowns wrapped in hidden md:flex so desktop nav hides on mobile
- Mobile drawer renders below header with four nav sections (Daily, Learn, Archive, Practice) plus Saved, all links at 44px minimum tap target height
- NavDropdowns.tsx outside-click listener changed from mousedown/MouseEvent to pointerdown/PointerEvent so dropdowns close on touch taps outside the nav

## Task Commits

Each task was committed atomically:

1. **Task 1: Add hamburger button and mobile drawer to Header.tsx** - `d234d16` (feat)
2. **Task 2: Fix outside-click listener in NavDropdowns.tsx to use pointerdown** - `6729301` (fix)

**Plan metadata:** (see final docs commit)

## Files Created/Modified
- `components/Header.tsx` - Converted to client component; MOBILE_NAV_LINKS constant; hamburger button; hidden md:flex wrapper around NavDropdowns; mobile drawer
- `components/NavDropdowns.tsx` - handleOutsideClick type changed from MouseEvent to PointerEvent; mousedown replaced with pointerdown

## Decisions Made
- MOBILE_NAV_LINKS defined locally in Header.tsx rather than re-exported from NavDropdowns to avoid circular dependency
- Design spec tokens (text-caption, section-label utility, rounded-chrome) used in place of raw pixel values in the plan's sample code (text-[13px], font-mono text-[10px] tracking-widest uppercase, rounded-sm) — spec is authoritative per CLAUDE.md
- onMouseEnter/onMouseLeave handlers in NavDropdowns left unchanged — they are desktop-only interactions and acceptable for md+ viewports

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Design Spec] Replaced raw pixel type sizes with semantic tokens**
- **Found during:** Task 1 (Header.tsx implementation)
- **Issue:** Plan sample code used `text-[13px]` and `font-mono text-[10px] tracking-widest uppercase` which violate design.md (semantic tokens only — `text-caption`, `.section-label` utility class)
- **Fix:** Used `text-caption` for nav link text, `section-label` utility class for group headings, `rounded-chrome` for hamburger button
- **Files modified:** components/Header.tsx
- **Verification:** TypeScript clean; design spec followed
- **Committed in:** d234d16 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — design correctness)
**Impact on plan:** Required for design spec compliance. Functional output identical; only class names changed to use tokens.

## Issues Encountered
None — plan executed cleanly. TypeScript passed on first attempt for both tasks.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- MOBILE-02 satisfied: touch-usable nav at 375px with hamburger + drawer
- Phase 7 (07-01 and 07-03) plans can run independently — no dependencies on this plan
- Desktop nav experience unchanged — safe to deploy immediately

---
*Phase: 07-mobile-header-polish*
*Completed: 2026-03-10*

## Self-Check: PASSED

- FOUND: components/Header.tsx (contains `flex md:hidden`, `hidden md:flex`, `mobileOpen` x5)
- FOUND: components/NavDropdowns.tsx (contains `pointerdown` x2)
- FOUND: .planning/phases/07-mobile-header-polish/07-02-SUMMARY.md
- FOUND commit d234d16: feat(07-02): add hamburger button and mobile drawer to Header.tsx
- FOUND commit 6729301: fix(07-02): fix outside-click listener in NavDropdowns.tsx to use pointerdown
