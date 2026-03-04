import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import { generateAptitudeQuestions } from '@/lib/aptitude';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  // Require subscription — Claude API calls cost money
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
  }

  const body = await request.json();
  const { testType, count } = body as { testType?: string; count?: number };

  if (testType !== 'watson-glaser' && testType !== 'sjt') {
    return NextResponse.json(
      { error: 'testType must be "watson-glaser" or "sjt"' },
      { status: 400 },
    );
  }

  const questionCount = Math.min(Math.max(count ?? 10, 5), 15);

  try {
    const questions = await generateAptitudeQuestions(testType, questionCount);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('[aptitude-questions] Generation failed:', err);
    return NextResponse.json(
      { error: 'Failed to generate questions. Please try again.' },
      { status: 500 },
    );
  }
}
