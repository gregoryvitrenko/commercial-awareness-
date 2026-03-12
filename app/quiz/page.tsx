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
      <h3 className="section-label mb-3">
        Available
      </h3>
      <div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
        {dates.map((date) => {
          const isActive = date === activeDate;
          const isToday = date === today;
          const badge = isToday ? (
            <span className="shrink-0 font-sans text-[10px] tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Today
            </span>
          ) : null;

          if (isActive) {
            return (
              <div key={date} className="flex items-center justify-between px-5 py-4 bg-stone-50 dark:bg-stone-800/30">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
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
              className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-stone-700 dark:group-hover:text-stone-50">
                  {formatDisplayDate(date)}
                </span>
                {badge}
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
  );

  if (!briefing) {
    return (
      <>
        <Header date={today} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <PenLine size={16} className="text-stone-400" />
            <h2 className="text-subheading font-bold text-stone-900 dark:text-stone-50 tracking-tight">
              Daily Quiz
            </h2>
          </div>
          {dateList}
          <div className="text-center py-20 space-y-2">
            <p className="text-sm text-stone-500 dark:text-stone-400">No briefing available yet.</p>
            <Link
              href="/"
              className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-4"
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
          <PenLine size={16} className="text-stone-400" />
          <h2 className="text-subheading font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Daily Quiz
          </h2>
          <span className="section-label bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-chrome">
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
