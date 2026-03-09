---
phase: 03-content-surfaces
plan: "03"
subsystem: ui

tags: [tailwind, design-tokens, hover-states, section-labels, briefing, header, story-grid]

# Dependency graph
requires:
  - phase: 01-design-tokens
    provides: text-caption, text-label, text-heading, .section-label CSS class tokens established in globals.css and tailwind.config
  - phase: 02-shell
    provides: Header.tsx shell component with FolioMark and h1 wordmark (had deferred hover:opacity fix)
provides:
  - BriefingView.tsx with all section labels migrated to .section-label class and text-caption/text-label/text-heading tokens
  - BriefingView.tsx and StoryGrid.tsx CTA buttons with semantic hover:bg-stone-700 dark:hover:bg-stone-300 background-shift hover
  - Header.tsx FolioMark and h1 with group-hover:text-stone-600 dark:group-hover:text-stone-400 colour-shift hover (Phase 2 deferral resolved)
  - Zero hover:opacity patterns in BriefingView.tsx, StoryGrid.tsx, Header.tsx
affects:
  - phase: 04-conversion (StoryCard.tsx CTA button hover pattern — same semantic hover convention now established across codebase)
  - phase: 05-utility (Any new pages using section labels should use .section-label class)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "section-label CSS class for all mono uppercase section headings (10px, font-mono, tracking-widest, stone-400)"
    - "text-label with explicit font-sans + tracking-[0.2em] for sans-serif divider labels (NOT .section-label)"
    - "hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors for all CTA buttons (background shift, not opacity)"
    - "group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors for logo/wordmark hover (colour shift, not opacity)"

key-files:
  created: []
  modified:
    - components/BriefingView.tsx
    - components/StoryGrid.tsx
    - components/Header.tsx

key-decisions:
  - "Bigger Picture divider label uses text-label + font-sans (NOT .section-label) — it is sans-serif with custom tracking-[0.2em], fundamentally different from mono section labels"
  - "Subscribe button text-[13px] intentionally kept — button text size was not in token migration scope, only hover pattern fixed"
  - "Footer dark override kept: dark:text-stone-600 more muted than .section-label default dark:stone-400"

patterns-established:
  - "Mono section labels: always .section-label class (replaces font-mono text-[10px]/text-[9px] tracking-widest uppercase text-stone-400)"
  - "Button hover: hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors (never hover:opacity)"
  - "Logo/wordmark hover: group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors (never group-hover:opacity)"

requirements-completed: [CONT-03, CONT-04, CONT-05]

# Metrics
duration: 3min
completed: 2026-03-09
---

# Phase 3 Plan 03: BriefingView Token Migration and Hover Fix Summary

**Eliminated all hover:opacity patterns from BriefingView, StoryGrid, and Header by migrating 5 section labels to .section-label class and replacing opacity-based hover with semantic background/colour-shift hover on CTA buttons and the logo**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-09T22:18:44Z
- **Completed:** 2026-03-09T22:21:55Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- BriefingView.tsx: migrated 5 mono section labels to .section-label, strapline/body to text-caption, feature chips to text-label, upgrade h3 to text-heading, Bigger Picture divider to text-label with font-sans
- All three files now have zero hover:opacity, transition-opacity, or opacity-75 patterns
- Header logo deferral from Phase 2 resolved: FolioMark and h1 now use group-hover colour-shift instead of opacity

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate BriefingView.tsx labels to tokens and fix upgrade button hover** - `82ce410` (feat)
2. **Task 2: Fix hover:opacity in StoryGrid MidGridNudge and Header logo** - `0be7549` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `components/BriefingView.tsx` - Token migration (section-label, text-caption, text-label, text-heading) + semantic hover on upgrade CTA
- `components/StoryGrid.tsx` - Semantic hover on MidGridNudge subscribe button
- `components/Header.tsx` - Semantic group-hover colour shift on FolioMark + h1 wordmark

## Decisions Made
- Bigger Picture divider uses `text-label` + explicit `font-sans` + `tracking-[0.2em]` (NOT `.section-label`) because it is sans-serif with distinct custom letter-spacing — mixing it into the mono label class would break the visual distinction
- Subscribe button text size `text-[13px]` kept unchanged — only the hover pattern was in scope, not the button text token migration
- Footer `dark:text-stone-600` override kept alongside `.section-label` — the class default is stone-400 in dark but the footer uses the more muted stone-600 intentionally

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing ESLint warning in `components/TestSession.tsx` (react-hooks/exhaustive-deps) appeared during lint — out of scope, pre-existing, logged and ignored per deviation scope boundary rules.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All hover:opacity patterns resolved in content surface components — CONT-04 fully satisfied
- Token migration in BriefingView complete — CONT-03 satisfied
- Phase 4 can proceed: StoryCard.tsx and upgrade flow components should adopt hover:bg-stone-700 dark:hover:bg-stone-300 pattern established here

---
*Phase: 03-content-surfaces*
*Completed: 2026-03-09*
