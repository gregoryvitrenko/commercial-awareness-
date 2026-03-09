---
phase: 03-content-surfaces
plan: "01"
subsystem: ui

tags: [tailwind, storycard, typography, design-tokens, hover-states]

# Dependency graph
requires:
  - phase: 01-design-tokens
    provides: fontSize token system (display, heading, subheading, body, caption, label) in tailwind.config.ts
  - phase: 02-shell
    provides: bg-paper token, established token migration patterns

provides:
  - text-article fontSize token (1.75rem/28px, fontWeight 700) in tailwind.config.ts
  - StoryCard.tsx fully migrated to named type scale tokens with no arbitrary text-[Npx] sizes
  - Semantic border hover state on StoryCard article element

affects:
  - 03-02 (ArticleStory component — needs text-article token added here)
  - Any component referencing StoryCard layout or token patterns

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Token migration: replace all text-[Npx] arbitrary sizes with named tokens; keep font-bold explicitly when token fontWeight is lighter"
    - "Border hover state added alongside bg hover for richer tactile response: hover:border-stone-300 dark:hover:border-stone-600"
    - "Responsive font size pairs removed (text-[19px] sm:text-[21px]) replaced by single non-responsive token"
    - "topic labels: text-label with explicit tracking-[0.12em] (NOT .section-label — different font family)"

key-files:
  created: []
  modified:
    - tailwind.config.ts
    - components/StoryCard.tsx

key-decisions:
  - "text-article token placed after label entry in fontSize.extend block at 1.75rem/1.2lh/700fw — needed by 03-02"
  - "StoryCard headline uses text-subheading + font-bold: subheading token is fontWeight 500, card headlines must remain 700"
  - "topic labels use text-label + explicit tracking-[0.12em], NOT .section-label (mono class with tracking-widest incompatible)"
  - "Border hover (hover:border-stone-300) added alongside bg hover — improves card tactile feel without opacity tricks"

patterns-established:
  - "Token migration: arbitrary px sizes out, semantic tokens in — one token per element, no responsive pairs for StoryCard headlines"
  - "Hover: transition-colors with both bg and border shift; no hover:opacity"

requirements-completed: [CONT-01, CONT-04, CONT-05]

# Metrics
duration: 3min
completed: 2026-03-09
---

# Phase 3 Plan 01: StoryCard Token Migration Summary

**text-article token added to Tailwind config (1.75rem/28px) and all StoryCard.tsx arbitrary font sizes replaced with named semantic tokens plus border hover state**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-09T22:18:41Z
- **Completed:** 2026-03-09T22:22:06Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `text-article` fontSize token (1.75rem, lh 1.2, fw 700) to `tailwind.config.ts` — ready for 03-02 ArticleStory
- Migrated all 7 arbitrary `text-[Npx]` sizes in `StoryCard.tsx` to named tokens: `text-subheading`, `text-caption`, `text-label`
- Added `hover:border-stone-300 dark:hover:border-stone-600` to article element for semantic border hover alongside existing bg hover
- Removed responsive headline pair `text-[19px] sm:text-[21px]` — replaced with single `text-subheading font-bold`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add text-article token to tailwind.config.ts** - `365f535` (feat)
2. **Task 2: Migrate StoryCard.tsx to design tokens with semantic hover** - `a0065c8` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `tailwind.config.ts` — Added `article: ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }]` entry after `label` in fontSize.extend block
- `components/StoryCard.tsx` — Replaced 7 arbitrary text sizes with tokens; added border hover; removed responsive font-size breakpoint pair

## Decisions Made

- `text-subheading font-bold` on h2: subheading token is fontWeight 500, but card headlines must stay 700 — explicit `font-bold` retained
- `text-label` with explicit `tracking-[0.12em]` on topic labels (not `.section-label` which is font-mono with tracking-widest)
- Border hover added: `hover:border-stone-300 dark:hover:border-stone-600` — complements bg shift without opacity

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Build produced one benign ENOENT trace for `.next/server/app/api/bookmarks/route.js.nft.json` — pre-existing, unrelated to changes. Compilation succeeded cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `text-article` token is available for plan 03-02 (ArticleStory component)
- StoryCard.tsx token migration complete — CONT-01, CONT-04, CONT-05 fulfilled
- Phase 3 risk note: typography changes on the 8-story homepage grid should be verified at 375px viewport on live site

---
*Phase: 03-content-surfaces*
*Completed: 2026-03-09*
