# Plan 09-02 Summary: Podcast Archive Fix

**Status:** Complete
**Tasks:** 2/2
**Completed:** 2026-03-10

## What Was Built

Added `listPodcastDatesWithStatus()` to `lib/podcast-storage.ts` — unions Blob-listed MP3 dates with Redis `podcast-script:*` scan in a single pass, returning `{date, hasAudio}[]`. Updated the archive page to consume it and show a conditional play button.

## Key Files

### Modified
- `lib/podcast-storage.ts` — new `listPodcastDatesWithStatus()` export: Blob list pass (sets `hasAudio: true`) + Redis scan pass (sets `hasAudio: false` for script-only dates); sorted descending; Upstash cursor coerced with `Number()`
- `app/podcast/archive/page.tsx` — imports `listPodcastDatesWithStatus`; `groupByMonth` accepts `{date, hasAudio}[]`; playable rows render as `<Link>`, script-only rows render as non-clickable `<div>` with "No audio" label

## Commits
- `d4fff16` — add listPodcastDatesWithStatus() to podcast-storage
- `bb6a6c7` — update podcast archive page to use listPodcastDatesWithStatus, conditional play button

## Deviations
None. Plan executed as designed.

## Self-Check: PASSED
