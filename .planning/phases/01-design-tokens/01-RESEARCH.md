# Phase 1: Design Tokens - Research

**Researched:** 2026-03-09
**Domain:** Tailwind CSS v3 config extension + CSS custom properties
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- `--radius: 0.25rem` — shadcn base radius dropped from `0.5rem`. Affects all shadcn primitives globally.
- Named radius tokens: `card` (2px — nearly flat, editorial), `chrome` (4px — UI elements like badges), `pill` (9999px — tags/chips), `input` (4px — form fields)
- Semantic type scale slots: display (2.25rem/36px), heading (1.5rem/24px), subheading (1.125rem/18px), body (0.9375rem/15px), caption (0.8125rem/13px), label (0.625rem/10px)
- Line heights: display/heading → `leading-tight`, body → `leading-relaxed`, caption/label → `leading-none`
- `--paper` CSS var: warm white in light mode (`hsl(40 20% 98%)`), warm dark in dark mode (`hsl(20 10% 6%)`)
- Stone/zinc palette rule documented in `globals.css`: stone-* for content areas, zinc-* for UI chrome
- DO NOT touch shadcn color vars (`--background`, `--foreground`, `--primary`, etc.)
- DO NOT touch `TOPIC_STYLES` in `lib/types.ts`
- DO NOT touch the safelist in `tailwind.config.ts`
- No custom spacing tokens at this stage — use Tailwind defaults

### Claude's Discretion
- Exact `--paper` hsl value (within warm white range — locked to `hsl(40 20% 98%)` light, `hsl(20 10% 6%)` dark per CONTEXT.md specifics)
- Whether to add `@layer components` class for the mono section label pattern (used 77 times) or leave as copy-paste

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TOKENS-01 | Semantic type scale defined in `tailwind.config.ts` (named slots: display, heading, subheading, body, caption, label — no arbitrary `text-[Npx]` values) | Tailwind v3 `theme.extend.fontSize` supports array syntax `[size, lineHeight]` — enables named slots with coupled line heights. JIT picks up new tokens instantly. |
| TOKENS-02 | Border radius token system established (single source of truth; resolves the 5 inconsistent values currently in use) | `theme.extend.borderRadius` already used by shadcn (`lg`, `md`, `sm` keys). New semantic keys (`card`, `chrome`, `pill`, `input`) added alongside existing ones — no collision. |
| TOKENS-03 | CSS custom property token layer added to `globals.css` for design values that require runtime theming (light/dark) | `@layer base` already established in `globals.css` with `:root` and `.dark` blocks. New vars (`--paper`, `--radius-card`, `--radius-chrome`, `--radius-pill`, `--radius-input`) added as additive-only changes. |
</phase_requirements>

## Summary

Phase 1 is a pure configuration phase — two files change, zero components change. The project is on **Tailwind CSS 3.4.19** (not v4), which means the `tailwind.config.ts` `theme.extend` pattern is correct and required. The skill in `.agents/skills/tailwind-design-system/` documents v4 CSS-first `@theme` configuration — those patterns do NOT apply here and must be ignored entirely.

The existing `tailwind.config.ts` already uses `theme.extend` for `borderRadius` (three shadcn tokens), `fontFamily`, `animation`, `keyframes`, and `colors`. The phase adds `fontSize` to `extend` (new section) and new keys to `borderRadius` (alongside existing shadcn keys). The existing `globals.css` `@layer base` block already contains `:root` and `.dark` — new CSS vars are added inside those existing selectors, never replacing them.

The codebase has 443+ instances of arbitrary `text-[Npx]` across `components/` and `app/` — 102 uses of `text-[10px]` alone. This phase defines the named tokens. Later phases (Shell, Content Surfaces) consume them by replacing the arbitrary values. Phase 1 itself makes no component edits — the tokens must exist first so downstream phases have something to reference.

**Primary recommendation:** Extend `tailwind.config.ts` with `fontSize` tokens and new `borderRadius` tokens; add `--paper` and semantic radius CSS vars to the existing `:root`/`.dark` blocks in `globals.css`. No new packages. Zero visual change on any page.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | 3.4.19 (installed) | CSS utility framework + JIT token generation | Already installed; `theme.extend.fontSize` is native v3 API |
| postcss | ^8 (installed) | CSS processing pipeline | Already configured — no changes needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss-animate | ^1.0.7 (installed) | Animation utilities | Already in use — not modified in this phase |
| next-themes | ^0.4.4 (installed) | Class-based dark mode toggle | Controls `.dark` class on `<html>` — CSS vars respond automatically |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `theme.extend.fontSize` in tailwind.config.ts | CSS-only custom properties | v3 config generates Tailwind utility classes (`text-display`, `text-body`, etc.) — CSS-only vars would require manual `@layer utilities` and lose IntelliSense support |
| Adding vars to existing `:root` block | Separate `@layer tokens {}` block | Simpler to add to existing `:root` — already scoped correctly, avoids layer precedence confusion |

**Installation:** No new packages required.

## Architecture Patterns

### Recommended Project Structure
```
tailwind.config.ts           # Add fontSize + new borderRadius keys
app/globals.css              # Add --paper + --radius-* CSS vars to :root and .dark
```

### Pattern 1: Tailwind v3 fontSize with Coupled Line Height

**What:** In Tailwind v3, `theme.extend.fontSize` accepts either a string (size only) or a two-element array `[size, lineHeight]` or `[size, { lineHeight, letterSpacing, fontWeight }]`.

**When to use:** When semantic slots need locked line heights (e.g., display always tight, body always relaxed).

**Example:**
```typescript
// tailwind.config.ts — inside theme.extend
fontSize: {
  // [size, lineHeight]
  'display':    ['2.25rem',  { lineHeight: '1.25' }],  // 36px, leading-tight equiv
  'heading':    ['1.5rem',   { lineHeight: '1.25' }],  // 24px
  'subheading': ['1.125rem', { lineHeight: '1.375' }], // 18px
  'body':       ['0.9375rem',{ lineHeight: '1.625' }], // 15px, leading-relaxed equiv
  'caption':    ['0.8125rem',{ lineHeight: '1' }],     // 13px, leading-none
  'label':      ['0.625rem', { lineHeight: '1' }],     // 10px, leading-none
},
```

Usage generates: `text-display`, `text-heading`, `text-subheading`, `text-body`, `text-caption`, `text-label`

Source: Tailwind CSS v3 docs — https://tailwindcss.com/docs/font-size#providing-a-default-line-height

### Pattern 2: Adding borderRadius tokens alongside existing shadcn tokens

**What:** `theme.extend.borderRadius` already contains `lg`, `md`, `sm` keys driven by `var(--radius)`. New semantic keys are added alongside — no replacement, no collision.

**When to use:** Any time you want named border-radius utilities that don't conflict with shadcn's radius system.

**Example:**
```typescript
// tailwind.config.ts — inside theme.extend.borderRadius (alongside existing lg/md/sm)
borderRadius: {
  lg:     'var(--radius)',             // existing shadcn — DO NOT CHANGE
  md:     'calc(var(--radius) - 2px)', // existing shadcn — DO NOT CHANGE
  sm:     'calc(var(--radius) - 4px)', // existing shadcn — DO NOT CHANGE
  // New semantic tokens:
  card:   'var(--radius-card)',        // 2px — nearly flat editorial
  chrome: 'var(--radius-chrome)',      // 4px — badges, UI elements
  pill:   'var(--radius-pill)',        // 9999px — tags/chips
  input:  'var(--radius-input)',       // 4px — form fields
},
```

Usage generates: `rounded-card`, `rounded-chrome`, `rounded-pill`, `rounded-input`

### Pattern 3: CSS custom property layer in globals.css

**What:** Add new vars to the existing `@layer base` `:root` and `.dark` selectors. Keep new var names distinct (prefixed `--radius-*`, `--paper`) from shadcn vars.

**When to use:** Any value that must respond to dark/light mode toggle at runtime.

**Example:**
```css
/* app/globals.css — inside @layer base, inside existing :root block */
:root {
  /* ... existing shadcn vars unchanged ... */
  --radius: 0.25rem;          /* CHANGE: was 0.5rem */

  /* New tokens — distinct names, no collision with shadcn */
  --paper: hsl(40 20% 98%);   /* warm white — light mode page bg */
  --radius-card:   0.125rem;  /* 2px — nearly flat editorial */
  --radius-chrome: 0.25rem;   /* 4px — UI chrome elements */
  --radius-pill:   9999px;    /* pill / tag / chip */
  --radius-input:  0.25rem;   /* 4px — form fields */
}

.dark {
  /* ... existing shadcn dark vars unchanged ... */
  --paper: hsl(20 10% 6%);    /* warm dark — dark mode page bg */
  /* radius vars don't need dark overrides — same values both modes */
}
```

### Pattern 4: @layer components for high-repetition utility patterns

**What:** Define a CSS class once in `@layer components` that applies a bundle of utilities. Tailwind's JIT includes it in output when the class is used in markup.

**When to use:** When a utility combination appears 30+ times and the combination is semantically meaningful (single concept, not coincidental co-occurrence).

**Example (optional — Claude's discretion per CONTEXT.md):**
```css
/* app/globals.css — after existing @layer utilities block */
@layer components {
  /* Section label — used ~77x in components. Single concept, named token. */
  .section-label {
    @apply font-mono text-label tracking-widest uppercase text-stone-400 dark:text-stone-500;
  }
}
```

Usage: `<p className="section-label">` replaces `<p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500">`

**Decision guidance:** Adding this saves ~77 multi-class strings across components but requires component edits (later phases). If added in Phase 1, it's available but not yet consumed. Zero-risk to add now since no component is edited in this phase.

### Anti-Patterns to Avoid

- **Replacing shadcn borderRadius tokens (lg/md/sm):** shadcn components reference `rounded-lg` etc. directly via the `--radius` var. Removing or renaming those breaks all shadcn UI primitives (Button, Dialog, Card, Input, etc.).
- **Adding vars inside `.dark` only:** CSS vars used for runtime switching must be declared in `:root` (light) AND `.dark` (dark) — if only `.dark` has `--paper`, light mode gets `unset`.
- **Using `theme.fontSize` (not `theme.extend.fontSize`):** Using `theme.fontSize` (no `extend`) replaces ALL Tailwind defaults (text-sm, text-base, text-lg, etc.) — this breaks every component currently using standard Tailwind text sizes. Always use `theme.extend.fontSize`.
- **Using v4 CSS `@theme` syntax:** The project is on Tailwind 3.4.19. The `@theme` directive does not exist in v3. The `.agents/skills/tailwind-design-system/SKILL.md` documents v4 exclusively — its configuration patterns must not be applied here.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark-mode responsive CSS vars | Manual JS to swap values | CSS `var()` in `:root` + `.dark` | next-themes already toggles `.dark` class on `<html>`. CSS vars respond instantly with zero JS. |
| Type scale lookup | Custom helper function | `theme.extend.fontSize` | JIT generates `text-display` etc. natively with TypeScript IntelliSense and Tailwind completions in IDE |
| Purge-safe dynamic classes | Safelist entries | No new dynamic classes added in this phase | Existing safelist for topic colours already covers all dynamic cases |

**Key insight:** This phase is additive-only configuration. Every "hand-roll" trap involves writing code where config entries suffice.

## Common Pitfalls

### Pitfall 1: Using `theme.fontSize` instead of `theme.extend.fontSize`
**What goes wrong:** All built-in Tailwind text sizes (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.) disappear from the generated CSS. Components across the entire app that use standard sizes break.
**Why it happens:** Forgetting `extend` replaces instead of merging.
**How to avoid:** Always nest new tokens under `theme.extend`, never under `theme` directly.
**Warning signs:** After `next build`, inspect output — if `text-sm` class is missing from CSS, `extend` was omitted.

### Pitfall 2: Changing `--radius` without accounting for shadcn calc() expressions
**What goes wrong:** `--radius: 0.25rem` means `calc(var(--radius) - 4px)` = `calc(0.25rem - 4px)` = `0px` (or negative). The `rounded-sm` token (which is `calc(var(--radius) - 4px)`) collapses to `0px`. shadcn's `rounded-sm` becomes visually identical to `rounded-none`.
**Why it happens:** shadcn's radius system was designed around `--radius: 0.5rem` (8px). At 4px, subtracting 4px gives 0px.
**How to avoid:** After updating `--radius`, the new semantic radius tokens (`--radius-card`, `--radius-chrome`, etc.) are driven by direct values, not calc() chains. The shadcn `rounded-sm`/`rounded-md` tokens may now compute to 0px/2px — this is acceptable (editorial feel) but should be confirmed as intentional.
**Warning signs:** `rounded-sm` elements look fully square after the change.

### Pitfall 3: Collision with existing shadcn borderRadius token names
**What goes wrong:** Using a key name that already exists in the shadcn `extend.borderRadius` block (`lg`, `md`, `sm`) overwrites those values. shadcn components break.
**Why it happens:** Not reading the existing config before adding keys.
**How to avoid:** New tokens use unique semantic names (`card`, `chrome`, `pill`, `input`) not present in the existing config.
**Warning signs:** shadcn Button, Dialog, or Input components render with wrong radius.

### Pitfall 4: CSS vars not defined in both `:root` and `.dark`
**What goes wrong:** `--paper` is undefined in light mode if only added to `.dark`. `var(--paper)` resolves to the initial value (empty/`unset`), which browsers treat as `transparent` for color properties.
**Why it happens:** Forgetting that CSS custom property inheritance requires the var to exist in the scope it's queried.
**How to avoid:** Always define `--paper` in `:root` (light value) and override in `.dark` (dark value).
**Warning signs:** Light mode background appears transparent/incorrect; DevTools shows `var(--paper)` as `unset`.

### Pitfall 5: Applying v4 skill patterns to a v3 project
**What goes wrong:** Using `@theme {}` blocks in `globals.css` or replacing `tailwind.config.ts` with CSS-first configuration causes PostCSS build errors. The `@theme` directive is a Tailwind v4 feature — it does not exist in v3.
**Why it happens:** The `.agents/skills/tailwind-design-system/SKILL.md` documents Tailwind v4 exclusively, but the project is on `tailwindcss@3.4.19`.
**How to avoid:** Use `tailwind.config.ts` for all theme tokens. Use `@layer base / components / utilities` directives in CSS. Never use `@theme`.
**Warning signs:** PostCSS build error: `Unknown at rule @theme`.

## Code Examples

Verified patterns from Tailwind CSS v3 official documentation and direct codebase inspection:

### Complete tailwind.config.ts fontSize and borderRadius additions
```typescript
// tailwind.config.ts — theme.extend additions
// Source: https://tailwindcss.com/docs/font-size#providing-a-default-line-height (v3)
// Source: https://tailwindcss.com/docs/border-radius#customizing-your-theme (v3)

extend: {
  // ADD: fontSize — semantic type scale
  fontSize: {
    'display':    ['2.25rem',  { lineHeight: '1.25' }],   // 36px
    'heading':    ['1.5rem',   { lineHeight: '1.25' }],   // 24px
    'subheading': ['1.125rem', { lineHeight: '1.375' }],  // 18px
    'body':       ['0.9375rem',{ lineHeight: '1.625' }],  // 15px
    'caption':    ['0.8125rem',{ lineHeight: '1' }],      // 13px
    'label':      ['0.625rem', { lineHeight: '1' }],      // 10px — matches existing text-[10px] mono label
  },

  // MODIFY: borderRadius — keep existing shadcn keys, add semantic keys
  borderRadius: {
    lg:     'var(--radius)',             // existing — keep
    md:     'calc(var(--radius) - 2px)', // existing — keep
    sm:     'calc(var(--radius) - 4px)', // existing — keep
    card:   'var(--radius-card)',        // new
    chrome: 'var(--radius-chrome)',      // new
    pill:   'var(--radius-pill)',        // new
    input:  'var(--radius-input)',       // new
  },

  // ... all other existing extend keys unchanged ...
}
```

### globals.css CSS var additions
```css
/* app/globals.css — inside existing @layer base block */

:root {
  /* ... all existing shadcn vars unchanged ... */

  /* CHANGE: reduce from 0.5rem to 0.25rem */
  --radius: 0.25rem;

  /* ADD: paper background — warm off-white, editorial */
  --paper: hsl(40 20% 98%);

  /* ADD: semantic radius tokens */
  --radius-card:   0.125rem;  /* 2px */
  --radius-chrome: 0.25rem;   /* 4px */
  --radius-pill:   9999px;
  --radius-input:  0.25rem;   /* 4px */
}

.dark {
  /* ... all existing shadcn dark vars unchanged ... */

  /* ADD: paper background — warm dark, not pure black */
  --paper: hsl(20 10% 6%);

  /* Radius vars are mode-independent — no dark overrides needed */
}
```

### Optional: @layer components section label
```css
/* app/globals.css — new block after existing @layer utilities block */
@layer components {
  /* Palette rule: stone-* = content, zinc-* = UI chrome */
  .section-label {
    @apply font-mono text-label tracking-widest uppercase text-stone-400 dark:text-stone-500;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS-first `@theme {}` config | `tailwind.config.ts` `theme.extend` | v4 only (not this project — v3) | Project uses v3 — `tailwind.config.ts` is correct and required |
| Arbitrary `text-[10px]` values | Named `text-label` token | Phase 1 (this phase) | Named tokens enable global rescaling; IDE autocomplete works |
| Hardcoded `rounded-xl` / `rounded-sm` mix (5 different values) | Named `rounded-card` / `rounded-chrome` etc. | Phase 1 (this phase) | Single source of truth; consistent editorial radius |
| `--radius: 0.5rem` (generic SaaS look) | `--radius: 0.25rem` (editorial/subtle) | Phase 1 (this phase) | Affects all shadcn primitives — confirms intentional brand decision |

**Deprecated/outdated:**
- v4 `@theme {}` directive: Not applicable — Tailwind 3.4.19 installed. Do not use.
- `tailwindcss-animate` (as a v4 replacement): Plugin is already installed and working — not replaced in this phase.

## Open Questions

1. **`@layer components` for `.section-label` — add in Phase 1 or defer?**
   - What we know: CONTEXT.md marks this as Claude's discretion. The pattern appears ~77x. Phase 1 edits only config files — adding a `@layer components` entry to `globals.css` technically fits within "config/globals only" scope.
   - What's unclear: Whether later phases (Shell, Content Surfaces) should own the component class since they own the component edits that would consume it.
   - Recommendation: Add `.section-label` to `globals.css` in Phase 1. It's a CSS artifact (lives in globals.css), is zero-risk (no component is edited), and makes the named token available for downstream phases. If deferred, later phases must add it mid-work.

2. **shadcn `rounded-sm` collapsing to 0px after `--radius: 0.25rem` change**
   - What we know: `calc(var(--radius) - 4px)` = `calc(0.25rem - 4px)` = effectively 0px (mixing rem and px in calc is valid but 0.25rem = 4px, so result is 0px).
   - What's unclear: Whether any current shadcn component uses `rounded-sm` in a way that should preserve a small radius.
   - Recommendation: Accept the 0px outcome as intentional (flat editorial feel). The new `rounded-chrome` token (0.25rem / 4px) replaces any case that needs a subtle radius. Planner should note this as a known consequence, not a bug.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — no test framework installed in project |
| Config file | None — no `jest.config.*`, `vitest.config.*`, or `pytest.ini` found |
| Quick run command | `npm run build` (TypeScript compile + Tailwind JIT verifies token syntax) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOKENS-01 | `text-display`, `text-heading`, `text-subheading`, `text-body`, `text-caption`, `text-label` classes generated in CSS | build smoke | `npm run build` — build fails if config syntax is invalid | ❌ No unit test; build is the gate |
| TOKENS-02 | `rounded-card`, `rounded-chrome`, `rounded-pill`, `rounded-input` classes generated; existing `rounded-lg/md/sm` unchanged | build smoke | `npm run build` | ❌ No unit test; build is the gate |
| TOKENS-03 | `--paper`, `--radius-card`, `--radius-chrome`, `--radius-pill`, `--radius-input` present in compiled CSS; `--radius` is `0.25rem` | manual inspect | `npm run build` then inspect `.next/static/css/*.css` for var names | ❌ Manual verification |

### Sampling Rate
- **Per task commit:** `npm run build` — confirms TypeScript parses and Tailwind JIT runs cleanly
- **Per wave merge:** `npm run build && npm run lint` — confirms no lint regressions
- **Phase gate:** Build green + manual CSS var inspection before `/gsd:verify-work`

### Wave 0 Gaps
None — no test framework needed for config-only changes. Build verification is the appropriate gate for this phase. Installing a test framework (Jest/Vitest) would be disproportionate overhead for two file edits.

## Sources

### Primary (HIGH confidence)
- Tailwind CSS v3 docs — https://tailwindcss.com/docs/font-size (fontSize array syntax with lineHeight)
- Tailwind CSS v3 docs — https://tailwindcss.com/docs/border-radius (borderRadius customization)
- Direct codebase inspection — `tailwind.config.ts` (existing extend block structure confirmed), `app/globals.css` (existing CSS var layer confirmed), `package.json` (`tailwindcss@^3.4.17` installed, `3.4.19` resolved)

### Secondary (MEDIUM confidence)
- shadcn/ui radius pattern — existing config already demonstrates the `lg/md/sm` + `var(--radius)` convention; new keys follow identical pattern
- `.agents/skills/tailwind-design-system/SKILL.md` — read but **NOT applied** (documents Tailwind v4; project is v3)

### Tertiary (LOW confidence)
- Codebase grep findings on arbitrary text sizes (443+ uses) and radius classes (159 uses) — representative sample, not exhaustive

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — installed version confirmed from `node_modules/tailwindcss/package.json`
- Architecture: HIGH — patterns verified against v3 docs and direct config inspection
- Pitfalls: HIGH — most pitfalls are logical consequences of the existing config structure, verified by reading actual files
- Skill applicability: HIGH (negative) — SKILL.md is confirmed v4-only; v3 config patterns used instead

**Research date:** 2026-03-09
**Valid until:** 2026-09-09 (stable — Tailwind v3 is in maintenance mode, no breaking changes expected)
