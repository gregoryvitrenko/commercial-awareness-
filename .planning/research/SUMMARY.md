# Project Research Summary

**Project:** Folio v1.1 — Content & Reach
**Domain:** Niche B2C editorial SaaS — UK law student TC preparation tool
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

Folio v1.1 adds six discrete features to an already-working subscription product. Research confirms the most important finding: no new npm packages are required for any of the six features, with one narrow exception. Two of the six features (weekly email digest, podcast archive) are already fully built in the codebase and are blocked only by infrastructure gaps (Vercel Blob not configured) or a missing compliance item (unsubscribe link). Two more (primer interview questions, firms expansion) are pure data-entry work with all scaffolding already in place. Only one feature — the events section — requires net-new code, and it follows established patterns already in the codebase. The one new dependency recommended is `ical-generator` for the events `.ics` export, to ensure iOS Calendar compatibility without hand-rolling RFC 5545 format.

The recommended build order is: mobile/header polish first (visible quality improvement before any marketing push), then firms expansion (pure data, no risk), then Blob setup and podcast archive activation, then primer interview questions (static data in `primers-data.ts`), then the events section (most complex net-new feature), and finally digest validation and compliance. This order ensures each phase is independently shippable and avoids dependencies — specifically, the events section must exist before it can appear in the digest, and Vercel Blob must be configured before the podcast archive ships.

Three risks require non-negotiable action before the relevant phases ship. First, the podcast archive must not go live without Vercel Blob configured — without it, every archive visit burns approximately 2,800 ElevenLabs characters against the 100,000/month budget, and five users browsing seven past episodes would exhaust the entire monthly quota. Second, the weekly digest must include a working unsubscribe mechanism before the first send — Folio's audience is law students learning regulatory compliance, and receiving a GDPR-non-compliant email from a legal education product is a credibility-destroying signal and a Resend account suspension risk. Third, primer interview questions must be written manually rather than AI-generated — generic TC interview questions that any student finds via a Google search destroy the feature's value proposition.

## Key Findings

### Recommended Stack

All v1.1 features are achievable within the existing dependency tree. The only new package recommended is `ical-generator` for the events `.ics` calendar export, which eliminates RFC 5545 compliance risk and iOS Calendar rejection. Everything else uses the existing Anthropic SDK (Claude Haiku for events generation and primer packs), Upstash Redis (events cache), `@vercel/blob` (already installed, needs `BLOB_READ_WRITE_TOKEN` env var configured in Vercel), Resend (digest already built), and Tailwind CSS plus existing shadcn/ui components (mobile nav, header).

**Core technologies (existing, validated):**
- `@anthropic-ai/sdk` — Claude Haiku for events generation; Sonnet for briefings (no change)
- `@upstash/redis` — events cache via new `events:current` Redis key; all existing caching unchanged
- `resend` — weekly digest (already built), welcome email
- `@vercel/blob` — podcast MP3 caching (installed, needs `BLOB_READ_WRITE_TOKEN` in Vercel env vars)
- Tailwind CSS v3 — all UI work including mobile responsive fixes and events city filter tabs
- `shadcn/ui` Sheet component — mobile nav drawer if needed (already in dependency tree)

**New package (one addition):**
- `ical-generator` — RFC 5545 compliant `.ics` export for events; eliminates iOS Calendar rejection risk

**Infrastructure change (not a package):**
- Vercel Blob Store must be created in the Vercel dashboard and `BLOB_READ_WRITE_TOKEN` added to env vars before podcast archive ships

### Expected Features

**Must have (table stakes):**
- Events section: event name, date, city, description, registration link, city filter tabs, `.ics` calendar download per event — free tier, no paywall
- Weekly digest: working `List-Unsubscribe` header and dedicated unsubscribe endpoint (UK GDPR / PECR legal requirement — not optional)
- Podcast archive: month-grouped listing of past episodes — code already complete, blocked only by Blob infra
- Primer interview questions: 3 questions per primer (question + what they want + answer skeleton) across all 8 primers — UI already built, data missing from `primers-data.ts`
- Firms expansion: 8 Tier 1 firms (Baker McKenzie, Jones Day, Mayer Brown, DLA Piper, Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons) with manually verified TC data

**Should have (differentiators):**
- Events: TC-relevance badge per event; deadline proximity indicator ("Closes in 3 days"); upcoming vs. past visual treatment reusing the existing `isClosed` pattern from firm deadlines
- Events: "last updated" timestamp visible on the page so users know when the list was generated
- Weekly digest: dynamic subject lines tied to top story topic rather than generic date-anchored format; digest de-duplication by firm overlap and topic cap
- Mobile: scroll-activated sticky header with `bg-stone-50/95` background (not white); topic-coloured left border on story cards; remove italic talking-point quote from story cards

**Defer to v2+:**
- Bulk `.ics` export (all upcoming events in one file)
- Refer-a-friend referral codes with Stripe credit (Option A forward-link CTA is sufficient for v1.1)
- AI-generated primer questions at runtime (static data in `primers-data.ts` is the right architecture)
- Firms PDF export
- Cravath, Cahill Gordon, Orrick — small London TC programmes, lower demand than Tier 1 additions

### Architecture Approach

Every new feature conforms to the existing dual-backend storage pattern (`useRedis()` check in `lib/storage.ts`) and the established cron + fire-and-forget generation pattern in `app/api/generate/route.ts`. The events section is the only net-new data concern, implemented as a separate `lib/events-storage.ts` — not added to `lib/storage.ts`, which already handles briefings, quizzes, and aptitude banks and delegates podcast storage to `lib/podcast-storage.ts`. Primer interview questions are static data in `lib/primers-data.ts` — no caching, no API routes, no new infrastructure. Firms expansion is a pure data append to `lib/firms-data.ts`. The digest already works; it needs compliance additions only.

**Major components and responsibilities:**
1. `lib/events.ts` + `lib/events-storage.ts` + `app/api/events/route.ts` — weekly Tavily (5 queries) + Claude Haiku events generation, Redis `events:current` key storage, Monday 07:00 UTC cron in `vercel.json`
2. `lib/ics.ts` — `.ics` builder using `ical-generator` with `Europe/London` TZID; client-side Blob download (no API route needed)
3. `lib/email.ts` + `app/api/digest/route.ts` + new `GET /api/unsubscribe` — digest already built; needs `List-Unsubscribe` header, unsubscribe endpoint, `emails.slice(0, 90)` hard cap, and de-dupe logic
4. `lib/primers-data.ts` + `components/PrimerView.tsx` — static interview question arrays added to each of 8 primers; minor render section addition in PrimerView
5. `lib/firms-data.ts` — static firm profile data appended for 8+ new firms; no schema changes needed
6. `components/Header.tsx` + `components/StoryCard.tsx` + `app/page.tsx` — mobile responsive fixes and three deferred design audit items

### Critical Pitfalls

1. **Podcast archive without Vercel Blob** — every archive visit regenerates ElevenLabs audio, burning ~2,800 chars per play. Five users browsing 7 past dates wipes the entire 100,000/month budget. Prevention: configure Vercel Blob before shipping the archive page; use `?check=true` existence probe before showing a play button for past dates.

2. **Weekly digest without unsubscribe link** — UK GDPR Article 7(3) and PECR Regulation 22 require a working unsubscribe mechanism in marketing emails. Folio's audience is learning about regulatory compliance — receiving a GDPR-non-compliant email from a legal education product is a credibility-destroying signal. Spam complaints also trigger Resend account suspension, killing transactional welcome emails simultaneously. Prevention: add `List-Unsubscribe` header and `GET /api/unsubscribe` endpoint before the first Sunday cron fires.

3. **ICS export hand-rolled without RFC 5545 compliance** — iOS Calendar is the strictest parser and the most likely client for this iPhone-dominant student audience. Missing `PRODID`, unescaped special characters in `SUMMARY`, wrong line endings, or missing `TZID` produce silent import failures or wrong event times. Prevention: use `ical-generator` npm package with `Europe/London` TZID; test on a real iOS device.

4. **Stale events data shown as upcoming** — Redis cache without date-aware filtering shows past events as current. Students adding stale calendar entries for events that already happened is a trust-destroying failure. Prevention: filter `events.filter(e => new Date(e.date) >= new Date())` at render time; set 7-day Redis TTL; add explicit "future dates only" instruction to Claude prompt.

5. **Firms expansion with unverified salary or deadline data** — NQ salary figures and application deadlines are the most scrutinised fields by the target audience and change each recruitment cycle. Incorrect data is a credibility-breaking failure. Prevention: verify each new firm against the official recruitment page or The Trackr; set `lastVerified` to the actual verification date; add only 5-8 well-verified firms at launch rather than 20 with uncertain data.

## Implications for Roadmap

Based on combined research, six phases are suggested in dependency order:

### Phase 1: Polish and Mobile
**Rationale:** Zero code dependencies — no other phase must complete first. Delivers visible quality improvement before any v1.1 marketing push. Includes three deferred design audit items (italic quote removal from story cards, topic-coloured left border on cards, stone-100 page background) that improve the experience for existing subscribers immediately.
**Delivers:** Scroll-activated sticky header with correct palette (`bg-stone-50/95` not `bg-white/95`), mobile-responsive story cards, design system consistency per the deferred audit items
**Addresses:** Mobile and header fixes feature
**Avoids:** iOS Safari `backdrop-blur` bug (test on real iPhone); dark mode split (add `dark:bg-zinc-950/95` alongside light mode); non-button touch target failures (all interactive nav elements must be `<button>` not `<div>`)
**Research flag:** Standard Tailwind/React patterns — no additional research phase needed

### Phase 2: Firms Expansion
**Rationale:** Pure data work, no infrastructure risk. Can overlap with Phase 1 in calendar time but kept separate to focus effort. Start with 8 Tier 1 firms that have highest student demand. Quality over quantity — verify all salary and deadline data before writing.
**Delivers:** 38 to approximately 46 firm profiles covering the full Magic Circle + Silver Circle + top US London TC landscape that students actually target
**Addresses:** Firms expansion feature
**Avoids:** Stale salary/deadline data (verify against firm websites + The Trackr); US firms without traditional TCs misrepresented (use `intakeSizeNote: 'Direct NQ hire'` or exclude); Dentons entity alias confusion (include all variant entity names in `aliases[]`, verify against existing briefing data for which variant appears in `story.firms[]`)
**Research flag:** No code research needed — pure data entry. Human verification required per firm against official recruitment pages.

### Phase 3: Podcast Archive Activation
**Rationale:** All code is already complete. The only task is infrastructure setup (Vercel Blob) plus verification that `/podcast/[date]` route exists. Activating Blob starts caching MP3s immediately, which reduces ongoing ElevenLabs character consumption — a compounding benefit that begins accumulating from the day Blob is configured.
**Delivers:** Working podcast archive with month-grouped episode listing; MP3 caching active (stops burning ElevenLabs characters on every play request)
**Uses:** `@vercel/blob` (already installed), `listPodcastDates()` (already wired to Blob backend)
**Avoids:** ElevenLabs budget blowout from uncached audio — Blob must be configured before this phase ships; note the archive will only show episodes generated after Blob activation, not historical episodes
**Research flag:** No code research needed — infrastructure task only. Verify `/podcast/[date]` route exists before marking complete.

### Phase 4: Primer Interview Questions
**Rationale:** Static data addition with all scaffolding already in place. `PrimerInterviewQ` interface is defined, `PrimerView.tsx` renders the section, and the `interviewQs` field is typed on the `Primer` interface. Work is writing 24 questions (3 per primer × 8 primers) and adding a minor render section to `PrimerView.tsx`.
**Delivers:** 24 interview questions across 8 primers with structured commercial reasoning skeletons (not STAR format, which is wrong for commercial awareness questions)
**Addresses:** Primers interview questions feature from the product backlog
**Avoids:** Generic questions with no TC prep value — write manually, not AI-generated; quality test is "only answerable by someone who has read this primer"; use commercial reasoning skeleton format (Context / Commercial impact / Legal angle / Your view), not STAR
**Research flag:** No technical research needed. Content quality is the only constraint.

### Phase 5: Events Section
**Rationale:** Most complex net-new feature. Creates new storage and generation files following established patterns but requires more components than any other phase. Must ship before Phase 6 if digest events integration is in scope. Two-file storage split (`lib/events-storage.ts` separate from `lib/storage.ts`) is mandatory per architectural pattern.
**Delivers:** Free-tier events listing with city filter (URL search params, not client state), `.ics` calendar export per event, weekly AI refresh via Monday 07:00 UTC cron
**Uses:** Claude Haiku (events generation from 5 weekly Tavily queries), Redis `events:current` key (single overwrite, no date-keyed accumulation), `ical-generator` with `Europe/London` TZID, URL search params for city filter derived from available events
**Implements:** `lib/events.ts`, `lib/events-storage.ts`, `lib/ics.ts`, `app/events/page.tsx`, `app/api/events/route.ts`, `vercel.json` weekly cron entry `{ "path": "/api/events", "schedule": "0 7 * * 1" }`
**Avoids:** Daily event searches (use weekly-only cron, caps to ~64 Tavily queries/month); stale events display (date filter at render + 7-day Redis TTL + Claude prompt instruction); hardcoded city list (derive from available events data); events piggybacked onto daily briefing cron (separate concerns, different refresh cadence)
**Research flag:** Verify `ical-generator` current version and `Europe/London` TZID API before implementing `lib/ics.ts` — this is the one new package in the entire v1.1 plan.

### Phase 6: Digest Compliance and Improvements
**Rationale:** Core digest already fires on Sunday 08:00 UTC cron automatically (code is complete). This phase adds the mandatory compliance item (unsubscribe mechanism), validates the digest actually fires in production, improves subject lines, and optionally integrates the events section from Phase 5.
**Delivers:** GDPR/PECR-compliant digest with working `List-Unsubscribe` header and `/api/unsubscribe` endpoint, improved topic-led subject lines, de-duplicated story selection (de-dupe by firm overlap + topic cap), hard send cap at 90 emails, optional "upcoming events this week" section if Phase 5 is complete
**Uses:** `lib/email.ts` (add unsubscribe link in footer, dynamic subject from top story topic), `app/api/digest/route.ts` (add `List-Unsubscribe` header, `emails.slice(0, 90)` cap, de-dupe logic), new `GET /api/unsubscribe` route, Redis `email-opt-out:{userId}` key
**Avoids:** UK GDPR / PECR violation — unsubscribe is a legal prerequisite, not an optional enhancement; Resend 100/day silent truncation at ~100 subscribers (hard-cap at 90 with warning log when `emails.length > 90`); near-duplicate stories from the same ongoing transaction across multiple days
**Research flag:** No technical research needed. Legal compliance requirement (unsubscribe) is clear. Verify current Resend pricing and daily limits at resend.com/pricing before shipping — training knowledge cutoff is August 2025.

### Phase Ordering Rationale

- Phase 1 (Polish) comes first because it has zero dependencies and delivers immediate quality improvements for existing subscribers before v1.1 is announced
- Phase 2 (Firms) is independent data work that can overlap with Phase 1 in calendar time but is kept separate to focus effort and avoid quality shortcuts
- Phase 3 (Podcast Archive) must happen before users are directed to the archive — the Blob configuration is a prerequisite that should not block content phases
- Phase 4 (Primers) is independent, low-risk content work that can ship at any point; placed here because it is higher visibility than events
- Phase 5 (Events) is the most complex net-new feature and is a soft prerequisite for digest events integration in Phase 6
- Phase 6 (Digest) validates existing automation and adds compliance; placed last because it validates the most complex ongoing system (weekly email) and the digest improvement is enhanced (though not blocked) by Phase 5 events data

### Research Flags

Phases requiring deeper research during planning:
- **Phase 5 (Events):** Verify `ical-generator` current version, API signature, and `Europe/London` TZID support before writing `lib/ics.ts` — this is the only new package in the plan

Phases with standard patterns (no additional research needed):
- **Phase 1 (Polish):** Standard Tailwind responsive CSS and React hooks
- **Phase 2 (Firms):** Pure data entry following established `FirmProfile` schema
- **Phase 3 (Podcast Archive):** Infrastructure setup only — all code complete
- **Phase 4 (Primers):** Static data addition to a known, typed interface
- **Phase 6 (Digest):** Minor additions to an existing feature; compliance requirements are clear

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct codebase analysis of `package.json` and all relevant lib files; no new packages needed except `ical-generator` |
| Features | HIGH | Two features confirmed fully built by direct code read; four others have scaffolding confirmed; firm priority list based on established UK TC domain knowledge |
| Architecture | HIGH | All new features mirror established dual-backend storage, cron, and fire-and-forget generation patterns; direct code inspection of all integration points |
| Pitfalls | HIGH | ElevenLabs budget risk: direct code analysis of `podcast-storage.ts` and confirmed Blob absence in MEMORY.md; GDPR requirement: clear legal standard; ICS compliance: RFC 5545 specification |

**Overall confidence:** HIGH

### Gaps to Address

- **`ical-generator` current version and API:** Training knowledge cutoff is August 2025. Verify the current version, `createEvent()` API signature, and `Europe/London` TZID support at implementation time for Phase 5. This is the one new dependency and the one gap that requires fresh verification.
- **Resend free tier limits:** Published as 100 emails/day and 3,000/month — confirmed in `digest/route.ts` comment in the codebase. Verify current pricing at resend.com/pricing before Phase 6 in case limits have changed.
- **Vercel Blob free tier:** Published as 1GB storage and 1GB bandwidth/month — training knowledge. Verify current limits at the Vercel dashboard before Phase 3. At approximately 5MB per MP3 and daily generation, the 1GB storage threshold would be reached at around 200 episodes (approximately 6-7 months).
- **`/podcast/[date]` route existence:** FEATURES.md notes the podcast archive links to `/podcast/${date}` for past episodes but this dynamic route may not exist. Verify before marking Phase 3 complete.
- **Primer `interviewQs` current state:** ARCHITECTURE.md confirms `interviewQs` is currently `undefined` on all 8 primers. Verify this has not changed before starting Phase 4.

## Sources

### Primary (HIGH confidence — direct codebase analysis, 2026-03-10)
- `lib/storage.ts` — dual-backend pattern, key naming, sorted-set index structure
- `lib/generate.ts` — Tavily 8-query pattern, Claude Sonnet usage, fire-and-forget generation
- `lib/quiz.ts` — Claude Haiku generation pattern, JSON extraction, error handling
- `lib/podcast.ts` + `lib/podcast-storage.ts` — Blob/FS dual backend, `listPodcastDates()`, `useBlob()` return value without BLOB_READ_WRITE_TOKEN
- `lib/email.ts` + `app/api/digest/route.ts` — digest implementation status, `DigestStory` interface, Resend 100/day limit comment, existing digest cron schedule
- `lib/types.ts` — `PrimerInterviewQ`, `Primer`, `LegalEvent` (not yet present), `FirmProfile`, `FirmDeadline` interfaces
- `lib/primers-data.ts` — `PRIMERS` array structure, `interviewQs` absence confirmed
- `lib/firms-data.ts` — existing 38 firm coverage, `FirmProfile` schema, aliases mechanism, credibility rule
- `app/api/generate/route.ts` — cron auth pattern, fire-and-forget structure, haiku/sonnet model allocation
- `app/podcast/archive/page.tsx` — archive page fully built and production-ready confirmed
- `vercel.json` — existing cron entries (06:00 UTC daily generate, 08:00 UTC Sunday digest)
- `package.json` — current dependency tree; `@vercel/blob` installed, `ical-generator` not present

### Primary (HIGH confidence — stable technical and legal standards)
- RFC 5545 iCalendar format specification — VCALENDAR/VEVENT structure, line folding, TZID handling, UID uniqueness requirements, iOS Calendar strictness
- UK GDPR Article 7(3) — withdrawal of consent requirement
- UK PECR Regulation 22 — unsolicited marketing email unsubscribe requirement

### Secondary (MEDIUM confidence — training knowledge, verify before use)
- Resend pricing (100 emails/day, 3,000/month free tier) — confirmed in codebase comment but verify current limits at resend.com/pricing
- Vercel Blob pricing (1GB free tier storage + bandwidth) — verify current limits at Vercel dashboard
- iOS Calendar RFC 5545 strictness — well-documented practitioner knowledge; specific behaviour varies by iOS version
- UK TC firm demand ranking (Baker McKenzie, Jones Day listed as Tier 1) — UK legal careers domain knowledge; cross-referenced against existing `firms-data.ts`

---
*Research completed: 2026-03-10*
*Ready for roadmap: yes*
