import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Curated voices for a professional UK law news briefing.
// Filtered by voice_id so they work regardless of ElevenLabs display-name changes.
// Order here = display order in the player. Daniel is the recommended default.
const CURATED: { id: string; name: string; label: string }[] = [
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel',  label: 'British · Broadcaster' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian',   label: 'British · Deep'        },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George',  label: 'British · Warm'        },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah',   label: 'British · Confident'   },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', label: 'British · Clear'       },
];

// SECURITY FIX: require auth — previously unauthenticated requests could enumerate
// ElevenLabs account voices and waste API quota.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ voices: [] }, { status: 401 });
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ voices: [] });
  }

  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ voices: [] }, { status: res.status });
  }

  const data = await res.json();
  const available = new Set(
    ((data.voices ?? []) as { voice_id: string }[]).map((v) => v.voice_id)
  );

  // Return only curated voices that exist on this account, in preferred order
  const voices = CURATED.filter((v) => available.has(v.id)).map((v) => ({
    id: v.id,
    name: v.name,
    label: v.label,
    category: 'premade',
  }));

  // Fallback: if none of the curated IDs are available, return all premade voices
  if (voices.length === 0) {
    const fallback = ((data.voices ?? []) as { voice_id: string; name: string; category?: string }[])
      .filter((v) => (v.category ?? 'premade') === 'premade')
      .map((v) => ({ id: v.voice_id, name: v.name, label: '', category: 'premade' }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ voices: fallback });
  }

  return NextResponse.json({ voices });
}
