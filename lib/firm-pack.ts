/**
 * firm-pack.ts
 *
 * Generates and caches per-firm interview packs (10 practice questions).
 * Questions are tailored to the firm's identity and recent news stories.
 *
 * Cache TTL: 7 days — stale packs are regenerated on next page visit.
 * Storage: Redis (prod) / data/firms/{slug}-pack.json (dev).
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import type { FirmProfile } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FirmInterviewPack {
  firmSlug: string;
  generatedAt: string;         // ISO 8601
  practiceQuestions: string[]; // exactly 10
}

// ─── Config ───────────────────────────────────────────────────────────────────

const FIRMS_DIR = path.join(process.cwd(), 'data', 'firms');
const PACK_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isStale(generatedAt: string): boolean {
  return Date.now() - new Date(generatedAt).getTime() > PACK_TTL_MS;
}

// ─── Filesystem backend ───────────────────────────────────────────────────────

function fsPackPath(slug: string): string {
  return path.join(FIRMS_DIR, `${slug}-pack.json`);
}

function fsGetPack(slug: string): FirmInterviewPack | null {
  try {
    const content = fs.readFileSync(fsPackPath(slug), 'utf-8');
    return JSON.parse(content) as FirmInterviewPack;
  } catch {
    return null;
  }
}

function fsSavePack(pack: FirmInterviewPack): void {
  if (!fs.existsSync(FIRMS_DIR)) fs.mkdirSync(FIRMS_DIR, { recursive: true });
  fs.writeFileSync(fsPackPath(pack.firmSlug), JSON.stringify(pack, null, 2), 'utf-8');
}

// ─── Redis backend ────────────────────────────────────────────────────────────

async function redisGetPack(slug: string): Promise<FirmInterviewPack | null> {
  const redis = getRedis();
  const data = await redis.get(`firm-pack:${slug}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

async function redisSavePack(pack: FirmInterviewPack): Promise<void> {
  const redis = getRedis();
  // TTL slightly longer than PACK_TTL_MS so Redis doesn't expire before we check staleness
  await redis.set(`firm-pack:${pack.firmSlug}`, JSON.stringify(pack), {
    ex: 8 * 24 * 60 * 60,
  });
}

// ─── Generation ───────────────────────────────────────────────────────────────

async function generatePack(
  firm: FirmProfile,
  recentHeadlines: string[],
): Promise<FirmInterviewPack> {
  const client = new Anthropic();

  const headlinesBlock =
    recentHeadlines.length > 0
      ? `Recent news stories mentioning ${firm.shortName} (use these for specific commercial awareness questions):\n${recentHeadlines
          .slice(0, 8)
          .map((h, i) => `${i + 1}. ${h}`)
          .join('\n')}`
      : `No recent stories tagged to ${firm.shortName} this week — base all questions on the firm's profile and market position.`;

  const prompt = `You are helping a UK law student prepare for a ${firm.name} (${firm.tier}) training contract interview.

Firm profile:
- Full name: ${firm.name}
- Known for: ${firm.knownFor}
- Key practice areas: ${firm.practiceAreas.join(', ')}
- Culture: ${firm.culture}
- Interview focus: ${firm.interviewFocus}

${headlinesBlock}

Generate exactly 10 interview practice questions for this specific firm. Use this exact mix:
- 2 questions: "Why ${firm.shortName}?" — specific to this firm's identity, strategy, or recent developments. Not generic "why law" questions.
- 3 questions: Commercial awareness — tied to the firm's practice areas and/or the recent stories above. Ask about deal trends, regulatory shifts, or market dynamics relevant to what this firm actually does.
- 2 questions: Culture and working style — relevant to this firm's specific environment, not boilerplate.
- 2 questions: Deal or market awareness — ask the candidate to analyse a specific type of transaction or regulatory development this firm handles.
- 1 question: A harder, probing question — tests genuine depth of commercial knowledge, not surface-level prep.

Rules:
- Every question must be specific to ${firm.shortName}. Avoid generic questions applicable to any law firm.
- Phrase as an interviewer asking directly (second person: "How would you...?", "What is your view on...?", "Walk me through...").
- Do not number the questions. One question per line. No bullet points.
- No introductory text, no section labels, no explanations — 10 questions only.

Output: 10 lines, one question per line.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 900,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

  const questions = raw
    .split('\n')
    .map((l) => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•]\s*/, '').trim())
    .filter((l) => l.length > 15)
    .slice(0, 10);

  return {
    firmSlug: firm.slug,
    generatedAt: new Date().toISOString(),
    practiceQuestions: questions,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the cached interview pack for a firm, regenerating if stale or absent.
 * Throws if generation fails — callers should wrap in try/catch.
 */
export async function getFirmInterviewPack(
  firm: FirmProfile,
  recentHeadlines: string[],
): Promise<FirmInterviewPack> {
  // 1. Check cache
  const cached = useRedis()
    ? await redisGetPack(firm.slug)
    : fsGetPack(firm.slug);

  if (cached && !isStale(cached.generatedAt)) {
    return cached;
  }

  // 2. Generate fresh pack
  const pack = await generatePack(firm, recentHeadlines);

  // 3. Persist
  if (useRedis()) {
    await redisSavePack(pack);
  } else {
    fsSavePack(pack);
  }

  return pack;
}
