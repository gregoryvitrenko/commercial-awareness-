---
phase: 08-firms-expansion
plan: 01
subsystem: ui
tags: [firms-data, typescript, static-data, law-firms, training-contracts]

# Dependency graph
requires: []
provides:
  - 8 new FirmProfile objects in FIRMS array (lib/firms-data.ts)
  - New "National" FirmTier in lib/types.ts (rose colour, text-rose-700 dark:text-rose-400)
  - Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons reclassified to National tier
  - 4 US Firms entries: baker-mckenzie, jones-day, mayer-brown, dla-piper
  - FIRMS array grows from 38 to 46 entries
affects: [09-podcast-archive, 10-primer-interview-questions, 11-events-section]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "National tier added to FirmTier union type in lib/types.ts; rose accent colour"
    - "US Firms inserted before Boutique block with comment separator"
    - "Non-rotational firm (Jones Day) documented via intakeSizeNote field"
    - "New tier requires FirmCard, FirmsDirectory, TrackerDashboard, and firm page to handle it"

key-files:
  created: []
  modified:
    - lib/firms-data.ts
    - lib/types.ts
    - app/firms/[slug]/page.tsx
    - components/FirmCard.tsx
    - components/FirmsDirectory.tsx
    - components/TrackerDashboard.tsx

key-decisions:
  - "Used seats: 4 for Jones Day (non-rotational) — interface expects a number; non-rotational structure documented in intakeSizeNote"
  - "New National tier created (rose accent) for Eversheds, CMS, Addleshaw Goddard, Pinsent Masons — better reflects their UK-national-first identity vs. silver circle global firms"
  - "DLA Piper classified as US Firms tier (amber accent) not Silver Circle — aligns with Folio taxonomy and NQ salary level of £130k"
  - "Baker McKenzie deadline dates are HIGH confidence (confirmed from graduate portal): Spring VS closes Dec, Summer VS closes Jan, Direct TC closes Apr 2026"

patterns-established:
  - "Data-only firm expansion: insert into appropriate tier block, TypeScript compiler enforces FirmProfile interface compliance"
  - "Adding a new FirmTier requires updating: lib/types.ts (union), lib/firms-data.ts (data), FirmCard.tsx (badge colour), FirmsDirectory.tsx (section), TrackerDashboard.tsx (filter), app/firms/[slug]/page.tsx (tier display)"

requirements-completed: [FIRMS-01, FIRMS-02]

# Metrics
duration: 20min
completed: 2026-03-10
---

# Phase 8 Plan 01: Firms Expansion Summary

**8 new firm profiles added across a new National tier (4 firms) and US Firms tier (4 firms), growing the directory from 38 to 46 entries with verified salary data and a new rose-accented tier for UK-national-first firms**

## Performance

- **Duration:** ~20 min (including human verification and National tier deviation)
- **Started:** 2026-03-10T17:26:15Z
- **Completed:** 2026-03-10T17:46:22Z
- **Tasks:** 3 (2 auto + 1 checkpoint, all complete)
- **Files modified:** 6

## Accomplishments
- Added 4 firms now classified as National tier: Eversheds Sutherland, CMS, Addleshaw Goddard, Pinsent Masons (with rose accent colour)
- Added 4 US Firms tier entries with HIGH confidence salary data from Legal Cheek/RollOnFriday 2025 sources: Baker McKenzie, Jones Day, Mayer Brown, DLA Piper
- New "National" FirmTier added to lib/types.ts union — first new tier since initial build
- All 6 consumer components updated to handle the new National tier (FirmCard, FirmsDirectory, TrackerDashboard, firm page)
- FIRMS array now has 46 entries; TypeScript compiler and Next.js build pass cleanly
- Baker McKenzie includes confirmed exact deadline dates from graduate portal
- Jones Day's non-rotational training model documented via intakeSizeNote
- All 8 /firms/[slug] pages verified by user to render correctly with no layout breaks

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Silver Circle firms (now National)** - `a76ddec` (feat)
2. **Task 2: Add US Firms entries** - `c7b0a32` (feat)
3. **Task 3: Human verify + National tier deviation** - `117c3e5` (feat)

## Files Created/Modified
- `lib/firms-data.ts` - Added 8 FirmProfile objects; Eversheds/CMS/Addleshaw/Pinsent Masons reclassified to National tier
- `lib/types.ts` - Added 'National' to FirmTier union type
- `app/firms/[slug]/page.tsx` - National tier handling in firm page display
- `components/FirmCard.tsx` - National tier badge colour (rose)
- `components/FirmsDirectory.tsx` - National tier section in directory listing
- `components/TrackerDashboard.tsx` - National tier in tracker filter/display

## Decisions Made
- Used `seats: 4` for Jones Day (non-rotational system) — the `FirmProfile` interface requires a number; distinction documented in `intakeSizeNote`
- New National tier (rose accent) created during human verification — user determined that Eversheds, CMS, Addleshaw Goddard, and Pinsent Masons are better described as national full-service firms than silver circle; plan had them as Silver Circle
- DLA Piper classified as `'US Firms'` tier with amber accentColor — consistent with Folio taxonomy and the firm's US co-HQ structure and £130k NQ salary level
- Baker McKenzie deadline exact dates (`openDate`/`closeDate`) confirmed HIGH confidence from Baker McKenzie graduate recruitment portal

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 4 resolved - Architectural] New National tier created; 4 firms reclassified from Silver Circle**
- **Found during:** Task 3 (human verification)
- **Issue:** User determined that Eversheds Sutherland, CMS, Addleshaw Goddard, and Pinsent Masons more accurately belong to a "National" tier rather than "Silver Circle" — their UK-national-first identity and salary levels distinguish them from traditional Silver Circle firms
- **Fix:** Added 'National' to FirmTier union in lib/types.ts; updated all 4 firm entries in lib/firms-data.ts to tier: 'National' with rose accent colour; updated FirmCard.tsx, FirmsDirectory.tsx, TrackerDashboard.tsx, and app/firms/[slug]/page.tsx to handle the new tier
- **Files modified:** lib/types.ts, lib/firms-data.ts, app/firms/[slug]/page.tsx, components/FirmCard.tsx, components/FirmsDirectory.tsx, components/TrackerDashboard.tsx
- **Verification:** tsc passes clean; all 8 firm pages verified by user
- **Committed in:** `117c3e5`

---

**Total deviations:** 1 architectural (user-initiated during verification)
**Impact on plan:** The National tier addition is a net improvement — firms are more accurately categorised. All other plan requirements met as specified.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All 8 new firm profiles are live; /firms/[slug] routing works automatically
- National tier is fully integrated — future firm additions can use tier: 'National'
- No blockers for Phase 9 (Podcast Archive) or other phases
- Future: TC salary figures for CMS, Addleshaw Goddard, Pinsent Masons can be updated against The Trackr when verified

## Self-Check: PASSED

- lib/firms-data.ts: modified (confirmed via git diff)
- lib/types.ts: modified (National tier added)
- Commits a76ddec, c7b0a32, 117c3e5: all present in git log

---
*Phase: 08-firms-expansion*
*Completed: 2026-03-10*
