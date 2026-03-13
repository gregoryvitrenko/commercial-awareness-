---
phase: 34
plan: 01
subsystem: tracker-ui
tags: [visual, redesign, table, badges]
dependency_graph:
  requires: []
  provides: [TrackerView updated heading/badge/table]
  affects: [app/tracker/page.tsx, components/TrackerView.tsx]
tech_stack:
  added: []
  patterns: [section-label utility, flex heading row, outlined badge variant]
key_files:
  modified:
    - components/TrackerView.tsx
decisions:
  - Applied/In Progress use border-only outlined badges; tinted backgrounds retained for Submitted/Interview/Offer/Rejected
  - Heading and Add button merged into single flex row (removed separate top-bar and application count)
  - Deadline format uses en-US locale to produce "Jan 15" ordering
metrics:
  duration: 5m
  completed: 2026-03-13
  tasks: 1
  files_modified: 1
---

# Phase 34 Plan 01: Tracker Page Redesign Summary

Restyled the tracker page heading and table to match the AI Studio mockup — flex heading row with serif title left and dark pill button right, .section-label column headers, per-status outlined/tinted badge variants, and compact date format.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Merge heading + Add button; update badge variants; fix table headers | 1ffe319 | components/TrackerView.tsx |

## Changes Made

**components/TrackerView.tsx:**
- Merged the separate heading block and top-bar into a single `flex items-end justify-between` row
- "+ Add Application" pill button (rounded-full, charcoal bg) now sits in the heading row, not below it
- Removed application count heading (`{entries.length} application{...}`)
- StatusBadge: Applied and In Progress now use border-only outlined styling; Submitted/Interview/Offer/Rejected retain tinted backgrounds
- Table `<th>` elements now use `.section-label` class instead of raw `font-mono text-[10px] uppercase tracking-widest`
- `formatDeadline`: now uses en-US locale with `{ month: 'short', day: 'numeric' }` to produce "Jan 15" format

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- components/TrackerView.tsx: modified and committed (1ffe319)
- TypeScript: clean (0 errors)
