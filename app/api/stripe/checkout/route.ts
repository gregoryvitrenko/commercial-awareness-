import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth, currentUser } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'You must be signed in to subscribe.' }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: email,
    metadata: { clerkUserId: userId },
    subscription_data: {
      metadata: { clerkUserId: userId },
    },
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/upgrade`,
  });

  return NextResponse.json({ url: session.url });
}
