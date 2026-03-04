import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { getSubscription } from '@/lib/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sub = await getSubscription(userId);
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${appUrl}/`,
  });

  return NextResponse.json({ url: session.url });
}
