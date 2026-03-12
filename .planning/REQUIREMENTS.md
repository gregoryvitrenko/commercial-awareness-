# Requirements: Folio

**Defined:** 2026-03-12
**Core Value:** Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.

## v1.2 Requirements

### Typography (TYPO)

- [ ] **TYPO-01**: Story card headlines render in Playfair Display serif (replacing Inter sans-serif)
- [ ] **TYPO-02**: Playfair Display headings use semibold weight (600) not bold (700)
- [ ] **TYPO-03**: Section/topic labels display at minimum 11px (up from 10px) for legibility
- [ ] **TYPO-04**: Body and article text renders at 16px (up from 15px)

### Editorial Layout (LAYOUT)

- [ ] **LAYOUT-01**: Home briefing opens with a lead story in large-format dominant position
- [ ] **LAYOUT-02**: Two secondary stories appear below the lead in a 2-column row
- [ ] **LAYOUT-03**: A visual divider separates the featured section from the remaining story grid
- [ ] **LAYOUT-04**: Remaining stories render in a standard grid below the divider

### Spacing & Rhythm (SPACE)

- [ ] **SPACE-01**: Vertical gap between cards/sections increases to gap-y-6 or gap-y-8
- [ ] **SPACE-02**: Internal card element spacing increases between headline, excerpt, and meta

### Conversion (CONV)

- [ ] **CONV-01**: Upgrade page layout reads as editorial/newspaper section (not SaaS pricing)
- [ ] **CONV-02**: Upgrade page includes outcome-framed social proof section (student count + testimonial placeholders)
- [ ] **CONV-03**: Upgrade page primary CTA uses differentiated accent colour to stand out

## v1.3 Requirements

### Global Design (GDES)

- [x] **GDES-01**: All pages use warm paper background (`#F9F7F2`) replacing cold bg-stone-50/white
- [x] **GDES-02**: Section label utility (`.section-label`) uses JetBrains Mono — restored after v1.2 font sweep
- [x] **GDES-03**: Striped-F + "olio" wordmark deployed from existing codebase changes

### Header (HDR)

- [x] **HDR-01**: Header shows editorial dateline (Vol. · No. · Day, Date · London Edition) in small uppercase tracking
- [x] **HDR-02**: Folio wordmark uses tight letter-spacing (`-0.03em`) matching brand studio `.folio-wordmark` treatment

### Firm Profile (FIRM)

- [x] **FIRM-01**: Firm profile displays NQ salary, TC salary, intake/year, and seats in a prominent horizontal stat strip below the firm name
- [x] **FIRM-02**: Firm profile content sections use visually differentiated treatments — not all identical left-border cards
- [x] **FIRM-03**: "Why This Firm?" section uses editorial numbered callout style with large background numbers
- [x] **FIRM-04**: Interview questions use clean typographic numbering — no Q1/Q2 chip/box styling

### Quiz (QUIZ)

- [x] **QUIZ-01**: Quiz mode selection (Daily vs Deep Practice) uses a clearly differentiated editorial two-panel layout
- [x] **QUIZ-02**: Quiz date list shows visual distinction between today, available past dates, and completed dates

### Firms Directory (FDIR)

- [x] **FDIR-01**: Tier section headers (Magic Circle, Silver Circle, etc.) use a full-width editorial rule treatment

### Conversion (CONV)

- [x] **CONV-04**: Upgrade page feature grid item titles use `font-serif`
- [x] **CONV-05**: Upgrade page CTA panel redesigned as dark stone-900 block with border button

### Podcast Page (POD)

- [x] **POD-01**: Podcast page hero redesigned as dark `bg-stone-900` immersive player block — episode title, waveform bar visualization, play button, and date badge
- [x] **POD-02**: Episode archive list uses editorial layout — date (day/month split) + vertical rule divider + title + duration, with audio status indicator
- [x] **POD-03**: Current episode shows a briefing notes section below the player — numbered talking points sidebar matching the editorial numbered callout style

## Future Requirements

### Brand

- **BRAND-01**: Typographic serif wordmark (Playfair Display) in header replaces plain text — implement after logo/mark is designed
- **BRAND-02**: F monogram favicon — implement after logo/mark is designed

## Out of Scope

| Feature | Reason |
|---------|--------|
| Logo/mark design | Design-first: owner designs the mark outside this milestone; implementation deferred to v1.3 |
| Dark mode overrides for new typography | Follow existing dark mode token patterns; no new dark-mode-specific work |
| Editorial layout on archive/topic pages | Home page only for v1.2; extend in future milestone once lead story pattern is validated |
| Real-time content metrics | No live user data yet to display |
| Lead story hierarchy on homepage | Reverted in v1.2 — user prefers flat 2-column grid; do not re-introduce |
| Asymmetric 8+4 column layout | Brand studio mockup reference only — not implementing lead story split |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TYPO-01 | Phase 13 | Complete |
| TYPO-02 | Phase 13 | Complete |
| TYPO-03 | Phase 13 | Complete |
| TYPO-04 | Phase 13 | Complete |
| SPACE-01 | Phase 13 | Complete |
| SPACE-02 | Phase 13 | Complete |
| LAYOUT-01 | Phase 14 | Reverted |
| LAYOUT-02 | Phase 14 | Reverted |
| LAYOUT-03 | Phase 14 | Reverted |
| LAYOUT-04 | Phase 14 | Reverted |
| CONV-01 | Phase 15 | Complete |
| CONV-02 | Phase 15 | Complete |
| CONV-03 | Phase 15 | Complete |
| GDES-01 | Phase 16 | Complete |
| GDES-02 | Phase 16 | Complete |
| GDES-03 | Phase 16 | Complete |
| HDR-01 | Phase 16 | Complete |
| HDR-02 | Phase 16 | Complete |
| FIRM-01 | Phase 17 | Complete |
| FIRM-02 | Phase 17 | Complete |
| FIRM-03 | Phase 17 | Complete |
| FIRM-04 | Phase 17 | Complete |
| QUIZ-01 | Phase 18 | Complete |
| QUIZ-02 | Phase 18 | Complete |
| FDIR-01 | Phase 18 | Complete |
| CONV-04 | Phase 18 | Complete |
| CONV-05 | Phase 18 | Complete |
| POD-01 | Phase 19 | Complete |
| POD-02 | Phase 19 | Complete |
| POD-03 | Phase 19 | Complete |

**Coverage (v1.2):**
- v1.2 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

**Coverage (v1.3):**
- v1.3 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after v1.3 roadmap creation*
