# Milestones

## v1.1 Content & Reach (Shipped: 2026-03-12)

**Phases:** 7–12 (6 phases, 13 plans + 1 quick)
**Timeline:** 2 days (2026-03-10 → 2026-03-12)
**Stats:** 82 files changed, 10,536 insertions

**What shipped:**
- Mobile-first responsive header — hamburger menu, opaque scroll background, touch-friendly nav at 375px
- 46 firm profiles — 8 new firms across National (rose) and US (amber) tiers
- Podcast archive + cron MP3 pre-generation — Blob storage, quiz backfill, ElevenLabs budget guard
- 16 sector-specific interview questions — Commercial Reasoning format across all 8 primers
- AI-curated events section — Tavily search, city filter tabs, .ics calendar export, free tier
- GDPR-compliant weekly digest — HMAC unsubscribe, List-Unsubscribe headers, Haiku editorial subjects
- Viral referral system — 8-char codes, cookie tracking, Stripe coupon rewards every 3rd referral

**Key decisions locked:**
- National tier (rose accent) for large full-service UK firms
- Events free tier (no paywall) — growth feature
- Unsubscribe keyed by email (not userId) — simpler for digest route
- Daniel voice only maintained (ElevenLabs 100k/month cap)
- Tavily `topic: 'news'` + `days: 1` for briefing freshness

---

## v1.0 — Market-Ready Design Lift
**Completed:** 2026-03-10
**Phases:** 6 (phases 1–6)
**Plans:** 17

**What shipped:**
- Design token foundation (type scale, radius, CSS vars, dark mode)
- Token-compliant header + site footer on every page
- StoryCard, ArticleStory, BriefingView polished to editorial register
- Upgrade page stone palette + outcome-framed copy + social proof placeholders
- All utility pages (Archive, Firms, Quiz, Tests, Primers) on token system
- Vercel Analytics + conversion funnel events
- Bug fixes: double footer, closed firm deadlines, quiz index
- Content quality: stronger talking points + quiz questions (Commercial Inference, Law Firm Angle, Interview So-What)

**Key decisions locked:**
- Stone/zinc palette (content vs. chrome separation)
- Semantic type scale (display, heading, subheading, body, caption, label)
- Border radius tokens (card=0.5rem, chrome=0.375rem, pill=9999px, input=0.25rem)
- hover:bg-* pattern (never hover:opacity-*)
- bg-paper token for dark-mode-aware backgrounds
- Daniel voice only (ElevenLabs)

---
