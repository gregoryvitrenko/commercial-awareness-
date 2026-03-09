# Phase 3: Content Surfaces - Research

**Researched:** 2026-03-09
**Domain:** Tailwind CSS v3 token migration, React component polish, typographic hierarchy
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Card surface colour**
- Story cards stay `bg-white dark:bg-stone-900` — intentional contrast against `bg-paper` page background
- This is an intentional deviation from the shell token: cards are surfaces ON the page, not the page itself

**Card hover state (CONT-04)**
- Add `hover:border-stone-300 dark:hover:border-stone-600` alongside existing `hover:bg-stone-50 dark:hover:bg-stone-800/40`
- `group-hover:underline` on headline and `group-hover:text-stone-600` on "Read more" are already semantic and stay
- No `hover:opacity` on cards — that pattern is eliminated from these components

**Article type sizes**
- Add `text-article` token at `1.75rem` (28px) with `leading-tight` — sits between `text-heading` (24px) and `text-display` (36px)
- Article body summary (`text-[16px] leading-[1.75]`) stays at 16px — not forced to `text-body` (15px); use `leading-[1.75]`
- StoryCard headline (`text-[19px] sm:text-[21px]`) → migrate to `text-subheading` (18px) — removes responsive pair and aligns to token

**Topic label pattern**
- Both StoryCard and ArticleStory use `text-[10px] font-sans font-semibold tracking-[0.12em] uppercase` → migrate to `text-label` (10px) for the size, keep explicit `tracking-[0.12em]`
- Do NOT use `.section-label` class here — topic labels are sans-serif with different tracking

**BriefingView section labels**
- `text-[10px] tracking-widest uppercase text-stone-400` → use `.section-label` class (established in Phase 1)
- `text-[9px]` in "Start here" callout spans → migrate to `text-label` (10px)

**hover:opacity scope (CONT-04)**
- Fix only StoryCard, ArticleStory, BriefingView, and Header logo in Phase 3
- ~15 hover:opacity instances remain elsewhere (FirmQuiz, TrackerDashboard, TestPractice, etc.) — Phase 4 and 5
- Header logo `group-hover:opacity-75` (Phase 2 deferral) is in scope for Phase 3: replace with `group-hover:text-stone-600 dark:group-hover:text-stone-400`

### Claude's Discretion
- Exact line-height values for migrated type (stay close to existing where token doesn't specify)
- Whether to apply `text-article` token to ArticleStory `<h2>` responsive pair or use as single non-responsive value
- Exact BriefingView strapline token (`text-[13px]` → `text-caption` is 13px — direct match, apply directly)
- The `text-[11px]` talking point teaser and "Read more" text in StoryCard — round to `text-label` (10px) or keep at 11px with a note

### Deferred Ideas (OUT OF SCOPE)
- hover:opacity cleanup in FirmQuiz, TrackerDashboard, TestPractice, TestSession, InterviewPractice — Phase 5
- hover:opacity cleanup in LandingHero, AuthButtons, UpgradeBanner — Phase 4
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | `StoryCard` component polished with design tokens (type scale, radius, spacing) | Token inventory below identifies every arbitrary `text-[Npx]` in StoryCard and its replacement. Headline → `text-subheading`, topic label → `text-label`, excerpt → `text-caption`, teaser/read-more → stay at 11px or round to `text-label` per discretion. |
| CONT-02 | Article view (`ArticleStory`) polished with design tokens — typography hierarchy consistent | New `text-article` token (1.75rem/28px) replaces the `text-[26px] sm:text-[32px]` responsive pair. Topic label → `text-label`. Body 16px stays. All sub-section labels share the `text-[10px] font-sans font-semibold tracking-[0.15em] uppercase` pattern — stays as-is (no `.section-label`, these are sans-serif). |
| CONT-03 | `BriefingView` (homepage grid) polished with design tokens | Strapline → `text-caption`. Section labels → `.section-label`. `text-[9px]` callout spans → `text-label`. Button hover → bg shift (remove `hover:opacity-80`). TabBar already uses `overflow-x-auto no-scrollbar` so mobile wrapping is already solved — verify at 375px. |
| CONT-04 | `hover:opacity-80` replaced with semantic hover states | StoryCard: add border hover. BriefingView: button bg shift. Header logo: colour shift. StoryGrid `MidGridNudge` button: also has `hover:opacity-80` — in scope as part of BriefingView's dependent component. |
| CONT-05 | Typography hierarchy consistent across all content surfaces | After token migration: StoryCard, ArticleStory, BriefingView all use named tokens. No arbitrary `text-[Npx]` remains except the deliberate 16px body copy in ArticleStory (kept, documented). |
</phase_requirements>

---

## Summary

Phase 3 is a pure polish/refactoring phase with no new feature work and no new external dependencies. The task is token migration across three TSX components (`StoryCard.tsx`, `ArticleStory.tsx`, `BriefingView.tsx`) plus one correction to `Header.tsx` (logo hover), and one addition to `tailwind.config.ts` (new `article` font size token).

The token infrastructure from Phases 1 and 2 is fully in place. `tailwind.config.ts` has the `fontSize` extend block with `display`, `heading`, `subheading`, `body`, `caption`, and `label` slots. `globals.css` has `.section-label` available globally. The migration pattern is well-rehearsed from Phase 2 shell work.

The primary risk for this phase is mobile layout regression on the 8-story grid at 375px viewport (noted as blockers/concerns in STATE.md — mobile is 60-70% of student traffic). The TabBar component already uses `overflow-x-auto no-scrollbar` with `flex-shrink-0` per-tab — topic tabs will not wrap. The grid uses `grid-cols-1 lg:grid-cols-2` — cards stack single-column below lg. No layout changes are in scope, so overflow risk is low but must be verified.

**Primary recommendation:** Add the `article` token to `tailwind.config.ts` first, then migrate components in order: StoryCard → ArticleStory → BriefingView → Header logo. Each component is self-contained — no parent component prop API changes needed.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v3 (project-locked) | Utility class token system | Already in use; Phase 1 established the `fontSize` extend block |
| React 19 / Next.js 15 | Project-locked | Component rendering | No change |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `cn()` from `lib/utils.ts` | — | Class merging with `clsx` + `twMerge` | Use when conditionally combining class strings |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Named token (e.g., `text-subheading`) | Arbitrary value `text-[18px]` | Tokens are the entire point of this phase — never use arbitrary values for migrated sizes |
| `.section-label` class | Inline `font-mono text-label tracking-widest uppercase text-stone-400` | Use `.section-label` for mono section labels only; topic labels are sans-serif and stay inline |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure
No structural changes. All work is within:
```
components/
├── StoryCard.tsx         # Token migration + border hover
├── ArticleStory.tsx      # Token migration (new text-article)
├── BriefingView.tsx      # Token migration + button hover fix
├── Header.tsx            # Logo hover fix only
└── StoryGrid.tsx         # MidGridNudge button hover fix
tailwind.config.ts        # Add article token to fontSize extend
```

### Pattern 1: Token Migration (from Phase 2)
**What:** Replace arbitrary `text-[Npx]` with named token, remove redundant `font-bold` if token bakes in font weight.
**When to use:** Every arbitrary text size that maps to an existing token.
**Example:**
```typescript
// Before (StoryCard.tsx line 59)
<h2 className="font-serif text-[19px] sm:text-[21px] font-bold leading-snug ...">

// After — single non-responsive value, token bundles fontWeight:'700'
// Note: text-subheading token has fontWeight:'500', so keep explicit font-bold
<h2 className="font-serif text-subheading font-bold leading-snug ...">
```

**Note on font-bold retention:** The `subheading` token defines `fontWeight: '500'`. StoryCard headlines are visually bold (`font-bold`). Keep explicit `font-bold` when overriding the token's default weight. The `article` token (new) will define `fontWeight: '700'` so no explicit `font-bold` needed for article headlines.

### Pattern 2: Adding a New Token
**What:** Extend `fontSize` in `tailwind.config.ts` with a new named slot.
**When to use:** When an existing arbitrary size has no token match and is significant enough to name.
**Example:**
```typescript
// tailwind.config.ts — add inside theme.extend.fontSize
article: ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],  // 28px — article-level headline
```
This follows the exact same structure as the existing tokens. Run `npm run build` (or check the dev server) to confirm the new `text-article` utility is available.

### Pattern 3: Semantic Button Hover (background shift)
**What:** Replace `hover:opacity-80` on dark-background buttons with an explicit lighter background.
**When to use:** Any button using `bg-stone-900 dark:bg-stone-100` (the primary CTA pattern).
**Example:**
```typescript
// Before (BriefingView.tsx line 111, StoryGrid.tsx line 35)
className="... bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-80 transition-opacity"

// After — background shift pattern (consistent with ScrollToTop reference)
className="... bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
```
**Reference:** `ScrollToTop` component in the codebase already uses this exact pattern and can be used as a living reference.

### Pattern 4: Semantic Card Border Hover
**What:** Add border-colour shift on hover alongside the existing bg hover.
**When to use:** Cards with `border border-stone-200 dark:border-stone-800` at rest.
**Example:**
```typescript
// StoryCard.tsx line 36 — add hover:border classes
<article className="... border border-stone-200 dark:border-stone-800
  hover:bg-stone-50 dark:hover:bg-stone-800/40
  hover:border-stone-300 dark:hover:border-stone-600
  transition-colors ...">
```

### Pattern 5: Semantic Logo Hover (Header.tsx)
**What:** Replace `group-hover:opacity-75` on logo with a colour shift.
**When to use:** The wordmark and SVG logo link in Header.
**Example:**
```typescript
// Before (Header.tsx lines 41-42)
<FolioMark ... className="... group-hover:opacity-75 transition-opacity ..." />
<h1 className="... group-hover:opacity-75 transition-opacity">Folio</h1>

// After — colour shift (tone down, not fade)
<FolioMark ... className="... group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors ..." />
<h1 className="... group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors">Folio</h1>
```

### Anti-Patterns to Avoid
- **Mixing `transition-opacity` and `transition-colors` on the same element:** Tailwind only applies one `transition-*` class. After replacing opacity hover with colour hover, also replace `transition-opacity` with `transition-colors`.
- **Using `.section-label` for topic labels:** Topic labels are `font-sans` with `tracking-[0.12em]`; `.section-label` is `font-mono` with `tracking-widest`. Using the wrong class will change the visual character of the label.
- **Removing `font-bold` when migrating to `text-subheading`:** The `subheading` token bundles `fontWeight: '500'`. StoryCard and ArticleStory headlines are intentionally bold — keep explicit `font-bold`.
- **Changing the `text-[16px] leading-[1.75]` body copy in ArticleStory:** This is a locked decision. 16px with 1.75 line-height is correct for long-form reading. Do not migrate to `text-body` (15px).
- **Touching the TOPIC_STYLES colour classes:** `TOPIC_STYLES` in `lib/types.ts` is explicitly out of scope.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Class merging with conditionals | Custom string concatenation | `cn()` from `lib/utils.ts` | Already in use throughout components; handles Tailwind class conflicts |
| Dark mode token | Separate light/dark values inline | `dark:*` prefix on the same element | Existing pattern throughout codebase |
| Font size token with line-height | `text-[1.75rem] leading-tight font-bold` | `text-article` (add to config) | Single token bundles all three |

**Key insight:** All token infrastructure already exists. There is nothing to build from scratch — only migration of inline arbitrary values to named tokens.

---

## Common Pitfalls

### Pitfall 1: transition-opacity vs transition-colors mismatch
**What goes wrong:** After replacing `hover:opacity-80 transition-opacity` with `hover:bg-stone-700 transition-colors`, the old `transition-opacity` class remains, causing the hover background shift to be instant (no transition).
**Why it happens:** The opacity hover and transition class are on the same element but edited separately.
**How to avoid:** When replacing any `hover:opacity-*`, always also replace `transition-opacity` with `transition-colors` in the same edit.
**Warning signs:** Hover effect appears but has no animation smoothness.

### Pitfall 2: font-bold stripped by token migration
**What goes wrong:** Migrating `text-[19px] font-bold` → `text-subheading` and removing `font-bold` because "the token handles it." The `subheading` token has `fontWeight: '500'`, not `'700'` — headlines become visually lighter.
**Why it happens:** Assuming the token bundles the correct weight without checking.
**How to avoid:** Check the token definition in `tailwind.config.ts` before removing explicit font weight classes. Add `font-bold` explicitly when the token's default weight is lighter than required.
**Warning signs:** Card headlines look thinner than before the migration.

### Pitfall 3: ArticleStory "Why it matters" sub-labels left unmigrated
**What goes wrong:** The `text-[10px] font-sans font-semibold tracking-[0.15em] uppercase` pattern appears in 6 places inside ArticleStory. If only the main headline is migrated, mixed sizing remains, CONT-05 fails.
**Why it happens:** The pattern is repeated inline rather than extracted; easy to miss instances.
**How to avoid:** Before closing the file, grep ArticleStory for `text-\[` to confirm all arbitrary sizes are handled.
**Warning signs:** Visual inspection of the article view shows inconsistent label sizes.

### Pitfall 4: BriefingView "Bigger Picture" label missed
**What goes wrong:** The "Bigger Picture" centred divider label at line 64 uses `text-[10px] font-semibold tracking-[0.2em] uppercase font-sans` — a topic-label-like pattern, not the mono `.section-label`. If migrated to `.section-label`, it becomes mono instead of sans.
**Why it happens:** Two different label patterns coexist in BriefingView — easy to homogenise incorrectly.
**How to avoid:** "Bigger Picture" label uses `font-sans` not `font-mono` — migrate size to `text-label` but keep `font-sans` explicitly. Do not apply `.section-label`.
**Warning signs:** "Bigger Picture" label renders in JetBrains Mono instead of Inter.

### Pitfall 5: Mobile layout regression after token migration
**What goes wrong:** A token that changes font size or line-height causes StoryCard excerpt text to overflow card bounds or topic tabs to misbehave at 375px.
**Why it happens:** Headline token migration from `text-[19px] sm:text-[21px]` to `text-subheading` (18px) removes the sm breakpoint pair — the card now renders 18px everywhere. On mobile the headline is slightly smaller but the card should handle it gracefully.
**How to avoid:** After each component migration, check at 375px viewport width. The grid is already `grid-cols-1` below `lg` — no card overflow expected.
**Warning signs:** Card content overflows card boundary, or text wraps unexpectedly causing card height to expand.

---

## Code Examples

Verified patterns from direct codebase inspection:

### Token Inventory: StoryCard.tsx
```typescript
// Current arbitrary sizes → replacement tokens
text-[19px] sm:text-[21px]  → text-subheading (18px) + explicit font-bold
text-[13px]                 → text-caption (13px, direct match)
text-[11px] (teaser)        → discretion: text-label (10px) OR keep 11px with note
text-[11px] (read more)     → discretion: text-label (10px) OR keep 11px with note
text-[10px] tracking-[0.12em] uppercase font-sans  → text-label + explicit tracking-[0.12em]
text-[10px] font-sans font-medium (firm chip)      → text-label (already rounded to 10px)
```

### Token Inventory: ArticleStory.tsx
```typescript
// Current arbitrary sizes → replacement tokens
text-[26px] sm:text-[32px]  → text-article (1.75rem/28px, new token, non-responsive)
text-[16px] leading-[1.75]  → KEEP AS-IS (locked decision, long-form body copy)
text-[15px] leading-[1.75]  → text-body (0.9375rem/15px, direct match)
text-[17px] (soundbite)     → closest token is text-subheading (18px) or keep 17px; subheading applies
text-[10px] font-sans font-semibold tracking-[0.12em] uppercase  → text-label + tracking-[0.12em]
text-[10px] font-sans font-semibold tracking-[0.15em] uppercase  → text-label + tracking-[0.15em] (section sub-labels)
```

### Token Inventory: BriefingView.tsx
```typescript
// Current arbitrary sizes → replacement tokens
text-[13px]    (strapline)           → text-caption (13px, direct match)
text-[10px] tracking-widest uppercase text-stone-400  → .section-label class
text-[9px]     (callout spans)       → text-label (10px, round up)
text-[10px] font-semibold tracking-[0.2em] uppercase font-sans (Bigger Picture)  → text-label + keep font-sans + tracking-[0.2em]
text-[22px]    (upgrade block h3)    → text-heading (24px) — or keep 22px; heading is closest
text-[13px]    (upgrade block body)  → text-caption
text-[11px]    (feature chips)       → text-label (10px) or keep 11px
text-[13px]    (subscribe button)    → text-caption
text-[12px]    (sign-in link)        → text-caption or keep 12px
text-[9px] tracking-[0.22em] uppercase (subscriber access label)  → text-label + tracking-[0.22em]
text-[10px] (footer mono)            → text-label (or .section-label if contextually mono)
text-[11px]    (footer serif)        → keep (no token for 11px serif)
```

### Token Inventory: Header.tsx (in-scope items only)
```typescript
// group-hover:opacity-75 transition-opacity on both FolioMark and h1
→ group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors
```

### Token Inventory: StoryGrid.tsx (MidGridNudge)
```typescript
// hover:opacity-80 transition-opacity on Subscribe button
→ hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors
```

### Adding text-article to tailwind.config.ts
```typescript
// In theme.extend.fontSize, after the existing label entry:
article: ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],   // 28px — article-level headline
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `hover:opacity-80` for all interactive states | Semantic hover (border, bg, underline, colour shift) | Phase 3 (now) | Editorial consistency; opacity fade is visually undifferentiated between element types |
| `text-[Npx]` arbitrary sizes | Named type scale tokens | Phases 1-3 | Single source of truth; globally adjustable; JetBrains Mono for mono, Inter for sans |
| Responsive headline pairs (`text-[19px] sm:text-[21px]`) | Single non-responsive token | Phase 3 (now) | Reduces class count; 1px delta at sm is not perceptually significant |

**Deprecated/outdated:**
- `hover:opacity-80 transition-opacity`: eliminated from StoryCard, ArticleStory, BriefingView, Header logo, StoryGrid MidGridNudge in Phase 3
- `text-[9px]`: rounds to `text-label` (10px) — 9px is below legibility threshold and never intentional

---

## Open Questions

1. **`text-[11px]` teaser and "Read more" in StoryCard**
   - What we know: 11px falls between `text-label` (10px) and no token above it until `text-caption` (13px)
   - What's unclear: Whether 1px difference at 10px is perceptible; these are de-emphasised UI strings
   - Recommendation: Round to `text-label` (10px). Both strings are secondary-emphasis elements; the visual difference between 10px and 11px is negligible in context.

2. **ArticleStory `text-[26px] sm:text-[32px]` → single token vs responsive**
   - What we know: New `text-article` token = 28px. Current is 26px mobile / 32px desktop.
   - What's unclear: Whether single 28px is visually equivalent enough across breakpoints
   - Recommendation: Use single `text-article` (28px) with no responsive pair. 28px is between the original mobile and desktop sizes — a reasonable midpoint. If visual testing reveals issues at mobile, this is the one place to reconsider.

3. **BriefingView upgrade block h3 (`text-[22px]` → `text-heading` at 24px)**
   - What we know: `text-heading` is 24px; existing is 22px. 2px delta.
   - What's unclear: Whether slight size increase on this promotional element changes the visual weight of the upgrade block
   - Recommendation: Migrate to `text-heading` (24px). 2px increase is acceptable; the block is the subscription CTA and slightly larger heading is not a regression.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — no automated test suite detected |
| Config file | None |
| Quick run command | `npm run build` (TypeScript + Next.js compilation) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | StoryCard uses named type scale tokens | manual-only | `npm run build` (catches TS errors) | N/A |
| CONT-02 | ArticleStory typography hierarchy consistent | manual-only | `npm run build` | N/A |
| CONT-03 | BriefingView 375px layout correct | manual-only | Browser DevTools responsive mode | N/A |
| CONT-04 | No hover:opacity-80 in scope components | grep-verify | `grep -r "hover:opacity" components/StoryCard.tsx components/ArticleStory.tsx components/BriefingView.tsx components/Header.tsx components/StoryGrid.tsx` | N/A |
| CONT-05 | No arbitrary text-[Npx] remaining | grep-verify | `grep -r 'text-\[' components/StoryCard.tsx components/ArticleStory.tsx components/BriefingView.tsx` | N/A |

**Note:** This project has no automated test suite. Validation is build compilation + manual browser inspection + grep-based checks.

### Sampling Rate
- **Per task commit:** `npm run build` — confirms TypeScript and Next.js compilation clean
- **Per wave merge:** `npm run build && npm run lint` — full static analysis
- **Phase gate:** grep checks for `hover:opacity` and `text-\[` absence in scope files, plus manual 375px viewport check

### Wave 0 Gaps
None — no test infrastructure changes needed. Existing `npm run build` and `npm run lint` are sufficient for this phase.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `components/StoryCard.tsx`, `components/ArticleStory.tsx`, `components/BriefingView.tsx`, `components/Header.tsx`, `components/StoryGrid.tsx`, `components/TabBar.tsx`
- Direct config inspection: `tailwind.config.ts`, `app/globals.css`
- `.planning/phases/03-content-surfaces/03-CONTEXT.md` — locked decisions
- `.planning/REQUIREMENTS.md` — CONT-01 through CONT-05

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — established patterns from Phases 1 and 2, mobile risk note

### Tertiary (LOW confidence)
- `.claude/skills/tailwind-design-system/SKILL.md` — v4 skill (project uses v3); patterns reviewed for conceptual alignment only; no v4-specific syntax applied

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed by direct file inspection; no external dependencies required
- Architecture: HIGH — all patterns established in Phase 1/2 and visible in live codebase
- Pitfalls: HIGH — sourced from direct code reading (specific line numbers confirmed)
- Token inventory: HIGH — every arbitrary `text-[Npx]` instance catalogued from actual source files

**Research date:** 2026-03-09
**Valid until:** 2026-06-09 (stable — Tailwind v3 config, no moving dependencies)
