import { Suspense } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { getEvents } from '@/lib/events';
import { CityFilter, EventsGrid } from './CityFilter';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const store = await getEvents();
  const today = new Date().toISOString().split('T')[0];
  const upcoming = store?.events.filter((e) => e.date >= today) ?? [];

  if (!store || upcoming.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="font-mono text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors inline-block mb-6">
          ← Home
        </Link>
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-8">
          <Calendar size={16} className="text-stone-400" />
          <h1 className="font-bold text-heading text-stone-900 dark:text-stone-100">Events</h1>
          <span className="bg-stone-100 dark:bg-stone-800 text-caption rounded-chrome px-2 py-0.5 text-stone-600 dark:text-stone-400">
            0
          </span>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Calendar size={16} className="text-stone-400" />
          <h2 className="font-serif text-heading font-bold text-stone-900 dark:text-stone-100">
            No upcoming events
          </h2>
          <p className="text-caption text-stone-500 max-w-sm">
            We refresh events every Monday. Check back after the next update.
          </p>
          {store && (
            <p className="section-label text-stone-400 mt-2">
              Last updated {new Date(store.generatedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="font-mono text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors inline-block mb-6">
        ← Home
      </Link>
      {/* Page heading */}
      <div className="flex items-center gap-3 mb-8">
        <Calendar size={16} className="text-stone-400" />
        <h1 className="font-bold text-heading text-stone-900 dark:text-stone-100">Events</h1>
        <span className="bg-stone-100 dark:bg-stone-800 text-caption rounded-chrome px-2 py-0.5 text-stone-600 dark:text-stone-400">
          {upcoming.length}
        </span>
      </div>

      {/* CityFilter wrapped in Suspense — fallback renders all events unfiltered
          while the client component hydrates (prevents useSearchParams flash) */}
      <Suspense fallback={<EventsGrid events={upcoming} />}>
        <CityFilter events={upcoming} />
      </Suspense>
    </main>
  );
}
