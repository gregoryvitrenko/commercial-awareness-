---
phase: 13-typography-spacing
plan: 01
status: completed
files_modified:
  - tailwind.config.ts
  - components/StoryCard.tsx
  - components/StoryGrid.tsx
  - components/ArticleStory.tsx
---

# Plan 13-01 Summary: Typography & Spacing

## What was done

### Task 1: Type token updates + headline weight correction
- **tailwind.config.ts**: body token `0.9375rem` (15px) → `1rem` (16px), label token `0.625rem` (10px) → `0.6875rem` (11px), article token fontWeight `700` → `600`
- **StoryCard.tsx**: h2 `font-bold` → `font-semibold` (Playfair Display 700 → 600)
- **ArticleStory.tsx**: article headline weight now comes from updated token (600). Cleaned up `text-[16px]` → `text-body` on summary and legacy whyItMatters paragraphs.

### Task 2: Grid and card internal spacing
- **StoryGrid.tsx**: grid `gap-4` → `gap-6` (16px → 24px between cards)
- **StoryCard.tsx**: card outer padding `pt-5 pb-6` → `pt-6 pb-7`, category label `mb-3` → `mb-4`, headline `mb-3` → `mb-4`, teaser `mt-3 pt-3` → `mt-4 pt-4`, read more `mt-4` → `mt-5`

## Requirements covered
- TYPO-01: Serif headlines at semibold (600) weight
- TYPO-02: Article headlines at semibold via token
- TYPO-03: Label token bumped to 11px
- TYPO-04: Body token bumped to 16px
- SPACE-01: Grid gap increased to gap-6
- SPACE-02: Card internal spacing increased by +1 step

## Verification
- TypeScript: `npx tsc --noEmit` passes clean
- All token values confirmed in tailwind.config.ts
- StoryCard h2 confirmed `font-semibold`
- StoryGrid confirmed `gap-6`
