import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { jsonrepair } from 'jsonrepair';
import type { LegalEvent, EventsStore, EventCity, EventType } from './types';

// ─── Backend detection ────────────────────────────────────────────────────────

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

// ─── Filesystem paths ─────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data', 'briefings');
const FS_EVENTS_PATH = path.join(DATA_DIR, 'events-current.json');

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ─── Storage: getEvents ────────────────────────────────────────────────────────

export async function getEvents(): Promise<EventsStore | null> {
  if (useRedis()) {
    const redis = getRedis();
    const data = await redis.get('events:current');
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  // Filesystem fallback (dev)
  try {
    const content = fs.readFileSync(FS_EVENTS_PATH, 'utf-8');
    return JSON.parse(content) as EventsStore;
  } catch {
    return null;
  }
}

// ─── Storage: saveEvents ───────────────────────────────────────────────────────

export async function saveEvents(store: EventsStore): Promise<void> {
  if (useRedis()) {
    const redis = getRedis();
    await redis.set('events:current', JSON.stringify(store));
    return;
  }

  // Filesystem fallback (dev)
  ensureDir();
  fs.writeFileSync(FS_EVENTS_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── ID generation ────────────────────────────────────────────────────────────

function buildEventId(organiser: string, title: string, date: string): string {
  return `${organiser}-${title}-${date}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// ─── JSON extraction (handles markdown fences + array fallback) ───────────────

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) return arrMatch[0];
  throw new Error('No JSON found in model response');
}

// ─── Tavily search ────────────────────────────────────────────────────────────

const TAVILY_TIMEOUT_MS = 12_000;
const CONTENT_LIMIT = 800;

const EVENT_QUERIES = [
  'site:eventbrite.co.uk law legal networking students UK 2026',
  'site:lawsociety.org.uk events students 2026',
  'law firm open day insight day student event London 2026 register',
  'magic circle silver circle law firm student networking drinks 2026',
  'UK law school careers fair recruitment event 2026 register',
  'legal networking event London Manchester Edinburgh Bristol students 2026',
  'City law firm diversity inclusion student event workshop 2026',
  'bar association law society student panel discussion 2026',
  'Linklaters Freshfields Clifford Chance Allen Overy student event 2026',
  'UK legal sector trainee student social networking event April May 2026',
];

async function searchForEvents(): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return '(no web search — Tavily API key not set)';

  const results = await Promise.all(
    EVENT_QUERIES.map((q) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TAVILY_TIMEOUT_MS);
      return fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          api_key: apiKey,
          query: q,
          search_depth: 'basic',
          topic: 'general',      // general index crawls event listing sites (Eventbrite, firm sites)
          days: 60,              // look back 60 days — event pages stay live well before the event
          max_results: 5,
          include_answer: false,
        }),
      })
        .then((r) => r.json())
        .catch(() => ({ results: [] }))
        .finally(() => clearTimeout(timer));
    })
  );

  const items = results
    .flatMap((r) => (r.results ?? []) as { url: string; title: string; content: string }[])
    .map((item) => {
      const content =
        item.content.length > CONTENT_LIMIT
          ? item.content.slice(0, CONTENT_LIMIT).trimEnd() + '…'
          : item.content;
      return `SOURCE: ${item.url}\nTITLE: ${item.title}\nCONTENT: ${content}`;
    })
    .join('\n\n---\n\n');

  return items || '(no search results returned)';
}

// ─── Claude Haiku synthesis ───────────────────────────────────────────────────

const SYSTEM_PROMPT =
  'You extract structured event data from web search results. Output raw JSON array only — no markdown, no explanation. Only include events with a confirmed date. Drop events without a specific date.';

function buildUserPrompt(tavilyContent: string, today: string): string {
  return `Extract all upcoming UK legal student events from the search results below. Return a JSON array of objects matching this interface:

{
  "title": string,
  "date": "YYYY-MM-DD",         // required — drop event if unknown
  "time": "HH:MM" | null,       // null if unknown
  "city": "London" | "Manchester" | "Edinburgh" | "Bristol" | "Other",
  "venue": string | null,       // null if unknown
  "organiser": string,
  "eventType": "Networking" | "Panel" | "Workshop" | "Social" | "Career Fair",
  "eligibility": string,        // infer from context or use "Open to all students"
  "description": string,
  "whyAttend": string,          // 1-2 sentence editorial note on why a law student would benefit
  "sourceUrl": string           // registration link; fallback: "https://www.lawsociety.org.uk"
}

Priority order:
1. Firm-hosted student social events (run clubs, pilates, drinks, networking dinners)
2. Law Society, bar association, legal charity student events
If fewer than 5 events from firm sources, include Law Society/legal student events to reach at least 5 total.

Rules:
- Only include events with a specific confirmed date (YYYY-MM-DD)
- Drop any event where date < ${today}
- venue: null if unknown
- time: null if unknown
- city must be one of: London, Manchester, Edinburgh, Bristol, or "Other" for anywhere else in the UK
- sourceUrl is required — fallback to "https://www.lawsociety.org.uk" if no URL found
- eligibility must be present — infer from context or use "Open to all students"
- whyAttend: write 1-2 sentences on why a law student would benefit from this event

Return ONLY the raw JSON array. No markdown, no explanation.

--- SEARCH RESULTS ---

${tavilyContent}`;
}

async function synthesiseEvents(tavilyContent: string): Promise<LegalEvent[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set');

  const anthropic = new Anthropic({ apiKey });
  const today = new Date().toISOString().split('T')[0];

  const completion = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(tavilyContent, today) }],
  });

  const text = completion.content[0]?.type === 'text' ? completion.content[0].text : '';

  let parsed: unknown[];
  try {
    const jsonStr = extractJSON(text);
    const repaired = jsonrepair(jsonStr);
    parsed = JSON.parse(repaired) as unknown[];
  } catch (err) {
    console.error('[events] JSON parse failed. Raw output (first 500 chars):', text.slice(0, 500));
    throw err;
  }

  const VALID_CITIES: EventCity[] = ['London', 'Manchester', 'Edinburgh', 'Bristol', 'Other'];
  const VALID_TYPES: EventType[] = ['Networking', 'Panel', 'Workshop', 'Social', 'Career Fair'];

  const events: LegalEvent[] = parsed
    .filter((raw): raw is Record<string, unknown> => !!raw && typeof raw === 'object')
    .filter((raw) => {
      const date = raw.date as string | undefined;
      return !!date && date >= today;
    })
    .map((raw) => {
      const organiser = String(raw.organiser ?? 'Unknown');
      const title = String(raw.title ?? 'Event');
      const date = String(raw.date);
      const city = VALID_CITIES.includes(raw.city as EventCity)
        ? (raw.city as EventCity)
        : 'Other';
      const eventType = VALID_TYPES.includes(raw.eventType as EventType)
        ? (raw.eventType as EventType)
        : 'Networking';

      const event: LegalEvent = {
        id: buildEventId(organiser, title, date),
        title,
        date,
        city,
        organiser,
        eventType,
        eligibility: String(raw.eligibility ?? 'Open to all students'),
        description: String(raw.description ?? ''),
        whyAttend: String(raw.whyAttend ?? ''),
        sourceUrl: String(raw.sourceUrl ?? 'https://www.lawsociety.org.uk'),
      };

      if (raw.time && typeof raw.time === 'string') {
        event.time = raw.time;
      }
      if (raw.venue && typeof raw.venue === 'string') {
        event.venue = raw.venue;
      }

      return event;
    });

  return events;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateEvents(): Promise<EventsStore> {
  const tavilyContent = await searchForEvents();
  const events = await synthesiseEvents(tavilyContent);
  const store: EventsStore = { events, generatedAt: new Date().toISOString() };
  await saveEvents(store);
  return store;
}
