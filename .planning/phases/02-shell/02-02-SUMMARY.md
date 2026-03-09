---
phase: 02-shell
plan: "02"
subsystem: ui
tags: [footer, layout, tailwind, sticky-footer, design-tokens]

# Dependency graph
requires:
  - phase: 01-design-tokens
    provides: text-label token used in footer typography
provides:
  - Five-link SiteFooter (Feedback, Terms, Privacy, Contact, LinkedIn) with token-compliant typography
  - Sticky-footer layout via flex flex-col on body + main flex-1 wrapper in layout.tsx
affects: [03-homepage, 04-paywall, all page routes (footer appears globally)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sticky footer: body flex flex-col + main flex-1 + footer mt-auto"
    - "text-label token replaces text-[10px] arbitrary value in all footer typography"

key-files:
  created: []
  modified:
    - components/SiteFooter.tsx
    - app/layout.tsx

key-decisions:
  - "Feedback and Contact both use mailto:hello@folioapp.co.uk without target=_blank (mailto opens native email client)"
  - "LinkedIn uses target=_blank + rel=noopener noreferrer (external URL, opens new tab)"
  - "Link order locked: Feedback · Terms · Privacy · Contact · LinkedIn"
  - "Children wrapped in <main className=flex-1> inside Providers — not passing className to Providers (client component)"

patterns-established:
  - "Footer link pattern: font-mono text-label text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"

requirements-completed:
  - SHELL-02

# Metrics
duration: 3min
completed: 2026-03-09
---

# Phase 02 Plan 02: Site Footer and Sticky Layout Summary

**Five-link footer with text-label token typography pinned to viewport bottom via flex flex-col body + main flex-1 layout pattern**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-09T21:46:19Z
- **Completed:** 2026-03-09T21:48:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added Feedback (mailto) and LinkedIn (target="_blank") links completing all five required footer links
- Migrated all `text-[10px]` arbitrary values to `text-label` design token across footer
- Fixed sticky-footer layout: `flex flex-col` on body + `<main className="flex-1">` wrapper makes `mt-auto` on footer effective on short pages
- Build passes cleanly after removing stale `.next` artifacts (zero TypeScript errors)

## Task Commits

Each task was committed atomically:

1. **Task 1: Complete SiteFooter.tsx with all five links and text-label tokens** - `9976e35` (feat)
2. **Task 2: Fix sticky-footer layout in app/layout.tsx** - `906f60a` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified
- `components/SiteFooter.tsx` - Rewrote nav with five links in order: Feedback, Terms, Privacy, Contact, LinkedIn; migrated all text-[10px] to text-label token
- `app/layout.tsx` - Added `flex flex-col` to body, wrapped `{children}` in `<main className="flex-1">` inside Providers

## Decisions Made
- Feedback and Contact both point to `mailto:hello@folioapp.co.uk` without `target="_blank"` — mailto links use native browser/OS behavior, forcing a new tab would be wrong
- LinkedIn uses `target="_blank" rel="noopener noreferrer"` — external URL, correct to open new tab
- Link order is locked: Feedback · Terms · Privacy · Contact · LinkedIn
- `<main className="flex-1">` placed inside Providers (not passing className to Providers since it's a client component that doesn't forward it)

## Deviations from Plan

None - plan executed exactly as written.

One issue encountered during verification: `npm run build` failed on first attempt with `ENOENT: .next/server/pages-manifest.json`. This was a stale build artifact from a prior interrupted build, not caused by the changes. Resolved by removing `.next/` and rebuilding — build passed cleanly.

## Issues Encountered
- Stale `.next/` build directory caused `ENOENT pages-manifest.json` on first build attempt. Cleared with `rm -rf .next` and rebuilt successfully.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Footer is complete and appears on all pages via layout.tsx
- Sticky footer layout is in place and will work correctly on all short pages
- Phase 3 (homepage) can proceed — footer and layout foundation is stable

---
*Phase: 02-shell*
*Completed: 2026-03-09*
