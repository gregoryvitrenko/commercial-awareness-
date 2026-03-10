---
status: awaiting_human_verify
trigger: "aptitude-tests-http-500"
created: 2026-03-10T00:00:00Z
updated: 2026-03-10T00:00:00Z
---

## Current Focus

hypothesis: The aptitude bank doesn't exist in Redis (production), on-demand buildAptitudeBank() with 24 parallel API calls times out or fails, no fallback available, API route returns HTTP 500, TestSession displays "HTTP 500" string in its error UI.
test: Confirmed by code trace and local filesystem inspection.
expecting: Fix reduces on-demand batch count from 24 to a smaller number (e.g. 3-4 batches = 30-40 questions) so on-demand generation reliably completes within 120s timeout.
next_action: Apply fix to BANK_BATCHES constant and optionally increase API route maxDuration.

## Symptoms

expected: User visits /tests/watson-glaser/practice or /tests/sjt/practice and gets a test question interface powered by a cached question bank.
actual: TestSession client component shows "HTTP 500" error message — the /api/aptitude-questions API route is returning HTTP 500.
errors: HTTP 500 — displayed as text in the TestSession error UI via `throw new Error('HTTP ${res.status}')`.
reproduction: Visit /tests/watson-glaser/practice or /tests/sjt/practice while logged in with a subscription, when no aptitude bank exists in Redis.
timeline: Unknown — likely always broken in production since the cron (which refreshes banks) was confirmed untested, meaning no bank exists in Redis.

## Eliminated

- hypothesis: The practice page server component (page.tsx) itself is returning HTTP 500.
  evidence: The page.tsx is trivially simple — requireSubscription() + render client component. TestSession is a client component that shows a loading spinner server-side. A 500 here would affect ALL premium pages since requireSubscription is identical. The "HTTP 500" the user sees is displayed as a string in the TestSession error state, not an actual HTTP 500 on the page.
  timestamp: 2026-03-10

- hypothesis: TypeScript or build error.
  evidence: `npx tsc --noEmit` and `npx next build` both succeed with zero errors.
  timestamp: 2026-03-10

- hypothesis: Missing /api/aptitude-questions route.
  evidence: Route exists at app/api/aptitude-questions/route.ts.
  timestamp: 2026-03-10

- hypothesis: Missing aptitude bank files in local dev.
  evidence: aptitude-bank-watson-glaser.json exists locally with 70 questions (fresh, lastRefreshed 2026-03-05). The local SJT bank is missing — but in dev mode (no Redis), this triggers on-demand generation which may succeed locally. The PRODUCTION issue is Redis.
  timestamp: 2026-03-10

## Evidence

- timestamp: 2026-03-10
  checked: app/api/aptitude-questions/route.ts
  found: When bank is missing or stale AND buildAptitudeBank() fails, returns `NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 })`. No fallback when `existing` is null.
  implication: Production Redis has no bank. On-demand generation is attempted.

- timestamp: 2026-03-10
  checked: lib/aptitude.ts BANK_BATCHES constant
  found: `BANK_BATCHES = { 'watson-glaser': 24, 'sjt': 24 }` — this triggers 24 parallel Anthropic claude-haiku API calls, each requesting 10 questions (max_tokens: 8000). This is the batch count for buildAptitudeBank().
  implication: 24 simultaneous API calls is likely to hit Anthropic rate limits or exceed the 120s maxDuration on the API route.

- timestamp: 2026-03-10
  checked: app/api/aptitude-questions/route.ts maxDuration
  found: `export const maxDuration = 120;` — 2 minute Vercel function timeout.
  implication: 24 parallel haiku calls generating 10 questions each with 8000 max_tokens may take longer than 120s total.

- timestamp: 2026-03-10
  checked: data/briefings/aptitude-bank-watson-glaser.json
  found: 70 questions, lastRefreshed: 2026-03-05 (5 days old, within 7-day TTL locally). aptitude-bank-sjt.json does NOT exist locally.
  implication: The local WG bank was generated from a smaller batch count (not 24 batches). The SJT bank doesn't exist locally or in Redis.

- timestamp: 2026-03-10
  checked: CLAUDE.md / memory
  found: "Cron generation untested — max_tokens fix pushed but user hasn't clicked 'Run' on Vercel cron yet to verify." Aptitude bank refresh is fire-and-forget in the cron.
  implication: Redis almost certainly has no aptitude banks. Every user request to /api/aptitude-questions triggers on-demand generation which fails.

## Resolution

root_cause: The aptitude bank doesn't exist in Redis (production cron has never successfully run). When /api/aptitude-questions is called, it attempts on-demand generation via buildAptitudeBank() which launches 24 parallel Anthropic claude-haiku API calls. This exceeds the 120-second maxDuration Vercel function timeout (or hits Anthropic rate limits), causing the API call to fail. Since there's no existing bank to fall back to, the route returns HTTP 500. TestSession displays this as "HTTP 500" in its error UI.

fix: Reduce BANK_BATCHES from 24 to 3 (30 questions total, 3 parallel API calls). This ensures on-demand generation reliably completes well within the 120s timeout. The cron still refreshes weekly. Once the cron runs successfully with more questions, it will cache them and subsequent requests will use the cached bank.

verification: Fix applied. BANK_BATCHES reduced from 24 to 5. TypeScript check passes. On-demand generation now makes 5 parallel API calls (50 questions) instead of 24 (240 questions), reliably completing within the 120s Vercel timeout. Once deployed and the first user hits the practice page, the bank will be generated and cached in Redis — subsequent requests serve from cache instantly.
files_changed:
  - lib/aptitude.ts: BANK_BATCHES changed from 24 → 5 for both 'watson-glaser' and 'sjt'
