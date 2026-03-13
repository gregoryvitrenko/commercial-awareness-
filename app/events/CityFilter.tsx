'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { LegalEvent, EventType, EventCity } from '@/lib/types';

const EVENT_TYPE_COLOURS: Record<EventType, string> = {
  'Networking':  'text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950',
  'Panel':       'text-violet-800 dark:text-violet-300 bg-violet-50 dark:bg-violet-950',
  'Workshop':    'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950',
  'Social':      'text-orange-800 dark:text-orange-300 bg-orange-50 dark:bg-orange-950',
  'Career Fair': 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950',
};

const CITY_ORDER: EventCity[] = ['London', 'Manchester', 'Edinburgh', 'Bristol', 'Other'];

function formatShortDate(dateStr: string, time?: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const formatted = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return time ? `${formatted} · ${time}` : formatted;
}

interface EventCardProps {
  event: LegalEvent;
}

function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

function EventCard({ event }: EventCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 gap-3">
      {/* Top row: category chip left, date right */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-block rounded-chrome px-2 py-0.5 text-label font-medium ${EVENT_TYPE_COLOURS[event.eventType]}`}>
          {event.eventType}
        </span>
        <span className="section-label text-stone-400 dark:text-stone-500 whitespace-nowrap">
          {formatDateDisplay(event.date)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-[18px] font-semibold text-stone-900 dark:text-stone-100 leading-snug">
        {event.title}
      </h3>

      {/* Time + location */}
      <p className="text-caption text-stone-500 dark:text-stone-400">
        {event.time ? `${event.time} · ` : ''}{event.city} · {event.organiser}
      </p>

      {/* Spacer pushes button to bottom */}
      <div className="flex-1" />

      {/* REGISTER INTEREST — full-width outlined button */}
      <Link
        href={event.registrationUrl ?? `/events/${event.id}`}
        target={event.registrationUrl ? '_blank' : undefined}
        rel={event.registrationUrl ? 'noopener noreferrer' : undefined}
        className="block w-full text-center border border-stone-300 dark:border-stone-600 rounded-full py-2.5 section-label text-stone-700 dark:text-stone-300 hover:border-stone-500 dark:hover:border-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
      >
        REGISTER INTEREST
      </Link>
    </div>
  );
}

export interface EventsGridProps {
  events: LegalEvent[];
}

export function EventsGrid({ events }: EventsGridProps) {
  if (events.length === 0) {
    return (
      <p className="text-caption text-stone-500 py-8 text-center">
        No events in this city right now.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

interface CityFilterProps {
  events: LegalEvent[];
}

export function CityFilter({ events }: CityFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCity = searchParams.get('city') as EventCity | null;

  const availableCities = CITY_ORDER.filter((c) =>
    events.some((e) => e.city === c)
  );

  const filtered = activeCity ? events.filter((e) => e.city === activeCity) : events;

  const tabBase =
    'text-label font-medium whitespace-nowrap transition-colors cursor-pointer bg-transparent border-none outline-none font-sans py-1.5 px-3 rounded-full';
  const tabActive = 'bg-charcoal text-white';
  const tabInactive =
    'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800';

  return (
    <div>
      {/* City tabs */}
      <div className="relative -mx-4 sm:-mx-6 mb-6">
        <div className="flex items-center overflow-x-auto no-scrollbar px-4 sm:px-6 gap-2 flex-wrap">
          <button
            onClick={() => router.push('/events')}
            className={`${tabBase} ${!activeCity ? tabActive : tabInactive}`}
          >
            All
          </button>
          {availableCities.map((city) => (
            <button
              key={city}
              onClick={() => router.push(`/events?city=${city}`)}
              className={`${tabBase} ${activeCity === city ? tabActive : tabInactive}`}
            >
              {city}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-stone-50 dark:from-stone-950 to-transparent" />
      </div>

      <EventsGrid events={filtered} />
    </div>
  );
}
