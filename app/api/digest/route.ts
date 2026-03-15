import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { listBriefings, getBriefing } from '@/lib/storage';
import { sendWeeklyDigest, buildUnsubscribeUrl, type DigestStory } from '@/lib/email';
import { getOrCreateReferralCode } from '@/lib/referral';
import { getUserIdByCustomer } from '@/lib/subscription';

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
  // Dynamic import to avoid bundling Redis in edge
  const { Redis } = await import('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const val = await redis.get(`email-opt-out:${email.toLowerCase()}`);
  return val !== null;
}

const TOPICS = ['M&A', 'Capital Markets', 'Banking & Finance', 'Energy & Tech', 'Regulation', 'Disputes', 'International', 'AI & Law'] as const;

// ── AI: pick best story per practice area + generate subject line ─────────────

interface RankedStories {
  topStories: DigestStory[];
  subject: string;
}

async function rankStoriesAndSubject(
  allStories: DigestStory[],
  weekLabel: string,
): Promise<RankedStories> {
  const fallbackSubject = `${allStories[0]?.headline ?? 'This week in law'} + more`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const storiesJson = allStories.map((s, i) => ({
      index: i,
      topic: s.topic,
      headline: s.headline,
      summary: s.summary.slice(0, 120),
    }));

    const prompt = `You are a commercial law editor preparing a weekly digest for UK law students targeting training contract interviews. The digest covers the week of ${weekLabel}.

Here are all stories published this week (JSON array):
${JSON.stringify(storiesJson, null, 2)}

Your tasks:
1. For each of the 8 practice areas, select the single most important story that week. Rank by: significance to the UK legal market, likely interview relevance, deal/case size, regulatory impact. If a topic has no stories this week, omit it.
2. Write one email subject line: under 60 chars, editorial style (newspaper headline, not marketing), references the most compelling story, no quotes.

Respond with valid JSON only — no markdown, no explanation:
{
  "selections": {
    "M&A": <index or null>,
    "Capital Markets": <index or null>,
    "Banking & Finance": <index or null>,
    "Energy & Tech": <index or null>,
    "Regulation": <index or null>,
    "Disputes": <index or null>,
    "International": <index or null>,
    "AI & Law": <index or null>
  },
  "subject": "<subject line>"
}`;

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]) as {
      selections: Record<string, number | null>;
      subject: string;
    };

    const topStories: DigestStory[] = [];
    for (const topic of TOPICS) {
      const idx = parsed.selections[topic];
      if (typeof idx === 'number' && allStories[idx]) {
        topStories.push(allStories[idx]);
      }
    }

    const subject = typeof parsed.subject === 'string' && parsed.subject.length > 0 && parsed.subject.length <= 80
      ? parsed.subject
      : fallbackSubject;

    return { topStories: topStories.length > 0 ? topStories : allStories.slice(0, 8), subject };
  } catch (err) {
    console.error('[digest] AI ranking failed, falling back to recency order:', err);
    return { topStories: allStories.slice(0, 8), subject: fallbackSubject };
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

  // Collect all stories from the week — de-duplicate by 5-word fingerprint
  const allStories: DigestStory[] = [];
  const seenFingerprints = new Set<string>();

  for (const date of recentDates) {
    const briefing = await getBriefing(date);
    if (!briefing) continue;
    for (const story of briefing.stories) {
      const fingerprint = story.headline
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .slice(0, 5)
        .join(' ');
      if (seenFingerprints.has(fingerprint)) continue;
      seenFingerprints.add(fingerprint);
      allStories.push({
        headline: story.headline,
        topic: story.topic,
        summary: story.summary,
        date: briefing.date,
      });
    }
  }

  // Week label: "24 Feb – 2 Mar 2026"
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekLabel = `${fmt(weekAgo)} – ${fmt(now)} ${now.getFullYear()}`;

  // AI selects best story per practice area + generates subject line
  const { topStories, subject } = await rankStoriesAndSubject(allStories, weekLabel);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.folioapp.co.uk';

  // ── 2. Get active subscribers from Stripe ───────────────────────────────

  const stripe = new Stripe(stripeKey);
  const subscribers: Array<{ email: string; customerId: string }> = [];

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
        subscribers.push({ email: customer.email, customerId: customer.id });
      }
    }

    hasMore = subs.has_more;
    if (subs.data.length > 0) {
      startingAfter = subs.data[subs.data.length - 1].id;
    }
  }

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, note: 'No active subscribers' });
  }

  // ── 3. Send digest to each subscriber ───────────────────────────────────

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  // Resend free tier: 100/day. Batch with small delay to avoid rate limits.
  for (const { email, customerId } of subscribers) {
    // Check GDPR opt-out before sending
    const optedOut = await isOptedOut(email);
    if (optedOut) {
      skipped++;
      continue;
    }

    // Build personalised referral link (non-fatal if lookup fails)
    let referralLink: string | undefined;
    try {
      const userId = await getUserIdByCustomer(customerId);
      if (userId) {
        const code = await getOrCreateReferralCode(userId);
        referralLink = `${siteUrl}/?ref=${code}`;
      }
    } catch {
      // Non-fatal — digest still sends without referral CTA
    }

    const unsubUrl = buildUnsubscribeUrl(email, siteUrl);
    const result = await sendWeeklyDigest(email, topStories, weekLabel, subject, unsubUrl, referralLink);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    // 100ms delay between sends to respect rate limits
    if (subscribers.length > 10) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  console.log(`[digest] Weekly digest sent: ${sent} ok, ${failed} failed, ${skipped} skipped opt-out (${subscribers.length} total subscribers)`);

  return NextResponse.json({ sent, failed, skipped, total: subscribers.length });
}

// ── POST: admin test — sends digest to a single email address ────────────────

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const adminId = process.env.ADMIN_USER_ID;
  if (!userId || !adminId || userId !== adminId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email } = await req.json() as { email?: string };
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const allDates = await listBriefings();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentDates = allDates
    .filter((d) => new Date(d) >= weekAgo)
    .sort((a, b) => a.localeCompare(b));

  const allStories: DigestStory[] = [];
  const seenFingerprints = new Set<string>();

  for (const date of recentDates) {
    const briefing = await getBriefing(date);
    if (!briefing) continue;
    for (const story of briefing.stories) {
      const fingerprint = story.headline
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .slice(0, 5)
        .join(' ');
      if (seenFingerprints.has(fingerprint)) continue;
      seenFingerprints.add(fingerprint);
      allStories.push({ headline: story.headline, topic: story.topic, summary: story.summary, date: briefing.date });
    }
  }

  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekLabel = `${fmt(weekAgo)} – ${fmt(now)} ${now.getFullYear()}`;
  const { topStories, subject } = await rankStoriesAndSubject(allStories, weekLabel);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.folioapp.co.uk';
  const unsubUrl = buildUnsubscribeUrl(email, siteUrl);
  const result = await sendWeeklyDigest(email, topStories, weekLabel, `[TEST] ${subject}`, unsubUrl);

  return NextResponse.json(result);
}
