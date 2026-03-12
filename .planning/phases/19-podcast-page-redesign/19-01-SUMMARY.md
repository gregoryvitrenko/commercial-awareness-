---
plan: 19-01
phase: 19-podcast-page-redesign
status: complete
completed: 2026-03-12
---

# Plan 19-01 Summary: Podcast Dark Hero + Briefing Notes

## What Was Built

**Task 1 — PodcastPlayer.tsx redesigned:**
- Replaced old `aspect-[4/3]` cover art div with a full-width `bg-stone-900` dark hero block
- Hero contains: `section-label` overline, large serif date headline (`font-serif text-3xl sm:text-4xl`), 28 static decorative waveform bars (`bg-white/20`), large white circle play/pause button, loading status
- Controls strip uses `bg-stone-950` with progress scrubber, timestamps, speed selector, stop, and download — all audio logic (state, refs, handlers, useEffect) completely preserved
- Briefing notes panel below hero: faded background numbers (`font-mono opacity-[0.06] text-6xl`), topic chips, serif story headlines, soundbite text — maps `briefing.stories[].talkingPoints.soundbite`

**Task 2 — app/podcast/page.tsx:**
- `max-w-2xl` → `max-w-3xl` for full editorial width
- Added archive link below PodcastPlayer

## Commits

- `136405a`: feat(19-01): redesign podcast hero as dark stone-900 block with waveform and briefing notes
- `5937bd7`: feat(19-01): update podcast page layout — max-w-3xl, archive link

## Requirements Covered

- POD-01 ✓ — Dark stone-900 immersive hero with waveform, play button, date badge
- POD-03 ✓ — Briefing notes with numbered talking points using font-mono opacity callout style

## Self-Check: PASSED

- TypeScript: clean (`npx tsc --noEmit` zero errors)
- All audio logic preserved (no regression risk)
- Stone palette throughout, no zinc, no rounded-xl
