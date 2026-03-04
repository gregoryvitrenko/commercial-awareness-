import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { auth } from '@clerk/nextjs/server';
import { getBriefing, getTodayDate } from '@/lib/storage';
import { isValidDate } from '@/lib/security';

export const maxDuration = 60;

const DATA_DIR = path.join(process.cwd(), 'data', 'briefings');

function scriptFile(date: string): string {
  return path.join(DATA_DIR, `${date}-podcast.txt`);
}

function getCachedScript(date: string): string | null {
  try {
    return fs.readFileSync(scriptFile(date), 'utf-8');
  } catch {
    return null;
  }
}

function saveScript(date: string, script: string): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(scriptFile(date), script, 'utf-8');
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    console.warn('[podcast] POST — unauthenticated request rejected');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const rawDate = body.date ?? getTodayDate();
  const targetDate = isValidDate(rawDate) ? rawDate : getTodayDate();
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;

  // ── Return cached script immediately — no Claude call, no ElevenLabs charge ──
  const cached = getCachedScript(targetDate);
  if (cached) {
    return NextResponse.json({ script: cached, hasElevenLabs });
  }

  const briefing = await getBriefing(targetDate);
  if (!briefing) {
    return NextResponse.json({ error: 'No briefing found for this date' }, { status: 404 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[podcast] ANTHROPIC_API_KEY is not configured.');
    return NextResponse.json({ error: 'Podcast generation is currently unavailable.' }, { status: 500 });
  }

  const dateStr = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const storiesJson = JSON.stringify(
    briefing.stories.map((s) => ({
      topic: s.topic,
      headline: s.headline,
      summary: s.summary,
      whyItMatters: s.whyItMatters,
    })),
    null,
    2
  );

  const prompt = `You are writing a podcast script for "Commercial Awareness Daily", a morning briefing for law students targeting Magic Circle, Silver Circle and elite US law firms — modelled closely on the FT News Briefing.

Write a 3–4 minute podcast script (roughly 450–550 words of spoken content) based on the stories below for ${dateStr}.

Style guide:
- Natural spoken language, not written prose — write exactly as it would be said aloud
- Warm but authoritative tone, like an FT News Briefing presenter
- Crisp intro: greet the listener, give the date, say how many stories
- Lead with the standout story: "The biggest story this morning is..."
- Smooth transitions between topics: "Turning now to the capital markets...", "Meanwhile, on the regulatory front...", "Across the Atlantic..."
- Never say "Story 1", "Story 2" or number stories
- Weave in why each story matters for law firms naturally — don't label it, just include the angle
- Close with Sector Watch and One to Follow as a "what to watch this week" segment
- Sign off: "That's your Commercial Awareness Daily for ${dateStr}. Good morning."
- No music cues, stage directions, or brackets — plain spoken text only

Today's stories:
${storiesJson}

Sector Watch: ${briefing.sectorWatch}
One to Follow: ${briefing.oneToFollow}`;

  const anthropic = new Anthropic({ apiKey });

  let script: string;
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = message.content[0];
    script = block.type === 'text' ? block.text : '';
  } catch (err) {
    console.error('[podcast] Anthropic API error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Script generation failed: ${msg}` },
      { status: 502 }
    );
  }

  if (!script) {
    return NextResponse.json({ error: 'Script generation returned empty.' }, { status: 500 });
  }

  // Persist to disk — subsequent requests return this cached version
  saveScript(targetDate, script);

  return NextResponse.json({ script, hasElevenLabs });
}
