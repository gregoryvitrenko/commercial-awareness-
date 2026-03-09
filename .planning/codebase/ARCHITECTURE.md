# Architecture

**Analysis Date:** 2026-03-09

## Pattern Overview

**Overall:** Next.js App Router server-first architecture with a layered service pattern

**Key Characteristics:**
- Pages are async React Server Components that fetch data directly from `lib/` services — no Redux, no client-side data fetching for initial load
- API routes handle mutations and premium-gated generation; they enforce auth + subscription at the route level independently of page-level paywalls
- Dual-backend storage pattern throughout: Upstash Redis in production, local filesystem (`data/`) in development — same public API, backend detected at runtime via env vars
- `export const dynamic = 'force-dynamic'` on all pages (prevents SSG failures with Clerk)

## Layers

**Page Layer (App Router):**
- Purpose: Renders UI, fetches data from storage/service libs, enforces subscription via `requireSubscription()`
- Location: `app/`
- Contains: `page.tsx` files for each route, `layout.tsx`, `loading.tsx`, `not-found.tsx`
- Depends on: `lib/storage.ts`, `lib/paywall.ts`, `lib/subscription.ts`, `components/`
- Used by: Browser (SSR-rendered HTML delivered to client)

**API Route Layer:**
- Purpose: Server-side mutations, AI generation triggers, Stripe webhooks, media serving
- Location: `app/api/`
- Contains: REST-style Next.js Route Handlers
- Depends on: `lib/` service modules, Clerk `auth()`, `lib/rate-limit.ts`, `lib/security.ts`
- Used by: Client components (via `fetch`), Vercel cron (generate/digest), Stripe (webhooks)

**Service / Library Layer:**
- Purpose: Business logic, storage abstraction, AI calls, external integrations
- Location: `lib/`
- Contains: Pure TypeScript modules with no React dependencies
- Depends on: External SDKs (Anthropic, Resend), storage backends (Redis, filesystem, Vercel Blob)
- Used by: Pages, API routes, other lib modules

**Component Layer:**
- Purpose: Reusable React UI — exclusively client components for interactivity, server components for data display
- Location: `components/`
- Contains: Feature components (`QuizInterface.tsx`, `PodcastPlayer.tsx`) and shared primitives (`Header.tsx`, `TabBar.tsx`)
- Depends on: `lib/types.ts`, `lib/utils.ts`, lucide-react, shadcn/ui
- Used by: Pages

**Data Layer:**
- Purpose: Static reference data (firms, primers, interview questions) and persisted generated content
- Location: `lib/*-data.ts` (static), `data/` (runtime-persisted)
- Contains: Large TypeScript data files for firm profiles, primers, quiz question banks; JSON files for generated briefings/quizzes
- Depends on: Nothing — pure data
- Used by: Service layer, pages

## Data Flow

**Daily Briefing Generation (Cron at 06:00 UTC):**

1. Vercel cron calls `GET /api/generate` with `Authorization: Bearer {CRON_SECRET}`
2. `app/api/generate/route.ts` validates auth, checks if today's briefing already exists
3. `lib/generate.ts` fires 8 parallel Tavily search queries, collects results
4. `lib/generate.ts` sends aggregated search context to `claude-sonnet-4-6` with structured JSON prompt
5. Claude response parsed/repaired, assembled into `Briefing` type from `lib/types.ts`
6. Briefing saved via `lib/storage.ts` (Redis key: `briefing:{date}`)
7. Fire-and-forget: quiz generation (`lib/quiz.ts`), podcast script generation (`lib/podcast.ts`), aptitude bank refresh (`lib/aptitude.ts`)

**User Reads a Story (Premium Page):**

1. Browser requests `/story/[id]`
2. `app/story/[id]/page.tsx` calls `requireSubscription()` from `lib/paywall.ts`
3. `requireSubscription()` calls Clerk `auth()` → `lib/subscription.ts` → Redis key `subscription:{userId}`
4. If subscribed, page fetches `Briefing` from `lib/storage.ts`, finds story by ID
5. Passes story to `ArticleStory` component for rendering

**Podcast Audio Generation:**

1. `PodcastPlayer` component calls `POST /api/podcast-audio` with `{ date, voiceId }`
2. `app/api/podcast-audio/route.ts` checks auth + subscription
3. Checks Vercel Blob for cached MP3 (`podcasts/{date}-{voiceId}.mp3`) — returns URL if found
4. If not cached: retrieves script from Redis (`podcast-script:{date}`), checks ElevenLabs char budget
5. Calls ElevenLabs API with Daniel voice, saves MP3 to Vercel Blob, records character usage
6. Returns Blob URL or raw buffer (dev)

**Stripe Subscription Webhook:**

1. Stripe fires event to `POST /api/stripe/webhook`
2. Route verifies Stripe webhook signature, checks idempotency via Redis `SET NX` (48h TTL)
3. On `customer.subscription.updated/created`: stores `SubscriptionData` in Redis key `subscription:{userId}`
4. Triggers welcome email via `lib/email.ts` (Resend) on first activation

**State Management:**
- Server state: Upstash Redis (production), local JSON files `data/*.json` (development)
- Client state: React context via `BookmarksProvider` (hydrates from `GET /api/bookmarks`), `ThemeProvider` (next-themes, persists to localStorage)
- No global client state management library (no Redux, Zustand, etc.)

## Key Abstractions

**Dual-Backend Storage Pattern:**
- Purpose: Run identical code in dev (filesystem) and prod (Redis/Blob) without branching in calling code
- Examples: `lib/storage.ts`, `lib/subscription.ts`, `lib/bookmarks-server.ts`, `lib/onboarding.ts`, `lib/podcast-storage.ts`, `lib/firm-pack.ts`
- Pattern: Each module exports a `useRedis()` / `useBlob()` detection function checking for env vars, then exposes a single public async API that routes to the correct backend internally

**Paywall Guard:**
- Purpose: Enforce subscription on premium pages and API routes
- Examples: `lib/paywall.ts` (`requireSubscription()` for pages), inline `isSubscribed()` checks in API routes
- Pattern: Pages call `await requireSubscription()` at the top of the async component — redirects to `/sign-up` or `/upgrade`. API routes call `isSubscribed(userId)` directly and return 403

**Input Validators (Security Layer):**
- Purpose: Prevent path traversal, Redis key injection, and arbitrary API parameter abuse
- Examples: `lib/security.ts` (`isValidDate()`, `isValidStoryId()`, `isValidSlug()`, `isWhitelistedVoiceId()`)
- Pattern: All dynamic route params and user-supplied values validated before passing to storage or external APIs

**Content Types (`lib/types.ts`):**
- Purpose: Single source of truth for all domain types shared across pages, API, and lib
- Key types: `Briefing`, `Story`, `QuizQuestion`, `FirmProfile`, `Primer`, `TrackedApplication`
- Pattern: Import from `@/lib/types` — never define domain types inline in components or routes

**Rate Limiter (`lib/rate-limit.ts`):**
- Purpose: Redis fixed-window limiter protecting all mutation API routes
- Pattern: Call `await checkRateLimit(userId, 'route-name', limit, windowSecs)` — returns `NextResponse | null`. If non-null, return immediately. Fails-open in dev (no Redis).

## Entry Points

**Root Page (`/`):**
- Location: `app/page.tsx`
- Triggers: Browser navigation, direct URL
- Responsibilities: Fetches today's briefing (or latest), checks subscription status, renders `BriefingView` or empty state with optional `LandingHero` for unauthenticated users

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: All page renders
- Responsibilities: Wraps all pages in `ClerkProvider`, `ThemeProvider`, `BookmarksProvider`; loads Google Fonts (Inter, Playfair Display, JetBrains Mono); renders `SiteFooter` and `ScrollToTop`

**Cron Entry (Briefing Generation):**
- Location: `app/api/generate/route.ts` — `GET` handler
- Triggers: Vercel cron at 06:00 UTC daily (`vercel.json`)
- Responsibilities: Validates `CRON_SECRET`, runs `generateBriefing()`, fires quiz/podcast/aptitude refresh as fire-and-forget

**Cron Entry (Digest Email):**
- Location: `app/api/digest/route.ts`
- Triggers: Vercel cron at 08:00 UTC Sundays (`vercel.json`)

**Stripe Webhook:**
- Location: `app/api/stripe/webhook/route.ts`
- Triggers: Stripe subscription lifecycle events
- Responsibilities: Verifies signature, sets/removes subscription in Redis, sends welcome email

**Clerk Auth Middleware:**
- Location: `middleware.ts`
- Triggers: All requests matching the `config.matcher` pattern
- Responsibilities: Runs `clerkMiddleware`, handles `?review_key=` temporary bypass (sets `folio-review-access` cookie), passes `/__clerk` paths through without processing

## Error Handling

**Strategy:** Fail loudly on misconfiguration; fail gracefully on runtime errors

**Patterns:**
- `PREVIEW_MODE=true` in production throws a FATAL error at startup (`lib/paywall.ts`) — prevents silent auth bypass
- `CRON_SECRET` not configured → cron access denied with logged error (fail-closed)
- Missing `ANTHROPIC_API_KEY` → throws `Error` immediately in `lib/generate.ts`
- Tavily search failures → returns empty results, generation proceeds with Claude training data
- ElevenLabs errors → `sanitizeUpstreamError()` called, raw API body never forwarded to client
- Storage failures in fire-and-forget tasks (quiz, podcast, aptitude) → `console.error` only, never fail the primary briefing generation
- `repairJSON()` in `lib/generate.ts` handles truncated Claude responses before `JSON.parse`
- API routes return structured `{ error: string }` JSON with appropriate HTTP status codes

## Cross-Cutting Concerns

**Logging:** `console.log`/`console.error`/`console.warn` with `[module]` prefixes (e.g. `[generate]`, `[quiz]`, `[podcast-audio]`). No structured logging library.

**Validation:** All dynamic route params validated through `lib/security.ts` before storage access. Request bodies validated inline in route handlers with explicit field checks.

**Authentication:** Clerk via `@clerk/nextjs/server`. Pages use `auth()` for userId; premium pages call `requireSubscription()`. API routes call `auth()` directly and check `isSubscribed()` from `lib/subscription.ts`. Admin bypass via `ADMIN_USER_ID` env var.

**Caching:** AI-generated content cached indefinitely once generated (briefings, quizzes, podcast MP3s). Firm interview packs cached 7 days in Redis. Aptitude question banks cached 7 days (TTL tracked in `lastRefreshed` field). ElevenLabs character usage tracked in Redis key `elevenlabs:chars:{YYYY-MM}`.

---

*Architecture analysis: 2026-03-09*
