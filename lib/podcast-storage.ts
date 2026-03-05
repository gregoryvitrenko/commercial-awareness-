/**
 * Podcast storage abstraction — dual-backend for scripts (Redis/FS),
 * dual-backend for MP3s (Vercel Blob/FS).
 *
 * Backend detection:
 *   - Blob:  !!process.env.BLOB_READ_WRITE_TOKEN  (Vercel production)
 *   - Redis: !!process.env.UPSTASH_REDIS_REST_URL  (Vercel production)
 *   - Filesystem: fallback for both (local dev)
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'briefings');

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ─── Backend detection ────────────────────────────────────────────────────────

function useBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

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

// ─── Script storage (text, ~6KB) ──────────────────────────────────────────────
// Redis in production, filesystem in dev.

export async function getCachedScript(date: string): Promise<string | null> {
  if (useRedis()) {
    const redis = getRedis();
    return await redis.get(`podcast-script:${date}`);
  }
  // Filesystem fallback (dev)
  try {
    return fs.readFileSync(path.join(DATA_DIR, `${date}-podcast.txt`), 'utf-8');
  } catch {
    return null;
  }
}

export async function saveScript(date: string, script: string): Promise<void> {
  if (useRedis()) {
    const redis = getRedis();
    await redis.set(`podcast-script:${date}`, script);
    return;
  }
  // Filesystem fallback (dev)
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, `${date}-podcast.txt`), script, 'utf-8');
}

// ─── MP3 storage (binary, 7-9MB) ─────────────────────────────────────────────
// Vercel Blob in production, filesystem in dev.
// Blob pathnames: podcasts/{date}-{voiceId}.mp3

const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9';

function blobPathname(date: string, voiceId: string): string {
  return `podcasts/${date}-${voiceId}.mp3`;
}

function legacyBlobPathname(date: string): string {
  return `podcasts/${date}.mp3`;
}

/** Returns the public Blob URL if the MP3 exists, null otherwise. */
export async function getAudioUrl(
  date: string,
  voiceId: string
): Promise<string | null> {
  if (!useBlob()) return null;

  const { head } = await import('@vercel/blob');
  try {
    const blob = await head(blobPathname(date, voiceId));
    return blob.url;
  } catch {
    // Blob not found — try legacy pathname for default voice
    if (voiceId === DEFAULT_VOICE_ID) {
      try {
        const legacy = await head(legacyBlobPathname(date));
        return legacy.url;
      } catch { /* not found */ }
    }
    return null;
  }
}

/** Returns the raw MP3 buffer from filesystem (dev only). */
export function getAudioBuffer(
  date: string,
  voiceId: string
): Buffer | null {
  const primary = path.join(DATA_DIR, `${date}-podcast-${voiceId}.mp3`);
  try {
    return fs.readFileSync(primary);
  } catch {
    // Legacy fallback
    if (voiceId === DEFAULT_VOICE_ID) {
      try {
        return fs.readFileSync(path.join(DATA_DIR, `${date}-podcast.mp3`));
      } catch { /* none */ }
    }
    return null;
  }
}

/** Check if audio exists (for ?check=true lightweight probe). */
export async function audioExists(
  date: string,
  voiceId: string
): Promise<boolean> {
  if (useBlob()) {
    return (await getAudioUrl(date, voiceId)) !== null;
  }
  // Filesystem check (dev)
  const primary = path.join(DATA_DIR, `${date}-podcast-${voiceId}.mp3`);
  if (fs.existsSync(primary)) return true;
  if (voiceId === DEFAULT_VOICE_ID) {
    return fs.existsSync(path.join(DATA_DIR, `${date}-podcast.mp3`));
  }
  return false;
}

/** Save MP3 audio bytes. Returns the public URL (Blob) or null (FS). */
export async function saveAudio(
  date: string,
  voiceId: string,
  audioBuffer: Buffer
): Promise<string | null> {
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(blobPathname(date, voiceId), audioBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'audio/mpeg',
      cacheControlMaxAge: 86400 * 30, // 30 days
    });
    return blob.url;
  }
  // Filesystem fallback (dev)
  ensureDir();
  fs.writeFileSync(
    path.join(DATA_DIR, `${date}-podcast-${voiceId}.mp3`),
    audioBuffer
  );
  return null;
}

// ─── Listing podcast dates ────────────────────────────────────────────────────

export async function listPodcastDates(): Promise<string[]> {
  if (useBlob()) {
    const { list } = await import('@vercel/blob');
    const seen = new Set<string>();
    let cursor: string | undefined;
    do {
      const result = await list({
        prefix: 'podcasts/',
        ...(cursor ? { cursor } : {}),
      });
      for (const blob of result.blobs) {
        // pathname: podcasts/2026-03-05-onwK4e9ZLuTAKqWW03F9.mp3
        const match = blob.pathname.match(/^podcasts\/(\d{4}-\d{2}-\d{2})/);
        if (match) seen.add(match[1]);
      }
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);
    return [...seen].sort((a, b) => b.localeCompare(a));
  }

  // Filesystem fallback (dev)
  try {
    ensureDir();
    const files = fs.readdirSync(DATA_DIR);
    const seen = new Set<string>();
    for (const f of files) {
      const m = f.match(/^(\d{4}-\d{2}-\d{2})-podcast/);
      if (m) seen.add(m[1]);
    }
    return [...seen].sort((a, b) => b.localeCompare(a));
  } catch {
    return [];
  }
}
