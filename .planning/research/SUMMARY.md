# Project Research Summary

**Project:** Folio Design Lift — Premium Editorial Branding and Conversion Uplift
**Domain:** Design system upgrade + CRO for a live niche B2C SaaS product
**Researched:** 2026-03-09
**Confidence:** HIGH (all research based on direct codebase audit; no external search tools used)

## Executive Summary

Folio is an editorially-positioned daily briefing tool for UK law students. The product direction is correct — stone/zinc palette, Playfair Display serif, newspaper layout — but the execution is not yet premium. The gap between "well-intentioned side project" and "premium editorial product" comes down to four concrete technical debts: no type scale (16 arbitrary pixel sizes in active use), no enforced border radius system (five distinct values, mixed randomly across surfaces), a palette split that is documented but not enforced (upgrade and utility pages use zinc where content pages use stone), and no semantic CSS token layer (every design change requires a grep-and-replace across 40+ component files). All four are fixable within the existing stack — no new packages, no new fonts required.

The recommended approach is a strict bottom-up build order: establish design tokens first (globals.css and tailwind.config.ts), then apply them to the shell (Header, SiteFooter), then content surfaces (StoryCard, ArticleStory, BriefingView), then conversion surfaces (LandingHero, upgrade page), and finally utility pages (archive, firms, quiz). Skipping this order and polishing components before tokens exist means making every design decision twice. On the conversion side, the upgrade page is the single highest-leverage asset and is currently weakest: no social proof, feature descriptions written as "what it does" rather than "what you say in the interview," palette mismatch from the rest of the product, and no founding story despite the owner's authenticity being a genuine competitive differentiator.

The critical risks are not architectural — they are process risks. A design lift on a live product with paying subscribers can silently break the Stripe checkout, collapse mobile layouts at 375px where 60-70% of student traffic arrives, or destroy the paywall gating logic while improving visual polish. Every change involving paywall-adjacent components requires an end-to-end smoke test in incognito before deploying. Social proof elements must only use real numbers — this audience (future lawyers) is credibility-aware and false claims spread rapidly through law society peer networks.

---

## Key Findings

### Recommended Stack

No new dependencies required. All design lift work is Tailwind config extensions and CSS custom properties. The three-font stack (Playfair Display / Inter / JetBrains Mono) is correct for the editorial positioning and should not be changed. The highest-leverage change is adding a named type scale to tailwind.config.ts replacing 16 arbitrary `text-[Npx]` values — this single change is responsible for more of the "premium vs side project" perception gap than any other intervention.

**Core technologies (all in use, no changes):**
- Tailwind CSS 3.4: All styling — extend with semantic tokens, do not add packages
- shadcn/ui (stone base): UI primitives — customise via CSS variables only, never modify component files
- next/font/google: Font loading — existing three-font stack correct, no additions needed

**Specific config changes recommended:**
- tailwind.config.ts: Add named `fontSize` type scale (7 semantic slots), named `borderRadius` tokens (card/chrome/pill/input), named spacing tokens
- globals.css: Add `--paper` CSS variable (warmer than stone-50), semantic radius vars, typography scale comment contract, stone-vs-zinc rule comment
- shadcn `--radius` variable: Reduce from `0.5rem` to `0.25rem` — removes "SaaS app" rounding from all primitives globally

### Expected Features

All features are about improving existing features, not adding new ones. The lift is polish, trust signals, and conversion copy.

**Must have (table stakes for credibility):**
- Consistent type scale applied across all components — currently absent, visually signals "prototype"
- Coherent border radius system — currently five values with no documented rule; `rounded-xl` on editorial content cards clashes with newspaper positioning
- Upgrade page palette alignment — currently zinc throughout while the product is stone; reads as two different products
- Founding story copy on upgrade page — "built by an LLB student" is a genuine trust differentiator unavailable to funded competitors
- Outcome-framed feature descriptions on upgrade page — "what you can say in the interview" not "what the feature does"
- Personal refund guarantee — one sentence, authentic to a solo founder

**Should have (conversion differentiators):**
- Social proof elements — student count (honest numbers only), university name-tags from peer network, one outcome testimonial
- Named author/curator attribution on briefings — "Curated by [name], LLB" builds human accountability
- Post-quiz upgrade nudge — show one sample question before the paywall for free users
- Visual distinction between free and premium state (warmer/richer premium register, not just "locked")

**Defer to after 50+ free users exist:**
- CRO funnel changes without a data baseline — guessing loop damages existing structure
- Annual pricing tier — no churn data yet
- Referral program — user base too small
- Comments/UGC — no moderation infrastructure, distraction from core product

### Architecture Approach

The design system upgrade follows a strict dependency order: tokens must exist before components use them, components must be consistent before pages feel premium. The existing architecture has one well-functioning token system (TOPIC_STYLES in lib/types.ts) that must not be touched — it is the only coherent system in the codebase and has a safelist in tailwind.config.ts protecting it. Everything else is ad-hoc and needs systematic replacement.

**Major components and their scope in the lift:**

1. `globals.css` + `tailwind.config.ts` — Foundation: define all semantic tokens before touching any component. Zero visual change at this step. Risk: Low.
2. `components/Header.tsx` + `components/SiteFooter.tsx` — Shell: apply tokens to the chrome that appears on every page. Also implement the footer (currently in the backlog) here, using `flex flex-col min-h-screen` + `flex-1` on main.
3. `components/StoryCard.tsx` + `components/ArticleStory.tsx` + `components/BriefingView.tsx` — Content surfaces: highest user-facing visibility. Typography changes here affect vertical rhythm across the 8-story grid — test at 375px viewport after every change.
4. `components/LandingHero.tsx` + `app/upgrade/page.tsx` — Conversion surfaces: palette alignment (zinc to stone), heading scale, CTA radius fix (currently `rounded-xl` — the single most visually jarring inconsistency in the codebase).
5. Utility pages (`archive`, `firms`, `quiz`, `tests`, `primers`) — Apply consistent heading pattern and palette rule. Lower visual priority, lower risk.

**The one inviolable rule:** Never modify the shadcn HSL CSS variables (`--background`, `--foreground`, etc.) — they drive shadcn primitives across quiz, tracker, firm-pack, and test interfaces. Add new variables with distinct names alongside them.

### Critical Pitfalls

1. **Token changes without auditing all consumers** — Tailwind utility classes scatter across 40+ files. A search-and-replace on `rounded-sm` or `border-stone-200` will break components you did not test. Prevention: grep every consumer before any token change; change one component at a time; test dark mode on every component touched.

2. **Typography changes that break vertical rhythm on the 8-story homepage** — Changing `leading-snug` to `leading-normal` on headlines ripples 8x per page and causes card overflow, truncation failure, or topic tabs wrapping to two lines on mobile. Prevention: test the homepage at 375px viewport width after every font change; do not change font sizes and spacing in the same commit.

3. **Visual refactor breaking the Stripe checkout path** — Paywall components are the intersection of UI and critical business logic. A className change risks removing an onClick handler or breaking conditional rendering that gates premium content. Prevention: end-to-end checkout smoke test in incognito after every deploy touching `/upgrade`, `StoryCard.tsx`, or the mid-grid nudge. Never use the review bypass cookie during paywall UI development.

4. **False social proof numbers** — Law students applying to Magic Circle firms verify claims. An inflated "Join 200+ students" before that number is real will be shared in law society WhatsApp groups as a reason not to trust the product. Prevention: only ship real numbers; use qualitative quotes and "early access" framing before a real user base exists.

5. **CRO changes without a data baseline** — Moving the upgrade CTA "because it looks better" without knowing the current conversion rate produces a guessing loop that degrades the funnel. Prevention: install Vercel Analytics before any conversion-related changes; defer CRO work until 50+ signed-up free users are observable in the funnel.

---

## Implications for Roadmap

Based on the combined research, the design lift is a single milestone with five phases in strict dependency order. Do not reorder — earlier phases are prerequisites for later ones.

### Phase 1: Design Tokens
**Rationale:** No component can be polished consistently until the token contract exists. This is pure scaffolding — zero visual change, all downstream phases depend on it.
**Delivers:** Named type scale in tailwind.config.ts, semantic radius tokens (card/chrome/pill/input), spacing tokens, `--paper` CSS variable, `--radius` reduction to 0.25rem, stone-vs-zinc rule documented in globals.css.
**Addresses:** All four structural problems identified in ARCHITECTURE.md (palette inconsistency, radius chaos, inline typography, no semantic token layer).
**Avoids:** Pitfall 1 (token changes without audit), Pitfall 5 (brand colour changes requiring 40+ file updates).
**Research flag:** Standard patterns — no deeper research needed. Direct implementation from STACK.md and ARCHITECTURE.md specs.
**Estimated effort:** 2-4 hours.

### Phase 2: Shell (Header + Footer)
**Rationale:** Header and footer appear on every page — changes here have instant site-wide effect and set the register for all subsequent work. Footer is in the active backlog and belongs here, not as an afterthought.
**Delivers:** Consistent header token application, site footer with terms/privacy/contact/LinkedIn links, correct sticky footer layout pattern (`flex flex-col min-h-screen`).
**Addresses:** Footer anti-pattern (Pitfall 13), mobile breakpoint risk on short pages.
**Avoids:** Pitfall 13 (footer overlap on short pages from incorrect layout).
**Research flag:** Standard patterns. Sticky footer layout is well-documented.
**Estimated effort:** 2-3 hours.

### Phase 3: Content Surfaces (StoryCard + ArticleStory + BriefingView)
**Rationale:** The 8 story cards on the homepage are the most-viewed component. Getting editorial typography right here sets the premium register that users experience on every visit.
**Delivers:** Standardised headline scale on StoryCard, correct leading and display scale on ArticleStory, section divider refinement in BriefingView, semantic hover states replacing `hover:opacity-80`.
**Addresses:** STACK.md type scale recommendations, ARCHITECTURE.md Problem 3 (inline typography).
**Avoids:** Pitfall 2 (vertical rhythm breaks on 8-story grid). Test 375px viewport after every font change.
**Research flag:** Medium complexity. Typography changes require careful testing. No additional research needed but requires discipline in the token-first update pattern (Commit 1: replace hardcoded values with tokens; Commit 2: update token values).
**Estimated effort:** 4-6 hours.

### Phase 4: Conversion Surfaces (LandingHero + Upgrade Page)
**Rationale:** Conversion pages are the highest-leverage business surface. The upgrade page currently uses zinc palette (different visual register from the product), has no social proof, and has feature descriptions written as capability lists rather than outcome framing.
**Delivers:** Palette alignment (zinc to stone on upgrade page), `rounded-xl` CTA fix on LandingHero, rewritten feature copy (outcome-framed), founding story paragraph, personal refund guarantee, cancel-anytime reassurance on mid-grid nudge.
**Addresses:** FEATURES.md Priority 1 items (founding story, outcome framing, risk reversal), ARCHITECTURE.md Problem 1 (palette inconsistency on upgrade page).
**Avoids:** Pitfall 3 (visual refactor breaking Stripe checkout). Mandatory smoke test after every deploy.
**Research flag:** Standard patterns for copy. No research-phase needed — copy comes from FEATURES.md spec. Social proof infrastructure (student count, testimonials) deferred until real users exist.
**Estimated effort:** 2-3 hours (excluding copy writing time).

### Phase 5: Utility Pages (Archive + Firms + Quiz + Tests + Primers)
**Rationale:** Utility pages have lower visual priority but must align with the design language established in Phases 1-4. Apply consistent heading pattern and palette rule without touching business logic.
**Delivers:** Consistent stone heading pattern, palette audit per stone-vs-zinc rule, uniform page container pattern.
**Addresses:** ARCHITECTURE.md Problem 1 (palette applied inconsistently across utility pages).
**Avoids:** Pitfall 1 (token changes without audit) — apply tokens from Phase 1, do not create new values.
**Research flag:** Standard patterns. No deeper research needed.
**Estimated effort:** 3-4 hours across the cluster.

### Phase Ordering Rationale

- Tokens before components is a hard dependency: using `rounded-card` in a component requires the token to exist first
- Shell before content surfaces: header changes affect every page, so establishing it cleanly first means content surface work is not contaminated by unresolved shell issues
- Content surfaces before conversion surfaces: the upgrade page should reflect the same design register as the product — polish the product first, then align the conversion surface to match
- Utility pages last: they are lower risk and lower priority; applying the established pattern is mechanical once Phases 1-4 are complete
- CRO work (conversion metrics, A/B testing) is deliberately excluded from all phases: no data baseline exists yet, and guessing-loop changes degrade the existing funnel

### Research Flags

Phases needing no additional research (proceed directly):
- **Phase 1:** All token decisions fully specified in STACK.md and ARCHITECTURE.md
- **Phase 2:** Sticky footer is a standard pattern; footer content is defined in the backlog
- **Phase 4:** Copy direction fully specified in FEATURES.md; Stripe integration untouched
- **Phase 5:** Mechanical application of tokens from Phase 1

Phases requiring careful discipline (not research, but process):
- **Phase 3:** High risk of typography regressions on the 8-story homepage grid. Token-first update pattern is mandatory. Test at 375px viewport after every change.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations based on direct codebase audit. No new packages recommended — all changes are config and CSS within the existing stack. STACK.md Confidence: MEDIUM-HIGH (training knowledge + codebase analysis). |
| Features | HIGH for codebase observations; MEDIUM for conversion patterns | Direct code reading of all conversion components. SaaS conversion patterns from training knowledge (well-established). "What UK law students respond to" is LOW confidence — should be validated with the owner's peer network before major copy investment. |
| Architecture | HIGH | All structural findings (palette inconsistency counts, radius value counts, typography size audit) based on direct code count/audit of 14 key files. No inference involved. |
| Pitfalls | HIGH for technical pitfalls; MEDIUM for CRO thresholds | Technical pitfalls (Tailwind token changes, dark mode gaps, Stripe regression) are direct consequences of how the tech stack works — HIGH confidence. CRO thresholds ("50 users before optimising") are judgment calls — MEDIUM confidence. |

**Overall confidence:** HIGH

### Gaps to Address

- **Social proof copy:** What specific outcomes resonate with UK Magic Circle TC applicants is LOW confidence from research alone. Before writing social proof copy, the owner should run a 5-person informal survey with peers ("what would make you trust a subscription product like this?"). The FEATURES.md recommendations are directionally correct but the specific language needs validation.

- **Mobile layout audit:** ARCHITECTURE.md and PITFALLS.md both flag mobile as high-risk (60-70% of student traffic) but neither researcher was able to view the app in a browser to assess current mobile state. Phase 3 should begin with a dedicated mobile audit at 375px before making any typography changes.

- **FolioMark at small sizes:** FEATURES.md flags that the folded-document logomark may collapse to illegible at favicon size (16x16). This should be verified before Phase 2 (shell) ships — if the favicon needs a simplified fallback (just the letter F), that decision should be made before the header polish is finalised.

- **Vercel Analytics:** Pitfall 9 flags that CRO work requires a data baseline. Installing Vercel Analytics (free tier) is a prerequisite for any future Phase 4 expansion into conversion optimisation. It is not a blocker for the design lift phases but should be done in parallel.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase audit (2026-03-09): `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`, `components/Header.tsx`, `components/StoryCard.tsx`, `components/BriefingView.tsx`, `components/ArticleStory.tsx`, `components/LandingHero.tsx`, `components/SiteFooter.tsx`, `app/upgrade/page.tsx`, `app/archive/page.tsx`, `app/firms/page.tsx`, `lib/types.ts`, `components/NavDropdowns.tsx`
- CLAUDE.md — product brief, tech stack, design principles (checked into codebase)
- Tailwind CSS v3 documentation — type scale, spacing, border radius (training knowledge, HIGH confidence for v3 specifics)
- WCAG 2.1 contrast ratios — 4.5:1 AA standard for normal text (HIGH confidence)
- shadcn/ui CSS variable customisation — `--radius` token system (HIGH confidence)

### Secondary (MEDIUM confidence)
- Playfair Display typographic behaviour — editorial usage patterns (The Economist, FT Weekend), training knowledge
- DM Mono as editorial mono alternative — training knowledge, verify against current Google Fonts before implementing
- SaaS conversion patterns — outcome framing, social proof placement, risk reversal copy — training knowledge, well-established principles
- Comparable niche professional tool patterns — 80,000 Hours, Bright Network, LawCareers.net (training knowledge)

### Tertiary (LOW confidence)
- "What UK law students respond to" in conversion copy — needs owner peer network validation before major copy investment
- CRO timing thresholds (50 users minimum) — judgment call, not a verified industry standard
- Fiverr logo design pricing (£30-80) — may have changed since training data cutoff

---
*Research completed: 2026-03-09*
*Ready for roadmap: yes*
