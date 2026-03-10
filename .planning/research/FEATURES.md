# Feature Landscape: Folio v1.1 — Content & Reach

**Domain:** Niche B2C editorial SaaS — UK law student TC preparation tool
**Researched:** 2026-03-10
**Milestone:** v1.1 (adding new features to existing product)
**Confidence note:** Web search tools unavailable. Findings draw on training knowledge of the UK legal careers domain, iCalendar spec (RFC 5545), email digest patterns, and law student TC prep conventions — cross-referenced against the actual Folio codebase. Confidence levels noted per area.

---

## Scope of This Research

Five discrete new feature areas for v1.1. Each is assessed independently:

1. Events section (AI-curated UK legal networking events + .ics export)
2. Weekly email digest (Sunday Resend digest + viral loop)
3. Podcast archive (already built — see note)
4. Primers interview Qs + answer skeletons (already partially built — see note)
5. Firms expansion (US firms with London offices + Silver Circle additions)

---

## Feature 1: Events Section

### What It Is
An AI-curated listing of UK legal networking and professional development events relevant to law students targeting TCs. Free for all users (free tier differentiator vs. competitors). Events sourced via Tavily search at generation time. City filter. .ics calendar download per event.

### Status of Build
Not yet built. No events data model, no API route, no page exists in the codebase.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Event name + organiser | Users can't act on a listing without knowing what it is | Low | Required |
| Date + time | Without this the listing is useless | Low | Required; store as ISO 8601 |
| City/location | Students plan trips; filtering by city is primary behaviour | Low | Required |
| Brief description (2–3 sentences) | Context for whether the event is worth attending | Low | AI-generated |
| Registration/RSVP link | Users need to act from the listing | Low | Required |
| .ics calendar download | Students manage applications via calendar; this is the primary utility action | Medium | See .ics notes below |
| City filter | London, Manchester, Birmingham, Leeds, Bristol, Edinburgh, Online | Low | Tabs or dropdown |
| "Online" as a city | Post-2020, remote events are standard; must be a filterable option | Low | First-class city option |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| TC-relevance signal | Badge or note indicating whether an event is specifically useful for TC applicants (e.g. "firm open day" vs. "general bar event") | Low | Simple categorisation |
| Firm tagging | If a firm runs/sponsors the event, link to their Folio profile page | Medium | Depends on firm matching logic |
| Deadline proximity badge | "Closes in 3 days" style urgency for registration | Low | Client-side date diff |
| Upcoming vs. past filtering | Keep past events visible but visually de-prioritised (like the firm deadline isClosed pattern already in the codebase) | Low | Reuse the isClosed pattern |
| "Add all this week" bulk .ics | Download all upcoming events in one file | Medium | Multiple VEVENTs in one file |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time event crawling | Complex infrastructure, high cost, maintenance burden | Batch AI search on cron; refresh weekly |
| User-submitted events | Moderation overhead for a solo operator | AI-sourced only, with contact link for missing events |
| Event reminders (email/push) | Infrastructure complexity beyond current budget | .ics handles this — user's calendar app sends reminders |
| Paid event listings / sponsorship | Conflicts with editorial credibility; student trust is the product | Keep all listings organic |
| Comments / RSVPs tracked in-app | Social features add complexity with no clear payoff at early stage | External link to organiser's registration page |

### .ics Calendar File — How It Works

**Confidence: HIGH** — RFC 5545 is a stable standard.

An iCalendar file is a plain-text `.ics` file returned with `Content-Type: text/calendar`. The browser downloads it and the OS opens it in the user's calendar app (Google Calendar, Apple Calendar, Outlook).

**Minimum required fields per VEVENT:**

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Folio//folioapp.co.uk//EN
BEGIN:VEVENT
UID:{unique-id}@folioapp.co.uk
DTSTAMP:{now in YYYYMMDDTHHmmssZ format}
DTSTART:{event date in YYYYMMDD or YYYYMMDDTHHmmssZ}
DTEND:{event end date — if unknown, use DTSTART + 1 hour}
SUMMARY:{event name}
DESCRIPTION:{2-3 sentence description}
LOCATION:{city or venue name}
URL:{registration link}
END:VEVENT
END:VCALENDAR
```

**Implementation notes:**
- All-day events use `DTSTART;VALUE=DATE:YYYYMMDD` (no time component)
- UID must be globally unique — use `{slug}-{date}@folioapp.co.uk`
- Return from a Next.js API route: `new Response(icsContent, { headers: { 'Content-Type': 'text/calendar', 'Content-Disposition': 'attachment; filename="event.ics"' } })`
- No npm package needed — generate the string directly (the format is trivial)
- For bulk download (multiple events), concatenate multiple VEVENTs inside one VCALENDAR block

**Implementation approach:**
- API route: `GET /api/events/[id]/calendar` returns single .ics
- API route: `GET /api/events/calendar` with query param `?ids=id1,id2` for bulk
- Data fetched from Redis (same dual-backend pattern as everything else)
- No third-party iCalendar library needed — the spec is simple enough to generate manually

### City Filter Pattern

**Recommended:** Horizontal tab strip matching the existing topic filter tabs pattern (`/topic/[slug]`). Cities as tabs: All / London / Manchester / Birmingham / Leeds / Bristol / Edinburgh / Online.

**Why tabs not dropdown:** The topic filter already uses tabs; consistency matters. Also tabs make the filter states immediately scannable — a law student checking "is there anything in Manchester this week?" can see it at a glance.

**URL state:** `?city=manchester` query param, not a new route (events are filterable, not navigable by city).

### Data Model

```typescript
interface LegalEvent {
  id: string;           // slug, e.g. "linklaters-open-day-2026-04-15"
  title: string;
  organiser: string;    // e.g. "Linklaters", "LawCareers.Net"
  city: string;         // "London" | "Manchester" | "Birmingham" | "Leeds" | "Bristol" | "Edinburgh" | "Online"
  venue?: string;       // specific venue name
  date: string;         // YYYY-MM-DD
  time?: string;        // HH:MM (24h) — optional if all-day
  endDate?: string;     // YYYY-MM-DD (for multi-day events)
  endTime?: string;     // HH:MM
  description: string;  // 2-3 sentences
  registrationUrl: string;
  firmSlug?: string;    // if organiser matches a known firm in FIRMS array
  category: 'firm-open-day' | 'networking' | 'webinar' | 'workshop' | 'skills-session' | 'other';
  tcRelevant: boolean;  // is this specifically useful for TC applicants?
  source: string;       // URL or description of where event was found
  lastRefreshed: string; // YYYY-MM-DD
}
```

### AI Generation Pattern

Tavily queries to run (weekly refresh, fire-and-forget from cron):
1. `UK law student networking events {month} {year}`
2. `Magic Circle open days training contract events {month} {year}`
3. `US law firm London events students {month} {year}`
4. `LawCareers law society events UK {month} {year}`
5. `LGBTQ+ women in law disability law networking events UK {month} {year}`

Claude prompt approach: structured JSON output per event, same pattern as briefing generation. Strip any events without a registration URL. Filter to UK-only. Store in Redis as `events:{YYYY-MM}` sorted set (same pattern as briefing:index).

### Dependency on Existing Features
- Tavily API (already configured, 1,000 searches/month free tier — weekly events refresh uses ~5 queries/week = 20/month, well within limit)
- Redis dual-backend storage (same pattern)
- Firm slug matching (cross-link to existing `/firms/[slug]` pages)
- City filter UI matches existing topic filter tab pattern

---

## Feature 2: Weekly Email Digest

### What It Is
Sunday morning Resend email to all subscribers summarising the week's best content. Viral loop: share link, refer-a-friend with offer.

### Status of Build
**Already substantially built.** `lib/email.ts` has the full `digestHtml()` function and `sendWeeklyDigest()`. `app/api/digest/route.ts` is the cron endpoint. `vercel.json` schedules `GET /api/digest` at `08:00 UTC Sundays`. The digest sends up to 10 stories, sourced from the last 7 days of briefings, to all active Stripe subscribers.

**What's missing / needs improvement:**
- No viral loop / refer-a-friend mechanic (not implemented)
- No subject line personalisation
- No unsubscribe link in the digest email (compliance risk — CAN-SPAM / UK PECR require it)
- No open tracking or click tracking configured

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Weekly summary of top stories | Core email digest value proposition | Low | Already built |
| Clear subject line with date | "Folio Weekly Digest — 3–9 Mar 2026" | Low | Already built |
| Unsubscribe link | Legal requirement under PECR / CAN-SPAM | Low | NOT YET IN CODEBASE — add in next pass |
| Single CTA button | "Read full briefings" | Low | Already built |
| Plain fallback text (text/plain) | Some clients render text-only | Low | Currently only HTML — low priority but good practice |
| Mobile-responsive HTML | 60%+ email opens on mobile | Low | Inline table layout is already mobile-safe |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Refer-a-friend link | Viral loop: each subscriber gets a unique link; if someone signs up via their link, original subscriber gets a free month | High | Requires referral tracking (Redis), Stripe credit logic — significant build |
| "Story of the week" editorial pick | One highlighted story with a brief editorial note on why it matters for TCs | Low | Add an editorially-selected top story; can be the first story in the digest |
| Upcoming deadlines reminder | "These firm deadlines close next week" — pull from firms data | Medium | Cross-reference firms-data.ts deadlines; genuinely useful for the target audience |
| Events preview | "3 events near you this week" — links to events section | Low | Add once events section exists |
| Personalised subject lines | Test variants: "5 stories from a big week in M&A", "This week: Freshfields, a landmark antitrust case, and a new AI rule" | Low | Dynamic subject generation based on story topics |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Daily email digest | Users are already getting daily value from the app; daily emails would feel spammy | Sunday only. Keep email as reminder, not replacement. |
| Heavy imagery / logos | Images often blocked in email clients; increases file size | Text-heavy HTML with colour accents (already the pattern in email.ts) |
| Social share buttons per story | Clutters the email; shares don't work well in email context | One "share the newsletter" CTA at the bottom |
| Gated content in the email | Users need to click through to read — good for driving app visits | Fine to include summaries; full article behind paywall on the site |
| A/B testing infrastructure | Overkill at current subscriber count | Manual subject line iteration |

### Subject Line Patterns That Drive Opens

**Confidence: MEDIUM** — Based on established email marketing principles for niche professional audiences.

Pattern 1 — Topical: `"This week: [firm name]'s [deal/decision], plus [topic]"`
Example: `"This week: Freshfields wins a landmark case, plus rising rates in leveraged finance"`

Pattern 2 — Number-led: `"5 stories every TC applicant should know this week"`

Pattern 3 — Urgency: `"[N] TC deadlines close this week — your Folio digest"`

Pattern 4 — Date-anchored (current, already in use): `"Folio Weekly Digest — 3–9 Mar 2026"`

**Recommendation:** Pattern 3 during application season (Oct–Jan); Pattern 1 rest of year. The existing date-anchored subject is safe but low-engagement. A topical subject tied to the most interesting story of the week will outperform it.

### Viral Loop — Simplified Version

Full refer-a-friend mechanics (custom referral codes, Stripe credit) are HIGH complexity for a solo operator. A simpler pattern that achieves viral reach without the infrastructure:

**Option A — "Forward this email" CTA** (zero complexity)
Add at the bottom: "Know a law student who should read this? Forward it — they can sign up at folioapp.co.uk"

**Option B — Social share CTA** (low complexity)
"Share on LinkedIn" link pre-populated with a short message: "I've been using Folio to prep for TC applications — worth a read: folioapp.co.uk"

**Option C — Referral code** (high complexity)
Generate unique referral codes per user (stored in Redis), append to a referral URL, track signups, credit one month free when referral converts. Requires Stripe credit/coupon management.

**Recommendation for v1.1:** Option A or B only. Option C is a Phase 2 feature once subscriber count justifies the infrastructure overhead.

### Dependency on Existing Features
- Resend API (already wired)
- Stripe subscriber list (already used in digest route)
- `lib/email.ts` / `app/api/digest/route.ts` (already built)
- Events section (for "upcoming events" digest section — optional enhancement)

---

## Feature 3: Podcast Archive

### Status
**Already built and deployed.** `app/podcast/archive/page.tsx` exists with full implementation — month-grouped listing, episode count badge, links to individual episodes, "Today" badge, zinc palette, responsive layout. `lib/podcast-storage.ts` has `listPodcastDates()`.

**What needs research for v1.1:** The archive page is done. The outstanding issue is that `BLOB_READ_WRITE_TOKEN` is not set in Vercel, so audio is not cached — each playback request regenerates the audio and burns ElevenLabs characters. This is an infrastructure issue, not a feature issue.

### Table Stakes (for reference — already met)

| Feature | Why Expected | Status |
|---------|--------------|--------|
| Chronological listing of past episodes | Core archive pattern | Built |
| Date display in human-readable format | "Wednesday, 5 March 2026" | Built |
| Month grouping | Standard podcast/archive UX for scan-ability | Built |
| Episode count badge | At-a-glance sense of library depth | Built |
| Click-through to individual episode | Navigation | Built |
| Today badge | Orient user to current episode | Built |

### What "Good" Podcast Archive UX Looks Like

**Confidence: HIGH** — Stable UX pattern.

The existing implementation matches best practice for a text-first podcast archive:
- Month headers as section breaks (prevents a wall of dates)
- Row-level hover states
- Count badge in header
- Empty state with link to current episode

**One gap:** Individual past episode pages at `/podcast/[date]` may not exist yet. The archive links to `href={isToday ? '/podcast' : '/podcast/${date}'}` — but the `[date]` route needs to exist and route to the correct briefing's audio.

### Dependency on Existing Features
- `app/podcast/[date]/page.tsx` route (check if this exists)
- Vercel Blob setup (for audio caching — resolves ElevenLabs budget burn)

---

## Feature 4: Primers Interview Questions + Answer Skeletons

### Status
**Already partially built.** The `PrimerInterviewQ` interface (`question`, `whatTheyWant`, `skeleton`) exists in `lib/types.ts`. `PrimerView.tsx` renders the Interview Questions section with "What they're assessing" and "Answer skeleton" subsections. The `interviewQs` field on `Primer` is optional — some primers may already have it populated.

**What needs research for v1.1:** The question is whether the primers in `lib/primers-data.ts` currently have `interviewQs` populated, and what content guidelines should govern the questions.

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 3–5 questions per primer | Enough for meaningful practice without overwhelming | Low | UI already supports any number |
| Question type: "walk me through a deal" | Core TC interview question — tests sector knowledge and structured thinking | Low | Must be in every primer |
| Question type: "why does this matter to a client" | Tests commercial reasoning, not just knowledge | Low | Core commercial awareness question type |
| Question type: "what's the biggest current trend in [sector]" | Tests whether student is up to date | Low | Links naturally to Folio's daily briefing |
| Structured answer skeleton | 3–4 sentence skeleton (not bullet points) is standard for interview coaching | Low | Already in UI as plain text field |
| "What they're assessing" label | Context for how to interpret the question | Low | Already in UI |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| A current-events hook in some questions | "What recent deal in M&A would you use to answer this?" — creates a bridge between Folio's daily briefing and the interview prep | Low | Static question with prompt to draw on current news |
| Difficulty levels (foundational / partner-level) | Mirrors the 3-tier talking points structure (soundbite / partnerAnswer / fullCommercial) | Low | Simple label per question |
| "Avoid saying" note | Common mistakes per question — e.g. "Don't cite historical examples only; anchor your answer in 2025/26" | Low | One sentence per question |

### Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| AI-generated questions at runtime | Inconsistency; quality varies; each primer load hits Claude | Static, handcrafted questions written once per primer — same credibility principle as firm profiles |
| STAR framework labels | STAR (Situation, Task, Action, Result) is behavioural interview structure. TC commercial awareness questions are NOT behavioural — they test sector knowledge and reasoning. Applying STAR misleads students. | Use a commercial reasoning skeleton: [Context] → [What the law does / what lawyers do] → [Commercial implication for client] → [Your view / why it matters] |
| More than 5 questions per primer | Diminishing returns; students need to practice depth not breadth | 3 questions is the sweet spot per the existing type comment ("3 interview questions") |
| Separate page/route for interview practice | Primers are already premium; the interview Qs live naturally at the bottom of each primer page | Keep in-page within PrimerView |

### Question Types That Work for TC Commercial Awareness Interviews

**Confidence: HIGH** — UK TC interview question patterns are well-documented in the legal careers domain.

**Type 1: Sector-knowledge test**
"Explain how a leveraged buyout works and what a finance lawyer does on one."
Tests: Can you explain a core transaction structure clearly? Do you know the lawyer's role?
Skeleton structure: [Transaction mechanics] → [Parties involved] → [Lawyer's work] → [Real example or current market context]

**Type 2: Commercial reasoning**
"Why would a company choose to list on the London Stock Exchange rather than the NYSE?"
Tests: Do you think like a commercial adviser, not just a law student?
Skeleton structure: [State the core commercial reason] → [Legal/regulatory context] → [Client-specific factors that might vary the answer]

**Type 3: Current events anchor**
"Tell me about a recent M&A deal that caught your attention and what you found interesting about it."
Tests: Are you reading the market? Can you be specific? Can you connect it to legal themes?
Skeleton structure: [Name the deal, parties, value] → [Why it happened commercially] → [Legal complexity or theme] → [What it tells you about the sector now]

**Type 4: Trends and outlook**
"What do you think is the biggest challenge facing the capital markets practice right now?"
Tests: Macro-commercial awareness, ability to form a view, confidence to express opinion.
Skeleton structure: [Name the challenge directly — don't hedge] → [Why it's happening] → [Impact on clients and the law firm] → [Your view on what advisers should do]

**Type 5: "Why this firm at this practice area"**
"Why are you interested in banking and finance law at [firm]?"
Tests: Motivation, fit, knowledge of the firm's specific practice.
Skeleton structure: [Genuine interest in sector — specific, not generic] → [What draws you to this firm's approach specifically] → [Link to a deal/matter/market event]

### Answer Skeleton Format

**Do NOT use STAR format for commercial awareness questions.** STAR is for behavioural competency questions ("tell me about a time you...").

**Use the Commercial Reasoning Skeleton:**

```
[Context / what is X] — 1 sentence establishing the framework
[Why it matters commercially] — 1 sentence on client or market impact
[The legal angle] — 1 sentence on what lawyers actually do
[Your view or current hook] — 1 sentence anchoring to now
```

This maps to the existing `skeleton` field in `PrimerInterviewQ` as a plain paragraph — no structural changes to the data model needed.

### Dependency on Existing Features
- `lib/primers-data.ts` (add `interviewQs` array to each of the 8 primers)
- `PrimerView.tsx` (already renders the section — no UI changes needed)
- `PrimerInterviewQ` interface (already defined)

---

## Feature 5: Firms Expansion

### Current Coverage (38 firms)

**Magic Circle (5):** A&O Shearman, Clifford Chance, Freshfields, Linklaters, Slaughter and May

**Silver Circle (4):** Herbert Smith Freehills, Ashurst, Travers Smith, Macfarlanes

**International (4):** Hogan Lovells, Norton Rose Fulbright, Bird & Bird, Simmons & Simmons

**US Firms (21):** Latham, Kirkland, Davis Polk, Skadden, Sullivan & Cromwell, Weil Gotshal, Gibson Dunn, Cleary Gottlieb, Fried Frank, Ropes & Gray, Paul Weiss, Proskauer, White & Case, Milbank, Debevoise, Simpson Thacher, Willkie Farr, Sidley Austin, Goodwin, Dechert, Covington & Burling

**Boutique (4):** Quinn Emanuel, Mishcon de Reya, Stewarts, Bristows

### Missing High-Priority Firms

**Confidence: HIGH** — UK legal careers domain knowledge; firms below are consistently cited as sought-after by law students on The Trainee Solicitor Blog, RollOnFriday, Legal Cheek, and university law society career guidance.

#### Silver Circle — Missing Firms

The UK legal directories and training contract rankings consistently identify these as Silver Circle or equivalent for TC purposes:

| Firm | Tier | Priority | Why Students Target It |
|------|------|----------|------------------------|
| Addleshaw Goddard | Silver Circle | High | UK corporate/finance powerhouse; northern England strength (Leeds, Manchester offices); significant TC intake |
| Eversheds Sutherland | Silver Circle | High | Largest UK-origin firm; strong regional presence; ~50 TCs/year London; full-service |
| CMS (formerly CMS Cameron McKenna) | Silver Circle | High | Major international firm; energy and TMT strength; significant UK TC programme |
| Dentons | International | High | World's largest firm by headcount; large London TC programme; often overlooked by students |
| DLA Piper | International | High | One of the largest global firms; strong commercial offering; generous TC intake |
| Pinsent Masons | Silver Circle | High | UK specialist; energy, infrastructure, technology focus; strong in Scotland |
| Taylor Wessing | International | Medium | Technology, IP, life sciences focus; well-regarded in innovation sectors |
| Osborne Clarke | International | Medium | Technology and digital industry specialist; Bristol and London strong |
| Fieldfisher | International | Medium | Technology, privacy and data law strength; growing London practice |
| Shoosmiths | National | Medium | Large UK regional firm; growing TC programme; social mobility reputation |

#### US Firms with London Offices — Missing Firms

The following US firms have active London TC programmes and are consistently sought-after by students targeting the "US Firm London" route:

| Firm | Priority | Notes |
|------|----------|-------|
| Mayer Brown | High | Major US firm; strong finance; London TC programme |
| Morgan Lewis | High | US firm with active London TC; life sciences, financial services |
| Vinson & Elkins | High | Energy law specialism; London TC programme |
| Cravath, Swaine & Moore | High | Elite NY firm; small London office; sought after despite tiny intake |
| Cahill Gordon | Medium | Finance-focused; London office growing |
| Akin Gump Strauss Hauer & Feld | Medium | Energy, restructuring; London office |
| Shearman (now merged into A&O) | N/A | Already covered under A&O Shearman |
| McDermott Will & Emery | Medium | Healthcare, energy; London TC |
| Jones Day | High | One of the largest US firms; London office; significant TC programme; known for no-lockstep culture |
| Baker McKenzie | High | Largest firm globally by revenue; London office; very popular TC destination; genuinely international culture |
| Orrick | Medium | Technology focus; London TC |
| Linklaters is already covered | N/A | Already in current list |

#### Boutique / Specialist — Missing Firms

| Firm | Priority | Specialism |
|------|----------|------------|
| Gateley | Medium | UK corporate; publicly listed law firm |
| Withers | Medium | Private client, family office, high net worth |
| Charles Russell Speechlys | Medium | Private client, family, real estate |
| Harbottle & Lewis | Low | Media, entertainment, sports |
| RPC | Medium | Insurance, media disputes |
| Kemp Little (now Osborne Clarke) | N/A | Merged |
| Winckworth Sherwood | Low | Education, charities |

### Recommended Priority for v1.1

**Build 15–20 firms** rather than 30–50. Quality of data matters more than volume — the `CREDIBILITY RULE` in `firms-data.ts` is correct: no AI-generated runtime data, all figures manually sourced. Adding 30+ firms at once risks data quality issues.

**Tier 1 additions (highest student demand, do first):**
1. Baker McKenzie — consistently in the top 5 most popular TC applications nationwide
2. Jones Day — popular for its unique culture model (no lockstep, no billing targets)
3. Mayer Brown — strong London finance practice
4. DLA Piper — enormous intake, major employer
5. Eversheds Sutherland — major UK firm, often overlooked in research
6. CMS — major UK/international presence
7. Addleshaw Goddard — UK corporate powerhouse
8. Pinsent Masons — energy, infrastructure specialism

**Tier 2 additions (good coverage, do second):**
9. Dentons — world's largest firm; notable for sheer intake size
10. Taylor Wessing — technology sector students target this
11. Vinson & Elkins — energy law specialism unique to the list
12. Morgan Lewis — life sciences, financial services
13. Osborne Clarke — technology focus
14. RPC — insurance disputes, often underrepresented

**Defer (lower demand or overlap):**
- Cravath — tiny London TC intake (1-2/year); more effort than value
- Cahill Gordon, Orrick — small London TC programmes
- Boutique/specialist firms — niche audience; add incrementally

### Data Fields That Matter Most Per Firm

**Confidence: HIGH** — Derived from the existing FirmProfile interface which is already well-designed.

All existing fields are correct and valuable. The fields most scrutinised by students when comparing firms:

1. `nqSalaryNote` — NQ salary is a primary decision factor for US firm choice. Must be accurate.
2. `deadlines` — Application deadlines with `openDate` + `closeDate`. The `isClosed` rendering logic already exists.
3. `intakeSizeNote` — Signals competitiveness. Students targeting larger intake firms vs. smaller ones need this.
4. `knownFor` — 2-sentence summary must be genuinely differentiating, not generic marketing copy.
5. `interviewFocus` — Highly valued for interview prep; must be specific to the firm, not generic commercial awareness advice.
6. `forageUrl` — Many US firms now have Forage virtual experience programmes; include where available.
7. `practiceAreas` — Drives the "firm fit" feature in the existing app.

**Fields to be careful about:**
- `tcSalaryNote` and `nqSalaryNote` — US firms in London typically pay US-scale salaries. As of 2026, NQ at top US London offices is in the £180k–£200k+ range. Must be verified per firm as these move frequently.
- `offices` — List only offices relevant to a London TC candidate's experience, not the firm's global network for its own sake.

### Dependency on Existing Features
- `lib/firms-data.ts` — append new entries to `FIRMS` array
- `lib/types.ts` — no schema changes needed; `FirmProfile` interface already covers all required fields
- `lib/firm-assessments-data.ts` — add assessment data per firm where known
- `app/firms/[slug]/page.tsx` — no changes needed; dynamic route handles any slug
- The `isClosed` deadline logic already handles past deadlines correctly

---

## Feature Dependencies Summary

```
Events section → Tavily API (existing), Redis (existing), Firm matching (existing)
Weekly digest → Already built; needs unsubscribe link + subject line improvements
Podcast archive → Already built; needs /podcast/[date] route verification + Vercel Blob setup
Primers interview Qs → Data additions to primers-data.ts only; UI already built
Firms expansion → Data additions to firms-data.ts only; schema unchanged
```

---

## MVP Recommendation per Feature

| Feature | MVP Scope | Defer |
|---------|-----------|-------|
| Events section | London + Online city filter; 15–20 events; .ics per event; AI weekly refresh | Bulk .ics, firm tagging, events digest section |
| Weekly digest | Add unsubscribe link; improve subject lines | Referral codes, personalisation, events preview |
| Podcast archive | Already complete — verify /podcast/[date] route exists | Vercel Blob setup (separate infrastructure task) |
| Primers interview Qs | 3 questions per primer across all 8 primers | Difficulty levels, "avoid saying" notes |
| Firms expansion | 8 Tier 1 firms with full data | Tier 2 firms, boutique additions |

---

## Sources

- Codebase files read: `lib/firms-data.ts`, `lib/types.ts`, `lib/primers-data.ts`, `lib/email.ts`, `lib/podcast-storage.ts`, `app/podcast/archive/page.tsx`, `app/api/digest/route.ts`, `components/PrimerView.tsx`, `.planning/PROJECT.md`
- iCalendar spec: RFC 5545 (training knowledge, HIGH confidence)
- UK TC interview question patterns: UK legal careers domain knowledge (HIGH confidence)
- Firm coverage gaps: UK TC application domain knowledge, cross-referenced against firms-data.ts current entries (HIGH confidence)
- Email digest patterns: Email marketing domain knowledge for niche professional audiences (MEDIUM confidence)
- Events UX patterns: Standard web UX patterns + UK legal careers context (MEDIUM confidence)
