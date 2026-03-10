# Roadmap: Folio

## Milestones

- [x] **v1.0 Market-Ready Design Lift** - Phases 1-6 (shipped 2026-03-10)
- [ ] **v1.1 Content & Reach** - Phases 7-12 (in progress)

## Phases

<details>
<summary>v1.0 Market-Ready Design Lift (Phases 1-6) — SHIPPED 2026-03-10</summary>

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Design Tokens** - Establish the semantic token foundation (type scale, radius, CSS variables) that all subsequent phases depend on (completed 2026-03-09)
- [x] **Phase 2: Shell** - Apply tokens to Header and implement the missing site footer — structures that appear on every page (completed 2026-03-09)
- [x] **Phase 3: Content Surfaces** - Polish StoryCard, ArticleStory, and BriefingView — the most-visited components in the product (completed 2026-03-09)
- [x] **Phase 4: Conversion Surfaces** - Align the upgrade page and landing hero to the product's design register and rewrite copy to outcome framing (completed 2026-03-09)
- [x] **Phase 5: Utility Pages + Analytics** - Apply established token patterns to Archive, Firms, Quiz, Tests, and Primers; install Vercel Analytics (completed 2026-03-10)
- [x] **Phase 6: Bug Fixes + Content Quality** - Fix production bugs found in live audit; improve talking points and quiz question quality (completed 2026-03-10)

### Phase 1: Design Tokens
**Goal**: The design token contract exists — all downstream components can consume named tokens instead of arbitrary values
**Depends on**: Nothing (first phase)
**Requirements**: TOKENS-01, TOKENS-02, TOKENS-03
**Success Criteria** (what must be TRUE):
  1. `tailwind.config.ts` contains a named `fontSize` type scale (semantic slots: display, heading, subheading, body, caption, label) — no arbitrary `text-[Npx]` values are needed
  2. `tailwind.config.ts` contains named `borderRadius` tokens (card, chrome, pill, input) — the five inconsistent values currently in use are replaced by a single source of truth
  3. `globals.css` contains a CSS custom property layer with `--paper`, semantic radius vars, and documented stone-vs-zinc palette rule — light and dark mode both covered
  4. shadcn `--radius` variable is reduced to `0.25rem`, removing the generic "SaaS app" rounding from all shadcn primitives globally
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Add CSS vars (--paper, --radius-*), fontSize scale, borderRadius tokens, and .section-label component class

### Phase 2: Shell
**Goal**: Every page in Folio shares a consistent, token-compliant header and a functioning footer
**Depends on**: Phase 1
**Requirements**: SHELL-01, SHELL-02
**Success Criteria** (what must be TRUE):
  1. The header renders using design tokens for typography and spacing — the existing thick top rule and mono label pattern are preserved, not replaced
  2. A site footer appears on every page with working links: feedback, terms/privacy, contact/LinkedIn
  3. The footer never overlaps page content — the `flex flex-col min-h-screen` + `flex-1` layout pattern is in place and verified at mobile viewport (375px)
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Migrate Header.tsx and NavDropdowns.tsx to design tokens (text-display, text-label, bg-paper)
- [x] 02-02-PLAN.md — Complete SiteFooter.tsx with five links and fix sticky-footer layout in app/layout.tsx

### Phase 3: Content Surfaces
**Goal**: The 8 story cards, full article view, and briefing grid feel premium and typographically consistent — the editorial register is real, not aspirational
**Depends on**: Phase 2
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):
  1. StoryCard renders headlines, excerpts, and metadata using named type scale tokens — no arbitrary pixel sizes remain in the component
  2. ArticleStory renders body copy, section headings, and talking points with a consistent typographic hierarchy — a reader can visually distinguish heading levels without inspecting CSS
  3. BriefingView (homepage 8-story grid) lays out correctly at 375px viewport — no card overflow, no topic tabs wrapping to two lines on mobile
  4. Every interactive element in content surfaces uses semantic hover states (border colour shift for cards, background shift for buttons, underline for links) — the `hover:opacity-80` pattern is gone
  5. Typography (font size, line height, letter spacing) is consistent across all three content surfaces — no mixed leading or arbitrary sizes remain
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Add text-article token to tailwind.config.ts and migrate StoryCard.tsx to design tokens with border hover state
- [x] 03-02-PLAN.md — Migrate ArticleStory.tsx to design tokens (uses text-article token from 03-01)
- [x] 03-03-PLAN.md — Migrate BriefingView.tsx labels to tokens, fix hover:opacity in BriefingView, StoryGrid, and Header logo

### Phase 4: Conversion Surfaces
**Goal**: A prospective subscriber who visits the upgrade page sees a product that matches the editorial register they just experienced, reads why it matters to their TC application, and trusts the person behind it
**Depends on**: Phase 3
**Requirements**: CONV-01, CONV-02, CONV-03, CONV-04
**Success Criteria** (what must be TRUE):
  1. The upgrade page uses the stone palette throughout — it reads as the same product as the briefing pages, not a separate SaaS marketing page
  2. Every premium feature description on the upgrade page is outcome-framed ("walk into interviews knowing the market") not capability-framed ("get access to the quiz")
  3. Social proof placeholder slots are visible on the upgrade page — wired to show real student count and testimonials when data exists, clearly marked as placeholders until then
  4. The LandingHero CTA button has the correct border radius from the token system — the `rounded-xl` inconsistency is resolved
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Migrate upgrade/page.tsx: zinc→stone palette, design tokens, outcome copy, social proof block, SiteFooter
- [x] 04-02-PLAN.md — Migrate LandingHero.tsx: rounded-chrome, text tokens, hover:bg fix
- [x] 04-03-PLAN.md — Visual and functional verification checkpoint (upgrade page + LandingHero + Stripe smoke test)

### Phase 5: Utility Pages + Analytics
**Goal**: Every page in Folio speaks the same visual language as the core product, and the conversion funnel is observable
**Depends on**: Phase 4
**Requirements**: UTIL-01, UTIL-02, UTIL-03, UTIL-04, UTIL-05, ANLYT-01, ANLYT-02
**Success Criteria** (what must be TRUE):
  1. Archive, Firms, Quiz, Tests, and Primers pages all use the stone/zinc palette rule consistently — no utility page reads as a different product
  2. Heading patterns are uniform across all utility pages — the same icon + bold title + count badge pattern from design principles is applied everywhere
  3. Vercel Analytics is active on production and recording page views — the dashboard shows traffic data
  4. Conversion funnel events fire correctly: free sign-up, upgrade page view, checkout click, and subscription activation are all tracked and visible in Vercel Analytics
**Plans**: 4 plans

Plans:
- [x] 05-01-PLAN.md — Migrate Archive and Quiz pages to stone tokens (UTIL-01, UTIL-03)
- [x] 05-02-PLAN.md — Migrate Firms, Tests, and Primers pages to stone tokens (UTIL-02, UTIL-04, UTIL-05)
- [x] 05-03-PLAN.md — Install @vercel/analytics and add four conversion funnel events (ANLYT-01, ANLYT-02)
- [x] 05-04-PLAN.md — Production deploy and visual + analytics verification checkpoint

### Phase 6: Bug Fixes + Content Quality
**Goal**: Fix all production bugs identified in live audit and lift content quality so the product delivers on its core promise
**Depends on**: Phase 5
**Requirements**: BUG-01, BUG-02, BUG-03, QUAL-01, QUAL-02
**Success Criteria** (what must be TRUE):
  1. Double footer on /upgrade is gone
  2. Expired application deadlines on firm profiles show a "Closed" state — no live "Apply" button for past windows
  3. Quiz generation is reliable — cached quiz data exists for recent dates, date links in /quiz lead to actual questions
  4. Talking points in articles are sharp, specific, and genuinely usable in an interview — not generic AI summaries
  5. Quiz questions test commercial reasoning and inference, not just deal price recall
**Plans**: 4 plans

Plans:
- [x] 06-01-PLAN.md — Remove double SiteFooter from upgrade page; add CLOSED badge for expired firm deadlines (BUG-01, BUG-02)
- [x] 06-02-PLAN.md — Fix quiz caching: add quiz:index to storage.ts, remove ?? 18 fallback (BUG-03)
- [x] 06-03-PLAN.md — Strengthen talking points prompt in generate.ts and rewrite quiz question rules in quiz.ts (QUAL-01, QUAL-02)
- [x] 06-04-PLAN.md — Production verification checkpoint (all 5 requirements)

</details>

---

### v1.1 Content & Reach (In Progress)

**Milestone Goal:** Expand content depth (more firms, events, primer interview prep), fix the mobile experience, and add engagement/retention features (digest, podcast archive) — positioning Folio for a marketing push to law societies and LinkedIn.

- [x] **Phase 7: Mobile + Header Polish** - Fix header scroll background, mobile navigation, and story card layout at 375px (completed 2026-03-10)
- [x] **Phase 8: Firms Expansion** - Add 8 new firm profiles (Baker McKenzie, Jones Day, Mayer Brown, DLA Piper, Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons) with manually verified TC data (completed 2026-03-10)
- [ ] **Phase 9: Podcast Archive** - Configure Vercel Blob storage and activate the podcast archive listing page
- [ ] **Phase 10: Primer Interview Questions** - Add 3-5 manually authored interview questions with Commercial Reasoning answer skeletons to each of the 8 sector primers
- [ ] **Phase 11: Events Section** - Build the AI-curated UK legal events section with city filter and .ics calendar export
- [ ] **Phase 12: Digest Compliance + Improvements** - Validate the weekly digest fires in production, add GDPR-compliant unsubscribe, and improve subject lines

## Phase Details

### Phase 7: Mobile + Header Polish
**Goal**: Folio is fully usable on a 375px iPhone — the header does not bleed content on scroll, navigation is touch-friendly, and story cards lay out without overflow
**Depends on**: Nothing (first v1.1 phase; v1.0 complete)
**Requirements**: MOBILE-01, MOBILE-02, MOBILE-03
**Success Criteria** (what must be TRUE):
  1. Scrolling past page content on any route does not bleed the page through the header — the header has a persistent opaque background when scrolled
  2. The mobile navigation dropdown is usable at 375px — tap targets meet minimum size, menus open and close correctly on touch without requiring a second tap
  3. Story cards on the homepage grid lay out without overflow or broken layout at 375px viewport — headline text is readable, topic badges do not clip
**Plans**: 3 plans

Plans:
- [ ] 07-01-PLAN.md — Fix --paper CSS variable (remove hsl wrapper from globals.css) so bg-paper is opaque (MOBILE-01)
- [ ] 07-02-PLAN.md — Add hamburger button + mobile drawer to Header.tsx; fix pointerdown outside-click in NavDropdowns.tsx (MOBILE-02)
- [ ] 07-03-PLAN.md — Add min-w-0 to StoryCard outer div and StoryGrid story wrapper div (MOBILE-03)

### Phase 8: Firms Expansion
**Goal**: Folio covers the UK TC landscape that students actually target — all 8 priority US and Silver Circle firms have accurate, manually verified profiles
**Depends on**: Nothing (independent data work)
**Requirements**: FIRMS-01, FIRMS-02
**Success Criteria** (what must be TRUE):
  1. At least 8 new firm profiles are live in `lib/firms-data.ts` — total firm count increases from 38 to 46+
  2. All 8 priority firms are present: Baker McKenzie, Jones Day, Mayer Brown, DLA Piper, Eversheds Sutherland, CMS, Addleshaw Goddard, and Pinsent Masons
  3. Each new profile includes NQ salary, TC salary, intake seats, and application deadline data that has been manually verified against the firm's official recruitment page or The Trackr — no placeholder or unverified figures
  4. New firm profiles appear on the /firms listing page and their /firms/[slug] detail pages render correctly with existing UI (no layout breaks)
**Plans**: 1 plan

Plans:
- [x] 08-01-PLAN.md — Add 8 new FirmProfile objects to lib/firms-data.ts; new National tier for Eversheds/CMS/Addleshaw/Pinsent Masons; US Firms: Baker McKenzie, Jones Day, Mayer Brown, DLA Piper (FIRMS-01, FIRMS-02)

### Phase 9: Podcast Archive
**Goal**: Podcast episodes are cached in Vercel Blob (stopping ElevenLabs character burn on every play) and subscribers can browse and play past episodes from a dedicated archive page
**Depends on**: Nothing (infrastructure prerequisite is internal to this phase)
**Requirements**: INFRA-01, PODCAST-01
**Success Criteria** (what must be TRUE):
  1. `BLOB_READ_WRITE_TOKEN` is set in Vercel production environment — the `/api/podcast-audio` route confirms Blob backend is active, not the filesystem fallback
  2. Audio generated after Blob activation is stored as a cached MP3 — subsequent requests for the same episode serve the cached file without calling ElevenLabs
  3. `/podcast/archive` lists past audio briefings grouped by date — each entry shows the date and a play button
  4. The play button on past archive entries only appears for dates where a cached MP3 exists — no play button is shown for dates with no audio
**Plans**: 3 plans

Plans:
- [ ] 09-01-PLAN.md — Add backfillQuizIndex() to lib/storage.ts + admin POST route to populate quiz:index for pre-Phase-6 quizzes (INFRA-01)
- [ ] 09-02-PLAN.md — Add listPodcastDatesWithStatus() to lib/podcast-storage.ts; update /podcast/archive to show all episodes with conditional play button (PODCAST-01, INFRA-01)
- [ ] 09-03-PLAN.md — Extract shared ElevenLabs helper to lib/podcast-audio.ts; wire fire-and-forget MP3 pre-generation into the 06:00 UTC cron (INFRA-01)

### Phase 10: Primer Interview Questions
**Goal**: Each sector primer contains 3-5 manually written interview questions with structured answer skeletons — giving subscribers a concrete edge in TC interviews, not generic questions they could find on any website
**Depends on**: Nothing (independent static data work)
**Requirements**: PRIMER-01, PRIMER-02
**Success Criteria** (what must be TRUE):
  1. All 8 sector primers (M&A, Capital Markets, Banking & Finance, Energy & Tech, Regulation, Disputes, International, AI & Law) have 3-5 interview questions visible on their primer pages
  2. Each question is primer-specific — it can only be answered by someone who has read that primer's content, not by someone who Googled "TC interview questions"
  3. Each question has a structured answer skeleton using the Commercial Reasoning format: Context, Commercial implication, Legal angle, Current hook/your view — the skeleton gives structure, not a pre-written answer
**Plans**: TBD

### Phase 11: Events Section
**Goal**: Law students can discover upcoming UK legal networking events from a free, AI-curated page with city filtering and one-tap calendar export — no subscription required
**Depends on**: Nothing (independent net-new feature; digest integration is optional enhancement)
**Requirements**: EVT-01, EVT-02, EVT-03, EVT-04
**Success Criteria** (what must be TRUE):
  1. `/events` is accessible without a subscription — any visitor (signed in or not) can view the events listing
  2. The events list shows only future events — past events are filtered out at render time regardless of Redis cache state
  3. City filter tabs (All, London, Manchester, Edinburgh, Bristol) filter the listing — selecting a city shows only events in that location, with the tab derived from available events data rather than hardcoded
  4. Each event has a working `.ics` download button — tapping it produces a valid iCalendar file that imports correctly into iOS Calendar with the right date, time, and Europe/London timezone
  5. The events list updates weekly — a Monday 07:00 UTC cron refreshes the Redis `events:current` cache via Tavily search + Claude synthesis, and the page shows a "last updated" timestamp
**Plans**: TBD

### Phase 12: Digest Compliance + Improvements
**Goal**: The weekly Sunday digest is GDPR/PECR compliant, confirmed firing in production, and compelling enough that subscribers open it and share it — building the referral loop that grows Folio organically
**Depends on**: Phase 11 (events integration in digest is optional but digest ships after events exist)
**Requirements**: DIGEST-01, DIGEST-02, DIGEST-03
**Success Criteria** (what must be TRUE):
  1. A digest email is received by a subscriber on Sunday at approximately 08:00 UTC — confirmed by checking a real subscriber inbox, not just verifying cron config
  2. Every digest email contains a working unsubscribe link — clicking it hits `/api/unsubscribe`, records the opt-out in Redis (`email-opt-out:{userId}`), and the subscriber receives no further digest emails
  3. Digest emails include a `List-Unsubscribe` header — email clients show an unsubscribe option in their UI without the user needing to find the footer link
  4. The digest subject line references the top story topic rather than a generic date format — it reads like editorial, not automation
**Plans**: TBD

## Progress

**Execution Order:**
v1.0 phases (1-6) complete. v1.1 phases execute in numeric order: 7 → 8 → 9 → 10 → 11 → 12

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Design Tokens | v1.0 | 1/1 | Complete | 2026-03-09 |
| 2. Shell | v1.0 | 2/2 | Complete | 2026-03-09 |
| 3. Content Surfaces | v1.0 | 3/3 | Complete | 2026-03-09 |
| 4. Conversion Surfaces | v1.0 | 3/3 | Complete | 2026-03-09 |
| 5. Utility Pages + Analytics | v1.0 | 4/4 | Complete | 2026-03-10 |
| 6. Bug Fixes + Content Quality | v1.0 | 4/4 | Complete | 2026-03-10 |
| 7. Mobile + Header Polish | 3/3 | Complete   | 2026-03-10 | - |
| 8. Firms Expansion | 1/1 | Complete    | 2026-03-10 | - |
| 9. Podcast Archive | 1/3 | In Progress|  | - |
| 10. Primer Interview Questions | v1.1 | 0/? | Not started | - |
| 11. Events Section | v1.1 | 0/? | Not started | - |
| 12. Digest Compliance + Improvements | v1.1 | 0/? | Not started | - |
