---
milestone: v2
milestone_name: Premium Experience
version: 1.0
status: active
created: 2026-03-12
---

# Requirements: v2 — Premium Experience

## Milestone Goal

Shift Folio from a sharp editorial newspaper aesthetic to a softer premium rounded aesthetic — update the design system (radius token, Oxford blue accent colour) sitewide, redesign secondary pages to match, and add a new `/interview` prep page using existing firm interview question data.

**Core Value:** Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.

---

## Requirements

### ROUND — Rounded Design System

- [x] **ROUND-01**: The `rounded-card` design token is updated to `rounded-3xl` (24px) — all cards, panels, and UI sections adopt the new rounded aesthetic sitewide
- [x] **ROUND-02**: Chrome elements (buttons, chips, inputs, tabs) use `rounded-full` or `rounded-2xl` — softened from the current sharp `rounded-chrome` (4px)

### COL — Colour

- [x] **COL-01**: Oxford blue (`#002147`) replaces amber as the primary action/accent colour — CTA buttons, active navigation states, hero section backgrounds, and featured card accents use Oxford blue across all pages

### FDIR — Firms Directory

- [ ] **FDIR-01**: The firms directory page uses a two-column layout — left sidebar with tier filter tabs and search input, right scrollable grid of rounded firm cards

### QUIZ — Quiz Page

- [ ] **QUIZ-01**: The quiz page shows a prominent "Today" hero card (current date, question count, Oxford blue start CTA) as the primary visual anchor above the date archive list

### PRIM — Primers Page

- [ ] **PRIM-01**: The primers page uses a card grid layout — each card shows a topic icon, title, short description, and interview question count per primer

### TESTS — Tests Page

- [ ] **TESTS-01**: The tests page shows Watson Glaser and SJT as two large feature cards with description, what the test assesses, and a start CTA — replacing the current list treatment

### SAVED — Saved Page

- [ ] **SAVED-01**: The saved/bookmarks page uses a card-based layout with rounded treatment and Oxford blue accents matching the new design system

### EVENTS — Events Page

- [ ] **EVENTS-01**: The events page card layout adopts the new rounded aesthetic and Oxford blue accent elements (active filter state, date highlight)

### POD — Podcast

- [ ] **POD-01**: The podcast hero player gains a subtle Oxford blue ambient glow/gradient background accent — elevating the existing two-column hero layout to a premium feel

### INTVW — Interview Prep Page

- [ ] **INTVW-01**: A new `/interview` page exists and is accessible from main navigation
- [ ] **INTVW-02**: The interview page aggregates questions from existing firm packs and primers, organised by topic/practice area (M&A, Banking & Finance, Capital Markets, etc.)
- [ ] **INTVW-03**: Each question has a reveal/hide toggle that shows the model answer on interaction
- [ ] **INTVW-04**: Users can filter questions by category — filtering to a topic shows only questions from that practice area

---

## Future Requirements (Deferred)

- Social proof — student count, testimonials, or credibility cues (live data when available)
- Trainee experience on firm profiles — "Culture & Experience" section per firm
- Firm interview packs: PDF export
- Briefing home page rounded aesthetic — the flat 2-column StoryGrid stays as-is (user prefers it)

## Out of Scope

- Multi-voice audio — multiplies ElevenLabs spend against 100k/month cap
- Native mobile app — web-first, no revenue to justify native yet
- New AI-generated interview content — `/interview` uses existing firm pack + primer data only (no new AI calls)
- Story grid layout changes — Phase 14 reverted; user prefers flat grid

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ROUND-01 | Phase 20 | Complete |
| ROUND-02 | Phase 20 | Complete |
| COL-01 | Phase 20 | Complete |
| FDIR-01 | Phase 21 | Pending |
| QUIZ-01 | Phase 22 | Pending |
| PRIM-01 | Phase 22 | Pending |
| TESTS-01 | Phase 22 | Pending |
| SAVED-01 | Phase 22 | Pending |
| EVENTS-01 | Phase 23 | Pending |
| POD-01 | Phase 23 | Pending |
| INTVW-01 | Phase 24 | Pending |
| INTVW-02 | Phase 24 | Pending |
| INTVW-03 | Phase 24 | Pending |
| INTVW-04 | Phase 24 | Pending |
