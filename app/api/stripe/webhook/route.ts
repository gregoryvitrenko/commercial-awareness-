import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { setSubscription, removeSubscription, setCustomerMapping } from '@/lib/subscription';
import { sendWelcomeEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === 'whsec_placeholder') {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;

      const userId = session.metadata?.clerkUserId;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!userId || !subscriptionId) break;

      // Fetch full subscription to get period end
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      // current_period_end moved to items in newer Stripe API versions
      const periodEnd = (sub as any).current_period_end ?? sub.items.data[0]?.current_period_end ?? 0;

      const customerEmail = session.customer_details?.email ?? null;
      const customerName = session.customer_details?.name ?? undefined;
      const firstName = customerName?.split(' ')[0];

      await Promise.all([
        setSubscription(userId, {
          status: sub.status as 'active' | 'trialing',
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: periodEnd,
        }),
        setCustomerMapping(customerId, userId),
        customerEmail
          ? sendWelcomeEmail(customerEmail, firstName).catch((e) =>
              console.error('[webhook] welcome email error:', e)
            )
          : Promise.resolve(),
      ]);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.clerkUserId;
      if (!userId) break;

      const updatedPeriodEnd = (sub as any).current_period_end ?? sub.items.data[0]?.current_period_end ?? 0;
      await setSubscription(userId, {
        status: sub.status as 'active' | 'past_due' | 'canceled' | 'trialing',
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: updatedPeriodEnd,
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.clerkUserId;
      if (userId) await removeSubscription(userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
