---
gsd_state_version: 1.0
milestone: v3.2
milestone_name: Mockup Alignment
status: completed
stopped_at: Completed 32-02 (SiteFooter three-zone redesign)
last_updated: "2026-03-13T13:46:20.602Z"
last_activity: 2026-03-13 — Phase 32 plan 02 executed (SiteFooter three-zone redesign)
progress:
  total_phases: 25
  completed_phases: 17
  total_plans: 31
  completed_plans: 34
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12)

**Core value:** Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.
**Current focus:** v3 Design Refresh & Features — roadmap complete, ready to execute

## Current Position

Phase: 32 — Header + Footer (in progress)
Plan: 32-02 (last completed)
Status: Phase 32 plan 02 complete — SiteFooter redesigned to three-zone layout. Plan 32-01 (header restructure) is separate.
Last activity: 2026-03-13 — Phase 32 plan 02 executed (SiteFooter three-zone redesign)

## v3 Phase Map

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 25 | Accent + Global Headings | DESIGN-01, DESIGN-02 | COMPLETE |
| 26 | Home Newspaper Layout | HOME-01, HOME-02 | COMPLETE |
| 27 | Unified Archive | ARCH-01, ARCH-02, ARCH-03, ARCH-04 | COMPLETE |
| 28 | Quiz + Podcast Heroes & Format | POD-01, QUIZ-01, QUIZ-02, QUIZ-03 | COMPLETE |
| 29 | Quiz Gamification | QUIZ-04, QUIZ-05, QUIZ-06 | COMPLETE |
| 30 | Application Tracker | TRKR-01, TRKR-02, TRKR-03, TRKR-04, TRKR-05 | COMPLETE |

**Wave structure:**
- Wave 1: Phase 25 (colour + heading tokens — everything depends on this)
- Wave 2: Phases 26, 27, 28, 30 (all parallel — independent pages/features)
- Wave 3: Phase 29 (quiz gamification — depends on Phase 28 quiz UI)

## Accumulated Context

### Decisions (carried from v2)

- v1.3: Paper background `#F9F7F2` warm cream — replaces cold bg-stone-50 sitewide
- v1.3: font-mono restored to `.section-label` — the v1.2 sweep was overcorrection; CSS variable bug is fixed
- v1.3: New logo committed (app/icon.svg, components/FolioLogo.tsx, components/Header.tsx)
- Phase 14 REVERTED (v1.2) — do not re-introduce lead story hierarchy or asymmetric layout — **BUT Phase 26 (v3) introduces newspaper layout the correct way per AI Studio mockup; this supersedes the Phase 14 note**
- [Phase 20]: radius-card updated to 1.5rem (24px) — premium rounded-3xl aesthetic for cards
- [Phase 20]: oxford-blue #002147 registered as Tailwind colour token — **to be replaced in v3 by charcoal #2D3436**
- [Phase 21]: Search takes precedence over tier filter in FirmsDirectory
- [Phase 22]: interviewQs (not interviewQuestions) is the correct Primer interface field name
- [Phase 24]: Interview prep uses lib/interview-data.ts (dedicated 40+ question bank)

### v3 Design Decisions

- Accent colour: charcoal `#2D3436` (AI Studio mockup palette) replaces oxford blue `#002147`
- Background: `#F9F7F2` paper (unchanged)
- Ink: `#1A1A1A` (near-black, unchanged)
- Heading pattern: `text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40` overline + large `font-serif` title
- Home page: newspaper layout per AI Studio mockup — lead story (lg:col-span-8) + sidebar (lg:col-span-4), NOT the Phase 14 approach
- Archive: unified 3-column page at /archive — Briefings | Quizzes | Podcasts
- Quiz format: 8 daily questions (1/topic) + deep practice sets per area
- Gamification: XP 100/level, Redis keys `quiz:xp:{userId}`, `quiz:level:{userId}`, `quiz:streak:{userId}` + `quiz:last-completed:{userId}`

### Decisions (Phase 25)

- [Phase 25]: charcoal (#2D3436) registered as named Tailwind token replacing oxford-blue (#002147) — all CTAs, active states, hero backgrounds now use charcoal
- [Phase 25]: v3 heading pattern applied to 9 pages — space-y-4 mb-12 block with tracking-[0.3em] overline + text-5xl font-serif title + opacity-60 description

### Decisions (Phase 31)

- [Phase 31-01]: POLISH-05: Removed colored dot spans from TabBar and interview practice area grid — tabs show clean uppercase text only with active underline border
- [Phase 31-01]: POLISH-03: text-center + max-w-xl removal applied to heading blocks on primers, tests, interview, quiz practice pages
- [Phase 31-04]: POLISH-02: Editorial masthead added to BriefingView above StoryGrid — issue number calculated from days since 2026-03-01 launch date
- [Phase 31-04]: POLISH-06: FirmQuiz IntroScreen already centers heading via text-center wrapper — no change needed to firm-fit/page.tsx

### Decisions (Phase 32)

- [Phase 32-02]: SHELL-02: SiteFooter redesigned to three-zone layout (FolioMark left, copyright center, Legal/Privacy/Contact right); bg-paper replaces bg-stone-50; Feedback and LinkedIn links removed

### Pending Todos

None — Phase 25 complete, ready to execute Phase 26.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-13
Stopped at: Completed 32-02 (SiteFooter three-zone redesign)
Resume file: None
Next action: Phase 32 plan 02 complete — SHELL-02 satisfied. Phase 32 plan 01 (header restructure) still pending.
