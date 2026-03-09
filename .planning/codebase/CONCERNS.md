# Codebase Concerns

**Analysis Date:** 2026-03-09

---

## Tech Debt

**Hardcoded Stale Admin User ID in two places:**
- Issue: The old admin user ID `user_3AR29PSfsNfmy9wxcyjCvplC7hH` is hardcoded directly in source code. `app/api/generate/route.ts` line 16 uses it as a fallback when `ADMIN_USER_ID` env var is missing. `app/page.tsx` line 11 hardcodes it with no env var fallback at all.
- Files: `app/api/generate/route.ts` (line 16), `app/page.tsx` (line 11)
- Impact: If `ADMIN_USER_ID` env var is ever missing from Vercel, generate route falls back to the old Clerk user ID (wrong account), granting wrong user admin access. The homepage `isAdmin` check is always wrong for the current user.
- Fix approach: Remove hardcoded fallback from `app/api/generate/route.ts`; read `ADMIN_USER_ID` from env with no fallback and fail loudly. Replace `app/page.tsx` constant with `process.env.NEXT_PUBLIC_ADMIN_USER_ID` or pass from server component via props.

**Redis client instantiated via `require()` in 10 separate files:**
- Issue: Every lib file that uses Redis duplicates the same 5-line `getRedis()` function using CommonJS `require('@upstash/redis')`. This is repeated in `lib/storage.ts`, `lib/subscription.ts`, `lib/bookmarks-server.ts`, `lib/comments-server.ts`, `lib/tracker.ts`, `lib/firm-pack.ts`, `lib/onboarding.ts`, `lib/char-usage.ts`, `lib/rate-limit.ts`, `lib/podcast-storage.ts`.
- Files: All 10 `lib/*.ts` files listed above
- Impact: Any change to Redis configuration (adding TLS, connection pooling, retry logic) must be applied in 10 places. The `require()` pattern creates a new Redis client instance on every function call — no connection reuse.
- Fix approach: Create a single `lib/redis.ts` module that exports a lazily-initialised Redis singleton. All other files import from it.

**`isValidDate()` accepts impossible calendar dates:**
- Issue: `lib/security.ts` `isValidDate()` validates only the pattern `/^\d{4}-\d{2}-\d{2}$/`. It accepts `2024-99-99`, `2024-13-32`, and dates in the far future or past. It is used as the primary guard for filesystem and Redis key construction across all routes.
- Files: `lib/security.ts` (line 10–12), used in `lib/storage.ts`, all API routes
- Impact: Malformed but regex-passing dates can create orphan Redis keys or filesystem files. Not an immediate security issue (no path traversal) but produces silent data corruption.
- Fix approach: Add a `new Date()` parse check after the regex: `const d = new Date(date); return !isNaN(d.getTime()) && d.toISOString().startsWith(date)`.

**Two separate URL env vars for the same origin:**
- Issue: The codebase uses `NEXT_PUBLIC_APP_URL` (in Stripe checkout/portal routes) and `NEXT_PUBLIC_SITE_URL` (in email.ts) as separate env vars, both defaulting to `http://localhost:3001`. They should be one canonical env var.
- Files: `app/api/stripe/checkout/route.ts` (line 22), `app/api/stripe/portal/route.ts` (line 23), `lib/email.ts` (lines 235, 260)
- Impact: If the domain changes, two separate Vercel env vars need updating. Easy to miss one, breaking Stripe redirect URLs or email links.
- Fix approach: Standardise on `NEXT_PUBLIC_APP_URL` everywhere and remove `NEXT_PUBLIC_SITE_URL`.

**`repairJSON()` in `lib/generate.ts` masks truncation issues:**
- Issue: The `repairJSON()` function in `lib/generate.ts` (lines 106–126) silently patches truncated Claude JSON by closing unclosed brackets. This means a partial briefing (e.g. only 6 of 8 stories) can be saved as a valid-looking briefing with empty/malformed stories.
- Files: `lib/generate.ts` (lines 106–126, 297)
- Impact: Users receive an incomplete briefing for that day. The `stop_reason === 'max_tokens'` warning in line 290–292 only logs to console — no alerting, no fallback. Even with `max_tokens: 16000`, the Sonnet model generating a full 8-story briefing may still truncate.
- Fix approach: After repair+parse, validate that `briefing.stories.length === 8` before saving. If not, throw rather than saving. Consider streaming the response or chunking generation.

---

## Known Issues

**Vercel Blob not configured — audio re-generated on every request:**
- Symptoms: `BLOB_READ_WRITE_TOKEN` is not set in Vercel env vars. `podcast-storage.ts` `useBlob()` returns false. Every `/api/podcast-audio` POST that reaches the ElevenLabs call generates and discards audio (no caching on filesystem in production serverless). ElevenLabs characters are consumed on every subscriber request for the same date.
- Files: `lib/podcast-storage.ts` (line 22–23), `app/api/podcast-audio/route.ts`
- Trigger: Any subscriber visiting `/podcast` for today's episode
- Impact: Burns ElevenLabs 100k/month budget rapidly if multiple users access audio. Budget exhaustion disables audio for remaining days of the month.

**Cron `stop_reason: max_tokens` production untested:**
- Symptoms: `max_tokens: 16000` fix was pushed in the last session but the Vercel cron "Run" button has not been clicked to verify end-to-end generation since the fix. Production briefing may still be failing.
- Files: `app/api/generate/route.ts`, `lib/generate.ts`
- Trigger: Daily 06:00 UTC cron
- Workaround: Manual POST to `/api/generate?force=true` as admin to verify.

**Fire-and-forget tasks in generate route have no success verification:**
- Symptoms: Quiz, podcast script, and aptitude bank generation are all fire-and-forget. If they fail, the daily cron returns 200 OK but the quiz/audio/aptitude features are silently broken for that day.
- Files: `app/api/generate/route.ts` (lines 73–84)
- Trigger: Any generation failure (network, API quota, Claude model error)
- Workaround: None — errors only appear in Vercel function logs, not surfaced to the admin.

---

## Security Considerations

**Review bypass cookie hardcoded in source:**
- Risk: The review bypass secret `folio-rev-xK9mP7wQ2` is plaintext in `middleware.ts` line 4. Anyone with access to the repo (or a leaked git history) can generate a review-access cookie and bypass all paywalls for 24 hours.
- Files: `middleware.ts` (lines 4–26), `lib/paywall.ts` (lines 29–31, 49)
- Current mitigation: Cookie is httpOnly and requires knowing the exact secret string.
- Recommendations: Move secret to an env var (`REVIEW_SECRET`). Remove the bypass entirely once the app-store/investor review period is over — it is documented as "temporary" in MEMORY.md.

**Comments feature has no moderation controls:**
- Risk: Subscribers can post text up to 500 characters per story with no profanity filter, no reporting mechanism, and no admin delete capability. The owner has no way to remove abusive comments without direct Redis access.
- Files: `lib/comments-server.ts`, `app/api/comments/route.ts`, `components/CommentsSection.tsx`
- Current mitigation: Only subscribers can post (rate limited to 20/hour). Text is truncated at 500 chars.
- Recommendations: Add an admin delete endpoint (check `userId === ADMIN_USER_ID`). Add a basic content length and URL injection check. Consider disabling comments until user base is larger.

**Clerk proxy exposes `Clerk-Secret-Key` header forwarding:**
- Risk: `app/api/clerk-proxy/[[...path]]/route.ts` forwards `CLERK_SECRET_KEY` in the `Clerk-Secret-Key` header to the Clerk Frontend API. If the proxy target is ever misconfigured (e.g. via `CLERK_PROXY_TARGET` pointing to a wrong host), the secret key is transmitted to an unintended destination.
- Files: `app/api/clerk-proxy/[[...path]]/route.ts` (lines 54–56)
- Current mitigation: Only forwards to the domain specified in `CLERK_PROXY_TARGET` or decoded from the publishable key.
- Recommendations: Validate that the resolved Clerk API URL is an `*.accounts.dev` or `clerk.com` domain before forwarding the secret key. The proxy itself is unused for current dev keys — consider removing it until production Clerk keys are needed.

**`(sub as any).current_period_end` in Stripe webhook:**
- Risk: Two locations in `app/api/stripe/webhook/route.ts` (lines 70, 107) use `as any` casts to access `current_period_end` on Stripe subscription objects. This silently continues if the Stripe API changes the field name or structure, setting `currentPeriodEnd: 0` (i.e. 1970) and immediately marking the subscription as expired.
- Files: `app/api/stripe/webhook/route.ts` (lines 70, 107)
- Current mitigation: Fallback to `sub.items.data[0]?.current_period_end ?? 0`
- Recommendations: Import the correct Stripe API version type or add an explicit check: if `periodEnd === 0`, log an error and skip saving rather than recording a broken subscription.

---

## Performance Bottlenecks

**`app/firms/[slug]/page.tsx` loads ALL briefings to find recent headlines:**
- Problem: The firms page (703 lines) iterates `listBriefings()` to find recent headlines mentioning a firm. This scans all briefing dates in the Redis sorted set, then fetches full briefing JSON for each recent date.
- Files: `app/firms/[slug]/page.tsx`, `lib/storage.ts`
- Cause: No firm-keyed headline index — firms mentioned in a briefing are not indexed separately; the page must scan all recent briefings.
- Improvement path: Build a Redis index `firm-headlines:{slug}` updated at generation time in `app/api/generate/route.ts`. Or cache the per-firm recent headlines with a short TTL (1 hour).

**Weekly digest iterates all Stripe subscriptions on each run:**
- Problem: `app/api/digest/route.ts` fetches all active Stripe subscriptions in a while loop (paginated 100 at a time) on every Sunday run. As subscriber count grows, this adds latency and Stripe API calls before a single email is sent.
- Files: `app/api/digest/route.ts` (lines 72–97)
- Cause: No local email list cache — subscriber emails are not stored in Redis.
- Improvement path: Maintain a Redis set of subscriber emails, updated by the Stripe webhook (`customer.subscription.created`, `customer.subscription.deleted`). Digest reads from Redis instead of paginating Stripe.

**Resend free tier (100 emails/day) will break digest at >100 subscribers:**
- Problem: `app/api/digest/route.ts` sends one email per subscriber sequentially with 100ms delays. Resend's free tier allows 100 emails/day. At 101 subscribers, the digest will partially fail silently (failed count logged but no retry).
- Files: `app/api/digest/route.ts` (lines 105–121)
- Current capacity: 100 subscribers maximum before digest degrades
- Scaling path: Upgrade to Resend Pro ($20/month) which allows 50k/day. Or use Resend's batch endpoint to send in groups.

---

## Fragile Areas

**`repairJSON` in `lib/generate.ts` — fragile JSON patching:**
- Files: `lib/generate.ts` (lines 106–126)
- Why fragile: The repair function counts `{` and `}` characters but does not handle escaped quotes, nested JSON strings, or mid-string truncation. A truncation inside a story's summary field (containing `{}` characters from legal citations) would produce a corrupt repair.
- Safe modification: Any changes to the Claude prompt structure (e.g. adding new JSON fields) must also update the repair logic and re-test with simulated truncation.
- Test coverage: Zero — no tests for the repair function.

**Dual-backend pattern with no integration tests:**
- Files: `lib/storage.ts`, `lib/subscription.ts`, `lib/bookmarks-server.ts`, `lib/comments-server.ts`, `lib/tracker.ts`, `lib/onboarding.ts`, `lib/char-usage.ts`, `lib/podcast-storage.ts`
- Why fragile: The Redis and filesystem backends share the same interface but are never tested together. A Redis key format change (e.g. `briefing:` prefix) breaks production silently — dev always uses filesystem. No parity tests exist.
- Safe modification: Any Redis key naming change must be deployed carefully — existing data under old keys is abandoned, not migrated. Test on a staging environment if one becomes available.
- Test coverage: Zero.

**Firm pack generation on page load (blocking first user visit):**
- Files: `app/firms/[slug]/page.tsx`, `lib/firm-pack.ts`
- Why fragile: `getFirmInterviewPack()` is called directly in the server component. If the Claude API is slow or errors on first visit (cache miss), the entire firms page times out. The firm pack `max_tokens: 1400` is tight for 10 questions + 4 bullets — truncation produces fewer questions silently (filtered to `length > 15` in lines 162–164).
- Safe modification: Wrap in try/catch and render a degraded "Pack unavailable" state. The current code throws if generation fails, which would produce a 500 page.
- Test coverage: Zero.

**ElevenLabs character budget tracked only on generation, not on quota check:**
- Files: `lib/char-usage.ts`, `app/api/podcast-audio/route.ts`
- Why fragile: `hasCapacity()` reads the Redis INCRBY counter but `recordUsage()` is called only after successful ElevenLabs response. A concurrent request that passes the capacity check before any of them record usage could cause multiple simultaneous over-budget generations.
- Safe modification: Use Redis INCR before the ElevenLabs call and DECR on failure (optimistic debit pattern), or use a Redis Lua script for atomic check-and-increment.
- Test coverage: Zero.

---

## Scaling Limits

**Upstash Redis free tier (10k commands/day):**
- Current capacity: Free tier — 10,000 Redis commands per day
- Limit: At scale, each page visit on a premium route involves multiple Redis reads (subscription check, briefing get, quiz get, bookmarks). 100 daily active users x ~10 page views each x 3 Redis commands = 3,000 commands/day. Growth to 500 DAU would breach the free tier.
- Scaling path: Upgrade to Upstash Pay-as-you-go (~$0.20 per 100k commands) or add a short-lived Next.js cache (`revalidate`) to reduce Redis calls on read-heavy routes.

**ElevenLabs 100k characters/month:**
- Current capacity: 100,000 chars/month (Creator tier at ~£17/month)
- Limit: Each briefing script is ~2,800 chars. If 36 days of audio were generated (each month), that is ~100,800 chars — already at the cap before any user re-generation. One month of daily cron audio alone nearly exhausts the budget.
- Scaling path: Upgrade to ElevenLabs Pro (500k chars/month, ~£78/month) when revenue justifies. The `hasCapacity()` check prevents overage.

**Tavily free tier (1,000 searches/month):**
- Current capacity: 1,000 searches/month
- Limit: Each daily briefing fires 8 parallel Tavily queries. 31 days × 8 = 248 searches/month from cron alone, leaving 752 for any manual regeneration. Manual `force=true` generations consume an additional 8 per trigger. At 3 manual regenerations per month, the budget is comfortable. At 10+ manual triggers, it approaches the limit.
- Scaling path: Upgrade to Tavily paid tier if manual regenerations become frequent.

**Resend free tier (100 emails/day):**
- Current capacity: 100 emails/day
- Limit: Weekly digest sends one email per active subscriber. At 101 subscribers, the Sunday digest will fail for some recipients. Welcome emails (1 per new subscriber) also count toward the daily limit.
- Scaling path: Upgrade to Resend Pro when subscriber count exceeds 80 (leave headroom for welcome emails on the same day as digest).

---

## Dependencies at Risk

**Clerk dev keys in production:**
- Risk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are dev-tier keys (`pk_test_` prefix) that show a "Development mode" banner on the Clerk sign-in widget. Dev keys are not intended for production use and may have Clerk policy restrictions.
- Impact: User-facing "Development mode" banner on sign-in/sign-up pages looks unprofessional. Clerk may rate-limit or terminate dev key usage on production traffic.
- Migration plan: Transfer domain from Cloudflare Registrar to Vercel DNS (removes the CNAME conflict), then create production Clerk keys (`pk_live_`). Remove or disable the clerk-proxy infrastructure if not needed for production Clerk instances.

**Stripe `current_period_end` via `as any` cast — Stripe API versioning:**
- Risk: The Stripe SDK type for `current_period_end` moved between API versions. The `as any` workaround in the webhook handler means a Stripe SDK major version upgrade could silently break subscription period tracking.
- Impact: Subscriptions recorded with `currentPeriodEnd: 0` expire immediately, locking out paying users.
- Migration plan: Pin the Stripe SDK version and audit the breaking-changes list before upgrading. Add a `periodEnd === 0` guard that logs an error and returns 500 to force Stripe to retry.

---

## Missing Critical Features

**No admin moderation for comments:**
- Problem: Comments are stored in Redis but there is no admin-facing UI or API endpoint to view, search, or delete comments. The only deletion path is the commenter's own delete button.
- Blocks: Safe operation of comments at any user scale. Any abusive or spam comment requires direct Redis manipulation to remove.

**No alerting on cron failures:**
- Problem: The daily 06:00 UTC cron (`/api/generate`) can fail silently. Vercel logs the error but there is no Slack/email/Discord alert. The admin may not notice until checking the site manually.
- Blocks: Reliable daily briefing delivery. A failure means users see yesterday's briefing with no indication of why.

**No Vercel Blob storage:**
- Problem: `BLOB_READ_WRITE_TOKEN` is not configured. Audio is not cached in production — every subscriber audio request re-generates from ElevenLabs, consuming the 100k/month character budget.
- Blocks: Cost-efficient audio delivery. Urgent given the tight ElevenLabs budget.

---

## Test Coverage Gaps

**Zero automated tests across the entire codebase:**
- What's not tested: Every library function (`lib/generate.ts`, `lib/storage.ts`, `lib/subscription.ts`, `lib/quiz.ts`, `lib/aptitude.ts`, `lib/firm-pack.ts`, `lib/paywall.ts`, `lib/rate-limit.ts`, `lib/security.ts`, `lib/char-usage.ts`), all API routes, all React components.
- Files: Entire `lib/` and `app/` directories
- Risk: Breaking changes in any layer go undetected until a user reports an issue. The dual-backend storage pattern is especially risky — Redis and filesystem diverge silently.
- Priority: High for `lib/security.ts` (input validation), `lib/subscription.ts` (payment logic), `lib/generate.ts` (repairJSON), and `lib/rate-limit.ts` (security controls). Medium for everything else.

**No test script in `package.json`:**
- What's not tested: Test infrastructure does not exist. `npm test` would fail with "missing script".
- Files: `package.json`
- Risk: No CI test gate — all linting passes but functional correctness is never checked.
- Priority: Medium — add vitest or jest as a dev dependency, configure a basic test runner, and write smoke tests for the highest-risk lib functions above.

---

*Concerns audit: 2026-03-09*
