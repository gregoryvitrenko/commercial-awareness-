import Link from 'next/link';
import { ArrowRight, Zap, Users, Target, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { requireSubscription } from '@/lib/paywall';
import { getTodayDate } from '@/lib/storage';
import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_QUESTIONS,
  type InterviewCategorySlug,
} from '@/lib/interview-data';

export const dynamic = 'force-dynamic';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  strengths: Zap,
  behavioural: Users,
  motivation: Target,
  commercial: TrendingUp,
};

function questionCount(slug: InterviewCategorySlug) {
  return INTERVIEW_QUESTIONS.filter((q) => q.category === slug).length;
}

export default async function InterviewPage() {
  await requireSubscription();
  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Page heading */}
        <div className="space-y-4 mb-12 text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">
            Interview Preparation
          </span>
          <h2 className="text-5xl font-serif">Practice Questions</h2>
          <p className="opacity-60 text-lg font-light">Drawn from firm packs and sector primers.</p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INTERVIEW_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Zap;
            const count = questionCount(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/interview/${cat.slug}`}
                className="group rounded-card border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 flex flex-col gap-3 hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
              >
                {/* Gray icon square */}
                <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-stone-500 dark:text-stone-400" />
                </div>

                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="section-label text-stone-400 dark:text-stone-500 mb-1">
                      {cat.shortName}
                    </p>
                    <h3 className="font-serif text-[16px] font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-snug">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="flex-shrink-0 section-label text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                    {count}
                  </span>
                </div>

                {/* Strapline */}
                <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  {cat.strapline}
                </p>

                {/* Used by */}
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  Used by: {cat.usedBy}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1 text-[12px] font-medium mt-auto text-stone-600 dark:text-stone-300 group-hover:gap-2 transition-all">
                  Start practising
                  <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>

      </main>
    </>
  );
}
