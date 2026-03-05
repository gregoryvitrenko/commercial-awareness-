import fs from 'fs';
import path from 'path';
import type { Briefing, DailyQuiz } from './types';
import type { AptitudeQuestion } from './aptitude';
import { isValidDate } from './security';

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
  if (!isValidDate(date)) return null;
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

// ─── Quiz storage ─────────────────────────────────────────────────────────────

async function redisSaveQuiz(quiz: DailyQuiz): Promise<void> {
  const redis = getRedis();
  await redis.set(`quiz:${quiz.date}`, JSON.stringify(quiz));
}

async function redisGetQuiz(date: string): Promise<DailyQuiz | null> {
  const redis = getRedis();
  const data = await redis.get(`quiz:${date}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

function fsSaveQuiz(quiz: DailyQuiz): void {
  ensureDir();
  fs.writeFileSync(
    path.join(DATA_DIR, `${quiz.date}-quiz.json`),
    JSON.stringify(quiz, null, 2),
    'utf-8'
  );
}

function fsGetQuiz(date: string): DailyQuiz | null {
  try {
    const content = fs.readFileSync(path.join(DATA_DIR, `${date}-quiz.json`), 'utf-8');
    return JSON.parse(content) as DailyQuiz;
  } catch {
    return null;
  }
}

export async function saveQuiz(quiz: DailyQuiz): Promise<void> {
  if (useRedis()) {
    await redisSaveQuiz(quiz);
  } else {
    fsSaveQuiz(quiz);
  }
}

export async function getQuiz(date: string): Promise<DailyQuiz | null> {
  if (!isValidDate(date)) return null;
  if (useRedis()) return redisGetQuiz(date);
  return fsGetQuiz(date);
}

// ─── Quiz date listing ────────────────────────────────────────────────────────

function fsListQuizDates(): string[] {
  ensureDir();
  try {
    return fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith('-quiz.json'))
      .map((f) => f.replace('-quiz.json', ''))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort((a, b) => b.localeCompare(a));
  } catch {
    return [];
  }
}

export async function listQuizDates(): Promise<string[]> {
  // In Redis mode, quiz dates align with briefing dates — use briefing index.
  if (useRedis()) return redisList();
  return fsListQuizDates();
}

// ─── Podcast date listing ─────────────────────────────────────────────────────
// Delegates to podcast-storage (Vercel Blob in prod, filesystem in dev).
export { listPodcastDates } from './podcast-storage';

// ─── Aptitude question bank ────────────────────────────────────────────────────
// Persistent pool of questions per test type, refreshed weekly.
// All users draw random subsets from the same bank — no per-user API calls.

export interface AptitudeBankStore {
  questions: AptitudeQuestion[];
  lastRefreshed: string; // YYYY-MM-DD
}

async function redisSaveAptitudeBank(testType: string, data: AptitudeBankStore): Promise<void> {
  const redis = getRedis();
  await redis.set(`aptitude-bank:${testType}`, JSON.stringify(data));
}

async function redisGetAptitudeBank(testType: string): Promise<AptitudeBankStore | null> {
  const redis = getRedis();
  const raw = await redis.get(`aptitude-bank:${testType}`);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

function fsSaveAptitudeBank(testType: string, data: AptitudeBankStore): void {
  ensureDir();
  fs.writeFileSync(
    path.join(DATA_DIR, `aptitude-bank-${testType}.json`),
    JSON.stringify(data, null, 2),
    'utf-8',
  );
}

function fsGetAptitudeBank(testType: string): AptitudeBankStore | null {
  try {
    const content = fs.readFileSync(
      path.join(DATA_DIR, `aptitude-bank-${testType}.json`),
      'utf-8',
    );
    return JSON.parse(content) as AptitudeBankStore;
  } catch {
    return null;
  }
}

export async function saveAptitudeBank(testType: string, data: AptitudeBankStore): Promise<void> {
  if (useRedis()) {
    await redisSaveAptitudeBank(testType, data);
  } else {
    fsSaveAptitudeBank(testType, data);
  }
}

export async function getAptitudeBank(testType: string): Promise<AptitudeBankStore | null> {
  if (useRedis()) return redisGetAptitudeBank(testType);
  return fsGetAptitudeBank(testType);
}
