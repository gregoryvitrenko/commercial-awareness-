# Phase 9: Podcast Archive - Research

**Researched:** 2026-03-10
**Domain:** Redis backfill, Vercel Blob listing, ElevenLabs cron pre-generation
**Confidence:** HIGH (all findings from direct codebase inspection)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Vercel Blob storage configured — `BLOB_READ_WRITE_TOKEN` set in production (prerequisite for podcast archive activation and audio caching) | BLOB_READ_WRITE_TOKEN is already set per MEMORY.md ("confirmed by user, session 6"). The `podcast-storage.ts` `useBlob()` function detects it automatically. No code changes needed for INFRA-01 — verification only. |
| PODCAST-01 | `/podcast/archive` lists all past audio briefings with date, play button, and design-token-consistent styling | The archive page exists but only shows Blob-listed dates (misses old episodes). Fix requires `listPodcastDates()` to add Redis script fallback. The expanded scope also adds quiz archive backfill and cron MP3 pre-generation. |
</phase_requirements>

---

## Summary

Phase 9 is a three-workstream fix-and-improve phase. All three problems have been diagnosed precisely from the codebase, and all three fixes are small, targeted, and low-risk.

**Workstream 1 — Quiz archive fix:** `listQuizDates()` in `lib/storage.ts` reads only from the `quiz:index` Redis sorted set. That set was added in Phase 6 (plan 06-02) and is only written on `saveQuiz()` going forward. Every quiz generated before that plan was saved directly as `quiz:{date}` keys with no index entry. The fix is a one-time backfill function that scans Redis for `quiz:*` keys, extracts dates, and writes them into `quiz:index`. This should run as a Next.js API admin route (POST-only, admin-gated) rather than at startup, to avoid cold-start overhead.

**Workstream 2 — Podcast archive fix:** `listPodcastDates()` in `lib/podcast-storage.ts` reads only from Vercel Blob (`podcasts/` prefix). Older podcast scripts were generated and saved to Redis as `podcast-script:{date}` keys, but no Blob MP3 exists for them (Blob wasn't configured when they were created). The fix adds a Redis key-scan fallback inside `listPodcastDates()`: when Blob returns no results or only partial results, also scan `podcast-script:*` Redis keys and union the dates. The archive page must then distinguish "has cached MP3" (play button) from "has script only" (no play button, or greyed label). The `audioExists()` function already provides this check; the archive page needs to call it per-entry.

**Workstream 3 — Cron MP3 pre-generation:** Currently the ElevenLabs TTS call happens on the first user visit to `/podcast`. This means the first subscriber of the day waits for a real-time ElevenLabs call (120s timeout). The fix adds an `await generatePodcastAudio(briefing.date)` step inside `handleGenerate()` in `app/api/generate/route.ts`, after the podcast script is saved — using the same fire-and-forget pattern already in place for quiz and script generation. The `hasCapacity()` check from `lib/char-usage.ts` must be run before triggering ElevenLabs to protect the 100k/month budget.

**Primary recommendation:** Implement the three workstreams in three separate plans: (1) quiz backfill admin route, (2) podcast archive listing fix, (3) cron pre-generation. All three are small, independent, and testable in isolation.

---

## Standard Stack

### Core (already installed — no new packages needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@upstash/redis` | installed | Redis scan/zadd operations for backfill | Already the sole Redis client in this codebase |
| `@vercel/blob` | installed | `list()`, `head()` for podcast MP3 presence checks | Already used in `podcast-storage.ts` |

### No new dependencies
All three workstreams use existing libraries. The only new code is logic in existing files.

---

## Architecture Patterns

### Recommended File Change Map

```
lib/storage.ts                   — add backfillQuizIndex() function
lib/podcast-storage.ts           — add Redis fallback to listPodcastDates()
app/api/generate/route.ts        — add fire-and-forget ElevenLabs MP3 generation
app/api/admin/backfill/route.ts  — new: admin-only POST to trigger quiz backfill
app/podcast/archive/page.tsx     — fetch audioExists per date, show conditional play button
```

### Pattern 1: Redis Key Scan for Backfill

**What:** Scan Redis for all `quiz:{YYYY-MM-DD}` keys, extract dates, write to `quiz:index` sorted set.

**When to use:** One-time migration; triggered via admin API route.

**Important:** Upstash Redis does not support `SCAN` with a `COUNT` hint in the same way as standard Redis. Use `keys('quiz:*')` or `scan` with cursor iteration. The Upstash `@upstash/redis` SDK supports `scan(cursor, { match: 'quiz:*', count: 100 })`. Cursor starts at 0; continue until cursor returns 0.

**Example (conceptual — verified from Upstash SDK patterns):**
```typescript
// lib/storage.ts — new export
export async function backfillQuizIndex(): Promise<number> {
  if (!useRedis()) return 0;
  const redis = getRedis();
  let cursor = 0;
  let count = 0;
  const DATE_RE = /^quiz:(\d{4}-\d{2}-\d{2})$/;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: 'quiz:*', count: 100 });
    cursor = Number(nextCursor);
    for (const key of keys as string[]) {
      const m = key.match(DATE_RE);
      if (!m) continue;
      const date = m[1];
      await redis.zadd('quiz:index', {
        nx: true,  // nx = only add if member doesn't already exist
        score: new Date(date).getTime(),
        member: date,
      });
      count++;
    }
  } while (cursor !== 0);
  return count;
}
```

**Important ZADD note:** Use `{ nx: true }` to prevent overwriting existing entries. This makes the backfill idempotent — safe to run multiple times.

### Pattern 2: Podcast Archive Date Union (Blob + Redis)

**What:** Merge dates from Blob (MP3 exists) and Redis (script exists) so the archive lists all episodes, not just cached ones.

**When to use:** Production `listPodcastDates()` when Blob is active.

**Example:**
```typescript
// lib/podcast-storage.ts — updated listPodcastDates()
export async function listPodcastDates(): Promise<string[]> {
  const blobDates = new Set<string>();
  const scriptDates = new Set<string>();

  if (useBlob()) {
    const { list } = await import('@vercel/blob');
    let cursor: string | undefined;
    do {
      const result = await list({
        prefix: 'podcasts/',
        ...(cursor ? { cursor } : {}),
      });
      for (const blob of result.blobs) {
        const match = blob.pathname.match(/^podcasts\/(\d{4}-\d{2}-\d{2})/);
        if (match) blobDates.add(match[1]);
      }
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);
  }

  if (useRedis()) {
    // Fallback: also list dates that have a podcast script but may not have
    // a cached Blob MP3 (pre-Blob episodes).
    const redis = getRedis();
    let cursor = 0;
    const SCRIPT_RE = /^podcast-script:(\d{4}-\d{2}-\d{2})$/;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: 'podcast-script:*', count: 100 });
      cursor = Number(nextCursor);
      for (const key of keys as string[]) {
        const m = key.match(SCRIPT_RE);
        if (m) scriptDates.add(m[1]);
      }
    } while (cursor !== 0);
  }

  // Union of both sources, sorted descending
  const all = new Set([...blobDates, ...scriptDates]);
  return [...all].sort((a, b) => b.localeCompare(a));
}
```

**Archive page consideration:** The archive page must know WHICH dates have a playable MP3 vs. which only have a script. The existing `audioExists()` function in `podcast-storage.ts` handles this. However, calling `audioExists()` for every date in the archive page would be N Blob `head()` calls — expensive. A better approach: the archive page receives a `Set<string>` of blob-backed dates (from the Blob listing already done inside `listPodcastDates()` — expose it) and marks each row accordingly. Alternatively, the archive page is a Server Component and can call the relevant check once.

**Simplest safe approach:** Export a separate `listPodcastDatesWithStatus()` that returns `Array<{ date: string; hasAudio: boolean }>`, combining both sources in one pass.

### Pattern 3: Fire-and-Forget ElevenLabs in Cron

**What:** Add MP3 generation to the 06:00 UTC cron after the podcast script is saved.

**When to use:** Inside `handleGenerate()` in `app/api/generate/route.ts`, after `generateAndSavePodcastScript` succeeds.

**Critical constraint:** Must check `hasCapacity()` before triggering. Must not block the cron response (fire-and-forget). Must not fail the cron if ElevenLabs fails.

**Example:**
```typescript
// In app/api/generate/route.ts
import { generateAndSavePodcastAudio } from '@/lib/podcast-audio-cron';

// Inside handleGenerate(), after briefing is saved:
// Fire-and-forget: generate podcast script, then MP3
generateAndSavePodcastScript(briefing)
  .then(async (script) => {
    // After script is saved, attempt MP3 pre-generation
    const charCount = script.length;
    const capable = await hasCapacity(charCount);
    if (capable) {
      await generateAndCachePodcastAudio(briefing.date);
    } else {
      console.warn(`[generate] Skipping MP3 pre-gen — ElevenLabs budget insufficient`);
    }
  })
  .catch((err) =>
    console.error('[generate] Podcast auto-generation failed:', err)
  );
```

**Implementation note:** The actual ElevenLabs call logic already lives in `app/api/podcast-audio/route.ts`. For cron use, extract the core generation logic into a shared helper in `lib/` (e.g., `lib/podcast-audio.ts`) so the cron can call it without going through HTTP. The route handler and the cron helper both call the same underlying function.

**maxDuration concern:** `app/api/generate/route.ts` has `maxDuration = 300` (5 minutes). The briefing generation itself uses the full allowance. Adding an ElevenLabs call (which can take 30-60s) within the same await chain could exceed this. The solution is strict fire-and-forget: `.catch()` only, no `await`. The cron response returns before ElevenLabs finishes. This is safe because Vercel Serverless Functions keep running as long as the Node.js event loop is active — the fire-and-forget promise will complete before the function is garbage-collected in practice, though this is not guaranteed on Vercel. A safer alternative is a separate `/api/podcast-audio-pregenerate` endpoint that the cron calls fire-and-forget via an internal fetch (not `await`).

**Safest approach for cron pre-generation:** Keep it as a chained `.then()` after `generateAndSavePodcastScript` returns, using `.catch()` to swallow errors. This is the same pattern already used for quiz and script generation in the cron.

### Pattern 4: Admin Backfill Route

**What:** POST-only API route to trigger `backfillQuizIndex()` — one-time migration.

**When to use:** Single manual call by admin after deploy.

**Example:**
```typescript
// app/api/admin/backfill-quiz/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { backfillQuizIndex } from '@/lib/storage';

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export async function POST() {
  const { userId } = await auth();
  if (!userId || userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const count = await backfillQuizIndex();
  return NextResponse.json({ backfilled: count });
}
```

### Anti-Patterns to Avoid

- **Scanning Redis on every page load:** The backfill is a one-time migration. Once `quiz:index` is populated, `listQuizDates()` reads from the sorted set — fast. Do not add a Redis scan to the normal read path.
- **Blocking the cron on ElevenLabs:** If ElevenLabs is slow or fails, it must not break the cron response. Always fire-and-forget with `.catch()`.
- **N Blob `head()` calls in the archive page:** Avoid calling `audioExists()` for every date in a loop on the server-side archive render. Use the batch listing approach instead.
- **Skipping the `hasCapacity()` check in cron:** The cron fires every day at 06:00 UTC regardless of budget. Without the check, a low-budget day will silently burn characters.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Redis key scan | Custom pagination logic | `redis.scan(cursor, { match, count })` from `@upstash/redis` | Upstash SDK handles cursor iteration correctly; custom loops are error-prone |
| Blob pagination | Manual offset-based pagination | `@vercel/blob list()` with `cursor` field | Blob `list()` returns `hasMore` and `cursor` — already used in existing code |
| Budget enforcement | Custom char counter | `hasCapacity()` from `lib/char-usage.ts` | Already handles daily rate cap + monthly hard cap; duplicating this logic creates drift |

**Key insight:** All required primitives already exist in the codebase. This phase is entirely about wiring them together, not building new infrastructure.

---

## Common Pitfalls

### Pitfall 1: Upstash SCAN cursor type
**What goes wrong:** `redis.scan()` returns `[cursor, keys]` where cursor is a string in Upstash's REST API, not a number. Comparing `cursor !== 0` fails because string `"0"` !== number `0`.
**Why it happens:** Upstash Redis REST API returns cursor as a string.
**How to avoid:** Always coerce: `cursor = Number(nextCursor)` then compare `cursor !== 0`. Confirmed safe pattern for `@upstash/redis`.
**Warning signs:** Infinite loop in backfill, or scan completing after one iteration even when more keys exist.

### Pitfall 2: ZADD without NX flag
**What goes wrong:** Re-running backfill overwrites existing sorted set scores with the same values — harmless but wasteful; also risks accidental data corruption if score logic is ever changed.
**Why it happens:** Default ZADD behavior updates existing members.
**How to avoid:** Use `{ nx: true }` on all backfill zadd calls so existing entries are never overwritten.

### Pitfall 3: Archive page rendering N Blob head() calls
**What goes wrong:** Server Component renders `listPodcastDates()` to get 30 dates, then calls `audioExists(date, voiceId)` for each — 30 sequential Blob `head()` API calls, adding ~3-5s to page render.
**Why it happens:** `audioExists()` makes one Blob `head()` call per invocation.
**How to avoid:** In `listPodcastDates()`, track which dates came from Blob vs. Redis, and return that distinction. Or expose a `listPodcastDatesWithStatus()` variant that does a single `list()` pass and returns `{ date, hasAudio }` tuples.

### Pitfall 4: ElevenLabs cron call blocking
**What goes wrong:** Adding `await generatePodcastAudio(...)` inside `handleGenerate()` causes the cron GET response to wait for ElevenLabs — which can take 30-90s — potentially exceeding the 120s timeout on `podcast-audio/route.ts` or the 300s `maxDuration` on the generate route.
**Why it happens:** Awaiting a slow async call.
**How to avoid:** Strict fire-and-forget. Chain `.then()` from the podcast script generation without `await`. The cron returns as soon as the briefing is saved.

### Pitfall 5: Missing briefing data for podcast archive entries
**What goes wrong:** `/podcast/archive` page links to `/podcast/{date}`, which calls `getBriefing(date)` and returns 404 if no briefing exists. Old podcast scripts in Redis were generated from briefings — briefings should also exist in Redis for those dates.
**Why it happens:** Shouldn't be an issue if briefings were saved correctly, but the archive page should handle 404 gracefully.
**How to avoid:** The existing `/podcast/[date]/page.tsx` already handles `notFound()` correctly. No change needed.

### Pitfall 6: `podcast-script:*` keys have no TTL
**What goes wrong:** Redis memory grows unbounded as scripts accumulate. Currently there is no TTL on podcast scripts (unlike daily ElevenLabs usage keys which have 48h TTL). This is an existing design choice, not a new risk introduced by this phase.
**Why it happens:** Scripts are intentionally persistent — they're needed for re-generation and archive listing.
**How to avoid:** Not a Phase 9 concern. Flag as a known tradeoff in the phase plan. Do not add TTLs to script keys as part of this work.

---

## Code Examples

Verified patterns from direct codebase inspection:

### Existing ZADD pattern (from lib/storage.ts line 29)
```typescript
// Source: lib/storage.ts — redisSave()
await redis.zadd('briefing:index', {
  score: new Date(briefing.date).getTime(),
  member: briefing.date,
});
```
Use the same pattern for quiz:index backfill. Add `nx: true` to make it idempotent.

### Existing Blob list() pattern (from lib/podcast-storage.ts line 170)
```typescript
// Source: lib/podcast-storage.ts — listPodcastDates()
const { list } = await import('@vercel/blob');
let cursor: string | undefined;
do {
  const result = await list({
    prefix: 'podcasts/',
    ...(cursor ? { cursor } : {}),
  });
  for (const blob of result.blobs) {
    const match = blob.pathname.match(/^podcasts\/(\d{4}-\d{2}-\d{2})/);
    if (match) seen.add(match[1]);
  }
  cursor = result.hasMore ? result.cursor : undefined;
} while (cursor);
```

### Existing fire-and-forget pattern in cron (from app/api/generate/route.ts line 74)
```typescript
// Source: app/api/generate/route.ts
generateAndSaveQuiz(briefing).catch((err) =>
  console.error('[generate] Quiz auto-generation failed:', err)
);
generateAndSavePodcastScript(briefing).catch((err) =>
  console.error('[generate] Podcast auto-generation failed:', err)
);
```
Use the same `.catch()` pattern for MP3 pre-generation chained off `generateAndSavePodcastScript`.

### Existing hasCapacity() usage (from app/api/podcast-audio/route.ts line 127)
```typescript
// Source: app/api/podcast-audio/route.ts
const charCount = script.length;
if (!(await hasCapacity(charCount))) {
  const { used, limit } = await getMonthlyUsage();
  console.warn(`[podcast-audio] Monthly quota reached: ${used} / ${limit} chars used.`);
  return NextResponse.json(
    { error: 'Monthly audio generation quota reached.' },
    { status: 429 }
  );
}
```

### Existing audioExists() function (from lib/podcast-storage.ts line 122)
```typescript
// Source: lib/podcast-storage.ts
export async function audioExists(date: string, voiceId: string): Promise<boolean> {
  if (useBlob()) {
    return (await getAudioUrl(date, voiceId)) !== null;
  }
  // Filesystem check (dev)
  ...
}
```
This is the correct check for "does a cached MP3 exist". The archive page should use this — but batched, not per-row.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No `quiz:index` sorted set | `quiz:index` zadd on every `saveQuiz()` | Phase 6 (06-02-PLAN.md) | Archive reads are O(1) sorted set range; pre-Phase-6 quizzes not indexed |
| MP3 generated on first user visit | MP3 generated on first user visit (unchanged until Phase 9) | Not yet changed | First subscriber of the day waits for ElevenLabs call |
| Podcast archive reads Blob only | Podcast archive reads Blob only (broken for old episodes) | Not yet changed | Old episodes not listed because Blob wasn't active when they were generated |

**Deprecated/outdated:**
- Legacy Blob pathname without voiceId (`podcasts/{date}.mp3`): handled by `legacyBlobPathname()` in `podcast-storage.ts`. Any old MP3s stored with this key will still be found. No migration needed.

---

## Open Questions

1. **How many pre-Blob podcast scripts exist in Redis?**
   - What we know: BLOB_READ_WRITE_TOKEN was confirmed set in session 6. Sessions before that (1-5 roughly) may have generated scripts but not Blob MP3s.
   - What's unclear: Exact count of `podcast-script:*` keys in Redis.
   - Recommendation: The `listPodcastDates()` fallback handles this automatically. Planner does not need to know the exact count.

2. **Should backfill happen at deploy time or via admin trigger?**
   - What we know: The backfill is idempotent (NX flag). Running it on every cold start would be wasteful but safe.
   - What's unclear: Whether a deploy-time migration hook exists in this stack (it does not — Next.js has no built-in migration runner).
   - Recommendation: Admin POST route is the right pattern. One manual trigger after deploy. Log result to confirm count.

3. **Can the cron pre-generation reliably complete within maxDuration?**
   - What we know: Cron has `maxDuration = 300` (5 min). Briefing generation is the heavy step. ElevenLabs TTS for a ~2,800 char script typically takes 15-45 seconds.
   - What's unclear: Whether the fire-and-forget promise will complete before Vercel terminates the function.
   - Recommendation: Use strict fire-and-forget (no await). This is a best-effort pre-generation. If it doesn't complete, the first user visit will trigger it as before — no regression, just no improvement for that day.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — Next.js project has no test runner configured |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | BLOB_READ_WRITE_TOKEN active, Blob backend used | smoke (manual) | Check Vercel env vars panel; call `GET /api/podcast-audio?date=YYYY-MM-DD&check=true` and verify `exists: true` for a recent date | N/A — manual |
| PODCAST-01 | `/podcast/archive` lists all past episodes including pre-Blob | smoke (manual) | Visit `/podcast/archive` and verify dates before Blob activation appear; verify play button only on dates with cached MP3 | N/A — manual |
| Quiz backfill | `quiz:index` populated for pre-Phase-6 dates | smoke (manual) | POST `/api/admin/backfill-quiz`, verify response `{ backfilled: N }` where N > 0; then visit `/quiz/archive` and verify old dates appear | N/A — manual |
| Cron pre-gen | First visitor to `/podcast` is served cached audio, not waiting for ElevenLabs | smoke (manual) | After 06:00 UTC cron runs, immediately call `GET /api/podcast-audio?date=today&check=true` — should return `{ exists: true }` without triggering TTS | N/A — manual |

### Wave 0 Gaps
None — no automated test infrastructure is expected for this phase. All verification is manual smoke testing on production (consistent with prior phases in this project which use live Vercel infra for API verification per CLAUDE.md).

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `lib/storage.ts`, `lib/podcast-storage.ts`, `lib/char-usage.ts`, `lib/podcast.ts`, `app/api/generate/route.ts`, `app/api/podcast-audio/route.ts`, `app/api/podcast/route.ts`, `app/podcast/archive/page.tsx`, `app/quiz/archive/page.tsx`, `components/PodcastPlayer.tsx`
- `.planning/REQUIREMENTS.md` — INFRA-01, PODCAST-01
- `MEMORY.md` — Phase 9 scope decisions from session 7
- `CLAUDE.md` — Project stack, ElevenLabs constraints, Redis/Blob patterns

### Secondary (MEDIUM confidence)
- Upstash Redis `scan()` cursor-as-string behavior: widely documented in Upstash community; coerce to Number before comparing.
- `@vercel/blob list()` cursor pagination: pattern confirmed in existing `podcast-storage.ts` code.

### Tertiary (LOW confidence)
- None — all claims grounded in direct code inspection.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use; no new packages
- Architecture: HIGH — all patterns derived from existing codebase patterns
- Pitfalls: HIGH — all pitfalls identified from direct inspection of the specific code paths that will be modified

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable stack; only risk is Upstash/Vercel SDK updates)
