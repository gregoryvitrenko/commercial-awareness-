import Link from 'next/link';
import { getBriefing, getLatestBriefing, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { TOPIC_STYLES } from '@/lib/types';
import { Flame, Plus } from 'lucide-react';
import { requireSubscription } from '@/lib/paywall';
import { auth } from '@clerk/nextjs/server';
import { getGamificationData } from '@/lib/quiz-gamification';

// ── Deep practice topics ───────────────────────────────────────────────────────

const DEEP_PRACTICE_TOPICS = [
  { slug: 'ma', label: 'M&A' as const, description: 'Deal structures, regulatory clearances, practice group positioning', difficulty: 'Advanced' },
  { slug: 'capital-markets', label: 'Capital Markets' as const, description: 'Equity and debt issuances, listing rules, underwriting mechanics', difficulty: 'Advanced' },
  { slug: 'banking-finance', label: 'Banking & Finance' as const, description: 'Loan structures, LBOs, intercreditor arrangements', difficulty: 'Advanced' },
  { slug: 'energy-tech', label: 'Energy & Tech' as const, description: 'Infrastructure deals, tech M&A, IP structuring', difficulty: 'Intermediate' },
  { slug: 'regulation', label: 'Regulation' as const, description: 'FCA, CMA, PRA enforcement and compliance obligations', difficulty: 'Intermediate' },
  { slug: 'disputes', label: 'Disputes' as const, description: 'Litigation strategy, arbitration, damages frameworks', difficulty: 'Intermediate' },
  { slug: 'international', label: 'International' as const, description: 'Cross-border transactions, governing law, jurisdictional issues', difficulty: 'Advanced' },
  { slug: 'ai-law', label: 'AI & Law' as const, description: 'AI regulation, liability, legal tech and law firm strategy', difficulty: 'Intermediate' },
];

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

  const [briefing, gamification] = await Promise.all([
    getBriefing(today).then((b) => b ?? getLatestBriefing()),
    userId
      ? getGamificationData(userId).catch(() => null)
      : Promise.resolve(null),
  ]);

  const activeDate = briefing?.date ?? today;

  // ── Gamification stat cards ────────────────────────────────────────────────
  const streakDots = gamification ? Math.min(gamification.streak, 5) : 0;
  const xpInLevel = gamification ? gamification.xp % 100 : 0;

  const statsStrip = gamification && (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Streak card */}
      <div className="rounded-card border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-5 py-4 min-w-[180px]">
        <p className="section-label text-stone-400 dark:text-stone-500 mb-2">Daily Streak</p>
        <div className="flex items-center gap-2 mb-3">
          <Flame size={18} className="text-stone-700 dark:text-stone-300 flex-shrink-0" />
          <span className="text-xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            {gamification.streak > 0 ? `${gamification.streak} Days` : 'No streak yet'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-2 rounded-sm ${
                i < streakDots
                  ? 'bg-stone-700 dark:bg-stone-300'
                  : 'bg-stone-100 dark:bg-stone-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* XP / Level card */}
      <div className="rounded-card border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-5 py-4 min-w-[180px]">
        <div className="flex items-center justify-between mb-2">
          <p className="section-label text-stone-400 dark:text-stone-500">
            Level {gamification.level}
          </p>
          <p className="section-label text-stone-400 dark:text-stone-500">
            {xpInLevel}/100 XP
          </p>
        </div>
        <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-charcoal dark:bg-stone-300 rounded-full transition-all"
            style={{ width: `${xpInLevel}%` }}
          />
        </div>
        <p className="section-label text-stone-400 dark:text-stone-500 mt-2">
          {gamification.xp} total XP
        </p>
      </div>
    </div>
  );

  if (!briefing) {
    return (
      <>
        <Header date={today} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* 1. Heading block */}
          <div className="space-y-3 mb-6">
            <span className="section-label opacity-40">Intelligence Training</span>
            <h2 className="text-5xl font-serif text-stone-900 dark:text-stone-50">Commercial Quiz</h2>
          </div>

          {/* 2. Gamification strip — own row, full width, before panels */}
          {statsStrip && (
            <div className="mb-10">
              {statsStrip}
            </div>
          )}

          <p className="text-sm text-stone-500 dark:text-stone-400 py-20 text-center">No briefing available yet.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header date={activeDate} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* 1. Heading + gamification stats side-by-side */}
        <div className="flex items-start justify-between gap-6 mb-10 flex-wrap">
          <div className="space-y-1">
            <span className="section-label opacity-40">Intelligence Training</span>
            <h2 className="text-5xl font-serif text-stone-900 dark:text-stone-50">Commercial Quiz</h2>
          </div>
          {statsStrip && (
            <div className="flex-shrink-0">
              {statsStrip}
            </div>
          )}
        </div>

        {/* 3. Two-panel grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left — Daily Briefing quiz card */}
          <div className="lg:col-span-7">
            <div className="mb-6">
              <h3 className="text-2xl font-serif italic text-stone-800 dark:text-stone-200">Daily Briefing</h3>
              <p className="text-caption text-stone-400 dark:text-stone-500 mt-1">Quick-fire questions on today&apos;s City news.</p>
            </div>
            <div className="rounded-card bg-[#1B2333] text-white p-10 relative overflow-hidden">
              <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{ background: 'radial-gradient(ellipse 70% 80% at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <div className="relative z-10 flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-white/15 text-white/80 text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 rounded-sm">
                      Available Now
                    </span>
                    <span className="section-label text-white/40">{formatDisplayDate(activeDate).toUpperCase()}</span>
                  </div>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-white leading-tight">
                    Today&apos;s Commercial Briefing Quiz
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-[10px] tracking-widest uppercase font-semibold font-sans">
                  <span>8 Questions</span>
                  <span>&middot;</span>
                  <span>10&ndash;15 Mins</span>
                  <span>&middot;</span>
                  <span>+100 XP</span>
                </div>
                <div>
                  <Link
                    href={`/quiz/${activeDate}`}
                    className="inline-block bg-white text-[#1B2333] font-bold text-[11px] tracking-widest uppercase px-10 py-4 rounded-full hover:bg-stone-100 transition-colors"
                  >
                    Start Daily Quiz
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Deep Practice topic list */}
          <div className="lg:col-span-5">
            <div className="mb-6">
              <h3 className="text-2xl font-serif italic text-stone-800 dark:text-stone-200">Deep Practice</h3>
              <p className="text-caption text-stone-400 dark:text-stone-500 mt-1">Intensive modules on specific practice areas.</p>
            </div>
            <div className="flex flex-col gap-3">
              {DEEP_PRACTICE_TOPICS.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/quiz/practice/${topic.slug}`}
                  className="group flex items-center gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-card hover:border-[#2D3436] dark:hover:border-stone-500 transition-all duration-200"
                >
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
      </main>
    </>
  );
}
