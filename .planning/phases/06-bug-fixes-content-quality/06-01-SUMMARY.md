---
phase: 06-bug-fixes-content-quality
plan: "01"
subsystem: ui
tags: [next.js, tailwind, firms, upgrade]

# Dependency graph
requires: []
provides:
  - Upgrade page without duplicate SiteFooter (root layout covers it)
  - Firm profile deadline rows with isClosed check: CLOSED badge, opacity-60 row, strikethrough date, no Apply button
affects: [firms-page, upgrade-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ISO YYYY-MM-DD lexicographic string comparison for date checks (no Date object needed)"
    - "Conditional Tailwind class via template literal: className={`...${flag ? ' class' : ''}`}"

key-files:
  created: []
  modified:
    - app/upgrade/page.tsx
    - app/firms/[slug]/page.tsx

key-decisions:
  - "SiteFooter removed from upgrade page — root layout already renders it for all pages"
  - "isClosed uses string comparison (deadline.closeDate < today) — ISO YYYY-MM-DD strings compare lexicographically so no Date parsing needed"
  - "CLOSED badge uses font-mono (not font-sans) to match the design principle: monospace for label-style metadata"
  - "Rolling badge wrapped in {!isClosed && ...} — closed deadlines cannot be rolling from user perspective"

patterns-established:
  - "Date comparison: getTodayDate() already in scope at page level — pass down to map callback via closure"
  - "Closed state styling: opacity-60 on container, muted text on label, line-through on dates, hidden Apply button"

requirements-completed: [BUG-01, BUG-02]

# Metrics
duration: 10min
completed: 2026-03-10
---

# Phase 6 Plan 01: Bug Fixes Summary

**Removed duplicate footer on /upgrade and added closed-state deadline rendering on firm profiles: CLOSED badge, greyed row, strikethrough date, no Apply button for past closeDate rows**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-10T02:38:22Z
- **Completed:** 2026-03-10T02:48:22Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Upgrade page no longer renders a second footer — SiteFooter import and JSX element removed (root layout covers it)
- Firm profile deadline rows with `closeDate < today` now show: CLOSED monospace badge, opacity-60 row, muted label text, strikethrough date, no Apply button
- Deadline rows with future or absent closeDate render identically to before
- npm run lint and npm run build both pass with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove duplicate SiteFooter from app/upgrade/page.tsx** - `341679a` (fix)
2. **Task 2: Add closed-state rendering to deadline rows in app/firms/[slug]/page.tsx** - `07e9fa5` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/upgrade/page.tsx` - Removed SiteFooter import (line 7) and JSX usage (line 140)
- `app/firms/[slug]/page.tsx` - Added isClosed logic inside deadline .map() callback; conditional closed badge, opacity, text colour, strikethrough, Apply button visibility

## Decisions Made
- SiteFooter removed from upgrade page only — root layout already renders it for all pages (confirmed in app/layout.tsx line 64)
- isClosed uses ISO string comparison (`deadline.closeDate < today`) — YYYY-MM-DD strings compare lexicographically correctly, no Date object parsing needed
- CLOSED badge uses `font-mono tracking-widest` — consistent with monospace label pattern in the codebase
- Rolling badge wrapped in `{!isClosed && deadline.rolling && ...}` — a closed window cannot be rolling from the user's perspective

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- First `npm run build` run failed with transient webpack cache error (`ENOENT: .next/types/package.json`). Second run succeeded without issue — confirmed pre-existing cache state, not caused by our changes.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Both production bugs fixed and committed
- Changes ready to push and deploy to folioapp.co.uk
- Manual verification after deploy: /upgrade (one footer), /firms/freshfields-bruckhaus-deringer (CLOSED rows for past 2025 deadlines)

---
*Phase: 06-bug-fixes-content-quality*
*Completed: 2026-03-10*

## Self-Check: PASSED

- FOUND: app/upgrade/page.tsx (no SiteFooter references)
- FOUND: app/firms/[slug]/page.tsx (isClosed logic in place)
- FOUND: .planning/phases/06-bug-fixes-content-quality/06-01-SUMMARY.md
- FOUND: 341679a (Task 1 commit — remove duplicate SiteFooter)
- FOUND: 07e9fa5 (Task 2 commit — closed deadline rendering)
