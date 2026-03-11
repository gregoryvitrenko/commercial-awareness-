---
phase: 12-digest-compliance
plan: 01
subsystem: api
tags: [hmac, crypto, redis, resend, email, unsubscribe, gdpr]

# Dependency graph
requires:
  - phase: 09-podcast-archive
    provides: dual-backend Redis/FS pattern used in opt-out key storage
provides:
  - HMAC-signed unsubscribe URL builder (buildUnsubscribeUrl, signUnsubscribeToken) in lib/email.ts
  - GET /api/unsubscribe — validates HMAC, sets email-opt-out:{email} in Redis, redirects
  - /unsubscribe — branded success/error confirmation page
affects:
  - 12-02 — wires buildUnsubscribeUrl into sendWeeklyDigest and opt-out check before send

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "HMAC token URL signing: crypto.createHmac('sha256', CRON_SECRET).update(email).digest('hex')"
    - "Timing-safe token comparison with Buffer.from(sig, 'hex') + crypto.timingSafeEqual"
    - "Unsubscribe opt-out Redis key: email-opt-out:{email.toLowerCase()} with no TTL"

key-files:
  created:
    - app/api/unsubscribe/route.ts
    - app/unsubscribe/page.tsx
  modified:
    - lib/email.ts

key-decisions:
  - "CRON_SECRET reused as HMAC signing key — avoids new env var; already required by cron; throws at buildUnsubscribeUrl call time if missing (prevents silent unsigned links)"
  - "Redis opt-out key has no TTL — permanent opt-out is correct GDPR behaviour; Plan 02 checks this key before each digest send"
  - "API route still redirects to success on Redis failure — opt-out intent is logged; user experience not blocked by infrastructure hiccup"
  - "No confirmation step before opting out — plan spec: one-click; GDPR/PECR require frictionless unsubscribe"

patterns-established:
  - "Unsubscribe URL pattern: /api/unsubscribe?email={encoded}&sig={64-char-hex}"
  - "Opt-out check pattern: redis.get('email-opt-out:{email.toLowerCase()}') before digest send"

requirements-completed: [DIGEST-02]

# Metrics
duration: 8min
completed: 2026-03-11
---

# Phase 12 Plan 01: Digest Compliance — Unsubscribe Summary

**HMAC-signed one-click unsubscribe endpoint using CRON_SECRET + Node crypto, with Redis opt-out persistence and branded confirmation page**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-11T18:20:00Z
- **Completed:** 2026-03-11T18:28:58Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- `signUnsubscribeToken()` and `buildUnsubscribeUrl()` exported from lib/email.ts — Plan 02 can wire these directly
- GET /api/unsubscribe validates 64-char HMAC sig with timing-safe comparison, sets `email-opt-out:{email}` in Redis with no TTL
- Branded /unsubscribe page renders success ("You've been unsubscribed") or error ("Invalid link") states using stone palette and design tokens
- TypeScript compiles clean with zero errors across all modified files

## Task Commits

Each task was committed atomically:

1. **Task 1: HMAC helpers + unsubscribe API route** - `ee10d27` (feat)
2. **Task 2: Branded unsubscribe confirmation page** - `b0ad293` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `lib/email.ts` — added `signUnsubscribeToken()` and `buildUnsubscribeUrl()` exports; added `import crypto from 'crypto'`
- `app/api/unsubscribe/route.ts` — GET handler: validates HMAC, sets Redis opt-out key, redirects
- `app/unsubscribe/page.tsx` — server component confirmation page with success/error states

## Decisions Made
- CRON_SECRET reused as HMAC signing key — avoids a new env var; already required by cron infrastructure
- Redis opt-out key has no TTL — permanent opt-out is the correct GDPR behaviour
- API route still redirects to success if Redis fails — preserves user experience; intent is logged
- No confirmation step — GDPR/PECR require frictionless one-click unsubscribe per plan spec

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no new env vars. CRON_SECRET is already set in Vercel. Redis is already configured.

## Next Phase Readiness
- Plan 02 can import `buildUnsubscribeUrl` from lib/email.ts directly to wire into digest send
- Plan 02 must check `email-opt-out:{email}` in Redis before sending each digest email
- /api/unsubscribe and /unsubscribe are live on deploy with no further configuration

## Self-Check: PASSED

All files confirmed present on disk. Both task commits verified in git history.

---
*Phase: 12-digest-compliance*
*Completed: 2026-03-11*
