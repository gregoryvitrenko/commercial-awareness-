# Roadmap: Folio

## Milestones

- ✅ **v1.0 Market-Ready Design Lift** — Phases 1-6 (shipped 2026-03-10)
- ✅ **v1.1 Content & Reach** — Phases 7-12 (shipped 2026-03-12)
- ✅ **v1.2 Editorial Design** — Phases 13-15 (shipped 2026-03-12)
- ✅ **v1.3 Editorial Interior** — Phases 16-19 (shipped 2026-03-12)
- ✅ **v2 Premium Experience** — Phases 20-24 (shipped 2026-03-12)
- 🚧 **v3 Design Refresh & Features** — Phases 25-30 (active)

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

<details>
<summary>✅ v2 Premium Experience (Phases 20-24) — SHIPPED 2026-03-12</summary>

- [x] Phase 20: Design System Tokens (2/2 plans) — completed 2026-03-12
- [x] Phase 21: Firms Directory Redesign (1/1 plans) — completed 2026-03-12
- [x] Phase 22: Secondary Page Redesigns (2/2 plans) — completed 2026-03-12
- [x] Phase 23: Events + Podcast Accent (2/2 plans) — completed 2026-03-12
- [x] Phase 24: Interview Prep Page (1/1 plans) — completed 2026-03-12

See phase details below for full success criteria.

</details>

### v3.2 Mockup Alignment (Next)

**Milestone Goal:** Align the deployed site to the AI Studio mockup across every page — new header shell (wordmark-left / flat nav / no dropdowns), site footer, and full redesigns of the archive, saved, tracker, events, primers, quiz, tests, interview, and fit assessment pages to match the mockup layout, typography scale, and visual restraint.

- [x] **Phase 32: Header + Footer** — New header shell: wordmark-left, flat nav links (no dropdowns), mobile drawer update. New site footer component added sitewide. (completed 2026-03-13)
- [ ] **Phase 33: Archive + Saved Pages** — Archive: left-aligned huge serif heading, italic column headers, pure minimal list (no cards). Saved: new heading + card redesign (date, filled bookmark, serif title, tag + read time).
- [ ] **Phase 34: Tracker + Events Pages** — Tracker: "The Tracker" heading, table layout with styled status badges, serif firm names. Events: centered huge serif heading, rounded-xl cards, REGISTER INTEREST buttons.
- [ ] **Phase 35: Primers 3-Column Grid** — Switch primers grid from 2-col to 3-col, final PrimerCard polish (outlined category chip, no dot, READ PRIMER link).
- [ ] **Phase 36: Quiz Page Cleanup** — Remove date archive list, move gamification strip to top, clean two-panel hero layout.
- [ ] **Phase 37: Tests + Interview + Fit Assessment** — Tests: card redesign with icon square + feature bullets. Interview: remove colored card backgrounds, add gray icon squares, remove "By Practice Area" section. Fit: new landing page with two cards.

### v3.1 Design Polish (Next)

**Milestone Goal:** Close the gap between the deployed v3 site and the AI Studio mockups — fixing layout, heading alignment, component styles, and the quiz page to match the reference designs as closely as possible.

- [x] **Phase 31: Complete Design Overhaul** — Quiz page rework, home masthead, centered page headings, primer card redesign, topic tab dots removal, fit assessment heading, and any other visual gaps vs AI Studio mockups (completed 2026-03-13)

### 🚧 v3 Design Refresh & Features (Active)

**Milestone Goal:** Align to AI Studio mockup palette (charcoal #2D3436 accent), apply consistent heading pattern sitewide, redesign briefing home page as newspaper layout, unify archive into a 3-column page, standardise podcast and quiz heroes, restructure quiz format (daily 1/topic + deep practice per area) with real Redis-persisted gamification (XP/level/streak), and add an Application Tracker.

**Wave structure:**
- Wave 1: Phase 25 (colour + heading tokens — everything else depends on this)
- Wave 2: Phases 26, 27, 28, 30 (all parallel — independent pages/features)
- Wave 3: Phase 29 (quiz gamification — depends on Phase 28 quiz UI)

- [ ] **Phase 25: Accent + Global Headings** — Charcoal token replaces Oxford blue sitewide; consistent heading block pattern applied to all primary pages
- [ ] **Phase 26: Home Newspaper Layout** — Briefing home page redesigned as newspaper layout with dominant lead story and sidebar
- [ ] **Phase 27: Unified Archive** — Single `/archive` page with three columns (Briefings, Quizzes, Podcasts) and nav dropdown
- [ ] **Phase 28: Quiz + Podcast Heroes & Format** — Standardised evergreen heroes; quiz restructured to 8 questions (1/topic) with deep practice sets
- [ ] **Phase 29: Quiz Gamification** — XP/level/streak system persisted in Redis, displayed in quiz UI
- [ ] **Phase 30: Application Tracker** — New `/tracker` page with full CRUD for TC application entries, Redis-persisted per user

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

### Phase 32: Header + Footer
**Goal**: Every page uses the new header shell (wordmark-left, flat nav links, no dropdowns) and has a site footer — the two structural changes that affect every page and establish the visual framework for all subsequent redesign work
**Depends on**: Phase 31
**Requirements**: SHELL-01, SHELL-02
**Success Criteria** (what must be TRUE):
  1. The header shows the Folio wordmark at left, flat horizontal nav links in the centre (no dropdowns, no chevrons), and a bookmark icon at the right — matching the mockup structure exactly
  2. Every nav link (Daily, Test, Interview, Fit, Tracker, Events, Archive, Saved, Firms, Primers) is directly accessible as a top-level link — no grouped menus
  3. The active page nav link has an underline indicator — the user can see which section they are in
  4. A site footer appears on every page: Folio wordmark left, "© 2026 BRAND GUIDELINES" centre, Legal / Privacy / Contact links right
  5. The mobile hamburger menu is updated to reflect the new flat nav structure — all individual links accessible from mobile
**Plans**: 2 plans
Plans:
- [ ] 32-01-PLAN.md — Header restructure: wordmark-left, flat nav links, active underline, mobile drawer update
- [x] 32-02-PLAN.md — Footer component: Folio wordmark + copyright + Legal/Privacy/Contact, added to all page templates

### Phase 33: Archive + Saved Pages
**Goal**: The archive and saved pages match the mockup — the archive becomes a minimal three-column list (no cards), and saved stories uses a large serif heading with date/bookmark card layout
**Depends on**: Phase 32
**Requirements**: ARCH-01, SAVED-01
**Success Criteria** (what must be TRUE):
  1. The archive page heading shows "HISTORICAL INTELLIGENCE" overline + "The Archive" in large serif (~56px) + short rule underline + description — left-aligned
  2. Archive content renders as three equal columns (Briefings, Quizzes, Podcasts) with italic serif column headers, a thin horizontal rule under each header, and simple date + title list items — no card backgrounds
  3. The saved page heading shows "PERSONAL ARCHIVE" overline + "Saved Stories" in large serif — left-aligned
  4. Saved story cards show: date (top-left, muted), filled bookmark icon (top-right, dark), large serif title, topic tag chip + "8 MIN READ" — matching the mockup card layout
**Plans**: 2 plans
Plans:
- [ ] 33-01-PLAN.md — Archive page: new heading, italic serif column headers, pure list format
- [ ] 33-02-PLAN.md — Saved page: new heading + card redesign

### Phase 34: Tracker + Events Pages
**Goal**: The tracker and events pages match the mockup — the tracker becomes a clean table with serif firm names and styled status badges, events gets a centered huge-serif heading and rounded cards
**Depends on**: Phase 32
**Requirements**: TRKR-01, EVENTS-01
**Success Criteria** (what must be TRUE):
  1. The tracker heading shows "APPLICATION MANAGEMENT" overline + "The Tracker" in large serif (~56px) — left-aligned, with "+ ADD APPLICATION" pill button top-right
  2. Tracker firm names render in serif font; status badges are styled per status (outlined for In Progress, tinted for Submitted/Interview/Applied)
  3. The events heading is centered: "PROFESSIONAL NETWORK" overline + "Upcoming Events" in large serif (~64px) + centered description
  4. Events cards use visibly large border radius (rounded-2xl), category chip top-left, date top-right, and a full-width outlined "REGISTER INTEREST" button
**Plans**: 2 plans
Plans:
- [ ] 34-01-PLAN.md — Tracker: heading, table styling, serif firm names, status badge variants
- [ ] 34-02-PLAN.md — Events: centered heading, rounded-2xl cards, REGISTER INTEREST button

### Phase 35: Primers 3-Column Grid
**Goal**: The primers page uses a 3-column grid and the PrimerCard matches the mockup exactly — outlined category chip, clock + read time, large serif title, thin divider, "READ PRIMER ↗" link
**Depends on**: Phase 32
**Requirements**: PRIM-01
**Success Criteria** (what must be TRUE):
  1. The primers grid is 3 columns on desktop (not 2), 2 on tablet, 1 on mobile
  2. Each PrimerCard shows: outlined rounded category chip (no coloured dot), clock icon + read time (top row), large serif title (~28–32px), short description, thin divider line, "READ PRIMER ↗" uppercase text link
  3. No section count or key terms count visible on the card
  4. Category chips have no colour — plain outlined chip, dark text
**Plans**: 1 plan
Plans:
- [ ] 35-01-PLAN.md — Primers grid 3-col + final PrimerCard redesign

### Phase 36: Quiz Page Cleanup
**Goal**: The quiz page is clean and focused — no date archive list, gamification strip at the top, and a clear two-panel hero layout matching the mockup
**Depends on**: Phase 32
**Requirements**: QUIZ-01
**Success Criteria** (what must be TRUE):
  1. The date archive list (AVAILABLE section with list of past quiz dates) is removed from the quiz page
  2. The gamification stats strip (XP, level, streak) appears at the top of the page — before the quiz panels
  3. The quiz page shows exactly two panels side by side: Daily (left) and Deep Practice (right) — no other content sections
  4. The layout is clean and uncluttered — matches the mockup's two-panel hero structure
**Plans**: 1 plan
Plans:
- [ ] 36-01-PLAN.md — Quiz page: remove date list, gamification strip to top, clean two-panel layout

### Phase 37: Tests + Interview + Fit Assessment
**Goal**: The tests, interview, and fit assessment pages are redesigned to match the mockup — cleaner cards, gray icon squares on interview categories, and a new fit assessment landing page with two cards
**Depends on**: Phase 32
**Requirements**: TESTS-01, INTVW-01, FIT-01
**Success Criteria** (what must be TRUE):
  1. Test cards show a gray icon square, feature bullet list describing what the test measures, and a correctly styled CTA button
  2. Interview category cards have no coloured backgrounds — gray icon squares replace the coloured card backgrounds; the "By Practice Area" section is removed
  3. Visiting /firm-fit or /area-fit shows a landing page with two cards (Firm Fit + Area Fit) before entering the quiz — not the quiz directly
**Plans**: 2 plans
Plans:
- [ ] 37-01-PLAN.md — Tests card redesign (icon square, feature bullets, button)
- [ ] 37-02-PLAN.md — Interview page: gray icon squares, remove colored backgrounds, remove "By Practice Area". Fit Assessment: new landing page with two cards.

### Phase 25: Accent + Global Headings
**Goal**: The charcoal accent colour (#2D3436) is live sitewide and every primary content page displays a consistent heading block — the visual identity is reset to match the AI Studio mockup palette before any layout work begins
**Depends on**: Nothing (Wave 1 — must run first)
**Requirements**: DESIGN-01, DESIGN-02
**Success Criteria** (what must be TRUE):
  1. All CTA buttons, active states, hero backgrounds, and accent elements across every page render in charcoal (#2D3436) — no Oxford blue accent remnants visible anywhere on the site
  2. Every primary content page (home, archive, quiz, podcast, firms, tests, primers, tracker) shows a heading block with a small uppercase overline label, large serif title, and optional description — the pattern is visually consistent across all pages
  3. The heading block renders correctly in both light and dark modes without any colour regression
  4. The charcoal token is registered in tailwind.config.ts and used via a named class — no hardcoded hex values scattered in component files
**Plans**: 2 plans
Plans:
- [ ] 25-01-PLAN.md — Charcoal token registration + bulk oxford-blue replacement across all components/pages
- [ ] 25-02-PLAN.md — v3 heading pattern applied to all 9 primary content pages

### Phase 26: Home Newspaper Layout
**Goal**: The briefing home page presents stories as a newspaper — the first story commands the main column as the lead, and the remaining stories occupy the sidebar and grid below
**Depends on**: Phase 25
**Requirements**: HOME-01, HOME-02
**Success Criteria** (what must be TRUE):
  1. On desktop (lg breakpoint), the home page shows an asymmetric two-column layout — a wide main column with the lead story and a narrower sidebar column with secondary stories — the newspaper structure is immediately obvious
  2. The lead story displays a large serif headline, full excerpt, and topic badge — it is visually larger and more prominent than any sidebar story
  3. The first story from today's briefing always populates the lead position — the remaining 7 stories fill the sidebar and/or below-fold grid
  4. On mobile, the layout collapses to a single column with the lead story first — the newspaper hierarchy is preserved in reading order
**Plans**: 1 plan
Plans:
- [ ] 26-01-PLAN.md — NewspaperGrid component: lead story + sidebar + below-fold 3-column grid

### Phase 27: Unified Archive
**Goal**: All past content types — briefings, quizzes, and podcasts — are accessible from a single `/archive` page organised in three columns, and the navigation archive dropdown reflects this structure
**Depends on**: Phase 25
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04
**Success Criteria** (what must be TRUE):
  1. The `/archive` page shows three side-by-side columns labelled Briefings, Quizzes, and Podcasts — each lists past entries in reverse-chronological order
  2. Clicking a quiz entry in the Quizzes column navigates to `/quiz/[date]` — the quiz is playable from the archive
  3. Clicking a podcast entry in the Podcasts column plays or navigates to that episode — the podcast column is populated from existing Blob-cached episodes
  4. The main navigation Archive item opens a dropdown with anchor links to Briefings, Quizzes, and Podcasts sections within the unified archive page
**Plans:** 2/2 plans complete
Plans:
- [ ] 27-01-PLAN.md — Unified 3-column archive page + nav anchor link updates

### Phase 28: Quiz + Podcast Heroes & Format
**Goal**: The podcast and quiz pages show evergreen hero sections not tied to today's specific content, and the quiz delivers exactly 8 questions (one per practice area) with per-topic deep practice sets available below
**Depends on**: Phase 25
**Requirements**: POD-01, QUIZ-01, QUIZ-02, QUIZ-03
**Success Criteria** (what must be TRUE):
  1. The podcast page hero shows "Daily Briefing Podcast" as a fixed title and an evergreen description — no story-specific headline or episode title appears in the hero
  2. The quiz page hero shows "Today's Commercial Briefing Quiz" as a fixed card title — it does not change based on today's briefing content
  3. Starting the daily quiz, the user receives exactly 8 questions — one drawn from each of the 8 practice areas (M&A, Capital Markets, Banking & Finance, Energy & Tech, Regulation, Disputes, International, AI & Law)
  4. Below the daily quiz hero, the quiz page lists 8 deep practice sets (one per practice area) — each is independently enterable without completing the daily quiz first
**Plans**: TBD

### Phase 29: Quiz Gamification
**Goal**: Users earn XP for completing quizzes, accumulate levels from XP, and maintain a daily streak — all persisted in Redis and visible in the quiz UI
**Depends on**: Phase 28
**Requirements**: QUIZ-04, QUIZ-05, QUIZ-06
**Success Criteria** (what must be TRUE):
  1. Completing the daily quiz or a deep practice set awards XP — the user sees a confirmation of XP earned immediately after quiz completion
  2. The quiz UI shows the user's current level and a progress bar indicating XP within the current level (100 XP = 1 level) — the level display updates in real time after a completed quiz
  3. The quiz UI shows the user's current daily streak (consecutive days with at least one completed quiz) — the streak count is visible before starting a quiz
  4. All XP, level, and streak data is stored in Redis under per-user keys (`quiz:xp:{userId}`, `quiz:level:{userId}`, `quiz:streak:{userId}`) — refreshing the page does not reset or lose any values
**Plans**: 2 plans
Plans:
- [ ] 29-01-PLAN.md — Backend: lib/quiz-gamification.ts dual-backend functions + API route GET/POST
- [ ] 29-02-PLAN.md — Frontend: QuizInterface completion POST + results XP panel + quiz page stats strip

### Phase 31: Complete Design Overhaul
**Goal**: The deployed site matches the AI Studio mockups as closely as possible — quiz page is fully reworked with correct layout and gamification placement, the home masthead is added, all applicable page headings are centered, primer cards match the minimal mockup style, topic tabs have no colored dots, and the fit assessment heading is centered
**Depends on**: Phases 25–30 (all v3 features complete)
**Requirements**: POLISH-01, POLISH-02, POLISH-03, POLISH-04, POLISH-05, POLISH-06
**Success Criteria** (what must be TRUE):
  1. Quiz page: gamification stats strip appears at the top-right of the heading row; "Start Daily Quiz" button links to `/quiz/[today]` not `/quiz`; no archive date list on this page; layout matches mockup (dark navy card, serif section headers, practice area cards without colored dots)
  2. Home masthead: a centered serif "Folio" wordmark with "VOL. XX / NO. XX" and "LONDON EDITION" flanking text appears above the topic tabs on the briefing home page
  3. Page headings on primers, quiz/practice/[topic], tests, interview, firm-fit, and area-fit pages are centered (overline + serif title + description all `text-center`)
  4. Primer cards match the mockup: minimal white card, category chip (text only, no colored icon), clock + read time, serif title, thin divider, "READ PRIMER ↗" link text
  5. Topic filter tabs have no colored dot next to each topic name — clean uppercase text only with bottom border on active tab
  6. Fit Assessment page heading is centered, matching the studio version
**Plans**: 4 plans
Plans:
- [ ] 31-01-PLAN.md — POLISH-05 tab dot removal + POLISH-03 centered headings (4 pages + interview practice grid dots)
- [ ] 31-02-PLAN.md — POLISH-04 primer card redesign (minimal: category chip, clock + read time, divider, READ PRIMER link)
- [ ] 31-03-PLAN.md — POLISH-01 quiz page audit and fix (stats strip position, href, navy card, section headers, no dots)
- [ ] 31-04-PLAN.md — POLISH-02 home masthead (London Edition + Folio wordmark + Vol/No) + POLISH-06 firm-fit heading verification

### Phase 30: Application Tracker
**Goal**: Users can manage their TC application pipeline in Folio — adding, viewing, updating, and deleting application entries that persist in Redis and are accessible only to subscribers
**Depends on**: Phase 25
**Requirements**: TRKR-01, TRKR-02, TRKR-03, TRKR-04, TRKR-05
**Success Criteria** (what must be TRUE):
  1. On the `/tracker` page, a user can add a new application entry with firm name, status, deadline date, and notes — the entry appears in the table immediately after saving
  2. All application entries are displayed in a table on `/tracker`, sortable by deadline date — the user can see their entire pipeline at a glance
  3. The user can update the status or notes of any existing entry inline or via an edit action — changes persist after page refresh
  4. The user can delete any application entry — the entry is removed from the table and from Redis immediately
  5. Attempting to access `/tracker` without an active subscription redirects to the upgrade page — the data is never visible to free users
**Plans**: 2 plans
Plans:
- [ ] 30-01-PLAN.md — Backend: TrackerEntry type, lib/tracker.ts Redis CRUD, API route
- [ ] 30-02-PLAN.md — Frontend: /tracker page, TrackerView client component

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
| 20. Design System Tokens | v2 | 2/2 | Complete | 2026-03-12 |
| 21. Firms Directory Redesign | v2 | 1/1 | Complete | 2026-03-12 |
| 22. Secondary Page Redesigns | v2 | 2/2 | Complete | 2026-03-12 |
| 23. Events + Podcast Accent | v2 | 2/2 | Complete | 2026-03-12 |
| 24. Interview Prep Page | v2 | 1/1 | Complete | 2026-03-12 |
| 25. Accent + Global Headings | v3 | 0/2 | Not started | - |
| 26. Home Newspaper Layout | v3 | 0/1 | Not started | - |
| 27. Unified Archive | v3 | 0/1 | Not started | - |
| 28. Quiz + Podcast Heroes & Format | v3 | 0/TBD | Not started | - |
| 29. Quiz Gamification | v3 | 0/2 | Not started | - |
| 30. Application Tracker | v3 | 0/2 | Not started | - |
| 31. Complete Design Overhaul | v3.1 | Complete    | 2026-03-13 | 2026-03-13 |
| 32. Header + Footer | 2/2 | Complete    | 2026-03-13 | 2026-03-13 |
| 33. Archive + Saved Pages | v3.2 | 0/2 | Not started | - |
| 34. Tracker + Events Pages | v3.2 | 0/2 | Not started | - |
| 35. Primers 3-Column Grid | v3.2 | 0/1 | Not started | - |
| 36. Quiz Page Cleanup | v3.2 | 0/1 | Not started | - |
| 37. Tests + Interview + Fit Assessment | v3.2 | 0/2 | Not started | - |
