# Folio — Project Brief

## What this is
A daily briefing tool for UK law students targeting Magic Circle and US firm training contracts. Subscription product at £4/month. Built by the owner (LLB student) who will handle marketing via LinkedIn, university law societies, and peer networks.

## Product vision
Clean, newspaper-style design (light mode default, dark opt-in). The free tier is genuinely good — compelling enough that users clearly see the value in upgrading. The quiz and audio briefing are the two premium features most likely to convert free users.

---

## Tech stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 3 — stone palette for content, zinc palette for UI chrome
- **Fonts**: JetBrains Mono (mono), Inter (sans), serif for headings
- **AI generation**: Anthropic SDK — `claude-sonnet-4-6` for briefings, `claude-haiku-4-5-20251001` for quiz + firm packs + aptitude banks
- **Web search**: Tavily API (8 parallel queries, 800 char content limit) — free tier, 1,000 searches/month
- **Storage**: Upstash Redis (production) / local filesystem (dev) — dual-backend pattern in `lib/storage.ts`
- **Auth**: Clerk (ClerkProvider in layout.tsx, clerkMiddleware in middleware.ts)
- **Payments**: Stripe — Price ID `price_1T6rKa3l9MshmbvXJQ5qATOU` (£4/month), webhooks, subscription status in Redis
- **Audio (TTS)**: ElevenLabs Creator tier (100k chars/month) — **active, API key in .env.local**. **Voice locked to Daniel only** (`onwK4e9ZLuTAKqWW03F9`) — multi-voice would multiply ElevenLabs spend against the 100k/month cap. No voice picker UI in PodcastPlayer.tsx.
- **Email**: Resend — welcome email triggered on subscription activation
- **Icons**: lucide-react
- **Theme**: next-themes (defaultTheme="light")
- **UI components**: shadcn/ui (Stone base colour), `lib/utils.ts` has `cn()`

---

## Key file locations
- `lib/types.ts` — all TypeScript interfaces + TOPIC_STYLES colour config
- `lib/storage.ts` — dual-backend storage (Redis/FS) for briefings, quizzes, aptitude banks
- `lib/generate.ts` — Tavily search (8 queries) → claude-sonnet-4-6 synthesis → briefing JSON
- `lib/quiz.ts` — claude-haiku quiz generation (3 questions/story, 24 total for 8 stories)
- `lib/podcast.ts` — ElevenLabs TTS script generation + per-voice MP3 caching
- `lib/char-usage.ts` — ElevenLabs character budget tracking
- `lib/firm-pack.ts` — AI interview Qs + "Why This Firm?" crib sheet per firm (7-day cache)
- `lib/aptitude.ts` — Watson Glaser + SJT question bank generation
- `lib/subscription.ts` — dual-backend subscription status (Redis key: `subscription:{userId}`)
- `lib/paywall.ts` — `requireSubscription()` / `getSubscriptionStatus()`. PREVIEW_MODE=true bypasses all checks in dev.
- `lib/rate-limit.ts` — Redis fixed-window rate limiter; fails open in dev (no Redis)
- `lib/security.ts` — `isValidDate()`, `isValidStoryId()` validators
- `lib/firms-data.ts` — 38 firm profiles across 5 tiers
- `lib/onboarding.ts` — OnboardingData (stage, targetFirms[], completedAt)
- `app/api/generate/route.ts` — POST (admin-only) + GET (Vercel cron at 06:00 UTC). Generates: briefing + quiz + podcast script + aptitude bank refresh (last 3 fire-and-forget).
- `app/api/quiz/route.ts` — POST, generates and caches quiz for a date (premium, subscription-gated)
- `app/api/podcast-audio/route.ts` — GET, generates/serves ElevenLabs MP3 per voice
- `data/briefings/` — local JSON files (YYYY-MM-DD.json, YYYY-MM-DD-quiz.json, aptitude-bank-{type}.json)
- `vercel.json` — cron at "0 6 * * *" (06:00 UTC)
- `.claude/launch.json` — dev server config (npm run dev, port 3001)

---

## Features built
| Feature | Status | Route |
|---------|--------|-------|
| Daily briefing (8 stories, 8 topics) | ✅ | `/` |
| Topic filter tabs | ✅ | `/topic/[slug]` |
| Full article view | ✅ | `/story/[id]` |
| Dark/light mode toggle | ✅ | header |
| Archive (past briefings) | ✅ | `/archive`, `/archive/[date]` |
| Daily quiz (24 questions, cached) | ✅ | `/quiz`, `/quiz/[date]` |
| Quiz streak (daily 🔥) + deep practice (⚡) | ✅ | `/quiz` |
| Bookmarks + notes (server-side Redis) | ✅ | `/saved` |
| Podcast player (ElevenLabs, Daniel voice) | ✅ | `/podcast` |
| Firm profiles (38 firms) + interview packs | ✅ | `/firms`, `/firms/[slug]` |
| Sector primers (8 topics) | ✅ | `/primers`, `/primers/[slug]` |
| Aptitude tests (Watson Glaser + SJT) | ✅ | `/tests`, `/tests/[slug]/practice` |
| Onboarding flow | ✅ | `/onboarding` |
| User auth (Clerk) | ✅ | sign-in/sign-up, middleware |
| Stripe subscription (£4/mo) | ✅ | `/upgrade`, checkout, webhooks |
| Paywall (requireSubscription) | ✅ | all premium routes |
| Contextual upgrade nudges | ✅ | story cards, mid-grid |
| Copy link button | ✅ | article pages |
| Scroll to top | ✅ | all pages |
| Welcome email (Resend) | ✅ | on subscription activation |

---

## Free vs paid tier
| Feature | Free | Paid (£4/mo) |
|---------|------|-------------|
| Daily briefing cards (headlines + excerpt + interview teaser) | ✅ | ✅ |
| Audio briefing (ElevenLabs, human voice) | ❌ | ✅ |
| Full article (analysis, talking points, why it matters) | ❌ | ✅ |
| Daily quiz | ❌ | ✅ |
| Archive | ❌ | ✅ |
| Bookmarks + notes | ❌ | ✅ |
| Firm packs + aptitude tests | ❌ | ✅ |

**Launch promotion**: Free full access for first 15 days from launch date (hardcoded date in config). After that, free tier applies.

---

## Topic categories + colours (8 topics)
- M&A → blue
- Capital Markets → violet
- Banking & Finance → orange
- Energy & Tech → emerald
- Regulation → amber
- Disputes → rose
- International → teal
- AI & Law → indigo

---

## Design principles
- Stone palette for content areas, zinc for UI chrome (archive/quiz nav cards)
- `rounded-xl` + `border border-zinc-200 dark:border-zinc-800` for card containers
- `font-mono text-[10px] tracking-widest uppercase text-zinc-400` for section labels
- `divide-y divide-zinc-100 dark:divide-zinc-800` for list rows inside cards
- Page headings: icon (lucide, size 16, text-zinc-400) + bold title + count badge
- No emojis. Minimal. Newspaper feel.

---

## Infrastructure budget (monthly)
| Service | Cost |
|---------|------|
| Vercel Pro | ~£16 |
| ElevenLabs Creator (100k chars) | ~£17 |
| Domain (.co.uk) | ~£1 |
| Clerk, Stripe, Upstash, Anthropic, Tavily, Resend | £0 (free tiers) |
| **Total** | **~£34/mo** |

Owner budget cap: £50/month (excluding Claude subscription).

---

## ElevenLabs audio constraints
- **Status: ACTIVE** — Creator tier, 100,000 characters/month. API key is in `.env.local`.
- Target script length per briefing: ~2,800 characters (intro + 8 stories + outro)
- Character usage tracked in Redis: `elevenlabs:chars:{YYYY-MM}` (see `lib/char-usage.ts`)
- Before generation: check remaining budget. If script would exceed monthly remaining, skip audio for that day (briefing still works).
- Audio cached as MP3 per voice — generated once, served indefinitely.
- **Voice locked to Daniel** (`onwK4e9ZLuTAKqWW03F9`). No voice picker. Multi-voice would multiply monthly spend.
- Upgrade path: when revenue justifies it, move to Pro plan (500k chars/mo ~£78/mo)

---

## Cron auto-generation (06:00 UTC daily)
`vercel.json` schedules `GET /api/generate` at `"0 6 * * *"`. This generates:
1. **Briefing** — Tavily search + claude-sonnet-4-6 synthesis (awaited)
2. **Quiz** — claude-haiku-4-5 (fire-and-forget, uses saved briefing)
3. **Podcast script** — ElevenLabs-ready script (fire-and-forget)
4. **Aptitude banks** — refreshed if >7 days stale (fire-and-forget)

Requires `CRON_SECRET` env var set in Vercel — GET handler checks `Authorization: Bearer {CRON_SECRET}`.

---

## Dev environment
- **PREVIEW_MODE=true** in `.env.local` bypasses all auth + subscription checks
- Rate limiting uses `userId ?? 'preview-dev'` as fallback key in dev
- Dev server: `npm run dev` on port 3001 (see `.claude/launch.json`)
- **⚠️ NEVER start dev server from within Claude Code** — Claude Desktop injects empty ANTHROPIC_API_KEY, overriding .env.local. Use Terminal.app instead.
- **⚠️ DO NOT use preview tools for API-only changes** (`app/api/**`, `lib/**`). These routes require live Vercel infrastructure (Redis, Blob, ElevenLabs) and cannot be verified locally. For API changes: commit, push, and test on the live site. Preview tools are only useful for UI/component changes.

---

## Security
- `lib/rate-limit.ts` — Redis fixed-window limiter on all API routes
- API-level subscription enforcement on premium routes (not just page-level)
- Stripe webhook: idempotency via Redis SET NX (48h TTL)
- Input validation: storyId/date validated with `lib/security.ts` before DB access
- CSP header in `next.config.ts`; HSTS + upgrade-insecure-requests are production-only
- `robots.txt` blocks premium routes

---

## Priority backlog
1. **Primers: sample interview Qs + answer skeletons** per primer
2. **Firm interview packs: PDF export** — print-friendly from firm profile page
3. **Firm filter in archive**
4. **Site footer** — feedback link, terms/privacy, contact/LinkedIn
5. **Podcast archive** — `/podcast/archive` listing page
6. **Weekly email digest** (Resend, viral loop)
