# Folio Design Spec

Stack: Next.js 15 App Router, React 19, Tailwind CSS 3, shadcn/ui. Every component and page must strictly follow this spec. When code conflicts, treat the spec as authoritative. Do not invent new colors, radii, fonts, sizes, or spacing. Reference this file in all frontend tasks.

*Last updated: v3 Design Refresh & Features (2026-03-12)*

---

## Fonts

Three fonts only. Never use system-ui or fallbacks directly.

| Role | Family | Tailwind class |
|------|--------|----------------|
| Headings, brand, article titles | Playfair Display | `font-serif` |
| Body copy, nav, UI | Inter | `font-sans` |
| Labels, metadata, dates | JetBrains Mono | `font-mono` |

**Ban:** Arbitrary font classes. Always use these three. Do not reintroduce `font-mono` in body/UI contexts — it belongs only on `.section-label`, dates, and metadata.

---

## Type Scale

Use semantic tokens. Ban raw pixels like `text-[13px]`, `text-[10px]`.

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `text-display` | 36px | bold | Hero headline only |
| `text-heading` | 24px | semibold | H1/H2 section headings |
| `text-subheading` | 18px | medium | H3, card titles |
| `text-article` | 28px | bold | Article page headline |
| `text-body` | 16px | normal | Paragraphs (bumped from 15px in v1.2) |
| `text-caption` | 13px | normal | Secondary text, excerpts |
| `text-label` | 11px | semibold | Labels, badges — always with `font-mono uppercase tracking-widest` |

**Ban:** Arbitrary sizes. Always use tokens.

---

## Colors

### Base palette

| Role | Value | Tailwind class | Use |
|------|-------|----------------|-----|
| Page background | `#F9F7F2` | `bg-paper` | Every page — warm cream, not cold white |
| Surface / card | `#FFFFFF` | `bg-white dark:bg-stone-900` | Cards, sections |
| Ink / text | `#1A1A1A` | `text-stone-900 dark:text-stone-100` | Primary text |
| Border | — | `border-stone-200 dark:border-stone-800` | Edges |
| Divider | — | `divide-stone-100 dark:divide-stone-800` | Lists |
| Text secondary | — | `text-stone-500 dark:text-stone-400` | Subtext |
| Text muted | — | `text-stone-400 dark:text-stone-500` | Labels |
| Chip bg | — | `bg-stone-100 dark:bg-stone-800` | Tags |

### Accent (v3)

The primary action/accent colour is **charcoal** (`#2D3436`) — registered as `accent` in `tailwind.config.ts`. Use for: CTA buttons, active states, hero backgrounds, highlighted elements.

| Role | Class | Use |
|------|-------|-----|
| Accent fill | `bg-[#2D3436]` or `bg-accent` | CTA buttons, hero blocks, active tabs |
| Accent text | `text-[#2D3436]` or `text-accent` | Accent text on light backgrounds |
| Accent border | `border-[#2D3436]` or `border-accent` | Accent borders, note callouts |
| Accent hover | `hover:bg-accent/90` | Button hover state |

**Oxford blue (#002147) is retired as of v3.** Do not introduce new `bg-[#002147]` or `oxford-blue` usages. Existing instances should be migrated to charcoal on next touch.

### CTA buttons

```tsx
// Primary (filled accent)
<button className="px-6 py-3 rounded-chrome bg-[#2D3436] text-white text-caption font-medium hover:bg-[#2D3436]/90 transition-all duration-200">

// Secondary (bordered)
<button className="px-6 py-3 rounded-chrome border border-stone-300 dark:border-stone-700 text-caption font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-200">
```

### Topic accent colors (dots/labels only — never layouts)

| Topic | Dot | Label |
|-------|-----|-------|
| M&A | `bg-blue-700 dark:bg-blue-400` | `text-blue-800 dark:text-blue-300` |
| Capital Markets | `bg-violet-700 dark:bg-violet-400` | `text-violet-800 dark:text-violet-300` |
| Banking & Finance | `bg-orange-700 dark:bg-orange-400` | `text-orange-800 dark:text-orange-300` |
| Energy & Tech | `bg-emerald-700 dark:bg-emerald-400` | `text-emerald-800 dark:text-emerald-300` |
| Regulation | `bg-amber-700 dark:bg-amber-400` | `text-amber-800 dark:text-amber-300` |
| Disputes | `bg-rose-700 dark:bg-rose-400` | `text-rose-800 dark:text-rose-300` |
| International | `bg-teal-700 dark:bg-teal-400` | `text-teal-800 dark:text-teal-300` |
| AI & Law | `bg-indigo-700 dark:bg-indigo-400` | `text-indigo-800 dark:text-indigo-300` |

**Ban:** New colors. Zinc in content areas (chrome/nav only). No emojis.

---

## Radius

Semantic tokens only — registered via CSS variables in `globals.css` and consumed by `tailwind.config.ts`.

| Token | CSS var | Value | Use |
|-------|---------|-------|-----|
| `rounded-card` | `--radius-card` | 24px (1.5rem) | Cards, sections, panels |
| `rounded-chrome` | `--radius-chrome` | 16px (1rem) | Buttons, inputs, chips, tabs |
| `rounded-pill` | — | 9999px | Pill tags, badges |

**Ban:** `rounded-sm`, `rounded-xl`, `rounded-lg`, `rounded-md` directly on new components. Always use the named tokens.

---

## Layout

- Every page wrapper: `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8`
- Standard page padding: `py-8 lg:py-12`
- Major section gap: `mb-8 lg:mb-12`
- Card internal padding: `p-6`
- Grid gap: `gap-4 lg:gap-6`

---

## Components

### Section label (overline)

```tsx
<span className="section-label">Category</span>
```

Defined in `globals.css`: `font-mono text-[11px] tracking-widest uppercase text-stone-400 dark:text-stone-500`

### Page heading (v3 standard — all pages)

Every primary content page uses this pattern: small overline label → large serif title → optional description. Match the AI Studio mockup heading style.

```tsx
<div className="space-y-4 mb-12">
  <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">
    Overline Label
  </span>
  <h2 className="text-5xl font-serif">Page Title</h2>
  <p className="max-w-xl opacity-60 text-lg font-light">Optional description.</p>
</div>
```

**Ban:** The old icon + title + count badge pattern is retired for main page headings. Count badges may still appear in secondary contexts (e.g. filter chips).

### Section divider

```tsx
<div className="flex items-center gap-4 mb-6">
  <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
  <span className="section-label flex-shrink-0">Label</span>
  <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
</div>
```

### Content card

```tsx
<div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 hover:bg-stone-50 dark:hover:bg-stone-800/40 hover:border-stone-300 transition-all duration-200">
```

### Chip / tag

```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-chrome bg-stone-100 dark:bg-stone-800 text-label border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
```

### Callout / info box

```tsx
<div className="flex items-start gap-3 rounded-card bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 p-4">
  <Icon size={14} className="mt-0.5 shrink-0 text-stone-400 dark:text-stone-500" />
  <p className="text-caption leading-relaxed text-stone-500 dark:text-stone-400">Content</p>
</div>
```

### Accent hero block

Used for quiz hero, podcast hero, featured CTA panels:

```tsx
<div className="rounded-card bg-[#2D3436] text-white p-10 relative overflow-hidden">
  {/* Optional ambient glow */}
  <div className="pointer-events-none absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 70% 80% at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />
  <div className="relative z-10">
    {/* content */}
  </div>
</div>
```

---

## Home Page Layout (v3)

The briefing home page uses a newspaper layout on desktop. Do **not** revert to the flat 2-column grid.

```
Desktop (lg+):
┌─────────────────────────┬──────────────────┐
│  Lead Story (col-span-8) │ Sidebar (col-span-4) │
│  Large serif headline    │ Secondary stories   │
│  Full excerpt            │ (stories 2–4+)      │
│  Topic badge             │                     │
│  Read more link          │                     │
└─────────────────────────┴──────────────────┘
Mobile: Full-width single column
```

The lead story is always `stories[0]`. The sidebar shows `stories[1..n]`.

---

## Archive Layout (v3)

The `/archive` page is a unified 3-column grid:

```
┌──────────────┬──────────────┬──────────────┐
│  Briefings   │   Quizzes    │   Podcasts   │
│  date list   │  date list   │  date list   │
└──────────────┴──────────────┴──────────────┘
```

Each column links to the relevant `/{section}/[date]` route.

---

## Do / Don't

**Do:**
- Use semantic tokens everywhere (`text-caption`, `rounded-card`, `rounded-chrome`)
- Apply `.section-label` utility to all overline/category labels
- Use `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8` on every page wrapper
- Add `transition-all duration-200` to all interactive cards and buttons
- Use `font-serif` for headings, `font-sans` for body/UI, `font-mono` for labels/metadata
- Use `bg-paper` (`#F9F7F2`) as the page background — never `bg-white` or `bg-stone-50` at page level
- Use charcoal `#2D3436` for all CTA buttons and primary accent elements

**Don't:**
- Raw pixel font sizes (`text-[13px]` → `text-caption`; `text-[10px]` → `text-label`)
- `rounded-sm` or `rounded-xl` — migrate to `rounded-card` or `rounded-chrome`
- Arbitrary colors or spacing outside the tokens above
- Zinc in content areas (chrome/nav only)
- Shadows heavier than `shadow-md`
- Emojis anywhere in the UI
- Oxford blue `#002147` — retired as of v3, use charcoal `#2D3436`
- Cold white `bg-white` or `bg-stone-50` at the page level — always `bg-paper`
- The old icon + count badge heading pattern for main page headings

---

## Prompt template (for design tasks with visual references)

Use this when giving Claude a screenshot from Mobbin, 21st.dev, or Google Stitch:

```
Remake this [page/component] using the attached screenshot as a layout reference.

STRICTLY follow docs/design.md:
- Colors: paper (#F9F7F2) background, charcoal (#2D3436) accent, stone palette for content
- Type: semantic tokens only (no text-[13px] etc.)
- Radius: rounded-card (24px) for cards, rounded-chrome (16px) for buttons/chips
- Heading: overline label + large serif title + optional description

Make it:
- Mobile-first
- Playfair serif for headings, Inter for body, JetBrains Mono for labels
- Accent hero blocks use bg-[#2D3436] text-white

Avoid:
- rounded-xl or rounded-sm
- Arbitrary spacing or pixel values
- Emojis or heavy gradients
- Zinc in content areas
- Oxford blue (#002147)

Output: complete Next.js component using Tailwind CSS.
```
