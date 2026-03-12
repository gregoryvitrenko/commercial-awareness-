import Link from 'next/link';
import { getBriefing, getLatestBriefing, getQuiz, getTodayDate, listBriefings } from '@/lib/storage';
import { Header } from '@/components/Header';
import { QuizInterface } from '@/components/QuizInterface';
import type { CountdownData } from '@/components/QuizInterface';
import type { TopicCategory, QuizQuestion } from '@/lib/types';
import { TOPIC_STYLES } from '@/lib/types';
import { ChevronRight, Plus } from 'lucide-react';
import { requireSubscription } from '@/lib/paywall';
import { auth } from '@clerk/nextjs/server';
import { getOnboarding } from '@/lib/onboarding';
import { FIRMS } from '@/lib/firms-data';

// ── Daily question selector ────────────────────────────────────────────────────

function selectDailyQuestions(
  questions: QuizQuestion[],
  storyMeta: Array<{ id: string; topic: TopicCategory }>,
): QuizQuestion[] {
  const TOPIC_ORDER: TopicCategory[] = [
    'M&A', 'Capital Markets', 'Banking & Finance', 'Energy & Tech',
    'Regulation', 'Disputes', 'International', 'AI & Law',
  ];
  const result: QuizQuestion[] = [];
  for (const topic of TOPIC_ORDER) {
    const topicStoryIds = storyMeta.filter((s) => s.topic === topic).map((s) => s.id);
    const q = questions.find((q) => topicStoryIds.includes(q.storyId));
    if (q) result.push(q);
  }
  return result;
}

// ── Deep practice topics ───────────────────────────────────────────────────────

const DEEP_PRACTICE_TOPICS = [
  { slug: 'ma', label: 'M&A' as const, description: 'Deal structures, regulatory clearances, practice group positioning', questionCount: 9, difficulty: 'Advanced' },
  { slug: 'capital-markets', label: 'Capital Markets' as const, description: 'Equity and debt issuances, listing rules, underwriting mechanics', questionCount: 9, difficulty: 'Advanced' },
  { slug: 'banking-finance', label: 'Banking & Finance' as const, description: 'Loan structures, LBOs, intercreditor arrangements', questionCount: 9, difficulty: 'Advanced' },
  { slug: 'energy-tech', label: 'Energy & Tech' as const, description: 'Infrastructure deals, tech M&A, IP structuring', questionCount: 9, difficulty: 'Intermediate' },
  { slug: 'regulation', label: 'Regulation' as const, description: 'FCA, CMA, PRA enforcement and compliance obligations', questionCount: 9, difficulty: 'Intermediate' },
  { slug: 'disputes', label: 'Disputes' as const, description: 'Litigation strategy, arbitration, damages frameworks', questionCount: 9, difficulty: 'Intermediate' },
  { slug: 'international', label: 'International' as const, description: 'Cross-border transactions, governing law, jurisdictional issues', questionCount: 9, difficulty: 'Advanced' },
  { slug: 'ai-law', label: 'AI & Law' as const, description: 'AI regulation, liability, legal tech and law firm strategy', questionCount: 9, difficulty: 'Intermediate' },
];

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

  const dateList = dates.length > 0 && (
    <div className="mb-8">
      <h3 className="section-label mb-3">
        Quiz Archive
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
          <div className="space-y-4 mb-12">
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">
              Intelligence Training
            </span>
            <h2 className="text-5xl font-serif text-stone-900 dark:text-stone-50">Commercial Quiz</h2>
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

  const dailyQuestions = selectDailyQuestions(quiz?.questions ?? [], storyMeta);
  const dailyQuiz = quiz ? { ...quiz, questions: dailyQuestions } : null;

  return (
    <>
      <Header date={briefing.date} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4 mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">
            Intelligence Training
          </span>
          <h2 className="text-5xl font-serif text-stone-900 dark:text-stone-50">Commercial Quiz</h2>
        </div>

        {/* ── Two-column hero grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left column — Daily quiz hero */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
              <span className="section-label flex-shrink-0">Daily Briefing</span>
              <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            </div>
            <div className="rounded-card bg-[#2D3436] text-white p-10 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 70% 80% at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)' }} aria-hidden="true" />
              <div className="relative z-10 flex flex-col gap-6">
                <div>
                  <p className="section-label text-white/40 mb-3">Today&apos;s Quiz</p>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4">
                    Today&apos;s Commercial Briefing Quiz
                  </p>
                  <p className="font-mono text-xl text-white/60">{formatDisplayDate(today)}</p>
                </div>
                <div className="flex items-center gap-6 text-white/50 text-sm font-sans">
                  <span>8 Questions</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>10&ndash;15 Mins</span>
                </div>
                <div>
                  <Link href="/quiz" className="inline-block bg-white text-[#2D3436] font-semibold text-sm px-10 py-4 rounded-full hover:bg-stone-100 transition-colors">
                    Start Daily Quiz
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Deep practice */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
              <span className="section-label flex-shrink-0">Deep Practice</span>
              <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            </div>
            <div className="flex flex-col gap-3">
              {DEEP_PRACTICE_TOPICS.map((topic) => (
                <Link key={topic.slug} href={`/quiz/practice/${topic.slug}`}
                  className="group flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-card hover:border-[#2D3436] dark:hover:border-stone-500 transition-all duration-200">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${TOPIC_STYLES[topic.label].dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">{topic.label}</p>
                    <p className="text-caption text-stone-400 dark:text-stone-500 mt-0.5 truncate">{topic.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="section-label text-stone-400 dark:text-stone-500">{topic.difficulty}</span>
                    <Plus size={14} className="text-stone-300 dark:text-stone-600 group-hover:text-[#2D3436] dark:group-hover:text-stone-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {dateList}
        <QuizInterface
          date={briefing.date}
          initialQuiz={dailyQuiz}
          storyMeta={storyMeta}
          countdown={countdown}
        />
      </main>
    </>
  );
}
