# Phase 6: Bug Fixes + Content Quality - Research

**Researched:** 2026-03-10
**Domain:** Next.js 15 App Router, React 19, Upstash Redis, Anthropic SDK prompt engineering
**Confidence:** HIGH (all findings verified against live codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Bug 1 (Double footer on /upgrade): identify and remove the duplicate Footer render in app/upgrade/page.tsx or its layout
- Bug 2 (Expired deadlines show "Apply"): compare deadline end date to today; if past, show a "Closed" label instead — do NOT hide past deadlines; grey out the row + "CLOSED" monospace badge, keep dates visible
- Bug 3 (Quiz caching): investigate why fire-and-forget quiz generation after briefing cron is failing; ensure quizzes are stored correctly in Redis/FS
- Content Quality 1 (Talking points): rewrite the talking points section of the briefing generation prompt in lib/generate.ts — keep 1 point minimum, ideally 3 distinct points (deal significance, law firm angle, broader market context)
- Content Quality 2 (Quiz question depth): rewrite the quiz generation prompt in lib/quiz.ts — target inference and commercial reasoning questions, not fact-recall
- New features are out of scope. This phase is fixes and quality only.

### Claude's Discretion
- Exact wording of the "CLOSED" badge on expired deadlines
- Whether to add a subtle strikethrough on the deadline date text (probably yes)
- The specific prompt rewording for both generate.ts and quiz.ts — capture the intent above, implement as appropriate

### Deferred Ideas (OUT OF SCOPE)
- Annual subscription plan (£40/year) — pricing change, separate phase
- "Free story of the day" for conversion — free/paid tier change, separate phase
- Quiz answer explanations — new feature, separate phase
- 1.5x speed on audio player — new feature, separate phase
- University ambassador / marketing — not a code change
- Cookie consent banner (GDPR/PECR) — legal compliance, important but separate phase
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-01 | Double footer on /upgrade is gone | Confirmed root cause: page.tsx renders `<SiteFooter />` AND root layout.tsx also renders `<SiteFooter />` — fix is to remove one instance |
| BUG-02 | Expired application deadlines show "Closed" state — no live "Apply" button for past windows | FirmDeadline.closeDate field exists as ISO date string; today from getTodayDate(); comparison is straightforward string/Date comparison |
| BUG-03 | Quiz generation is reliable — cached quiz data exists for recent dates, date links in /quiz lead to actual questions | listQuizDates() in Redis mode returns briefing dates not quiz dates; fire-and-forget in cron errors are silently swallowed; investigation required |
| QUAL-01 | Talking points in articles are sharp, specific, and genuinely usable in an interview | The talkingPoints prompt in lib/generate.ts already has 3-tier structure (soundbite/partnerAnswer/fullCommercial) — quality issue is in prompt instruction text, not structure |
| QUAL-02 | Quiz questions test commercial reasoning and inference, not just deal price recall | lib/quiz.ts Q1 is hardcoded as "Recall" type; prompt rules need reworking to emphasise inference over recall |
</phase_requirements>

---

## Summary

This phase is a targeted fix-and-polish operation. All five requirements are surgical changes to existing files — no new infrastructure is needed. The research confirms the exact root cause of each bug and the precise files to change.

**BUG-01** (double footer) is the simplest: `app/upgrade/page.tsx` renders `<SiteFooter />` at line 140, and `app/layout.tsx` also renders `<SiteFooter />` at line 64 for every page in the app. The fix is to remove the `<SiteFooter />` call from `app/upgrade/page.tsx` only.

**BUG-02** (expired deadlines) requires adding a date-comparison check in `app/firms/[slug]/page.tsx` inside the deadline rendering loop. The `FirmDeadline` type already has an optional `closeDate: string` (ISO `YYYY-MM-DD`). Today's date is available from `getTodayDate()` which is already imported on that page.

**BUG-03** (quiz caching) has two distinct sub-problems that both need fixing: (a) `listQuizDates()` in Redis mode returns briefing dates not quiz dates, so the "Available" list in `/quiz` shows all briefing dates even when most have no cached quiz — clicking them leads to an empty quiz screen; (b) the fire-and-forget `generateAndSaveQuiz()` in the cron handler silently swallows errors via `.catch(console.error)` — if the quiz generation fails (e.g. ANTHROPIC_API_KEY issue in the cron context, or JSON parse failure), there is no retry and no cache. The fix needs to address both: add a Redis-aware `listQuizDates` that checks for actual cached quizzes, and/or trigger on-demand generation when the quiz page is accessed with no cached data.

**QUAL-01** (talking points quality): The `talkingPoints` struct in `lib/generate.ts` already has 3 tiers (`soundbite`, `partnerAnswer`, `fullCommercial`). The problem is the prompt instructions for the `talkingPoint` field (legacy, which populates the firm page and quiz building blocks) are too generic. The `ArticleStory` page renders the 3-tier structure when available — the prompt quality fix is in `lib/generate.ts`'s `buildUserPrompt` function where the `talkingPoints` object is described.

**QUAL-02** (quiz question depth): In `lib/quiz.ts`, the `buildPrompt` function hardcodes Q1 as "Recall — test a specific fact." This instruction produces deal-price questions that are answerable from the headline alone. The fix is to rewrite Q1 as an inference or implication question, and strengthen the distinction between Q2 and Q3 to force deeper commercial reasoning.

**Primary recommendation:** Fix in order of complexity — BUG-01 (1-line change), BUG-02 (conditional render), BUG-03 (storage + on-demand generation), QUAL-01 (prompt rewrite), QUAL-02 (prompt rewrite). No new npm packages required for any fix.

---

## Standard Stack

### Core (already installed — no new dependencies needed)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Next.js App Router | 15 | Page routing, layouts, server components | Already in use |
| React | 19 | UI rendering | Already in use |
| Tailwind CSS | 3 (stone/zinc palette) | Styling | Already in use — note: skill SKILL.md covers v4 patterns but project uses v3 |
| @upstash/redis | installed | Redis storage backend | Already in use via lib/storage.ts |
| @anthropic-ai/sdk | installed | Quiz + briefing generation | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | installed | Icons (e.g. Lock icon for CLOSED badge) | For the closed deadline badge icon |

### Alternatives Considered
None applicable — all changes are to existing files in the established stack.

**Installation:** No new packages required.

---

## Architecture Patterns

### Confirmed Project Structure (relevant files)
```
app/
├── layout.tsx              # Root layout — renders <SiteFooter /> once for ALL pages
├── upgrade/
│   └── page.tsx            # BUG-01: also renders <SiteFooter /> → double render
├── firms/
│   └── [slug]/
│       └── page.tsx        # BUG-02: deadline rendering loop, all 650+ lines
├── quiz/
│   ├── page.tsx            # Quiz main page — uses listBriefings(), not listQuizDates()
│   └── [date]/
│       └── page.tsx        # Quiz date page — hardcoded fallback: quiz?.questions.length ?? 18
├── api/
│   ├── generate/
│   │   └── route.ts        # BUG-03: fire-and-forget quiz generation after briefing save
│   └── quiz/
│       └── route.ts        # On-demand quiz generation endpoint (POST)
lib/
├── generate.ts             # QUAL-01: talkingPoints prompt lives in buildUserPrompt()
├── quiz.ts                 # QUAL-02: question design rules live in buildPrompt()
├── storage.ts              # BUG-03: listQuizDates() in Redis mode returns briefing dates
├── firms-data.ts           # BUG-02: FirmDeadline.closeDate field (optional string)
└── types.ts                # FirmDeadline interface (closeDate?: string)
components/
├── SiteFooter.tsx          # The duplicated component
└── QuizInterface.tsx       # Receives initialQuiz (nullable); handles nil quiz state
```

### Pattern 1: BUG-01 Root Cause — Layout + Page Double Render
**What:** Next.js App Router renders the root layout for every page. `app/layout.tsx` includes `<SiteFooter />` inside `<Providers>`. `app/upgrade/page.tsx` is a client component that also renders `<SiteFooter />` at the bottom of its return.
**Evidence (HIGH confidence — read both files):**
- `app/layout.tsx` line 64: `<SiteFooter />`
- `app/upgrade/page.tsx` line 140: `<SiteFooter />`
**Fix:** Remove `<SiteFooter />` from `app/upgrade/page.tsx` only. The root layout's footer covers all pages.

```tsx
// app/upgrade/page.tsx — BEFORE (lines 138-142):
      <SiteFooter />
    </div>
  );
}

// AFTER (remove the SiteFooter import and its usage):
    </div>
  );
}
```

### Pattern 2: BUG-02 Deadline Date Comparison
**What:** The deadline loop in `app/firms/[slug]/page.tsx` (lines 439-491) renders every deadline row with an `Apply →` link, unconditionally. The `FirmDeadline` type has `closeDate?: string` (ISO date). `today` is already available in this component from `getTodayDate()` (line 139).

**Date comparison pattern:**
```tsx
// Source: lib/storage.ts getTodayDate() returns YYYY-MM-DD string
// Safe comparison: ISO date strings compare lexicographically correctly
const isClosed = deadline.closeDate ? deadline.closeDate < today : false;
```

**Closed row styling (per CONTEXT.md decision):**
- Grey out the row (reduce text opacity or use stone-400 colours)
- "CLOSED" monospace badge in stone styling
- Keep dates visible (do NOT hide or remove the row)
- Optional strikethrough on date text (Claude's discretion — recommended yes)
- No "Apply" button when closed

```tsx
// Closed badge pattern (consistent with existing mono badge patterns in the codebase):
{isClosed && (
  <span className="inline-block font-mono text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700">
    Closed
  </span>
)}
```

### Pattern 3: BUG-03 Quiz Caching — Two Root Causes

**Root Cause A — listQuizDates() in Redis mode:**
In `lib/storage.ts`, `listQuizDates()` (lines 184-188):
```typescript
export async function listQuizDates(): Promise<string[]> {
  // In Redis mode, quiz dates align with briefing dates — use briefing index.
  if (useRedis()) return redisList(); // <-- returns ALL briefing dates
  return fsListQuizDates();           // <-- in dev, correctly reads only quiz files
}
```
This returns ALL briefing dates even when there are no cached quizzes for those dates. The comment "quiz dates align with briefing dates" is the assumption — but quiz generation is fire-and-forget and can fail silently.

**Root Cause B — Fire-and-forget swallows failures silently:**
In `app/api/generate/route.ts` (lines 73-76):
```typescript
generateAndSaveQuiz(briefing).catch((err) =>
  console.error('[generate] Quiz auto-generation failed:', err)
);
```
Errors are logged but not retried. On Vercel's serverless environment, the function may terminate before the fire-and-forget resolves (the main response is returned immediately after `saveBriefing`, and the cron handler has `maxDuration = 300` — so there is time, but if the quiz generation fails for any reason, no retry occurs).

**Fix strategy:**
Option A (preferred): Add Redis-aware quiz existence check — modify `listQuizDates()` to check for actual quiz keys in Redis (not just briefing dates). This fixes the UI "no questions" problem. Then also add a fallback in `QuizInterface` or `/quiz/[date]` page to trigger on-demand quiz generation when visiting a date with no cached quiz.

Option B (simpler, but doesn't fix the display): In the `/quiz` page, filter the date list to only show dates where a quiz actually exists. This requires checking each date against `getQuiz()` — expensive for many dates.

**Recommended fix (Option A + on-demand generation):**
1. Fix `listQuizDates()` to use a Redis quiz index (set quiz keys in a zset alongside briefing index, or scan for `quiz:*` keys)
2. In `/quiz/[date]/page.tsx`, if `quiz` is null but `briefing` exists, trigger on-demand generation via the `POST /api/quiz` endpoint (client-side after load), or call `generateQuiz` + `saveQuiz` server-side before rendering
3. Remove the hardcoded `?? 18` fallback in `/quiz/[date]/page.tsx` line 43

**Alternative for Redis key scan:**
```typescript
// In storage.ts — add to redisSaveQuiz:
async function redisSaveQuiz(quiz: DailyQuiz): Promise<void> {
  const redis = getRedis();
  await Promise.all([
    redis.set(`quiz:${quiz.date}`, JSON.stringify(quiz)),
    redis.zadd('quiz:index', {        // <-- add this
      score: new Date(quiz.date).getTime(),
      member: quiz.date,
    }),
  ]);
}

// In listQuizDates — use quiz index:
async function redisListQuizDates(): Promise<string[]> {
  const redis = getRedis();
  const dates = await redis.zrange('quiz:index', 0, -1, { rev: true });
  return dates as string[];
}
```

### Pattern 4: QUAL-01 Talking Points Prompt Engineering
**What:** `lib/generate.ts` `buildUserPrompt()` (lines 62-66) already has a 3-tier `talkingPoints` object with `soundbite`, `partnerAnswer`, `fullCommercial`. The prompt instructions for each tier are already quite specific. The quality problem is likely in generation quality rather than structure — but comparing the CONTEXT.md bad example vs the current prompt reveals the current prompt is already better than what the context describes as "bad."

**Current prompt (lines 62-66 of generate.ts):**
```
"talkingPoints": {
  "soundbite": "ONE sentence, max 15 words. A sharp, quotable line..."
  "partnerAnswer": "2–3 sentences, ~50 words. lead with a specific bold observation drawn from the facts..."
  "fullCommercial": "4–5 sentences, ~100 words. A full interview-ready commercial explanation..."
}
```

The existing prompt is already more specific than the "bad" example in CONTEXT.md. The "bad" example (`"Carlyle Group's target is a significant development…"`) sounds like legacy `talkingPoint` (single string) output, not the current 3-tier structure. It's possible the content on the live site is from older briefings generated before the 3-tier structure was added (see `lib/types.ts` comment: "3-tier talking points — present on briefings generated after 2026-03-05").

**Action needed:** Strengthen the prompt to more explicitly ban generic "this is a significant development" language. Add negative examples. The CONTEXT.md examples are the target: name specific practice areas, name market dynamics, give the student something to say beyond the headline.

**Prompt enhancement target:**
```typescript
"soundbite": "ONE sentence, max 15 words. Name the deal/firm and the single most striking commercial fact — NOT a restatement of the headline. BAD: 'Carlyle's AUM target is a significant PE development.' GOOD: 'PE AUM scale creates larger M&A mandates — Magic Circle funds practices see deal flow directly.'",

"partnerAnswer": "2–3 sentences, ~50 words. Lead with a specific commercial observation (not the headline). Connect it to a law firm consequence: name the practice area, name the firms best positioned, name the market dynamic. The student should be able to say this in a 2-minute partner meeting without sounding like they just read the headline.",

"fullCommercial": "4–5 sentences, ~100 words. Open with the headline fact. Explain WHY this deal/event happened (strategic context). Name the firms best positioned and WHICH practice group specifically (M&A, leveraged finance, capital markets, etc.). Name one broader market trend this connects to. End with why this creates work for commercial lawyers. Zero filler phrases."
```

### Pattern 5: QUAL-02 Quiz Question Depth Prompt Engineering
**What:** `lib/quiz.ts` `buildPrompt()` (lines 19-56) defines Q1 as "Recall — test a specific fact from the Summary: deal value, adviser name, regulatory body, timeline..." This directly produces fact-recall questions.

**Current Q1 instruction (line 27):**
```
1. Q1 (Recall) — test a specific fact from the Summary: deal value, adviser name, regulatory body, timeline, financing structure, or named party. Use real figures and names from the text.
```

**Target Q1 instruction (per CONTEXT.md):**
Questions like "Why would this deal require antitrust clearance?" and "Which practice area at Magic Circle firms would lead this transaction?"

**New question design approach:**
```
1. Q1 (Implication) — test commercial inference, not fact recall. The answer should NOT be visible in the headline. Ask why something happened, what it implies, or what comes next: "Which regulatory body would need to clear this merger and why?", "What type of financing structure would the acquirer most likely use and why?", "Which practice group at a Magic Circle firm would lead this mandate?" Distractors must be plausible — real regulators, real practice areas, real financing terms.

2. Q2 (Law Firm Angle) — test understanding from Why It Matters: which firm is best positioned and why, which practice group, what regulatory requirement applies. The answer requires reading the full why-it-matters section, not just the headline.

3. Q3 (Commercial So-What) — test analytical framing: what is the commercial significance for law firms, what market trend does this connect to, what would a trainee actually do on this matter. The correct answer should require having read and thought about the Talking Points section.
```

**Key addition for distractors:**
The current prompt says "distractors must be plausible — use real firm names, real regulatory bodies, slightly different figures." This is good but needs reinforcing: "For law firm questions, use actual competitor firms (Linklaters, Freshfields, Clifford Chance, Latham, Kirkland). For regulatory questions, use actual bodies (CMA, FCA, PRA, EU Commission). For practice area questions, name actual groups (M&A, leveraged finance, capital markets, restructuring, disputes)."

### Anti-Patterns to Avoid
- **Hiding closed deadlines:** CONTEXT.md explicitly says do NOT hide past deadlines — keep them visible as reference info
- **Breaking the quiz data structure:** `DailyQuiz.questions` array shape must stay identical — only the generation prompt changes
- **Touching the quiz index key if `quiz:index` doesn't exist yet:** Must handle graceful empty-state (no quiz index = empty list, fall back to briefing dates with on-demand generation)
- **Removing the `?? 18` fallback without ensuring actual quiz data:** Fix the root cause first, then remove the fallback badge count

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date comparison for deadline check | Custom date parsing | ISO string comparison (`closeDate < today`) | ISO YYYY-MM-DD strings compare lexicographically correctly — no Date() parsing needed |
| Redis key existence check | Custom Redis scan | `redis.zadd` to maintain a `quiz:index` sorted set | Mirrors the existing `briefing:index` pattern already in storage.ts |
| JSON repair for quiz generation | Custom repair logic | `jsonrepair` (already installed, used in generate.ts) | Could be added to quiz.ts if JSON truncation becomes an issue |

**Key insight:** The storage layer already has the dual-backend pattern (Redis/FS), the date utilities (`getTodayDate()`), and the quiz CRUD (`getQuiz`, `saveQuiz`). All bugs are solvable by adding small amounts of logic to existing patterns.

---

## Common Pitfalls

### Pitfall 1: Removing Wrong Footer Instance (BUG-01)
**What goes wrong:** Removing the `<SiteFooter />` from `app/layout.tsx` instead of from `app/upgrade/page.tsx`.
**Why it happens:** The root layout footer is the "canonical" one — removing it would break every other page.
**How to avoid:** Remove from `app/upgrade/page.tsx` only. Also remove the import of `SiteFooter` at line 7 of that file if it's no longer used anywhere in the file.
**Warning signs:** After fix, check that `/upgrade` has one footer and `/` still has one footer.

### Pitfall 2: Deadline Comparison Timezone Issue (BUG-02)
**What goes wrong:** `new Date(deadline.closeDate)` creates a UTC midnight date. `new Date()` is local time. Comparing them can be off by a day around midnight in UK timezone (GMT/BST).
**Why it happens:** JS `new Date('2025-11-17')` parses as UTC midnight, but the user is in UK local time.
**How to avoid:** Use string comparison instead of Date objects: `deadline.closeDate < today` where `today = getTodayDate()` which returns `new Date().toISOString().split('T')[0]` — this is also UTC-based, making the comparison consistent. The one-day-off edge case is acceptable for deadline display purposes.
**Warning signs:** Deadlines showing as "Closed" on their exact close date or appearing open the day after they close.

### Pitfall 3: Quiz Index Missing for Past Dates (BUG-03)
**What goes wrong:** Adding `quiz:index` logic only populates the index for NEW quiz saves going forward — past dates that already have `quiz:*` keys in Redis won't be in the index.
**Why it happens:** Upstash Redis has existing `quiz:*` keys from any prior successful quiz generations, but they weren't added to a sorted set.
**How to avoid:** Either (a) treat absence from index as fallback to try `getQuiz(date)` directly, or (b) in the first run after deploy, backfill the index. Simpler: the on-demand generation fallback in the page handles this — if the briefing exists but no quiz, generate on-demand.
**Warning signs:** Quiz page shows dates as "available" but still shows no questions after the fix.

### Pitfall 4: Prompt Changes Break JSON Structure (QUAL-01, QUAL-02)
**What goes wrong:** Rewriting the prompt changes the JSON keys Claude returns, causing `buildBriefing()` or `generateQuiz()` parse logic to fail.
**Why it happens:** The prompt specifies the exact JSON structure — if the field names change, downstream code breaks.
**How to avoid:** Keep the JSON structure exactly as-is. Only change the human-readable *instructions* for the content of each field, not the field names or shape. For quiz.ts, the `questions` array structure with `storyId`, `question`, `options`, `correctLetter`, `explanation` must stay identical.
**Warning signs:** JSON parse errors in the cron logs after deploy.

### Pitfall 5: Forgetting `data-print-hide` on Closed Badge (BUG-02)
**What goes wrong:** The "CLOSED" badge appears on the print-friendly PDF view alongside the greyed-out row.
**Why it happens:** The firm profile page has a print mode (see `data-print-hide` attributes on Apply buttons throughout the page).
**How to avoid:** Add `data-print-hide` to the CLOSED badge (same as the Apply button it replaces) — or simply don't add it since the closed state is still useful information in a print context.
**Recommendation:** Do NOT add `data-print-hide` — the CLOSED badge is informational and useful in print.

---

## Code Examples

### BUG-01: Remove duplicate SiteFooter from upgrade page

```tsx
// app/upgrade/page.tsx — remove line 7 import (if no longer used in file):
// REMOVE: import { SiteFooter } from '@/components/SiteFooter';

// app/upgrade/page.tsx — remove lines 139-140:
// REMOVE:
//   <SiteFooter />
// </div>

// The closing structure becomes:
        </div>
      </main>

    </div>
  );
}
// (root layout.tsx provides the SiteFooter for all pages)
```

### BUG-02: Deadline closed-state rendering

```tsx
// In app/firms/[slug]/page.tsx, inside the deadline .map():
// today is already available at line 139: const today = getTodayDate();

{firm.trainingContract.deadlines.map((deadline) => {
  const fmtDate = (iso: string) => { /* existing formatter */ };
  const hasExact = deadline.openDate || deadline.closeDate;

  // NEW: closed check
  const isClosed = deadline.closeDate ? deadline.closeDate < today : false;

  return (
    <div
      key={deadline.label}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-sm px-4 py-3 ${
        isClosed ? 'opacity-60' : ''
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-[13px] font-semibold ${isClosed ? 'text-stone-500 dark:text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
            {deadline.label}
          </p>
          {isClosed && (
            <span className="inline-block font-mono text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700">
              Closed
            </span>
          )}
          {!isClosed && deadline.rolling && (
            <span className="/* existing rolling badge */">Rolling</span>
          )}
        </div>
        {/* date display — add line-through if closed */}
        <p className={`text-[11px] font-mono ${isClosed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-600 dark:text-stone-300'}`}>
          {/* existing date rendering */}
        </p>
      </div>

      {/* Conditional: Apply link OR nothing when closed */}
      {!isClosed && (
        <a href={deadline.applyUrl} /* existing props */ >
          Apply →
        </a>
      )}
    </div>
  );
})}
```

### BUG-03: Redis quiz index — storage.ts additions

```typescript
// In lib/storage.ts — update redisSaveQuiz to also write to a sorted index:
async function redisSaveQuiz(quiz: DailyQuiz): Promise<void> {
  const redis = getRedis();
  await Promise.all([
    redis.set(`quiz:${quiz.date}`, JSON.stringify(quiz)),
    redis.zadd('quiz:index', {
      score: new Date(quiz.date).getTime(),
      member: quiz.date,
    }),
  ]);
}

// Replace the Redis branch of listQuizDates():
async function redisListQuizDates(): Promise<string[]> {
  const redis = getRedis();
  // Use quiz-specific index, not briefing index
  try {
    const dates = await redis.zrange('quiz:index', 0, -1, { rev: true });
    if (dates && (dates as string[]).length > 0) return dates as string[];
  } catch {
    // index doesn't exist yet — fall through
  }
  // Fallback: return empty (on-demand generation handles missing quizzes)
  return [];
}

export async function listQuizDates(): Promise<string[]> {
  if (useRedis()) return redisListQuizDates();
  return fsListQuizDates();
}
```

### QUAL-01: Talking points prompt enhancement (lib/generate.ts)

The existing 3-tier structure is sound. Strengthen the instruction text:

```typescript
// In buildUserPrompt(), update the talkingPoints section description:
"talkingPoints": {
  "soundbite": "ONE sentence, max 15 words. Name the deal or firm and the single most striking commercial implication — NOT a restatement of the headline. Do not use phrases like 'significant development', 'marks a new era', or 'signals change'. The sentence should give a student something to say that sounds informed, not just summarised. Example of BAD: 'Carlyle Group\\'s target to raise $200bn is a significant development in private equity.' Example of GOOD: 'PE AUM scale drives larger European M&A mandates — Magic Circle funds practices see direct deal flow as Carlyle deploys capital.'",

  "partnerAnswer": "2–3 sentences, ~50 words. Lead with a specific commercial observation that goes beyond the headline — name the deal and then immediately explain what it means for law firms: which practice area, which specific firms are best positioned, and why. The student should be able to drop this into a 2-minute partner conversation without sounding like they read a summary. Zero filler phrases.",

  "fullCommercial": "4–5 sentences, ~100 words. Open with the headline fact. Explain the strategic context (WHY this deal/event happened). Name the specific practice areas and firms best positioned. Connect to one broader market trend by name. End with a concrete statement about what work this creates for commercial lawyers. Zero filler phrases ('it is worth noting', 'this highlights the importance of')."
}
```

### QUAL-02: Quiz question depth enhancement (lib/quiz.ts)

```typescript
// In buildPrompt(), replace the Question design rules section:
`Question design rules:
1. Q1 (Commercial Inference) — test whether the student can reason beyond the headline. Do NOT test the deal value or a fact visible in the headline. Instead ask: why this deal requires a specific regulatory clearance, what financing structure this type of transaction typically uses, which practice area at a Magic Circle firm would lead this mandate, or what the commercial implication is for a named party. The correct answer must require reading the summary AND thinking about it.

2. Q2 (Law Firm Angle) — test understanding from Why It Matters: which UK or US firm is best positioned for this specific work and why (practice group track record, client relationship, regulatory expertise). Distractors must be real competing firms doing similar work — do not use obviously wrong firms.

3. Q3 (Interview So-What) — test the commercial observation a strong candidate would make in an interview: what market trend this connects to, what a trainee would actually do day-to-day on this matter, or which observation best captures the significance for the legal industry.

For each question:
- Write 4 options (A, B, C, D). Exactly one is correct. Distractors must be plausible: use real law firm names (Linklaters, Freshfields, Clifford Chance, Latham & Watkins, Kirkland & Ellis), real regulatory bodies (CMA, FCA, PRA, EU Commission, SFO), real practice areas (M&A, leveraged finance, capital markets, restructuring, disputes). Never use obviously wrong distractors.
- Write an explanation of 1–2 sentences shown after the student answers. Reference the specific reasoning from the briefing. Help them understand WHY, not just what the correct answer was.
- Never use options like "None of the above" or "All of the above".`
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single `talkingPoint` string | 3-tier `talkingPoints` object (soundbite/partnerAnswer/fullCommercial) | 2026-03-05 (per types.ts comment) | Legacy briefings (pre-March 5) only have flat string; new ones have 3-tier |
| `?? 18` hardcoded quiz question count | Should be `quiz?.questions.length` (no fallback) | This phase | Fallback is misleading — shows 18 when no questions exist |
| Fire-and-forget quiz generation with no index tracking | Quiz index in Redis sorted set | This phase | Makes quiz availability visible to the UI |

**Deprecated/outdated in this codebase:**
- The `listQuizDates()` Redis branch that uses `redisList()` (briefing dates) — needs replacement with a quiz-specific index
- The `?? 18` hardcoded fallback in `/quiz/[date]/page.tsx` line 43 — should be removed after quiz availability is reliable

---

## Open Questions

1. **Why is the quiz fire-and-forget actually failing?**
   - What we know: Cron runs at 06:00 UTC; quiz generation is fire-and-forget after briefing saves; errors are caught and logged but not surfaced to the user
   - What's unclear: Whether the failures are ANTHROPIC_API_KEY issues in the cron context, JSON parse errors, or the Vercel function terminating before the async completes
   - Recommendation: Add explicit logging and check Vercel function logs for `[generate] Quiz auto-generation failed:` entries to identify the actual error before writing the fix. The fix may be as simple as increasing `maxDuration` or checking the API key is available in the cron environment.

2. **Backfilling the `quiz:index` for past briefings**
   - What we know: Any existing `quiz:*` keys in Redis won't be in the new sorted set until their dates are re-saved
   - What's unclear: How many dates already have cached quiz data
   - Recommendation: The on-demand generation fallback handles this naturally — if a date has a `quiz:*` key, `getQuiz(date)` still finds it; the index just won't list it. Plan B: a one-time backfill admin script, but likely not worth the effort.

3. **Does the existing 3-tier talking points prompt already produce good output?**
   - What we know: The 3-tier structure was added ~2026-03-05; the context describes "bad" talking points that look like legacy single-string output
   - What's unclear: Whether the current prompt actually produces the quality described in CONTEXT.md or whether further strengthening is needed
   - Recommendation: Add the negative-example instructions to the prompt anyway — they are low-risk and clearly improve the instruction clarity.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — section included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — no test framework installed (confirmed: only `npm run lint` in package.json scripts) |
| Config file | none |
| Quick run command | `npm run lint` |
| Full suite command | `npm run build` (type-check + lint) |

No automated test infrastructure exists. All validation is manual + build-time type checking.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | /upgrade page has exactly one footer | manual-only | n/a — visual check at https://www.folioapp.co.uk/upgrade | n/a |
| BUG-02 | Firm profiles show CLOSED badge for past deadlines, no Apply button | manual-only | n/a — visual check at /firms/[slug] for a firm with past closeDate | n/a |
| BUG-03 | /quiz date links show questions, badge count is real | manual-only | n/a — check /quiz page in production; click a date link | n/a |
| QUAL-01 | Talking points in articles are sharp and specific | manual-only | n/a — requires new briefing generation to observe output | n/a |
| QUAL-02 | Quiz questions test reasoning not recall | manual-only | n/a — requires quiz generation after new briefing | n/a |

All requirements require production verification — these changes affect AI-generated content and live UI rendering. Cannot be meaningfully automated without a test framework.

### Sampling Rate
- **Per task commit:** `npm run lint && npm run build` — catches TypeScript errors and import mistakes
- **Per wave merge:** same + manual production smoke test
- **Phase gate:** All 5 requirements verified visually on https://www.folioapp.co.uk before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test framework — Wave 0 should note this as a known gap; all validation is build-time + manual
- [ ] Framework install: NOT recommended for this phase — adding a test framework is out of scope for a bug-fix phase

*(Existing approach: lint + build as proxy for test suite. Manual production verification is the acceptance gate.)*

---

## Sources

### Primary (HIGH confidence — verified against live codebase)
- `app/upgrade/page.tsx` — confirmed double SiteFooter at line 140 + root layout line 64
- `app/layout.tsx` — confirmed SiteFooter in root layout, wraps all pages
- `app/firms/[slug]/page.tsx` — confirmed deadline loop (lines 439-491), `today` already in scope, no closed-state check
- `lib/storage.ts` — confirmed `listQuizDates()` Redis branch uses briefing index not quiz index (lines 184-188)
- `app/api/generate/route.ts` — confirmed fire-and-forget pattern (lines 73-76), errors silently caught
- `lib/quiz.ts` — confirmed Q1 hardcoded as "Recall" type (line 27), question structure intact
- `lib/generate.ts` — confirmed 3-tier talkingPoints prompt (lines 62-66), `buildUserPrompt()` structure
- `lib/types.ts` — confirmed `FirmDeadline.closeDate?: string` field (line 112)
- `.planning/config.json` — confirmed `nyquist_validation: true`
- `package.json` — confirmed no test framework (only lint script)

### Secondary (MEDIUM confidence)
- `app/quiz/[date]/page.tsx` — confirmed `?? 18` hardcoded fallback at line 43; quiz receives `initialQuiz` which may be null

### Tertiary (LOW confidence)
- Quiz generation failure mode on Vercel — the actual error (if any) is in Vercel function logs, not visible in source code. Root cause of "no cached quizzes" is inferred from code analysis, not log observation.

---

## Metadata

**Confidence breakdown:**
- BUG-01 root cause: HIGH — confirmed by reading both files
- BUG-02 implementation: HIGH — field exists, comparison pattern is standard
- BUG-03 root cause: HIGH for code analysis, LOW for actual failure mode in production
- QUAL-01 prompt fix: MEDIUM — prompt structure is sound, quality impact of changes is unverifiable pre-generation
- QUAL-02 prompt fix: HIGH for structure changes, MEDIUM for actual question quality improvement

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable codebase — no external dependencies change)
