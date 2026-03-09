# Roadmap: Folio — Market-Ready Design Lift

## Overview

This milestone transforms Folio from a working product into a premium editorial product ready for serious marketing. The work flows strictly bottom-up: establish the design token foundation first, apply it to the shell that every page inherits, then polish the highest-visibility content surfaces, then align the conversion funnel to match, and finally bring the utility pages into line. Skipping this order means making every design decision twice. The milestone ends when Folio looks and feels as credible as the problem it solves — giving law students the confidence to subscribe and the product the credibility to grow through peer networks.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Design Tokens** - Establish the semantic token foundation (type scale, radius, CSS variables) that all subsequent phases depend on (completed 2026-03-09)
- [x] **Phase 2: Shell** - Apply tokens to Header and implement the missing site footer — structures that appear on every page (completed 2026-03-09)
- [x] **Phase 3: Content Surfaces** - Polish StoryCard, ArticleStory, and BriefingView — the most-visited components in the product (completed 2026-03-09)
- [ ] **Phase 4: Conversion Surfaces** - Align the upgrade page and landing hero to the product's design register and rewrite copy to outcome framing
- [ ] **Phase 5: Utility Pages + Analytics** - Apply established token patterns to Archive, Firms, Quiz, Tests, and Primers; install Vercel Analytics

## Phase Details

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
- [ ] 01-01-PLAN.md — Add CSS vars (--paper, --radius-*), fontSize scale, borderRadius tokens, and .section-label component class

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
- [ ] 02-01-PLAN.md — Migrate Header.tsx and NavDropdowns.tsx to design tokens (text-display, text-label, bg-paper)
- [ ] 02-02-PLAN.md — Complete SiteFooter.tsx with five links and fix sticky-footer layout in app/layout.tsx

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
- [ ] 03-01-PLAN.md — Add text-article token to tailwind.config.ts and migrate StoryCard.tsx to design tokens with border hover state
- [ ] 03-02-PLAN.md — Migrate ArticleStory.tsx to design tokens (uses text-article token from 03-01)
- [ ] 03-03-PLAN.md — Migrate BriefingView.tsx labels to tokens, fix hover:opacity in BriefingView, StoryGrid, and Header logo

### Phase 4: Conversion Surfaces
**Goal**: A prospective subscriber who visits the upgrade page sees a product that matches the editorial register they just experienced, reads why it matters to their TC application, and trusts the person behind it
**Depends on**: Phase 3
**Requirements**: CONV-01, CONV-02, CONV-03, CONV-04
**Success Criteria** (what must be TRUE):
  1. The upgrade page uses the stone palette throughout — it reads as the same product as the briefing pages, not a separate SaaS marketing page
  2. Every premium feature description on the upgrade page is outcome-framed ("walk into interviews knowing the market") not capability-framed ("get access to the quiz")
  3. Social proof placeholder slots are visible on the upgrade page — wired to show real student count and testimonials when data exists, clearly marked as placeholders until then
  4. The LandingHero CTA button has the correct border radius from the token system — the `rounded-xl` inconsistency is resolved
**Plans**: TBD

### Phase 5: Utility Pages + Analytics
**Goal**: Every page in Folio speaks the same visual language as the core product, and the conversion funnel is observable
**Depends on**: Phase 4
**Requirements**: UTIL-01, UTIL-02, UTIL-03, UTIL-04, UTIL-05, ANLYT-01, ANLYT-02
**Success Criteria** (what must be TRUE):
  1. Archive, Firms, Quiz, Tests, and Primers pages all use the stone/zinc palette rule consistently — no utility page reads as a different product
  2. Heading patterns are uniform across all utility pages — the same icon + bold title + count badge pattern from design principles is applied everywhere
  3. Vercel Analytics is active on production and recording page views — the dashboard shows traffic data
  4. Conversion funnel events fire correctly: free sign-up, upgrade page view, checkout click, and subscription activation are all tracked and visible in Vercel Analytics
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in strict dependency order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Tokens | 1/1 | Complete   | 2026-03-09 |
| 2. Shell | 2/2 | Complete   | 2026-03-09 |
| 3. Content Surfaces | 2/3 | Complete    | 2026-03-09 |
| 4. Conversion Surfaces | 0/TBD | Not started | - |
| 5. Utility Pages + Analytics | 0/TBD | Not started | - |
