import fs from 'fs';
import path from 'path';

export interface SubscriptionData {
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: number; // Unix timestamp
}

// ─── Backend detection ────────────────────────────────────────────────────────

function useRedis(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  const { Redis } = require('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ─── Filesystem fallback ──────────────────────────────────────────────────────

const SUBS_FILE = path.join(process.cwd(), 'data', 'subscriptions.json');

function fsReadAll(): Record<string, SubscriptionData> {
  try {
    if (!fs.existsSync(SUBS_FILE)) return {};
    return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function fsWrite(data: Record<string, SubscriptionData>): void {
  const dir = path.dirname(SUBS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SUBS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getSubscription(userId: string): Promise<SubscriptionData | null> {
  if (useRedis()) {
    const redis = getRedis();
    const data = await redis.get(`subscription:${userId}`);
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : (data as SubscriptionData);
  }
  const all = fsReadAll();
  return all[userId] ?? null;
}

export async function setSubscription(userId: string, data: SubscriptionData): Promise<void> {
  if (useRedis()) {
    const redis = getRedis();
    await redis.set(`subscription:${userId}`, JSON.stringify(data));
    return;
  }
  const all = fsReadAll();
  all[userId] = data;
  fsWrite(all);
}

export async function removeSubscription(userId: string): Promise<void> {
  if (useRedis()) {
    const redis = getRedis();
    await redis.del(`subscription:${userId}`);
    return;
  }
  const all = fsReadAll();
  delete all[userId];
  fsWrite(all);
}

export async function isSubscribed(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  if (!sub) return false;
  const now = Math.floor(Date.now() / 1000);
  return (sub.status === 'active' || sub.status === 'trialing') && sub.currentPeriodEnd > now;
}

// Look up a Clerk userId by Stripe customer ID
export async function getUserIdByCustomer(stripeCustomerId: string): Promise<string | null> {
  if (useRedis()) {
    const redis = getRedis();
    const userId = await redis.get(`stripe-customer:${stripeCustomerId}`);
    return userId as string | null;
  }
  const all = fsReadAll();
  const entry = Object.entries(all).find(([, v]) => v.stripeCustomerId === stripeCustomerId);
  return entry ? entry[0] : null;
}

export async function setCustomerMapping(stripeCustomerId: string, userId: string): Promise<void> {
  if (useRedis()) {
    const redis = getRedis();
    await redis.set(`stripe-customer:${stripeCustomerId}`, userId);
  }
  // filesystem: the mapping is implicit in subscriptions.json
}
