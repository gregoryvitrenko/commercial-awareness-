---
phase: 34
plan: 02
subsystem: events-ui
tags: [visual, redesign, cards, events]
dependency_graph:
  requires: []
  provides: [EventsPage centered heading, EventCard rounded-2xl with REGISTER INTEREST]
  affects: [app/events/page.tsx, app/events/CityFilter.tsx, lib/types.ts]
tech_stack:
  added: []
  patterns: [centered heading block, rounded-2xl card, formatDateDisplay helper, optional registrationUrl field]
key_files:
  modified:
    - app/events/page.tsx
    - app/events/CityFilter.tsx
    - lib/types.ts
decisions:
  - registrationUrl added as optional field to LegalEvent — falls back to /events/[id] when absent
  - EventCard is now a div wrapper, not a Link; only the REGISTER INTEREST button at bottom is the link target
  - formatDateDisplay added alongside formatShortDate (both coexist — formatShortDate still used in city filter display context)
  - Back links removed from both renders per plan (Phase 32 header shell handles navigation)
  - Unused Link import removed from page.tsx
metrics:
  duration: 5m
  completed: 2026-03-13
  tasks: 2
  files_modified: 3
---

# Phase 34 Plan 02: Events Page Redesign Summary

Centered the events page heading to a large 64px serif "Upcoming Events" with "PROFESSIONAL NETWORK" overline, and redesigned EventCard to rounded-2xl with category chip + date header row and a full-width outlined "REGISTER INTEREST" link at the bottom.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update events page heading to centered large serif | 1ffe319 | app/events/page.tsx |
| 2 | Redesign EventCard — rounded-2xl, date top-right, REGISTER INTEREST button | 1ffe319 | app/events/CityFilter.tsx, lib/types.ts |

## Changes Made

**app/events/page.tsx:**
- Both heading blocks (empty-state and main render) updated to centered layout with section-label overline + 64px serif title + centered description
- Back links (`← Home`) removed from both renders
- Unused `Link` import removed

**app/events/CityFilter.tsx:**
- `formatDateDisplay` helper added (produces "15 JAN 2026" uppercase display format)
- `EventCard` fully redesigned: div wrapper (not Link), rounded-2xl border, category chip top-left + date top-right, serif title, time/location row, full-width outlined "REGISTER INTEREST" link at bottom
- All other exports (EventsGrid, CityFilter, EVENT_TYPE_COLOURS, formatShortDate) unchanged

**lib/types.ts:**
- Added `registrationUrl?: string` to LegalEvent interface (auto-fix Rule 3 — required to avoid TypeScript error on `event.registrationUrl`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added registrationUrl to LegalEvent type**
- **Found during:** Task 2
- **Issue:** `event.registrationUrl` referenced in new EventCard but field did not exist in `LegalEvent` interface — would have caused TypeScript error
- **Fix:** Added `registrationUrl?: string` as optional field to `LegalEvent` in lib/types.ts
- **Files modified:** lib/types.ts
- **Commit:** 1ffe319

## Self-Check: PASSED

- app/events/page.tsx: modified and committed (1ffe319)
- app/events/CityFilter.tsx: modified and committed (1ffe319)
- lib/types.ts: modified and committed (1ffe319)
- TypeScript: clean (0 errors)
