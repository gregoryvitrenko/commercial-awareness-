# Phase 6: Bug Fixes + Content Quality - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix all production bugs identified in a live audit of https://www.folioapp.co.uk, and improve the quality of AI-generated content (talking points and quiz questions) so the product delivers on its core promise of interview-ready prep.

New features are out of scope. This phase is fixes and quality only.

</domain>

<decisions>
## Implementation Decisions

### Bug 1: Double footer on /upgrade
- The footer renders twice on /upgrade — visible at the bottom of the page
- Fix: identify and remove the duplicate Footer render in app/upgrade/page.tsx or its layout

### Bug 2: Expired application deadlines show "Apply →"
- Firm profile pages show past deadline windows (closed Aug–Nov 2025) with a live "Apply →" button
- Fix: compare deadline end date to today; if past, show a "Closed" label instead of the Apply button
- Do NOT hide past deadlines — they're useful reference info for understanding the cycle
- Styling: grey out the row + "CLOSED" monospace badge, keep dates visible

### Bug 3: Quiz fire-and-forget generation not caching
- None of the dates in the /quiz AVAILABLE list have cached quiz data
- Clicking a date falls through to the practice quiz screen (no questions shown)
- The "18 QUESTIONS" badge is a hardcoded fallback (quiz?.questions.length ?? 18)
- Fix: investigate why the fire-and-forget quiz generation after briefing cron is failing; ensure quizzes are stored correctly in Redis/FS

### Content Quality 1: Talking points
- Currently: 1 generic blockquote that restates the headline (e.g. "Carlyle Group's target is a significant development…")
- Target: 1–3 sharp, specific talking points a student could genuinely use in an interview
- A good talking point: connects the deal/event to a commercial implication for law firms, names specific practice areas or market dynamics, gives the student something to say beyond the headline
- Fix: rewrite the talking points section of the briefing generation prompt in lib/generate.ts
- Keep 1 point minimum, ideally generate 3 distinct points (deal significance, law firm angle, broader market context)

### Content Quality 2: Quiz question depth
- Currently: fact-recall questions ("What was the deal price?") answerable just from the story headline
- Target: inference and commercial reasoning questions ("Why would this deal require antitrust clearance?" / "Which practice area at Magic Circle firms would lead this transaction?")
- Fix: rewrite the quiz generation prompt in lib/quiz.ts
- Difficulty target: questions should require reading AND thinking, not just reading
- Answer distractors should be plausible (not obviously wrong)

### Claude's Discretion
- Exact wording of the "CLOSED" badge on expired deadlines
- Whether to add a subtle strikethrough on the deadline date text (probably yes)
- The specific prompt rewording for both generate.ts and quiz.ts — capture the intent above, implement as appropriate

</decisions>

<specifics>
## Specific Ideas

- Talking points example of BAD: "Carlyle Group's target to raise $200bn is a significant development in private equity"
- Talking points example of GOOD: "PE firms scaling AUM create larger M&A mandates — Magic Circle funds practices (Freshfields, Clifford Chance) will see increased deal flow as Carlyle deploys capital into European targets"
- Quiz example of BAD: "What is the acquisition price for the UK's largest electricity distribution company being purchased by Engie?" (answer visible in the headline)
- Quiz example of GOOD: "Engie's acquisition of a UK electricity distributor would most likely involve which regulatory clearance body?" or "Which practice area would a Magic Circle trainee most likely be seconded to on this transaction?"

</specifics>

<code_context>
## Existing Code Insights

### Key files for bugs
- app/upgrade/page.tsx — double footer likely here or in its parent layout
- lib/firms-data.ts — deadline date structures (check field names for start/end dates)
- components/FirmProfile.tsx or similar — where deadline rows are rendered with Apply buttons
- app/api/generate/route.ts — cron handler; fire-and-forget quiz generation call after briefing
- lib/quiz.ts — quiz generation logic and caching
- lib/generate.ts — briefing generation prompt (talking points section)

### Established Patterns
- Deadline data in firms-data.ts has date strings; compare to getTodayDate() from lib/storage.ts
- Redis dual-backend storage pattern for quiz data via getQuiz()/setQuiz() in lib/storage.ts
- AI prompts use claude-haiku for quiz (lib/quiz.ts), claude-sonnet for briefings (lib/generate.ts)

### Integration Points
- Quiz generation: app/api/generate/route.ts fires quiz generation fire-and-forget after briefing saves
- Talking points: the prompt template in lib/generate.ts controls the `talkingPoints` array in the briefing JSON
- Deadline rendering: firm profile page reads from FIRMS constant in lib/firms-data.ts

</code_context>

<deferred>
## Deferred Ideas

- Annual subscription plan (£40/year) — pricing change, separate phase
- "Free story of the day" for conversion — free/paid tier change, separate phase
- Quiz answer explanations — new feature, separate phase
- 1.5x speed on audio player — new feature, separate phase
- University ambassador / marketing — not a code change
- Cookie consent banner (GDPR/PECR) — legal compliance, important but separate phase

</deferred>

---

*Phase: 06-bug-fixes-content-quality*
*Context gathered: 2026-03-10*
