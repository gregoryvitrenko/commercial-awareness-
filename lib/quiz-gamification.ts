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
 *   quiz:practice-week:{userId}  — ISO week string of last practice XP award (e.g. "2026-W11")
 *
 * XP formula (triangular — each level costs 100 more than the last):
 *   daily quiz:    +100 XP (once per day)
 *   deep practice: +150 XP (once per week)
 *   level 0→1: 100 XP, 1→2: 200 XP, 2→3: 300 XP ...
 *   cumulative XP to reach level N: N*(N+1)/2 * 100
 */

import * as fs from 'fs';
import * as path from 'path';

export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastCompleted: string | null;
  /** Only present on POST response — true if this completion caused a level-up */
  leveledUp?: boolean;
  /** XP awarded in this completion — 0 if daily already done today or practice already done this week */
  xpAwarded?: number;
}

// ── Level math helpers (exported for UI use) ────────────────────────────────

/** Cumulative XP required to reach a given level */
function xpForLevel(level: number): number {
  return (level * (level + 1) / 2) * 100;
}

/** Derive level from total XP using inverse of triangular formula */
export function levelFromXP(xp: number): number {
  return Math.floor((-1 + Math.sqrt(1 + 8 * xp / 100)) / 2);
}

/** XP earned within the current level (progress toward next) */
export function xpInCurrentLevel(xp: number, level: number): number {
  return xp - xpForLevel(level);
}

/** XP needed to advance from current level to the next */
export function xpForNextLevel(level: number): number {
  return (level + 1) * 100;
}

// ── ISO week helper ──────────────────────────────────────────────────────────

function getCurrentWeekKey(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay() || 7; // treat Sunday as 7
  d.setUTCDate(d.getUTCDate() + 4 - day); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
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

interface FsData {
  xp: number;
  level: number;
  streak: number;
  lastCompleted: string | null;
  lastPracticeWeek?: string;
}

function sanitizeUserId(userId: string): string {
  return userId.replace(/[^a-z0-9_-]/gi, '_');
}

function getFsPath(userId: string): string {
  const dir = path.join(process.cwd(), 'data', 'gamification');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${sanitizeUserId(userId)}.json`);
}

function fsReadRaw(userId: string): FsData {
  const filePath = getFsPath(userId);
  if (!fs.existsSync(filePath)) {
    return { xp: 0, level: 0, streak: 0, lastCompleted: null };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as FsData;
}

function fsGetData(userId: string): GamificationData {
  const { xp, level, streak, lastCompleted } = fsReadRaw(userId);
  return { xp, level, streak, lastCompleted };
}

function fsGetPracticeWeek(userId: string): string | null {
  return fsReadRaw(userId).lastPracticeWeek ?? null;
}

function fsSetData(userId: string, data: GamificationData, practiceWeek?: string): void {
  const existing = fsReadRaw(userId);
  const updated: FsData = {
    xp: data.xp,
    level: data.level,
    streak: data.streak,
    lastCompleted: data.lastCompleted,
    lastPracticeWeek: practiceWeek ?? existing.lastPracticeWeek,
  };
  fs.writeFileSync(getFsPath(userId), JSON.stringify(updated, null, 2));
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

async function redisGetPracticeWeek(userId: string): Promise<string | null> {
  const redis = getRedis();
  const val = await redis.get(`quiz:practice-week:${userId}`);
  return val ? String(val) : null;
}

async function redisSetData(userId: string, data: GamificationData, practiceWeek?: string): Promise<void> {
  const redis = getRedis();
  const writes = [
    redis.set(`quiz:xp:${userId}`, data.xp),
    redis.set(`quiz:level:${userId}`, data.level),
    redis.set(`quiz:streak:${userId}`, data.streak),
    redis.set(`quiz:last-completed:${userId}`, data.lastCompleted ?? ''),
  ];
  if (practiceWeek !== undefined) {
    writes.push(redis.set(`quiz:practice-week:${userId}`, practiceWeek));
  }
  await Promise.all(writes);
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
 *
 * Daily: idempotent per calendar day — calling twice on the same day does not
 * double-increment XP or streak.
 *
 * Practice: XP awarded once per ISO week. Subsequent calls the same week
 * return xpAwarded: 0 (state unchanged).
 */
export async function recordQuizCompletion(
  userId: string,
  type: 'daily' | 'practice',
): Promise<GamificationData> {
  const current = await getGamificationData(userId);

  const today = new Date().toISOString().split('T')[0];

  // ── Daily idempotency ────────────────────────────────────────────────────
  if (type === 'daily' && current.lastCompleted === today) {
    return { ...current, xpAwarded: 0 };
  }

  // ── Weekly practice cap ──────────────────────────────────────────────────
  let practiceWeekToWrite: string | undefined;
  let xpDelta: number;

  if (type === 'practice') {
    const currentWeek = getCurrentWeekKey();
    const lastPracticeWeek = useRedis()
      ? await redisGetPracticeWeek(userId)
      : fsGetPracticeWeek(userId);

    if (lastPracticeWeek === currentWeek) {
      return { ...current, xpAwarded: 0 };
    }
    xpDelta = 150;
    practiceWeekToWrite = currentWeek;
  } else {
    xpDelta = 100;
  }

  // ── XP + level ──────────────────────────────────────────────────────────
  const newXP = current.xp + xpDelta;
  const newLevel = levelFromXP(newXP);

  // ── Streak ───────────────────────────────────────────────────────────────
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  let newStreak: number;
  if (current.lastCompleted === yesterday) {
    newStreak = current.streak + 1;
  } else {
    newStreak = 1;
  }

  const updated: GamificationData = {
    xp: newXP,
    level: newLevel,
    streak: newStreak,
    lastCompleted: today,
    leveledUp: newLevel > current.level,
    xpAwarded: xpDelta,
  };

  if (useRedis()) {
    await redisSetData(userId, updated, practiceWeekToWrite);
  } else {
    fsSetData(userId, updated, practiceWeekToWrite);
  }

  return updated;
}
