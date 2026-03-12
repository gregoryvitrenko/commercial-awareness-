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
        Past Briefings
      </h3>
      <div className="rounded-card border border-stone-200 dark:border-stone-800 overflow-hidden">
        {dates.map((date) => {
          const isActive = date === activeDate;
          const isToday = date === today;

          // TODAY row (not yet the active/selected date)
          if (isToday && !isActive) {
            return (
              <Link key={date} href="/quiz" className="flex items-center gap-0 hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition-colors group">
                <div className="w-1 self-stretch bg-stone-900 dark:bg-stone-100 flex-shrink-0" />
                <div className="flex items-center justify-between flex-1 px-5 py-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{formatDisplayDate(date)}</span>
                    <span className="section-label text-stone-500 dark:text-stone-400">Today</span>
                  </div>
                  <ChevronRight size={14} className="text-stone-400 dark:text-stone-500 group-hover:text-stone-600 transition-colors" />
                </div>
              </Link>
            );
          }

          // ACTIVE row (currently selected/being practiced)
          if (isActive) {
            return (
              <div key={date} className="flex items-center gap-0">
                <div className="w-1 self-stretch bg-stone-300 dark:bg-stone-700 flex-shrink-0" />
                <div className="flex items-center justify-between flex-1 px-5 py-4 bg-stone-50 dark:bg-stone-800/30">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{formatDisplayDate(date)}</span>
                  {isToday && <span className="section-label text-stone-400 dark:text-stone-500">Today</span>}
                </div>
              </div>
            );
          }

          // PAST dates (available, not selected)
          return (
            <Link key={date} href={`/quiz/${date}`} className="flex items-center gap-0 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group">
              <div className="w-1 self-stretch flex-shrink-0" />
              <div className="flex items-center justify-between flex-1 px-5 py-4">
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">{formatDisplayDate(date)}</span>
                <ChevronRight size={14} className="text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors" />
              </div>
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
          {/* Hero card — no question count (briefing unavailable) */}
          <div className="rounded-card bg-[#002147] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="section-label text-stone-300 mb-2">Today&apos;s Quiz</p>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">{formatDisplayDate(today)}</p>
            </div>
            <div>
              <Link href="/quiz" className="inline-flex items-center gap-2 bg-white text-[#002147] font-semibold text-sm px-5 py-3 rounded-chrome hover:bg-stone-100 transition-colors">
                Start today&apos;s quiz <ChevronRight size={14} />
              </Link>
            </div>
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
        {/* Hero card — today's date, question count, Oxford blue CTA */}
        <div className="rounded-card bg-[#002147] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="section-label text-stone-300 mb-2">Today&apos;s Quiz</p>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">{formatDisplayDate(today)}</p>
            <p className="text-sm text-stone-300 mt-2">{storyCount} daily · {deepCount} deep practice</p>
          </div>
          <div>
            <Link href="/quiz" className="inline-flex items-center gap-2 bg-white text-[#002147] font-semibold text-sm px-5 py-3 rounded-chrome hover:bg-stone-100 transition-colors">
              Start today&apos;s quiz <ChevronRight size={14} />
            </Link>
          </div>
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
