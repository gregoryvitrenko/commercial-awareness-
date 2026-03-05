import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { setOnboarding, type OnboardingData, type OnboardingStage } from '@/lib/onboarding';
import { FIRMS } from '@/lib/firms-data';
import { checkRateLimit } from '@/lib/rate-limit';

const VALID_STAGES: OnboardingStage[] = ['first-year', 'vs', 'tc'];

// Build a set of valid firm slugs once at module load (O(1) lookups)
const VALID_FIRM_SLUGS: ReadonlySet<string> = new Set(FIRMS.map((f) => f.slug));

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // Rate limit: 10 onboarding saves per hour (should only be done once or twice)
  const limited = await checkRateLimit(userId, 'onboarding', 10, 3600);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const stage = body.stage as OnboardingStage;

  if (!VALID_STAGES.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }

  // SECURITY FIX: validate each firm slug against the real FIRMS list.
  // Previously arbitrary strings could be stored in Redis via targetFirms[].
  const rawFirms = Array.isArray(body.targetFirms) ? body.targetFirms : [];
  const targetFirms: string[] = (rawFirms as unknown[])
    .filter((slug): slug is string => typeof slug === 'string' && VALID_FIRM_SLUGS.has(slug))
    .slice(0, 5);

  const data: OnboardingData = {
    stage,
    targetFirms,
    completedAt: new Date().toISOString(),
  };

  await setOnboarding(userId, data);

  return NextResponse.json({ ok: true });
}
