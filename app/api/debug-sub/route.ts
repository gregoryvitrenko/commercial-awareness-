import { auth } from '@clerk/nextjs/server';
import { getSubscription } from '@/lib/subscription';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const sub = await getSubscription(userId);
  return NextResponse.json({ userId, sub });
}
