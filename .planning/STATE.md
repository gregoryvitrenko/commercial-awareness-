---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Completed 21-01-PLAN.md
last_updated: "2026-03-12T22:27:21.713Z"
last_activity: 2026-03-12 — v2 roadmap written. v1.3 confirmed complete (phases 16-19).
progress:
  total_phases: 12
  completed_phases: 9
  total_plans: 18
  completed_plans: 16
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12)

**Core value:** Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.
**Current focus:** v2 Premium Experience — rounded aesthetic (rounded-3xl cards, rounded-full chrome, Oxford blue accent), secondary page redesigns, new /interview prep page

## Current Position

Phase: 20 — Design System Tokens (not started)
Plan: —
Status: Roadmap created, ready to plan Phase 20
Last activity: 2026-03-12 — v2 roadmap written. v1.3 confirmed complete (phases 16-19).

Progress: [░░░░░░░░░░] 0% (0/5 phases)

## v2 Phase Map

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 20 | Design System Tokens | ROUND-01, ROUND-02, COL-01 | Not started |
| 21 | Firms Directory Redesign | FDIR-01 | Not started |
| 22 | Secondary Page Redesigns | QUIZ-01, PRIM-01, TESTS-01, SAVED-01 | Not started |
| 23 | Events + Podcast Accent | EVENTS-01, POD-01 | Not started |
| 24 | Interview Prep Page | INTVW-01, INTVW-02, INTVW-03, INTVW-04 | Not started |

**Coverage:** 14/14 requirements mapped.

## Performance Metrics

**Velocity (carried from v1.3):**
- Total plans completed: 19 (across v1.0–v1.3)
- Average duration: ~30 min
- Total execution time: ~9.5 hours

*Updated after each plan completion*

## Accumulated Context

### Decisions

- v1.3: Paper background `#F9F7F2` warm cream — replaces cold bg-stone-50 sitewide
- v1.3: font-mono restored to `.section-label` — the v1.2 sweep was overcorrection; CSS variable bug is fixed
- v1.3: New logo committed (app/icon.svg, components/FolioLogo.tsx, components/Header.tsx)
- v1.3: Dark stone-900 CTA panel replaces amber CTA on upgrade page (was a spec exception in v1.2, now corrected)
- Phase 14 REVERTED — do not re-introduce lead story hierarchy or asymmetric layout
- [Phase 16-global-design-logo-header]: Dateline uses font-mono at 9px (below section-label 11px default)
- [Phase 16-global-design-logo-header]: Striped-F wordmark: olio span at -0.03em letter-spacing, tighter than tracking-tight per brand spec
- [Phase 18-02]: Dark stone-900 CTA panel on upgrade page — amber button removed
- [Phase 18-02]: font-serif at 15px for upgrade outcome titles — text-caption (12px) too small for Playfair Display
- [Phase 18-02]: Firms tier header: full-width 1px bg-stone-900 rule above tier name
- v2: Rounded aesthetic target — `rounded-3xl` (24px) card radius, `rounded-full`/`rounded-2xl` for chrome
- v2: Oxford blue `#002147` replaces amber as primary action/accent colour — CTA buttons, active states, hero accents
- v2: New `/interview` page uses existing firm pack interview questions + primer questions — no new AI generation needed
- v2: Story grid (home page) stays as flat 2-column — do not touch StoryCard or StoryGrid radius in Phase 20
- [Phase 20]: radius-card updated to 1.5rem (24px) — premium rounded-3xl aesthetic for cards
- [Phase 20]: oxford-blue #002147 registered as Tailwind colour token with light/dark variants
- [Phase 20]: Bookmark active state uses oxford-blue/30 border + oxford-blue/5 bg for visual legibility on light backgrounds
- [Phase 24-interview-prep-page]: Interview prep uses lib/interview-data.ts (dedicated 40+ question bank) not primer interviewQs — richer data structure with framework, keyPoints, tips, commonMistakes
- [Phase 23-events-podcast-accent]: Events city filter: Oxford blue pill tabs replace underline active state (bg-[#002147] text-white rounded-full)
- [Phase 23-events-podcast-accent]: Event card date accent: text-[#002147] dark:text-blue-300 font-medium for Oxford blue accent
- [Phase 23-events-podcast-accent]: Podcast hero: Oxford blue radial glow at 35% opacity (rgba(0,33,71,0.35)) as absolute z-0 layer, content above via z-10
- [Phase 21]: Search takes precedence over tier filter in FirmsDirectory — query active greyed-out tier buttons, all firms searched
- [Phase 21]: [Phase 21]: Jump link anchors removed from firms directory — sidebar tier filter tabs replace navigation

### Pending Todos

- Start Phase 20: plan the design token changes (tailwind.config, globals.css, and any component overrides needed for rounded-3xl cards and Oxford blue colour)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-12T22:27:14.994Z
Stopped at: Completed 21-01-PLAN.md
Resume file: None
Next action: `/gsd:plan-phase 20`
