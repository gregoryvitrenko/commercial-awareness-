---
status: awaiting_human_verify
trigger: "cron-autogeneration-stopped — Daily auto-generation has not run since March 5th"
created: 2026-03-10T00:00:00Z
updated: 2026-03-10T01:00:00Z
---

## Current Focus

hypothesis: Root cause is one of two infrastructure issues: (1) CRON_SECRET missing/wrong in Vercel env vars causing 401 on every invocation, or (2) Vercel cron hitting apex domain which 307-redirects to www, and cron does not follow redirects. Code analysis is complete — no code changes caused the stoppage. The breakage requires user inspection of the Vercel dashboard.
test: User checks Vercel dashboard: Cron job logs (response codes) + Environment Variables (CRON_SECRET present and matching).
expecting: Dashboard will show either 401 responses (CRON_SECRET issue) or 307 responses (redirect issue), or the env var will be missing entirely.
next_action: CHECKPOINT — user must inspect Vercel dashboard and report back what they find.

## Symptoms

expected: Every day at 06:00 UTC, GET /api/generate runs and produces a new briefing JSON, quiz JSON, and podcast script.
actual: No new briefings have appeared since March 5th. The site shows March 5th as the last available briefing. March 6-10 are all missing.
errors: Unknown — no error message visible to user.
reproduction: Check Vercel dashboard cron logs for /api/generate invocations on March 6-10.
started: Worked until March 5th cron run (06:00 UTC). March 6th onward is missing.

## Eliminated

- hypothesis: Middleware matcher regex blocks /api/generate
  evidence: The pattern '/(api(?!/clerk-proxy)|trpc)(.*)' DOES match /api/generate — 'api' followed by '/generate' is not '/clerk-proxy', so the negative lookahead passes. Middleware runs normally for this route.
  timestamp: 2026-03-10

- hypothesis: Middleware handler blocks cron requests (Clerk auth enforcement)
  evidence: The clerkMiddleware handler only (1) returns NextResponse.next() for /__clerk paths, and (2) redirects on review_key param. No auth() protection is called on API routes. Cron requests pass through to the route handler.
  timestamp: 2026-03-10

- hypothesis: Timezone bug in date logic causes false "already exists" early exit
  evidence: getTodayDate() uses new Date().toISOString().split('T')[0] which is always UTC. Cron fires at 06:00 UTC. At that time, toISOString() returns the correct current UTC date. No timezone mismatch possible.
  timestamp: 2026-03-10

- hypothesis: Changes to layout.tsx, next.config.ts, or front-end components broke the generate route
  evidence: The generate route (app/api/generate/route.ts) itself has NOT changed since the max_tokens fix commit (c3fb1a5, March 9). All post-March-5 code changes are UI/design token migrations with no changes to API routes or lib/generate.ts.
  timestamp: 2026-03-10

- hypothesis: The generate route code itself has a new early-exit or logic bug
  evidence: Route code is identical to the last-known working state. handleGenerate() only early-exits if a briefing already exists for today. All failures are caught and return 500 (not silent). generateBriefing() throws clearly on missing ANTHROPIC_API_KEY.
  timestamp: 2026-03-10

## Evidence

- timestamp: 2026-03-10
  checked: vercel.json cron schedule
  found: Schedule "0 6 * * *" on path "/api/generate" — correct, unchanged since initial setup.
  implication: Cron schedule config is not the problem.

- timestamp: 2026-03-10
  checked: Git log of all commits since March 5th (when cron last worked)
  found: Multiple commits were pushed on March 6-7 and March 9. The first missed cron would be March 6 at 06:00 UTC. By that time only the March 5th evening commits had been deployed (feature commits, not route changes). The significant commits arrived March 6 13:07 UTC onward.
  implication: The March 6 06:00 UTC cron SHOULD have run against the March 5th deployment (no breaking changes). If it failed, the cause predates the Clerk proxy changes.

- timestamp: 2026-03-10
  checked: Changes that went live before March 6 06:00 UTC (the first missed cron)
  found: d1d28526 (Wrap recordUsage in try/catch), 74ec131 (Add Clerk production domains to CSP), 4213aea (Add temporary review bypass), 07779a7 (Handle blob save failure gracefully), e7f9b2d (Increase podcast timeout). None of these touch the generate route or its dependencies.
  implication: The deploy active at 06:00 UTC March 6 had no breaking code changes. The failure is more likely an infrastructure/environment issue (CRON_SECRET, domain redirect) rather than a code bug.

- timestamp: 2026-03-10
  checked: CRON_SECRET in .env.local vs Vercel env vars
  found: .env.local has CRON_SECRET=b572c45c48573bff9b30600d9d960722817482f1e61ca8daa5a6b428c8a835d5. Vercel env vars are separate — they must be configured in the Vercel dashboard. If CRON_SECRET in Vercel is missing, wrong, or was rotated, isCronAuthorized() returns false and the route returns 401. Vercel cron sees 401 — the job silently fails with no generation.
  implication: STRONGEST HYPOTHESIS. A CRON_SECRET mismatch between Vercel env vars and what the app expects would cause every cron invocation to return 401, silently.

- timestamp: 2026-03-10
  checked: isCronAuthorized() behavior on missing/wrong secret
  found: The function is fail-closed. If CRON_SECRET env var is not set, it logs an error and returns false. If the Authorization header doesn't match exactly, returns false. The GET handler returns 401 JSON with no generation.
  implication: The route is correctly secured but a misconfigured Vercel env var would cause every cron call to 401. Vercel cron logs would show 401 responses.

- timestamp: 2026-03-10
  checked: Domain redirect behavior (MEMORY.md states: root folioapp.co.uk 307-redirects to www.folioapp.co.uk)
  found: Vercel docs explicitly state: "Cron jobs do not follow redirects." If the Vercel cron calls folioapp.co.uk/api/generate and the platform redirects to www.folioapp.co.uk/api/generate, the cron treats the 307 as the final response and generation never runs.
  implication: SECOND STRONGEST HYPOTHESIS. Vercel cron calls the canonical domain registered in vercel.json, which could be the apex domain. If the apex redirects to www, every cron invocation gets a 307 and completes without generation.

- timestamp: 2026-03-10
  checked: When the domain redirect was set up (MEMORY.md: "Root domain folioapp.co.uk 307-redirects to www.folioapp.co.uk (canonical)")
  found: This redirect is set at the Vercel platform level (domain settings), not in code. It was likely set up when the custom domain was configured. The last briefing ran March 5 — this could mean the redirect was ADDED on or after March 5, not at initial setup.
  implication: If the www redirect was added on or after March 5, this would explain the exact cutoff date.

- timestamp: 2026-03-10
  checked: Whether there's a Cloudflare WAF rule that could block cron requests
  found: Cloudflare deployed a WAF rule for CVE-2025-29927 (Next.js middleware bypass) on March 22, 2025. This predates the issue. However, Folio uses Cloudflare for DNS — if any Cloudflare WAF or firewall rule is stripping the Authorization header from cron requests, isCronAuthorized() would return false (401).
  implication: THIRD HYPOTHESIS. Less likely than the above two but worth checking if CRON_SECRET is confirmed correct.

## Resolution

root_cause: Not yet confirmed. Two leading candidates:
  (1) CRON_SECRET missing or mismatched in Vercel environment variables — causes 401 on every cron invocation.
  (2) Vercel cron calling apex domain (folioapp.co.uk) which 307-redirects to www — cron does not follow redirects, generation never fires.

fix: Depends on confirmed root cause.
  For (1): Set CRON_SECRET in Vercel dashboard > Settings > Environment Variables to match .env.local value.
  For (2): No code change needed — Vercel cron automatically targets the canonical production domain. If the canonical domain is www.folioapp.co.uk, the cron should already target www. Check Vercel dashboard > Cron Jobs to see which URL is being invoked.

verification: []
files_changed: []
