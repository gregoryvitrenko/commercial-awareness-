# Testing Patterns

**Analysis Date:** 2026-03-09

## Test Framework

**Runner:** None — no test framework is installed or configured.

Searching the codebase confirms:
- No `jest.config.*` or `vitest.config.*` files exist
- No test runner in `package.json` `scripts` (only `dev`, `build`, `start`, `lint`)
- No `@jest/*`, `vitest`, `@testing-library/*`, or similar packages in `package.json`
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files anywhere in the project

**Run Commands:**
```bash
npm run lint    # ESLint only — no test runner available
npm run build   # TypeScript compile check (strict mode) acts as type-level validation
```

## Current Validation Strategy

Since there is no automated test suite, the project relies on these mechanisms for correctness:

**TypeScript strict mode (`tsconfig.json`):**
- `strict: true` catches type errors at build time
- All function signatures and return types are explicitly typed
- `noEmit: true` — `tsc` is used for checking only, not compilation

**Input validation at runtime (`lib/security.ts`):**
- `isValidDate(date)` — regex validates `YYYY-MM-DD` format before any storage access
- `isValidStoryId(id)` — validates `[a-zA-Z0-9_-]{1,64}` before Redis/FS key construction
- `isValidSlug(slug)` — validates `[a-z0-9-]{1,64}` for route params
- `isWhitelistedVoiceId(id)` — set-membership check against curated whitelist
- `isValidApplicationStatus(s)` — set-membership check for enum values
- All API routes call these validators before any data access

**Manual + live testing:**
- API-only changes (`app/api/**`, `lib/**`) are tested by committing, pushing, and verifying on the live Vercel deployment
- Preview tools (Next.js dev server) are used for UI component changes only
- Dev server runs with `PREVIEW_MODE=true` which bypasses auth and subscription checks

**ESLint (`next/core-web-vitals`):**
- Catches React hook misuse, unused variables, and common Next.js anti-patterns
- Run via `npm run lint`

## Test File Organization

**Location:** Not applicable — no test files exist.

**Naming convention to adopt if tests are added:**
- Co-locate tests with source files: `lib/security.test.ts` alongside `lib/security.ts`
- Component tests: `components/StoryCard.test.tsx` alongside `components/StoryCard.tsx`

## What Would Be Most Valuable to Test

The following areas carry the most risk and are the best candidates for future test coverage:

**`lib/security.ts` — input validators:**
These are the security boundary for all API routes. Pure functions, trivial to unit-test.
```typescript
// High-value unit tests:
isValidDate('2026-03-09')      // true
isValidDate('../../etc/passwd') // false
isValidStoryId('1')             // true
isValidStoryId('a'.repeat(65))  // false (too long)
isWhitelistedVoiceId('onwK4e9ZLuTAKqWW03F9') // true
isWhitelistedVoiceId('arbitrary-id')           // false
```

**`lib/generate.ts` — JSON repair utilities:**
`repairJSON()` and `extractJSON()` handle malformed Claude output. Pure functions, testable without any mocks.
```typescript
// Regressions to guard:
repairJSON('{"stories": [{"topic": "M&A",')  // should close open braces
extractJSON('```json\n{...}\n```')            // should strip fences
extractJSON('{...}')                          // should extract bare JSON
```

**`lib/storage.ts` — dual-backend routing:**
`useRedis()` detection logic and the public API branching. Can be tested by mocking env vars.

**`lib/subscription.ts` — `isSubscribed()` logic:**
Guards premium access. Key edge cases: expired subscription (currentPeriodEnd < now), `past_due` status, admin bypass.

## Mocking

**Framework:** Not applicable — no test framework installed.

**Patterns to follow if tests are added:**

**Environment variable mocking:**
Most lib modules branch on `UPSTASH_REDIS_REST_URL`. Use `process.env` assignment in test setup:
```typescript
beforeEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});
```

**Redis client isolation:**
The `getRedis()` factory uses `require('@upstash/redis')` dynamically inside functions. Mock at the module level using Jest's `jest.mock()` or Vitest's `vi.mock()`.

**Filesystem isolation:**
Storage lib writes to `data/briefings/` via absolute paths. Use a temp directory or mock `fs` module.

## Fixtures and Factories

**No fixtures exist** — there is no `__fixtures__` or `__mocks__` directory.

**Test data patterns to adopt:**

For unit tests of lib functions, create minimal typed objects:
```typescript
const mockBriefing: Briefing = {
  date: '2026-03-09',
  generatedAt: '2026-03-09T06:00:00Z',
  stories: [],
  sectorWatch: { trend: 'Test', body: 'Test body.' },
  oneToFollow: { story: 'Test story', why: 'Test why.' },
};
```

All types are in `lib/types.ts` — use them directly.

## Coverage

**Requirements:** None enforced — no coverage tooling configured.

**Highest-risk untested areas:**
1. `lib/security.ts` — validators (security boundary, pure functions, easy wins)
2. `lib/generate.ts` — `repairJSON()`, `extractJSON()`, `buildBriefing()` (JSON parsing logic that caused prod failures)
3. `lib/subscription.ts` — `isSubscribed()` (gates all premium access, non-trivial logic)
4. `lib/paywall.ts` — `assertPreviewModeIsSafe()` (FATAL guard, but logic is simple)
5. `lib/rate-limit.ts` — rate window key construction, fail-open in dev

## Test Types

**Unit Tests:** Not present. Best fit for pure utility functions in `lib/security.ts`, `lib/generate.ts` (repair utilities), `lib/topics.ts`.

**Integration Tests:** Not present. Would be valuable for API route handlers — requires mocking Redis and Clerk auth.

**E2E Tests:** Not used. Playwright or Cypress would cover the full user flow (subscribe → access premium content).

## Recommended Test Setup

If adding tests, the recommended approach given the existing stack:

**Framework:** Vitest (compatible with Vite-style ESM, minimal config, fast)

**Install:**
```bash
npm install -D vitest @vitest/coverage-v8
```

**`vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
```

**`package.json` scripts to add:**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Start with `lib/security.test.ts`** — pure functions, no mocking needed, highest security value.

---

*Testing analysis: 2026-03-09*
