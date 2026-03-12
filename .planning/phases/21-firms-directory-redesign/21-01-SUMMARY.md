---
phase: 21-firms-directory-redesign
plan: 01
subsystem: ui
tags: [react, tailwind, firms, filter, sidebar, oxford-blue, rounded-card]

# Dependency graph
requires:
  - phase: 20-design-system-tokens
    provides: rounded-card (24px), rounded-chrome, oxford-blue colour token — used for active tier button bg and card radius
provides:
  - Two-column firms directory with sticky sidebar tier filter and real-time search
  - FirmCard with v2 design tokens (rounded-card, rounded-chrome pills, Oxford blue accents)
affects: [22-secondary-page-redesigns, any page using FirmCard or FirmsDirectory]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Search-over-filter precedence: when search query is non-empty, tier filter is bypassed entirely"
    - "Responsive sidebar: lg:flex-col vertical list on desktop, flex overflow-x-auto horizontal row on mobile"
    - "Oxford blue active state: bg-oxford-blue text-white for selected tier tab"

key-files:
  created: []
  modified:
    - components/FirmsDirectory.tsx
    - components/FirmCard.tsx

key-decisions:
  - "Search takes precedence over tier filter — if query is non-empty, all tiers are searched and tier buttons are greyed out"
  - "Jump link anchors removed — sidebar tier filter tabs replace them, providing instant client-side filtering"
  - "FirmCard rounded-card already applied in Phase 22 commit (12ee686) — no separate commit needed for Task 2"

patterns-established:
  - "Sidebar filter pattern: w-52 sticky top-24 on desktop, horizontal scroll tabs on mobile"
  - "Oxford blue for active filter state: bg-oxford-blue text-white"

requirements-completed: [FDIR-01]

# Metrics
duration: 15min
completed: 2026-03-12
---

# Phase 21 Plan 01: Firms Directory Redesign Summary

**Two-column firms directory: sticky sidebar with tier filter tabs + real-time search, FirmCard updated with rounded-card radius and Oxford blue interaction accents**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-12T22:30:00Z
- **Completed:** 2026-03-12T22:45:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- FirmsDirectory redesigned as two-column layout: sticky left sidebar (w-52) with tier filter tabs and search input, scrollable right grid
- Tier filter tabs: clicking a tier instantly filters the right grid to that tier only; "All" resets; each tab shows firm count badge
- Search takes precedence over tier filter — when typing, tier buttons grey out and all firms are searched
- Mobile layout: horizontal scrolling tab row above the grid (responsive via lg:flex-col)
- Jump link anchors removed — sidebar tabs replace them
- FirmCard updated with rounded-card (24px), rounded-chrome pills, Oxford blue chevron hover, Oxford blue underline accent

## Task Commits

Each task was committed atomically:

1. **Task 1: Redesign FirmsDirectory with two-column sidebar layout and tier filter state** - `3c3d31c` (feat)
2. **Task 2: Update FirmCard with rounded-card radius and Oxford blue chevron accent** - Already applied in `12ee686` (Phase 22 commit included FirmCard updates — no separate commit needed)

## Files Created/Modified
- `components/FirmsDirectory.tsx` - Two-column layout with sticky sidebar, tier filter state (activeTier), search-over-filter priority, mobile horizontal tab row
- `components/FirmCard.tsx` - rounded-card container, rounded-chrome pills, decoration-oxford-blue/40 underline, group-hover:text-oxford-blue chevron

## Decisions Made
- Search takes precedence over tier filter with visual greying of tier buttons when search is active
- Jump link anchors (`id="tier-magic-circle"` etc.) removed since sidebar tabs now serve the same navigation purpose
- FirmCard changes were already committed as part of Phase 22 execution (12ee686) — confirmed changes match plan spec exactly

## Deviations from Plan

None - plan executed as specified. FirmCard Task 2 changes were pre-applied in a prior phase commit and verified to match the plan spec exactly.

## Issues Encountered
- git stash pop conflict with uncommitted PrimerCard.tsx changes — resolved by checking out FirmCard specifically from stash (`git checkout stash@{0} -- components/FirmCard.tsx`)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Firms directory two-column layout ready for use
- FirmCard v2 tokens in place
- Phase 22 secondary page redesigns can proceed (if not already complete)

---
*Phase: 21-firms-directory-redesign*
*Completed: 2026-03-12*
