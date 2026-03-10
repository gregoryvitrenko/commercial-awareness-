---
phase: 09-podcast-archive
plan: 01
subsystem: api
tags: [redis, upstash, quiz, backfill, admin]

# Dependency graph
requires:
  - phase: 06-bug-fixes-content-quality
    provides: quiz:index sorted set pattern introduced in saveQuiz()
provides:
  - backfillQuizIndex() export in lib/storage.ts — scans all quiz:{date} keys and backfills quiz:index
  - POST /api/admin/backfill-quiz — admin-only one-time migration endpoint
affects: [quiz-archive, podcast-archive]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - cursor-based Redis SCAN loop with Upstash string→number cursor coercion
    - idempotent backfill via zadd nx:true (safe to run multiple times)
    - admin-only route pattern with ADMIN_USER_ID env var (no hardcoded fallback)

key-files:
  created:
    - app/api/admin/backfill-quiz/route.ts
  modified:
    - lib/storage.ts

key-decisions:
  - "backfillQuizIndex() returns 0 immediately when useRedis() is false — no-op in dev, no filesystem equivalent needed"
  - "nx:true on zadd prevents overwriting existing index entries — re-running the backfill is always safe"
  - "Upstash scan() returns cursor as string; coercing via Number() is required before comparing against 0"

patterns-established:
  - "Cursor coercion pattern: cursor = Number(nextCursor) when using Upstash redis.scan()"
  - "Admin migration routes: POST only, no GET, no rate limiting, ADMIN_USER_ID from env with no fallback"

requirements-completed: [INFRA-01]

# Metrics
duration: 8min
completed: 2026-03-10
---

# Phase 9 Plan 1: Quiz Archive Backfill Summary

**Redis cursor-based scan backfill for quiz:index sorted set + admin POST endpoint to populate pre-Phase-6 quiz dates**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-10T20:19:20Z
- **Completed:** 2026-03-10T20:27:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `backfillQuizIndex()` to `lib/storage.ts` — scans all `quiz:{date}` Redis keys via cursor-based loop and writes missing entries into the `quiz:index` sorted set using `nx:true` (idempotent)
- Created `app/api/admin/backfill-quiz/route.ts` — admin-only POST endpoint that triggers the backfill and returns `{ backfilled: N }`
- TypeScript compiles clean (both tasks verified)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add backfillQuizIndex() to lib/storage.ts** - `bb817af` (feat)
2. **Task 2: Create admin backfill route app/api/admin/backfill-quiz/route.ts** - `3f74e84` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `lib/storage.ts` — added `backfillQuizIndex()` export after `listQuizDates()`, with JSDoc, cursor coercion, and `nx:true` idempotency
- `app/api/admin/backfill-quiz/route.ts` — new file; POST handler only; checks `ADMIN_USER_ID` from env; calls `backfillQuizIndex()`; returns `{ backfilled: count }`

## Decisions Made
- `backfillQuizIndex()` returns 0 when Redis is not configured — no filesystem equivalent needed since the quiz:index only matters in production
- `nx:true` on each `zadd` call makes the backfill safe to run multiple times without overwriting existing index entries
- No hardcoded `ADMIN_USER_ID` fallback in the route — consistent with the project security pattern; if env var is missing, returns 403

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

After deploying to Vercel, the admin must call the backfill endpoint once:

```bash
curl -X POST https://www.folioapp.co.uk/api/admin/backfill-quiz \
  -H "Cookie: __session=<your-clerk-session-cookie>"
```

Expected response: `{ "backfilled": N }` where N > 0. Run a second time to confirm idempotency (same count, archive unchanged).

## Next Phase Readiness
- Quiz archive backfill is ready to deploy — push to Vercel and call the route once
- Phase 9 Plan 2 (podcast archive fix) can now proceed
- No blockers

---
*Phase: 09-podcast-archive*
*Completed: 2026-03-10*
