# Requirements: Folio

**Core Value:** Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.

---

## v1.1 Requirements (Current)

**Defined:** 2026-03-10

### Infrastructure

- [x] **INFRA-01**: Vercel Blob storage configured — `BLOB_READ_WRITE_TOKEN` set in production (prerequisite for podcast archive activation and audio caching)

### Mobile & Header

- [x] **MOBILE-01**: Header has a persistent opaque background on scroll — no content bleed-through when scrolling past page content
- [x] **MOBILE-02**: Mobile navigation is touch-usable at 375px viewport — correct tap targets, dropdown menus function on touch
- [x] **MOBILE-03**: Story cards lay out correctly on 375px viewport — no overflow, readable text, no broken layout

### Firms Expansion

- [x] **FIRMS-01**: 8+ new firms added to `lib/firms-data.ts` with manually verified data (NQ salary, TC salary, intake seats, application deadlines)
- [x] **FIRMS-02**: New firms coverage prioritises: Baker McKenzie, Jones Day, Mayer Brown, DLA Piper, Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons

### Primer Interview Questions

- [x] **PRIMER-01**: Each of the 8 sector primers has 3–5 practice interview questions (manually authored, grounded in primer-specific content — not generic TC questions)
- [x] **PRIMER-02**: Each question has a structured answer skeleton using the Commercial Reasoning format (Context → Commercial implication → Legal angle → Current hook/your view)

### Podcast Archive

- [ ] **PODCAST-01**: `/podcast/archive` lists all past audio briefings with date, play button, and design-token-consistent styling (depends on INFRA-01)

### Weekly Email Digest

- [ ] **DIGEST-01**: Sunday 08:00 UTC digest email sent to subscribers via existing Resend cron — activated and verified working
- [ ] **DIGEST-02**: Digest emails include `List-Unsubscribe` header and a working unsubscribe endpoint (UK PECR/GDPR compliance)
- [ ] **DIGEST-03**: Digest subject lines and content improved for open rates; viral/referral CTA included

### Events Section

- [ ] **EVT-01**: `/events` page lists upcoming UK legal networking and professional events (free tier, no paywall)
- [x] **EVT-02**: Events AI-curated weekly via Tavily search + Claude synthesis and cached in Redis — stale/past events filtered out automatically
- [ ] **EVT-03**: City filter tabs on events page (All, London, Manchester, Edinburgh, Bristol)
- [x] **EVT-04**: Each event has a `.ics` download button for calendar export (RFC 5545, generated as TypeScript template string — no npm package)

---

## v1.0 Requirements (Complete — 2026-03-10)

### Design Tokens

- [x] **TOKENS-01**: Semantic type scale defined in `tailwind.config.ts` (named slots: display, heading, subheading, body, caption, label — no arbitrary `text-[Npx]` values)
- [x] **TOKENS-02**: Border radius token system established (single source of truth; resolves the 5 inconsistent values previously in use)
- [x] **TOKENS-03**: CSS custom property token layer added to `globals.css` for design values that require runtime theming (light/dark)

### Shell

- [x] **SHELL-01**: Header updated to use design tokens (typography, spacing) — preserve existing thick top rule and mono label pattern
- [x] **SHELL-02**: Site footer implemented with links (feedback, terms/privacy, contact/LinkedIn) and consistent with design tokens

### Content Surfaces

- [x] **CONT-01**: `StoryCard` component polished with design tokens (type scale, radius, spacing)
- [x] **CONT-02**: Article view (`ArticleStory`) polished with design tokens — typography hierarchy consistent
- [x] **CONT-03**: `BriefingView` (homepage grid) polished with design tokens
- [x] **CONT-04**: `hover:opacity-80` pattern replaced with semantic hover states across all interactive components
- [x] **CONT-05**: Typography hierarchy consistent across all content surfaces

### Conversion Surfaces

- [x] **CONV-01**: Upgrade page palette aligned from `zinc-*` to `stone-*`
- [x] **CONV-02**: Upgrade page copy rewritten — outcome-framed
- [x] **CONV-03**: Social proof slots added to upgrade page (placeholders)
- [x] **CONV-04**: `LandingHero` CTA border radius corrected to token system

### Utility Pages

- [x] **UTIL-01**: Archive page applies design token system consistently
- [x] **UTIL-02**: Firms page applies design token system consistently
- [x] **UTIL-03**: Quiz page applies design token system consistently
- [x] **UTIL-04**: Tests page applies design token system consistently
- [x] **UTIL-05**: Primers page applies design token system consistently

### Analytics

- [x] **ANLYT-01**: Vercel Analytics installed and active on production
- [x] **ANLYT-02**: Conversion funnel events tracked: free sign-up, upgrade page view, checkout click, subscription activation

### Bug Fixes & Content Quality

- [x] **BUG-01**: Double footer on `/upgrade` removed
- [x] **BUG-02**: Expired firm deadlines show CLOSED badge, greyed row, strikethrough date, no Apply button
- [x] **BUG-03**: Quiz Available list reads `quiz:index`; question count badge reflects real cached data
- [x] **QUAL-01**: `talkingPoints` prompt strengthened with BAD/GOOD contrast examples and filler-phrase ban
- [x] **QUAL-02**: Quiz Q1 rewritten as Commercial Inference; Q2/Q3 updated; distractor guidance names real firms/regulators

---

## Future Requirements

### Branding

- **BRAND-01**: Logo/wordmark — Folio wordmark in Playfair Display or commissioned designer mark
- **BRAND-02**: Social proof copy live with real data (student count, testimonials from peer network)

### Conversion

- **CRO-01**: Conversion feature — TBD after Vercel Analytics baseline exists (min. 50 observable free users in funnel)

### Content

- **CONT-06**: Firm interview packs: PDF export

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-voice audio | Multiplies ElevenLabs spend against 100k/month cap |
| Native mobile app | Web-first; no revenue to justify native yet |
| Real-time features | Complexity vs. value unproven |
| Custom Clerk production instance | Requires domain transfer off Cloudflare; dev keys work |
| Dark patterns / fabricated social proof | Credibility-sensitive audience (law students) — kills trust |
| AI-generated primer interview questions | Generic questions have no edge over free resources; must be manually authored |

---

## Traceability

### v1.1 Requirements

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOBILE-01 | Phase 7 | Complete |
| MOBILE-02 | Phase 7 | Complete |
| MOBILE-03 | Phase 7 | Complete |
| FIRMS-01 | Phase 8 | Complete |
| FIRMS-02 | Phase 8 | Complete |
| INFRA-01 | Phase 9 | Complete |
| PODCAST-01 | Phase 9 | Pending |
| PRIMER-01 | Phase 10 | Complete |
| PRIMER-02 | Phase 10 | Complete |
| EVT-01 | Phase 11 | Pending |
| EVT-02 | Phase 11 | Complete |
| EVT-03 | Phase 11 | Pending |
| EVT-04 | Phase 11 | Complete |
| DIGEST-01 | Phase 12 | Pending |
| DIGEST-02 | Phase 12 | Pending |
| DIGEST-03 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

### v1.0 Requirements

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOKENS-01 | Phase 1 | Complete |
| TOKENS-02 | Phase 1 | Complete |
| TOKENS-03 | Phase 1 | Complete |
| SHELL-01 | Phase 2 | Complete |
| SHELL-02 | Phase 2 | Complete |
| CONT-01 | Phase 3 | Complete |
| CONT-02 | Phase 3 | Complete |
| CONT-03 | Phase 3 | Complete |
| CONT-04 | Phase 3 | Complete |
| CONT-05 | Phase 3 | Complete |
| CONV-01 | Phase 4 | Complete |
| CONV-02 | Phase 4 | Complete |
| CONV-03 | Phase 4 | Complete |
| CONV-04 | Phase 4 | Complete |
| UTIL-01 | Phase 5 | Complete |
| UTIL-02 | Phase 5 | Complete |
| UTIL-03 | Phase 5 | Complete |
| UTIL-04 | Phase 5 | Complete |
| UTIL-05 | Phase 5 | Complete |
| ANLYT-01 | Phase 5 | Complete |
| ANLYT-02 | Phase 5 | Complete |
| BUG-01 | Phase 6 | Complete |
| BUG-02 | Phase 6 | Complete |
| BUG-03 | Phase 6 | Complete |
| QUAL-01 | Phase 6 | Complete |
| QUAL-02 | Phase 6 | Complete |

---
*Requirements defined: 2026-03-09 (v1.0), 2026-03-10 (v1.1)*
*Last updated: 2026-03-10 after v1.1 roadmap created*
