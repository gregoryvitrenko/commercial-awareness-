import { NextRequest, NextResponse } from 'next/server';
import { generateEvents, getEvents } from '@/lib/events';
import type { LegalEvent } from '@/lib/types';

export const maxDuration = 120; // events generation: Tavily (6 queries) + Haiku

// ─── Cron auth ────────────────────────────────────────────────────────────────

function isCronAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // Fail-closed: if CRON_SECRET is not configured, deny all cron requests.
  if (!cronSecret) {
    console.error('[events] CRON_SECRET is not set — cron access denied.');
    return false;
  }
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

// ─── .ics helpers ─────────────────────────────────────────────────────────────

function addHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function generateIcs(event: LegalEvent): string {
  const dtstart = event.time
    ? `DTSTART;TZID=Europe/London:${event.date.replace(/-/g, '')}T${event.time.replace(':', '')}00`
    : `DTSTART;VALUE=DATE:${event.date.replace(/-/g, '')}`;
  const dtend = event.time
    ? `DTEND;TZID=Europe/London:${event.date.replace(/-/g, '')}T${addHour(event.time).replace(':', '')}00`
    : `DTEND;VALUE=DATE:${event.date.replace(/-/g, '')}`;
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Folio//Legal Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@folioapp.co.uk`,
    `DTSTAMP:${now}`,
    dtstart,
    dtend,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    event.venue
      ? `LOCATION:${escapeIcs(event.venue + ', ' + event.city)}`
      : `LOCATION:${event.city}`,
    `URL:${event.sourceUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  const id = searchParams.get('id');

  // Branch 1: .ics download — unauthenticated, no subscription check
  if (format === 'ics' && id) {
    const store = await getEvents();
    if (!store) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const event = store.events.find((e) => e.id === id);
    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const ics = generateIcs(event);
    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${event.id}.ics"`,
      },
    });
  }

  // Branch 2: cron-triggered generation — requires CRON_SECRET
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = await generateEvents();
    return NextResponse.json({
      success: true,
      count: store.events.length,
      generatedAt: store.generatedAt,
    });
  } catch (error) {
    console.error('[events] Generation failed:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
