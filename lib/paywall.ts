import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isSubscribed } from './subscription';

// ─── PREVIEW_MODE safety guard ─────────────────────────────────────────────────
// PREVIEW_MODE=true is a dev-only bypass that makes all paywall checks return
// 'subscribed'. If this ever reaches production, EVERY USER gets full access.
// This guard throws loudly at startup rather than silently bypassing the paywall.
function assertPreviewModeIsSafe(): void {
  if (
    process.env.PREVIEW_MODE === 'true' &&
    process.env.NODE_ENV === 'production'
  ) {
    // Throw rather than silently continue — this is a critical misconfiguration.
    throw new Error(
      '[paywall] FATAL: PREVIEW_MODE=true is set in a production environment. ' +
      'This bypasses ALL subscription checks and gives every user full access. ' +
      'Remove PREVIEW_MODE from your Vercel environment variables immediately.'
    );
  }
}

// Call at the top of any premium server page.
// Redirects to /sign-up if unauthenticated, /upgrade if not subscribed.
export async function requireSubscription() {
  assertPreviewModeIsSafe();
  if (process.env.PREVIEW_MODE === 'true') return; // dev-only bypass (safe: guard above ran)
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
  assertPreviewModeIsSafe();
  if (process.env.PREVIEW_MODE === 'true') return 'subscribed'; // dev-only bypass (safe: guard above ran)
  const { userId } = await auth();
  if (!userId) return 'unauthenticated';
  const subscribed = await isSubscribed(userId);
  return subscribed ? 'subscribed' : 'free';
}
