# Domain Pitfalls

**Domain:** Adding new features to a live subscription SaaS — v1.1 (Events, Digest, Podcast Archive, Primer Interview Qs, Firms Expansion, Mobile/Header)
**Researched:** 2026-03-10
**System:** Folio (folioapp.co.uk) — Next.js 15, Upstash Redis, ElevenLabs (100k chars/month), Tavily (1,000 searches/month), Resend (free tier), Vercel Pro

---

## Critical Pitfalls

Mistakes that cause budget blowouts, data loss, or rewrites.

---

### Pitfall 1: Podcast Archive Triggering ElevenLabs Regeneration on Every Visit

**What goes wrong:** The podcast archive page lists past dates. A user clicks a past date. The frontend calls `POST /api/podcast-audio` with that date. Because `BLOB_READ_WRITE_TOKEN` is not set in Vercel (confirmed in PROJECT.md: "Vercel Blob not yet set up"), `useBlob()` in `podcast-storage.ts` returns `false`. The function `getAudioUrl()` returns `null`. There is no filesystem fallback on Vercel (only local dev). The route reaches the ElevenLabs API call and burns ~2,800 characters every time.

**Why it happens:** The code path in `app/api/podcast-audio/route.ts` checks for cached audio in this order:
1. Blob URL (production) — returns null because BLOB_READ_WRITE_TOKEN not set
2. Filesystem buffer (dev only) — returns null on Vercel
3. Calls ElevenLabs API

Without Vercel Blob configured, production has no persistent MP3 cache. Every podcast request regenerates audio.

**Quantified budget impact:**
- Each regeneration: ~2,800 chars
- Monthly ElevenLabs limit: 100,000 chars
- Daily briefing alone: 2,800 chars × 31 days = ~86,800 chars/month
- Remaining buffer at full usage: ~13,200 chars/month
- A podcast archive with 7 past dates, browsed by 5 users each: 7 × 5 × 2,800 = 98,000 chars — wipes the entire monthly budget in one session

**Consequences:** Monthly ElevenLabs quota exhausted mid-month. `hasCapacity()` check returns false. Current day's podcast fails for all subscribers. Revenue impact: paying subscribers lose a core premium feature.

**Prevention:**
1. Set up Vercel Blob Store and set `BLOB_READ_WRITE_TOKEN` in Vercel env vars BEFORE shipping the podcast archive page. This is listed as a known issue in MEMORY.md — it must be resolved in v1.1, not deferred again.
2. The archive page UI should call `GET /api/podcast-audio?date=X&check=true` (lightweight existence check) before showing a play button. If `exists: false`, show "Audio not available" rather than attempting generation.
3. Never trigger `POST /api/podcast-audio` on archive page load — only on explicit user action (play button click).
4. Cap archive depth: only show dates where a podcast script exists in Redis (`podcast-script:{date}` key). Past dates without scripts cannot generate audio (script is a prerequisite per the route logic).

**Detection:** After shipping podcast archive, monitor Redis key `elevenlabs:chars:{YYYY-MM}` for unexpected spikes within the first 48 hours.

**Phase:** Podcast archive phase. Do not ship archive until Vercel Blob is configured.

**Confidence:** HIGH — grounded directly in `podcast-storage.ts` code (`useBlob()` returns false without BLOB_READ_WRITE_TOKEN), the route's fallback path, and confirmed absence of Blob setup per MEMORY.md.

---

### Pitfall 2: Weekly Digest Hitting Resend Free Tier Limit

**What goes wrong:** The weekly digest cron runs Sunday 08:00 UTC (`"0 8 * * 0"` in vercel.json). It fetches all active Stripe subscribers and sends one email per subscriber. The Resend free tier limit is 100 emails/day (3,000/month). The current code already notes this: `// Resend free tier: 100/day` in `app/api/digest/route.ts` line 108. Once subscriber count exceeds 100, the digest fails to deliver to subscribers beyond position 100 in the list. Subscribers who paid £4/month receive no Sunday digest with no error message to them.

**Why it happens:** The loop in `app/api/digest/route.ts` sends sequentially with a 100ms delay. There is no batch-size cap — it sends to every email in `emails[]`. At 101 subscribers, Resend returns a rate limit error for email 101+, the `result.success` flag is false, and `failed` increments — but subscribers never know.

**Quantified impact:** Resend free tier: 100 emails/day. At £4/month with ~10% churn, reaching 100 subscribers is achievable within 2-3 months of active marketing (LinkedIn + law societies). The digest was built assuming growth.

**Consequences:** Digest silently fails for subscribers above the limit. Subscriber churn increases as paying users receive less value. Owner sees `failed` count in Vercel logs but no automated alert.

**Prevention:**
1. Add a hard cap in the digest route: `const emailsToSend = emails.slice(0, 90)` — leave 10 in buffer for welcome emails sent the same day.
2. Log a warning when `emails.length > 90`: `console.warn('[digest] Approaching Resend free tier limit — consider upgrading')`.
3. Resend paid tier is $20/month for 50k emails — upgrade when subscriber count approaches 80. This fits within the £50/month budget cap if one other free-tier service offsets it.
4. Do not increase the 100ms delay as a mitigation — it does not solve the cap, only the rate limit within the cap.

**Phase:** Weekly digest phase. Add the cap during implementation.

**Confidence:** HIGH — Resend's 100/day free tier limit is their published pricing. The code confirms no existing cap.

---

### Pitfall 3: Tavily Search Budget Exhausted by Events Feature

**What goes wrong:** The events feature adds Tavily searches to find UK legal events. If implemented as a daily cron (similar to briefing generation), it adds N more queries per run to the existing 8. The current daily briefing already consumes 8 queries × ~365 days = 2,920 searches/year against a 1,000/month (12,000/year) limit — leaving ~750/month buffer. But that buffer evaporates quickly with events searches.

**Quantified impact:**
- Current usage: 8 queries/day × 30 days = 240 searches/month
- Remaining free tier: 1,000 − 240 = 760/month
- Events with 4 queries/day: 4 × 30 = 120 additional = 360 queries/month (still within limit)
- Events with 8 queries/day: 8 × 30 = 240 additional = 480 queries/month (still within limit)
- Events with 8 queries/day + any debugging reruns or ad-hoc admin triggers: can breach 1,000/month

**Specific query quality problem:** Legal events search is inherently noisy. Tavily returns general "legal news" for queries like "UK legal events 2026" because events content is sparse on news sites. The 800-character content limit in `generate.ts` truncates event listings before address/date details appear. Results will contain: conference marketing fluff, past events not filtered by date, student events mixed with practitioner events, and non-London events when "UK" is queried.

**Prevention:**
1. Run events refresh weekly (Sunday cron alongside digest), not daily. Legal events do not change daily. This caps events Tavily usage at ~16 queries/week = ~64/month.
2. Use highly specific queries: `"law society" OR "bar council" networking London 2026 site:lawsociety.org.uk` — site-scoped queries return less noise.
3. Hard-filter results by date: any event with a past date must be excluded at the Claude synthesis step. Add explicit instruction: "Return ONLY events with a future date. If event date cannot be determined from the source, omit it."
4. Do not regenerate events data if the existing cache is < 7 days old — add staleness check analogous to `BANK_TTL_DAYS` in aptitude banks.

**Phase:** Events feature phase.

**Confidence:** HIGH for budget arithmetic (based on published Tavily limits and current usage in code). MEDIUM for query quality prediction (based on general knowledge of web search quality for events content).

---

### Pitfall 4: Stale Events Data — Past Events Shown as Current

**What goes wrong:** Events are generated by Tavily + Claude synthesis and cached in Redis. The cache has no automatic expiry if not explicitly set. An event scheduled for "15 March 2026" is cached on 10 March. By 20 March, it is still showing on the events page as an upcoming event because the cache was not invalidated. Worse: Claude may synthesise events from source articles that pre-announce events months out, and the ICS export gives the user an already-past calendar entry.

**Why it happens:** Redis SET without TTL persists indefinitely. The aptitude bank pattern uses `BANK_TTL_DAYS = 7` as a staleness check, but this is an age-of-cache check, not an event-date check. An event can be "fresh" (cached yesterday) but still refer to a past occurrence.

**Consequences:** Students add stale events to their calendar. They arrive expecting a networking event that ended last week. Trust damage is severe — the feature that was supposed to help TC prep actively misleads.

**Prevention:**
1. Store events as an array of objects with an explicit `eventDate: string` (ISO 8601). Before rendering on the frontend, filter: `events.filter(e => new Date(e.eventDate) >= new Date())`.
2. Set a Redis TTL on the events cache: 7 days. Forced weekly refresh ensures events are always re-evaluated against current date.
3. In the Claude prompt for events synthesis: "Include ONLY events with a confirmed future date. For each event, extract the exact date in YYYY-MM-DD format. If the date is ambiguous or in the past, omit the event."
4. Add a "last updated" timestamp visible on the events page so users know when the list was generated.

**Phase:** Events feature phase.

**Confidence:** HIGH — the stale data pattern is a direct consequence of Redis caching without date-aware expiry logic.

---

## Moderate Pitfalls

---

### Pitfall 5: ICS Calendar Export Generating Malformed Files

**What goes wrong:** The `.ics` file format (iCalendar RFC 5545) has strict requirements that are easy to violate when building the export by hand: lines must not exceed 75 octets (fold with CRLF + space), `DTSTART`/`DTEND` must be in UTC format (`YYYYMMDDTHHMMSSZ`) or with `TZID` parameter, the `UID` must be globally unique per event, and the file must end with `CRLF`. A hand-rolled string template that gets these wrong produces a `.ics` file that imports silently into Google Calendar but shows the wrong time, or fails to import into Outlook, or creates duplicate events on iOS.

**Specific iOS Safari risk:** iOS Calendar is the most strict iCal parser and the most likely client for this audience (students on iPhone). It rejects files where:
- `BEGIN:VCALENDAR` is not on the first line with no BOM
- `PRODID` field is missing
- `VERSION:2.0` is missing
- `SUMMARY` field contains special characters not escaped (commas, semicolons, backslashes must be escaped with `\`)

**Prevention:**
1. Do not hand-roll ICS format. Use the `ical-generator` npm package (well-maintained, RFC 5545 compliant, supports timezones). This is a ~5KB dependency that eliminates all format correctness risk.
2. Set timezone explicitly: UK events are BST (UTC+1) in summer and GMT (UTC+0) in winter. Use `Europe/London` as the `TZID`. Do not output UTC and adjust manually — daylight saving transitions are handled by the TZID system.
3. Test the exported file by importing into Google Calendar, Outlook.com, and iOS Calendar before shipping. These three clients cover >95% of the target audience.

**Phase:** Events feature phase.

**Confidence:** HIGH for ICS format requirements (RFC 5545 is a standard). MEDIUM for the specific iOS strictness level (based on practitioner knowledge, not verified against current iOS version).

---

### Pitfall 6: Digest Email Missing Unsubscribe Mechanism — UK GDPR / PECR Risk

**What goes wrong:** The current digest email in `lib/email.ts` has a footer that says "You're receiving this because you subscribe to Folio. Manage your subscription at any time from your account settings." This is not a functioning unsubscribe link — it directs users to account settings where subscription cancellation (Stripe) is conflated with email opt-out. UK GDPR and PECR require that marketing emails (which the digest is) contain a working unsubscribe mechanism that immediately honours the request.

**Why this matters for this specific product:** Folio's target audience includes law students who are learning about regulatory compliance. Receiving a GDPR-non-compliant email from a legal education product is both ironic and a credibility-destroying signal.

**Additional risk:** Resend's abuse team will suspend accounts that receive significant unsubscribe-by-marking-as-spam signals. If 5+ users mark the digest as spam because there is no unsubscribe link, the Resend account may be suspended — killing welcome emails (which are transactional and critical to the subscription flow) simultaneously.

**What the current code lacks:**
- No `List-Unsubscribe` header in the Resend send call
- No dedicated unsubscribe endpoint (e.g. `GET /api/unsubscribe?token=...`)
- No per-user email preference stored in Redis
- Footer links to "account settings" — not a one-click unsubscribe

**Prevention:**
1. Add `List-Unsubscribe` and `List-Unsubscribe-Post` headers to the `resend.emails.send()` call pointing to a real endpoint.
2. Create `GET /api/unsubscribe?userId=X&token=Y` that sets `email-opt-out:{userId}` in Redis and returns a confirmation page.
3. In the digest route, before sending, check `email-opt-out:{email}` (or by userId if mapped) and skip opted-out subscribers.
4. Update the footer to include a literal "Unsubscribe from this digest" link.
5. The welcome email is transactional (triggered by subscription activation) and does not require an unsubscribe mechanism under PECR. The weekly digest is marketing and does require it.

**Phase:** Weekly digest phase. The unsubscribe mechanism is a prerequisite, not an enhancement.

**Confidence:** HIGH — UK GDPR Article 7(3) and PECR Regulation 22 requirements for email marketing unsubscribe are clear legal requirements. The codebase currently lacks them.

---

### Pitfall 7: Primer Interview Qs Are Generic Without Firm-Level Specificity

**What goes wrong:** The `PrimerInterviewQ` type in `types.ts` (lines 206-212) has `question`, `whatTheyWant`, and `skeleton` fields. If these are AI-generated without firm-specific constraints, they will produce generic TC interview questions that appear in every "how to prepare for law firm interviews" article online. Examples: "What are the current trends in M&A?" or "Why is this practice area interesting to you?" These are the opposite of useful — every student has pre-prepared answers to these questions.

**What makes primer questions valuable vs. useless:**
- Useless: "Tell me about a recent M&A deal" (any deal works)
- Useful: "Carlyle Group recently acquired a UK infrastructure asset — what specific regulatory hurdles under the NSI Act would a Magic Circle firm need to navigate, and which practice group at Freshfields handles NSI Act filings?" (tests connected knowledge from the briefing system)
- Useless: "What challenges do investment banks face?" (too broad, no right answer)
- Useful: "A client is considering issuing a Regulation S bond to tap Asian institutional investors. Walk me through the disclosure and liability regime differences between Reg S and a full SEC registration." (tests specific, learnable knowledge)

**The caching strategy risk:** Primer content in `primers-data.ts` is static (hardcoded). If interview Qs are added as static data too, they go stale within one recruitment cycle (Sept-Oct each year when new TC interview formats emerge). If they are AI-generated and cached in Redis with no TTL, they persist indefinitely and quietly become outdated.

**Prevention:**
1. Keep interview Qs as static data in `primers-data.ts` — this is the right architecture. The 8 primer files are already written with enough depth to support 3-5 genuinely specific questions per primer.
2. Write questions manually (not AI-generated). The quality bar is: the question should only be answerable by someone who has done the reading in that primer. Not a general commercial awareness question.
3. Caching strategy: static data needs no cache. Do not introduce Redis caching for primer content — it creates a staleness problem without solving anything.
4. Do not link interview Qs to daily briefing content (too ephemeral). Link them to the structural knowledge in the primer sections (e.g. NSI Act, Takeover Code, SPA mechanics).

**Phase:** Primers interview Qs phase.

**Confidence:** HIGH for the quality assessment (grounded in TC interview preparation literature and the existing primer content depth). HIGH for the caching recommendation (direct consequence of static data architecture).

---

### Pitfall 8: Firms Expansion — Stale Salary and Deadline Data at Launch

**What goes wrong:** Adding new firms to `firms-data.ts` requires salary figures (`tcSalaryNote`, `nqSalaryNote`) and application deadlines (`FirmDeadline[]`). This data is sourced from public recruitment pages and aggregator sites (the-trackr.com, mentioned in the file header). Law firm salaries change each September-October with NQ announcement season. Deadlines shift by 2-4 weeks each cycle. A newly added firm profile with last year's salary or a deadline from the 2025 cycle will be wrong at launch.

**US firms specific risk:** Many US firms with London offices run "training contract" programmes that are not actually traditional 2-year TCs — they may be called "associate programmes," "structured associate hire," or "direct entry NQ." Describing these as traditional TCs with `seats: 4` would be factually wrong and could mislead students into applying for programmes that do not match their stage.

**Dentons entity confusion:** There are multiple Dentons entities in the UK — Dentons UK and Middle East, Dentons UKMEA, and the global Dentons brand. The firm underwent a "verein" structure merger. An `aliases[]` array that includes only "Dentons" would fail to match stories that say "Dentons UKMEA" or "Dentons UK and Middle East LLP." This is not hypothetical — the existing briefing system uses `story.firms[]` to match against `aliases[]` for the firm pages sidebar.

**Prevention:**
1. For any new firm, set `lastVerified` to the actual date you verified the data. Do not forward-date it.
2. Add a comment in `firms-data.ts` near each new firm: `// VERIFY: salaries and deadlines for 2026-27 cycle before shipping`.
3. For US firms without traditional TCs: either (a) document accurately with `intakeSizeNote: 'Direct NQ hire — no structured TC programme'` or (b) omit them from the launch batch and add only firms with verified TC data.
4. For Dentons-type entities: include all variant names in `aliases[]`. Check the existing briefing data (`data/briefings/`) for which name appears in `story.firms[]` — that is the canonical match target.
5. Cap the launch batch: add 5-8 well-verified firms rather than 20 firms with uncertain data. Accuracy > volume for this product.

**Phase:** Firms expansion phase.

**Confidence:** HIGH for the data staleness risk (salary and deadline data is time-sensitive by nature). HIGH for the Dentons alias issue (grounded in the `aliases[]` matching mechanism in `types.ts`). MEDIUM for US firm TC programme structure (based on general knowledge of US firm hiring — verify each firm before adding).

---

### Pitfall 9: Sticky Header CSS Specificity Conflict with Stone Palette

**What goes wrong:** Adding a scroll-dependent background to the header requires JavaScript to detect scroll position and conditionally apply a class. The common pattern is `window.scrollY > 0 ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'`. In Folio's case, the header currently renders on a `bg-stone-50` page background. When the header becomes sticky with `bg-white/95`, it will be visually lighter than the `bg-stone-50` page — visible as a slight colour mismatch at the boundary.

**The dark mode split:** `bg-white/95` in light mode, but in dark mode the page is `bg-zinc-950`. A dark-mode sticky header needs `dark:bg-zinc-950/95`. If the `dark:` variant is missed, dark mode users see a white header floating over a dark page — a jarring contrast that is immediately obvious.

**iOS Safari specifics:** `backdrop-filter: blur()` and `position: sticky` have known interaction bugs in older iOS Safari versions. If `backdrop-blur-sm` is applied to a sticky header, iOS Safari 15 and earlier will render the header as fully opaque (no blur) or occasionally flicker. The student demographic includes a high proportion of iPhone users, and iOS updates lag behind Safari releases — iOS 15 devices remain common.

**Touch target risk:** Mobile nav dropdowns that work on hover on desktop become tap-only on mobile. If the dropdown trigger is a `<div>` or `<span>` rather than a `<button>`, it may not receive touch events correctly on iOS Safari, which has historically under-delivered tap events to non-interactive elements.

**Prevention:**
1. Use `bg-stone-50/95` (not `bg-white/95`) for the sticky header in light mode to match the page background. Use `dark:bg-zinc-950/95` for dark mode.
2. Test scroll behaviour on a real iPhone in Safari (not just Chrome DevTools mobile simulator) before shipping. The DevTools simulator does not reproduce iOS Safari's `backdrop-filter` quirks.
3. All mobile nav interactive elements must be `<button>` elements (not `<div onClick>`) to ensure iOS touch event delivery.
4. Keep mobile nav simple: a hamburger button that shows a full-screen overlay menu, rather than hover dropdowns that require JS hover-simulation on touch devices. Dropdowns with complex hover states are a common source of "works on desktop, broken on mobile" bugs.

**Phase:** Mobile + header fixes phase.

**Confidence:** HIGH for the colour mismatch (direct consequence of stone-50 page vs white header). HIGH for touch target requirement (iOS Safari behaviour with non-button elements). MEDIUM for backdrop-blur iOS Safari bug (known issue but specific behaviour depends on iOS version).

---

## Minor Pitfalls

---

### Pitfall 10: Podcast Archive `listPodcastDates()` Requires Vercel Blob

**What goes wrong:** `listPodcastDates()` in `podcast-storage.ts` uses `@vercel/blob`'s `list()` API in production to enumerate all podcast MP3 files. Without Vercel Blob configured, it falls back to filesystem — which returns zero results on Vercel (serverless functions have no persistent filesystem). The podcast archive page will render an empty list for all users.

**Prevention:** Same as Pitfall 1 — Vercel Blob must be set up before shipping the podcast archive. But note: even after Blob is set up, `listPodcastDates()` requires that MP3 files were previously saved with `saveAudio()`. Past dates' audio (before Blob was configured) will not appear in the list. The archive will only show dates after Blob activation. Do not promise users "access to all past episodes" — the earliest episode will be the day Blob was set up.

**Phase:** Podcast archive phase.

**Confidence:** HIGH — direct consequence of `useBlob()` returning false and the filesystem fallback returning empty on Vercel.

---

### Pitfall 11: Digest Contains Identical Stories Across Multiple Days

**What goes wrong:** The current digest logic in `app/api/digest/route.ts` takes the first 2 stories from each of the last 7 briefings. If the briefing generation on several consecutive days covered the same topic (e.g. M&A activity around a large ongoing deal), the digest will include 2-3 stories about the same underlying transaction in different framings. The `buildExclusionBlock` mechanism in `generate.ts` reduces but does not eliminate this across a full week — it only looks back 2 days.

**Consequences:** A digest with near-duplicate stories looks like a broken system or a poorly curated product. For a £4/month product competing on quality, a sloppy weekly email is a churn driver.

**Prevention:**
1. De-duplicate digest stories by `story.firms[]` array — if two stories share ≥2 firm names, keep only the more recent one.
2. Prioritise topic variety: ensure no topic appears more than twice in the 10-story digest. After slicing to 10, sort by `topic` and apply a de-dupe pass.
3. This does not require a code change to the generation pipeline — only to the digest assembly logic in `route.ts`.

**Phase:** Weekly digest phase.

**Confidence:** HIGH — the pattern is a direct consequence of the current assembly logic and the 2-day exclusion window in briefing generation.

---

### Pitfall 12: Redis Memory Pressure from Events Cache

**What goes wrong:** Upstash Redis free tier has a 256MB data limit. Current usage is primarily: briefing JSON (~20-30KB each), quiz JSON (~10KB each), podcast scripts (~5KB each), aptitude banks (~50KB each), and user data (bookmarks, notes, subscription status). Estimated current footprint: 30 days × (30+10+5)KB = ~1.4MB for content + ~50KB aptitude banks + small user data. Events data (if stored as structured JSON with descriptions) could add 5-10KB per weekly refresh = low impact.

**The actual risk** is not the events data itself but the briefing index growth. `briefing:index` and `quiz:index` are sorted sets that grow by 1 member per day indefinitely. At scale, the briefing JSON keys themselves accumulate: 365 days × 30KB = ~10.7MB/year. After 2 years the free tier starts to be a concern.

**Prevention:**
1. Set a TTL on briefing JSON keys: `redis.set('briefing:{date}', data, { ex: 90 * 24 * 3600 })` — 90-day rolling window. Users rarely access briefings older than 90 days (the archive is a premium feature but engagement data likely shows a long tail).
2. Keep the sorted index (`briefing:index`) as it is — sorted set members are tiny (just date strings). Only the JSON values need TTL.
3. For events data: use a single key `events:cache` (overwritten weekly) rather than one key per event date. This prevents unbounded key accumulation.

**Phase:** Events feature phase (establish the single-key pattern from the start). Briefing TTL is a separate housekeeping task.

**Confidence:** MEDIUM for the specific memory numbers (estimates based on known JSON structure sizes). HIGH for the caching pattern recommendation (single-key overwrite vs. date-keyed accumulation).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Podcast archive | ElevenLabs quota burned on archive visits (no Blob cache) | Set up Vercel Blob first; use `?check=true` existence probe before play button |
| Podcast archive | Empty archive list because Blob not set up | Blob activation required; archive only shows post-Blob dates |
| Weekly digest | Resend free tier 100/day cap hit at ~100 subscribers | Hard-cap sends at 90; monitor and upgrade Resend at 80 subscribers |
| Weekly digest | Missing unsubscribe link violates UK GDPR / PECR | Add `List-Unsubscribe` header and dedicated unsubscribe endpoint before first send |
| Weekly digest | Duplicate stories across days | De-dupe by firm overlap and topic cap in digest assembly logic |
| Events section | Tavily query budget consumed by daily event searches | Weekly-only refresh (not daily); cache with 7-day TTL |
| Events section | Stale past events displayed as upcoming | Filter by `eventDate >= today` at render time; set 7-day Redis TTL |
| Events section | ICS file rejected by iOS Calendar | Use `ical-generator` npm package; test on real iOS device |
| Primer interview Qs | Generic questions that add no TC prep value | Write questions manually, not AI-generated; test: "only answerable after reading the primer" |
| Firms expansion | Stale salary/deadline data at launch | Verify each new firm against official recruitment page; set `lastVerified` to actual date |
| Firms expansion | US firms without traditional TCs misrepresented | Document as "direct NQ hire" or exclude; do not force-fit into TC schema |
| Firms expansion | Dentons/multi-entity alias matching failures | Include all variant entity names in `aliases[]`; verify against existing briefing data |
| Mobile + header | Stone-50 page vs white sticky header colour mismatch | Use `bg-stone-50/95` for header background, not `bg-white/95` |
| Mobile + header | `backdrop-blur` iOS Safari interaction bug | Test on real iPhone Safari; fallback to solid background if blur fails |
| Mobile + header | Mobile nav dropdowns not receiving touch events | Use `<button>` not `<div>` for all interactive nav elements |

---

## Sources

**Confidence assessment by area:**

| Area | Confidence | Basis |
|------|------------|-------|
| ElevenLabs / Blob / podcast archive | HIGH | Direct code analysis of `podcast-storage.ts`, `char-usage.ts`, `podcast-audio/route.ts`; confirmed Blob not set up in MEMORY.md |
| Resend free tier limits | HIGH | Documented in `digest/route.ts` comment (`// Resend free tier: 100/day`); standard published pricing |
| Tavily budget arithmetic | HIGH | 8 queries/day confirmed in `generate.ts`; 1,000/month free tier is published pricing |
| UK GDPR / PECR unsubscribe requirement | HIGH | Clear legal requirement; current email.ts code lacks the mechanism |
| ICS format requirements | HIGH | RFC 5545 standard; iOS Calendar strictness is well-documented |
| Primer question quality | HIGH | Grounded in existing primer content depth and TC interview knowledge |
| Firms data staleness | HIGH | Direct consequence of time-sensitive salary/deadline data |
| Redis memory | MEDIUM | Estimates based on observed JSON structure; actual file sizes not measured |
| iOS Safari CSS behaviour | MEDIUM | Known patterns; specific version behaviour changes with iOS releases |

**Note:** Web search was unavailable during this research session. All findings are grounded in direct codebase analysis or high-confidence established technical knowledge. No finding has been stated as fact where it relies solely on unverified training data.
