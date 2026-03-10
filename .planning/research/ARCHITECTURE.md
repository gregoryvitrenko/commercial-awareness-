# Architecture Patterns

**Domain:** Folio v1.1 — Adding new features to an existing Next.js 15 App Router product
**Researched:** 2026-03-10

---

## Existing Architecture — Baseline

Before describing integration points, here is the verified pattern that all six features must conform to.

### Storage Pattern (dual-backend)

Every piece of persisted data uses the same detection logic:

```typescript
function useRedis(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
```

- Production (Vercel): Upstash Redis. Keys named `{resource}:{identifier}`. Sorted-set index named `{resource}:index` with Unix timestamp scores for ordered listing.
- Dev (local): Filesystem under `data/briefings/` with filenames `{date}-{resource}.json`.
- New features MUST follow this exact pattern. Any deviation creates a split codebase.

### Generation Pattern (cron + fire-and-forget)

`app/api/generate/route.ts` is the authoritative cron handler:

1. `generateBriefing()` — awaited (blocking, must succeed before anything else fires)
2. `generateAndSaveQuiz(briefing)` — fire-and-forget (`.catch(console.error)`)
3. `generateAndSavePodcastScript(briefing)` — fire-and-forget
4. `refreshStaleBanks(today)` — fire-and-forget

New AI generation tasks attach here as additional fire-and-forget steps if they depend on today's briefing, or run in a separate cron if independent.

### AI Generation Pattern (haiku vs sonnet)

- `claude-sonnet-4-6` — used for briefing (large context, high quality required) and podcast script generation
- `claude-haiku-4-5-20251001` — used for quiz, aptitude banks, firm interview packs (cost-sensitive, large batch outputs)
- All new AI generation for cached content (not per-user, not real-time) must use `claude-haiku-4-5-20251001` to stay within Anthropic free tier

### Tavily Budget

Current daily usage: 8 queries per cron run at 06:00 UTC. Free tier: 1,000 queries/month (~33/day available). Adding an events search cron would consume additional queries. See per-feature analysis below.

### Auth + Paywall Pattern

- `requireSubscription()` in server components gates premium routes
- Free routes call no paywall check
- New free routes: add no import from `lib/paywall.ts`
- New premium routes: add `await requireSubscription()` as first line of the page component

---

## Feature 1: Events Section

### What already exists

Nothing. This is a net-new feature with no existing code to extend.

### New files

| File | Type | Purpose |
|------|------|---------|
| `lib/events.ts` | NEW | Tavily search for UK legal events + claude-haiku synthesis to `LegalEvent[]` JSON |
| `lib/events-storage.ts` | NEW | Dual-backend storage for events list (Redis/FS). Mirror of how `lib/storage.ts` handles briefings. |
| `lib/ics.ts` | NEW | Pure TypeScript .ics file builder from `LegalEvent`. No library needed. |
| `app/events/page.tsx` | NEW | Free-tier page. Reads from events storage. City filter as URL search param. |
| `app/api/events/route.ts` | NEW | GET (cron-triggered) + POST (admin-only manual trigger). Same auth pattern as `app/api/generate/route.ts`. |

### Types to add in `lib/types.ts`

```typescript
export interface LegalEvent {
  id: string;
  title: string;
  organiser: string;       // e.g. "The Law Society", "Linklaters Graduate Recruitment"
  date: string;            // YYYY-MM-DD (or nearest known date)
  endDate?: string;        // for multi-day events
  city: string;            // "London" | "Manchester" | "Edinburgh" | "Birmingham" | "Bristol" | "Online"
  type: EventType;
  description: string;     // 2-3 sentences on what it is and why it matters for TC applicants
  url?: string;            // registration or info URL from Tavily results
  free?: boolean;
}

export type EventType =
  | 'networking'
  | 'open-day'
  | 'webinar'
  | 'careers-fair'
  | 'workshop'
  | 'firm-event';

export interface EventsStore {
  events: LegalEvent[];
  generatedAt: string;     // ISO 8601
  refreshedDate: string;   // YYYY-MM-DD
}
```

### Redis keys

```
events:current   → JSON string of EventsStore (single key, no sorted set needed — only one version)
```

### FS fallback key

```
data/briefings/events-current.json
```

### Tavily query budget

Events search requires dedicated queries — not piggybacked on the daily briefing run. Suggested query set (weekly cron, not daily):

```
"UK law firm open days networking events [year]"
"Magic Circle vacation scheme open days London [year]"
"legal careers fair London [year]"
"law society events London Manchester Edinburgh [year]"
"UK law student networking events spring [year]"
```

5 queries per weekly run = ~22 queries/month. Well within the 1,000/month free tier even combined with daily briefing (~176/month). See Tavily budget table at end of document.

### Cron integration

Add a new weekly cron to `vercel.json`. Do NOT add to the daily `/api/generate` cron — events are weekly-refreshed content, not daily.

```json
{ "path": "/api/events", "schedule": "0 7 * * 1" }
```

Monday 07:00 UTC gives fresh events for the week.

### .ics generation (pure TypeScript, no library)

The `.ics` format is a flat text RFC 5545 file. One event per download — no bulk export needed for v1.1.

```typescript
// lib/ics.ts
export function buildIcsFile(event: LegalEvent): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtstart = event.date.replace(/-/g, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Folio//Legal Events//EN',
    'BEGIN:VEVENT',
    `UID:folio-event-${event.id}@folioapp.co.uk`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.city}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
```

The download is implemented as a client-side Blob download (no API route needed):

```typescript
// In the events card component
function downloadIcs(event: LegalEvent) {
  const content = buildIcsFile(event);
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### City filter

Implement as a URL search param (`?city=London`) handled in the server component. No client state needed. Filter options derive from the `city` field values present in the events list — do not hardcode city options.

### Paywall

None. Events section is free tier. Do not call `requireSubscription()`.

### Integration points

| Connects to | How |
|-------------|-----|
| `lib/types.ts` | Add `LegalEvent`, `EventType`, `EventsStore` interfaces |
| `vercel.json` | Add weekly cron entry for `/api/events` |
| `lib/storage.ts` | No connection — use separate `lib/events-storage.ts` |
| `app/api/generate/route.ts` | No connection — events are independent of daily briefing |

---

## Feature 2: Weekly Email Digest

### What already exists

This feature is architecturally complete. All code already exists:

- `vercel.json`: cron `GET /api/digest` at `0 8 * * 0` (Sunday 08:00 UTC) — already wired
- `app/api/digest/route.ts`: FULLY IMPLEMENTED. Reads last 7 days of briefings, picks top 2 stories per day (capped at 10), fetches active subscriber emails from Stripe, calls `sendWeeklyDigest()` for each subscriber with a 100ms delay between sends
- `lib/email.ts`: FULLY IMPLEMENTED. Contains `sendWeeklyDigest()` with inline HTML template (topic colour badges, week label, CTA button) and `sendWelcomeEmail()`. Uses Resend API.
- `lib/email.ts` exports `DigestStory` interface.

### Current status

The digest will run on the next Sunday cron automatically if `RESEND_API_KEY` and `STRIPE_SECRET_KEY` are set in Vercel. Both should already be set from v1.0 welcome email work. No code changes are required to ship the basic digest.

### What is NOT yet done

Three gaps exist, none of which block the Sunday cron from firing:

**Gap 1: Events section in digest (optional, Feature 1 prerequisite)**

The digest template in `lib/email.ts` only shows briefing stories. If Feature 1 ships, adding a short "Upcoming events this week" section to the digest adds retention value. This requires modifying `digestHtml()` in `lib/email.ts` to accept an optional events block, and modifying `app/api/digest/route.ts` to fetch events from `lib/events-storage.ts`.

**Gap 2: One-click unsubscribe**

The current footer says "Manage your subscription from your account settings." No list-unsubscribe header is set. Resend supports RFC 2369 `List-Unsubscribe` headers. Adding `headers: { 'List-Unsubscribe': '<mailto:unsubscribe@folioapp.co.uk>' }` to the `resend.emails.send()` call satisfies deliverability requirements and reduces spam complaints. This is a one-line addition.

**Gap 3: Subscriber count ceiling (future concern)**

Resend free tier: 100 emails/day. If active subscriber count exceeds 100, the Sunday cron will send 100 emails and then fail silently for the rest. Not a v1.1 concern — flag for when subscriber count approaches 80.

### Files to modify (if events section added)

| File | Change |
|------|--------|
| `lib/email.ts` | Add optional `events?: LegalEvent[]` param to `digestHtml()`. Render events block if provided. |
| `app/api/digest/route.ts` | Import and call `getEvents()` from `lib/events-storage.ts`. Pass events to `sendWeeklyDigest()`. |

### Build dependency

Feature 2 digest already works for stories. Events section in digest depends on Feature 1 (events storage). Build Feature 1 first if digest events section is in scope.

---

## Feature 3: Podcast Archive

### What already exists

FULLY IMPLEMENTED. `app/podcast/archive/page.tsx` already exists and is production-ready:

- Calls `listPodcastDates()` from `lib/storage.ts` (which re-exports from `lib/podcast-storage.ts`)
- Groups dates by month with formatted headings
- Links to `/podcast/${date}` for past episodes, `/podcast` for today
- Premium-gated via `requireSubscription()`

`lib/podcast-storage.ts` `listPodcastDates()` already handles both backends:
- Vercel Blob: lists all `podcasts/*.mp3` objects, extracts YYYY-MM-DD date from pathname
- Filesystem: scans `data/briefings/` for `*-podcast*` files

### What is blocking this feature

The blocker is infrastructure, not code. `BLOB_READ_WRITE_TOKEN` is not set in Vercel. Without Blob:
- MP3s are regenerated on every `/api/podcast-audio` request (burns ElevenLabs chars)
- No MP3 files accumulate in Blob storage
- `listPodcastDates()` returns an empty list (Blob branch)
- The archive page shows "No archived episodes yet"

### Steps to unblock (infrastructure only)

1. Create a Vercel Blob store in the Vercel dashboard (Storage tab)
2. Add `BLOB_READ_WRITE_TOKEN` to Vercel environment variables
3. Redeploy — next `/api/podcast-audio` request will write to Blob and be cached

No code changes are needed. The archive page will populate automatically once MP3s start accumulating.

### Files to modify

None.

### Files to create

None.

---

## Feature 4: Primers Interview Questions

### What already exists

- `lib/types.ts`: `PrimerInterviewQ` interface already defined (`question`, `whatTheyWant`, `skeleton` fields)
- `lib/types.ts`: `Primer` interface has `interviewQs?: PrimerInterviewQ[]` — optional field already typed
- `lib/primers-data.ts`: 8 primers in `PRIMERS` array. The `interviewQs` field is currently absent (field is `undefined` on all primers)
- `app/primers/[slug]/page.tsx`: renders `<PrimerView primer={primer} />` — no route changes needed
- `components/PrimerView.tsx`: renders primer content — needs one new section for interview questions

### Implementation approach: static data (recommended)

Generate interview questions once using claude-haiku or manually, review for quality, paste directly into `lib/primers-data.ts` as static arrays. No new lib files, no API routes, no caching infrastructure.

This matches the credibility rule already documented in `lib/firms-data.ts`: "no field is generated at runtime by an AI." Interview questions that are inconsistent or low-quality damage user trust. Static generation allows human review.

The `PrimerInterviewQ` interface already has the right shape:
```typescript
interface PrimerInterviewQ {
  question: string;        // The interview question
  whatTheyWant: string;    // What the interviewer is assessing
  skeleton: string;        // How to structure a strong answer (3-4 sentences)
}
```

3 questions per primer × 8 primers = 24 question objects. These fit comfortably in `lib/primers-data.ts` without splitting files.

### Files to modify

| File | Change |
|------|--------|
| `lib/primers-data.ts` | Add `interviewQs: [...]` arrays to each of the 8 primer entries |
| `components/PrimerView.tsx` | Add render section for `primer.interviewQs` — show if present, skip if undefined |

### No new files needed

No API routes, no storage, no new lib files.

### Alternative (Option B: AI-generated, cached) — not recommended for v1.1

If dynamic generation is needed in a later milestone:

| File | Type | Purpose |
|------|------|---------|
| `lib/primer-questions.ts` | NEW | claude-haiku generation for 3 questions per primer (mirrors `lib/quiz.ts` pattern) |
| `lib/storage.ts` | MODIFY | Add `savePrimerQuestions()` / `getPrimerQuestions()` with Redis key `primer-questions:{slug}` |

Defer this until there is a clear reason to regenerate questions dynamically.

---

## Feature 5: Firms Expansion

### What already exists

- `lib/firms-data.ts`: 38 firms across 5 tiers (Magic Circle 5, Silver Circle 6, US Firms 10, International 8, Boutique 9). Each is a `FirmProfile` object with full typing.
- `lib/types.ts`: `FirmProfile` interface covers all expected fields. Optional fields (`forageUrl`, `assessments`) can be omitted for new entries.
- Firm pages (`app/firms/page.tsx`, `app/firms/[slug]/page.tsx`) dynamically render whatever is in `FIRMS` — no routing changes needed.

### What needs to happen

Add firm objects to the `FIRMS` array in `lib/firms-data.ts`. No new infrastructure.

### TypeScript interface coverage

The existing `FirmProfile` interface covers all new firm types. Key fields for new US/Silver Circle entrants:

- `aliases[]` — critical for briefing story matching. `story.firms[]` values are matched against `aliases` to link stories to firm profiles. New firms must include all name variants that the AI might generate (e.g. "Sullivan & Cromwell", "S&C", "Sullivan Cromwell").
- `tier: FirmTier` — `'US Firms'` for US entrants. Current US firms include Kirkland, Latham, Skadden, Davis Polk, Paul Weiss, Weil, Cleary, Hogan Lovells, A&O Shearman (dual-listed), White & Case.
- `lastVerified` — must be set to the date the firm entry is added. Do not leave blank.

No interface changes needed unless a firm requires a completely new field type.

### Accuracy constraint

The `lastVerified` field on each `trainingContract` is the credibility signal. For new firms, set to the date they are added. Salary figures and deadline dates must come from public sources (The Trackr, firm official websites) — not AI-generated. Stale or incorrect salary data is a trust-breaker for the target audience.

### Files to modify

| File | Change |
|------|--------|
| `lib/firms-data.ts` | Add new `FirmProfile` objects to `FIRMS` array |

### No new files needed

---

## Feature 6: Mobile + Header Fixes

### What already exists

- `components/Header.tsx` — main nav header
- `components/StoryCard.tsx` — story cards on homepage
- Various nav/layout components

### Scope

Pure CSS and component-level changes. No new infrastructure, no new API routes, no new lib files, no storage changes.

### Known items from design audit (2026-03-10 session)

Three changes were identified and deferred to this feature:

1. Remove italic talking-point quote from story cards (low-value content, clutters card)
2. Apply topic-colored left border on story cards (same pattern as firms list rows)
3. Stone-100 page background vs white cards for hierarchy (currently flat stone-50 everywhere)

These are all in `components/StoryCard.tsx` and potentially `app/page.tsx`.

### Files likely to modify

| File | Change |
|------|--------|
| `components/Header.tsx` | Scroll background (sticky header needs `bg-white/95 dark:bg-zinc-950/95 backdrop-blur` on scroll), mobile nav |
| `components/StoryCard.tsx` | Remove italic quote, add topic-colored left border, mobile layout at 375px |
| `app/page.tsx` | Page background color change (stone-50 → stone-100 if hierarchy change proceeds) |

---

## Recommended Build Order

This order minimises blocking dependencies and allows each feature to ship independently:

```
1. Mobile + header fixes (Feature 6)
   No dependencies. Delivers visible polish before marketing push.
   Includes three deferred design audit items from prior session.

2. Firms expansion (Feature 5)
   No dependencies. Pure data work.
   Risk: time cost of researching 30-50 firm profiles accurately.

3. Podcast archive (Feature 3)
   Code complete — infrastructure task only (Blob store setup).
   Unblocks ElevenLabs character savings once Blob caching is active.

4. Primers interview questions (Feature 4)
   Static data approach: generate once, paste in.
   Small render change in PrimerView.tsx.

5. Events section (Feature 1)
   Net-new lib + route + storage. Most complex new feature.
   Must ship before digest events integration.

6. Weekly email digest validation (Feature 2)
   Core digest already works — validate it fires correctly on first Sunday.
   Events section in digest can be added after Feature 1 ships.
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `lib/events.ts` | Tavily search + claude-haiku synthesis → `LegalEvent[]` | Tavily API, Anthropic API |
| `lib/events-storage.ts` | Persist/retrieve `EventsStore` (Redis/FS) | Upstash Redis, filesystem |
| `lib/ics.ts` | Build `.ics` file string from `LegalEvent` | No external dependencies — pure function |
| `app/api/events/route.ts` | Cron + admin trigger for events generation | `lib/events.ts`, `lib/events-storage.ts` |
| `app/events/page.tsx` | Render events with city filter | `lib/events-storage.ts` |
| `lib/email.ts` | Weekly digest HTML template + send via Resend | Resend API |
| `app/api/digest/route.ts` | Weekly cron: collect stories, fetch subscribers, send digest | `lib/storage.ts`, `lib/email.ts`, Stripe API |
| `lib/primers-data.ts` | Static primer content including interview Qs | None — pure data |
| `components/PrimerView.tsx` | Render primer sections + interview Qs | `lib/primers-data.ts` (via page) |
| `lib/firms-data.ts` | Static firm profiles | None — pure data |

---

## Data Flow Changes

### Events (new flow)

```
Monday 07:00 UTC cron → GET /api/events
  → lib/events.ts: 5 Tavily queries (parallel, same pattern as lib/generate.ts)
  → lib/events.ts: claude-haiku synthesis → LegalEvent[]
  → lib/events-storage.ts: save to Redis key "events:current"

User visits /events?city=London
  → lib/events-storage.ts: getEvents() → EventsStore
  → Filter events by city param (server-side in page component)
  → Render list. User clicks calendar icon → client-side Blob download from lib/ics.ts
```

### Weekly Digest (existing flow, confirmed complete)

```
Sunday 08:00 UTC cron → GET /api/digest
  → lib/storage.ts: listBriefings() → last 7 dates
  → lib/storage.ts: getBriefing(date) × up to 7
  → Pick top 2 stories per day, cap at 10
  → Stripe: list active subscriptions → subscriber emails
  → lib/email.ts: sendWeeklyDigest(email, stories, weekLabel) × N emails via Resend
  → 100ms delay between each send to stay within Resend rate limits
```

### Primers (static, no new data flow)

```
Build time: lib/primers-data.ts PRIMERS array includes interviewQs[]

User visits /primers/[slug]
  → getPrimerBySlug(slug) reads PRIMERS array (in-memory, no I/O)
  → PrimerView.tsx renders sections + keyTerms + interviewQs (if present)
```

---

## Tavily Query Budget Impact

| Cron | Frequency | Queries/Run | Queries/Month |
|------|-----------|-------------|---------------|
| Daily briefing (`/api/generate`) | ~22 weekdays/month | 8 | ~176 |
| Events (`/api/events`) | 4 Mondays/month | 5 | 20 |
| **Total** | — | — | **~196/month** |
| Free tier limit | — | — | 1,000/month |
| Headroom | — | — | ~80% unused |

Budget is not a concern for v1.1.

---

## Redis Key Inventory (after v1.1)

| Key Pattern | Content | Status |
|-------------|---------|--------|
| `briefing:{YYYY-MM-DD}` | `Briefing` JSON | Existing |
| `briefing:index` | Sorted set of dates | Existing |
| `quiz:{YYYY-MM-DD}` | `DailyQuiz` JSON | Existing |
| `quiz:index` | Sorted set of dates | Existing |
| `podcast-script:{YYYY-MM-DD}` | TTS script text | Existing |
| `aptitude-bank:{type}` | `AptitudeBankStore` JSON | Existing |
| `subscription:{userId}` | subscription status | Existing |
| `elevenlabs:chars:{YYYY-MM}` | char usage count | Existing |
| `bookmark:{userId}:{date}:{storyId}` | bookmark flag | Existing |
| `note:{userId}:{date}:{storyId}` | note text | Existing |
| `events:current` | `EventsStore` JSON | Feature 1 (new) |

No sorted-set index needed for events — only one current snapshot is ever stored.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Piggybacking Events Queries onto Daily Briefing Cron

**What:** Adding event search queries to the 8 existing Tavily queries in `lib/generate.ts`.
**Why bad:** Events are weekly-refresh content. Adding them to the daily cron wastes Tavily quota, bloats the Claude prompt, and couples two independent concerns. The briefing prompt already uses 16,000 max_tokens — adding events context risks truncation.
**Instead:** Separate weekly cron for `/api/events` with its own Tavily calls and its own Claude call.

### Anti-Pattern 2: Per-User AI Generation for Primer Questions

**What:** Generating primer interview Qs at request time per user visit.
**Why bad:** Expensive (haiku still costs tokens per call), introduces page load latency, and produces inconsistent output per user. The quiz uses a cached generation pattern precisely to avoid this.
**Instead:** Generate once as static data in `lib/primers-data.ts`, serve from memory.

### Anti-Pattern 3: Adding Events Storage to `lib/storage.ts`

**What:** Adding `saveEvents()` / `getEvents()` functions to the existing `lib/storage.ts`.
**Why bad:** `lib/storage.ts` already handles briefings, quizzes, and aptitude banks, and delegates podcast storage to `lib/podcast-storage.ts`. Adding events makes it a God module. The existing pattern for new storage concerns is a separate file.
**Instead:** `lib/events-storage.ts` as a standalone dual-backend storage file.

### Anti-Pattern 4: Hardcoding City Options in Events Filter

**What:** `const CITIES = ['London', 'Manchester', 'Birmingham', ...]` as a static constant.
**Why bad:** Events storage may not have events in every city on every refresh. Empty filter options confuse users. The set of available cities drifts from the hardcoded list.
**Instead:** Derive city options from `events.map(e => e.city)` deduplicated and sorted, filtered to only show cities with at least one event in the current store.

### Anti-Pattern 5: Sending Full Digest Without Rate Limit Awareness

**What:** Sending to all subscribers in a tight loop as subscriber count grows.
**Already partially mitigated:** `app/api/digest/route.ts` has a 100ms delay between sends for lists > 10 subscribers.
**Remaining risk:** Resend free tier is 100 emails/day. At > 100 subscribers the Sunday cron silently truncates. Not a v1.1 concern — flag when subscriber count approaches 80.
**Future mitigation:** Upgrade to Resend paid tier (~£8/mo) or use Resend Broadcasts feature (bulk send, handles rate limits internally).

---

## Scalability Considerations

| Concern | Now (<100 subscribers) | At 500 | At 2,000 |
|---------|------------------------|--------|----------|
| Digest send volume | Fine — Resend free (100/day) | Resend paid tier required | Resend paid + batching or Broadcasts |
| Redis events key | Single key, ~10-50KB | Same | Same |
| ElevenLabs chars | 100k/month, ~2.8k/episode | Same once Blob caching is active | Move to Pro tier if revenue justifies |
| Tavily queries | ~196/month, ~80% headroom | Same | Same |
| Vercel cron concurrency | 3 crons, no schedule overlap | Same | Same |

---

## Sources

All findings based on direct code inspection of the Folio codebase (2026-03-10).

Files inspected:
- `lib/storage.ts` — dual-backend pattern, key naming, sorted-set index pattern
- `lib/generate.ts` — Tavily query pattern (8 parallel queries), Claude sonnet usage
- `lib/quiz.ts` — haiku generation pattern, JSON extraction, error handling
- `lib/podcast.ts` — script generation via Claude sonnet
- `lib/podcast-storage.ts` — Blob/FS dual backend, `listPodcastDates()` implementation
- `lib/email.ts` — `DigestStory` interface, `digestHtml()`, `sendWeeklyDigest()`, Resend usage
- `lib/types.ts` — `PrimerInterviewQ`, `Primer`, `FirmProfile`, `FirmDeadline` interfaces
- `lib/primers-data.ts` — `PRIMERS` array structure and `interviewQs` field absence
- `lib/firms-data.ts` — `FirmProfile` shape, aliases array, credibility rule comment
- `app/api/generate/route.ts` — cron auth pattern, fire-and-forget, admin check
- `app/api/digest/route.ts` — full digest implementation, Stripe subscriber loop
- `app/podcast/archive/page.tsx` — already-complete archive page
- `app/primers/[slug]/page.tsx` — route structure, `requireSubscription()` usage
- `vercel.json` — existing cron entries (06:00 daily generate, 08:00 Sunday digest)
- `.planning/PROJECT.md` — v1.1 requirements and constraints
