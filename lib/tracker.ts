import type { TrackerEntry } from './types';
import * as fs from 'fs';
import * as path from 'path';

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

async function redisGet(userId: string): Promise<TrackerEntry[]> {
  const redis = getRedis();
  const raw = await redis.get(`tracker:${userId}`);
  if (!raw) return [];
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return Array.isArray(parsed) ? parsed : [];
}

async function redisSet(userId: string, entries: TrackerEntry[]): Promise<void> {
  const redis = getRedis();
  await redis.set(`tracker:${userId}`, JSON.stringify(entries));
}

function getFilePath(userId: string): string {
  const dir = path.join(process.cwd(), 'data', 'tracker');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${userId}.json`);
}

function fsGet(userId: string): TrackerEntry[] {
  const filePath = getFilePath(userId);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function fsSet(userId: string, entries: TrackerEntry[]): void {
  fs.writeFileSync(getFilePath(userId), JSON.stringify(entries, null, 2));
}

export async function getEntries(userId: string): Promise<TrackerEntry[]> {
  if (useRedis()) return redisGet(userId);
  return fsGet(userId);
}

export async function addEntry(userId: string, entry: TrackerEntry): Promise<TrackerEntry[]> {
  const entries = await getEntries(userId);
  entries.push(entry);
  if (useRedis()) await redisSet(userId, entries);
  else fsSet(userId, entries);
  return entries;
}

export async function updateEntry(
  userId: string,
  id: string,
  patch: Partial<Pick<TrackerEntry, 'status' | 'notes'>>,
): Promise<TrackerEntry[]> {
  const entries = await getEntries(userId);
  const idx = entries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], ...patch, updatedAt: new Date().toISOString() };
  }
  if (useRedis()) await redisSet(userId, entries);
  else fsSet(userId, entries);
  return entries;
}

export async function deleteEntry(userId: string, id: string): Promise<TrackerEntry[]> {
  const entries = (await getEntries(userId)).filter((e) => e.id !== id);
  if (useRedis()) await redisSet(userId, entries);
  else fsSet(userId, entries);
  return entries;
}
