import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import { hasCapacity, getMonthlyUsage, recordUsage } from '@/lib/char-usage';
import { isValidDate, isWhitelistedVoiceId, sanitizeUpstreamError } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

const DATA_DIR = path.join(process.cwd(), 'data', 'briefings');
const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // Daniel — first curated voice

function audioFile(date: string, voiceId: string = DEFAULT_VOICE_ID): string {
  return path.join(DATA_DIR, `${date}-podcast-${voiceId}.mp3`);
}

// Legacy path (before per-voice caching) — kept for backward compat
function legacyAudioFile(date: string): string {
  return path.join(DATA_DIR, `${date}-podcast.mp3`);
}

function scriptFile(date: string): string {
  return path.join(DATA_DIR, `${date}-podcast.txt`);
}

function getCachedAudio(date: string, voiceId: string = DEFAULT_VOICE_ID): Buffer | null {
  try {
    return fs.readFileSync(audioFile(date, voiceId));
  } catch {
    // Fall back to legacy file for the default voice only
    if (voiceId === DEFAULT_VOICE_ID) {
      try { return fs.readFileSync(legacyAudioFile(date)); } catch { /* none */ }
    }
    return null;
  }
}

function getCachedScript(date: string): string | null {
  try {
    return fs.readFileSync(scriptFile(date), 'utf-8');
  } catch {
    return null;
  }
}

// ── GET — check existence or serve cached MP3 for download ────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date || !isValidDate(date)) {
    return NextResponse.json({ error: 'Valid date query parameter required (YYYY-MM-DD)' }, { status: 400 });
  }

  const voiceIdParam = searchParams.get('voiceId') ?? DEFAULT_VOICE_ID;

  // ?check=true → lightweight existence check (no binary response)
  if (searchParams.get('check') === 'true') {
    const exists =
      fs.existsSync(audioFile(date, voiceIdParam)) ||
      (voiceIdParam === DEFAULT_VOICE_ID && fs.existsSync(legacyAudioFile(date)));
    return NextResponse.json({ exists });
  }

  // Serve the cached MP3
  const audio = getCachedAudio(date, voiceIdParam);
  if (!audio) {
    return NextResponse.json({ error: 'No cached audio for this date' }, { status: 404 });
  }

  const isDownload = searchParams.get('download') === 'true';
  return new Response(new Uint8Array(audio), {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(audio.length),
      'Cache-Control': 'public, max-age=86400, immutable',
      'Content-Disposition': isDownload
        ? `attachment; filename="commercial-awareness-${date}.mp3"`
        : `inline; filename="commercial-awareness-${date}.mp3"`,
    },
  });
}

// ── POST — generate or return cached audio ────────────────────────────────────
export async function POST(request: NextRequest) {
  // Require an active subscription — ElevenLabs credits are finite and costly
  const isDevPreview = process.env.PREVIEW_MODE === 'true';
  const { userId } = await auth();

  if (!isDevPreview) {
    if (!userId) {
      console.warn('[podcast-audio] POST — unauthenticated request rejected');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const subscribed = await isSubscribed(userId);
    if (!subscribed) {
      console.warn(`[podcast-audio] POST — unsubscribed user ${userId} attempted audio generation`);
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }
  }

  // Rate limit: 5 audio generation requests per hour per user.
  // ElevenLabs credits are finite (100k chars/month on Creator plan). The monthly
  // budget check prevents overage, but rate limiting prevents hammering the endpoint.
  const limited = await checkRateLimit(userId ?? 'preview-dev', 'podcast-audio', 5, 3600);
  if (limited) return limited;

  const body = await request.json();
  const { date, voiceId } = body as { date?: string; voiceId?: string };

  if (!date || !isValidDate(date)) {
    return NextResponse.json({ error: 'Valid date is required in request body (YYYY-MM-DD)' }, { status: 400 });
  }

  // Whitelist-validate voiceId early — needed for per-voice cache key
  const resolvedVoiceId = (voiceId && isWhitelistedVoiceId(voiceId)) ? voiceId : DEFAULT_VOICE_ID;

  // ── Return cached audio — no ElevenLabs charge (checked BEFORE API key) ──
  const cached = getCachedAudio(date, resolvedVoiceId);
  if (cached) {
    return new Response(new Uint8Array(cached), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(cached.length),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // ── Script must already be generated (via /api/podcast POST) ──
  const script = getCachedScript(date);
  if (!script) {
    return NextResponse.json(
      { error: 'Script not found. Call /api/podcast first to generate the script.' },
      { status: 404 }
    );
  }

  // ── Monthly character budget check ──
  const charCount = script.length;
  if (!hasCapacity(charCount)) {
    const { used, limit } = getMonthlyUsage();
    console.warn(`[podcast-audio] Monthly quota reached: ${used.toLocaleString()} / ${limit.toLocaleString()} chars used.`);
    return NextResponse.json(
      { error: 'Monthly audio generation quota reached. Please try again next month.' },
      { status: 429 }
    );
  }

  // ── API key required only for live ElevenLabs generation ──
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('[podcast-audio] ELEVENLABS_API_KEY is not configured.');
    return NextResponse.json({ error: 'Audio generation is currently unavailable.' }, { status: 500 });
  }

  // ── Call ElevenLabs ──
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: script,
      // eleven_multilingual_v2 = highest-quality model, available on Creator plan+.
      // Noticeably more natural than eleven_turbo_v2 for broadcast-style narration.
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75,        // Higher = more consistent, authoritative broadcaster tone
        similarity_boost: 0.80, // Higher = truer to the voice's character
        style: 0.25,            // Subtle expressiveness without over-dramatising
        use_speaker_boost: true,// Enhances clarity and presence
      },
    }),
  });

  if (!res.ok) {
    // Don't leak raw ElevenLabs error bodies — they can contain API details
    console.error(`[podcast-audio] ElevenLabs error ${res.status}:`, await res.text());
    return NextResponse.json(
      { error: sanitizeUpstreamError(res.status) },
      { status: res.status >= 500 ? 502 : res.status }
    );
  }

  // ── Save to disk and record usage — only charged once per day ──
  const audioBuffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(audioFile(date, resolvedVoiceId), audioBuffer);
  recordUsage(charCount);

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(audioBuffer.length),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
