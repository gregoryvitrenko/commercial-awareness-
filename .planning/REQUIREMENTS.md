# Requirements: Folio — Market-Ready Milestone

**Defined:** 2026-03-09
**Core Value:** Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.

## v1 Requirements

### Design Tokens

- [x] **TOKENS-01**: Semantic type scale defined in `tailwind.config.ts` (named slots: display, heading, subheading, body, caption, label — no arbitrary `text-[Npx]` values)
- [x] **TOKENS-02**: Border radius token system established (single source of truth; resolves the 5 inconsistent values currently in use)
- [x] **TOKENS-03**: CSS custom property token layer added to `globals.css` for design values that require runtime theming (light/dark)

### Shell

- [x] **SHELL-01**: Header updated to use design tokens (typography, spacing) — preserve existing thick top rule and mono label pattern
- [x] **SHELL-02**: Site footer implemented with links (feedback, terms/privacy, contact/LinkedIn) and consistent with design tokens

### Content Surfaces

- [x] **CONT-01**: `StoryCard` component polished with design tokens (type scale, radius, spacing)
- [x] **CONT-02**: Article view (`ArticleStory`) polished with design tokens — typography hierarchy consistent
- [x] **CONT-03**: `BriefingView` (homepage grid) polished with design tokens
- [x] **CONT-04**: `hover:opacity-80` pattern replaced with semantic hover states across all interactive components (border colour shift for cards, background shift for buttons, underline for links)
- [x] **CONT-05**: Typography hierarchy consistent across all content surfaces (no mixed line-heights or arbitrary sizes)

### Conversion Surfaces

- [x] **CONV-01**: Upgrade page palette aligned from `zinc-*` to `stone-*` to match the rest of the product
- [x] **CONV-02**: Upgrade page copy rewritten — outcome-framed ("walk into interviews knowing the market") not capability-framed ("get access to the quiz")
- [x] **CONV-03**: Social proof slots added to upgrade page (placeholders for student count + testimonials, wired up when real data exists)
- [x] **CONV-04**: `LandingHero` CTA border radius corrected to match the token system (currently `rounded-xl`, inconsistent with rest of app)

### Utility Pages

- [x] **UTIL-01**: Archive page (`/archive`) applies design token system consistently
- [x] **UTIL-02**: Firms page (`/firms`) applies design token system consistently
- [x] **UTIL-03**: Quiz page (`/quiz`) applies design token system consistently
- [x] **UTIL-04**: Tests page (`/tests`) applies design token system consistently
- [x] **UTIL-05**: Primers page (`/primers`) applies design token system consistently

### Analytics

- [x] **ANLYT-01**: Vercel Analytics installed and active on production
- [x] **ANLYT-02**: Conversion funnel events tracked: free sign-up, upgrade page view, checkout click, subscription activation

## v2 Requirements

### Branding

- **BRAND-01**: Logo/wordmark — Folio wordmark in Playfair Display or commissioned designer mark
- **BRAND-02**: Social proof copy live with real data (student count, testimonials from peer network)

### Conversion

- **CRO-01**: Conversion feature — TBD after Vercel Analytics baseline exists (min. 50 observable free users in funnel)
- **CRO-02**: Referral or viral mechanic — TBD after acquisition channel is proven

### Content

- **CONT-06**: Primers: sample interview Qs + answer skeletons per sector primer
- **CONT-07**: Firm interview packs: PDF export

### Infrastructure

- **INFRA-01**: Vercel Blob audio caching — stop burning ElevenLabs chars on every request
- **INFRA-02**: Podcast archive (`/podcast/archive`) listing page

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-voice audio | Multiplies ElevenLabs spend against 100k/month cap |
| Native mobile app | Web-first; no revenue to justify native yet |
| Real-time features | Complexity vs. value unproven |
| Custom Clerk production instance | Requires domain transfer off Cloudflare; dev keys work |
| Weekly email digest | Backlog, not this milestone |
| Dark patterns / fabricated social proof | Credibility-sensitive audience (law students) — kills trust |

## Traceability

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

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after initial definition*
