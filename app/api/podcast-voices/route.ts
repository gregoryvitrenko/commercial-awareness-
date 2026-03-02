import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ voices: [] });
  }

  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    return NextResponse.json({ voices: [] }, { status: res.status });
  }

  const data = await res.json();
  const voices = (
    (data.voices ?? []) as { voice_id: string; name: string; category?: string }[]
  )
    .map((v) => ({ id: v.voice_id, name: v.name, category: v.category ?? 'premade' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ voices });
}
