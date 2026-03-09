# Feature Landscape: Premium Branding and Conversion

**Domain:** Niche B2C editorial SaaS — professional preparation tool for UK law students
**Researched:** 2026-03-09
**Confidence note:** External search tools unavailable. Findings draw on training knowledge of premium SaaS patterns, validated against the actual codebase. Confidence levels reflect this.

---

## Table Stakes

Features every premium B2C SaaS needs to feel credible. Missing any of these and the product feels unfinished regardless of content quality.

| Feature | Why Expected | Complexity | Current State |
|---------|--------------|------------|---------------|
| Proper brand mark (logo/wordmark) | Trust signal #1. Users judge "is this real?" in under 2 seconds. Text-only brand reads as prototype. | Low | FolioMark SVG exists — folded-document with F letterform. Not yet verified as visually polished or consistent across contexts. |
| Quantified social proof | "X students already use this" removes the fear of being the only one. Exact number beats vague claim. | Low | None visible anywhere in the current UI. |
| Above-the-fold value proposition | Visitors from LinkedIn/peer links must instantly understand the product in one sentence. | Low | LandingHero headline "Turn today's deals into confident interview answers" is good. Strapline in BriefingView is weaker. |
| Paywall friction calibrated correctly | Free tier must be genuinely useful so paid feels like a natural upgrade, not a ransom. | Low | Free tier shows headlines + excerpt + talking point teaser. Calibration looks right in code. |
| Cancel-anytime reassurance | Overcomes commitment objection at checkout. £4/month is low-risk but must say it explicitly. | Low | "Cancel any time. Billed monthly via Stripe." exists on /upgrade. Not visible on the paywall mid-grid nudge. |
| Legal pages reachable | Terms + Privacy required for any subscription product. | Low | /terms and /privacy exist. SiteFooter links to them. |
| Contact/support route | Single founder products need a human contact. Missing it reads as abandoned. | Low | hello@folioapp.co.uk in SiteFooter. |
| Responsive polish on mobile | >60% of student discovery will be mobile (LinkedIn, WhatsApp shares). | Medium | Not assessed here — flag for design lift phase. |
| Coherent type scale | Editorial products live or die on typography. Inconsistent type sizes break authority. | Medium | Currently uses font-serif for headings, font-mono for labels, font-sans for body — correct direction. Execution quality TBD. |
| Consistent border/radius system | Mixed border radii (rounded-sm, rounded-xl, rounded-lg) across components undermine premium feel. | Low | CONCERN: upgrade/success pages use rounded-xl; story cards use rounded-sm; BriefingView upgrade block uses rounded-sm. Mixed. |

---

## Differentiators

Features that set Folio apart from free alternatives (FT Student, law firm LinkedIn posts, peers sharing notes). Not expected, but when present they create "this was built for me" moments.

| Feature | Value Proposition | Complexity | Current State |
|---------|-------------------|------------|---------------|
| Student count / cohort language | "Join 200+ law students preparing for TC season" creates belonging and urgency. More powerful than generic "trusted by professionals." | Low | Absent. Easy to add as a static number once any users exist; can start with "Be among the first" framing before that. |
| Named law society / university endorsements | One line-note from a target university's law society president is more credible to this audience than 10 generic 5-star reviews. | Low | Absent. Owner has peer network to solicit this. |
| Outcome-framed testimonials | "I referenced a Folio story in my Freshfields interview" is 10x more compelling than "Great product!" for this audience. | Low | Absent. Needs real users first. Placeholder approach: use the owner's own experience as founding story. |
| "As seen on" credibility tier | Not press logos (they don't apply yet) — but university names (LSE, Durham, KCL) where the owner or early users study. | Low | Absent. Feasible once early adopter list established. |
| Feature discovery nudges for free users | Non-subscribed users should encounter premium features in context — not just a global upgrade banner. Currently: banner + mid-grid block + lock icon on card. | Low | EXISTS but limited. The mid-grid upgrade block is present. Could be sharper. |
| Visual differentiation of free vs premium content | Subscribers should feel the premium state is visually richer/warmer than free browsing — not just unlocked. This drives perceived value. | Medium | Currently free tier just locks cards. Premium articles could use a different visual treatment (warmer background, richer typography). |
| "You've been using Folio for X days" streak/momentum message | Law students are goal-oriented. Acknowledging daily use creates habit and reduces churn. | Low | Quiz streak exists. Generalised daily streak absent. |
| Founding story / "why I built this" | Peer-built tools have authentic credibility that funded startups don't. "Built by an LLB student who couldn't afford £80/month for all the resources I needed" resonates directly with the target user. | Low | Absent. Should appear on upgrade page and/or footer. |
| Named author attribution | "Curated by [name], LLB, [University]" on each briefing establishes human accountability and trust. AI-only attribution is a trust limiter in legal contexts. | Low | Not present. Briefing shows generation timestamp only. |

---

## Anti-Features

Things to deliberately NOT build or add during this milestone. Each would undermine either the product's editorial credibility, the budget constraints, or the target audience's expectations.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Generic 5-star review widgets | Sitejet-style star ratings look consumer/e-commerce, not professional. Law students will distrust them. | Use outcome-framed quotes with real names and universities |
| "Trusted by 10,000 professionals" badge before reaching that number | Fabricating social proof is a conversion killer when discovered. Students are detail-oriented. | Use honest numbers: "87 students this month" or start with "Be among the first" |
| Dark patterns on the paywall | Fake countdown timers, fake scarcity, auto-checked annual upgrades. This audience is future lawyers — they read contracts. | Honest pricing, cancel-anytime, no tricks |
| Multiple pricing tiers / feature comparison matrix | Adds cognitive load. One tier at £4/month is the right call for this stage. | Keep single tier, defer annual pricing until there's data on churn |
| User-generated content showcase | UGC (comments, user posts) reads unprofessional in a legal context and adds moderation burden the sole founder can't handle | Delete or hide comments feature until there's a moderation plan |
| Pop-up/interstitial on entry | Immediately positions product as low-quality. Newspaper products don't interrupt you before you've read anything. | Let free tier be genuinely browsable; paywall reveals naturally as users reach premium content |
| Animated hero / video autoplayer | Slows page, clashes with editorial direction, adds zero trust for this audience | Static text + typography is faster and more authoritative |
| Generic "premium" terminology | Words like "Pro", "Plus", "Elite" are overused SaaS vocabulary. | Use editorial language: "Subscriber", "Subscription", "Folio Premium" — already correct in some places, inconsistent in others |
| Social login as the only option | Clerk supports both email and social. For professional contexts, email+password is preferred — students use personal GMail for social but may not want that associated with a career tool | Keep email+password as primary, social as secondary option |
| Logos of firms as brand endorsement | Displaying Freshfields/Clifford Chance logos implies a commercial relationship that doesn't exist | Never use firm logos; use firm names in plain text as "covered firms" |

---

## Feature Dependencies

```
Social proof (student count) → real users exist
Named testimonials → real users + owner outreach + permission to quote
University endorsements → peer network activation + time
Visual premium/free differentiation → design lift phase complete
"Built by" founder story → copy written + placed on upgrade page
Outcome-framed testimonials → 30+ days of user activity data
```

---

## Gaps in Current Upgrade Page (/upgrade)

Reading the actual upgrade page code against best practices reveals these specific gaps:

**Missing: any social proof.** The upgrade page is a feature list + CTA. No student count, no testimonial, no university name, no founding story. For a £4/month ask from a student with no prior relationship with the brand, this is the single highest-impact gap.

**Missing: the "why" not just the "what".** "In-depth articles — structured talking points" describes the feature. It doesn't describe the outcome: "Walk out of your Freshfields interview having just cited the BlackRock deal from this morning's briefing." Features describe, outcomes convert.

**Missing: specificity on the quiz.** "Daily quiz — 24 questions to lock in the facts" undersells. The quiz is tied to that day's actual stories, which is distinctive. This specificity matters.

**Inconsistency: upgrade page uses zinc palette; homepage uses stone palette.** The upgrade/success pages were built with zinc-* classes, while the main product uses stone-*. This reads as two different products. Needs to be harmonised to stone throughout.

**Missing: risk reversal beyond "cancel any time".** Could add "If you subscribe and find Folio isn't useful after a week, email me and I'll refund you personally — hello@folioapp.co.uk." A solo founder can offer this authentically; a VC-funded startup cannot. This is a genuine differentiator.

---

## MVP Recommendation for This Milestone

Prioritise this order. Each item is independently shippable.

**Priority 1 — Immediate trust signals (no user data needed):**
1. Founding story copy on upgrade page — "Built by an LLB student who spent hours piecing together commercial awareness prep from scattered free sources. Folio is what I wished existed."
2. Outcome-framed feature descriptions on upgrade page — rewrite feature list from "what it does" to "what you can say in the interview"
3. Personal refund guarantee on upgrade page — one sentence, authentic to solo founder
4. Verify FolioMark renders cleanly at all sizes and matches wordmark weight
5. Harmonise palette: change upgrade/success pages from zinc-* to stone-* (consistent with main product)

**Priority 2 — Social proof infrastructure (add before first marketing push):**
6. Student count display in LandingHero — even "Join the first 50 students" is better than nothing
7. University name tags from early adopters — solicit from owner's peer network
8. One outcome testimonial — even the owner's own experience phrased as a quote from an early user

**Priority 3 — Conversion lift (after first cohort of users):**
9. Mid-article upgrade nudge with specific feature preview — show a blurred talking point with "Subscribe to read the full analysis"
10. Personalised upgrade path based on onboarding stage — "Interviews soon" users see quiz/firm pack nudge first, not generic feature list
11. Post-quiz upgrade nudge — after a free user tries to access the quiz, land them on a page that shows them one sample question before asking them to subscribe

**Defer:**
- Comments — no moderation infrastructure, adds UGC trust risk, distraction from core product
- Annual pricing — no churn data to justify it yet
- Referral program — too early, user base too small to make it meaningful

---

## Logo and Wordmark Assessment

**Current state:** FolioMark SVG exists — a folded-document outline with F letterform drawn in strokes. Uses `currentColor` so inherits theme colour. The concept is appropriate: a legal document (folio = a large page or volume), with F for Folio. The mark is drawn programmatically, not designed by a visual designer.

**What makes law-adjacent marks credible:**
- Restraint: single-weight strokes, no fills, no gradients — matches current mark
- Geometric precision: optical corrections matter at small sizes (the F mid-bar should be slightly shorter than the top bar — this is already done)
- Wordmark weight match: the SVG mark and the serif "Folio" text need to feel like they belong together; specifically, the stroke weight of the mark should visually match the stroke weight of the "Folio" serif at its rendered size
- Dark mode parity: `currentColor` handles this correctly
- Favicon: needs to verify the mark reads at 16x16 and 32x32 — folded-corner documents collapse to illegible at favicon size

**What to verify (not redesign):**
- Does the FolioMark at size 34 (as used in Header) feel balanced against the 38px font-serif "Folio" wordmark?
- Does the mark read clearly at 20px (mobile header contexts)?
- Does the favicon (if using this mark) work at 16x16? If not, fallback to just the letter F in the same stroke style.

**Recommendation:** Do not redesign from scratch. Verify the current mark against these criteria and adjust stroke weights or size ratios if needed. The concept is right. The risk is in execution details at small sizes.

---

## Social Proof Patterns for Niche Professional Tools

Analysis based on how comparable niche products succeed (80,000 Hours, Bright Network, LawCareers.net, Chambers Student):

**What works for this specific audience:**
1. **Specificity of outcome** — "Got my Linklaters VS after using Folio daily for 3 weeks" > any star rating
2. **Peer credibility** — named student from named university > anonymous review
3. **Recency signals** — "73 students signed up in March" feels current > "thousands of users"
4. **Institutional touch-points** — law society name-checks, even informal ones, carry weight in this world
5. **Volume with precision** — "127 students" is more credible than "hundreds of students" because it implies real counting

**What does NOT work for this audience:**
1. Generic trust badges (SSL seals, "secure checkout") — expected and ignored
2. Media logos they don't recognise — meaningless without context
3. Vague claims ("the best commercial awareness tool") — law students are trained to spot unsupported assertions
4. Quantity without context — "1,000 downloads" means nothing for a briefing tool; "1,000 briefings read" means something

**Timing:** Social proof should appear before the CTA, not after. Currently, the upgrade page goes: features → CTA. It should go: features → social proof → CTA.

---

## Sources

- Codebase analysis: `/Users/gregoryvitrenko/Documents/Folio/components/` (all upgrade/landing/conversion components read directly)
- Product context: `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`
- Confidence: HIGH for codebase observations (direct code read). MEDIUM for SaaS conversion patterns (training knowledge, well-established principles). LOW confidence specifically for "what UK law students respond to" — this should be validated with a small survey of the owner's peer network before major design investment.
