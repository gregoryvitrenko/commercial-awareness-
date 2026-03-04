import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import { generateAptitudeQuestions } from '@/lib/aptitude';
import { getAptitudeBank, saveAptitudeBank, getTodayDate } from '@/lib/storage';
import type { AptitudeQuestion } from '@/lib/aptitude';

export const maxDuration = 60; // bank refresh needs up to ~30s across parallel batches

// Bank sizes: WG gets 3 batches × 10 = 30 questions; SJT gets 2 batches × 10 = 20
const BANK_BATCHES: Record<string, number> = {
  'watson-glaser': 3,
  'sjt': 2,
};

const BANK_TTL_DAYS = 7;

function daysBetween(dateA: string, dateB: string): number {
  return Math.abs(
    (new Date(dateA).getTime() - new Date(dateB).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function sampleRandom(questions: AptitudeQuestion[], n: number): AptitudeQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function buildBank(testType: 'watson-glaser' | 'sjt'): Promise<AptitudeQuestion[]> {
  const batches = BANK_BATCHES[testType] ?? 2;

  // Generate all batches in parallel
  const results = await Promise.all(
    Array.from({ length: batches }, () => generateAptitudeQuestions(testType, 10)),
  );

  // Flatten and re-number IDs to avoid collisions
  const all = results.flat();
  all.forEach((q, i) => { q.id = `${testType}-${i + 1}`; });
  return all;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
  }

  const body = await request.json();
  const { testType } = body as { testType?: string };

  if (testType !== 'watson-glaser' && testType !== 'sjt') {
    return NextResponse.json(
      { error: 'testType must be "watson-glaser" or "sjt"' },
      { status: 400 },
    );
  }

  const today = getTodayDate();

  // Check if bank exists and is fresh
  const existing = await getAptitudeBank(testType);
  const isFresh = existing && daysBetween(existing.lastRefreshed, today) < BANK_TTL_DAYS;

  let bank: AptitudeQuestion[];

  if (isFresh && existing) {
    bank = existing.questions;
  } else {
    // Refresh: generate multiple batches in parallel
    try {
      bank = await buildBank(testType);
      await saveAptitudeBank(testType, { questions: bank, lastRefreshed: today });
    } catch (err) {
      console.error('[aptitude-questions] Bank refresh failed:', err);
      // If refresh fails but we have a stale bank, still use it
      if (existing && existing.questions.length > 0) {
        bank = existing.questions;
      } else {
        return NextResponse.json(
          { error: 'Failed to generate questions. Please try again.' },
          { status: 500 },
        );
      }
    }
  }

  // Return a random 10-question sample from the bank
  const questions = sampleRandom(bank, Math.min(10, bank.length));
  return NextResponse.json({ questions });
}
