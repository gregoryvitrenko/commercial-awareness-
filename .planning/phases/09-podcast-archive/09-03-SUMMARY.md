# Plan 09-03 Summary: Cron MP3 Pre-generation

**Status:** Complete
**Tasks:** 2/2
**Completed:** 2026-03-10

## What Was Built

Extracted ElevenLabs TTS logic into a shared helper `lib/podcast-audio.ts`, wired it into the 06:00 UTC cron, and refactored the API route to use the same helper — eliminating ~60 lines of duplication.

## Key Files

### Created
- `lib/podcast-audio.ts` — `generateAndCachePodcastAudio(date, voiceId?)`: cache-first (returns Blob URL immediately if exists, no charge), budget guard via `hasCapacity()`, ElevenLabs call, saves to Blob

### Modified
- `app/api/generate/route.ts` — chains `.then(() => generateAndCachePodcastAudio(briefing.date))` off `generateAndSavePodcastScript` (fire-and-forget, `.catch()` prevents cron failure)
- `app/api/podcast-audio/route.ts` — replaced ~60-line inline ElevenLabs block with single `generateAndCachePodcastAudio` call; removed `hasCapacity`, `recordUsage`, `getMonthlyUsage`, `saveAudio`, `getCachedScript`, `sanitizeUpstreamError` imports

## Commits
- `48755bf` — create lib/podcast-audio.ts shared ElevenLabs generation helper
- `4be9244` — refactor podcast-audio route to use shared helper
- `70b37ee` — wire MP3 pre-generation into cron

## Deviations
None. Plan executed as designed. The fire-and-forget chain uses the exact pattern from the plan (`.then().catch()` off `generateAndSavePodcastScript`).

## Self-Check: PASSED
