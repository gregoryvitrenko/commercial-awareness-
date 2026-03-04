import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import { buildAptitudeBank, BANK_TTL_DAYS } from '@/lib/aptitude';
import { getAptitudeBank, saveAptitudeBank, getTodayDate } from '@/lib/storage';
import type { AptitudeQuestion } from '@/lib/aptitude';

export const maxDuration = 60;

function daysBetween(a: string, b: string): number {
  return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24));
}

function sampleRandom(questions: AptitudeQuestion[], n: number): AptitudeQuestion[] {
  return [...questions].sort(() => Math.random() - 0.5).slice(0, n);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subscribed = await isSubscribed(userId);
  if (!subscribed) return NextResponse.json({ error: 'Subscription required' }, { status: 403 });

  const body = await request.json();
  const { testType } = body as { testType?: string };

  if (testType !== 'watson-glaser' && testType !== 'sjt') {
    return NextResponse.json({ error: 'testType must be "watson-glaser" or "sjt"' }, { status: 400 });
  }

  const today = getTodayDate();
  const existing = await getAptitudeBank(testType);
  const isFresh = existing && daysBetween(existing.lastRefreshed, today) < BANK_TTL_DAYS;

  let bank: AptitudeQuestion[];

  if (isFresh && existing) {
    bank = existing.questions;
  } else {
    try {
      bank = await buildAptitudeBank(testType);
      await saveAptitudeBank(testType, { questions: bank, lastRefreshed: today });
    } catch (err) {
      console.error('[aptitude-questions] Bank refresh failed:', err);
      if (existing?.questions.length) {
        bank = existing.questions;
      } else {
        return NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ questions: sampleRandom(bank, Math.min(10, bank.length)) });
}
