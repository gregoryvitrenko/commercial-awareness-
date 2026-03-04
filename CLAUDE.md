# Commercial Awareness Daily — Project Brief

## What this is
A daily commercial awareness briefing tool for UK law students targeting Magic Circle and US firm training contracts. Subscription product at £4/month. Built by the owner (LLB student) who will handle marketing via LinkedIn, university law societies, and peer networks.

## Product vision
Clean, newspaper-style design (dark mode default). The free tier is genuinely good — compelling enough that users clearly see the value in upgrading. The quiz and audio briefing are the two premium features most likely to convert free users.

---

## Tech stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 3 — stone palette for content, zinc palette for UI chrome (archive, quiz nav, etc.)
- **Fonts**: JetBrains Mono (mono), Inter (sans), serif for headings
- **AI generation**: Groq SDK (`llama-3.3-70b-versatile`) — free tier
- **Web search**: Tavily API (5 parallel queries) — free tier, 1,000 searches/month
- **Storage**: Upstash Redis (production) / local filesystem (dev) — dual-backend pattern in `lib/storage.ts`
- **Icons**: lucide-react
- **Theme**: next-themes

### Planned additions (not yet built)
- **Auth**: Clerk (free up to 10k MAU)
- **Payments**: Stripe (Checkout, subscriptions, webhooks)
- **Audio (TTS)**: ElevenLabs Creator plan (100k chars/month, ~£17/mo) — human voice only
- **Email**: Resend (free tier, transactional)
- **Deployment**: Vercel Pro (~£16/mo) for reliable cron + function timeouts

---

## Key file locations
- `lib/types.ts` — all TypeScript interfaces + TOPIC_STYLES colour config
- `lib/storage.ts` — dual-backend storage (Redis/FS) for briefings and quizzes
- `lib/generate.ts` — Tavily search → Groq synthesis → briefing JSON
- `lib/quiz.ts` — Groq-based quiz generation (3 questions/story, 18 total)
- `app/api/generate/route.ts` — POST (manual trigger) + GET (Vercel cron at 08:30 UTC)
- `app/api/quiz/route.ts` — POST, generates and caches quiz for a date
- `data/briefings/` — local JSON files (YYYY-MM-DD.json, YYYY-MM-DD-quiz.json)
- `.claude/launch.json` — dev server config (npm run dev, port 3001)

---

## Features built
| Feature | Status | Route |
|---------|--------|-------|
| Daily briefing (6 stories, 6 topics) | ✅ | `/` |
| Topic filter tabs | ✅ | `/topic/[slug]` |
| Full article view | ✅ | `/story/[id]` |
| Dark/light mode toggle | ✅ | header |
| Archive (past briefings) | ✅ | `/archive`, `/archive/[date]` |
| Daily quiz (18 questions, cached) | ✅ | `/quiz`, `/quiz/[date]` |
| Bookmarks + notes (localStorage) | ✅ | `/saved` |
| Interview angle teaser on cards | ✅ | story cards |
| Quiz date navigation | ✅ | quiz pages |
| Audio briefing (ElevenLabs) | ❌ not built | TBD |
| User auth (Clerk) | ✅ built | sign-in/sign-up pages, middleware, AuthButtons in header |
| Stripe subscription | ❌ not built | — |
| Paywall middleware | ❌ not built | — |
| Server-side bookmarks (post-auth) | ❌ not built | — |

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

**Launch promotion**: Free full access for first 15 days from launch date (hardcoded date in config). After that, free tier applies.

---

## Topic categories + colours
- M&A → blue
- Capital Markets → violet
- Energy & Tech → emerald
- Regulation → amber
- Disputes → rose
- International → cyan

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
| Clerk, Stripe, Upstash, Groq, Tavily | £0 (free tiers) |
| **Total** | **~£34/mo** |

Owner budget cap: £50/month (excluding Claude subscription).

---

## ElevenLabs audio constraints
- 100,000 characters/month hard limit
- Target script length per briefing: ~3,000 characters max
- Character usage tracked in Redis: `elevenlabs:chars:{YYYY-MM}`
- Before generation: check budget. If script would exceed monthly remaining, skip audio for that day.
- Audio cached as file alongside briefing — generated once, served indefinitely.

---

## Build order (remaining)
1. **Clerk auth** — sign up/sign in pages, session middleware, user identification. Foundation everything else depends on.
2. **Stripe integration** — subscription product (£4/mo), Checkout flow, webhooks, store subscription status in Redis (`subscription:{userId}`)
3. **Paywall middleware** — Next.js middleware gates premium routes. Free users see upgrade prompts. Launch promo: full access for accounts created within 15 days of launch date (hardcoded in config).
4. **Pricing/landing page** — conversion page explaining free vs paid
5. **Server-side bookmarks** — migrate from localStorage to Redis per user (key: `bookmarks:{userId}`)
6. **Audio briefing** — ElevenLabs TTS (human voice, Creator plan 100k chars/mo). Script = headline + summary + why it matters per story (~2,800 chars/day). Character usage tracked in Redis (`elevenlabs:chars:{YYYY-MM}`). Guard prevents exceeding monthly limit. Player UI on briefing page. Premium only. **Note: ElevenLabs subscription not yet purchased — build code with graceful fallback when ELEVENLABS_API_KEY env var is absent.**
7. **Welcome email** — Resend, triggered on subscription activation

## Audio briefing spec (ElevenLabs)
- Script content: intro + (headline + summary + why it matters) × 6 stories + outro
- Target length: ~2,800 characters per briefing (fits comfortably in 100k/month)
- Voice: human-sounding ElevenLabs voice (to be chosen when subscription is purchased)
- Generation: triggered once per day alongside briefing generation, cached as audio file
- Character tracking: Redis key `elevenlabs:chars:{YYYY-MM}`, incremented after each generation
- Safety guard: if remaining monthly chars < script length, skip audio generation (briefing still works)
- Upgrade path: when revenue justifies it, move to Pro plan (500k chars/mo ~£78/mo)
