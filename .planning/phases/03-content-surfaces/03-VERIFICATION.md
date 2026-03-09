---
phase: 03-content-surfaces
verified: 2026-03-09T23:30:00Z
status: passed
score: 23/23 must-haves verified
re_verification: false
---

# Phase 3: Content Surfaces Verification Report

**Phase Goal:** The 8 story cards, full article view, and briefing grid feel premium and typographically consistent — the editorial register is real, not aspirational
**Verified:** 2026-03-09T23:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All truths derived from plan `must_haves` frontmatter across plans 03-01, 03-02, and 03-03.

#### Plan 03-01 Truths (StoryCard + tailwind.config.ts)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | StoryCard renders headlines using text-subheading token — no text-[19px] or text-[21px] remains | VERIFIED | `StoryCard.tsx:59` — `font-serif text-subheading font-bold leading-snug`; grep for `text-\[` returns no matches |
| 2 | StoryCard topic label uses text-label token with explicit tracking-[0.12em] — not .section-label | VERIFIED | `StoryCard.tsx:53` — `text-label font-sans font-semibold tracking-[0.12em] uppercase` |
| 3 | StoryCard excerpt uses text-caption token — no text-[13px] remains | VERIFIED | `StoryCard.tsx:64` — `text-caption text-stone-500` |
| 4 | StoryCard shows border colour shift on hover (hover:border-stone-300 dark:hover:border-stone-600) alongside bg shift | VERIFIED | `StoryCard.tsx:36` — `hover:bg-stone-50 dark:hover:bg-stone-800/40 hover:border-stone-300 dark:hover:border-stone-600` |
| 5 | tailwind.config.ts has an article fontSize entry at 1.75rem with lineHeight 1.2 and fontWeight 700 | VERIFIED | `tailwind.config.ts:42` — `article: ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }]` |
| 6 | No text-[19px], text-[21px], or text-[13px] arbitrary sizes remain in StoryCard.tsx | VERIFIED | `grep 'text-\[' StoryCard.tsx` returns no matches |
| 7 | No hover:opacity on StoryCard — transition-opacity replaced with transition-colors | VERIFIED | `grep 'hover:opacity\|transition-opacity' StoryCard.tsx` returns no matches |

#### Plan 03-02 Truths (ArticleStory)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | ArticleStory renders its headline using text-article token — no text-[26px] or text-[32px] remains | VERIFIED | `ArticleStory.tsx:53` — `font-serif text-article leading-tight`; no responsive pair |
| 9 | ArticleStory topic label uses text-label token with explicit tracking-[0.12em] — not .section-label | VERIFIED | `ArticleStory.tsx:35` — `text-label font-sans font-semibold tracking-[0.12em] uppercase` |
| 10 | ArticleStory sub-section labels use text-label with explicit tracking-[0.15em] | VERIFIED | Lines 64, 73, 81, 91, 109, 118, 131, 144, 170 — all `text-label font-sans font-semibold tracking-[0.15em] uppercase` |
| 11 | ArticleStory body copy text-[16px] leading-[1.75] is preserved unchanged (locked decision) | VERIFIED | `ArticleStory.tsx:58,101,160` — three locked `text-[16px]` instances intact (summary, legacy whyItMatters, legacy blockquote) |
| 12 | ArticleStory text-[15px] body sections use text-body token | VERIFIED | Lines 76, 84, 94, 136, 149 — all `text-body text-stone-700 dark:text-stone-300 leading-[1.75]` |
| 13 | ArticleStory soundbite text-[17px] uses text-subheading token | VERIFIED | `ArticleStory.tsx:123` — `font-serif text-subheading font-semibold` |
| 14 | No arbitrary text-[Npx] font sizes remain in ArticleStory.tsx except the deliberate 16px locked body copy | VERIFIED | `grep 'text-\[' ArticleStory.tsx` returns exactly 3 matches — all `text-[16px]` locked exceptions |

#### Plan 03-03 Truths (BriefingView / StoryGrid / Header)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 15 | BriefingView strapline uses text-caption token — no text-[13px] remains in that element | VERIFIED | `BriefingView.tsx:17` — `font-sans text-caption text-stone-400` |
| 16 | BriefingView section labels use .section-label class — no raw text-[10px] tracking-widest uppercase remains | VERIFIED | Lines 24, 32, 43, 80, 128 — all `section-label` (5 instances); no raw `text-[10px] tracking-widest` found |
| 17 | BriefingView 'Start here' callout spans use text-label — no text-[9px] remains | VERIFIED | `BriefingView.tsx:32,43` — callout spans use `section-label block mb-1` (which applies text-label via @apply) |
| 18 | BriefingView 'Bigger Picture' label uses text-label with font-sans and tracking-[0.2em] — NOT .section-label | VERIFIED | `BriefingView.tsx:64` — `text-label font-sans font-semibold tracking-[0.2em] uppercase text-stone-400` |
| 19 | BriefingView upgrade button uses hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors — no hover:opacity-80 remains | VERIFIED | `BriefingView.tsx:111` — `hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors` |
| 20 | StoryGrid MidGridNudge Subscribe button uses hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors — no hover:opacity-80 remains | VERIFIED | `StoryGrid.tsx:35` — `hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors` |
| 21 | Header logo FolioMark and h1 use group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors — no group-hover:opacity-75 remains | VERIFIED | `Header.tsx:41` — FolioMark: `group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors`; `Header.tsx:42` — h1: same pattern |
| 22 | No hover:opacity in BriefingView.tsx, StoryGrid.tsx, or Header.tsx | VERIFIED | `grep 'hover:opacity\|transition-opacity\|opacity-75'` across all three files returns no matches |
| 23 | Tailwind .section-label CSS class is defined in globals.css | VERIFIED | `globals.css:98-100` — `@apply font-mono text-label tracking-widest uppercase text-stone-400 dark:text-stone-500` |

**Score:** 23/23 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tailwind.config.ts` | text-article token (1.75rem) added to fontSize extend block | VERIFIED | Line 42: `article: ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }]` |
| `components/StoryCard.tsx` | Token-migrated card component with semantic hover states | VERIFIED | All 7 arbitrary sizes replaced; border hover added; no hover:opacity |
| `components/ArticleStory.tsx` | Token-migrated article view with consistent typographic hierarchy | VERIFIED | Zero arbitrary px sizes except 3 locked text-[16px]; full token hierarchy present |
| `components/BriefingView.tsx` | Token-migrated briefing container with semantic hover on upgrade CTA | VERIFIED | 5 section-label instances; text-label on Bigger Picture; hover:bg-stone-700 on CTA |
| `components/StoryGrid.tsx` | MidGridNudge subscribe button with semantic hover state | VERIFIED | hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors on button |
| `components/Header.tsx` | Logo hover replaced with colour shift (resolves Phase 2 deferral) | VERIFIED | group-hover:text-stone-600 dark:group-hover:text-stone-400 on FolioMark and h1 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `tailwind.config.ts` | `components/StoryCard.tsx` | text-subheading, text-caption, text-label tokens | WIRED | All three tokens actively used in StoryCard |
| `components/StoryCard.tsx` | hover state | border colour shift on hover | WIRED | `hover:border-stone-300` on article element (line 36) |
| `tailwind.config.ts` | `components/ArticleStory.tsx` | text-article token (added in plan 03-01) | WIRED | `text-article` on headline h2 (line 53) |
| `components/ArticleStory.tsx` | typographic hierarchy | text-article > text-subheading > text-body > text-label | WIRED | Full hierarchy confirmed: headline (text-article), soundbite (text-subheading), body sections (text-body), all labels (text-label) |
| `components/BriefingView.tsx` | `.section-label` | globals.css class applied to section labels | WIRED | 5 instances of `section-label` class; class defined in globals.css:98 |
| `components/BriefingView.tsx` | upgrade CTA button | hover:bg-stone-700 background shift | WIRED | Line 111 confirmed |
| `components/Header.tsx` | FolioMark logo hover | group-hover:text-stone-600 colour shift | WIRED | Lines 41-42 confirmed |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CONT-01 | 03-01 | StoryCard component polished with design tokens (type scale, radius, spacing) | SATISFIED | All 7 arbitrary sizes replaced with named tokens; border hover state added; zero hover:opacity |
| CONT-02 | 03-02 | ArticleStory polished with design tokens — typography hierarchy consistent | SATISFIED | Full token hierarchy established: text-article/text-subheading/text-body/text-label; 3 locked text-[16px] are deliberate per plan |
| CONT-03 | 03-03 | BriefingView (homepage grid) polished with design tokens | SATISFIED | .section-label on 5 mono labels; text-label on Bigger Picture; text-caption on strapline; text-heading on upgrade h3 |
| CONT-04 | 03-01, 03-03 | hover:opacity-80 replaced with semantic hover states across all interactive components | SATISFIED | Zero hover:opacity/transition-opacity/opacity-75 in all 5 modified files; semantic bg-shift/border-shift/colour-shift hover applied throughout |
| CONT-05 | 03-01, 03-02, 03-03 | Typography hierarchy consistent across all content surfaces | SATISFIED | Named token system applied uniformly: StoryCard (text-subheading/text-caption/text-label), ArticleStory (text-article/text-subheading/text-body/text-label), BriefingView (.section-label/text-label/text-caption/text-heading) |

All 5 CONT requirements satisfied. No orphaned requirements — all 5 IDs (CONT-01 through CONT-05) appear in plan frontmatter and are cross-referenced in REQUIREMENTS.md as complete.

---

### Commit Verification

All 5 documented commits verified in git log:

| Commit | Plan | Description |
|--------|------|-------------|
| `365f535` | 03-01 | feat(03-01): add text-article fontSize token to tailwind.config.ts |
| `a0065c8` | 03-01 | feat(03-01): migrate StoryCard.tsx to design tokens with semantic hover |
| `97020f5` | 03-02 | feat(03-02): migrate ArticleStory.tsx to design tokens |
| `82ce410` | 03-03 | feat(03-03): migrate BriefingView.tsx labels to tokens and fix upgrade button hover |
| `0be7549` | 03-03 | feat(03-03): fix hover:opacity in StoryGrid MidGridNudge and Header logo |

---

### Anti-Patterns Found

No blockers or warnings. Scan results:

| File | Pattern | Result |
|------|---------|--------|
| All 5 modified files | TODO/FIXME/placeholder | None found |
| All 5 modified files | hover:opacity / transition-opacity | None found |
| StoryCard.tsx | text-[Npx] arbitrary sizes | None found |
| ArticleStory.tsx | text-[Npx] except locked 16px | 3 locked text-[16px] — deliberate, documented in plan and summary |
| BriefingView.tsx | text-[Npx] | 5 remaining — all out-of-scope per plan decisions (see note below) |
| StoryGrid.tsx | text-[Npx] | 3 remaining — nudge body text and button label, out-of-scope per plan |
| Header.tsx | text-[10px] | 1 remaining on "Archive Edition" span — out of plan scope (plan only fixed logo hover) |

**Note on remaining arbitrary sizes in BriefingView and StoryGrid:** These are all non-label body text elements or button text sizes that were explicitly excluded from plan scope. Plan 03-03 summary decision: "Subscribe button text-[13px] intentionally kept — button text size was not in token migration scope, only hover pattern fixed." The `text-[13px]` on callout card link body text (lines 35, 46) is functional link/card content — not a typographic label — and was not listed in the plan's migration targets. These are info-level observations only, not blockers.

---

### Human Verification Required

The following items cannot be verified programmatically and should be checked on the live site or in a browser:

#### 1. StoryCard Visual Hierarchy at Mobile Viewport

**Test:** Load the homepage on a 375px viewport (iPhone SE). Inspect each story card headline.
**Expected:** Headlines render at a consistent, readable size (text-subheading = 18px) with no responsive size jump. Previously was 19px on mobile, 21px on desktop — now fixed at 18px for both.
**Why human:** Viewport rendering and actual pixel size cannot be confirmed by grep.

#### 2. ArticleStory Typographic Hierarchy in Full Article View

**Test:** Open a full article. Scan: headline (28px), soundbite card (18px), body sections (15px), section labels (10px uppercase).
**Expected:** Clear editorial hierarchy — headline dominates, soundbite reads as pull-quote, body is comfortable, labels are understated.
**Why human:** Visual hierarchy quality judgment requires a browser.

#### 3. Header Logo Hover Colour Shift

**Test:** Hover over the Folio wordmark in the header on both light and dark modes.
**Expected:** Logo and "Folio" text shift to stone-600 (light) / stone-400 (dark) — a subtle colour mute, not an opacity fade.
**Why human:** CSS transition behaviour requires browser rendering.

#### 4. BriefingView Upgrade CTA Hover

**Test:** Hover over "Subscribe — £4 / month →" button in the post-briefing upgrade block (visible when signed out).
**Expected:** Button background shifts from stone-900 to stone-700 (light) — a darkening effect rather than fade.
**Why human:** Interactive hover state requires browser.

---

### Notes

**CONT-05 scope:** The requirement "no arbitrary sizes" is fulfilled within the 5 in-scope files for all elements the plans targeted. A small number of out-of-scope arbitrary sizes remain in BriefingView (callout card body text), StoryGrid (nudge text), and Header (Archive Edition label). These were not part of any plan's migration targets and do not affect the editorial register of the primary content surfaces (StoryCard, ArticleStory) or their functional correctness. The phase goal — that the editorial register "is real, not aspirational" — is achieved: the 8 story cards, full article view, and briefing grid all use a coherent semantic token system with no arbitrary sizes in their primary typographic elements.

**Phase 2 deferral resolved:** The Header logo hover (group-hover:opacity-75) was explicitly deferred from Phase 2 and is now resolved in plan 03-03.

---

## Overall Assessment

Phase 3 goal is **achieved**. The editorial register is now real:

- StoryCard: consistent 18px serif headline, 13px excerpt, 10px uppercase labels — all via named tokens, single non-responsive values
- ArticleStory: clear four-level hierarchy (article 28px → subheading 18px → body 15px → label 10px) anchored by the new text-article token
- BriefingView: mono section labels unified under .section-label; typographic scale consistent with other content surfaces
- All five modified files: zero opacity-based hover patterns; semantic hover states throughout (colour shift for logos, border+bg shift for cards, bg shift for buttons)

---

_Verified: 2026-03-09T23:30:00Z_
_Verifier: Claude (gsd-verifier)_
