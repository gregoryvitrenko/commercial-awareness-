import fs from 'fs';
import path from 'path';
import type { Bookmark } from './bookmarks';

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

const BOOKMARKS_FILE = path.join(process.cwd(), 'data', 'bookmarks.json');

function fsReadAll(): Record<string, Bookmark[]> {
  try {
    if (!fs.existsSync(BOOKMARKS_FILE)) return {};
    return JSON.parse(fs.readFileSync(BOOKMARKS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function fsWrite(data: Record<string, Bookmark[]>): void {
  const dir = path.dirname(BOOKMARKS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BOOKMARKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getBookmarksForUser(userId: string): Promise<Bookmark[]> {
  if (useRedis()) {
    const redis = getRedis();
    const data = await redis.get(`bookmarks:${userId}`);
    if (!data) return [];
    return typeof data === 'string' ? JSON.parse(data) : (data as Bookmark[]);
  }
  const all = fsReadAll();
  return all[userId] ?? [];
}

export async function addBookmarkForUser(userId: string, bookmark: Bookmark): Promise<void> {
  const existing = await getBookmarksForUser(userId);
  const filtered = existing.filter(
    (b) => !(b.date === bookmark.date && b.storyId === bookmark.storyId)
  );
  const updated = [bookmark, ...filtered];
  if (useRedis()) {
    const redis = getRedis();
    await redis.set(`bookmarks:${userId}`, JSON.stringify(updated));
    return;
  }
  const all = fsReadAll();
  all[userId] = updated;
  fsWrite(all);
}

export async function removeBookmarkForUser(
  userId: string,
  date: string,
  storyId: string
): Promise<void> {
  const existing = await getBookmarksForUser(userId);
  const updated = existing.filter(
    (b) => !(b.date === date && b.storyId === storyId)
  );
  if (useRedis()) {
    const redis = getRedis();
    await redis.set(`bookmarks:${userId}`, JSON.stringify(updated));
    return;
  }
  const all = fsReadAll();
  all[userId] = updated;
  fsWrite(all);
}
