/**
 * lib/quiz-gamification.ts
 *
 * XP / level / streak gamification for the quiz feature.
 * Dual-backend: Upstash Redis in production, JSON file in dev.
 *
 * Redis key schema:
 *   quiz:xp:{userId}             — cumulative XP integer
 *   quiz:level:{userId}          — current level integer (derived from XP, kept in sync)
 *   quiz:streak:{userId}         — current streak count integer
 *   quiz:last-completed:{userId} — ISO date YYYY-MM-DD of last completion
 *
 * XP formula:
 *   daily quiz:    +100 XP
 *   deep practice: +150 XP
 *   level = Math.floor(totalXP / 100)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastCompleted: string | null;
}

// ── Backend detection ──────────────────────────────────────────────────────────

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

// ── Filesystem backend (dev) ────────────────────────────────────────────────

function sanitizeUserId(userId: string): string {
  return userId.replace(/[^a-z0-9_-]/gi, '_');
}

function getFsPath(userId: string): string {
  const dir = path.join(process.cwd(), 'data', 'gamification');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${sanitizeUserId(userId)}.json`);
}

function fsGetData(userId: string): GamificationData {
  const filePath = getFsPath(userId);
  if (!fs.existsSync(filePath)) {
    return { xp: 0, level: 0, streak: 0, lastCompleted: null };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as GamificationData;
}

function fsSetData(userId: string, data: GamificationData): void {
  fs.writeFileSync(getFsPath(userId), JSON.stringify(data, null, 2));
}

// ── Redis backend (production) ─────────────────────────────────────────────

async function redisGetData(userId: string): Promise<GamificationData> {
  const redis = getRedis();
  const [xpRaw, levelRaw, streakRaw, lastRaw] = await Promise.all([
    redis.get(`quiz:xp:${userId}`),
    redis.get(`quiz:level:${userId}`),
    redis.get(`quiz:streak:${userId}`),
    redis.get(`quiz:last-completed:${userId}`),
  ]);
  return {
    xp: xpRaw ? Number(xpRaw) : 0,
    level: levelRaw ? Number(levelRaw) : 0,
    streak: streakRaw ? Number(streakRaw) : 0,
    lastCompleted: lastRaw ? String(lastRaw) : null,
  };
}

async function redisSetData(userId: string, data: GamificationData): Promise<void> {
  const redis = getRedis();
  await Promise.all([
    redis.set(`quiz:xp:${userId}`, data.xp),
    redis.set(`quiz:level:${userId}`, data.level),
    redis.set(`quiz:streak:${userId}`, data.streak),
    redis.set(`quiz:last-completed:${userId}`, data.lastCompleted ?? ''),
  ]);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns the current gamification state for a user.
 * Returns zeroed defaults if no data exists yet.
 */
export async function getGamificationData(userId: string): Promise<GamificationData> {
  if (useRedis()) return redisGetData(userId);
  return fsGetData(userId);
}

/**
 * Records a quiz completion, updates XP/level/streak, and returns the new state.
 * Idempotent for same-day completions — calling twice on the same day does not
 * double-increment the streak.
 */
export async function recordQuizCompletion(
  userId: string,
  type: 'daily' | 'practice',
): Promise<GamificationData> {
  const current = await getGamificationData(userId);

  const xpDelta = type === 'daily' ? 100 : 150;
  const newXP = current.xp + xpDelta;
  const newLevel = Math.floor(newXP / 100);

  const today = new Date().toISOString().split('T')[0];
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  let newStreak: number;
  if (current.lastCompleted === today) {
    // Already recorded today — idempotent, streak unchanged
    newStreak = current.streak;
  } else if (current.lastCompleted === yesterday) {
    // Consecutive day — extend streak
    newStreak = current.streak + 1;
  } else {
    // Gap (or first ever) — reset to 1
    newStreak = 1;
  }

  const updated: GamificationData = {
    xp: newXP,
    level: newLevel,
    streak: newStreak,
    lastCompleted: today,
  };

  if (useRedis()) {
    await redisSetData(userId, updated);
  } else {
    fsSetData(userId, updated);
  }

  return updated;
}
