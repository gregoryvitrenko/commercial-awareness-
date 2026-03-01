import fs from 'fs';
import path from 'path';
import type { Briefing } from './types';

// ─── Backend detection ────────────────────────────────────────────────────────
// Uses Vercel KV when KV env vars are present (Vercel production).
// Falls back to local filesystem for dev / self-hosted deployments.

function useKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ─── Vercel KV backend ────────────────────────────────────────────────────────

async function kvSave(briefing: Briefing): Promise<void> {
  const { kv } = await import('@vercel/kv');
  await Promise.all([
    kv.set(`briefing:${briefing.date}`, briefing),
    kv.zadd('briefing:index', {
      score: new Date(briefing.date).getTime(),
      member: briefing.date,
    }),
  ]);
}

async function kvGet(date: string): Promise<Briefing | null> {
  const { kv } = await import('@vercel/kv');
  return kv.get<Briefing>(`briefing:${date}`);
}

async function kvList(): Promise<string[]> {
  const { kv } = await import('@vercel/kv');
  const dates = await kv.zrange('briefing:index', 0, -1, { rev: true });
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
  const filePath = path.join(DATA_DIR, `${briefing.date}.json`);
  fs.writeFileSync(filePath, JSON.stringify(briefing, null, 2), 'utf-8');
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

// ─── Public API (always async) ────────────────────────────────────────────────

export async function saveBriefing(briefing: Briefing): Promise<void> {
  if (useKV()) {
    await kvSave(briefing);
  } else {
    fsSave(briefing);
  }
}

export async function getBriefing(date: string): Promise<Briefing | null> {
  if (useKV()) return kvGet(date);
  return fsGet(date);
}

export async function listBriefings(): Promise<string[]> {
  if (useKV()) return kvList();
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
