# Roadmap: Folio

## Milestones

- ✅ **v1.0 Market-Ready Design Lift** — Phases 1-6 (shipped 2026-03-10)
- ✅ **v1.1 Content & Reach** — Phases 7-12 (shipped 2026-03-12)
- 🚧 **v1.2 Editorial Design** — Phases 13-15 (in progress)

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

### ✅ v1.2 Editorial Design — SHIPPED 2026-03-12

**Milestone Goal:** Elevate Folio's visual register from polished to genuinely editorial — serif headlines, newspaper-style layout hierarchy, tighter spacing rhythm, and a conversion-optimised upgrade page.

- [x] **Phase 13: Typography & Spacing** (1/1 plans) - Playfair Display serif, updated type scale sizes, and vertical rhythm improvements across the design system — completed 2026-03-12
- ~~**Phase 14: Editorial Layout**~~ — reverted 2026-03-12 (user preferred flat grid over lead story hierarchy)
- [x] **Phase 15: Conversion Page** (1/1 plans) - Upgrade page redesigned as editorial section with outcome framing, social proof, and amber accent CTA — completed 2026-03-12

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
