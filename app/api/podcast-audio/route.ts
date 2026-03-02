import { NextRequest, NextResponse } from 'next/server';
import { hasCapacity, getMonthlyUsage, recordUsage } from '@/lib/char-usage';

export const maxDuration = 60;

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — fallback default

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
  }

  const body = await request.json();
  const { script, voiceId } = body as { script?: string; voiceId?: string };
  if (!script) {
    return NextResponse.json({ error: 'No script provided' }, { status: 400 });
  }

  // ── Monthly character limit check ─────────────────────────────────────────
  const charCount = script.length;
  if (!hasCapacity(charCount)) {
    const { used, limit } = getMonthlyUsage();
    return NextResponse.json(
      {
        error: `Monthly ElevenLabs quota reached (${used.toLocaleString()} / ${limit.toLocaleString()} characters used). Resets on the 1st of next month.`,
      },
      { status: 429 }
    );
  }

  const resolvedVoiceId = voiceId || VOICE_ID;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: script,
      model_id: 'eleven_turbo_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  // Record usage only after a successful ElevenLabs response
  recordUsage(charCount);

  return new Response(res.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
