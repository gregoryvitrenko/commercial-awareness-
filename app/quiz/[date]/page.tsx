import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBriefing, getQuiz, getTodayDate, listBriefings } from '@/lib/storage';
import { Header } from '@/components/Header';
import { QuizInterface } from '@/components/QuizInterface';
import type { TopicCategory } from '@/lib/types';
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

export default async function QuizDatePage({ params }: { params: Promise<{ date: string }> }) {
  await requireSubscription();
  const { date } = await params;
  const today = getTodayDate();

  const [briefing, dates] = await Promise.all([
    getBriefing(date),
    listBriefings(),
  ]);

  if (!briefing) notFound();

  const quiz = await getQuiz(date);

  const storyMeta = briefing.stories.map((s) => ({
    id: s.id,
    topic: s.topic as TopicCategory,
    headline: s.headline,
  }));

  const questionCount = quiz?.questions.length ?? 18;

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <PenLine size={16} className="text-zinc-400" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Daily Quiz
          </h2>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {questionCount} questions
          </span>
        </div>

        {/* Date navigation */}
        {dates.length > 0 && (
          <div className="mb-8">
            <h3 className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
              Available
            </h3>
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {dates.map((d) => {
                const isActive = d === date;
                const isToday = d === today;
                const badge = isToday ? (
                  <span className="shrink-0 font-mono text-[10px] tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                ) : null;

                if (isActive) {
                  return (
                    <div key={d} className="flex items-center justify-between px-5 py-4 bg-zinc-50 dark:bg-zinc-800/30">
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {formatDisplayDate(d)}
                        </span>
                        {badge}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={d}
                    href={isToday ? '/quiz' : `/quiz/${d}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-50">
                        {formatDisplayDate(d)}
                      </span>
                      {badge}
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
        )}

        <QuizInterface
          date={date}
          initialQuiz={quiz}
          storyMeta={storyMeta}
        />
      </main>
    </>
  );
}
