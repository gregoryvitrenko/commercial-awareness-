import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isSubscribed } from '@/lib/subscription';
import { isValidDate, isWhitelistedVoiceId } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';
import { getAudioUrl, getAudioBuffer, audioExists } from '@/lib/podcast-storage';
import { generateAndCachePodcastAudio } from '@/lib/podcast-audio';

export const maxDuration = 120;

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

  // ── Generate or serve cached (shared helper handles budget, ElevenLabs, Blob) ──
  try {
    const { url } = await generateAndCachePodcastAudio(date, resolvedVoiceId);
    if (!url) {
      return NextResponse.json(
        { error: 'Monthly audio generation quota reached. Please try again next month.' },
        { status: 429 }
      );
    }
    return NextResponse.json({ url });
  } catch (err) {
    const error = err as Error;
    if (error.message?.startsWith('No podcast script')) {
      return NextResponse.json(
        { error: 'Script not found. Call /api/podcast first to generate the script.' },
        { status: 404 }
      );
    }
    console.error('[podcast-audio] Generation failed:', error.message);
    return NextResponse.json({ error: 'Audio generation failed. Please try again.' }, { status: 502 });
  }
}
