# Roadmap: Folio

## Milestones

- ✅ **v1.0 Market-Ready Design Lift** — Phases 1-6 (shipped 2026-03-10)
- ✅ **v1.1 Content & Reach** — Phases 7-12 (shipped 2026-03-12)
- ✅ **v1.2 Editorial Design** — Phases 13-15 (shipped 2026-03-12)
- ✅ **v1.3 Editorial Interior** — Phases 16-19 (shipped 2026-03-12)
- 🚧 **v2 Premium Experience** — Phases 20-24 (in progress)

## Phases

<details>
<summary>✅ v1.0 Market-Ready Design Lift (Phases 1-6) — SHIPPED 2026-03-10</summary>

- [x] Phase 1: Design Tokens (1/1 plans) — completed 2026-03-09
- [x] Phase 2: Shell (2/2 plans) — completed 2026-03-09
- [x] Phase 3: Content Surfaces (3/3 plans) — completed 2026-03-09
- [x] Phase 4: Conversion Surfaces (3/3 plans) — completed 2026-03-09
- [x] Phase 5: Utility Pages + Analytics (4/4 plans) — completed 2026-03-10
- [x] Phase 6: Bug Fixes + Content Quality (4/4 plans) — completed 2026-03-10

See: `.planning/milestones/v1.0-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.1 Content & Reach (Phases 7-12) — SHIPPED 2026-03-12</summary>

- [x] Phase 7: Mobile + Header Polish (3/3 plans) — completed 2026-03-10
- [x] Phase 8: Firms Expansion (1/1 plans) — completed 2026-03-10
- [x] Phase 9: Podcast Archive (3/3 plans) — completed 2026-03-10
- [x] Phase 10: Primer Interview Questions (via /gsd:quick) — completed 2026-03-10
- [x] Phase 11: Events Section (3/3 plans) — completed 2026-03-11
- [x] Phase 12: Digest Compliance + Improvements (3/3 plans) — completed 2026-03-12

See: `.planning/milestones/v1.1-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.2 Editorial Design (Phases 13-15) — SHIPPED 2026-03-12</summary>

- [x] Phase 13: Typography & Spacing (1/1 plans) — completed 2026-03-12
- ~~Phase 14: Editorial Layout~~ — reverted 2026-03-12 (user preferred flat grid over lead story hierarchy)
- [x] Phase 15: Conversion Page (1/1 plans) — completed 2026-03-12

See phase details below for full success criteria.

</details>

<details>
<summary>✅ v1.3 Editorial Interior (Phases 16-19) — SHIPPED 2026-03-12</summary>

- [x] Phase 16: Global Design + Logo + Header (2/2 plans) — completed 2026-03-12
- [x] Phase 17: Firm Profile Redesign (2/2 plans) — completed 2026-03-12
- [x] Phase 18: Secondary Pages + Conversion Polish (2/2 plans) — completed 2026-03-12
- [x] Phase 19: Podcast Page Redesign (2/2 plans) — completed 2026-03-12

See phase details below for full success criteria.

</details>

### 🚧 v2 Premium Experience (In Progress)

**Milestone Goal:** Shift Folio from the sharp editorial newspaper aesthetic to a softer premium rounded aesthetic — update the design system (radius token, Oxford blue accent colour) sitewide, redesign secondary pages to match, and add a new `/interview` prep page using existing firm interview question data.

- [x] **Phase 20: Design System Tokens** — Rounded radius token sitewide, softened chrome elements, Oxford blue replaces amber as primary accent (completed 2026-03-12)
- [ ] **Phase 21: Firms Directory Redesign** — Two-column layout with left sidebar filters and right scrollable firm card grid
- [ ] **Phase 22: Secondary Page Redesigns** — Quiz hero card, primers card grid, tests feature cards, saved card layout — all aligned to new rounded aesthetic
- [x] **Phase 23: Events + Podcast Accent** — Events rounded cards with Oxford blue active states, podcast hero Oxford blue ambient glow (completed 2026-03-12)
- [x] **Phase 24: Interview Prep Page** — New `/interview` page aggregating firm pack and primer questions by topic, with reveal/hide model answers and category filter (completed 2026-03-12)

## Phase Details

### Phase 13: Typography & Spacing
**Goal**: The design system renders editorial-quality type — Playfair Display serif on headlines, correctly-weighted, with legible labels and comfortable reading rhythm
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: TYPO-01, TYPO-02, TYPO-03, TYPO-04, SPACE-01, SPACE-02
**Success Criteria** (what must be TRUE):
  1. Story card headlines render in Playfair Display serif at semibold weight (600), visibly distinct from body Inter text
  2. Section/topic labels are legible at 11px minimum — no squinting required on any device
  3. Body text and article text renders at 16px — comfortable for sustained reading sessions
  4. Vertical gap between cards and sections is generous (gap-y-6 or gap-y-8), giving the page room to breathe
  5. Internal card spacing between headline, excerpt, and meta feels balanced — no cramped stacking
**Plans**: 1 plan
Plans:
- [x] 13-01-PLAN.md — Type token updates, headline weight correction, grid and card spacing increase

### Phase 14: Editorial Layout
**Goal**: The home briefing view has newspaper-style hierarchy — a dominant lead story announces the day's top item, secondary stories frame it, and the remaining grid follows below a clear visual break
**Depends on**: Phase 13
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04
**Success Criteria** (what must be TRUE):
  1. Opening the home briefing, the lead story is immediately visually dominant — larger format, clearly the primary item
  2. Two secondary stories appear below the lead in a 2-column row, bridging the featured section and the grid
  3. A visual divider (rule or spacing break) cleanly separates the featured section from the remaining stories
  4. The remaining stories render in a standard grid below the divider — consistent with prior layout
**Plans**: 1 plan
Plans:
- [x] 14-01-PLAN.md — Featured StoryCard variant + editorial layout hierarchy in StoryGrid

### Phase 15: Conversion Page
**Goal**: The upgrade page reads as a premium editorial destination, not a SaaS pricing table — outcome framing, social proof signals, and a visually distinct CTA that earns the click
**Depends on**: Phase 13
**Requirements**: CONV-01, CONV-02, CONV-03
**Success Criteria** (what must be TRUE):
  1. The upgrade page layout uses editorial/newspaper section visual language — not card grids, not feature bullet lists in SaaS style
  2. An outcome-framed social proof section is visible — student count or testimonial placeholders that communicate credibility
  3. The primary CTA button uses a differentiated accent colour that stands out clearly from the stone/zinc page palette
**Plans**: 1 plan
Plans:
- [x] 15-01-PLAN.md — Editorial layout, outcome grid, pull quote, amber CTA button

### Phase 16: Global Design + Logo + Header
**Goal**: Every page carries a warm paper tone, section labels use the correct monospace typeface, the new Folio wordmark is live, and the header reads as a newspaper masthead with an editorial dateline
**Depends on**: Phase 15
**Requirements**: GDES-01, GDES-02, GDES-03, HDR-01, HDR-02
**Success Criteria** (what must be TRUE):
  1. Every page (home, article, firm, quiz, archive, etc.) has the warm cream paper background (#F9F7F2) — no cold white or stone-50 remnants visible
  2. Section/category labels (`.section-label`) render in JetBrains Mono — visually distinct from Inter body text
  3. The header shows the striped-F + "olio" wordmark — the new logo is live on every page, not the old plain text
  4. The header displays a dateline line (Vol. · No. · Day, Date · London Edition) in small uppercase tracking beneath the wordmark
  5. The Folio wordmark in the header uses tight letter-spacing (-0.03em) matching the brand studio treatment
**Plans**: 2 plans
Plans:
- [x] 16-01-PLAN.md — Warm paper CSS variable, body bg-paper, .section-label font-mono
- [x] 16-02-PLAN.md — Wordmark letter-spacing, editorial dateline, commit logo files

### Phase 17: Firm Profile Redesign
**Goal**: The firm profile page feels like a premium editorial dossier — a prominent data strip leads, content sections use visually varied treatments, and "Why This Firm?" reads as a crafted editorial callout rather than a generic card
**Depends on**: Phase 16
**Requirements**: FIRM-01, FIRM-02, FIRM-03, FIRM-04
**Success Criteria** (what must be TRUE):
  1. Visiting any firm profile, NQ salary, TC salary, annual intake, and seat count appear in a horizontal stat strip immediately below the firm name — scannable at a glance
  2. The firm profile page has at least two visually distinct section treatments — not all sections use the same left-border card pattern
  3. The "Why This Firm?" section uses editorial numbered callouts with large background numbers behind each point — clearly different from the other sections
  4. Interview questions on the firm profile are numbered with clean typographic numbering (1., 2., 3.) — no chip or box styling around the number
**Plans**: 2 plans
Plans:
- [x] 17-01-PLAN.md — Horizontal stat strip below hero, typographic interview question numbering
- [x] 17-02-PLAN.md — Editorial "Why This Firm?" callouts, dark Interview Focus block

### Phase 18: Secondary Pages + Conversion Polish
**Goal**: The quiz entry experience, firms directory, and upgrade page all reach the editorial standard set in Phases 16-17 — distinct layouts for distinct purposes, with the upgrade page anchored by a dark conversion panel
**Depends on**: Phase 17
**Requirements**: QUIZ-01, QUIZ-02, FDIR-01, CONV-04, CONV-05
**Success Criteria** (what must be TRUE):
  1. The quiz entry page shows Daily and Deep Practice as two clearly differentiated editorial panels — the choice is visually obvious without reading the labels
  2. The quiz date list visually distinguishes today, available past dates, and completed dates — the user can tell their completion status at a glance
  3. Tier headers in the firms directory (Magic Circle, Silver Circle, etc.) use a full-width editorial rule treatment — clearly separating tiers, not just bold text
  4. Upgrade page feature titles use serif font — consistent with the editorial register of the rest of the product
  5. The upgrade page CTA panel has a dark stone-900 background with a border-style button — a strong visual anchor that ends the page with authority
**Plans**: 2 plans
Plans:
- [x] 18-01-PLAN.md — Quiz two-panel layout, date visual states
- [x] 18-02-PLAN.md — Firms tier headers, upgrade page serif titles and dark CTA panel

### Phase 19: Podcast Page Redesign
**Goal**: The podcast page becomes an editorial destination — a dark immersive hero player anchors the experience, the episode archive reads like a newspaper listings section, and the current episode reveals structured briefing notes with numbered talking points
**Depends on**: Phase 16 (dark accent block pattern established)
**Requirements**: POD-01, POD-02, POD-03
**Success Criteria** (what must be TRUE):
  1. The podcast hero is a dark stone-900 block with the episode title in large serif, a waveform bar visualization, and a play button — clearly different from every other page
  2. The episode archive list renders each entry with a date (day + month split), vertical rule divider, topic chip, title, and duration — visually scannable, not a plain list
  3. Below the player, the current episode shows a briefing notes panel with numbered talking points using the same `font-mono opacity-20` large-number style as firm profile callouts
**Plans**: 2 plans
Plans:
- [x] 19-01-PLAN.md — Dark hero block, decorative waveform, briefing notes panel (POD-01, POD-03)
- [x] 19-02-PLAN.md — Editorial episode archive list with date-split rows (POD-02)

### Phase 20: Design System Tokens
**Goal**: The design system radius and accent colour tokens are updated sitewide — all cards and panels adopt the new rounded-3xl aesthetic, chrome elements soften to rounded-full/rounded-2xl, and Oxford blue replaces amber as the primary action colour
**Depends on**: Phase 19
**Requirements**: ROUND-01, ROUND-02, COL-01
**Success Criteria** (what must be TRUE):
  1. Cards and panels across all pages have visibly rounded corners (24px) — the product immediately reads as softer and more premium than before
  2. Buttons, chips, tabs, and input elements are fully pill-shaped or softly rounded — no sharp square edges on any interactive chrome element
  3. All CTA buttons, active navigation states, and accent highlights render in Oxford blue (#002147) — amber is no longer present as an action colour anywhere on the site
  4. The token changes apply consistently across light and dark modes without any colour regression
**Plans**: 2 plans
Plans:
- [ ] 20-01-PLAN.md — globals.css radius token update (24px cards, 16px chrome) + oxford-blue colour registration in tailwind.config.ts
- [ ] 20-02-PLAN.md — Amber-to-oxford-blue replacement in BookmarkButton and QuizInterface (action/accent uses only)

### Phase 21: Firms Directory Redesign
**Goal**: The firms directory is a structured browsing interface — a persistent left sidebar with tier filter tabs and search lets users narrow to what they want, while the right column shows scrollable rounded firm cards
**Depends on**: Phase 20
**Requirements**: FDIR-01
**Success Criteria** (what must be TRUE):
  1. On desktop, the firms page shows a left sidebar (tier filter tabs + search input) and a right scrollable grid — the two-column layout is immediately obvious
  2. Clicking a tier filter tab (Magic Circle, Silver Circle, etc.) updates the right column to show only firms in that tier — no page reload
  3. Typing in the search input filters firm cards in real time by firm name — partial matches work
  4. Firm cards in the right column use the rounded-3xl radius and Oxford blue accent from Phase 20 — the directory looks native to the new design system
**Plans**: 1 plan
Plans:
- [ ] 21-01-PLAN.md — Two-column layout with sticky sidebar tier filter, search, and updated rounded FirmCard

### Phase 22: Secondary Page Redesigns
**Goal**: The quiz, primers, tests, and saved pages are redesigned to the new rounded premium aesthetic — each page has a layout treatment suited to its purpose, replacing the generic card-stack pattern
**Depends on**: Phase 20
**Requirements**: QUIZ-01, PRIM-01, TESTS-01, SAVED-01
**Success Criteria** (what must be TRUE):
  1. The quiz page leads with a prominent "Today" hero card showing the current date, question count, and an Oxford blue start CTA — it is the visual focal point before the date archive list
  2. The primers page shows a card grid where each card displays a topic icon, title, short description, and interview question count — the user can assess what each primer covers without clicking in
  3. The tests page shows Watson Glaser and SJT as two large feature cards with description, what the test measures, and a start CTA — the current list treatment is gone
  4. The saved/bookmarks page uses a rounded card layout with Oxford blue accent elements — consistent with the new design system, not the previous sharp treatment
**Plans**: 2 plans
Plans:
- [ ] 22-01-PLAN.md — Quiz hero card (Oxford blue, today's date, question count CTA) + PrimerCard topic icons and rounded-card
- [ ] 22-02-PLAN.md — TestCard large feature card with Oxford blue CTA + SavedView rounded-card and Oxford blue accents

### Phase 23: Events + Podcast Accent
**Goal**: The events page and podcast hero are updated to match the new rounded, Oxford blue aesthetic — completing design system alignment across all pages
**Depends on**: Phase 20
**Requirements**: EVENTS-01, POD-01
**Success Criteria** (what must be TRUE):
  1. Events cards use rounded-3xl corners and Oxford blue for active filter state and date highlights — the events page looks native to the v2 design system
  2. The podcast hero player has a visible Oxford blue ambient glow or gradient accent in the background — the hero reads as premium and differentiated from other pages
  3. The Oxford blue accent on the podcast hero is subtle enough that it does not overpower the episode title or player controls
**Plans**: 2 plans
Plans:
- [ ] 23-01-PLAN.md — Oxford blue active city filter tabs and date accent in CityFilter (EVENTS-01)
- [ ] 23-02-PLAN.md — Oxford blue radial gradient glow on podcast hero (POD-01)

### Phase 24: Interview Prep Page
**Goal**: A new `/interview` page gives users a single destination to practise interview questions sourced from existing firm packs and primers — questions organised by practice area, with reveal/hide model answers and topic filtering
**Depends on**: Phase 20
**Requirements**: INTVW-01, INTVW-02, INTVW-03, INTVW-04
**Success Criteria** (what must be TRUE):
  1. The `/interview` route exists and is reachable from main navigation — users can find it without a direct URL
  2. Opening the page, questions are grouped by topic/practice area (M&A, Banking & Finance, Capital Markets, etc.) — the taxonomy matches the existing primer and firm pack categories
  3. Each question shows only the question text by default — clicking a reveal toggle shows the model answer inline, and clicking again hides it
  4. A topic filter (tabs or dropdown) lets the user narrow to one practice area — selecting a topic shows only questions from that area, hiding the rest
  5. No new AI generation is triggered by this page — all content comes from existing cached firm pack and primer data
**Plans**: 1 plan
Plans:
- [ ] 24-01-PLAN.md — Interview prep page: topic-filtered primer question bank with reveal/hide model answers

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Design Tokens | v1.0 | 1/1 | Complete | 2026-03-09 |
| 2. Shell | v1.0 | 2/2 | Complete | 2026-03-09 |
| 3. Content Surfaces | v1.0 | 3/3 | Complete | 2026-03-09 |
| 4. Conversion Surfaces | v1.0 | 3/3 | Complete | 2026-03-09 |
| 5. Utility Pages + Analytics | v1.0 | 4/4 | Complete | 2026-03-10 |
| 6. Bug Fixes + Content Quality | v1.0 | 4/4 | Complete | 2026-03-10 |
| 7. Mobile + Header Polish | v1.1 | 3/3 | Complete | 2026-03-10 |
| 8. Firms Expansion | v1.1 | 1/1 | Complete | 2026-03-10 |
| 9. Podcast Archive | v1.1 | 3/3 | Complete | 2026-03-10 |
| 10. Primer Interview Questions | v1.1 | quick | Complete | 2026-03-10 |
| 11. Events Section | v1.1 | 3/3 | Complete | 2026-03-11 |
| 12. Digest Compliance + Improvements | v1.1 | 3/3 | Complete | 2026-03-12 |
| 13. Typography & Spacing | v1.2 | 1/1 | Complete | 2026-03-12 |
| 14. Editorial Layout | v1.2 | - | Reverted | 2026-03-12 |
| 15. Conversion Page | v1.2 | 1/1 | Complete | 2026-03-12 |
| 16. Global Design + Logo + Header | v1.3 | 2/2 | Complete | 2026-03-12 |
| 17. Firm Profile Redesign | v1.3 | 2/2 | Complete | 2026-03-12 |
| 18. Secondary Pages + Conversion Polish | v1.3 | 2/2 | Complete | 2026-03-12 |
| 19. Podcast Page Redesign | v1.3 | 2/2 | Complete | 2026-03-12 |
| 20. Design System Tokens | 2/2 | Complete    | 2026-03-12 | - |
| 21. Firms Directory Redesign | v2 | 0/1 | Not started | - |
| 22. Secondary Page Redesigns | v2 | 0/2 | Not started | - |
| 23. Events + Podcast Accent | 2/2 | Complete   | 2026-03-12 | - |
| 24. Interview Prep Page | 1/1 | Complete   | 2026-03-12 | - |
