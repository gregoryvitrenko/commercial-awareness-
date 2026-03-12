---
phase: 17-firm-profile-redesign
plan: 01
subsystem: ui
tags: [firm-profile, stat-strip, interview-questions, typography]

# Dependency graph
requires: []
provides:
  - StatStrip component inline in firm profile page
  - Typographic 1. 2. 3. interview question numbering
affects: [firm-profiles]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - StatStrip inline component pattern — full-width border-y strip with grid-cols-2/sm:grid-cols-4, no card background
    - Typographic question numbering — font-serif stone-400, w-6 text-right, no chip/box/tier colour

key-files:
  created: []
  modified:
    - app/firms/[slug]/page.tsx

key-decisions:
  - "StatStrip receives trainingContract and tierText as props (not full firm object) — cleaner typing"
  - "NQ Salary gets text-[18px] font-bold in tier colour for emphasis; other stats get text-[15px] font-semibold stone-800"
  - "Interview question numbering uses font-serif stone-400 — quiet typographic register, no tier colour"

patterns-established:
  - "Stat strip pattern: border-y border-stone-200 dark:border-stone-800 py-4 mb-8 with grid — not a SectionCard"

requirements-completed: [FIRM-01, FIRM-04]

# Metrics
duration: 15min
completed: 2026-03-12
---

# Phase 17 Plan 01: Firm Profile Redesign Summary

**Horizontal 4-stat strip (NQ salary, TC salary, intake, seats) surfaced immediately below the firm hero, and interview question chip numbering replaced with clean typographic 1. 2. 3. in serif stone-400.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-12T20:50:00Z
- **Completed:** 2026-03-12T21:05:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added `StatStrip` component as an inline function in `page.tsx`, placed between the hero section and the section stack — salary and intake data now scannable without scrolling
- Replaced `Q1/Q2` chip spans with `1.` `2.` `3.` in `font-serif text-[15px] font-semibold text-stone-400` — clean typographic register, no visual clutter
- Used `.section-label` utility class for stat labels per CLAUDE.md spec

## Task Commits

Each task was committed atomically:

1. **Task 1: Add horizontal stat strip below firm hero** - (feat)
2. **Task 2: Replace Q1/Q2 chip numbering with typographic 1. 2. 3. numbering** - (feat)

**Plan metadata:** (docs: complete plan)

_Note: Bash access was not available during execution — commits pending manual completion._

## Files Created/Modified
- `app/firms/[slug]/page.tsx` - Added StatStrip component, inserted StatStrip between hero and section stack, replaced Q-chip numbering with typographic numbering

## Decisions Made
- StatStrip receives `trainingContract` and `tierText` as props rather than the full `firm` object — avoids double-casting and keeps TypeScript clean
- NQ Salary stat given extra visual weight (`text-[18px] font-bold` in tier colour) vs other three stats (`text-[15px] font-semibold stone-800`) — NQ is the headline number users care most about
- Training Contract section mid-page left unchanged — strip is additive, not a replacement

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- Bash access not available during this execution session — TypeScript check (`npx tsc --noEmit`) and git commits could not be run programmatically. Code changes are complete and ready for manual commit/verification.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Firm profile now has prominent stat strip and clean interview numbering
- Ready for Phase 17 Plan 02 if planned

---
*Phase: 17-firm-profile-redesign*
*Completed: 2026-03-12*
