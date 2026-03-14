import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { generatePracticeSet } from '@/lib/quiz';
import { savePracticeSet, getAptitudeBank, saveAptitudeBank, getTodayDate } from '@/lib/storage';
import { buildAptitudeBank } from '@/lib/aptitude';

export const maxDuration = 120;

const PRACTICE_TOPICS = [
  { slug: 'ma', label: 'M&A' },
  { slug: 'capital-markets', label: 'Capital Markets' },
  { slug: 'banking-finance', label: 'Banking & Finance' },
  { slug: 'energy-tech', label: 'Energy & Tech' },
  { slug: 'regulation', label: 'Regulation' },
  { slug: 'disputes', label: 'Disputes' },
  { slug: 'international', label: 'International' },
  { slug: 'ai-law', label: 'AI & Law' },
] as const;

// GET — invoked by weekly cron (Monday 06:30 UTC) or admin POST
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  after(async () => {
    const today = getTodayDate();
    console.log('[practice/generate] Starting weekly refresh: practice sets + aptitude banks');
    const results: Record<string, string> = {};

    // ── Deep practice sets (all 8 topics) ─────────────────────────────────
    await Promise.all(
      PRACTICE_TOPICS.map(async ({ slug, label }) => {
        try {
          const set = await generatePracticeSet(slug, label);
          await savePracticeSet(slug, set);
          results[slug] = `ok (${set.questions.length} questions)`;
          console.log(`[practice/generate] ${label}: generated ${set.questions.length} questions`);
        } catch (err) {
          results[slug] = `error: ${err instanceof Error ? err.message : String(err)}`;
          console.error(`[practice/generate] ${label} failed:`, err);
        }
      })
    );

    // ── Aptitude banks (Watson Glaser + SJT) ──────────────────────────────
    const aptitudeTypes = ['watson-glaser', 'sjt'] as const;
    for (const testType of aptitudeTypes) {
      try {
        const questions = await buildAptitudeBank(testType);
        await saveAptitudeBank(testType, { questions, lastRefreshed: today });
        results[testType] = `ok (${questions.length} questions)`;
        console.log(`[practice/generate] Aptitude bank refreshed: ${testType} (${questions.length} questions)`);
      } catch (err) {
        results[testType] = `error: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[practice/generate] Aptitude bank failed: ${testType}`, err);
      }
    }

    console.log('[practice/generate] Complete:', results);
  });

  return NextResponse.json({ ok: true, message: 'Practice set generation queued for all 8 topics' });
}
