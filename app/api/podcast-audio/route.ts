import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import { hasCapacity, getMonthlyUsage, recordUsage } from '@/lib/char-usage';
import { isValidDate, isWhitelistedVoiceId, sanitizeUpstreamError } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  getAudioUrl,
  getAudioBuffer,
  audioExists,
  saveAudio,
  getCachedScript,
} from '@/lib/podcast-storage';

export const maxDuration = 60;

const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // Daniel — first curated voice

// ── GET — check existence or serve/redirect cached MP3 ─────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date || !isValidDate(date)) {
    return NextResponse.json(
      { error: 'Valid date query parameter required (YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  const voiceIdParam = searchParams.get('voiceId') ?? DEFAULT_VOICE_ID;

  // ?check=true → lightweight existence check (no binary response)
  if (searchParams.get('check') === 'true') {
    const exists = await audioExists(date, voiceIdParam);
    return NextResponse.json({ exists });
  }

  // Try Blob URL first (production)
  const blobUrl = await getAudioUrl(date, voiceIdParam);
  if (blobUrl) {
    return NextResponse.json({ url: blobUrl });
  }

  // Filesystem fallback (dev) — serve buffer directly
  const audio = getAudioBuffer(date, voiceIdParam);
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
        ? `attachment; filename="folio-${date}.mp3"`
        : `inline; filename="folio-${date}.mp3"`,
    },
  });
}

// ── POST — generate or return cached audio ─────────────────────────────────
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

  // Try Blob URL first (production)
  const cachedUrl = await getAudioUrl(date, resolvedVoiceId);
  if (cachedUrl) {
    return NextResponse.json({ url: cachedUrl });
  }

  // Dev fallback: return buffer if exists on filesystem
  const cachedBuffer = getAudioBuffer(date, resolvedVoiceId);
  if (cachedBuffer) {
    return new Response(new Uint8Array(cachedBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(cachedBuffer.length),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // ── Script must already be generated (via /api/podcast POST) ──
  const script = await getCachedScript(date);
  if (!script) {
    return NextResponse.json(
      { error: 'Script not found. Call /api/podcast first to generate the script.' },
      { status: 404 }
    );
  }

  // ── Monthly character budget check ──
  const charCount = script.length;
  if (!(await hasCapacity(charCount))) {
    const { used, limit } = await getMonthlyUsage();
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
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.80,
        style: 0.25,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    console.error(`[podcast-audio] ElevenLabs error ${res.status}:`, await res.text());
    return NextResponse.json(
      { error: sanitizeUpstreamError(res.status) },
      { status: res.status >= 500 ? 502 : res.status }
    );
  }

  // ── Save and return ──
  const audioBuffer = Buffer.from(await res.arrayBuffer());
  const savedUrl = await saveAudio(date, resolvedVoiceId, audioBuffer);
  await recordUsage(charCount);

  if (savedUrl) {
    // Production: return Blob URL
    return NextResponse.json({ url: savedUrl });
  }

  // Dev: return buffer directly
  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(audioBuffer.length),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
