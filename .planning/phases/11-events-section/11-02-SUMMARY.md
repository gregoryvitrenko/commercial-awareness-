---
phase: 11-events-section
plan: "02"
subsystem: api
tags: [events, ics, calendar, cron, rfc5545, tavily, claude-haiku]

requires:
  - phase: 11-events-section-plan-01
    provides: [generateEvents, getEvents, LegalEvent, EventsStore]

provides:
  - GET /api/events (CRON_SECRET-gated event generation endpoint)
  - GET /api/events?id={id}&format=ics (unauthenticated .ics download)

affects: [plan-03-ui-pages]

tech-stack:
  added: []
  patterns: [rfc5545-ics-generation, cron-auth-gate, dual-branch-get-handler]

key-files:
  created:
    - app/api/events/route.ts
  modified: []

key-decisions:
  - "Single GET handler branches on query params (format=ics+id vs cron) — same pattern as rest of codebase"
  - "No requireSubscription on this route — events are free tier"
  - "maxDuration=120 not 300 — events generation (6 Tavily queries + Haiku) is faster than full briefing"
  - ".ics uses DTSTART;TZID=Europe/London for timed events and DTSTART;VALUE=DATE for all-day — RFC 5545 compliant"
  - "CRLF line endings in .ics template (RFC 5545 requirement)"

patterns-established:
  - "RFC 5545 .ics generation: pure TypeScript template string with CRLF joins, no npm package"
  - "isCronAuthorized: fail-closed — if CRON_SECRET unset, deny all cron requests"

requirements-completed: [EVT-02, EVT-04]

duration: 3min
completed: 2026-03-11
---

# Phase 11 Plan 02: Events API Route Summary

**Events cron endpoint and RFC 5545 .ics calendar download in a single GET handler — no subscription gate, Europe/London TZID, CRLF-compliant**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-11T09:42:28Z
- **Completed:** 2026-03-11T09:45:30Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- GET /api/events wired as Monday 07:00 UTC cron target (CRON_SECRET auth, 401 on failure)
- GET /api/events?id={id}&format=ics returns valid iCalendar file with correct MIME type and Content-Disposition
- RFC 5545 compliant .ics: CRLF line endings, DTSTART;TZID=Europe/London for timed events, DTSTART;VALUE=DATE for all-day
- No subscription gate — events section is free tier as per plan

## Task Commits

1. **Task 1: Create app/api/events/route.ts with cron + .ics handlers** - `7230b71` (feat)

## Files Created/Modified
- `app/api/events/route.ts` — GET handler: cron generation branch + .ics download branch; isCronAuthorized, addHour, escapeIcs, generateIcs helpers

## Decisions Made
- Single GET handler with branch on `format=ics && id` query params — consistent with existing route patterns in codebase
- `maxDuration = 120` (not 300) — events generation pipeline (6 Tavily queries + Haiku) completes well within 2 minutes, no need for full 5-minute briefing timeout
- isCronAuthorized copied verbatim from generate route pattern with `[events]` log prefix

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. CRON_SECRET already set in Vercel from plan 01 phase (shared with /api/generate).

## Next Phase Readiness
- Events API route complete — ready for plan 03 (UI pages: /events listing + city filter tabs)
- Monday 07:00 UTC cron in vercel.json (from plan 01) now has a working endpoint to hit
- .ics download ready for wiring into UI event cards

---
*Phase: 11-events-section*
*Completed: 2026-03-11*
