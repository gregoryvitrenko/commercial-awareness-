import Link from 'next/link';
import { listQuizDates, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { PenLine, ChevronRight } from 'lucide-react';
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

export default async function QuizArchivePage() {
  await requireSubscription();
  const today = getTodayDate();
  const dates = await listQuizDates();
  const groups = groupByMonth(dates);
  const monthKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <PenLine size={16} className="text-zinc-400" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Quiz Archive
          </h2>
          <span className="font-sans text-[10px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {dates.length} quiz{dates.length !== 1 ? 'zes' : ''}
          </span>
        </div>

        {dates.length === 0 ? (
          <div className="text-center py-20 space-y-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No archived quizzes yet.</p>
            <Link
              href="/quiz"
              className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-4"
            >
              Go to today&apos;s quiz →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {monthKeys.map((monthKey) => (
              <div key={monthKey}>
                <h3 className="font-sans text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
                  {formatMonthHeading(monthKey)}
                </h3>
                <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  {groups[monthKey].map((date) => {
                    const isToday = date === today;
                    return (
                      <Link
                        key={date}
                        href={isToday ? '/quiz' : `/quiz/${date}`}
                        className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                      >
                        <div className="flex items-baseline gap-3 min-w-0">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-50">
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
                          className="shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors"
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
