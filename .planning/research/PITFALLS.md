# Domain Pitfalls

**Domain:** Design lift, logo/branding, and CRO work on a live SaaS product (solo developer)
**Researched:** 2026-03-09
**Confidence note:** Web search and Bash tools were unavailable during this research session. All findings are drawn from well-established practitioner knowledge. Each finding is confidence-labelled. No finding is stated as fact where it relies solely on unverified training data.

---

## Critical Pitfalls

Mistakes that cause rewrites, regressions on a live product, or wasted sprints.

---

### Pitfall 1: Changing Design Tokens Globally Without Auditing All Consumer Components

**What goes wrong:** A developer changes a core Tailwind class — e.g. switching `rounded-sm` to `rounded-xl`, or changing the stone border token — and applies it "globally" through a search-and-replace or a shared CSS variable. The change works in the 3 components they tested but silently breaks 12 others that had layout-dependent assumptions (e.g. a card inside a card where the outer radius clips the inner). On a live product, users see the regression before the developer does.

**Why it happens:** Tailwind utility classes are scattered across dozens of component files. There is no single token file that enforces consistency — `cn()` calls with conditional classes make the full set of applied classes invisible at a glance. The CONVENTIONS.md already shows the bug: CLAUDE.md says `rounded-xl` but the actual codebase uses `rounded-sm`. That inconsistency exists _now_ on a production site and is a warning sign.

**Consequences:** Misaligned card corners, broken dark mode rendering (dark: variants missed), topic colour badges that no longer contrast, or the podcast player breaking on mobile because its containing border-radius changed. Most are invisible in light mode but obvious in dark.

**Prevention:**
1. Before any token change, run a global grep for the old class to find all consumers.
2. Change one component at a time, not with search-and-replace.
3. Resolve the `rounded-sm` / `rounded-xl` discrepancy in CONVENTIONS.md before the design lift starts — pick one value, document it, and use that as the baseline.
4. Test dark mode on every component touched. Next.js + Tailwind dark mode requires the `dark:` variant to be explicitly added — it is never inherited.

**Detection:** After any token change, view the page in both light and dark mode, and check every page that renders that component type (card, badge, section label).

**Phase:** Design Lift — Week 1 (foundations work). Address before any page-level polish.

**Confidence:** HIGH — this is a direct consequence of how Tailwind works and is confirmed by the CONVENTIONS.md inconsistency already in the codebase.

---

### Pitfall 2: Typography Changes That Break Vertical Rhythm on Content-Heavy Pages

**What goes wrong:** The developer adjusts heading size, line-height, or font weight on one page. The change looks good in isolation. But the briefing cards, story list, quiz questions, and firm profile pages all share underlying typographic assumptions about how much vertical space text occupies. Changing `leading-snug` to `leading-normal` on headings causes cards to overflow their height constraints, truncation ellipsis to fire in wrong places, or the 8-story briefing grid to exceed viewport height.

**Why it happens:** Newspaper/editorial typography is more sensitive to vertical rhythm than standard SaaS typography. The stone/zinc palette and `divide-y` row pattern means that text overflow in one row pushes every subsequent row down. The briefing has 8 stories with excerpts — any extra line-height ripples 8× per page.

**Consequences:** Content truncation breaks (3-line clamp no longer matches the card height), the podcast player and quiz interface overlap content below them on mobile, or the topic filter tabs overflow onto two rows.

**Prevention:**
1. Lock heading/body font sizes and line-heights in a single design spec before starting. Tailwind's default scale (`text-sm`, `text-base`, `text-lg`) should map to specific roles (excerpt, headline, section label) and not be changed page-by-page.
2. Test every typography change on the main `/` page (8 stories) and `/firms/[slug]` (most content-dense page) before declaring it done.
3. On mobile viewport (375px) only — desktop typo often looks fine, mobile breaks.

**Detection:** Check the homepage on a 375px viewport width after every typography change. If the 8-story grid still fits without overflow, the change is safe.

**Phase:** Design Lift — typography pass. Do not change font sizes and spacing in the same commit.

**Confidence:** HIGH — established consequence of modifying typographic scale on content-dense layouts.

---

### Pitfall 3: "Polishing" the Paywall Pages While Breaking the Conversion Path

**What goes wrong:** The developer improves the visual design of the upgrade page, the sign-in page, or the story cards with paywall nudges. A CSS change or component refactor accidentally removes a `requireSubscription()` redirect, makes the upgrade CTA invisible in dark mode, or breaks the Stripe checkout button's `onClick` handler. The site looks better but stops converting. On a live product with real paying customers, a broken checkout is the worst possible regression.

**Why it happens:** Paywall components (`/upgrade`, `/story/[id]` premium lock, mid-grid upgrade nudge) are the intersection of UI and critical business logic. A visual refactor that touches `className` also risks touching `onClick`, `href`, or the conditional rendering that shows/hides premium content. The review bypass cookie in `middleware.ts` makes it easy for the developer to accidentally test while bypassed — they never see the paywall state they're shipping.

**Consequences:** Stripe checkout broken → zero new subscriber revenue. Free users see premium content → subscription value destroyed. Or subtler: upgrade CTA invisible in dark mode → conversion rate halved for dark mode users who are likely the more tech-savvy segment.

**Prevention:**
1. Test the full upgrade flow end-to-end (unauthenticated → sign-up → upgrade → Stripe) after every change to any component on the `/upgrade` page or story pages.
2. Explicitly test in dark mode.
3. Add the upgrade page to a "smoke test checklist" that runs before every deploy involving UI changes.
4. Never use the review bypass cookie during development of paywall-adjacent UI — disable it so you see what real users see.

**Detection:** After any deploy that touches `/upgrade`, `StoryCard.tsx`, or the mid-grid nudge component: open an incognito window, go to the homepage, and attempt to read a full article. Confirm the paywall fires and the upgrade button leads to Stripe.

**Phase:** All design lift phases. This is a standing constraint, not a one-time fix.

**Confidence:** HIGH — broken checkout is the canonical "design lift regression" on SaaS products.

---

### Pitfall 4: Solo Developer Logo Design That Looks Like a Logo

**What goes wrong:** A solo developer with no design budget tries to create a distinctive wordmark or brand mark. The result is either (a) a generic icon from a library bolted next to the product name in a standard weight, (b) an over-engineered abstract shape that looks amateur, or (c) a font-based wordmark in an inappropriate typeface that reads as "free template." None of these build trust with the target audience (competitive law students screening for quality signals).

**Why it happens:** Logo design is a separate discipline from UI design. The tools available to a solo dev (Figma free tier, Canva, online generators) produce outputs that look like what they are: free-tier outputs. The temptation is to spend a week iterating in Figma on something that a professional would spend 2 days on and produce 10× better.

**Consequences:** A bad logo deployed on a live product is harder to change than a missing one. Users anchor on the first impression. A visually weak logo undermines the "premium editorial" positioning even if the product is excellent.

**Prevention:**
1. Use a typography-first approach: a well-chosen typeface set in the right weight IS the wordmark. For a newspaper/editorial product, this is appropriate and professional. The word "Folio" in Playfair Display (already loaded) at the right weight and tracking is a credible wordmark without any icon.
2. If an icon/mark is needed: use geometric abstraction at small scale (the letter F stylized, not a generic briefcase or scales of justice). Test it at 16px favicon size before committing — most developer-made marks fall apart at small sizes.
3. Do not use gradients. Do not use drop shadows. Do not add a tagline in the logo lockup.
4. Budget constraint: Fiverr logo design for "minimal wordmark" from a specialist (not a generalist) costs £30-80 and is better than 20 hours of DIY Figma. This is within the £50/month budget for a one-time spend.
5. If DIY: pick one of (a) pure typography or (b) a single geometric element — never both. "Folio" in Playfair Display Italic with tracked small caps is a complete solution.

**Detection:** Show the logo to someone outside the project at two sizes: header size (~120px wide) and favicon size (16px). If they cannot read it cleanly at 16px, it fails.

**Phase:** Logo/branding phase. Design before implementing — do not ship a placeholder and iterate on live.

**Confidence:** MEDIUM — widely documented in indie hacker and solo founder communities. Specific recommendations (Playfair Display wordmark) are HIGH confidence given it is already loaded in the codebase and appropriate to the editorial positioning.

---

### Pitfall 5: Brand Colour Changes That Require Updating 40+ Component Files

**What goes wrong:** A developer decides the stone palette needs adjustment — maybe stone is too warm, or the zinc chrome feels off. They change the base colour in `tailwind.config.ts`. Because Tailwind generates utility classes at build time, the config change cascades to every component that uses `stone-*` or `zinc-*` classes. But the actual values of `stone-700` in Tailwind's default palette are fixed — you cannot "adjust" them without overriding the entire scale. The developer either overrides the scale (which then breaks the coherent step progression) or switches to a custom colour (which requires updating 40+ component files that reference `stone-` by name).

**Why it happens:** Tailwind's semantic palette names (stone, zinc) are baked into component classNames, not abstracted behind CSS variables. If the design direction says "keep stone/zinc" but the specific shades need tuning, there is no clean way to do it short of a full rename or CSS variable abstraction layer.

**Consequences:** Either the design lift is abandoned halfway (stone stays but the developer wanted something slightly different), or a complete palette rename takes 2-3x longer than estimated and introduces regressions.

**Prevention:**
1. Before the design lift, commit to the stone/zinc palette as-is. If the goal is "better execution of the newspaper feel," that is achieved through spacing, typography, and hierarchy — not by changing the grey palette.
2. If palette adjustment is genuinely needed, use Tailwind's `theme.extend.colors` to add a custom palette (e.g. `editorial`) as CSS custom properties, then migrate components one at a time. This is a multi-week project, not a design lift.
3. Decision for this project: the stone/zinc palette is correct for the editorial direction. Do not change it. The lift should be in spacing, typography weight/hierarchy, and component polish — not colour.

**Detection:** If you find yourself editing `tailwind.config.ts` during a "design lift" task, stop and ask whether this is solving a real problem or a perceived one.

**Phase:** Design Lift — foundations. Establish a "no palette changes" constraint before work begins.

**Confidence:** HIGH — direct consequence of how Tailwind utility classes work.

---

## Moderate Pitfalls

---

### Pitfall 6: Font Loading Regressions on Deploy

**What goes wrong:** The project loads three Google Fonts via `next/font/google` in `app/layout.tsx` (Inter, Playfair Display, JetBrains Mono). A design lift often involves adding a new font weight (e.g. Playfair Display 700 italic for pull-quotes) or a new variant. If the font config in `layout.tsx` changes without also updating the CSS variable reference, the fallback font renders on production until the next full cold start. Users see the wrong font — often Times New Roman or Arial — until the font CDN warms up.

**Prevention:**
1. When adding font weights: add them to the existing `next/font/google` call in the same `subsets` array, then test with `?no-cache` in the network tab.
2. Test font rendering in both Chrome and Safari — Safari's fallback font stacking is different.
3. Do not add a fourth font. The three already loaded (mono, sans, serif) cover all design roles.

**Phase:** Design Lift — typography pass.

**Confidence:** HIGH — documented Next.js font behavior.

---

### Pitfall 7: Mobile Breakpoint Blindness During Polish Work

**What goes wrong:** A developer doing visual polish works primarily on a 1440px desktop monitor. The newspaper layout looks excellent. The product ships. 60-70% of target users (law students) are on mobile — on the train, between lectures, during revision breaks. The polished headers have 4-column grids that collapse to unreadable single columns, the podcast player overlaps the story list, or the topic filter tabs scroll off-screen.

**Prevention:**
1. After every design change, switch to Chrome DevTools 375px viewport before committing.
2. The 8-story briefing grid is the highest-risk area — test it at 375px on every iteration.
3. The topic filter tab bar with 8 topics is the second highest-risk area (overflow on small screens).

**Phase:** All design lift phases.

**Confidence:** HIGH — mobile traffic proportion for student products is well-established.

---

### Pitfall 8: Inconsistent Spacing Scale Producing "Almost Right" Layouts

**What goes wrong:** The developer tweaks padding and margin values to improve visual breathing room. Some components get `p-6`, others `p-5`, others `p-4`. The result is close but not coherent — experienced users sense something is off but cannot name it. This is worse than a consistently tight layout because it signals "amateur polish" rather than "unfinished."

**Prevention:**
1. Before any spacing changes, define a spacing scale: base unit is `p-4` (1rem) for card padding, `gap-4` for grid gaps, `py-8` for section vertical separation. Stick to this scale across all components.
2. Tailwind's default 4-unit scale (4, 6, 8, 10, 12) is intentionally coherent — use it, do not invent intermediate values like `p-5` or `p-7` unless there is a specific reason.
3. Create a brief written spec: "Cards: p-4. Section gaps: gap-4. Page container: px-4 md:px-8. Top-level sections: py-8." Reference this before every spacing decision.

**Phase:** Design Lift — spacing pass. Do spacing in one dedicated pass, not interleaved with typography or colour work.

**Confidence:** HIGH — established design principle.

---

### Pitfall 9: CRO Optimisation Decisions Made Without a Baseline

**What goes wrong:** A developer with no user data looks at the homepage and decides the upgrade CTA is "too low on the page" or the paywall message is "too aggressive." They move things around based on intuition. With no baseline analytics, they cannot tell whether the change improved conversion — so they keep making changes, each one eroding the previous structure. After 4 iterations, the conversion funnel is messier than the original.

**Why it happens:** Conversion optimisation requires a baseline (what is the current conversion rate?) and a change + measurement cycle. Without either, it is not optimisation — it is guessing with extra steps. Solo developers with no user data often try to pre-optimise by copying patterns from other SaaS products without knowing whether those patterns apply to their audience or funnel structure.

**Consequences:** The upgrade CTA gets moved 4 times, the paywall message rewritten 3 times, and the net result is that nothing is measurably better and the design is now inconsistent.

**Prevention:**
1. Install Vercel Analytics (free tier) before any conversion-related design work. Even 20 users generate enough data to see which pages have high exit rates.
2. For Folio specifically: the conversion path is `homepage (free user) → story card click → paywall → /upgrade → Stripe`. Instrument this funnel with a simple event-based approach (Vercel Analytics custom events or Plausible) before changing any step in it.
3. The only safe CRO change without data is one that removes friction (e.g. fewer clicks to reach the upgrade page). Avoid changes that add complexity.
4. Defer "conversion feature" work (listed as Active in PROJECT.md) until there are at least 50 signed-up free users and observable drop-off data.

**Detection:** If you are making a CRO-related change and you cannot state "the metric I expect to move is X, the current value is Y," stop. The change is not evidence-based.

**Phase:** Conversion feature — explicitly deferred in PROJECT.md until user base exists. This constraint should be enforced in the roadmap.

**Confidence:** MEDIUM — well-documented in CRO literature. The specific threshold (50 users) is a judgment call, not a verified number.

---

### Pitfall 10: "Social Proof" Placeholders That Undermine Trust

**What goes wrong:** A developer adds a "Join 200+ students" badge or "Trusted by students at Oxford, Cambridge, LSE" copy to the landing page before those numbers are real. Law students applying to Magic Circle firms are trained to verify claims. A false or inflated social proof claim discovered by a single user will be shared in the law society Discord/WhatsApp groups that are the primary word-of-mouth channel for this product.

**Prevention:**
1. Never display user counts or institution claims that are not verified real numbers.
2. For early social proof: use qualitative testimonials from real users (even 1-2 people is legitimate). A single named quote from a real student is more credible than a fake aggregate count.
3. If there are zero testimonials, use a different trust signal: the product's output quality (show a real briefing excerpt), the pricing transparency (clear £4/month, cancel anytime), or the creator's credibility (LLB student who uses it themselves).
4. "Early access" framing is honest and positions scarcity positively: "In early access — limited to 50 users while I refine the product."

**Phase:** Social proof — only launch when real numbers exist. This is a standing constraint.

**Confidence:** HIGH — the audience (competitive law students) is highly credibility-aware. The channel (law societies, peer networks) means false claims spread fast.

---

## Minor Pitfalls

---

### Pitfall 11: Dark Mode Coverage Gaps in New Components

**What goes wrong:** A new visual component (pull-quote block, social proof badge, footer card) is built in light mode and looks polished. The `dark:` variant classes are forgotten or applied inconsistently. On first visit from a dark mode user, the component renders with a white background on a dark page.

**Prevention:** Every new component built during the design lift must have both a light-mode and dark-mode check before the PR is created. Check with `prefers-color-scheme: dark` in DevTools, not just the manual toggle.

**Phase:** Design Lift — all phases.

**Confidence:** HIGH.

---

### Pitfall 12: Logo at Wrong Colour in Dark Mode

**What goes wrong:** A wordmark or logomark is designed in dark ink for the light header. In dark mode, the header goes dark and the logo becomes invisible. This is the most common logo implementation mistake by developers who are not designers.

**Prevention:**
1. Design the logo as an SVG with a `currentColor` fill so it inherits the heading text colour.
2. Test at header render in both `bg-white` and `bg-zinc-950` contexts before finalising.
3. If the logo is a bitmap (PNG/JPG), you need two versions: one for light, one for dark. Use `next/image` with a `className="dark:invert"` filter as a stopgap, but it is not a substitute for proper two-colour asset handling.

**Phase:** Logo/branding phase.

**Confidence:** HIGH — direct consequence of dark mode colour handling.

---

### Pitfall 13: Footer as an Afterthought That Breaks Page Structure

**What goes wrong:** The site footer is in the backlog (PROJECT.md lists it as Active: "Site footer — feedback link, terms/privacy, contact/LinkedIn"). When it is added, the developer uses absolute or fixed positioning, or sets `min-height` incorrectly, which causes the footer to overlap content on short pages (e.g. the `/onboarding` page which may have minimal content). On long pages, the footer pushes the Scroll To Top button into an unclickable position.

**Prevention:**
1. Implement the footer using flexbox sticky footer pattern: `<body className="flex flex-col min-h-screen">` with `<main className="flex-1">` — footer always sticks to the bottom without overlapping.
2. Check the footer on the shortest page in the app (likely `/upgrade` or `/onboarding`) as well as the longest (likely `/firms/[slug]`).
3. The footer is already planned — implement it in the design lift phase so it is part of the polished first impression, not a visible "coming soon" gap.

**Phase:** Design Lift — structural pass.

**Confidence:** HIGH — standard sticky footer layout pattern.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Design token foundations | `rounded-sm` vs `rounded-xl` inconsistency causes split codebase | Audit and resolve before any other design work |
| Typography pass | Line-height changes break card grid on 8-story homepage | Test homepage at 375px after every font change |
| Spacing pass | Inconsistent padding values across components | Define written spacing scale, use Tailwind default steps |
| Logo/wordmark | Logo invisible in dark mode | SVG with `currentColor`; test both modes before committing |
| Logo/wordmark | Over-engineered mark that looks amateur | Typography-first approach: Playfair Display wordmark |
| Paywall/upgrade UI polish | Visual refactor breaks Stripe checkout CTA | End-to-end checkout smoke test after every deploy |
| Social proof copy | Inflated user numbers damage credibility with target audience | Only ship real numbers; use qualitative quotes for early stage |
| CRO work | No-data guessing loop damages existing funnel | Install analytics first; defer CRO until 50+ free users |
| Footer implementation | Flex layout missing causes footer overlap on short pages | `flex flex-col min-h-screen` + `flex-1` on main |
| Dark mode on new components | Missing `dark:` variants | Mandatory dark mode check before every component commit |

---

## Sources

**Confidence note:** Web search was unavailable during this research session. The pitfalls above are grounded in:

- Direct codebase analysis (CONVENTIONS.md, CONCERNS.md, ARCHITECTURE.md, PROJECT.md) — HIGH confidence for Folio-specific observations
- Established knowledge of Tailwind CSS utility class behaviour and Next.js font loading — HIGH confidence
- General practitioner knowledge of SaaS design lift patterns and CRO methodology — MEDIUM confidence; specific thresholds (e.g. "50 users") are judgment calls

Findings that would benefit from verification against current practitioner writing (currently LOW-MEDIUM confidence):
- CRO timing thresholds and minimum viable sample sizes for early-stage SaaS
- Solo developer logo tooling options and approximate costs (Fiverr pricing may have changed)
- Current Vercel Analytics free tier event limits

No finding has been stated as fact where it could not be grounded in either the codebase itself or established technical behaviour.
