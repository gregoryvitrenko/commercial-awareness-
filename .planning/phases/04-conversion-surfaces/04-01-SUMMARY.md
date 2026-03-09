---
phase: 04-conversion-surfaces
plan: "01"
subsystem: ui
tags: [tailwind, stone-palette, typography-tokens, upgrade-page, conversion, social-proof]

# Dependency graph
requires:
  - phase: 03-content-surfaces
    provides: hover patterns (hover:bg-stone-700), text-article token, .section-label class, SiteFooter component
  - phase: 01-design-tokens
    provides: text-label, text-caption, text-article, rounded-card, rounded-chrome, bg-paper tokens
provides:
  - Upgrade page fully migrated to stone palette with design tokens
  - Outcome-framed PREMIUM_FEATURES copy (six strings)
  - Social proof block (count badge + testimonial) on upgrade page
  - SiteFooter rendered on upgrade page
affects: [05-utility-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Upgrade page uses stone palette throughout — no zinc"
    - "Social proof block placed between features card and free-tier note as direct siblings in max-w-md container"
    - "SiteFooter imported and rendered as last child of min-h-screen flex flex-col div, after </main>"

key-files:
  created: []
  modified:
    - app/upgrade/page.tsx

key-decisions:
  - "Social proof block uses placeholder copy with TODO comments — update with real count and testimonial when available"
  - "Logo hover on upgrade page: hover:text-stone-600 dark:hover:text-stone-400 transition-colors (matches Phase 3 pattern)"
  - "Free-tier note text uses text-label (10px) to keep it visually subordinate to feature items (text-caption 13px)"

patterns-established:
  - "Upgrade page: all content-area cards use rounded-card; CTA button uses rounded-chrome"
  - "CTA hover on dark-bg button: hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"

requirements-completed: [CONV-01, CONV-02, CONV-03]

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 4 Plan 01: Upgrade Page Migration Summary

**Upgrade page migrated from zinc palette to stone with design tokens, outcome-framed feature copy, and social proof block inserted before the free-tier note**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T23:01:36Z
- **Completed:** 2026-03-09T23:03:03Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- All 14 zinc-* class occurrences replaced with stone-* equivalents one-for-one
- All arbitrary text-[Npx] sizes replaced with named tokens (text-label, text-caption, text-article), preserving the logo's text-[22px] sm:text-[28px] responsive pair
- rounded-xl replaced with rounded-card (feature card, free-tier note) and rounded-chrome (CTA button)
- CTA hover updated from hover:opacity-80 to hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors
- PREMIUM_FEATURES rewritten with outcome-framed copy (leads with user benefit, not capability)
- Social proof block (count badge + blockquote testimonial) inserted between features card and free-tier note
- SiteFooter imported and rendered below </main>

## Task Commits

Each task was committed atomically:

1. **Task 1 + Task 2: Upgrade page full migration** - `dec3ec9` (feat)

**Plan metadata:** (final commit — see below)

## Files Created/Modified
- `app/upgrade/page.tsx` - Stone palette, design tokens, outcome copy, social proof block, SiteFooter

## Decisions Made
- Social proof block uses placeholder copy with TODO comments — update with real user count and testimonial when available
- Logo hover uses hover:text-stone-600 transition-colors pattern established in Phase 3 (not hover:opacity)
- Free-tier note text uses text-label (10px) to keep it visually subordinate to feature items at text-caption (13px)

## Deviations from Plan

None - plan executed exactly as written. Both tasks were implemented in a single file write for correctness, then committed together.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Upgrade page is visually continuous with the stone-palette briefing experience
- Social proof placeholder copy (200+ count, Bristol student testimonial) should be updated with real data when available
- Phase 4 Plan 02 can proceed (next conversion surface)

---
*Phase: 04-conversion-surfaces*
*Completed: 2026-03-09*
