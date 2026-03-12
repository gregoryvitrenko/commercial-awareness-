import Link from 'next/link';
import { listBriefings, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { Calendar, ChevronRight } from 'lucide-react';
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

function groupByMonth(dates: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const date of dates) {
    const [year, month] = date.split('-');
    const key = `${year}-${month}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(date);
  }
  return groups;
}

function formatMonthHeading(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default async function ArchivePage() {
  await requireSubscription();
  const today = getTodayDate();
  const dates = await listBriefings();
  const groups = groupByMonth(dates);
  const monthKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Calendar size={16} className="text-stone-400" />
          <h2 className="text-subheading font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Briefing Archive
          </h2>
          <span className="section-label bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-chrome">
            {dates.length} briefing{dates.length !== 1 ? 's' : ''}
          </span>
        </div>

        {dates.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <p className="text-sm text-stone-500 dark:text-stone-400">No archived briefings yet.</p>
            <Link
              href="/"
              className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-4"
            >
              Generate your first briefing →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {monthKeys.map((monthKey) => (
              <div key={monthKey}>
                <h3 className="section-label mb-3">
                  {formatMonthHeading(monthKey)}
                </h3>
                <div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
                  {groups[monthKey].map((date) => {
                    const isToday = date === today;
                    return (
                      <Link
                        key={date}
                        href={isToday ? '/' : `/archive/${date}`}
                        className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                      >
                        <div className="flex items-baseline gap-3 min-w-0">
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-stone-700 dark:group-hover:text-stone-50">
                            {formatDisplayDate(date)}
                          </span>
                          {isToday && (
                            <span className="shrink-0 font-sans text-[10px] tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              Today
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors"
                        />
                      </Link>
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
