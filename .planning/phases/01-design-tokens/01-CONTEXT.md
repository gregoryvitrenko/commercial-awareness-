# Phase 1: Design Tokens - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the design token contract in `tailwind.config.ts` and `app/globals.css`. This phase delivers configuration files only — no component edits. All downstream phases (Shell, Content Surfaces, Conversion, Utility) depend on the tokens defined here. The output is a named type scale, a named radius system, and a CSS custom property layer. Zero visual change to any rendered page.

</domain>

<decisions>
## Implementation Decisions

### Radius feel
- Claude's discretion: Use `0.25rem` (4px) as the base radius — subtle, editorial, not the generic `0.5rem` SaaS default
- shadcn `--radius` var drops from `0.5rem` → `0.25rem` — affects all shadcn primitives globally
- Named radius tokens: `card` (2px — nearly flat, editorial), `chrome` (4px — UI elements like badges), `pill` (9999px — tags/chips), `input` (4px — form fields)

### Paper tone
- Claude's discretion: Add `--paper` CSS var — slightly warm white in light mode (`hsl(40 20% 98%)`) and a warm dark in dark mode (`hsl(20 10% 6%)`) rather than pure white/black
- This matches the existing warm editorial selection color (`rgb(180 140 80 / 0.20)`) already in globals.css
- Palette rule documented in globals.css: stone-* for content areas, zinc-* for UI chrome

### Type scale density
- Claude's discretion: Compact/dense scale — fits the editorial register and maximises content density (FT-style, not spacious blog)
- Semantic slots: display (2.25rem/36px), heading (1.5rem/24px), subheading (1.125rem/18px), body (0.9375rem/15px), caption (0.8125rem/13px), label (0.625rem/10px — the existing mono label size)
- Line heights: display/heading → `leading-tight`, body → `leading-relaxed`, caption/label → `leading-none`
- The `label` slot matches the existing mono section label pattern (`text-[10px]`) — making it a named token

### What NOT to touch
- shadcn color CSS vars (`--background`, `--foreground`, `--primary`, etc.) — these drive quiz, tracker, firm-pack, and test interfaces. Add only new vars with distinct names (`--paper`, `--radius-card`, etc.)
- `TOPIC_STYLES` in `lib/types.ts` — topic color system is correct, do not modify
- The safelist in `tailwind.config.ts` — topic dot and label colours are dynamically applied, must stay safelisted

### Claude's Discretion
- Exact `--paper` hsl value (within warm white range)
- Whether to add `@layer components` class for the mono section label pattern (used 77 times) or leave as copy-paste
- Spacing scale: use Tailwind defaults (4px base) — no custom spacing tokens needed at this stage

</decisions>

<specifics>
## Specific Ideas

- Research confirmed: "No new packages required" — entire design lift is Tailwind config changes + CSS variable tweaks. Zero npm dependencies.
- Research confirmed: `--radius: 0.25rem` removes the "generic SaaS app" rounding. This is the single loudest inconsistency.
- The warm editorial selection (`rgb(180 140 80 / 0.20)`) already exists in globals.css — `--paper` should harmonise with it.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/globals.css`: shadcn CSS var layer already established in `:root` — additive changes only, use distinct var names
- `tailwind.config.ts`: `extend` block already has `fontFamily`, `animation`, `borderRadius` (shadcn), `colors` (shadcn) — add `fontSize` to `extend`, new `borderRadius` tokens alongside shadcn ones

### Established Patterns
- `cn()` utility in `lib/utils.ts` — component edits in later phases use this for conditional classes
- Section label pattern: `font-mono text-[10px] tracking-widest uppercase text-stone-400` — used 77× across components. Phase 1 makes this a named token (`text-label`), later phases consume it.
- Card containers: codebase uses `rounded-sm` (not `rounded-xl` as CLAUDE.md says) — Phase 1 makes `rounded-card` the canonical token

### Integration Points
- `tailwind.config.ts` → all components (via Tailwind JIT)
- `app/globals.css` → all pages (via root layout)
- Changes here are zero-risk for rendering because no components are edited — only new tokens added

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-design-tokens*
*Context gathered: 2026-03-09*
