# Roadmap: Folio

## Milestones

- ✅ **v1.0 Market-Ready Design Lift** — Phases 1-6 (shipped 2026-03-10)
- ✅ **v1.1 Content & Reach** — Phases 7-12 (shipped 2026-03-12)
- ✅ **v1.2 Editorial Design** — Phases 13-15 (shipped 2026-03-12)
- 🚧 **v1.3 Editorial Interior** — Phases 16-18 (in progress)

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

### 🚧 v1.3 Editorial Interior (In Progress)

**Milestone Goal:** Transform interior pages from a generic card-stack pattern into a genuinely editorial product — warm paper tone sitewide, newspaper masthead header with dateline, firm profile redesign with stat strip and varied section treatments, and a dark ink conversion panel on the upgrade page.

- [ ] **Phase 16: Global Design + Logo + Header** - Warm paper background sitewide, JetBrains Mono section labels restored, new wordmark deployed, editorial dateline in header
- [ ] **Phase 17: Firm Profile Redesign** - Stat strip, visually differentiated sections, editorial "Why This Firm?" callouts, clean typographic interview question numbering
- [ ] **Phase 18: Secondary Pages + Conversion Polish** - Quiz mode two-panel layout, quiz date visual states, firms directory tier headers, upgrade page serif titles and dark CTA panel

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
- [ ] 16-01-PLAN.md — Warm paper CSS variable, body bg-paper, .section-label font-mono
- [ ] 16-02-PLAN.md — Wordmark letter-spacing, editorial dateline, commit logo files

### Phase 17: Firm Profile Redesign
**Goal**: The firm profile page feels like a premium editorial dossier — a prominent data strip leads, content sections use visually varied treatments, and "Why This Firm?" reads as a crafted editorial callout rather than a generic card
**Depends on**: Phase 16
**Requirements**: FIRM-01, FIRM-02, FIRM-03, FIRM-04
**Success Criteria** (what must be TRUE):
  1. Visiting any firm profile, NQ salary, TC salary, annual intake, and seat count appear in a horizontal stat strip immediately below the firm name — scannable at a glance
  2. The firm profile page has at least two visually distinct section treatments — not all sections use the same left-border card pattern
  3. The "Why This Firm?" section uses editorial numbered callouts with large background numbers behind each point — clearly different from the other sections
  4. Interview questions on the firm profile are numbered with clean typographic numbering (1., 2., 3.) — no chip or box styling around the number
**Plans**: TBD

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
**Plans**: TBD

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
| 16. Global Design + Logo + Header | v1.3 | 0/2 | Not started | - |
| 17. Firm Profile Redesign | v1.3 | 0/TBD | Not started | - |
| 18. Secondary Pages + Conversion Polish | v1.3 | 0/TBD | Not started | - |
