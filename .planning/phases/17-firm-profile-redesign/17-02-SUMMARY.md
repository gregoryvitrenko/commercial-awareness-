---
plan: 17-02
phase: 17-firm-profile-redesign
status: complete
completed: 2026-03-12
---

# Plan 17-02 Summary: WhyThisFirmCallout + Dark Interview Focus

## What Was Built

**Task 1 — WhyThisFirmCallout component:**
- New inline component replacing the generic SectionCard for "Why This Firm?" section
- `bg-stone-50 dark:bg-stone-900/50` background — visually distinct from white SectionCards
- Each point rendered as a `relative overflow-hidden` row with `py-4 border-b last:border-0` dividers
- Large faint background number: `absolute right-0 font-mono text-[72px] opacity-[0.05]` — watermark treatment
- Small foreground number in `.section-label` + tier colour, followed by `text-[15px]` bullet text

**Task 2 — Dark Interview Focus block:**
- Replaced SectionCard + amber border-l with `bg-stone-900 dark:bg-stone-950 border border-stone-800` block
- Icon in `text-stone-500`, label as `section-label text-stone-400`, text as `text-stone-100`
- Page now has three visually distinct section treatments: standard SectionCard, dark block, editorial callout

## Commits

- `18ad02c`: feat(17-02): WhyThisFirmCallout editorial numbered callouts, dark Interview Focus block

## Requirements Covered

- FIRM-02 ✓ — Firm profile content sections use visually differentiated treatments
- FIRM-03 ✓ — "Why This Firm?" section uses editorial numbered callout style with large background numbers

## Self-Check: PASSED

- TypeScript: clean (`npx tsc --noEmit` zero errors)
- Three distinct section types: SectionCard (white bg, left accent), dark block (stone-900), callout (stone-50 bg + background numbers)
- Stone palette throughout, no zinc, no rounded-xl
