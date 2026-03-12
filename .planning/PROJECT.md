# Folio

## What This Is

Folio is a daily briefing tool for UK law students targeting Magic Circle, Silver Circle, National, and US firm training contracts. It delivers AI-generated news briefings, quizzes, firm interview packs (46 firms), aptitude tests, sector primers with interview questions, an audio podcast, and AI-curated legal events — all focused on commercial awareness. Subscription product at £4/month with a viral referral system, built and marketed by the owner (LLB student).

## Core Value

Students who use Folio daily walk into TC interviews knowing what's happening in the market and how to talk about it — giving them a credible edge over unprepared candidates.

## Requirements

### Validated

- ✓ Daily briefing (8 stories, 8 topics) — v1
- ✓ Topic filter tabs — v1
- ✓ Full article view with analysis and talking points (premium) — v1
- ✓ Dark/light mode toggle — v1
- ✓ Archive (past briefings, premium) — v1
- ✓ Daily quiz (24 questions, cached, premium) — v1
- ✓ Quiz streak (daily) + deep practice — v1
- ✓ Bookmarks + notes (server-side Redis, premium) — v1
- ✓ Podcast player (ElevenLabs Daniel voice, premium) — v1
- ✓ Firm profiles (46 firms) + interview packs (premium) — v1.1
- ✓ Sector primers (8 topics) with interview Qs + answer skeletons (premium) — v1.1
- ✓ Aptitude tests: Watson Glaser + SJT (premium) — v1
- ✓ Onboarding flow — v1
- ✓ User auth (Clerk) — v1
- ✓ Stripe subscription (£4/mo) + paywall — v1
- ✓ Welcome email (Resend) — v1
- ✓ Contextual upgrade nudges — v1
- ✓ Cron auto-generation (06:00 UTC daily) — v1
- ✓ Mobile-first responsive header + hamburger nav — v1.1
- ✓ Podcast archive + cron MP3 pre-generation — v1.1
- ✓ AI-curated events section (city filter, .ics export, free tier) — v1.1
- ✓ GDPR-compliant weekly digest (List-Unsubscribe, Haiku subjects) — v1.1
- ✓ Viral referral system (codes, cookies, Stripe coupon rewards) — v1.1

### Active

- [ ] Logo/wordmark — proper brand mark, not just text
- [ ] Social proof — trust signals: student count, testimonials, or credibility cues (live data when available)
- [ ] Conversion feature — TBD once user base exists to identify the actual gap
- [ ] Trainee experience on firm profiles — "Culture & Experience" section per firm
- [ ] Firm interview packs: PDF export

### Out of Scope

- Multi-voice audio — multiplies ElevenLabs spend against 100k/month cap
- Native mobile app — web-first, no revenue to justify native yet
- Real-time features (live feed, push notifications) — complexity vs. value unclear
- Custom Clerk production instance — requires domain transfer off Cloudflare; dev keys work fine

## Current State

- **v1.0 shipped:** 2026-03-10 — Design token system, editorial polish, conversion surfaces, analytics, bug fixes
- **v1.1 shipped:** 2026-03-12 — Mobile responsive, 46 firms, podcast archive, primer interview Qs, events section, GDPR digest, referral system
- **Live product**: folioapp.co.uk, Vercel Pro
- **Active services**: Clerk auth, Stripe payments, Upstash Redis, ElevenLabs TTS, Tavily search, Resend email
- **Infrastructure budget**: ~£34/month. Owner budget cap £50/month.
- **ElevenLabs**: 100k chars/month (Creator tier). Daniel voice only. MP3s cached in Vercel Blob.
- **Cron jobs**: Daily briefing (06:00 UTC), events (Mon + Thu 07:00 UTC), digest (Sun 08:00 UTC)
- **Marketing channel**: LinkedIn, university law societies, peer networks. Design + content now ready for serious push.

## Constraints

- **Budget**: £50/month max infra. Services at free tier limits. No paid design tools.
- **ElevenLabs**: 100k chars/month hard cap. Audio generation must stay within budget.
- **Tech stack**: Next.js 15, React 19, TypeScript, Tailwind CSS. No stack changes.
- **Auth**: Clerk dev keys (proven-yak-30.clerk.accounts.dev). Production keys require domain transfer off Cloudflare.
- **Solo operator**: Owner handles dev, marketing, support. Solutions must be maintainable by one person.
- **No emojis in UI**: Design language is minimal, newspaper feel. No decorative emoji.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Newspaper/editorial direction for design | Matches the content (legal news briefings) and target audience (serious law students) | ✓ Good |
| Daniel voice only (ElevenLabs) | Multi-voice multiplies monthly spend against 100k cap | ✓ Good |
| Clerk dev keys (not production) | Cloudflare CNAME conflict blocks production instance; dev keys work without proxy | ✓ Good |
| Stone/zinc Tailwind palette | Content areas (stone) vs. UI chrome (zinc) — consistent with editorial feel | ✓ Good |
| Design lift before heavy marketing | Site must feel premium before driving paid signups | ✓ Good |
| National tier (rose) for large UK firms | Distinguishes from Silver Circle; rose accent aligns with Tailwind palette | ✓ Good |
| Events free tier (no paywall) | Growth feature — attracts users before asking for money | ✓ Good |
| Unsubscribe keyed by email not userId | Simpler for digest route which already has emails from Stripe | ✓ Good |
| Tavily news topic + days:1 for freshness | Prevents stale articles in daily briefings | ✓ Good |
| Conversion feature deferred | No user data yet to identify actual friction point | — Pending |

---
*Last updated: 2026-03-12 after v1.1 milestone completion*
