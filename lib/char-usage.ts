import fs from 'fs';
import path from 'path';

export const MONTHLY_LIMIT = 100_000;

const USAGE_FILE = path.join(process.cwd(), 'data', 'el-usage.json');

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getDayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Days remaining in the current month, including today (minimum 1). */
function getRemainingDays(): number {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - now.getDate() + 1);
}

// ─── Backend detection ─────────────────────────────────────────────────────────

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

// ─── Redis backend ─────────────────────────────────────────────────────────────

function toNum(val: unknown): number {
  if (val === null || val === undefined) return 0;
  return typeof val === 'number' ? val : parseInt(String(val), 10);
}

async function redisGetUsed(): Promise<number> {
  const redis = getRedis();
  return toNum(await redis.get(`elevenlabs:chars:${getMonthKey()}`));
}

async function redisGetTodayUsed(): Promise<number> {
  const redis = getRedis();
  return toNum(await redis.get(`elevenlabs:chars:${getDayKey()}`));
}

async function redisIncrUsed(chars: number): Promise<void> {
  const redis = getRedis();
  await redis.incrby(`elevenlabs:chars:${getMonthKey()}`, chars);
}

async function redisIncrTodayUsed(chars: number): Promise<void> {
  const redis = getRedis();
  const key = `elevenlabs:chars:${getDayKey()}`;
  await redis.incrby(key, chars);
  await redis.expire(key, 172_800); // auto-expire after 48h — no manual cleanup needed
}

// ─── Filesystem backend ────────────────────────────────────────────────────────

function fsReadUsage(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8')) as Record<string, number>;
  } catch {
    return {};
  }
}

function fsWriteUsage(data: Record<string, number>): void {
  const dir = path.dirname(USAGE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function fsGetUsed(): number {
  return fsReadUsage()[getMonthKey()] ?? 0;
}

function fsGetTodayUsed(): number {
  return fsReadUsage()[getDayKey()] ?? 0;
}

function fsIncrUsed(chars: number): void {
  const data = fsReadUsage();
  const key = getMonthKey();
  data[key] = (data[key] ?? 0) + chars;
  fsWriteUsage(data);
}

function fsIncrTodayUsed(chars: number): void {
  const data = fsReadUsage();
  const key = getDayKey();
  data[key] = (data[key] ?? 0) + chars;
  fsWriteUsage(data);
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function getMonthlyUsage(): Promise<{
  used: number;
  remaining: number;
  limit: number;
  month: string;
  dailyBudget: number;
  usedToday: number;
  daysRemaining: number;
}> {
  const key = getMonthKey();
  const [used, usedToday] = useRedis()
    ? await Promise.all([redisGetUsed(), redisGetTodayUsed()])
    : [fsGetUsed(), fsGetTodayUsed()];

  const remaining = Math.max(0, MONTHLY_LIMIT - used);
  const daysRemaining = getRemainingDays();
  const dailyBudget = Math.floor(remaining / daysRemaining);

  return { used, remaining, limit: MONTHLY_LIMIT, month: key, dailyBudget, usedToday, daysRemaining };
}

export async function recordUsage(chars: number): Promise<void> {
  if (useRedis()) {
    // Both writes are fire-and-forget in parallel — monthly and daily keys updated atomically
    await Promise.all([redisIncrUsed(chars), redisIncrTodayUsed(chars)]);
  } else {
    fsIncrUsed(chars);
    fsIncrTodayUsed(chars);
  }
}

/**
 * Returns true if generating `chars` characters is within today's daily budget.
 *
 * Daily budget = remaining_monthly_chars / days_left_in_month.
 * This spreads the remaining allowance evenly so a testing spike on day 10
 * can't burn the whole month's budget in one session.
 *
 * Hard cap: also blocks if `chars` alone would exceed the monthly remaining
 * (guards the final days of the month when daily budget rounds very small).
 */
/**
 * Returns the character limit for today's podcast script.
 * = remaining monthly chars / days left in month.
 * This guarantees every day gets audio if each script stays within budget.
 */
export async function getDailyCharBudget(): Promise<number> {
  const { remaining, daysRemaining } = await getMonthlyUsage();
  return Math.floor(remaining / daysRemaining);
}

export async function hasCapacity(chars: number): Promise<boolean> {
  const { remaining, dailyBudget, usedToday } = await getMonthlyUsage();

  // Hard cap — never exceed monthly limit
  if (chars > remaining) return false;

  // Daily rate cap — today's usage must stay within the daily allocation
  if (usedToday + chars > dailyBudget) return false;

  return true;
}
