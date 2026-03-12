# Phase 12 Context: Digest Compliance + Improvements

**Phase goal:** Ship GDPR-compliant weekly digest with editorial subject lines, referral system, and working unsubscribe — all in one deployment.

**Requirements:** DIGEST-01 (digest working), DIGEST-02 (unsubscribe/GDPR), DIGEST-03 (subject lines + referral CTA)

---

## Decisions

### 1. Unsubscribe UX

- **Flow:** Instant one-click unsubscribe. `GET /api/unsubscribe?token=X` immediately sets `email-opt-out:{userId}` in Redis and renders a branded confirmation page.
- **No confirmation step** — regulators frown on friction in unsubscribe flows. GDPR Article 7(3) requires withdrawal of consent to be as easy as giving it.
- **Token security:** HMAC-signed token using `CRON_SECRET` as the signing key. URL format: `/api/unsubscribe?uid={userId}&sig={hmac(userId, CRON_SECRET)}`. Prevents third parties from unsubscribing others by guessing userIds.
- **Confirmation page:** Branded with Folio header/footer and stone palette. Shows "You've been unsubscribed" message. No re-subscribe link needed (they can just resubscribe via the site).
- **Implementation:** The unsubscribe page is a Next.js page (`app/unsubscribe/page.tsx`) that reads query params, validates the HMAC, sets Redis key, and renders confirmation. The API route (`app/api/unsubscribe/route.ts`) handles the Redis write and redirects to the page.
- **Digest route change:** Before sending each email, check `email-opt-out:{userId}` in Redis. Skip opted-out users. This requires mapping Stripe customer email → userId (or keying opt-out by email directly).
- **Key decision: opt-out keyed by email** (not userId) — simpler because the digest route already has emails from Stripe. Redis key: `email-opt-out:{email}`.
- **Email headers:** Add `List-Unsubscribe` and `List-Unsubscribe-Post` headers to every digest email via the Resend API `headers` parameter.
- **Footer update:** Replace current "Manage your subscription from account settings" with a literal "Unsubscribe from this digest" link pointing to the signed unsubscribe URL.

### 2. Subject Line Strategy

- **Style:** Claude-generated editorial hooks. One punchy sentence that makes the reader want to open.
- **Generation:** During the digest cron, after collecting the week's stories, call Claude Haiku with the 10 story headlines and ask for a single email subject line (max 60 chars). Example output: "CMA blocked another deal. Here's what it means for your interviews."
- **Fallback:** If the Haiku call fails, fall back to the templated format: `"{top headline} + {N-1} more stories"`.
- **Cost:** ~200 input tokens + ~30 output tokens per week = ~$0.001/week. Negligible.
- **Model:** `claude-haiku-4-5-20251001` (same as quiz generation).

### 3. Referral System

- **Scope:** Full referral system with unique links, Redis tracking, and Stripe coupon rewards.
- **Referral link format:** `https://www.folioapp.co.uk/?ref={referralCode}` where referralCode is a short unique string per user.
- **Storage:**
  - `referral:{referralCode}` → userId (maps code to referrer)
  - `referral-count:{userId}` → integer (number of successful referrals)
  - `referred-by:{newUserId}` → referrerUserId (tracks who referred whom, prevents double-counting)
- **Referral code generation:** 8-character alphanumeric, generated on first request (lazy). Stored in `referral-code:{userId}` → code.
- **Successful referral trigger:** New user becomes a paying Stripe subscriber AND was referred (has `referred-by` key). Checked in the Stripe webhook handler (`checkout.session.completed` or `customer.subscription.created`).
- **Reward:** Free month per 3 successful referrals. When `referral-count:{userId}` hits a multiple of 3, create a Stripe coupon (100% off, 1 month, single-use) and apply it to the referrer's subscription.
- **Referral tracking on sign-up:** When a user visits with `?ref=X`, store the referral code in a cookie (`folio-ref`, 30-day expiry). On Stripe checkout completion, read the cookie and record the referral.
- **Email CTA placement:** After stories, before footer. Styled block with the user's unique referral link and copy: "Share Folio with a friend. Get a free month when 3 friends subscribe."
- **Referral link in digest:** Each email includes the referrer's unique link. This means the digest route needs to look up each user's referral code when sending.

### 4. Digest Story De-duplication

- **Not a user-facing decision** but noted for planning: the digest currently takes first 2 stories from each day's briefing. Stories about the same underlying deal across multiple days should be de-duped by checking `story.firms[]` overlap (2+ shared firms = duplicate, keep the more recent one).

---

## Code Context

### Existing files to modify:
- `lib/email.ts` — Add `List-Unsubscribe` headers to `sendWeeklyDigest()`, update footer HTML, add referral CTA block
- `app/api/digest/route.ts` — Add opt-out check before sending, add Claude Haiku subject line generation, look up referral codes, de-duplicate stories
- `app/api/webhooks/stripe/route.ts` — Add referral tracking on successful subscription (read cookie, record referral, check reward threshold, apply coupon)

### New files to create:
- `app/unsubscribe/page.tsx` — Branded unsubscribe confirmation page
- `app/api/unsubscribe/route.ts` — HMAC validation + Redis opt-out write
- `lib/referral.ts` — Referral code generation, lookup, counting, Stripe coupon creation

### Existing patterns to follow:
- Redis key naming: `{feature}:{identifier}` (matches `email-opt-out:{email}`, `subscription:{userId}`)
- HMAC signing: Use Node.js `crypto.createHmac('sha256', secret)` — no npm package needed
- Stripe API: Already using `stripe` package in `app/api/digest/route.ts` and webhook handler
- Claude Haiku calls: Pattern established in `lib/quiz.ts` — create Anthropic client, call `messages.create()` with `claude-haiku-4-5-20251001`

---

## Deferred Ideas

- **Referral dashboard page** — A `/referrals` page showing the user their referral stats, link, and reward progress. Not in Phase 12 scope; the email CTA is sufficient for launch.
- **Resend free tier cap** — Hard-cap sends at 90/day. Not blocking Phase 12 (subscriber count is low) but should be added when approaching 80 subscribers.

---

*Context gathered: 2026-03-11*
*Phase boundary: DIGEST-01, DIGEST-02, DIGEST-03 + referral system*
