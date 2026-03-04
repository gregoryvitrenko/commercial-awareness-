import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isSubscribed } from './subscription';

// Call at the top of any premium server page.
// Redirects to /sign-up if unauthenticated, /upgrade if not subscribed.
export async function requireSubscription() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-up');
  }
  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    redirect('/upgrade');
  }
}

// Use this when you want to conditionally render content rather than redirect.
export async function getSubscriptionStatus(): Promise<'subscribed' | 'free' | 'unauthenticated'> {
  const { userId } = await auth();
  if (!userId) return 'unauthenticated';
  const subscribed = await isSubscribed(userId);
  return subscribed ? 'subscribed' : 'free';
}
