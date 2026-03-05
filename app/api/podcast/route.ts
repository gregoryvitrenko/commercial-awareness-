import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBriefing, getTodayDate } from '@/lib/storage';
import { isValidDate } from '@/lib/security';
import { generateAndSavePodcastScript } from '@/lib/podcast';
import { getCachedScript } from '@/lib/podcast-storage';
import { isSubscribed } from '@/lib/subscription';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const isDevPreview = process.env.PREVIEW_MODE === 'true';
  const { userId } = await auth();

  if (!isDevPreview) {
    if (!userId) {
      console.warn('[podcast] POST — unauthenticated request rejected');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // SECURITY FIX: podcast script is premium content — enforce subscription at API level.
    // Previously any authenticated user could retrieve the full podcast script.
    const subscribed = await isSubscribed(userId);
    if (!subscribed) {
      console.warn(`[podcast] POST — unsubscribed user ${userId} blocked`);
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }
  }

  // Rate limit: 10 podcast script requests per hour (scripts are cached; this throttles
  // generation attempts which invoke Claude Sonnet)
  const limited = await checkRateLimit(userId ?? 'preview-dev', 'podcast', 10, 3600);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const rawDate = body.date ?? getTodayDate();
  const targetDate = isValidDate(rawDate) ? rawDate : getTodayDate();
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;

  // ── Return cached script immediately — no Claude call, no ElevenLabs charge ──
  const cached = await getCachedScript(targetDate);
  if (cached) {
    return NextResponse.json({ script: cached, hasElevenLabs });
  }

  const briefing = await getBriefing(targetDate);
  if (!briefing) {
    return NextResponse.json({ error: 'No briefing found for this date' }, { status: 404 });
  }

  try {
    const script = await generateAndSavePodcastScript(briefing);
    return NextResponse.json({ script, hasElevenLabs });
  } catch (err) {
    console.error('[podcast] generation error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    // SECURITY FIX: never leak raw error messages to the client — they can reveal
    // internal implementation details, API key names, or file paths.
    if (msg.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: 'Podcast generation is currently unavailable.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Script generation failed. Please try again later.' }, { status: 502 });
  }
}
