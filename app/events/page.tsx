import { Suspense } from 'react';
import { Calendar } from 'lucide-react';
import { getEvents } from '@/lib/events';
import { CityFilter, EventsGrid } from './CityFilter';
import { Header } from '@/components/Header';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const store = await getEvents();
  const today = new Date().toISOString().split('T')[0];
  const upcoming = store?.events.filter((e) => e.date >= today) ?? [];

  if (!store || upcoming.length === 0) {
    return (
      <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading — centered */}
        <div className="text-center space-y-3 mb-12">
          <span className="section-label opacity-40">Professional Network</span>
          <h1 className="text-[64px] leading-none font-serif font-bold text-stone-900 dark:text-stone-50">
            Upcoming Events
          </h1>
          <p className="opacity-60 text-lg font-light max-w-xl mx-auto">
            Curated events across UK legal markets — networking, workshops, and career fairs.
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Calendar size={16} className="text-stone-400" />
          <h2 className="font-serif text-heading font-bold text-stone-900 dark:text-stone-100">
            No upcoming events
          </h2>
          <p className="text-caption text-stone-500 max-w-sm">
            We refresh events every Monday and Thursday. Check back after the next update.
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
      </>
    );
  }

  return (
    <>
    <Header date={today} />
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page heading — centered */}
      <div className="text-center space-y-3 mb-12">
        <span className="section-label opacity-40">Professional Network</span>
        <h1 className="text-[64px] leading-none font-serif font-bold text-stone-900 dark:text-stone-50">
          Upcoming Events
        </h1>
        <p className="opacity-60 text-lg font-light max-w-xl mx-auto">
          Curated events across UK legal markets — networking, workshops, and career fairs.
        </p>
      </div>

      {/* CityFilter wrapped in Suspense — fallback renders all events unfiltered
          while the client component hydrates (prevents useSearchParams flash) */}
      <Suspense fallback={<EventsGrid events={upcoming} />}>
        <CityFilter events={upcoming} />
      </Suspense>
    </main>
    </>
  );
}
