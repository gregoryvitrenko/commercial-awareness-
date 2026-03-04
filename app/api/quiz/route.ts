import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBriefing, getQuiz, saveQuiz, getTodayDate } from '@/lib/storage';
import { generateQuiz } from '@/lib/quiz';
import { isValidDate } from '@/lib/security';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    console.warn('[quiz] POST — unauthenticated request rejected');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const rawDate = body.date ?? getTodayDate();
  const date = isValidDate(rawDate) ? rawDate : getTodayDate();

  // Return cached quiz if it exists
  const cached = await getQuiz(date);
  if (cached) {
    return NextResponse.json({ quiz: cached });
  }

  // Need a briefing to generate questions from
  const briefing = await getBriefing(date);
  if (!briefing) {
    return NextResponse.json(
      { error: 'No briefing found for this date' },
      { status: 404 }
    );
  }

  try {
    const quiz = await generateQuiz(briefing);
    await saveQuiz(quiz);
    return NextResponse.json({ quiz });
  } catch (err) {
    console.error('[quiz] generation failed:', err);
    return NextResponse.json(
      { error: 'Quiz generation failed. Please try again later.' },
      { status: 500 }
    );
  }
}
