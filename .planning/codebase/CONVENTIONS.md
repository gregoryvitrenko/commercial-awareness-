# Coding Conventions

**Analysis Date:** 2026-03-09

## Naming Patterns

**Files:**
- Components: PascalCase, `.tsx` — e.g., `StoryCard.tsx`, `BriefingView.tsx`, `QuizInterface.tsx`
- Server lib modules: camelCase, `.ts` — e.g., `storage.ts`, `paywall.ts`, `rate-limit.ts`
- Data files: kebab-case, `.ts` — e.g., `firms-data.ts`, `primers-data.ts`, `firm-assessments-data.ts`
- API routes: `app/api/[route]/route.ts` (Next.js App Router convention)
- Dual-backend server modules use `-server` suffix — e.g., `bookmarks-server.ts`, `comments-server.ts`

**Functions:**
- camelCase throughout: `getBriefing`, `saveBriefing`, `generateQuiz`, `checkRateLimit`
- Private helpers prefixed with no special marker — just lower scope in module (not exported)
- Redis backend functions prefixed `redis` — e.g., `redisSave`, `redisGet`, `redisList`
- Filesystem backend functions prefixed `fs` — e.g., `fsSave`, `fsGet`, `fsList`
- Validation functions prefixed `isValid` or `isWhitelisted` — e.g., `isValidDate`, `isValidStoryId`, `isWhitelistedVoiceId`
- Builder functions prefixed `build` — e.g., `buildExclusionBlock`, `buildUserPrompt`, `buildBriefing`

**Variables:**
- camelCase for all local variables and function parameters
- SCREAMING_SNAKE_CASE for module-level constants — e.g., `MONTHLY_LIMIT`, `ADMIN_USER_ID`, `TOPIC_STYLES`, `ALLOWED_VOICE_IDS`, `DATA_DIR`
- Underscores in numeric constants for readability — e.g., `100_000`, `12_000`

**Types and Interfaces:**
- PascalCase for all `interface` and `type` declarations — e.g., `Story`, `Briefing`, `RateLimitResult`
- `type` unions for string enums — e.g., `TopicCategory`, `FirmTier`, `ApplicationStatus`, `QuizMode`, `UIState`
- Props interfaces named `[ComponentName]Props` — e.g., `StoryCardProps`, `BriefingViewProps`, `ArticleStoryProps`
- All shared types in `lib/types.ts`; component-local interfaces defined inline in the component file
- Use `interface` for objects that may be extended; `type` for unions and simple aliases

**React Components:**
- Named exports only — no default exports for components (e.g., `export function StoryCard`, `export function BriefingView`)
- Page components use default export (Next.js App Router requirement) — e.g., `export default async function HomePage()`

## Code Style

**Formatting:**
- No Prettier config found — formatting is not enforced by a tool
- 2-space indentation (consistent throughout all files)
- Single quotes for strings in TypeScript/JS
- Trailing commas in multi-line arrays and objects
- Semicolons required

**Linting:**
- ESLint via `.eslintrc.json` extending `next/core-web-vitals`
- `react-hooks/rules-of-hooks` disabled for `lib/**/*.ts` (lib files use `require()` for dynamic Redis imports, not hooks)
- No custom rules beyond the Next.js preset

**TypeScript:**
- `strict: true` in `tsconfig.json` — strict null checks, strict function types
- `skipLibCheck: true` — avoids noise from third-party types
- Path alias `@/*` maps to repo root — use `@/lib/...`, `@/components/...` throughout
- Avoid `any`; use `unknown` with type guards where needed (see `lib/generate.ts` `parseSectorWatch`)
- Cast parsed JSON explicitly: `JSON.parse(content) as Briefing`

## Import Organization

**Order (observed, not enforced by linter):**
1. External packages / Next.js built-ins — `import { NextRequest } from 'next/server'`, `import Anthropic from '@anthropic-ai/sdk'`
2. Internal lib modules via `@/` alias — `import { getBriefing } from '@/lib/storage'`
3. Internal components via `@/` or relative — `import { StoryGrid } from './StoryGrid'`

**Type-only imports:**
- Use `import type { ... }` for type-only imports consistently — e.g., `import type { Briefing } from '@/lib/types'`

**Path Aliases:**
- `@/*` resolves to repo root — use `@/lib/...`, `@/components/...`, `@/app/...`
- No barrel index files — import directly from the module file

**Dynamic imports for Redis:**
- Redis client is `require()`-imported inside functions to avoid module-level execution:
  ```typescript
  function getRedis() {
    const { Redis } = require('@upstash/redis');
    return new Redis({ url: ..., token: ... });
  }
  ```
  This pattern appears in `lib/storage.ts`, `lib/subscription.ts`, `lib/char-usage.ts`, `lib/onboarding.ts`, `lib/rate-limit.ts`.

## Error Handling

**API routes:**
- Errors caught in try/catch, logged with `console.error('[route-name] message:', err)`, returned as `NextResponse.json({ error: '...' }, { status: 500 })`
- Never expose raw error messages to clients — user-facing messages are intentionally vague
- Auth failures return 401; subscription check failures return 403; generation failures return 500
- Upstream API errors (ElevenLabs, etc.) are sanitized via `sanitizeUpstreamError()` in `lib/security.ts`

**Lib modules:**
- Storage functions return `null` on miss (not throw) — callers handle `null` explicitly
- Filesystem read failures silently return safe defaults (`[]`, `{}`, `null`) — `catch { return null; }`
- Critical misconfiguration throws with a descriptive FATAL message — e.g., PREVIEW_MODE in production in `lib/paywall.ts`
- Missing API keys throw `new Error('...')` with the env var name in the message

**Client components:**
- `localStorage` access wrapped in try/catch — `catch { return null; }` or `catch {}` silently
- Fetch errors handled inline: `.catch(() => ({ results: [] }))`

## Logging

**Framework:** `console` (no structured logging library)

**Pattern — prefixed bracket notation:**
```typescript
console.log('[generate] Quiz auto-generated: 24 questions for 2026-03-09');
console.warn('[quiz] POST — unauthenticated request rejected');
console.error('[podcast-audio] ElevenLabs error 429:', await res.text());
```
- Log prefix is always `[route-or-module-name]` in square brackets
- `console.log` for successful operations (generation complete, cache hit)
- `console.warn` for blocked requests (auth failure, rate limit, unsubscribed users)
- `console.error` for unexpected failures (generation errors, external API errors)
- Never log user data beyond userId; never log API keys or secrets

## Comments

**When to Comment:**
- Security-critical decisions are always commented inline — explains the threat model
- Dev/prod divergence is always commented — explains why `if (!useRedis())`
- Deprecated functions annotated with `@deprecated` JSDoc and migration guidance (see `lib/security.ts`)
- Fire-and-forget async calls commented to explain intentional non-await pattern

**JSDoc/TSDoc:**
- Used selectively on exported public API functions and security utilities
- Interface fields use inline `/** ... */` comments when the meaning is non-obvious
- `lib/rate-limit.ts` has full JSDoc on exported functions with `@param` annotations
- `lib/security.ts` has full JSDoc with security rationale on each validator

**Section dividers:**
- Module sections separated with `// ─── Section Name ───...` horizontal rules (consistent pattern across all lib files)

## Function Design

**Size:** Functions are generally small (< 30 lines); large prompt strings are built by dedicated `build*` helper functions

**Parameters:** Prefer named parameters on complex objects; primitive params used directly for simple functions like `isValidDate(date: string)`

**Return Values:**
- Async functions return `Promise<T>` or `Promise<T | null>`
- Storage functions consistently return `T | null` (never throw on cache miss)
- Validation functions return `boolean`
- Rate limiter returns typed result object `RateLimitResult`; convenience wrapper returns `NextResponse | null`

## Module Design

**Exports:**
- Named exports only — no default exports from lib modules
- Public API functions exported; private helper functions (prefixed `redis*`, `fs*`) are not exported
- Constants exported for use by multiple modules (e.g., `TOPIC_STYLES`, `ALLOWED_VOICE_IDS`, `MONTHLY_LIMIT`)

**Dual-backend pattern:**
Every storage module exposes the same public API regardless of backend. Pattern used in `lib/storage.ts`, `lib/subscription.ts`, `lib/char-usage.ts`, `lib/onboarding.ts`:
```typescript
function useRedis(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function getData(key: string): Promise<Data | null> {
  if (useRedis()) return redisGet(key);
  return fsGet(key);
}
```

**Barrel Files:** Not used — import directly from the module path.

## Tailwind Class Conventions

**Design tokens (always use these exact classes):**
- Content borders: `border border-stone-200 dark:border-stone-800`
- Card containers: `rounded-sm` (not `rounded-xl` — the brief says `rounded-xl` but codebase consistently uses `rounded-sm`)
- Section labels: `font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500`
- List dividers: `divide-y divide-zinc-100 dark:divide-zinc-800` (or `divide-stone-100`)
- Primary button: `bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900`

**Topic color classes:** Defined in `TOPIC_STYLES` in `lib/types.ts` — always read from there, never hardcode topic colors.

**`cn()` utility:** Use `cn()` from `lib/utils.ts` for conditional class merging:
```typescript
import { cn } from '@/lib/utils';
className={cn('base-classes', condition && 'conditional-class')}
```

---

*Convention analysis: 2026-03-09*
