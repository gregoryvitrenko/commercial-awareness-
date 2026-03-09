# Technology Stack: Premium Editorial Design

**Project:** Folio design lift
**Researched:** 2026-03-09
**Confidence:** MEDIUM-HIGH (training knowledge through Aug 2025 + direct codebase analysis; external verification tools unavailable)

---

## What the Research Is Answering

The existing app has the right editorial direction (stone/zinc palette, Playfair Display serif, JetBrains Mono labels, newspaper structure). The gap is in execution: the current design reads as functional, not premium. This research identifies precisely what separates a premium editorial product from a well-intentioned side project, within the existing Tailwind CSS 3 + shadcn/ui + Next.js 15 constraint.

**Constraint recap:** No stack changes. Work within Tailwind CSS 3.4, shadcn/ui stone base, and the existing three-font stack.

---

## Current State Audit

Based on direct codebase reading:

### What's Working
- `h-[3px] bg-stone-900` thick top rule in header — correct editorial device
- `font-mono text-[10px] tracking-widest uppercase` for section labels — strong
- `border-t` section dividers rather than extra whitespace — newspaper-appropriate
- Stone/zinc palette split (content vs UI chrome) — correct mental model
- `::selection` warm amber highlight — a nice detail
- `-webkit-font-smoothing: antialiased` in globals.css — essential

### What's Weak
- **Font sizes are arbitrary px values** (`text-[19px]`, `text-[21px]`, `text-[13px]`, `text-[11px]`) — no type scale. This is the biggest single cause of the "side project" feeling. Premium products use a geometric scale.
- **Playfair Display is the right choice but set poorly** — `text-[19px] sm:text-[21px] font-bold leading-snug` on story card headlines has no optical tracking compensation. Playfair at large sizes needs `tracking-tight` or `tracking-[-0.01em]`; at small sizes it needs neutral or slightly wider tracking. Both are getting `tracking-tight` regardless of size.
- **Line height is inconsistent and ad-hoc** — `leading-snug`, `leading-[1.65]`, `leading-[1.75]`, `leading-relaxed`, `leading-tight` are all used. Premium editorial typography picks one or two line heights and sticks to them (e.g. `1.5` for tight display, `1.7` for reading body, `1.4` for UI elements).
- **Prose body text is `text-[15px]` or `text-[16px]`** — both float between Tailwind's `sm` and `base`. At 16px body you get the benefit of Tailwind's `prose` plugin. At 15px you're outside it and fighting yourself.
- **Border radius is inconsistent** — cards use `rounded-sm` but the upgrade block, hero recommendation box, and stage buttons use `rounded-xl` and `rounded-lg`. One radius per surface type is the mark of a design system. A newspaper design should be closer to 0 than to `rounded-xl`.
- **The `LandingHero` is styled differently from everything else** — uses `rounded-xl` for CTA buttons (while article pages use `rounded-sm`), which creates a visual register mismatch that signals an undesigned product.
- **No optical margin / hanging punctuation** — blockquotes and pull quotes don't use `text-indent: -0.4em` style adjustments. Premium editorial sites hang opening quotation marks outside the text column.
- **The strapline text (`text-[13px] text-stone-400`)** opening the briefing view is too muted — it reads as a caption, not an orienting headline. Premium products lead with confident framing text.
- **Spacing is inconsistent at macro level** — `mb-8`, `mb-12`, `mb-6`, `mb-5`, `mb-3` appear near-randomly. A spacing scale (`4 → 8 → 12 → 20 → 32`) applied consistently creates the vertical rhythm that makes editorial content feel authoritative.

---

## Recommended Stack Changes (design layer only)

No new npm packages required. All changes are Tailwind config and CSS.

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 3.4.17 (current) | All styling | No change — stay on v3, custom type scale and spacing extensions do everything needed |
| shadcn/ui | current (stone) | UI primitives | No change — customize via CSS variables only |
| next/font/google | Next.js 15 built-in | Font loading | No change — Playfair Display + Inter already correct; swap JetBrains Mono for DM Mono (better editorial register) |

### Font Stack Recommendation

**Keep:** Playfair Display as the display/heading serif. It is the correct choice for legal editorial. HIGH confidence — used by The Economist, FT Weekend, legal publishers.

**Keep:** Inter as body sans. No change needed at the font level — Inter at 16px with proper line height reads beautifully.

**Swap:** JetBrains Mono → **DM Mono** or keep JetBrains Mono but apply it more conservatively. JetBrains Mono has wider character spacing than premium editorial mono fonts, which makes labels feel "developer tool" not "newspaper metadata." DM Mono is narrower, designed for editorial annotation contexts. If swapping feels risky, reducing tracking on JetBrains Mono labels from `tracking-widest` to `tracking-wider` and reducing font weight from the current semibold approximation to `font-normal` will soften the developer-tool association.

**Alternative serif to consider (MEDIUM confidence):** Source Serif 4 or Lora for body text if long-form reading is prioritised. Both have better reading rhythm than Playfair at 16px body text. But for short-form briefing cards, Playfair is appropriate and correct — no change needed if cards stay card-length.

### Type Scale (the single most important change)

Replace all ad-hoc `text-[Npx]` values with a consistent named scale. Add this to `tailwind.config.ts` under `theme.extend.fontSize`:

```typescript
fontSize: {
  // Display — Playfair Display only
  'display-lg': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],  // 36px
  'display-md': ['1.75rem', { lineHeight: '1.2',  letterSpacing: '-0.015em' }], // 28px
  'display-sm': ['1.375rem', { lineHeight: '1.3',  letterSpacing: '-0.01em' }], // 22px
  // Body — Inter
  'body-lg':    ['1rem',     { lineHeight: '1.7',  letterSpacing: '0' }],        // 16px
  'body-md':    ['0.9375rem',{ lineHeight: '1.7',  letterSpacing: '0' }],        // 15px — keep for secondary text
  'body-sm':    ['0.8125rem',{ lineHeight: '1.6',  letterSpacing: '0' }],        // 13px
  // Label — mono
  'label':      ['0.6875rem',{ lineHeight: '1.4',  letterSpacing: '0.1em' }],   // 11px
  'label-sm':   ['0.625rem', { lineHeight: '1.4',  letterSpacing: '0.12em' }],  // 10px
}
```

This replaces every `text-[Npx]` with a semantic name (`text-display-md`, `text-body-lg`, `text-label`) that communicates intent and enforces consistency.

**Why this is the highest-leverage change:** A type scale creates visual hierarchy without adding whitespace. Premium products feel premium because the eye knows exactly where it is in the information hierarchy. Ad-hoc sizes make every heading compete.

### Spacing Scale (the second most important change)

Add named spacing tokens to replace arbitrary margin/padding values:

```typescript
spacing: {
  // Micro — within components
  'xs': '0.25rem',   // 4px  — gap between icon and label
  'sm': '0.5rem',    // 8px  — gap within chip, between related elements
  // Component — between component parts
  'md': '0.75rem',   // 12px — gap between header elements
  'lg': '1.25rem',   // 20px — gap between sections within a card
  // Section — between major content blocks
  'xl': '2rem',      // 32px — gap between briefing sections
  '2xl': '3rem',     // 48px — gap between major page sections
}
```

These extend Tailwind's defaults — they don't replace them. The goal is replacing `mb-8 mb-6 mb-5 mb-3` patterns with `mb-lg mb-xl` semantic spacing.

### Border Radius System (eliminate the mismatch)

The current codebase mixes `rounded-sm`, `rounded-lg`, and `rounded-xl`. For a newspaper/editorial feel, the rule is:

- **Content surfaces** (story cards, article containers, blockquotes): `rounded-none` or Tailwind's smallest built-in `rounded-sm` (2px) — the newspaper doesn't round its columns.
- **Interactive elements** (buttons, chips, badges): `rounded` (4px, Tailwind default) — enough to signal "clickable", not enough to shout "app".
- **Floating elements** (dropdowns, tooltips, modals): `rounded-md` — standard UI element rounding.

Never use `rounded-xl` or `rounded-lg` for content surfaces. The hero's `rounded-xl` buttons are the loudest design inconsistency in the current codebase.

**Config change:**
```typescript
borderRadius: {
  'none': '0',
  'sm': '2px',    // content surfaces
  DEFAULT: '4px', // interactive elements
  'md': '6px',    // floating UI
  'lg': '8px',    // kept for shadcn compatibility
  'xl': '12px',   // kept for shadcn compatibility
}
```

The key is enforcing `rounded-sm` (not `rounded-lg` or `rounded-xl`) on all content surfaces in the application.

### Color System (refine, don't replace)

The stone palette is correct. Two refinements:

**1. Add a paper-warm background variant.** Pure `stone-50` (#fafaf9) is fine but slightly clinical. Consider a custom CSS variable `--paper: oklch(98.5% 0.004 80)` — a hair warmer than stone-50, perceptible only in comparison but immediately "feels like paper" rather than "white screen with grey tint."

```css
:root {
  --paper: oklch(98.5% 0.004 80);
  --paper-dark: oklch(11% 0.006 80);
}
```

**2. Reduce stone-400 to stone-500 for secondary text in light mode.** Current secondary text (`text-stone-400`) is too light on the `stone-50` background — it achieves roughly 3.5:1 contrast ratio, which is below the 4.5:1 WCAG AA standard. Bumping secondary text to `stone-500` (roughly 5.5:1) makes the page feel crisper and passes accessibility requirements. This is especially visible on the strapline and section labels.

### shadcn/ui Customisation Pattern

shadcn/ui is customised via CSS variables in `globals.css`, not by modifying component files. The current `--radius: 0.5rem` is too round for the editorial direction. Change to:

```css
:root {
  --radius: 0.25rem; /* was 0.5rem — too rounded for newspaper feel */
}
```

This affects all shadcn components (Button, Card, Badge, Input, etc.) globally. Combined with the border-radius audit above, this single variable change removes a large amount of the "SaaS app" feeling from shadcn primitives.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Serif font | Playfair Display (keep) | Source Serif 4 | Source Serif 4 is better for long-form body reading but Folio uses short card excerpts — Playfair's display character is appropriate. Switch only if a long-form article mode is added. |
| Mono font | DM Mono | JetBrains Mono (keep, tune it) | DM Mono has better editorial register; JetBrains Mono is fine if tracking is reduced. Either works. Lower risk to tune JetBrains Mono than swap fonts. |
| Type scale method | Custom named scale in config | `@layer base` typography defaults | Named scale is more explicit, avoids specificity conflicts with shadcn, and is more maintainable for a solo developer. |
| Border radius direction | Sharper (0.25rem) | Remove radius entirely | Zero radius looks stark for a consumer product. 2px minimum radius on interactive elements preserves the "clickable" signal. |
| Color palette | Stone (keep) | Sepia/warm grey custom palette | Custom palette is a colour distraction from a Tailwind project. Stone is close enough to "warm paper" that tuning the CSS variable is sufficient. |
| Tailwind prose plugin | Add `@tailwindcss/typography` | Hand-roll article styles | The `prose` plugin would help the article (`/story/[id]`) view but adds 300kb to the CSS budget unless content-escaped. Since the app controls all content (no markdown), hand-rolled styles are fine and keep the build lean. |

---

## What Distinguishes Premium from Cheap in This Context

These are the specific signals that separate a premium editorial product from a vibecoded side project, in order of impact:

### 1. Consistent type scale (highest impact)
Cheap: `text-[13px]`, `text-[14px]`, `text-[15px]`, `text-[16px]`, `text-[19px]`, `text-[21px]` — every size chosen independently.
Premium: Four or five named sizes derived from a ratio (major second 1.125 or minor third 1.2). Every typographic element uses a named slot, never a raw pixel value.

### 2. Optical letter-spacing compensation
Cheap: Same `tracking-tight` for a 10px label and a 36px headline.
Premium: Large display type (`>24px`) needs slight negative tracking (-0.01em to -0.02em). Small text (`<12px`) needs neutral or slight positive tracking. Mono labels at uppercase need measured positive tracking (0.08–0.12em, not 0.25em).

### 3. Line height discipline
Cheap: `leading-snug`, `leading-relaxed`, `leading-[1.65]`, `leading-[1.75]` mixed freely.
Premium: Display text uses `1.15–1.25`. Body text uses `1.6–1.7`. UI elements (labels, buttons) use `1.4`. Three values, applied consistently.

### 4. Border radius coherence
Cheap: `rounded-sm` on cards, `rounded-xl` on buttons in the same view.
Premium: One radius system. Editorial products are closer to 0 than 16px.

### 5. Surface and depth model
Cheap: Every card has the same visual weight.
Premium: Surfaces have a clear depth hierarchy. Page background (lightest) → cards (slight elevation via `border`) → interactive elements (slight shadow or tonal shift on hover). No box shadows — use borders and background tones instead. Box shadows look like Bootstrap.

### 6. Whitespace that means something
Cheap: Margins chosen to "look spaced out" — no relationship between spacing values.
Premium: Spacing values are multiples of a base unit (typically 4px or 8px). The relationship between consecutive spacing values matters: 4 → 8 → 16 → 32 (doubling) or 4 → 8 → 12 → 20 → 32 (Fibonacci-ish). When spacing is proportional, pages feel "settled."

### 7. Micro-typography attention
Cheap: Straight quotes, no ellipsis control, no hanging punctuation.
Premium: `&ldquo;` / `&rdquo;` (already done in the talking points blockquote), `…` entity rather than `...`, negative text-indent on block quotes to hang the opening mark.

### 8. Interaction states as design
Cheap: `hover:opacity-80` everywhere.
Premium: Different interaction states for different surface types. Links get underlines with `underline-offset-2 decoration-stone-300`. Cards get `border-stone-300 dark:border-stone-700` on hover (border colour shift, not opacity change). Primary buttons get `hover:bg-stone-800` (colour shift). Opacity-based hover is a "set it and forget it" pattern that premium products avoid.

### 9. Focus styles that aren't the default
Cheap: Browser default blue focus ring.
Premium: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500` — matches the design system, appears only on keyboard navigation.

### 10. The "paragraph lead"
Cheap: Article summaries begin with the first word of the text.
Premium: The first paragraph of article text uses a slightly larger `text-body-lg` and `leading-[1.8]` (looser than body). Some use a small-caps initial word or initial letter. At minimum, give the lead paragraph different treatment from subsequent paragraphs.

---

## What NOT to Do

### Anti-Patterns That Cheapen the Design

**Gradient backgrounds on headlines or hero sections.** The FT doesn't use gradient text. Text-gradient is a 2021 design trend that now signals "trying to look modern." Stone palette headings, no gradient.

**Box shadows.** `shadow-md`, `shadow-lg` on cards look like Bootstrap components. For this design language, border + background color shift is the correct elevation signal. If depth is needed, use `shadow-[0_1px_3px_rgba(0,0,0,0.06)]` — barely visible, creates lift without looking like a UI library.

**Placeholder text as body copy.** `text-stone-400` on long body text (not labels) is under-contrast. Only use stone-400/500 for metadata, labels, and supporting text. Body paragraphs need `stone-700 dark:stone-300` minimum.

**`rounded-xl` on content surfaces.** Content cards aren't app cards. The story card border radius should be `rounded-sm` (2px). The LandingHero's CTA button uses `rounded-xl` — this is the single most visually jarring inconsistency in the current codebase because it clashes with every other UI element on the page.

**All-caps Playfair Display.** Playfair's lowercase is where its elegance lives. `font-serif uppercase` looks heavy and generic. Use sans-serif (Inter or `font-mono`) for uppercase labels, never serif.

**Arbitrary `text-[Npx]` values in new components.** Once a type scale is defined, every new component must use it. An arbitrary pixel value in a new component signals that the designer stopped caring.

**More than two font weights per typeface in active use.** Playfair at 400 and 700 (or 900 for large display). Inter at 400 and 600. JetBrains Mono at 400 only. More weights fragment the visual weight hierarchy.

**`transition-all` on anything.** `transition-all` transitions every CSS property including layout-triggering properties. Use specific transitions: `transition-colors`, `transition-opacity`. This matters for performance and control.

---

## Specific File Changes Required

These are the files that need editing to implement the above recommendations:

| File | Change | Impact |
|------|--------|--------|
| `tailwind.config.ts` | Add `fontSize` type scale, reduce `--radius`, add named spacing tokens | HIGH — system-wide |
| `app/globals.css` | Add `--paper` CSS var, bump secondary text to `stone-500`, add focus-visible styles | HIGH — system-wide |
| `components/LandingHero.tsx` | Replace `rounded-xl` with `rounded` on buttons; fix hover states | HIGH — first impression |
| `components/StoryCard.tsx` | Replace `text-[19px] sm:text-[21px]` with `text-display-sm`; adjust leading | HIGH — core UI |
| `components/ArticleStory.tsx` | Replace `text-[26px] sm:text-[32px]` with `text-display-md sm:text-display-lg`; adjust leading on lead paragraph | HIGH — premium feel |
| `components/Header.tsx` | Increase `h-[3px]` to `h-1` (4px) for a more confident top rule | LOW — subtle |
| All components | Audit and replace `hover:opacity-80` with semantic hover states per surface type | MEDIUM — polish |
| All components | Audit and replace `rounded-xl` / `rounded-lg` on content surfaces | HIGH — coherence |

---

## Installation

No new packages required. All changes are configuration and CSS.

If DM Mono is chosen to replace JetBrains Mono, the only change is in `app/layout.tsx`:

```typescript
import { DM_Mono } from 'next/font/google';

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
```

DM_Mono is available in `next/font/google` with no additional installation. (MEDIUM confidence — verified from training knowledge of next/font/google font list as of mid-2025.)

---

## Sources

- Direct codebase analysis: `tailwind.config.ts`, `app/globals.css`, `components/StoryCard.tsx`, `components/ArticleStory.tsx`, `components/Header.tsx`, `components/LandingHero.tsx`, `components/BriefingView.tsx` (read 2026-03-09)
- Tailwind CSS v3 documentation — type scale, spacing scale, border radius system (training knowledge, HIGH confidence for v3 specifics)
- Playfair Display typographic behaviour — known editorial usage (The Economist, FT Weekend supplements, Condé Nast publications), training knowledge, HIGH confidence
- DM Mono — Google Fonts typeface, designed by Colophon Foundry for editorial annotation contexts, training knowledge MEDIUM confidence
- shadcn/ui CSS variable customisation — `--radius` and theme token system, training knowledge HIGH confidence for stone base colour variant
- WCAG 2.1 contrast ratios — 4.5:1 for normal text AA standard, HIGH confidence
- `next/font/google` DM_Mono availability — MEDIUM confidence (training knowledge, verify against current Google Fonts list before implementing)
