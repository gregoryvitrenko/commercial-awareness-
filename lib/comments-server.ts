import fs from 'fs';
import path from 'path';
import type { Comment } from './types';

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

const COMMENTS_FILE = path.join(process.cwd(), 'data', 'comments.json');

function threadKey(date: string, storyId: string): string {
  return `${date}:${storyId}`;
}

function fsReadAll(): Record<string, Comment[]> {
  try {
    if (!fs.existsSync(COMMENTS_FILE)) return {};
    return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function fsWrite(data: Record<string, Comment[]>): void {
  const dir = path.dirname(COMMENTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getComments(date: string, storyId: string): Promise<Comment[]> {
  const key = threadKey(date, storyId);
  if (useRedis()) {
    const redis = getRedis();
    const data = await redis.get(`comments:${key}`);
    if (!data) return [];
    return typeof data === 'string' ? JSON.parse(data) : (data as Comment[]);
  }
  const all = fsReadAll();
  return all[key] ?? [];
}

export async function addComment(comment: Comment): Promise<void> {
  const key = threadKey(comment.date, comment.storyId);
  const existing = await getComments(comment.date, comment.storyId);
  const updated = [comment, ...existing];
  if (useRedis()) {
    const redis = getRedis();
    await redis.set(`comments:${key}`, JSON.stringify(updated));
    return;
  }
  const all = fsReadAll();
  all[key] = updated;
  fsWrite(all);
}

export async function deleteComment(
  date: string,
  storyId: string,
  commentId: string,
  requestingUserId: string
): Promise<'ok' | 'not-found' | 'forbidden'> {
  const key = threadKey(date, storyId);
  const existing = await getComments(date, storyId);
  const target = existing.find((c) => c.id === commentId);
  if (!target) return 'not-found';
  if (target.userId !== requestingUserId) return 'forbidden';
  const updated = existing.filter((c) => c.id !== commentId);
  if (useRedis()) {
    const redis = getRedis();
    await redis.set(`comments:${key}`, JSON.stringify(updated));
    return 'ok';
  }
  const all = fsReadAll();
  all[key] = updated;
  fsWrite(all);
  return 'ok';
}
