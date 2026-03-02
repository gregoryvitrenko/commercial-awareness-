import fs from 'fs';
import path from 'path';
import type { Briefing } from './types';

// ─── Backend detection ────────────────────────────────────────────────────────
// Uses Upstash Redis when env vars are present (production on Vercel).
// Falls back to local filesystem for dev.

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

// ─── Redis backend ────────────────────────────────────────────────────────────

async function redisSave(briefing: Briefing): Promise<void> {
  const redis = getRedis();
  await Promise.all([
    redis.set(`briefing:${briefing.date}`, JSON.stringify(briefing)),
    redis.zadd('briefing:index', {
      score: new Date(briefing.date).getTime(),
      member: briefing.date,
    }),
  ]);
}

async function redisGet(date: string): Promise<Briefing | null> {
  const redis = getRedis();
  const data = await redis.get(`briefing:${date}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

async function redisList(): Promise<string[]> {
  const redis = getRedis();
  const dates = await redis.zrange('briefing:index', 0, -1, { rev: true });
  return dates as string[];
}

// ─── Filesystem backend ───────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data', 'briefings');

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function fsSave(briefing: Briefing): void {
  ensureDir();
  fs.writeFileSync(
    path.join(DATA_DIR, `${briefing.date}.json`),
    JSON.stringify(briefing, null, 2),
    'utf-8'
  );
}

function fsGet(date: string): Briefing | null {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, `${date}.json`), 'utf-8');
    return JSON.parse(content) as Briefing;
  } catch {
    return null;
  }
}

function fsList(): string[] {
  ensureDir();
  try {
    return fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort((a, b) => b.localeCompare(a));
  } catch {
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function saveBriefing(briefing: Briefing): Promise<void> {
  if (useRedis()) {
    await redisSave(briefing);
  } else {
    fsSave(briefing);
  }
}

export async function getBriefing(date: string): Promise<Briefing | null> {
  if (useRedis()) return redisGet(date);
  return fsGet(date);
}

export async function listBriefings(): Promise<string[]> {
  if (useRedis()) return redisList();
  return fsList();
}

export async function getLatestBriefing(): Promise<Briefing | null> {
  const dates = await listBriefings();
  if (dates.length === 0) return null;
  return getBriefing(dates[0]);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
