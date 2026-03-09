# Architecture Patterns: Design System Lift

**Domain:** Design system upgrade — existing Next.js 15 + Tailwind CSS 3 app
**Researched:** 2026-03-09
**Overall confidence:** HIGH (based on direct code audit, not web search)

---

## What the Code Audit Found

This section documents the current state before any changes. The design direction
(newspaper/editorial, stone/zinc palette, Playfair Display headings) is correct.
The execution has four structural problems that prevent it feeling premium.

### Problem 1: Palette Split is Inconsistently Applied (HIGH confidence)

The intent from CLAUDE.md is clear: stone for content, zinc for UI chrome. In
practice it is not enforced. Page-level audit shows 92 stone and 52 zinc
references interleaved across app pages:

- Content pages (home, story, article): `stone-*` throughout — correct
- Utility pages (archive, firms, upgrade): `zinc-*` for everything including
  body text and headings — inconsistent
- The upgrade page uses `zinc-900` for headings, `zinc-500` for body text,
  `zinc-50 dark:zinc-950` for page background — a completely different visual
  register from the home page

There is no rule enforcing which pages use which palette. Components placed on
content pages look editorially correct; the same atoms on zinc-base utility pages
feel disconnected.

### Problem 2: Border Radius Has No System (HIGH confidence)

Component-level count: `rounded-sm` (62 uses), `rounded-xl` (41 uses),
`rounded-full` (31 uses), `rounded-lg` (15 uses), `rounded-2xl` (6 uses).
Five radius values in active use with no documented rule for when to use each.

- StoryCard: `rounded-sm` — editorial, slightly sharp
- LandingHero recommendation block: `rounded-xl` — soft, app-like
- NavDropdown: `rounded-b-xl rounded-tr-xl` — custom combination
- Archive list: `rounded-xl` — app-like
- Upgrade page: `rounded-xl` on all cards

This is not random — there is a loose pattern (`rounded-sm` for editorial content
cards, `rounded-xl` for utility/chrome containers) but it is never explicit and
breaks down on pages like the upgrade page that use both.

### Problem 3: Typography Is Inline, Not Tokenized (HIGH confidence)

All font size, weight, and leading decisions are made inline in every component.
Audit found 16 distinct numeric font sizes in component files alone:
`text-[64px]`, `text-[38px]`, `text-[34px]`, `text-[32px]`, `text-[28px]`,
`text-[26px]`, `text-[22px]`, `text-[21px]`, `text-[20px]`, `text-[19px]`,
`text-[18px]`, `text-[17px]`, `text-[15px]`, `text-[13px]`, `text-[12px]`,
`text-[11px]`, `text-[10px]`, `text-[9px]` — plus Tailwind named scales
(`text-3xl`, `text-xl`, `text-sm`, `text-lg`).

There are no semantic type roles. The display size for a story card headline and
an article headline are different values (`text-[19px]` vs `text-[26px]`) but
nothing makes this relationship explicit or auditable.

### Problem 4: No Semantic Token Layer in CSS (HIGH confidence)

`globals.css` only contains shadcn's HSL variables (`--background`,
`--foreground`, etc.) which map approximately to stone. But nothing in the codebase
actually uses these shadcn semantic names for layout decisions. All components
reach directly for Tailwind utility classes like `bg-stone-50`,
`text-stone-900`, `border-stone-200`. The CSS variable layer exists but is
unused as a design token system.

This means every design change requires a grep-and-replace across 40+ components
rather than a single token update.

### What Is Already Good (Do Not Break)

- **Container width**: `max-w-5xl mx-auto px-4 sm:px-6` is used correctly and
  consistently on all page layouts. Do not change this.
- **Section labels**: `font-mono text-[10px] tracking-widest uppercase text-stone-400`
  is consistent across all components. This is the most recognisably "Folio"
  pattern.
- **Header structure**: thick top rule + 3-column grid (date | brand | auth) +
  nav row is solid and should not be restructured.
- **Topic colour system**: `TOPIC_STYLES` in `lib/types.ts` is the one
  well-defined token system in the codebase. Dot colours and label colours for
  8 topics are consistent everywhere.
- **Transition patterns**: `transition-colors` (91 uses) and `transition-opacity`
  (32 uses) are consistent. Do not add animation frameworks.
- **Font loading**: Playfair Display, Inter, JetBrains Mono loaded via
  `next/font/google` in `app/layout.tsx` with CSS variables. This is correct.

---

## Recommended Architecture for the Design Lift

### The Build Order

The build order is strictly dependency-driven. Tokens must exist before
components can use them. Components must be consistent before pages feel premium.

```
Step 1: Global tokens (globals.css + tailwind.config.ts)
   └── No component changes. Pure token definitions.

Step 2: Core shell (Header, SiteFooter, page container pattern)
   └── Tokens applied. Changes affect every page immediately.

Step 3: StoryCard + BriefingView (home page components)
   └── Highest visible surface. Most user-facing.

Step 4: ArticleStory (premium article view)
   └── The "reward" view. Sets premium register.

Step 5: LandingHero + upgrade page
   └── Conversion surfaces. Polish after content is right.

Step 6: Utility pages (archive, firms, quiz, tests)
   └── Apply consistent pattern; lower visual priority.
```

Do not skip steps. Attempting to polish StoryCard before tokens are established
means making the same decisions twice.

### Component Boundaries for the Lift

| Component | What to Touch | What to Leave Alone |
|-----------|--------------|---------------------|
| `globals.css` | Add semantic CSS custom properties for spacing, type scale, radius | shadcn HSL vars — leave as-is |
| `tailwind.config.ts` | Extend `theme.extend` with named spacing/radius tokens that reference CSS vars | Content config, safelist, plugins |
| `components/Header.tsx` | Typography sizing, spacing refinement | Three-column structure, sticky behaviour, thick top rule |
| `components/StoryCard.tsx` | Radius, card shadow, typography scale, hover state | Topic colour system (uses TOPIC_STYLES — correct) |
| `components/BriefingView.tsx` | Section divider pattern, "Start here" card style | Content layout, subscription gating |
| `components/ArticleStory.tsx` | Heading scale, body type size/leading, section label consistency | WhyItMatters layout (already structured well) |
| `components/LandingHero.tsx` | Heading scale, stage selector polish, CTA button | Personalised recommendation logic |
| `app/upgrade/page.tsx` | Palette alignment (move to stone), radius audit | Checkout logic, Stripe integration |
| Utility pages (`archive`, `firms`, `quiz`) | Apply stone heading pattern for consistency | Data fetching, business logic |

### The Token Layer Pattern

Add semantic CSS custom properties to `globals.css` for the three decisions that
are currently made ad hoc across the codebase:

**1. Radius tokens (what to add to `:root`)**

```css
--radius-card: 2px;      /* editorial content cards — maps to rounded-sm */
--radius-chrome: 12px;   /* utility containers, dropdowns — maps to rounded-xl */
--radius-pill: 9999px;   /* status badges — maps to rounded-full */
--radius-input: 4px;     /* form inputs */
```

Register these in `tailwind.config.ts`:

```ts
borderRadius: {
  card:   'var(--radius-card)',
  chrome: 'var(--radius-chrome)',
  pill:   'var(--radius-pill)',
  input:  'var(--radius-input)',
  // keep existing shadcn entries (lg, md, sm) unchanged
}
```

This does not require changing any existing component immediately — it makes the
system explicit so new work uses the named tokens, and existing `rounded-sm` /
`rounded-xl` usages can be migrated incrementally.

**2. Typography scale (what to add to `globals.css`)**

The in-code sizes cluster naturally into roles:

```css
/* Section meta labels */
--text-label:    10px;   /* font-mono tracking-widest uppercase */

/* Supporting text, chips, captions */
--text-caption:  11px;

/* Body prose, card excerpts */
--text-body:     13px;

/* Subheadings, callouts */
--text-sub:      15px;

/* Card headlines */
--text-heading:  20px;   /* currently 19px–22px, standardise to 20px */

/* Article headlines */
--text-article:  28px;   /* currently 26px–32px, standardise to 28px */

/* Hero / display */
--text-display:  38px;
```

These are not replacing Tailwind utilities in all components immediately. They
serve as a written contract that answers "what size is a card headline?" during
the lift. Components get updated one at a time to use the standardised size.

**3. The stone-vs-zinc rule (written explicitly, not in code)**

Write this rule in a comment block at the top of `globals.css` so it is visible
to whoever edits the file:

```
stone-*  → content areas: body text, article headings, story cards,
           briefing container, any surface that displays editorial content
zinc-*   → UI chrome: archive lists, quiz nav cards, upgrade page,
           onboarding, tracker — anything that is "app" not "newspaper"
```

This is currently documented in CLAUDE.md but not enforced in code. The only
mechanical enforcement available in Tailwind 3 is ESLint + a custom lint rule —
but for a solo project, a well-placed comment plus the code review habit is
sufficient.

---

## Key Files to Change for Maximum Impact

Listed in order of visual leverage — changing the early files visually affects
the most surface area:

### 1. `app/globals.css` — Highest leverage

**Why:** Loaded on every page. CSS custom properties set here affect all
components that reference them. Changes here are instant site-wide.

**What to add:**
- Semantic radius tokens
- Typography scale variables
- A brief stone-vs-zinc rule comment

**Risk:** Low. Adding CSS variables is additive — no existing classes break.
The only risk is a variable name collision with existing shadcn vars, which is
avoided by using a `--folio-` prefix or distinct names (`--radius-card` vs
`--radius`).

### 2. `tailwind.config.ts` — High leverage

**Why:** Extending `theme.extend` with named tokens lets components use
`rounded-card` instead of `rounded-sm`, making the radius system explicit. The
safelist for topic colours must not be changed.

**What to add:**
- `borderRadius` entries referencing CSS vars
- Optional: custom `fontSize` entries for the type scale

**Risk:** Low if additions only. Risk increases if existing keys are modified —
e.g. changing the `borderRadius.lg` value (used by shadcn components) would
break all shadcn UI elements simultaneously. Only add new keys; do not modify
existing ones.

### 3. `components/StoryCard.tsx` — High leverage

**Why:** 8 instances on every home page load. The most-viewed component.
StoryCard sets the editorial register that users see first.

**What to change:**
- `rounded-sm` → `rounded-card` (once token exists)
- Card headline size: standardise from `text-[19px] sm:text-[21px]` to the
  type scale value
- Hover state: current `hover:bg-stone-50` is subtle but correct — do not
  replace with shadow-based hover
- Consider adding a `border-l-2` accent in the topic colour on hover for a more
  premium editorial feel (Financial Times does this)

**Risk:** Medium. StoryCard is a client component with topic colour logic and
bookmark button positioning. Typography changes affect line wrapping and can
shift the bookmark icon overlap guard (`pr-6` padding).

### 4. `app/upgrade/page.tsx` — High leverage for conversion

**Why:** This is the paywall destination. It currently uses `zinc-*` throughout,
placing it in a different visual register from the content pages. A user who
clicks "Subscribe" from an editorial stone-palette page and lands on a zinc page
experiences a visual break in trust.

**What to change:**
- Replace `zinc-*` with `stone-*` for all text and background (page bg, card bg,
  heading colours, body text)
- The features card: currently `rounded-xl bg-white dark:bg-zinc-900` — should
  become `rounded-card bg-white dark:bg-stone-900`
- The CTA button: `bg-zinc-900` → `bg-stone-900` for consistency

**Risk:** Low. This page has no shared components — all styling is inline JSX
classes.

### 5. `components/Header.tsx` — Moderate leverage

**Why:** Appears on every page. The thick top rule (`h-[3px] bg-stone-900`) is
the single most recognisable brand element and must be preserved.

**What to change:**
- Consider refining the logo / wordmark sizing on mobile (currently `text-[32px]`
  drops to reading as quite large on a 375px viewport)
- Ensure the archive nav variant uses the same mono label pattern as the main nav

**Risk:** Low. Structure is solid. Changes should be cosmetic sizing only.

---

## Patterns to Follow

### Pattern 1: Token-First Update

**What:** When touching any component during the lift, replace hardcoded values
with token references before making aesthetic changes.

**When:** At the start of every component update.

**Why:** Changing `rounded-sm` to `rounded-card` and simultaneously changing
visual appearance in the same commit makes it impossible to know which change
caused a regression.

**Process:**
1. Commit 1: Replace hardcoded values with token references (no visual change)
2. Commit 2: Update the token value to achieve the new aesthetic

This means visual regressions (if any) are isolated to Commit 2.

### Pattern 2: Palette Audit Before Touching a Page

**What:** Before editing any page or component, grep for `zinc-` and `stone-`
in that file. Make a deliberate choice which to use for each element (content vs
chrome), then apply consistently within the file.

**When:** Start of every file edit in the design lift.

**Why:** The current inconsistency accumulated one file at a time. Without an
explicit check, the next edit will add more inconsistency.

### Pattern 3: Do Not Touch `lib/types.ts` TOPIC_STYLES

**What:** The topic colour system (`TOPIC_STYLES`) in `lib/types.ts` is
authoritative and used correctly across all components. It must not be merged
into the CSS token layer or changed.

**When:** Always.

**Why:** It is the one system that works. The safelist in `tailwind.config.ts`
covers all the dynamic class names generated from it. Any change risks purging
a topic colour from the build.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Rewriting Component Logic While Restyling

**What:** Changing data fetching, event handlers, or conditional rendering
during a visual edit.

**Why bad:** Causes non-visual regressions (auth, subscription gating, bookmark
state) that appear visually fine but break functionality.

**Instead:** One concern per PR. Style-only changes in isolation from logic changes.

### Anti-Pattern 2: Adding a Shadow System

**What:** Adding `box-shadow` or `drop-shadow` utilities to cards to achieve a
premium look.

**Why bad:** Shadows conflict with the newspaper/editorial aesthetic. The
current design uses borders (`border border-stone-200`) to define card
boundaries, which is the correct editorial pattern. FT, Bloomberg, The Economist
use ruled lines not shadows.

**Instead:** Refine border weight and colour. A `border-stone-300` on hover
instead of `border-stone-200` is sufficient interactive feedback.

### Anti-Pattern 3: Changing the shadcn CSS Variable Definitions

**What:** Modifying the HSL values in the `:root` and `.dark` blocks in
`globals.css` (the `--background`, `--foreground`, `--card` etc. variables).

**Why bad:** These drive shadcn/ui components. Changing them risks breaking the
quiz, tracker, firm-pack, and test interfaces which use shadcn primitives
(ScrollArea, Sheet, Dialog, etc.).

**Instead:** Add new semantic variables with distinct names alongside the
existing ones. Never modify existing variable values.

### Anti-Pattern 4: Global CSS Class Overrides

**What:** Adding `.card {}` or `.btn {}` style rules to `globals.css` or a
new CSS file to apply styles globally.

**Why bad:** Tailwind projects rely on utility composition. Global classes
create specificity conflicts that produce silent breakage in dark mode,
responsive variants, and hover states.

**Instead:** Use `@layer components` in `globals.css` only for multi-property
patterns that appear identically in 6+ places (e.g. the mono section label).
Even then, prefer a small React component (`<SectionLabel>`) over a CSS class.

### Anti-Pattern 5: Dark Mode Assumptions

**What:** Testing design changes in light mode only.

**Why bad:** Almost every class in this codebase has a paired `dark:` variant.
A change to `bg-white` that looks correct in light mode will leave the dark
mode counterpart `dark:bg-stone-900` untouched, creating an inconsistency.

**Instead:** All design changes must be verified in both modes. The ThemeToggle
is always visible in the header — use it on every component edit.

---

## Scalability Considerations

This is a solo-operated product with a £50/month budget cap. The design system
needs to be maintainable by one person with no design tool budget. That shapes
the architecture:

| Concern | Approach |
|---------|----------|
| Token management | CSS custom properties in globals.css, not a design tokens JSON file or separate package |
| Documentation | Comments in globals.css and tailwind.config.ts, not a Storybook |
| Dark mode | Tailwind `dark:` variants — already the pattern. No CSS-in-JS needed. |
| Component library | shadcn/ui for interactive primitives, custom for editorial display components. Do not add Radix primitives that are not already in use. |
| Type scale enforcement | Convention + code review. ESLint plugin for Tailwind exists but adds configuration overhead not justified for solo work. |

---

## Phase Structure Recommendation

Based on the architecture, the design lift should be a single milestone with
these phases in strict sequence:

**Phase 1: Tokens (globals.css + tailwind.config.ts)**
- Write the radius token system
- Write the type scale variables
- Write the stone-vs-zinc comment rule
- Zero visual change — this is scaffolding only
- Time estimate: 2–4 hours
- Risk: Low

**Phase 2: Shell (Header + SiteFooter + page container)**
- Apply tokens to Header (sizing refinements)
- Verify consistent page container pattern across all pages
- Time estimate: 2–3 hours
- Risk: Low

**Phase 3: Content surfaces (StoryCard + BriefingView + ArticleStory)**
- These are the editorial core. Highest visual impact.
- StoryCard: radius token, headline scale
- ArticleStory: heading scale, body leading
- BriefingView: section divider refinement, "Start here" card
- Time estimate: 4–6 hours
- Risk: Medium (typography changes affect layout)

**Phase 4: Conversion surfaces (LandingHero + upgrade page)**
- Palette alignment on upgrade page (zinc → stone)
- LandingHero heading scale and CTA refinement
- Time estimate: 2–3 hours
- Risk: Low

**Phase 5: Utility pages (archive, firms, quiz, tests, primers)**
- Apply consistent page heading pattern
- Audit and align palette per the stone-vs-zinc rule
- Time estimate: 3–4 hours per cluster of pages
- Risk: Low (no shared component changes)

---

## Risk Areas

| Area | Risk | Mitigation |
|------|------|-----------|
| shadcn CSS variable modification | HIGH — breaks all shadcn components silently | Add only new vars; never modify existing HSL values |
| StoryCard typography changes | MEDIUM — affects bookmark icon positioning (pr-6 guard) | Test headline wrapping at multiple lengths after change |
| tailwind.config.ts safelist | MEDIUM — removing or changing safelist breaks topic colours at runtime | Treat safelist as read-only; only add to it |
| Dark mode verification | MEDIUM — changes to background/text classes must be paired | Test toggle on every component after edit |
| upgrade page palette change | LOW — isolated file, no shared components | Verify Stripe checkout flow still launches after edit |

---

## Sources

All findings based on direct code audit of the Folio codebase (2026-03-09).

Key files audited:
- `app/globals.css` — current CSS variable state
- `tailwind.config.ts` — token and colour configuration
- `app/layout.tsx` — font loading, body baseline
- `components/Header.tsx` — shell pattern
- `components/StoryCard.tsx` — content card pattern
- `components/BriefingView.tsx` — page composition
- `components/ArticleStory.tsx` — premium content pattern
- `components/LandingHero.tsx` — conversion pattern
- `components/NavDropdowns.tsx` — interactive chrome
- `components/SiteFooter.tsx` — chrome footer
- `app/upgrade/page.tsx` — paywall conversion page
- `app/archive/page.tsx` — utility page pattern
- `app/firms/page.tsx` — utility page pattern
- `lib/types.ts` — TOPIC_STYLES token system

Confidence: HIGH for all structural findings (based on direct code count/audit).
No web search was available during this research session — patterns and
recommendations draw from training knowledge of Tailwind CSS 3 + Next.js 15
design system conventions (August 2025 cutoff).
