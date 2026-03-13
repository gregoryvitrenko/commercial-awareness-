import Link from 'next/link';
import { getTodayDate } from '@/lib/storage';
import { listPodcastDatesWithStatus } from '@/lib/podcast-storage';
import { Header } from '@/components/Header';
import { Headphones, ChevronRight } from 'lucide-react';
import { requireSubscription } from '@/lib/paywall';

export const dynamic = 'force-dynamic';

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function groupByMonth(
  episodes: Array<{ date: string; hasAudio: boolean }>
): Record<string, Array<{ date: string; hasAudio: boolean }>> {
  const groups: Record<string, Array<{ date: string; hasAudio: boolean }>> = {};
  for (const episode of episodes) {
    const [year, month] = episode.date.split('-');
    const key = `${year}-${month}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(episode);
  }
  return groups;
}

function formatMonthHeading(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function parseDateParts(dateStr: string): { day: string; month: string } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return {
    day: String(day).padStart(2, '0'),
    month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
  };
}

export default async function PodcastArchivePage() {
  await requireSubscription();
  const today = getTodayDate();
  const episodes = await listPodcastDatesWithStatus();
  const groups = groupByMonth(episodes);
  const monthKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Headphones size={16} className="text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Podcast Archive
          </h2>
          <span className="section-label text-stone-400">
            {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <p className="text-sm text-stone-500 dark:text-stone-400">No archived episodes yet.</p>
            <Link
              href="/podcast"
              className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-4"
            >
              Listen to today&apos;s episode →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {monthKeys.map((monthKey) => (
              <div key={monthKey}>
                <h3 className="section-label text-stone-400 dark:text-stone-500 mb-3">
                  {formatMonthHeading(monthKey)}
                </h3>
                <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-card overflow-hidden">
                  {groups[monthKey].map(({ date, hasAudio }) => {
                    const isToday = date === today;
                    const playable = hasAudio || isToday;
                    const { day, month } = parseDateParts(date);
                    if (playable) {
                      return (
                        <Link
                          key={date}
                          href={isToday ? '/podcast' : `/podcast/${date}`}
                          className="flex items-center gap-0 px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors group"
                        >
                          {/* Date column */}
                          <div className="w-14 shrink-0 flex flex-col items-center leading-none mr-4">
                            <span className="font-sans text-2xl font-bold text-stone-900 dark:text-stone-100 leading-none tabular-nums">
                              {day}
                            </span>
                            <span className="section-label text-stone-400 mt-0.5">
                              {month}
                            </span>
                          </div>

                          {/* Vertical rule */}
                          <div className="w-px self-stretch bg-stone-200 dark:bg-stone-700 mr-4 shrink-0" />

                          {/* Title + today badge */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-stone-700 dark:group-hover:text-stone-50 leading-snug">
                              {formatDisplayDate(date)}
                            </p>
                            {isToday && (
                              <span className="section-label text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                Today
                              </span>
                            )}
                          </div>

                          {/* Duration + audio indicator */}
                          <span className="section-label text-stone-400 shrink-0 ml-4">~8 min</span>
                          {hasAudio && !isToday && (
                            <span className="section-label text-stone-400 shrink-0 ml-2">· Audio</span>
                          )}

                          <ChevronRight size={14} className="shrink-0 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 transition-colors ml-3" />
                        </Link>
                      );
                    }
                    return (
                      <div key={date} className="flex items-center gap-0 px-5 py-4 opacity-40">
                        <div className="w-14 shrink-0 flex flex-col items-center leading-none mr-4">
                          <span className="font-sans text-2xl font-bold text-stone-900 dark:text-stone-100 leading-none tabular-nums">
                            {day}
                          </span>
                          <span className="section-label text-stone-400 mt-0.5">
                            {month}
                          </span>
                        </div>
                        <div className="w-px self-stretch bg-stone-200 dark:bg-stone-700 mr-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-500 dark:text-stone-400 truncate">
                            {formatDisplayDate(date)}
                          </p>
                        </div>
                        <span className="section-label text-stone-400 shrink-0 ml-4">No audio</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
