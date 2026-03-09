# Codebase Structure

**Analysis Date:** 2026-03-09

## Directory Layout

```
Folio/
├── app/                     # Next.js App Router — pages and API routes
│   ├── api/                 # Server-only Route Handlers
│   │   ├── generate/        # Briefing generation (cron + admin POST)
│   │   ├── quiz/            # Quiz generation (subscription-gated POST)
│   │   ├── podcast/         # Podcast script generation
│   │   ├── podcast-audio/   # ElevenLabs TTS + MP3 serving
│   │   ├── podcast-voices/  # Voice listing endpoint
│   │   ├── bookmarks/       # Bookmark CRUD (subscription-gated)
│   │   ├── comments/        # Story comments CRUD
│   │   ├── onboarding/      # User onboarding preferences
│   │   ├── tracker/         # Application tracker CRUD
│   │   ├── aptitude-questions/ # Aptitude bank serving
│   │   ├── digest/          # Weekly email digest (cron)
│   │   ├── stripe/          # Stripe checkout, portal, webhook
│   │   │   ├── checkout/    # Creates Stripe checkout session
│   │   │   ├── portal/      # Opens Stripe billing portal
│   │   │   └── webhook/     # Handles subscription lifecycle events
│   │   └── clerk-proxy/     # Clerk Frontend API proxy (kept for prod upgrade)
│   ├── archive/             # Archive listing + /archive/[date]
│   ├── area-fit/            # Area-of-law fit quiz
│   ├── firm-fit/            # Firm-match quiz
│   ├── firms/               # Firm directory + /firms/[slug]
│   ├── interview/           # Interview practice
│   ├── onboarding/          # Onboarding flow
│   ├── podcast/             # Podcast player + /podcast/archive
│   ├── primers/             # Sector primers + /primers/[slug]
│   ├── quiz/                # Daily quiz + /quiz/[date]
│   ├── saved/               # Bookmarks + notes
│   ├── sign-in/             # Clerk sign-in page
│   ├── sign-up/             # Clerk sign-up page
│   ├── story/               # Full story view /story/[id]
│   ├── tests/               # Aptitude test directory + practice sessions
│   ├── topic/               # Topic-filtered briefing /topic/[slug]
│   ├── tracker/             # Application tracker dashboard
│   ├── upgrade/             # Subscription upgrade page
│   ├── success/             # Post-checkout success page
│   ├── privacy/             # Privacy policy
│   ├── terms/               # Terms of service
│   ├── layout.tsx           # Root layout (ClerkProvider, fonts, theme)
│   ├── providers.tsx        # Client providers (ThemeProvider, BookmarksProvider)
│   ├── page.tsx             # Home page — today's briefing
│   ├── loading.tsx          # Root loading skeleton
│   ├── not-found.tsx        # Custom 404
│   ├── globals.css          # Tailwind base styles + CSS variables
│   └── icon.svg             # Favicon / app icon
├── components/              # Shared React components (flat, no subdirectories)
├── lib/                     # Business logic, storage, AI, utilities (flat)
├── data/                    # Runtime-persisted data (dev filesystem backend)
│   ├── briefings/           # YYYY-MM-DD.json, YYYY-MM-DD-quiz.json, podcast files
│   ├── firms/               # {slug}-pack.json (firm interview packs)
│   ├── bookmarks.json       # User bookmarks (dev only)
│   ├── subscriptions.json   # Subscription state (dev only)
│   ├── tracker.json         # Application tracker state (dev only)
│   └── el-usage.json        # ElevenLabs character usage (dev only)
├── public/                  # Static assets
├── .claude/                 # Claude Code config (launch.json, memory)
├── .github/                 # GitHub Actions CI
├── .planning/               # GSD planning documents
│   └── codebase/            # Codebase map (STACK.md, INTEGRATIONS.md, etc.)
├── middleware.ts            # Clerk middleware + review bypass
├── next.config.ts           # CSP headers, Clerk proxy rewrite
├── vercel.json              # Cron schedules (generate + digest)
├── tailwind.config.ts       # Tailwind config (stone/zinc palette, custom fonts)
├── tsconfig.json            # TypeScript config (path alias @/ → project root)
└── package.json             # Dependencies
```

## Directory Purposes

**`app/api/`:**
- Purpose: All server-side mutation endpoints and AI generation triggers
- Contains: One `route.ts` per feature; no shared middleware files
- Key files: `app/api/generate/route.ts`, `app/api/stripe/webhook/route.ts`, `app/api/podcast-audio/route.ts`

**`app/` (page routes):**
- Purpose: Next.js file-system routing — each subdirectory is a URL segment
- Contains: `page.tsx` (required), optional `loading.tsx`, dynamic `[param]` directories
- Pattern: Premium pages call `await requireSubscription()` at the top of the component

**`components/`:**
- Purpose: All reusable React UI components — flat directory, no subdirectories
- Contains: Feature components (large, self-contained: `QuizInterface.tsx`, `PodcastPlayer.tsx`, `TrackerDashboard.tsx`, `TestSession.tsx`) and shared components (`Header.tsx`, `TabBar.tsx`, `StoryCard.tsx`, `SiteFooter.tsx`)
- Key files: `components/Header.tsx`, `components/BriefingView.tsx`, `components/StoryCard.tsx`, `components/QuizInterface.tsx`

**`lib/`:**
- Purpose: All server-side business logic, data services, AI integrations, and utilities — flat directory
- Contains: TypeScript modules with no React imports; each file is independently importable
- Key files: `lib/types.ts` (all domain types), `lib/storage.ts` (briefing/quiz persistence), `lib/generate.ts` (AI briefing generation), `lib/paywall.ts` (subscription enforcement), `lib/security.ts` (input validation)

**`data/`:**
- Purpose: Local filesystem storage for dev environment — mirrors what Redis/Blob store in production
- Contains: Generated JSON files named by date pattern; never committed with real user data
- Generated: Yes (at runtime by lib/storage.ts and related modules)
- Committed: `.gitignore` excludes `data/*.json` files containing user data; `data/briefings/` example files may be committed for dev seed data

**`lib/*-data.ts` (static data files):**
- Purpose: Large static datasets checked into source — no runtime generation required
- Key files: `lib/firms-data.ts` (38 firm profiles, ~97KB), `lib/primers-data.ts` (~89KB), `lib/interview-data.ts` (~81KB), `lib/firm-quiz-data.ts`, `lib/area-quiz-data.ts`, `lib/diversity-data.ts`
- Pattern: Export typed arrays/maps directly; imported by pages and components at build/request time

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Home page — today's briefing, subscription status, onboarding integration
- `app/layout.tsx`: Root layout — wraps all pages in `ClerkProvider`, fonts, global providers
- `app/providers.tsx`: Client-only providers (`ThemeProvider`, `BookmarksProvider`)
- `middleware.ts`: Clerk auth middleware, review key bypass cookie logic

**Configuration:**
- `next.config.ts`: CSP security headers, Clerk proxy rewrite rule (`/__clerk` → `/api/clerk-proxy`)
- `vercel.json`: Cron schedules (`/api/generate` at 06:00 UTC daily, `/api/digest` at 08:00 UTC Sundays)
- `tailwind.config.ts`: Custom font variables, stone/zinc palette, container config
- `.eslintrc.json`: ESLint config (next/core-web-vitals, react-hooks/rules-of-hooks disabled for lib/)
- `tsconfig.json`: Path alias `@/` maps to project root

**Core Logic:**
- `lib/types.ts`: All TypeScript interfaces + `TOPIC_STYLES` colour config
- `lib/generate.ts`: Tavily web search + Claude `claude-sonnet-4-6` briefing generation
- `lib/storage.ts`: Dual-backend briefing/quiz/aptitude persistence (Redis / filesystem)
- `lib/paywall.ts`: `requireSubscription()` + `getSubscriptionStatus()` with PREVIEW_MODE guard
- `lib/subscription.ts`: Stripe subscription state (Redis key: `subscription:{userId}`)
- `lib/rate-limit.ts`: Redis fixed-window rate limiter
- `lib/security.ts`: Input validators (`isValidDate`, `isValidStoryId`, `isValidSlug`, `isWhitelistedVoiceId`)
- `lib/podcast-storage.ts`: Podcast script (Redis) + MP3 (Vercel Blob) dual-backend
- `lib/firm-pack.ts`: AI interview pack generation + 7-day cache
- `lib/char-usage.ts`: ElevenLabs monthly character budget tracking

**Critical API Routes:**
- `app/api/generate/route.ts`: Cron (GET) + admin manual trigger (POST) for briefing generation
- `app/api/stripe/webhook/route.ts`: Stripe subscription lifecycle handler
- `app/api/podcast-audio/route.ts`: ElevenLabs TTS generation + MP3 serving

**Testing:**
- No test files present — no test framework configured

## Naming Conventions

**Files:**
- Pages: `page.tsx`, `layout.tsx`, `loading.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- React components: PascalCase `.tsx` (e.g. `StoryCard.tsx`, `QuizInterface.tsx`)
- Library modules: camelCase `.ts` (e.g. `storage.ts`, `firm-pack.ts`, `bookmarks-server.ts`)
- Static data files: kebab-case with `-data` suffix (e.g. `firms-data.ts`, `primers-data.ts`)
- Dynamic route segments: `[param]` directory names (e.g. `[id]`, `[slug]`, `[date]`)

**Directories:**
- Route segments: kebab-case matching URL path (e.g. `podcast-audio/`, `area-fit/`)
- Static data: `data/` with `briefings/` subdirectory for date-keyed files

**Redis Key Naming:**
- `briefing:{YYYY-MM-DD}` — daily briefing JSON
- `quiz:{YYYY-MM-DD}` — daily quiz JSON
- `subscription:{userId}` — Stripe subscription data
- `bookmarks:{userId}` — user bookmarks array
- `onboarding:{userId}` — user onboarding preferences
- `firm-pack:{slug}` — firm interview pack (7-day TTL)
- `aptitude-bank:{testType}` — question bank (weekly refresh)
- `podcast-script:{YYYY-MM-DD}` — ElevenLabs script text
- `elevenlabs:chars:{YYYY-MM}` — monthly character usage counter
- `rl:{route}:{identifier}:{window}` — rate limit counter
- `stripe-customer:{stripeCustomerId}` — Clerk userId reverse lookup

## Where to Add New Code

**New Premium Page:**
- Create directory: `app/{route-name}/`
- Page file: `app/{route-name}/page.tsx`
- Add `await requireSubscription()` at top of async component
- Add `export const dynamic = 'force-dynamic'`
- Fetch data from `lib/storage.ts` or relevant lib module

**New API Route:**
- Create directory: `app/api/{feature-name}/`
- Route file: `app/api/{feature-name}/route.ts`
- Always: call `auth()` from `@clerk/nextjs/server`, validate subscription with `isSubscribed()` for premium endpoints
- Always: call `checkRateLimit()` from `lib/rate-limit.ts`
- Always: validate input params with validators from `lib/security.ts`

**New React Component:**
- Add directly to `components/` (no subdirectories)
- Use PascalCase `.tsx` filename matching the component name
- Import types from `lib/types.ts`
- Use `cn()` from `lib/utils.ts` for conditional class merging

**New Library Module:**
- Add to `lib/` as a flat camelCase `.ts` file
- If the module needs persistence: follow the dual-backend pattern from `lib/storage.ts`
- Export a clean public API; keep internal helpers as module-private functions

**New Static Data:**
- Add to `lib/` as `{name}-data.ts`
- Export typed arrays/maps directly using types from `lib/types.ts`
- No runtime generation — data is static and checked into source

**New Topic/Domain Type:**
- Add interface/type to `lib/types.ts`
- If a topic colour mapping is needed, add to `TOPIC_STYLES` in `lib/types.ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD framework planning documents (PROJECT.md, phases, codebase maps)
- Generated: Partially (codebase/ subdocs are auto-generated by `/gsd:map-codebase`)
- Committed: Yes

**`.claude/`:**
- Purpose: Claude Code project configuration (`launch.json` for dev server, `MEMORY.md` for session memory)
- Generated: No
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes (by `next build` / `next dev`)
- Committed: No (`.gitignore`)

**`data/`:**
- Purpose: Local dev filesystem backend — mirrors Redis production data
- Generated: Yes (at runtime)
- Committed: Partially — static seed files only; user data files (bookmarks.json, subscriptions.json) are gitignored

---

*Structure analysis: 2026-03-09*
