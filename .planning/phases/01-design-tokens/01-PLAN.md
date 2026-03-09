---
phase: 01-design-tokens
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/globals.css
  - tailwind.config.ts
autonomous: true
requirements:
  - TOKENS-01
  - TOKENS-02
  - TOKENS-03

must_haves:
  truths:
    - "tailwind.config.ts has a named fontSize scale with slots: display, heading, subheading, body, caption, label"
    - "tailwind.config.ts has named borderRadius tokens: card, chrome, pill, input — alongside existing lg/md/sm"
    - "globals.css :root block contains --paper (warm white) and four --radius-* vars"
    - "globals.css .dark block contains --paper (warm dark)"
    - "globals.css --radius is 0.25rem (was 0.5rem)"
    - "globals.css has a .section-label component class in @layer components"
    - "npm run build completes without errors"
  artifacts:
    - path: "tailwind.config.ts"
      provides: "Named type scale (text-display through text-label) and named radius tokens (rounded-card through rounded-input)"
      contains: "fontSize:"
    - path: "app/globals.css"
      provides: "CSS custom property layer: --paper, --radius-card, --radius-chrome, --radius-pill, --radius-input, .section-label"
      contains: "--paper"
  key_links:
    - from: "tailwind.config.ts borderRadius.card"
      to: "globals.css --radius-card"
      via: "var(--radius-card)"
      pattern: "var\\(--radius-card\\)"
    - from: "tailwind.config.ts colors.paper"
      to: "globals.css --paper"
      via: "hsl(var(--paper))"
      pattern: "hsl\\(var\\(--paper\\)\\)"
    - from: "globals.css .section-label"
      to: "tailwind.config.ts fontSize.label"
      via: "@apply text-label"
      pattern: "text-label"
---

<objective>
Establish the design token contract in `tailwind.config.ts` and `app/globals.css`.

Purpose: All downstream phases (Shell, Content Surfaces, Conversion, Utility) consume named tokens instead of arbitrary values. This phase makes the tokens exist — no component is edited.

Output: A named type scale, a named radius system, a CSS custom property layer, and a `.section-label` component class. Zero visual change to any rendered page.
</objective>

<execution_context>
@/Users/gregoryvitrenko/.claude/get-shit-done/workflows/execute-plan.md
@/Users/gregoryvitrenko/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/gregoryvitrenko/Documents/Folio/.planning/ROADMAP.md
@/Users/gregoryvitrenko/Documents/Folio/.planning/REQUIREMENTS.md

**Critical version constraint:** Tailwind 3.4.19 is installed. Use `theme.extend` in `tailwind.config.ts`. The `@theme {}` CSS-first syntax is Tailwind v4 only — it does not exist in this project and must never be used.

**DO NOT touch:**
- shadcn color vars (`--background`, `--foreground`, `--card`, `--primary`, etc.) — these drive shadcn UI primitives
- The `safelist` array in `tailwind.config.ts` — topic dot and label colours are dynamically applied
- `TOPIC_STYLES` in `lib/types.ts`
- Any component files

**Known consequence of --radius change:** After reducing `--radius` from `0.5rem` to `0.25rem`, the shadcn-derived `rounded-sm` token resolves to `calc(0.25rem - 4px)` = effectively 0px. This is intentional — the editorial feel is flat. The new `rounded-chrome` token (0.25rem / 4px) replaces any use case that genuinely needs a subtle radius.
</context>

<interfaces>
<!-- Existing tailwind.config.ts extend block (confirmed by reading the file) -->
<!-- Executor adds to these existing keys — do not replace them -->

Current theme.extend in tailwind.config.ts:
```typescript
extend: {
  fontFamily: {
    serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
    sans:  ['var(--font-sans)', 'system-ui', 'sans-serif'],
    mono:  ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
  },
  animation: { 'fade-in': 'fadeIn 0.4s ease-out' },
  keyframes: { fadeIn: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } } },
  borderRadius: {
    lg: 'var(--radius)',             // existing shadcn — KEEP
    md: 'calc(var(--radius) - 2px)', // existing shadcn — KEEP
    sm: 'calc(var(--radius) - 4px)', // existing shadcn — KEEP
  },
  colors: {
    // ... shadcn colors (background, foreground, card, etc.) — KEEP ALL
  }
}
```

Current globals.css :root block ends at line 32 with `--radius: 0.5rem;`. The `.dark` block spans lines 46–71. The `@layer utilities` block is at lines 74–82. There is no `@layer components` block yet.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1-01-01: Update --radius and add --paper + --radius-* CSS vars to :root</name>
  <files>app/globals.css</files>
  <action>
In the existing `@layer base` block, inside the `:root` selector, make these changes:

1. Change `--radius: 0.5rem;` to `--radius: 0.25rem;`

2. After the `--radius` line, add these new vars (keeping a blank line for separation from shadcn vars):

```css
/* Design token layer — additive, distinct names from shadcn vars */
--paper: hsl(40 20% 98%);   /* warm off-white — light mode page background */

/* Semantic radius tokens (direct values, not calc chains) */
--radius-card:   0.125rem;  /* 2px — nearly flat, editorial */
--radius-chrome: 0.25rem;   /* 4px — badges, UI chrome elements */
--radius-pill:   9999px;    /* pill / tag / chip */
--radius-input:  0.25rem;   /* 4px — form fields */
```

No other changes to `:root`. All existing shadcn vars (`--background`, `--foreground`, etc.) remain untouched.
  </action>
  <verify>
    <automated>cd /Users/gregoryvitrenko/Documents/Folio && npx tsc --noEmit</automated>
  </verify>
  <done>globals.css :root has `--radius: 0.25rem`, `--paper: hsl(40 20% 98%)`, and four `--radius-*` vars. All existing shadcn vars present and unchanged. `npx tsc --noEmit` exits 0.</done>
</task>

<task type="auto">
  <name>Task 1-01-02: Add --paper to .dark block</name>
  <files>app/globals.css</files>
  <action>
In the existing `.dark` selector (inside `@layer base`), add one line after the last existing shadcn dark var (`--chart-5`):

```css
/* Design token layer */
--paper: hsl(20 10% 6%);  /* warm dark — dark mode page background */
```

The radius vars (`--radius-card`, `--radius-chrome`, `--radius-pill`, `--radius-input`) do NOT need dark overrides — the values are the same in both modes.

No other changes to `.dark`. All existing shadcn dark vars remain untouched.
  </action>
  <verify>
    <automated>cd /Users/gregoryvitrenko/Documents/Folio && npx tsc --noEmit</automated>
  </verify>
  <done>globals.css `.dark` block has `--paper: hsl(20 10% 6%)`. All existing dark vars unchanged. `npx tsc --noEmit` exits 0.</done>
</task>

<task type="auto">
  <name>Task 1-01-03: Add semantic borderRadius tokens and paper color to tailwind.config.ts</name>
  <files>tailwind.config.ts</files>
  <action>
In `tailwind.config.ts`, inside `theme.extend`, make two additions:

1. **borderRadius** — add four semantic keys AFTER the existing `sm` key. Keep `lg`, `md`, `sm` exactly as they are:

```typescript
borderRadius: {
  lg:     'var(--radius)',             // existing — DO NOT CHANGE
  md:     'calc(var(--radius) - 2px)', // existing — DO NOT CHANGE
  sm:     'calc(var(--radius) - 4px)', // existing — DO NOT CHANGE
  // Semantic radius tokens — reference CSS vars defined in globals.css
  card:   'var(--radius-card)',        // 2px — nearly flat editorial
  chrome: 'var(--radius-chrome)',      // 4px — badges, UI chrome
  pill:   'var(--radius-pill)',        // 9999px — tags/chips
  input:  'var(--radius-input)',       // 4px — form fields
},
```

2. **colors** — add `paper` as a flat key AFTER the last existing color entry (`chart`). Do not nest it:

```typescript
colors: {
  // ... all existing shadcn color entries unchanged ...
  paper: 'hsl(var(--paper))',  // warm page background, responds to dark mode
},
```

Do not modify `fontFamily`, `animation`, `keyframes`, or the safelist. TypeScript type inference will accept these additions without any type annotation changes.
  </action>
  <verify>
    <automated>cd /Users/gregoryvitrenko/Documents/Folio && npx tsc --noEmit</automated>
  </verify>
  <done>tailwind.config.ts `borderRadius` has `card`, `chrome`, `pill`, `input` keys alongside existing `lg/md/sm`. `colors` has `paper: 'hsl(var(--paper))'`. All existing keys unchanged. `npx tsc --noEmit` exits 0.</done>
</task>

<task type="auto">
  <name>Task 1-01-04: Add fontSize semantic type scale to tailwind.config.ts</name>
  <files>tailwind.config.ts</files>
  <action>
In `tailwind.config.ts`, inside `theme.extend`, add a new `fontSize` section. Place it after `fontFamily` and before `animation` (or at any position within `extend` — order within the object does not affect output):

```typescript
fontSize: {
  // Semantic type scale — use theme.extend (NOT theme) to preserve all Tailwind defaults
  // Array format: [size, { lineHeight, fontWeight?, letterSpacing? }]
  display:    ['2.25rem',   { lineHeight: '1.2',  fontWeight: '700' }],   // 36px — page-level hero
  heading:    ['1.5rem',    { lineHeight: '1.25', fontWeight: '600' }],   // 24px — section headings
  subheading: ['1.125rem',  { lineHeight: '1.35', fontWeight: '500' }],   // 18px — subsection headings
  body:       ['0.9375rem', { lineHeight: '1.6'  }],                      // 15px — body copy
  caption:    ['0.8125rem', { lineHeight: '1.4'  }],                      // 13px — secondary text
  label:      ['0.625rem',  { lineHeight: '1',    letterSpacing: '0.1em', fontWeight: '500' }], // 10px — mono labels
},
```

CRITICAL: Use `theme.extend.fontSize`, never `theme.fontSize` (without extend). Using `theme.fontSize` directly replaces ALL Tailwind defaults (text-sm, text-base, text-lg, etc.), breaking every component in the app.

The label slot (0.625rem / 10px) matches the existing `text-[10px]` mono section label pattern used ~77 times across the codebase.
  </action>
  <verify>
    <automated>cd /Users/gregoryvitrenko/Documents/Folio && npx tsc --noEmit</automated>
  </verify>
  <done>tailwind.config.ts `theme.extend.fontSize` has all six semantic slots (display, heading, subheading, body, caption, label). Built-in Tailwind text sizes are unaffected. `npx tsc --noEmit` exits 0.</done>
</task>

<task type="auto">
  <name>Task 1-01-05: Add .section-label component class to globals.css</name>
  <files>app/globals.css</files>
  <action>
After the existing `@layer utilities` block (which ends at the `}` closing `.no-scrollbar`), add a new `@layer components` block:

```css
@layer components {
  /* Section label — canonicalises the font-mono text-[10px] tracking-widest uppercase text-stone-400
     pattern used ~77 times across components. Downstream phases consume this class. */
  .section-label {
    @apply font-mono text-label tracking-widest uppercase text-stone-400 dark:text-stone-500;
  }
}
```

Place this block BEFORE the `/* ── Print styles ── */` comment and `@media print` block. The `@layer components` directive must come after `@layer utilities` in the file to respect Tailwind's cascade order.

Note: `text-label` references the `fontSize.label` token added to `tailwind.config.ts` in Task 1-01-04. That task must be complete before this one.
  </action>
  <verify>
    <automated>cd /Users/gregoryvitrenko/Documents/Folio && npx tsc --noEmit</automated>
  </verify>
  <done>globals.css has an `@layer components` block with `.section-label` using `@apply font-mono text-label tracking-widest uppercase text-stone-400 dark:text-stone-500`. `npx tsc --noEmit` exits 0.</done>
</task>

</tasks>

<verification>
After all five tasks are complete, run the full build to confirm zero regressions:

```bash
cd /Users/gregoryvitrenko/Documents/Folio && npm run build
```

Additionally, inspect the compiled CSS to confirm the vars and classes are present:

```bash
# Confirm --paper and --radius-* appear in compiled output
grep -r "\-\-paper\|--radius-card\|--radius-chrome\|--radius-pill\|--radius-input" /Users/gregoryvitrenko/Documents/Folio/.next/static/css/ 2>/dev/null | head -20

# Confirm .section-label appears in compiled output
grep -r "section-label" /Users/gregoryvitrenko/Documents/Folio/.next/static/css/ 2>/dev/null | head -5
```

Manual check (after `npm run dev` in a separate terminal — never from Claude Code):
- Load `http://localhost:3001/` — layout must be visually identical to pre-phase state
- Open DevTools → Computed → check `--paper` resolves to `hsl(40 20% 98%)` in light mode
- Toggle dark mode — confirm `--paper` switches to `hsl(20 10% 6%)`
- Check any section label (e.g., topic badge text) — must remain 10px mono uppercase stone-400
</verification>

<success_criteria>
Phase 1 is complete when ALL of the following are true:

1. `npx tsc --noEmit` exits 0 after each task (5/5 clean compile checks)
2. `npm run build` completes without errors after all tasks
3. `tailwind.config.ts` contains `theme.extend.fontSize` with all six named slots
4. `tailwind.config.ts` `borderRadius` has `card`, `chrome`, `pill`, `input` alongside unchanged `lg/md/sm`
5. `tailwind.config.ts` `colors` has `paper: 'hsl(var(--paper))'`
6. `globals.css` `:root` has `--radius: 0.25rem`, `--paper`, and four `--radius-*` vars
7. `globals.css` `.dark` has `--paper: hsl(20 10% 6%)`
8. `globals.css` has `@layer components` with `.section-label` using `@apply font-mono text-label ...`
9. Zero components edited — only `tailwind.config.ts` and `app/globals.css` changed
</success_criteria>

<output>
After completion, create `/Users/gregoryvitrenko/Documents/Folio/.planning/phases/01-design-tokens/01-01-SUMMARY.md` with:
- What was implemented (token names and values added)
- Files modified (tailwind.config.ts, app/globals.css)
- Verification results (tsc + build green)
- Any observations (e.g., rounded-sm collapse to 0px confirmed intentional)
- Tokens available for downstream phases (text-display through text-label, rounded-card through rounded-input, bg-paper/text-paper, .section-label)
</output>
