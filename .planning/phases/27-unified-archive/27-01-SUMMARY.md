---
phase: 27-unified-archive
plan: 01
subsystem: archive
tags: [archive, navigation, ui, ux]
dependency_graph:
  requires: []
  provides: [unified-archive-page]
  affects: [nav-dropdown, mobile-drawer]
tech_stack:
  added: []
  patterns: [parallel-data-fetch, anchor-links, v3-heading-block]
key_files:
  created: []
  modified:
    - app/archive/page.tsx
    - components/NavDropdowns.tsx
    - components/Header.tsx
decisions:
  - "Used parallel Promise.all for all three data sources to minimise load time"
  - "Filtered podcast entries to hasAudio === true before rendering — no broken links"
  - "Capped each column at 30 entries with .slice(0, 30) for scannability"
  - "lib/podcast-storage.ts already exported listPodcastDatesWithStatus — no deviation needed"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-12"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
---

# Phase 27 Plan 01: Unified Archive Summary

**One-liner:** Rebuilt /archive as a unified 3-column page (Briefings, Quizzes, Podcasts) with v3 heading pattern and anchor-linked nav items.

## What Was Built

Replaced the old single-column month-grouped briefings archive with a unified 3-column page that consolidates all historical content. The page fetches all three data sources in parallel and renders them side-by-side on md+ breakpoints (single column on mobile).

Updated both the desktop nav dropdown (NavDropdowns.tsx) and the mobile drawer (Header.tsx) to link directly to column anchors (`/archive#briefings`, `/archive#podcasts`, `/archive#quizzes`) rather than separate archive routes.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rebuild /archive as unified 3-column page | 9550531 | app/archive/page.tsx |
| 2 | Update nav dropdown and mobile drawer anchor links | 9550531 | components/NavDropdowns.tsx, components/Header.tsx |

## Key Decisions

- **Parallel data fetch** — `Promise.all([listBriefings(), listQuizDates(), listPodcastDatesWithStatus()])` keeps load time minimal.
- **Podcast filter** — only entries with `hasAudio === true` are shown, preventing broken audio links.
- **30-entry cap** — `.slice(0, 30)` per column keeps the page scannable without pagination complexity.
- **Local date helpers** — `formatColumnDate` and `formatLongDate` are defined in the file rather than imported, matching the plan spec and keeping the page self-contained.

## Deviations from Plan

None — plan executed exactly as written. `lib/podcast-storage.ts` existed and exported `listPodcastDatesWithStatus` as specified in the interfaces block.

## Self-Check

- [x] `app/archive/page.tsx` exists with three `id` anchors (briefings, quizzes, podcasts)
- [x] `components/NavDropdowns.tsx` Archive group hrefs use `/archive#briefings`, `/archive#podcasts`, `/archive#quizzes`
- [x] `components/Header.tsx` MOBILE_NAV_LINKS Archive items use the same anchor hrefs
- [x] TypeScript: `npx tsc --noEmit` — zero errors
- [x] Commit 9550531 exists
