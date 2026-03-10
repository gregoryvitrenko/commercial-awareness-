---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Completed 05-utility-pages-analytics-01-PLAN.md
last_updated: "2026-03-09T23:59:53.425Z"
last_activity: 2026-03-09 — Roadmap created; 21 v1 requirements mapped across 5 phases
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 13
  completed_plans: 12
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09)

**Core value:** Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.
**Current focus:** Phase 1 — Design Tokens

## Current Position

Phase: 1 of 5 (Design Tokens)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-09 — Roadmap created; 21 v1 requirements mapped across 5 phases

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: none yet
- Trend: -

*Updated after each plan completion*
| Phase 01-design-tokens P01 | 4 | 5 tasks | 2 files |
| Phase 02-shell P01 | 2 | 2 tasks | 2 files |
| Phase 02-shell P02 | 3 | 2 tasks | 2 files |
| Phase 03-content-surfaces P03 | 3 | 2 tasks | 3 files |
| Phase 03-content-surfaces P01 | 3 | 2 tasks | 2 files |
| Phase 03-content-surfaces P02 | 2 | 1 tasks | 1 files |
| Phase 04-conversion-surfaces P02 | 2 | 1 tasks | 1 files |
| Phase 04-conversion-surfaces P01 | 2 | 2 tasks | 1 files |
| Phase 04-conversion-surfaces P03 | 5 | 1 tasks | 0 files |
| Phase 05-utility-pages-analytics P02 | 2 | 2 tasks | 3 files |
| Phase 05-utility-pages-analytics P03 | 2 | 2 tasks | 4 files |
| Phase 05-utility-pages-analytics P01 | 6 | 3 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Coarse granularity applied — 5 phases retained despite coarse setting because dependency order is a hard constraint (tokens before components before pages)
- Roadmap: Analytics (ANLYT-01, ANLYT-02) grouped with utility pages in Phase 5 — both are "apply and verify" tasks that share the same deployment window
- [Phase 01-design-tokens]: Reduced --radius from 0.5rem to 0.25rem for flat editorial feel; rounded-sm now ~0px intentionally
- [Phase 01-design-tokens]: Used theme.extend.fontSize to preserve all Tailwind default text-* sizes
- [Phase 01-design-tokens]: Radius tokens use direct values not calc chains for predictability
- [Phase 02-shell]: bg-paper replaces all bg-stone-50 dark:bg-stone-950 pairs in shell components — single dark-aware token
- [Phase 02-shell]: text-display used for wordmark h1, removing responsive breakpoint font-size pair and redundant font-bold
- [Phase 02-shell]: text-label used for all 10-11px mono/sans labels in header and nav triggers, bundling size and letterSpacing
- [Phase 02-shell]: Sticky footer: body flex flex-col + main flex-1 + footer mt-auto pattern established
- [Phase 02-shell]: Footer link order locked: Feedback · Terms · Privacy · Contact · LinkedIn; mailto links no target=_blank, LinkedIn target=_blank
- [Phase 03-content-surfaces]: Bigger Picture divider uses text-label + font-sans (NOT .section-label) — sans-serif with custom tracking-[0.2em], distinct from mono section labels
- [Phase 03-content-surfaces]: Button hover: hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors established as the codebase standard (never hover:opacity)
- [Phase 03-content-surfaces]: Logo/wordmark hover: group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors (colour-shift, not opacity) — resolves Phase 2 deferral
- [Phase 03-content-surfaces]: text-article token (1.75rem/28px) added to tailwind.config.ts for ArticleStory component in 03-02
- [Phase 03-content-surfaces]: StoryCard: text-subheading + font-bold for headlines (subheading token is 500fw, card headlines must be 700fw)
- [Phase 03-content-surfaces]: StoryCard topic labels: text-label + explicit tracking-[0.12em], NOT .section-label (font-mono incompatible)
- [Phase 03-content-surfaces]: Border hover added to StoryCard: hover:border-stone-300 dark:hover:border-stone-600 alongside bg shift
- [Phase 03-content-surfaces]: text-article token (28px) replaces responsive headline pair in ArticleStory; text-[16px] locked for summary/legacy body; font-semibold kept explicitly on soundbite (subheading token is 500fw)
- [Phase 04-conversion-surfaces]: LandingHero CTA hover: hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors (not hover:opacity) — consistent with Phase 3 standard
- [Phase 04-conversion-surfaces]: Hero headline text-3xl sm:text-4xl left unchanged — no clean single-token mapping for the 30/36px responsive pair
- [Phase 04-conversion-surfaces]: Social proof block uses placeholder copy with TODO comments — update with real count and testimonial when available
- [Phase 04-conversion-surfaces]: Free-tier note text uses text-label (10px) to keep it visually subordinate to feature items at text-caption (13px)
- [Phase 04-conversion-surfaces]: Phase 4 verification plan (04-03): verification-only checkpoint, no code changes — all five production checks passed confirming stone palette, social proof, flat radius, and Stripe checkout
- [Phase 05-utility-pages-analytics]: Firms page heading uses text-subheading font-bold (not text-lg) to match heading token system
- [Phase 05-utility-pages-analytics]: Firms count badge uses section-label component class instead of repeating inline mono/label classes
- [Phase 05-utility-pages-analytics]: Analytics placed outside Providers to avoid unnecessary re-render scope on provider state changes
- [Phase 05-utility-pages-analytics]: checkout_click fires before the fetch() call so it records intent even if Stripe checkout fails
- [Phase 05-utility-pages-analytics]: sign-up page converted to client component directly (Approach A) — SignUp from Clerk already works in client component files
- [Phase 05-utility-pages-analytics]: QuizInterface hover tint overlay preserved — opacity-0 group-hover:opacity-100 on pointer-events-none divs is a CSS decoration layer, not the hover:opacity-* button pattern
- [Phase 05-utility-pages-analytics]: rounded-2xl on streak/deep practice mode-selector cards preserved — marketing-style feature cards distinct from editorial content containers using rounded-card

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3 risk: Typography changes on the 8-story homepage grid must be tested at 375px after every change — mobile is 60-70% of student traffic
- Phase 4 risk: Any deploy touching `/upgrade` or `StoryCard.tsx` requires end-to-end Stripe checkout smoke test in incognito
- Phase 5 dependency: Vercel Analytics install (ANLYT-01) must precede conversion event tracking (ANLYT-02)
- Known issue: `app/api/generate/route.ts:16` has hardcoded fallback ADMIN_USER_ID — unrelated to this milestone but should be cleaned up

## Session Continuity

Last session: 2026-03-09T23:59:53.420Z
Stopped at: Completed 05-utility-pages-analytics-01-PLAN.md
Resume file: None
