import Link from 'next/link';
import { listBriefings, getTodayDate } from '@/lib/storage';
import { listPodcastDatesWithStatus } from '@/lib/podcast-storage';
import { Header } from '@/components/Header';
import { requireSubscription } from '@/lib/paywall';

export const dynamic = 'force-dynamic';

function formatColumnDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatLongDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ArchivePage() {
  await requireSubscription();

  const [briefingDates, podcastEpisodesRaw] = await Promise.all([
    listBriefings(),
    listPodcastDatesWithStatus(),
  ]);
  // Use briefing dates for the quizzes column — quiz:index may not be populated yet
  // (quizzes are generated fire-and-forget), but a briefing always exists for each date.
  const quizDates = briefingDates;

  const today = getTodayDate();
  const podcastDates = podcastEpisodesRaw.filter((e) => e.hasAudio).map((e) => e.date);

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* v3 heading block */}
        <div className="space-y-4 mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">
            Historical Intelligence
          </span>
          <h2 className="text-5xl font-serif">The Archive</h2>
          <p className="max-w-xl opacity-60 text-lg font-light">
            Past briefings, quizzes, and podcast episodes — in one place.
          </p>
        </div>

        {/* Full-width divider */}
        <div className="h-px bg-stone-200 dark:bg-stone-800 mb-12" />

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Briefings column */}
          <div id="briefings">
            <h3 className="text-2xl font-serif italic border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
              Briefings
            </h3>
            <div className="space-y-4">
              {briefingDates.slice(0, 30).map((date) => (
                <Link
                  key={date}
                  href={date === today ? '/' : `/archive/${date}`}
                  className="group block"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="section-label">
                      {formatColumnDate(date)}
                    </span>
                    <span className="text-sm font-medium group-hover:underline text-stone-800 dark:text-stone-200">
                      {formatLongDate(date)}
                    </span>
                  </div>
                </Link>
              ))}
              {briefingDates.length === 0 && (
                <p className="text-caption text-stone-400">No entries yet.</p>
              )}
            </div>
          </div>

          {/* Quizzes column */}
          <div id="quizzes">
            <h3 className="text-2xl font-serif italic border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
              Quizzes
            </h3>
            <div className="space-y-4">
              {quizDates.slice(0, 30).map((date) => (
                <Link
                  key={date}
                  href={`/quiz/${date}`}
                  className="group block"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="section-label">
                      {formatColumnDate(date)}
                    </span>
                    <span className="text-sm font-medium group-hover:underline text-stone-800 dark:text-stone-200">
                      {formatLongDate(date)}
                    </span>
                  </div>
                </Link>
              ))}
              {quizDates.length === 0 && (
                <p className="text-caption text-stone-400">No entries yet.</p>
              )}
            </div>
          </div>

          {/* Podcasts column */}
          <div id="podcasts">
            <h3 className="text-2xl font-serif italic border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
              Podcasts
            </h3>
            <div className="space-y-4">
              {podcastDates.slice(0, 30).map((date) => (
                <Link
                  key={date}
                  href={date === today ? '/podcast' : `/podcast/${date}`}
                  className="group block"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="section-label">
                      {formatColumnDate(date)}
                    </span>
                    <span className="text-sm font-medium group-hover:underline text-stone-800 dark:text-stone-200">
                      {formatLongDate(date)}
                    </span>
                  </div>
                </Link>
              ))}
              {podcastDates.length === 0 && (
                <p className="text-caption text-stone-400">No entries yet.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
