# Phase 4: Conversion Surfaces - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the upgrade page and LandingHero — the two surfaces where a free user decides whether to subscribe. Scope: `app/upgrade/page.tsx` and `components/LandingHero.tsx` only. Migrate zinc → stone palette, rewrite copy to outcome-framing, add social proof placeholder slots, fix CTA radius and hover state. No new premium features, no checkout flow changes, no page restructuring beyond adding SiteFooter.

</domain>

<decisions>
## Implementation Decisions

### Zinc → stone palette migration (CONV-01)
- ALL zinc instances in `upgrade/page.tsx` migrate to stone equivalents, one-for-one:
  - `text-zinc-*` → `text-stone-*`
  - `bg-zinc-*` → `bg-stone-*`
  - `border-zinc-*` → `border-stone-*`
  - `divide-zinc-*` → `divide-stone-*`
  - `dark:bg-zinc-*` → `dark:bg-stone-*` etc.
- `rounded-xl` → `rounded-card` on the features card and free-tier note
- `rounded-xl` → `rounded-chrome` on the CTA button
- The custom header and its minimal structure stay — it's intentionally stripped of nav to keep the funnel clean
- `bg-stone-50 dark:bg-stone-950` on the page wrapper is correct and already matches (top-level div was already stone, only inner elements were zinc)

### Arbitrary text sizes → tokens (CONV-01, part of palette cleanup)
- `text-[10px] tracking-widest uppercase` (Premium label) → apply `.section-label` class (it's mono + tracking-widest + uppercase — perfect match)
- `text-[14px]` (tagline, CTA button text) → `text-caption`
- `text-[13px]` (feature items) → `text-caption`
- `text-[12px]` (free tier note, back link, error) → `text-label`
- `text-[11px]` (reassurance below CTA) → `text-label`
- `h2 text-3xl` (£4/month heading) → `text-article` (28px — 2px delta acceptable, closest token without adding one)
- `hover:opacity-75` on header logo → `hover:text-stone-600 dark:hover:text-stone-400 transition-colors` (same pattern as fixed in Header.tsx)

### Outcome-framed copy (CONV-02)
Replace `PREMIUM_FEATURES` array with outcome-leading copy (benefit first, mechanism second):
```ts
const PREMIUM_FEATURES = [
  'Walk into interviews with a point of view — full analysis and structured talking points for every deal',
  'Lock in the facts — 24 daily quiz questions keep your recall interview-sharp',
  'Know your target firms cold — interview packs with practice Qs and "why this firm?" angles for 38 firms',
  'Speak the language of deals — sector primers covering M&A, Capital Markets, Disputes & more',
  'Stay informed on the commute — audio briefing keeps you ahead without adding desk time',
  'Build your knowledge base — full archive and bookmarks for structured, long-term prep',
];
```
Tagline under £4/month stays as-is — "Turn today's deals into confident interview answers in 10 minutes a day" is already outcome-framed.

### Social proof slots (CONV-03)
- Add between features card and free-tier note
- Two elements:
  1. Student count badge: `<p>` with `.section-label` class — "Join 200+ law students" (placeholder number, update when real data available)
  2. Testimonial quote: blockquote-style with quote in `text-caption italic` and attribution in `text-label` — placeholder copy indicating real testimonial to be sourced
- Container: `text-center mb-6` — simple, no border, no card wrapper — keeps it light
- No special social proof "card" — editorial restraint, one quote, one count

### CTA hover state (CONV-01 + CONV-04)
- Upgrade page CTA: `hover:opacity-80 transition-opacity` → `hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors`
- LandingHero CTA: `hover:opacity-80 transition-opacity` → `hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors`
- Pattern already used in BriefingView and MidGridNudge (established in Phase 3)

### LandingHero CTA radius (CONV-04)
- CTA `<Link>`: `rounded-xl` → `rounded-chrome` (4px — matches button token system)
- While touching the file, Claude's discretion to tidy:
  - Stage selector buttons: `rounded-lg` → `rounded-chrome`
  - Personalised recommendation panel: `rounded-xl` → `rounded-card`
  - Links inside recommendation: `rounded-lg` → `rounded-chrome`
  - `text-[13px]` instances → `text-caption`
  - Top label `font-mono text-[10px] tracking-widest uppercase text-stone-400` → `.section-label text-stone-400 dark:text-stone-500` (apply class, keep explicit stone colour — `.section-label` doesn't prescribe colour)
- Hero headline `text-3xl sm:text-4xl` — leave as responsive pair, no clean token mapping exists (30px sits between `text-heading` and `text-article`)

### Page structure
- Keep custom minimal header on upgrade page (clean funnel — no nav distractions)
- Add `<SiteFooter />` to upgrade page: import SiteFooter and render it as the last child of the outer `min-h-screen flex flex-col` div (after `</main>`)
- LandingHero is a component, no structural changes needed

### Claude's Discretion
- Exact blockquote markup and spacing for social proof (keep simple — `<blockquote>` or `<div>` with italic `<p>`)
- Whether to use `leading-relaxed` or `leading-[1.65]` on testimonial text
- Exact placeholder testimonial copy (mark with a comment so it's findable: `{/* TODO: replace with real testimonial */}`)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/upgrade/page.tsx` — fully built page, currently zinc palette. Has custom minimal header, features card, free-tier note, CTA button, reassurance, back link.
- `components/LandingHero.tsx` — fully built component, mostly stone palette already. CTA at line 112: `rounded-xl hover:opacity-80`. Stage selector buttons: `rounded-lg`. Recommendation panel: `rounded-xl`.
- `components/SiteFooter.tsx` — already exists and is stone-palette-correct. Import and add to upgrade page.
- `app/globals.css` — `.section-label` class available (mono + tracking-widest + uppercase). No colour prescribed in class — apply `text-stone-400 dark:text-stone-500` alongside it.

### Established Patterns
- Token migration: `text-[Npx]` → named token (`text-label`, `text-caption`, `text-body`, `text-subheading`, `text-heading`, `text-article`, `text-display`)
- Button hover: `hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors` (Phase 3 established)
- Logo/link hover: `hover:text-stone-600 dark:hover:text-stone-400 transition-colors` (Phase 3 established in Header.tsx)
- Social proof placement: between last selling feature and conversion action
- `rounded-card` (2px) for content cards, `rounded-chrome` (4px) for buttons and UI chrome, `rounded-pill` for tags

### Integration Points
- Upgrade page is standalone (`'use client'`), no parent component changes needed
- LandingHero is rendered in `app/page.tsx` — no prop API changes needed
- SiteFooter import: `import { SiteFooter } from '@/components/SiteFooter';`
- No tailwind.config.ts changes needed — all tokens already exist from Phase 1–3

</code_context>

<specifics>
## Specific Ideas

- The upgrade page should feel like a premium editorial product, not a SaaS pricing grid. Stone palette + minimal layout + one confident quote is the right register.
- The testimonial is a placeholder — if no real testimonial exists at execution time, use placeholder text with a clear `{/* TODO */}` comment so it's easy to replace.
- LandingHero changes should be invisible to casual visitors — radius token swap and hover fix, not visual rethink.
- The "join 200+ students" number is a placeholder. If the user hasn't specified a real number, use this and leave a TODO comment.

</specifics>

<deferred>
## Deferred Ideas

- hover:opacity cleanup in FirmQuiz, TrackerDashboard, TestPractice, TestSession, InterviewPractice — Phase 5 (Utility Pages)
- hover:opacity cleanup in AuthButtons, UpgradeBanner, other shell components — Phase 5
- Real testimonial copy sourcing — product/marketing task, not development
- Animated social proof (live subscriber count, etc.) — out of scope for this milestone
- Upgrade page A/B testing — out of scope

</deferred>

---

*Phase: 04-conversion-surfaces*
*Context gathered: 2026-03-09*
