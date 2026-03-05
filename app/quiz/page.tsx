import Link from 'next/link';
import { getBriefing, getLatestBriefing, getQuiz, getTodayDate, listBriefings } from '@/lib/storage';
import { Header } from '@/components/Header';
import { QuizInterface } from '@/components/QuizInterface';
import type { CountdownData } from '@/components/QuizInterface';
import type { TopicCategory } from '@/lib/types';
import { PenLine, ChevronRight } from 'lucide-react';
import { requireSubscription } from '@/lib/paywall';
import { auth } from '@clerk/nextjs/server';
import { getOnboarding } from '@/lib/onboarding';
import { FIRMS } from '@/lib/firms-data';

// ── Firm deadline countdown helpers ───────────────────────────────────────────

/** Extract close month (1-based) from "Opens October · Closes November" */
function parseCloseMonth(typically: string): number | null {
  const match = typically.match(/[Cc]loses?\s+([A-Za-z]+)/);
  if (!match) return null;
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const idx = months.findIndex((m) => m.toLowerCase() === match[1].toLowerCase());
  return idx >= 0 ? idx + 1 : null;
}

/** Days until the last day of the given 1-based month (this or next year) */
function daysUntilCloseMonth(month: number): number {
  const now = new Date();
  // new Date(year, month, 0) → last day of that 1-based month
  let deadline = new Date(now.getFullYear(), month, 0);
  if (deadline < now) {
    deadline = new Date(now.getFullYear() + 1, month, 0);
  }
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Find the nearest upcoming firm deadline across the user's target firms */
async function getCountdown(userId: string): Promise<CountdownData | null> {
  try {
    const onboarding = await getOnboarding(userId);
    if (!onboarding || !onboarding.targetFirms.length) return null;

    const firmMap = new Map(FIRMS.map((f) => [f.slug, f]));
    let best: CountdownData | null = null;

    for (const slug of onboarding.targetFirms) {
      const firm = firmMap.get(slug);
      if (!firm) continue;

      for (const deadline of firm.trainingContract.deadlines) {
        let daysLeft: number | null = null;

        // Prefer exact closeDate if available
        if (deadline.closeDate) {
          const close = new Date(deadline.closeDate + 'T23:59:59');
          const now = new Date();
          const diff = Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diff > 0) daysLeft = diff; // Only count future deadlines
        }

        // Fallback to month parsing from typically
        if (daysLeft === null) {
          const closeMonth = parseCloseMonth(deadline.typically);
          if (closeMonth) daysLeft = daysUntilCloseMonth(closeMonth);
        }

        if (daysLeft === null || daysLeft <= 0) continue;

        if (!best || daysLeft < best.daysLeft) {
          best = {
            firmName: firm.name,
            shortName: firm.shortName,
            label: deadline.label,
            daysLeft,
            slug,
          };
        }
      }
    }

    return best;
  } catch {
    return null;
  }
}

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

export default async function QuizPage() {
  await requireSubscription();
  const today = getTodayDate();
  const { userId } = await auth();

  const [briefing, dates, countdown] = await Promise.all([
    getBriefing(today).then((b) => b ?? getLatestBriefing()),
    listBriefings(),
    userId ? getCountdown(userId) : Promise.resolve(null),
  ]);

  const activeDate = briefing?.date ?? today;
  const quizQuestions = briefing ? ((await getQuiz(briefing.date))?.questions ?? []) : [];
  const deepCount = quizQuestions.length || 24;
  // streak count = 1 question per story
  const storyCount = briefing?.stories.length ?? 8;

  const dateList = dates.length > 0 && (
    <div className="mb-8">
      <h3 className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
        Available
      </h3>
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {dates.map((date) => {
          const isActive = date === activeDate;
          const isToday = date === today;
          const badge = isToday ? (
            <span className="shrink-0 font-mono text-[10px] tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Today
            </span>
          ) : null;

          if (isActive) {
            return (
              <div key={date} className="flex items-center justify-between px-5 py-4 bg-zinc-50 dark:bg-zinc-800/30">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {formatDisplayDate(date)}
                  </span>
                  {badge}
                </div>
              </div>
            );
          }

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
  );

  if (!briefing) {
    return (
      <>
        <Header date={today} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <PenLine size={16} className="text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Daily Quiz
            </h2>
          </div>
          {dateList}
          <div className="text-center py-20 space-y-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No briefing available yet.</p>
            <Link
              href="/"
              className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-4"
            >
              Generate today&apos;s briefing →
            </Link>
          </div>
        </main>
      </>
    );
  }

  const quiz = await getQuiz(briefing.date);

  const storyMeta = briefing.stories.map((s) => ({
    id: s.id,
    topic: s.topic as TopicCategory,
    headline: s.headline,
  }));

  return (
    <>
      <Header date={briefing.date} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <PenLine size={16} className="text-zinc-400" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Daily Quiz
          </h2>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {storyCount} daily · {deepCount} deep
          </span>
        </div>
        {dateList}
        <QuizInterface
          date={briefing.date}
          initialQuiz={quiz}
          storyMeta={storyMeta}
          countdown={countdown}
        />
      </main>
    </>
  );
}
