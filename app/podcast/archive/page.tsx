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
          <Headphones size={16} className="text-zinc-400" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Podcast Archive
          </h2>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No archived episodes yet.</p>
            <Link
              href="/podcast"
              className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-4"
            >
              Listen to today&apos;s episode →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {monthKeys.map((monthKey) => (
              <div key={monthKey}>
                <h3 className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
                  {formatMonthHeading(monthKey)}
                </h3>
                <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  {groups[monthKey].map(({ date, hasAudio }) => {
                    const isToday = date === today;
                    const playable = hasAudio || isToday;
                    if (playable) {
                      return (
                        <Link
                          key={date}
                          href={isToday ? '/podcast' : `/podcast/${date}`}
                          className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                        >
                          <div className="flex items-baseline gap-3 min-w-0">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-50">
                              {formatDisplayDate(date)}
                            </span>
                            {isToday && (
                              <span className="shrink-0 font-mono text-[10px] tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                Today
                              </span>
                            )}
                          </div>
                          <ChevronRight
                            size={14}
                            className="shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors"
                          />
                        </Link>
                      );
                    }
                    return (
                      <div
                        key={date}
                        className="flex items-center justify-between px-5 py-4"
                      >
                        <span className="text-sm font-medium text-zinc-400 dark:text-zinc-600">
                          {formatDisplayDate(date)}
                        </span>
                        <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-300 dark:text-zinc-600">
                          No audio
                        </span>
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
