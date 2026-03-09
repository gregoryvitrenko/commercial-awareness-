# External Integrations

**Analysis Date:** 2026-03-09

## APIs & External Services

**AI / Text Generation:**
- **Anthropic Claude** — core AI engine for all generated content
  - SDK: `@anthropic-ai/sdk` 0.78.0
  - Auth: `ANTHROPIC_API_KEY` env var
  - Model 1: `claude-sonnet-4-6` — used in `lib/generate.ts` (daily briefing, 16k max_tokens) and `lib/podcast.ts` (podcast script, 2048 max_tokens)
  - Model 2: `claude-haiku-4-5-20251001` — used in `lib/quiz.ts` (24 quiz questions, 8k max_tokens), `lib/aptitude.ts` (aptitude bank generation), `lib/firm-pack.ts` (firm interview packs, 7-day cache)
  - Called only server-side from `lib/` and `app/api/` — never from client

**Web Search:**
- **Tavily** — news search for briefing generation
  - Auth: `TAVILY_API_KEY` env var
  - Used in: `lib/generate.ts` — 8 parallel queries at 06:00 UTC daily
  - Config: `search_depth: 'basic'`, `max_results: 5`, 800-char content limit per result, 12s timeout per request
  - Free tier: ~1,000 searches/month. Disabled via `USE_WEB_SEARCH=false` env var if needed.
  - Called via raw `fetch` to `https://api.tavily.com/search` (no SDK)

**Text-to-Speech:**
- **ElevenLabs** — podcast audio generation
  - Auth: `ELEVENLABS_API_KEY` env var
  - Used in: `app/api/podcast-audio/route.ts`
  - API endpoint: `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}` (raw fetch, no SDK)
  - Model: `eleven_multilingual_v2`
  - Voice: Daniel only — `onwK4e9ZLuTAKqWW03F9` (hardcoded default in `lib/podcast-storage.ts` and `app/api/podcast-audio/route.ts`)
  - Whitelist: 5 British voices defined in `lib/security.ts` `ALLOWED_VOICE_IDS`
  - Monthly budget: 100,000 characters tracked in Redis key `elevenlabs:chars:{YYYY-MM}` via `lib/char-usage.ts`
  - Budget check runs before every generation — skips audio if over limit
  - Creator tier (active): ~£17/month

## Data Storage

**Databases:**
- **Upstash Redis** (production) — primary data store
  - Connection: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  - Client: `@upstash/redis` 1.34.3, lazy-loaded via `require()` (avoids startup cost when Redis not available)
  - Backend detection pattern: `!!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)` — used in every lib module
  - Redis key schema:
    - `briefing:{YYYY-MM-DD}` — daily briefing JSON
    - `briefing:index` — sorted set of briefing dates (score = timestamp)
    - `quiz:{YYYY-MM-DD}` — daily quiz JSON
    - `podcast-script:{YYYY-MM-DD}` — podcast script text
    - `subscription:{userId}` — Stripe subscription data per Clerk user
    - `stripe-customer:{customerId}` → userId mapping
    - `stripe-event:{eventId}` — idempotency keys (48h TTL, SET NX)
    - `elevenlabs:chars:{YYYY-MM}` — monthly TTS character usage counter
    - `aptitude-bank:{testType}` — Watson Glaser / SJT question bank
    - `rl:{route}:{identifier}:{window}` — rate limiter counters (fixed-window)
    - `firm-pack:{slug}` — cached firm interview packs (7-day TTL)
    - `bookmark:{userId}:{storyId}` — user bookmarks
    - `note:{userId}:{storyId}` — user notes
    - `onboarding:{userId}` — onboarding state
    - `tracker:{userId}` — application tracker entries

- **Local filesystem** (development fallback)
  - Used when `UPSTASH_REDIS_REST_URL` is not set
  - All data written to `data/briefings/`, `data/subscriptions.json`, `data/firms/`
  - Briefings: `data/briefings/{YYYY-MM-DD}.json`
  - Quizzes: `data/briefings/{YYYY-MM-DD}-quiz.json`
  - Aptitude banks: `data/briefings/aptitude-bank-{testType}.json`
  - Podcast scripts: `data/briefings/{YYYY-MM-DD}-podcast.txt`
  - Podcast MP3s: `data/briefings/{YYYY-MM-DD}-podcast-{voiceId}.mp3`
  - Subscriptions: `data/subscriptions.json` (all users in one file)
  - Firm packs: `data/firms/{slug}-pack.json`
  - ElevenLabs usage: `data/el-usage.json`

**File Storage:**
- **Vercel Blob** (production) — MP3 audio file storage
  - Auth: `BLOB_READ_WRITE_TOKEN` env var
  - Client: `@vercel/blob` 2.3.1, dynamically imported via `await import('@vercel/blob')`
  - Backend detection: `!!process.env.BLOB_READ_WRITE_TOKEN`
  - Blob paths: `podcasts/{YYYY-MM-DD}-{voiceId}.mp3`
  - Cache-Control: 30 days (`cacheControlMaxAge: 86400 * 30`), public access
  - CDN domain: `*.public.blob.vercel-storage.com` (whitelisted in CSP `media-src` and `connect-src`)
  - Status: `BLOB_READ_WRITE_TOKEN` not yet configured in Vercel as of 2026-03-09

**Caching:**
- Redis serves as cache for all generated AI content (briefings, quizzes, podcast scripts, firm packs, aptitude banks)
- No separate caching layer — Redis IS the primary store in production

## Authentication & Identity

**Auth Provider:**
- **Clerk** — full authentication stack
  - SDK: `@clerk/nextjs` 6.39.0
  - App: "Folio Production" Clerk app using dev keys (`pk_test`/`sk_test`) pointing to `proven-yak-30.clerk.accounts.dev`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — public key for frontend
  - `CLERK_SECRET_KEY` — server-side key for `auth()` and `currentUser()` calls
  - Implementation:
    - `ClerkProvider` wraps entire app in `app/layout.tsx`
    - `clerkMiddleware` in `middleware.ts` — runs on all routes except `_next`, static files, and `/__clerk`
    - `/__clerk` rewrite in `next.config.ts` → `/api/clerk-proxy/` (kept for future production instance upgrade)
    - `auth()` used in API routes to get `userId`
    - `currentUser()` used in `app/api/stripe/checkout/route.ts` to get user email
  - CAPTCHA: Cloudflare Turnstile via `challenges.cloudflare.com` — whitelisted in CSP `script-src` and `frame-src`
  - Admin bypass: `ADMIN_USER_ID` env var checked in `lib/subscription.ts` `isSubscribed()` and `lib/paywall.ts`

## Payments & Billing

**Stripe** — subscription payments
  - SDK: `stripe` 20.4.0
  - Auth: `STRIPE_SECRET_KEY` env var
  - Product: Price ID `price_1T6rKa3l9MshmbvXJQ5qATOU` (£4/month), set via `STRIPE_PRICE_ID` env var
  - Checkout session: `app/api/stripe/checkout/route.ts` — creates hosted checkout session, stores `clerkUserId` in metadata
  - Billing portal: `app/api/stripe/portal/route.ts` — returns Stripe Customer Portal URL
  - Webhooks: `app/api/stripe/webhook/route.ts`
    - Verified via `stripe.webhooks.constructEvent()` using `STRIPE_WEBHOOK_SECRET`
    - Idempotency: Redis SET NX with 48h TTL on `stripe-event:{eventId}`
    - Events handled: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
    - On `checkout.session.completed`: saves subscription to Redis, maps customer→userId, sends welcome email via Resend
  - Weekly digest: `app/api/digest/route.ts` lists active subscribers via `stripe.subscriptions.list({ status: 'active' })`

## Email

**Resend** — transactional email
  - SDK: `resend` 6.9.3
  - Auth: `RESEND_API_KEY` env var
  - From address: `NEXT_PUBLIC_SITE_URL` → `Folio <hello@folioapp.co.uk>` (configured via `EMAIL_FROM` env var)
  - Emails sent from `lib/email.ts`:
    - Welcome email — triggered in `app/api/stripe/webhook/route.ts` on `checkout.session.completed`
    - Weekly digest — sent by `app/api/digest/route.ts` cron (Sunday 08:00 UTC) to all active Stripe subscribers
  - Free tier: 100 emails/day limit (noted in digest route with 100ms delay between sends)

## Monitoring & Observability

**Error Tracking:**
- None configured — errors logged via `console.error()` to Vercel function logs

**Logs:**
- `console.log` / `console.warn` / `console.error` with `[module-name]` prefixes (e.g. `[generate]`, `[podcast-audio]`, `[webhook]`)
- Vercel function logs accessible via Vercel dashboard

## CI/CD & Deployment

**Hosting:**
- Vercel Pro — required for 120s+ function timeouts
  - `app/api/podcast-audio/route.ts`: `export const maxDuration = 120`
  - `app/api/generate/route.ts`: `export const maxDuration = 300`
  - `app/api/digest/route.ts`: `export const maxDuration = 300`
- All pages rendered dynamically (`export const dynamic = 'force-dynamic'` in `app/layout.tsx`)

**CI Pipeline:**
- GitHub Actions (implied by git repo) — no custom workflow files detected in root
- ESLint runs on build via `next lint`

## Webhooks & Callbacks

**Incoming:**
- `POST /api/stripe/webhook` — Stripe lifecycle events (subscription created/updated/deleted, checkout completed)
  - Signature verification via `STRIPE_WEBHOOK_SECRET`
  - Idempotency via Redis SET NX (48h TTL)

**Outgoing:**
- None — all external calls are request-initiated, not event-driven outbound webhooks

## Environment Configuration

**Required env vars (production):**
- `ANTHROPIC_API_KEY` — Claude API access
- `TAVILY_API_KEY` — News search
- `ELEVENLABS_API_KEY` — TTS audio generation
- `UPSTASH_REDIS_REST_URL` — Redis connection URL
- `UPSTASH_REDIS_REST_TOKEN` — Redis auth token
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob for MP3 storage
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_SECRET_KEY` — Clerk server key
- `STRIPE_SECRET_KEY` — Stripe server key
- `STRIPE_PRICE_ID` — Stripe monthly price ID
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signature verification
- `RESEND_API_KEY` — Email sending
- `CRON_SECRET` — Auth for Vercel cron requests to `/api/generate` and `/api/digest`
- `ADMIN_USER_ID` — Clerk user ID for admin bypass (skips subscription checks)
- `NEXT_PUBLIC_APP_URL` — Used in Stripe checkout success/cancel redirect URLs
- `NEXT_PUBLIC_SITE_URL` — Used in email links and weekly digest CTA

**Dev-only env vars (`.env.local`):**
- `PREVIEW_MODE=true` — bypasses all Clerk auth and Stripe subscription checks

**Secrets location:**
- `.env.local` for development (not committed)
- Vercel Environment Variables dashboard for production

---

*Integration audit: 2026-03-09*
