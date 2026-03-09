---
phase: 04-conversion-surfaces
verified: 2026-03-09T23:30:00Z
status: human_needed
score: 8/8 must-haves verified (automated); 4/4 requirements satisfied
re_verification: false
human_verification:
  - test: "Visit folioapp.co.uk/upgrade in both light and dark mode; verify warm stone palette throughout (no coolish zinc tones), social proof block visible between features card and free-tier note, and SiteFooter at bottom"
    expected: "Stone-only palette, social proof block with 'Join 200+ law students' badge and Bristol testimonial, SiteFooter with links"
    why_human: "CSS palette warmth (stone vs zinc visual feel) and layout placement cannot be verified programmatically — only a browser renders actual computed colours"
  - test: "Visit folioapp.co.uk in light mode, click a stage selector button (e.g. 'Interviews soon'), then observe the CTA button 'Get started — £4/month'. Confirm the CTA has a barely-curved flat radius (not pill-shaped) and that hovering darkens the background (does not fade opacity)"
    expected: "CTA and stage buttons have flat 4px radius; hover shifts to darker warm stone, not translucent"
    why_human: "Border radius visual feel and hover animation behaviour require browser rendering to confirm"
  - test: "On folioapp.co.uk/upgrade in incognito, click 'Create account & subscribe' and confirm redirect to Stripe checkout without error"
    expected: "Stripe checkout page loads successfully"
    why_human: "Live Stripe API call cannot be verified statically; 04-03-SUMMARY confirms this was already human-approved on 2026-03-09"
---

# Phase 4: Conversion Surfaces — Verification Report

**Phase Goal:** A prospective subscriber who visits the upgrade page sees a product that matches the editorial register they just experienced, reads why it matters to their TC application, and trusts the person behind it
**Verified:** 2026-03-09T23:30:00Z
**Status:** human_needed (all automated checks pass; visual/functional items flagged for human confirmation per plan 04-03 which was already approved by owner on production)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

The ROADMAP defines four Success Criteria for Phase 4. All four map to plan must_haves across 04-01 and 04-02.

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Upgrade page uses the stone palette throughout — reads as the same product, not a separate SaaS page | VERIFIED | 0 zinc classes in app/upgrade/page.tsx; all containers use stone-* equivalents confirmed by grep |
| 2 | Every premium feature description is outcome-framed ("walk into interviews...") not capability-framed ("get access to...") | VERIFIED | All 6 feature strings present verbatim, confirmed by grep; first item "Walk into interviews with a point of view" matches spec |
| 3 | Social proof placeholder slots visible — wired for real data, clearly marked as placeholders | VERIFIED | Social proof block at lines 83-97 of upgrade/page.tsx; TODO comments at lines 86 and 90 satisfy REQUIREMENTS CONV-03 "clearly marked as placeholders" |
| 4 | LandingHero CTA border radius corrected to token system — rounded-xl inconsistency resolved | VERIFIED | 0 rounded-xl, 0 rounded-lg in LandingHero.tsx; 3x rounded-chrome (stage buttons line 73, recommendation links line 98, CTA line 112); hover:bg-stone-700 confirmed |
| 5 | SiteFooter appears on upgrade page | VERIFIED | Imported at line 7, rendered at line 134 (after `</main>` close at line 132) in correct flex-col position |
| 6 | CTA hover uses bg-stone-700 pattern, not hover:opacity | VERIFIED | 0 hover:opacity in both files; hover:bg-stone-700 dark:hover:bg-stone-300 confirmed in both upgrade/page.tsx (line 116) and LandingHero.tsx (line 112) |
| 7 | No arbitrary text-[Npx] sizes remain (except intentional logo responsive pair) | VERIFIED | Only match in upgrade/page.tsx is text-[22px] sm:text-[28px] on logo h1 (line 50) — explicitly preserved per plan spec |
| 8 | LandingHero CTA link points to /sign-up | VERIFIED | href="/sign-up" at line 111 of LandingHero.tsx |

**Score:** 8/8 observable truths verified (automated)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/upgrade/page.tsx` | Fully migrated upgrade page — stone palette, outcome copy, social proof, SiteFooter | VERIFIED | 137-line substantive implementation; all token classes present; Stripe logic wired; social proof block at lines 83-97 |
| `components/LandingHero.tsx` | Token-compliant hero component — rounded-chrome, text tokens, hover:bg | VERIFIED | 124-line substantive implementation; 3x rounded-chrome, 1x rounded-card, hover:bg-stone-700, section-label, no arbitrary values |
| `components/SiteFooter.tsx` | Footer component (already existed, imported into upgrade page) | VERIFIED | 52-line substantive component with 5 working nav links (Feedback, Terms, Privacy, Contact, LinkedIn) |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/upgrade/page.tsx` | `components/SiteFooter.tsx` | import + render as last child of min-h-screen flex flex-col div | WIRED | Import at line 7; `<SiteFooter />` at line 134, after `</main>` close at line 132 |
| `app/upgrade/page.tsx` | `/api/stripe/checkout` | fetch POST in handleUpgrade, response used | WIRED | fetch at line 33; response parsed at line 34; data.url used for redirect at line 36; error state at line 38 |
| `components/LandingHero.tsx` | `/sign-up` | Link href on CTA | WIRED | href="/sign-up" at line 111 |
| `components/LandingHero.tsx` | `app/page.tsx` (consumer) | import + conditional render | WIRED | Imported at app/page.tsx line 5; rendered at lines 35 and 60 (unauthenticated + free users) |

---

### Requirements Coverage

All four Phase 4 requirements are claimed across plans 04-01, 04-02, and 04-03.

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CONV-01 | 04-01 | Upgrade page palette aligned from zinc-* to stone-* | SATISFIED | `grep -c "zinc" app/upgrade/page.tsx` returns 0; all 14 former zinc classes replaced one-for-one with stone equivalents |
| CONV-02 | 04-01 | Upgrade page copy rewritten — outcome-framed, not capability-framed | SATISFIED | All 6 PREMIUM_FEATURES strings verbatim in file; each leads with user outcome before capability description |
| CONV-03 | 04-01 | Social proof slots added to upgrade page — placeholders for student count + testimonials | SATISFIED | Social proof block at lines 83-97; "Join 200+ law students" with TODO comment; blockquote testimonial with TODO comment — fulfils "wired up when real data exists, clearly marked as placeholders" per REQUIREMENTS.md |
| CONV-04 | 04-02 | LandingHero CTA border radius corrected to token system | SATISFIED | rounded-xl and rounded-lg both 0 in LandingHero.tsx; rounded-chrome count is 3 (stage buttons, recommendation links, CTA) |

**Orphaned requirements check:** REQUIREMENTS.md Traceability table maps CONV-01 through CONV-04 exclusively to Phase 4. All four IDs are claimed by plans in this phase. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/upgrade/page.tsx` | 86 | `TODO: update with real count when available` | INFO | Intentional — REQUIREMENTS CONV-03 explicitly requires slots "wired to show real data when it exists, clearly marked as placeholders until then". This TODO is the required marking. |
| `app/upgrade/page.tsx` | 90 | `TODO: replace with real testimonial` | INFO | Same as above — intentional placeholder marking per spec. Testimonial copy present; attribution "LLB student, University of Bristol" present. |

No blocker or warning anti-patterns. Both TODOs are spec-compliant placeholders, not implementation gaps.

---

### Human Verification Required

Plan 04-03 was a dedicated human verification checkpoint. The 04-03-SUMMARY.md records that the owner completed all five verification steps on production (folioapp.co.uk) and confirmed approval on 2026-03-09T23:09:38Z. The following items are flagged for completeness — they are already owner-approved but cannot be re-verified programmatically by this verifier.

#### 1. Upgrade Page Visual Palette (Light + Dark Mode)

**Test:** Visit folioapp.co.uk/upgrade, toggle between light and dark mode
**Expected:** Warm stone palette throughout in both modes — stone-900 CTA (light), stone-100 CTA (dark), stone-400 testimonial text, stone-800/40 free-tier note background. No coolish zinc tones anywhere.
**Why human:** CSS palette warmth (stone vs zinc perceptual feel) requires browser rendering of actual computed colours

#### 2. Social Proof Block Layout

**Test:** Visit folioapp.co.uk/upgrade, scroll down past the features list
**Expected:** "Join 200+ law students" count badge in mono label style, followed by blockquote testimonial in italic stone-600, followed by Bristol attribution — all centred and readable at 375px mobile
**Why human:** Layout and text legibility at mobile viewport require browser rendering

#### 3. LandingHero CTA Radius and Hover

**Test:** Visit folioapp.co.uk, click a stage selector button, observe CTA "Get started — £4/month". Hover over CTA button.
**Expected:** Flat 4px radius on all three button types; hover darkens background to stone-700, does not fade opacity
**Why human:** Visual radius feel and hover animation require browser observation

#### 4. Stripe Checkout Smoke Test

**Test:** Visit folioapp.co.uk/upgrade in incognito, click CTA button
**Expected:** Redirect to Stripe checkout without error
**Why human:** Live Stripe API call; owner confirmed this on 2026-03-09 (04-03-SUMMARY line: "Stripe checkout redirect confirmed working from /upgrade in incognito — no error")

---

### Gaps Summary

No gaps found. All automated checks pass across both modified files. The two TODO comments in the social proof block are intentional and required by the CONV-03 specification ("clearly marked as placeholders until then").

The `human_needed` status reflects that three items (visual palette, radius feel, Stripe checkout) require browser/live verification and cannot be asserted programmatically. The owner already completed human verification on production on 2026-03-09 per 04-03-SUMMARY.md. If that record is accepted as sufficient, this phase may be treated as fully complete.

---

_Verified: 2026-03-09T23:30:00Z_
_Verifier: Claude (gsd-verifier)_
