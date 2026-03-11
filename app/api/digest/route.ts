import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import Anthropic from '@anthropic-ai/sdk';
import { listBriefings, getBriefing } from '@/lib/storage';
import { sendWeeklyDigest, buildUnsubscribeUrl, type DigestStory } from '@/lib/email';

export const maxDuration = 300; // 5 min — sending to many recipients

// ── Auth: cron secret ────────────────────────────────────────────────────────

function isAuthorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

// ── Opt-out check ────────────────────────────────────────────────────────────

async function isOptedOut(email: string): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const val = await redis.get(`email-opt-out:${email.toLowerCase()}`);
  return val !== null;
}

// ── Claude Haiku subject line generation ─────────────────────────────────────

async function generateSubjectLine(headlines: string[]): Promise<string | null> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = `You are writing a subject line for a weekly email digest for UK law students preparing for training contract interviews. The digest covers the following stories:\n\n${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nWrite ONE email subject line. Requirements:\n- Under 60 characters\n- Editorial style (like a newspaper headline, not a marketing email)\n- References the most compelling story\n- No quotation marks, no "Re:", no "FW:"\n- Return only the subject line text, nothing else`;

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : null;
    if (!text || text.length === 0 || text.length > 80) return null;
    return text;
  } catch {
    return null;
  }
}

// ── GET: Vercel cron-triggered weekly digest ─────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  // ── 1. Collect this week's stories ──────────────────────────────────────

  const allDates = await listBriefings();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentDates = allDates
    .filter((d) => new Date(d) >= weekAgo)
    .sort((a, b) => a.localeCompare(b));

  if (recentDates.length === 0) {
    return NextResponse.json({ sent: 0, note: 'No briefings this week' });
  }

  // Build digest stories: pick 1 top story per day (first story = most important)
  // De-duplicate: track first-5-word fingerprints; same opener across days = same deal, keep most recent
  const digestStories: DigestStory[] = [];
  const seenFingerprints = new Set<string>();

  for (const date of recentDates) {
    const briefing = await getBriefing(date);
    if (!briefing) continue;
    // Take up to 2 stories per day to fill the digest (max ~14 stories for 7 days)
    for (const story of briefing.stories.slice(0, 2)) {
      // Fingerprint: lowercase first 5 words, strip punctuation
      const fingerprint = story.headline
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .slice(0, 5)
        .join(' ');
      if (seenFingerprints.has(fingerprint)) continue; // duplicate — skip
      seenFingerprints.add(fingerprint);
      digestStories.push({
        headline: story.headline,
        topic: story.topic,
        summary: story.summary,
        date: briefing.date,
      });
    }
  }

  // Cap at 10 stories max (enough for a scannable email)
  const topStories = digestStories.slice(0, 10);

  // Week label: "24 Feb – 2 Mar 2026"
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekLabel = `${fmt(weekAgo)} – ${fmt(now)} ${now.getFullYear()}`;

  // Generate editorial subject line via Claude Haiku, fall back to template
  const headlines = topStories.map((s) => s.headline);
  const aiSubject = await generateSubjectLine(headlines);
  const subject = aiSubject ?? `${topStories[0]?.headline ?? 'This week in law'} + ${topStories.length - 1} more`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.folioapp.co.uk';

  // ── 2. Get active subscribers from Stripe ───────────────────────────────

  const stripe = new Stripe(stripeKey);
  const emails: string[] = [];

  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const params: Stripe.SubscriptionListParams = {
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
    };
    if (startingAfter) params.starting_after = startingAfter;

    const subs = await stripe.subscriptions.list(params);

    for (const sub of subs.data) {
      const customer = sub.customer as Stripe.Customer;
      if (customer?.email) {
        emails.push(customer.email);
      }
    }

    hasMore = subs.has_more;
    if (subs.data.length > 0) {
      startingAfter = subs.data[subs.data.length - 1].id;
    }
  }

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, note: 'No active subscribers' });
  }

  // ── 3. Send digest to each subscriber ───────────────────────────────────

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  // Resend free tier: 100/day. Batch with small delay to avoid rate limits.
  for (const email of emails) {
    // Check GDPR opt-out before sending
    const optedOut = await isOptedOut(email);
    if (optedOut) {
      skipped++;
      continue;
    }

    const unsubUrl = buildUnsubscribeUrl(email, siteUrl);
    const result = await sendWeeklyDigest(email, topStories, weekLabel, subject, unsubUrl);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    // 100ms delay between sends to respect rate limits
    if (emails.length > 10) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  console.log(`[digest] Weekly digest sent: ${sent} ok, ${failed} failed, ${skipped} skipped opt-out (${emails.length} total subscribers)`);

  return NextResponse.json({ sent, failed, skipped, total: emails.length });
}
