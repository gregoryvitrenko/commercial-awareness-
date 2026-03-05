import { setSubscription } from '@/lib/subscription';
import { NextRequest, NextResponse } from 'next/server';

// One-time route to grant admin subscription access.
// Protected by ADMIN_TOKEN env var — delete this file after use.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  await setSubscription(userId, {
    status: 'active',
    stripeCustomerId: 'manual',
    stripeSubscriptionId: 'manual',
    currentPeriodEnd: 9999999999,
  });

  return NextResponse.json({ ok: true, userId, message: 'Subscription set. Delete this route now.' });
}
