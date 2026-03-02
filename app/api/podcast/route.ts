import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getBriefing, getTodayDate } from '@/lib/storage';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const targetDate = body.date ?? getTodayDate();

  const briefing = await getBriefing(targetDate);
  if (!briefing) {
    return NextResponse.json({ error: 'No briefing found for this date' }, { status: 404 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 });
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

  const prompt = `You are writing a podcast script for "Commercial Awareness Daily", a morning briefing for law students targeting Magic Circle and elite US law firms — modelled closely on the FT News Briefing.

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

  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048,
  });

  const script = completion.choices[0]?.message?.content ?? '';
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({ script, hasElevenLabs });
}
