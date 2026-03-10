import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { backfillQuizIndex } from '@/lib/storage';

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export async function POST(): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId || !ADMIN_USER_ID || userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const count = await backfillQuizIndex();
  return NextResponse.json({ backfilled: count });
}
