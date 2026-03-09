# Phase 2: Shell - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply the Phase 1 design tokens to the Header component and complete the site footer with all required links. These two structures appear on every page of Folio. Phase 2 delivers the shell — no content card or page-level components are touched. Those belong to Phase 3+.

</domain>

<decisions>
## Implementation Decisions

### Footer links
- **Feedback** → `mailto:hello@folioapp.co.uk` (simple, no setup, direct)
- **LinkedIn** → `https://www.linkedin.com/in/gregory-vitrenko-7258a0350` (personal profile — used for Folio marketing)
- Keep existing: **Terms** → `/terms`, **Privacy** → `/privacy`, **Contact** → `mailto:hello@folioapp.co.uk`
- Final footer link order: Feedback · Terms · Privacy · Contact · LinkedIn

### Footer sticky layout
- Body element needs `flex flex-col` added alongside existing `min-h-screen`
- The content wrapper (`{children}`) needs `flex-1` so the footer pins to the bottom on short pages
- The SiteFooter already has `mt-auto` — the flex fix makes it effective

### Header token migration (SHELL-01)
- **Date label** (`text-[11px]` mono): migrate to `text-label` (10px) or `text-caption` (13px) — Claude's discretion, stay within the editorial mono label pattern
- **Folio wordmark text** (`text-[32px] sm:text-[38px]`): use `text-display` (2.25rem / 36px) for both breakpoints — removes responsive arbitrary size, accepts the 2px delta from 38px. The FolioMark SVG logo stays as-is.
- **Nav trigger labels** (`text-[11px]`): migrate to `text-label` (10px) or nearest named token — Claude's discretion
- **Header background**: migrate `bg-stone-50 dark:bg-stone-950` to `bg-paper dark:bg-paper` — the paper token is warm white (hsl(40 20% 98%)) in light mode and warm dark (hsl(20 10% 6%)) in dark mode, visually near-identical to stone-50/950
- **Preserve non-negotiables**: thick top rule (3px bg-stone-900/stone-100), sticky positioning, the 3-column grid layout, border-b separator — do not touch these
- **Nav dropdown panel**: migrate `bg-stone-50 dark:bg-stone-950` to `bg-paper dark:bg-paper` for consistency

### Mobile header date
- Claude's discretion: keep `hidden sm:block` on the date label — mobile shows logo + auth only, which is correct for a narrow viewport

### What NOT to touch
- NavDropdowns logic (hover/click, groups, items) — Phase 3+ handles hover states
- The `hover:opacity-75` on the logo link — Phase 3 removes `hover:opacity-*` patterns
- Any page-level components or content cards
- `ThemeToggle`, `AuthButtons`, `FolioMark` component internals

</decisions>

<specifics>
## Specific Ideas

- LinkedIn link should open in a new tab (`target="_blank" rel="noopener noreferrer"`) — it's an external URL
- mailto links should NOT open in a new tab (standard browser behaviour handles these)
- The footer link label "Feedback" is clear and friendly — no need to change it

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/Header.tsx` — fully built header, needs token migration only (2 rows: brand + nav)
- `components/SiteFooter.tsx` — exists with Terms/Privacy/Contact, needs LinkedIn + Feedback links added
- `components/NavDropdowns.tsx` — nav group logic with dropdown panels; uses `bg-stone-50 dark:bg-stone-950` on panel background
- `app/layout.tsx` — imports SiteFooter, renders after `{children}` inside Providers

### Established Patterns
- Stone palette: `bg-stone-50 dark:bg-stone-950` for surfaces → migrating to `bg-paper dark:bg-paper`
- Section label: `font-mono text-[10px] tracking-widest uppercase text-stone-400` → can use `.section-label` class from Phase 1
- Border: `border-stone-200 dark:border-stone-800` — standard throughout, keep as-is
- `max-w-5xl mx-auto px-4 sm:px-6` — standard container width used in both header and footer, keep

### Integration Points
- `app/layout.tsx` body: add `flex flex-col` to existing `min-h-screen` classes
- `app/layout.tsx` children wrapper: need to wrap `{children}` in a `<main className="flex-1">` or add `flex-1` to the containing element so footer pins to bottom
- `SiteFooter` already has `mt-auto` — the flex layout fix makes this effective
- The `bg-paper` Tailwind utility was added in Phase 1 and references `hsl(var(--paper))`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-shell*
*Context gathered: 2026-03-09*
