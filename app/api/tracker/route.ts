import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTrackerForUser, setTrackerForUser } from '@/lib/tracker';
import { isSubscribed } from '@/lib/subscription';
import { isValidSlug, isValidApplicationStatus } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';
import { FIRMS } from '@/lib/firms-data';
import type { TrackedApplication } from '@/lib/types';

const FIRM_SLUGS = new Set(FIRMS.map((f) => f.slug));

// ── GET: fetch user's tracked applications ───────────────────────────────────

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    if (process.env.PREVIEW_MODE === 'true') {
      const apps = await getTrackerForUser('preview-dev');
      return NextResponse.json({ applications: apps });
    }
    return NextResponse.json({ applications: [] });
  }

  const limited = await checkRateLimit(userId, 'tracker-get', 100, 3600);
  if (limited) return limited;

  const subscribed = await isSubscribed(userId);
  if (!subscribed && process.env.PREVIEW_MODE !== 'true') {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
  }

  const applications = await getTrackerForUser(userId);
  return NextResponse.json({ applications });
}

// ── POST: save updated tracker state ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const effectiveUserId = userId ?? (process.env.PREVIEW_MODE === 'true' ? 'preview-dev' : null);
  if (!effectiveUserId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const limited = await checkRateLimit(effectiveUserId, 'tracker-post', 50, 3600);
  if (limited) return limited;

  if (effectiveUserId !== 'preview-dev') {
    const subscribed = await isSubscribed(effectiveUserId);
    if (!subscribed) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }
  }

  let body: { applications?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.applications)) {
    return NextResponse.json({ error: 'applications must be an array' }, { status: 400 });
  }

  if (body.applications.length > 50) {
    return NextResponse.json({ error: 'Too many applications (max 50)' }, { status: 400 });
  }

  // Validate and sanitize each item
  const validated: TrackedApplication[] = [];
  for (const item of body.applications) {
    if (!item || typeof item !== 'object') continue;
    const { firmSlug, programme, status, appliedAt, notes, updatedAt } = item as Record<string, unknown>;

    if (typeof firmSlug !== 'string' || !isValidSlug(firmSlug) || !FIRM_SLUGS.has(firmSlug)) continue;
    if (typeof programme !== 'string' || programme.length === 0 || programme.length > 200) continue;
    if (!isValidApplicationStatus(status)) continue;

    validated.push({
      firmSlug,
      programme: programme.slice(0, 200),
      status: status as TrackedApplication['status'],
      appliedAt: typeof appliedAt === 'string' ? appliedAt.slice(0, 10) : undefined,
      notes: typeof notes === 'string' ? notes.slice(0, 500) : '',
      updatedAt: typeof updatedAt === 'string' ? updatedAt.slice(0, 30) : new Date().toISOString(),
    });
  }

  await setTrackerForUser(effectiveUserId, validated);
  return NextResponse.json({ ok: true, count: validated.length });
}
