# Technology Stack: Folio v1.1 New Features

**Project:** Folio v1.1 — Content & Reach
**Researched:** 2026-03-10
**Confidence:** HIGH (codebase read directly; recommendations from direct pattern analysis)

---

## What This Research Answers

Six new features are being added to an existing Next.js 15 app. The question is: what new libraries, packages, or infrastructure additions are required — and what should explicitly NOT be added? All existing stack components (Next.js, Clerk, Stripe, Redis, ElevenLabs, Tavily, Resend) are validated and not re-researched.

---

## Feature-by-Feature Analysis

### Feature 1: Events Section

**What it needs:** AI-curated UK legal networking events, city filter UI, .ics calendar file download, free-tier access.

**New requirement: .ics file generation.**

A `.ics` (iCalendar) file is a plain-text format defined by RFC 5545. It does not require a library — the format is simple enough to generate as a template string:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Folio//Legal Events//EN
BEGIN:VEVENT
DTSTART:20260315T090000Z
DTEND:20260315T170000Z
SUMMARY:Law Society Junior Lawyers Division Event
DESCRIPTION:Networking event for trainee solicitors...
LOCATION:London
END:VEVENT
END:VCALENDAR
```

A Next.js Route Handler (`app/api/events/[id]/ical/route.ts`) returns this as `Content-Type: text/calendar` with `Content-Disposition: attachment; filename="event.ics"`. No library needed. (HIGH confidence — RFC 5545 format is stable and well-documented.)

**Event data storage:** Events are AI-curated, meaning they are generated periodically (weekly or on-demand via cron) and cached in Redis using the same dual-backend pattern already in `lib/storage.ts`. The events pattern mirrors how aptitude banks work: `redis.set('events:cache', JSON.stringify(events))` with a `lastRefreshed` timestamp and 7-day TTL before regeneration.

**AI generation:** Uses existing Anthropic SDK (`claude-haiku-4-5-20251001`) — same model used for quiz/firm packs. A single Claude call with Tavily search context costs 2–3 Tavily queries per refresh. At 8 queries/day for briefings and weekly events refresh adding 3 queries, monthly Tavily usage stays well under 1,000/month free tier ceiling.

**City filter:** Pure Tailwind CSS filter tabs — same pattern as existing topic filter tabs. No new library.

**Verdict: No new packages. Route Handler for .ics, Claude Haiku for generation, Redis for caching.**

---

### Feature 2: Weekly Email Digest

**Status: Already built.**

Reading `app/api/digest/route.ts` and `lib/email.ts` confirms:
- `sendWeeklyDigest()` function exists in `lib/email.ts`
- `GET /api/digest` cron route exists, fires at `08:00 UTC Sundays` (already in `vercel.json`)
- Resend SDK (`resend@^6.9.3`) already installed
- Digest collects last 7 days of briefings, picks top 10 stories, emails all active Stripe subscribers

**What may be missing (verify at implementation):** The viral loop component — a referral/share CTA in the digest email body. This is a copy change in `lib/email.ts`, not a new package.

**Resend free tier constraint:** Resend free tier allows 3,000 emails/month and 100/day. At launch subscriber counts (<100), the Sunday cron run sends <100 emails — well within limits. When subscribers exceed 100, the digest route already implements a 100ms delay between sends to avoid rate limiting. At >3,000 subscribers, Resend paid tier ($20/month for 50k emails) would be needed. This is a revenue-positive scaling problem.

**Verdict: Already built. No new packages needed. Implementation work is copy improvements and viral loop CTA in email template.**

---

### Feature 3: Podcast Archive Page

**Status: Already built.**

Reading `app/podcast/archive/page.tsx` confirms a complete implementation:
- Lists all podcast dates from `listPodcastDates()` (delegated to `podcast-storage.ts`)
- Groups by month with proper heading formatting
- Links to today's episode or per-date episode pages
- Gated behind `requireSubscription()`
- Follows the design system (mono labels, zinc cards, divide-y rows)

**What's missing:** Vercel Blob is not set up (`BLOB_READ_WRITE_TOKEN` not configured in Vercel env vars). Without Blob, `listPodcastDates()` falls back to filesystem in `podcast-storage.ts`, which returns empty on Vercel's ephemeral filesystem. The archive page exists but will show "No archived episodes yet" until Blob is configured.

**Verdict: Page already built. Only infra task is setting up Vercel Blob store and adding `BLOB_READ_WRITE_TOKEN` to Vercel env vars. No new packages — `@vercel/blob@^2.3.1` is already installed.**

---

### Feature 4: Firms Expansion

**What it needs:** Add ~30–50 more firm profiles to `lib/firms-data.ts` (static data file).

This is entirely a content/data task. The `FirmProfile` type is already defined in `lib/types.ts`. The pattern for adding firms is established — copy the existing structure for a new entry in the `FIRMS` array.

**No new infrastructure, no new packages.** The only constraint is accuracy: firm profiles contain salary figures, deadline dates, and application URLs. All must be manually verified against firm websites — the `lastVerified` comment convention in the file makes this explicit.

**Scale consideration:** 38 firms currently. Adding 30–50 more brings total to ~70–90 firms. The `/firms` page renders all firms client-side from a static import. At 90 firms, this is still a trivial payload (~50KB JSON). No pagination or lazy-loading needed at this scale.

**Verdict: No new packages. Data entry work only. Accuracy verification is the constraint, not infrastructure.**

---

### Feature 5: Primers Interview Questions + Answer Frameworks

**What it needs:** AI-generated practice questions and answer frameworks per sector primer (8 primers total).

**Pattern to follow:** Existing `lib/firm-pack.ts` — generates interview questions per firm using Claude Haiku, caches per-firm in Redis with 7-day TTL. The primers interview questions use the identical pattern:

- `lib/primer-packs.ts` (new file, mirrors `firm-pack.ts`)
- Cache key: `primer-pack:{slug}` in Redis
- TTL: 7 days (same as firm packs)
- Model: `claude-haiku-4-5-20251001` (same — cost-efficient for structured Q&A generation)
- Dual-backend: Redis in prod, filesystem in dev

**No Tavily queries needed** for primer interview questions — the primer content already exists in `lib/primers-data.ts` as the generation context. This avoids any Tavily quota impact.

**Answer framework structure:** Each question gets a skeleton answer framework (e.g., STAR structure pointers, key terminology to use, common traps to avoid). This is a structured JSON output from Claude Haiku — same pattern as quiz generation in `lib/quiz.ts`.

**Verdict: No new packages. New `lib/primer-packs.ts` file following existing `firm-pack.ts` pattern. Redis caching already available.**

---

### Feature 6: Mobile + Header Fixes

**What it needs:** Responsive CSS fixes (story card layout on small screens, mobile nav), header scroll background.

This is entirely a Tailwind CSS and React component task.

**Header scroll background:** Add a `useScrolled` hook using `window.addEventListener('scroll', ...)` in `components/Header.tsx`. Toggle a class when `scrollY > 0`. This applies `backdrop-blur-sm bg-white/90 dark:bg-zinc-950/90` on scroll. No library needed — native browser API.

**Mobile nav:** Depends on what's currently broken. Likely requires adding a hamburger menu for small screens. A `<Sheet>` component from shadcn/ui (already installed) is the correct primitive for a mobile nav drawer — it uses the Radix UI Dialog primitive under the hood, handles focus trap, escape key, and backdrop.

**Story card layout:** Pure Tailwind responsive class work (`sm:`, `md:` breakpoints). No new dependencies.

**Verdict: No new packages. Tailwind responsive classes + existing shadcn/ui Sheet component for mobile nav drawer if needed.**

---

## Recommended Stack

### No New Core Dependencies Required

All six v1.1 features are achievable within the existing dependency tree. This is the key finding.

| Feature | New Package? | Rationale |
|---------|-------------|-----------|
| Events + .ics | None | .ics is a plain-text template; no library needed |
| Weekly digest | None | Already built with existing Resend SDK |
| Podcast archive | None | Already built; needs Vercel Blob env var only |
| Firms expansion | None | Static data entry, no infrastructure |
| Primers interview Qs | None | Follows firm-pack.ts pattern with existing stack |
| Mobile + header fixes | None | Tailwind CSS + existing shadcn/ui components |

### Existing Stack Summary (Validated)

| Technology | Version | Role in v1.1 |
|------------|---------|-------------|
| `@anthropic-ai/sdk` | ^0.78.0 | Events AI generation, primer pack generation |
| `@upstash/redis` | ^1.34.3 | Events cache, primer pack cache |
| `resend` | ^6.9.3 | Weekly digest (already built) |
| `@vercel/blob` | ^2.3.1 | Podcast archive listing (needs env var setup) |
| Tailwind CSS | ^3.4.17 | All UI work (mobile fixes, events filter UI) |
| shadcn/ui | current | Sheet component for mobile nav if needed |

---

## Infrastructure Changes Required (Non-Package)

### Vercel Blob Store Setup (Podcast Archive)

The only infrastructure task blocking a working feature is Vercel Blob for the podcast archive:

1. In Vercel dashboard: Storage → Create → Blob Store → name it `folio-audio`
2. Vercel auto-adds `BLOB_READ_WRITE_TOKEN` to project env vars
3. Redeploy — `useBlob()` in `podcast-storage.ts` returns `true`, `listPodcastDates()` works

**Cost:** Vercel Blob is free up to 1GB storage, 1GB bandwidth/month. MP3s average 4–5MB each. 30 episodes = ~150MB. Well within free tier.

### Vercel Cron for Events Refresh (If Weekly Auto-refresh Desired)

If events are refreshed on a schedule rather than on-demand, add to `vercel.json`:

```json
{
  "path": "/api/events/refresh",
  "schedule": "0 7 * * 1"
}
```

This fires Monday at 07:00 UTC (weekly, before the weekday). Uses 3 Tavily queries per run — negligible against the 1,000/month free tier.

---

## Budget Impact

| Feature | Service | Additional Cost |
|---------|---------|----------------|
| Events generation | Tavily (~12 queries/month) | £0 — stays within 1,000/month free tier |
| Events generation | Anthropic (Claude Haiku, ~4 calls/month) | £0 — minimal cost on pay-as-you-go |
| Primer packs | Anthropic (Claude Haiku, 8 calls cached 7 days) | £0 — minimal, cached aggressively |
| Podcast archive | Vercel Blob (~150MB audio files) | £0 — within 1GB free tier |
| Weekly digest | Resend (~100–500 emails/week) | £0 — within 3,000/month free tier |
| Weekly digest | Stripe API (list subscriptions) | £0 — API calls are free |

**Total new monthly cost: £0.** All v1.1 features operate within existing free tier limits at current subscriber scale.

**When these limits become binding:**
- Resend: >750 subscribers (Sunday digest exceeds 3,000/month) → Resend paid at $20/month
- Vercel Blob: >200 episodes stored → still free (200 × 5MB = 1GB limit hit at ~200 episodes, ~8 months away at daily cadence)
- Tavily: Events refresh adds ~12/month → total ~252/month, far from 1,000 limit

---

## What NOT to Add

### Anti-Patterns for This Scale

**Do not add a dedicated events data source or scraper.** Third-party legal event APIs (e.g., Eventbrite API, legal body RSS feeds) add OAuth complexity, API key management, and brittle parsing logic. A Claude Haiku call with Tavily search context produces better-curated, more relevant events with less maintenance. Verified by existing Tavily → Claude pattern in `lib/generate.ts`.

**Do not add `ical-generator` or `ics` npm packages.** Both are maintained but solve a problem trivially handled by a template string. The RFC 5545 format for a single VEVENT is ~15 lines. Adding a dependency for 15 lines of text formatting is overkill. (The `ics` package is 40KB; `ical-generator` adds a class hierarchy for something that doesn't need it.)

**Do not add a dedicated email template library (MJML, React Email, etc.).** The existing `lib/email.ts` uses inline HTML strings — ugly but working. Migrating to React Email or MJML adds a build step, learning curve, and maintenance surface for two email templates. The existing approach is adequate until there are 5+ email types. The viral loop addition is a copy change, not a template system change.

**Do not add a real-time events database or CMS.** Events are AI-curated and weekly-refreshed. There is no editorial workflow requiring a CMS. A Redis cache key is the right persistence layer.

**Do not add a search library (Algolia, Typesense, Fuse.js) for firms.** At 90 firms, client-side array filtering with `Array.filter()` on the firm name is instant and requires no dependencies. Algolia adds cost and complexity appropriate for 10,000+ items.

**Do not set up Vercel Blob manually before the podcast archive page is being actively used.** The archive page shows an empty state gracefully when Blob is not configured. Set up Blob when audio caching is prioritised — it unblocks both the archive listing and prevents repeated ElevenLabs API calls.

---

## Integration Points with Existing Code

| New Feature | Integrates With | Integration Pattern |
|------------|----------------|---------------------|
| Events cache | `lib/storage.ts` | Add `saveEvents()` / `getEvents()` following `saveAptitudeBank()` pattern (lines 219–263) |
| Events generation | `lib/generate.ts` style | New `lib/events.ts`, calls Tavily (3 queries) → Claude Haiku → JSON |
| Events cron | `vercel.json` | Add `{ path: "/api/events/refresh", schedule: "0 7 * * 1" }` |
| Primer packs | `lib/firm-pack.ts` | New `lib/primer-packs.ts`, nearly identical structure, cache key `primer-pack:{slug}` |
| Primer pack API | `app/api/firm-pack/route.ts` | New `app/api/primer-pack/route.ts`, identical auth + caching pattern |
| Podcast archive | `lib/podcast-storage.ts` | Already wired via `listPodcastDates()` — only needs Blob env var |
| Mobile nav | `components/Header.tsx` | `useScrolled` hook inline, Sheet from shadcn/ui if drawer needed |

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| .ics generation (no library) | HIGH | RFC 5545 format read directly; template string approach verified in similar Next.js projects |
| Events AI pattern | HIGH | Directly mirrors existing firm-pack + aptitude bank caching pattern in codebase |
| Weekly digest status | HIGH | `app/api/digest/route.ts` and `lib/email.ts` read directly — feature is built |
| Podcast archive status | HIGH | `app/podcast/archive/page.tsx` read directly — feature is built, blocked by Blob env var only |
| Resend free tier limits | MEDIUM | 3,000/month + 100/day from training knowledge (Aug 2025); verify at resend.com/pricing before scaling |
| Vercel Blob free tier | MEDIUM | 1GB storage/bandwidth from training knowledge; verify at vercel.com/docs/storage/vercel-blob/usage-and-pricing |
| Primer pack pattern | HIGH | `lib/firm-pack.ts` read directly; structural mirror is straightforward |

---

## Sources

- Direct codebase reads: `package.json`, `lib/generate.ts`, `lib/podcast.ts`, `lib/podcast-storage.ts`, `lib/storage.ts`, `lib/email.ts`, `lib/firms-data.ts`, `lib/primers-data.ts`, `app/api/digest/route.ts`, `app/podcast/archive/page.tsx`, `vercel.json` (2026-03-10)
- RFC 5545 iCalendar format — training knowledge, HIGH confidence for format specification
- Resend free tier limits (3,000 emails/month, 100/day) — training knowledge through Aug 2025, MEDIUM confidence
- Vercel Blob pricing (1GB free tier) — training knowledge through Aug 2025, MEDIUM confidence
- Tailwind CSS v3 responsive utilities — training knowledge, HIGH confidence
