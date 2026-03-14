import { NextRequest, NextResponse, after } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateBriefing } from '@/lib/generate';
import { saveBriefing, getBriefing, getTodayDate, saveQuiz } from '@/lib/storage';
import { generateAndSavePodcastScript } from '@/lib/podcast';
import { generateAndCachePodcastAudio } from '@/lib/podcast-audio';
import { generateQuiz } from '@/lib/quiz';
import { prewarmAllFirmPacks } from '@/lib/firm-pack';
import { checkRateLimit } from '@/lib/rate-limit';
import type { Briefing } from '@/lib/types';

export const maxDuration = 300; // 5-minute timeout for generation

// SECURITY: Briefing generation calls Tavily + Claude + ElevenLabs TTS — costs real
// money. Must be admin-only. Any authenticated user reaching this without the check
// could drain API quotas intentionally or accidentally.
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

async function generateAndSaveQuiz(briefing: Briefing): Promise<void> {
  const quiz = await generateQuiz(briefing);
  await saveQuiz(quiz);
  console.log(`[generate] Quiz auto-generated: ${quiz.questions.length} questions for ${briefing.date}`);
}

function isCronAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // Fail-closed: if CRON_SECRET is not configured, deny all cron requests.
  // This prevents unauthenticated access to expensive AI generation in any environment.
  if (!cronSecret) {
    console.error('[generate] CRON_SECRET is not set — cron access denied. Set CRON_SECRET in .env.local and Vercel environment variables.');
    return false;
  }
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

    // Schedule background work with after() — runs after response is sent,
    // but Vercel keeps the function alive until all after() callbacks complete.
    // This replaces the old fire-and-forget pattern which could get killed early.
    // Extract today's headlines to give firm packs deal-anchored context
    const recentHeadlines = briefing.stories.map((s) => s.headline);

    after(async () => {
      await Promise.all([
        generateAndSaveQuiz(briefing).catch((err) =>
          console.error('[generate] Quiz auto-generation failed:', err)
        ),
        generateAndSavePodcastScript(briefing)
          .then(() => generateAndCachePodcastAudio(briefing.date))
          .catch((err) =>
            console.error('[generate] Podcast/audio auto-generation failed:', err)
          ),
        // Pre-warm all 38 firm packs in batches of 5 — users should never
        // land on a firm page and wait for on-demand generation.
        prewarmAllFirmPacks(recentHeadlines, 5).catch((err) =>
          console.error('[generate] Firm pack pre-warm failed:', err)
        ),
      ]);
    });

    return NextResponse.json({
      message: 'Briefing generated successfully',
      date: briefing.date,
      storyCount: briefing.stories.length,
    });
  } catch (error) {
    console.error('[generate] Error:', error);
    return NextResponse.json({ error: 'Briefing generation failed. Check server logs for details.' }, { status: 500 });
  }
}

// Vercel cron calls GET — protected by CRON_SECRET
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handleGenerate(request);
}

// Manual UI trigger uses POST — restricted to admin user only.
// SECURITY FIX: previously any authenticated user could trigger expensive AI generation.
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (userId !== ADMIN_USER_ID) {
    console.warn(`[generate] POST — non-admin user ${userId} blocked`);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate-limit even the admin to prevent accidental runaway triggers (10/hour)
  const limited = await checkRateLimit(userId, 'generate', 10, 3600);
  if (limited) return limited;

  const force = request.nextUrl.searchParams.get('force') === 'true';
  return handleGenerate(request, force);
}
