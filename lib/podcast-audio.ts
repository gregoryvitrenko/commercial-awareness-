/**
 * Shared ElevenLabs TTS helper. Checks cache first (no charge), checks budget,
 * calls ElevenLabs, saves to Blob. Called by both the 06:00 UTC cron
 * (fire-and-forget) and the /api/podcast-audio POST handler.
 */

import { getCachedScript, getAudioUrl, saveAudio } from '@/lib/podcast-storage';
import { hasCapacity, recordUsage } from '@/lib/char-usage';

const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // Daniel

/**
 * Generate and cache the ElevenLabs MP3 for a given date and voice.
 *
 * - Returns `{ url, cached: true }` immediately if a cached URL already exists
 *   (no ElevenLabs charge, no network call).
 * - Returns `{ url: null, cached: false }` if the budget is insufficient.
 * - Throws if the podcast script is missing or ElevenLabs returns an error.
 */
export async function generateAndCachePodcastAudio(
  date: string,
  voiceId?: string
): Promise<{ url: string | null; cached: boolean }> {
  const resolvedVoiceId = voiceId ?? DEFAULT_VOICE_ID;

  // ── Cache check first — no ElevenLabs charge ──
  const cachedUrl = await getAudioUrl(date, resolvedVoiceId);
  if (cachedUrl) return { url: cachedUrl, cached: true };

  // ── Fetch script ──
  const script = await getCachedScript(date);
  if (!script) throw new Error(`No podcast script found for ${date}`);

  // ── Budget check ──
  const charCount = script.length;
  if (!(await hasCapacity(charCount))) {
    console.warn(
      `[podcast-audio] Skipping MP3 generation for ${date} — ElevenLabs budget insufficient`
    );
    return { url: null, cached: false };
  }

  // ── API key check ──
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not configured');

  // ── ElevenLabs call ──
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
    {
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
    }
  );

  if (!res.ok) {
    throw new Error(`ElevenLabs error ${res.status}: ${await res.text()}`);
  }

  // ── Save and record ──
  const audioBuffer = Buffer.from(await res.arrayBuffer());
  await recordUsage(charCount);
  const savedUrl = await saveAudio(date, resolvedVoiceId, audioBuffer);
  return { url: savedUrl, cached: false };
}
