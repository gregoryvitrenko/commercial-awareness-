import { NextRequest, NextResponse } from 'next/server';
import { generateBriefing } from '@/lib/generate';
import { saveBriefing, getBriefing, getTodayDate } from '@/lib/storage';

export const maxDuration = 300; // 5-minute timeout for generation

function isCronAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

async function handleGenerate(request: NextRequest, force = false) {
  const today = getTodayDate();

  if (!force) {
    const existing = await getBriefing(today);
    if (existing) {
      return NextResponse.json({
        message: 'Briefing already exists for today',
        date: today,
        skipped: true,
      });
    }
  }

  try {
    const briefing = await generateBriefing();
    await saveBriefing(briefing);

    return NextResponse.json({
      message: 'Briefing generated successfully',
      date: briefing.date,
      storyCount: briefing.stories.length,
    });
  } catch (error) {
    console.error('[generate] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Vercel cron calls GET — protected by CRON_SECRET
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handleGenerate(request);
}

// Manual UI trigger uses POST — open (personal tool, no public auth needed)
// Pass ?force=true to regenerate even if today's briefing already exists
export async function POST(request: NextRequest) {
  const force = request.nextUrl.searchParams.get('force') === 'true';
  return handleGenerate(request, force);
}
