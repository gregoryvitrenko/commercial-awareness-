import fs from 'fs';
import path from 'path';
import type { TrackedApplication } from './types';

// ─── Backend detection ────────────────────────────────────────────────────────

function useRedis(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Redis } = require('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ─── Filesystem fallback ──────────────────────────────────────────────────────

const TRACKER_FILE = path.join(process.cwd(), 'data', 'tracker.json');

function fsReadAll(): Record<string, TrackedApplication[]> {
  try {
    if (!fs.existsSync(TRACKER_FILE)) return {};
    return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function fsWrite(data: Record<string, TrackedApplication[]>): void {
  const dir = path.dirname(TRACKER_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getTrackerForUser(userId: string): Promise<TrackedApplication[]> {
  if (useRedis()) {
    const redis = getRedis();
    const data = await redis.get(`tracker:${userId}`);
    if (!data) return [];
    return typeof data === 'string' ? JSON.parse(data) : (data as TrackedApplication[]);
  }
  const all = fsReadAll();
  return all[userId] ?? [];
}

export async function setTrackerForUser(userId: string, items: TrackedApplication[]): Promise<void> {
  if (useRedis()) {
    const redis = getRedis();
    await redis.set(`tracker:${userId}`, JSON.stringify(items));
    return;
  }
  const all = fsReadAll();
  all[userId] = items;
  fsWrite(all);
}
