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

function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-card border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 transition-colors p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`inline-block rounded-chrome px-2 py-0.5 text-label font-medium ${EVENT_TYPE_COLOURS[event.eventType]}`}>
          {event.eventType}
        </span>
      </div>
      <h3 className="text-body font-semibold text-stone-900 dark:text-stone-100 mb-1 leading-snug">
        {event.title}
      </h3>
      <p className="text-caption text-charcoal dark:text-charcoal-light font-medium mb-1">
        {formatShortDate(event.date, event.time)}
      </p>
      <p className="text-caption text-stone-500">
        {event.city} · {event.organiser}
      </p>
      <p className="section-label mt-2 text-stone-500">
        {event.eligibility}
      </p>
    </Link>
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
