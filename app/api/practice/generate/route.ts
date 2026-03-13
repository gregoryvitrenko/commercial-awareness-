import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { generatePracticeSet } from '@/lib/quiz';
import { savePracticeSet } from '@/lib/storage';

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
    console.log('[practice/generate] Starting weekly practice set generation for all topics');
    const results: Record<string, string> = {};

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

    console.log('[practice/generate] Complete:', results);
  });

  return NextResponse.json({ ok: true, message: 'Practice set generation queued for all 8 topics' });
}
