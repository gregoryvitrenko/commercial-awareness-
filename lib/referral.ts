import crypto from 'crypto';
import { getSubscription } from '@/lib/subscription';

// ─── Backend detection ────────────────────────────────────────────────────────

function hasRedis(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// ─── Code generation ─────────────────────────────────────────────────────────

function generateCode(): string {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Returns the referral code for a user, creating one lazily if it doesn't exist.
 * Redis: bidirectional mapping — referral-code:{userId} <-> referral:{code}
 * Dev fallback: deterministic SHA-256 slice (no Redis required).
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  if (!hasRedis()) {
    // Deterministic dev fallback — no Redis required
    return crypto.createHash('sha256').update(userId).digest('hex').slice(0, 8);
  }

  const redis = await getRedis();
  const existing = await redis.get(`referral-code:${userId}`);
  if (existing) return existing as string;

  const code = generateCode();
  // Bidirectional mapping: code -> userId and userId -> code
  await Promise.all([
    redis.set(`referral-code:${userId}`, code),
    redis.set(`referral:${code}`, userId),
  ]);
  return code;
}

// ─── Reward application (internal) ───────────────────────────────────────────

async function applyFreeMonthCoupon(referrerId: string): Promise<void> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.warn('[referral] STRIPE_SECRET_KEY not set — cannot apply coupon');
    return;
  }

  const sub = await getSubscription(referrerId);
  if (!sub?.stripeSubscriptionId) {
    console.warn(`[referral] No active subscription for referrer ${referrerId} — skipping coupon`);
    return;
  }

  const StripeModule = await import('stripe');
  const stripe = new StripeModule.default(stripeKey);

  try {
    const coupon = await stripe.coupons.create({
      percent_off: 100,
      duration: 'once',
      max_redemptions: 1,
      name: 'Referral reward - 1 free month',
    });

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      discounts: [{ coupon: coupon.id }],
    });

    console.log(`[referral] Free-month coupon applied to subscription ${sub.stripeSubscriptionId} for referrer ${referrerId}`);
  } catch (err) {
    console.error(`[referral] Failed to apply coupon for referrer ${referrerId}:`, err);
  }
}

// ─── Recording ────────────────────────────────────────────────────────────────

/**
 * Records a referral when a new user subscribes via a referral link.
 * - Guards against self-referral and double-counting.
 * - Applies a 100%-off one-month coupon at every 3rd referral.
 */
export async function recordReferral(
  newUserId: string,
  referralCode: string,
): Promise<{ rewarded: boolean }> {
  if (!hasRedis()) return { rewarded: false };

  const redis = await getRedis();

  // Look up referrer by code
  const referrerId = (await redis.get(`referral:${referralCode}`)) as string | null;
  if (!referrerId) {
    console.warn(`[referral] Unknown referral code: ${referralCode}`);
    return { rewarded: false };
  }

  // Self-referral guard
  if (referrerId === newUserId) {
    console.warn(`[referral] Self-referral attempt by ${newUserId} — ignored`);
    return { rewarded: false };
  }

  // Prevent double-counting: SET NX returns null if key already exists
  const setResult = await redis.set(`referred-by:${newUserId}`, referrerId, { nx: true });
  if (setResult === null) {
    console.log(`[referral] ${newUserId} already attributed to a referrer — skipping`);
    return { rewarded: false };
  }

  // Increment referrer's count
  const newCount = await redis.incr(`referral-count:${referrerId}`);

  // Apply reward at every 3rd referral
  if (newCount % 3 === 0) {
    await applyFreeMonthCoupon(referrerId);
    return { rewarded: true };
  }

  return { rewarded: false };
}
