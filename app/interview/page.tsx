import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { requireSubscription } from '@/lib/paywall';
import { getTodayDate } from '@/lib/storage';
import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_QUESTIONS,
  type InterviewCategorySlug,
} from '@/lib/interview-data';

export const dynamic = 'force-dynamic';

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    text: 'text-blue-600 dark:text-blue-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
    badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
    text: 'text-violet-600 dark:text-violet-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
  },
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
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={16} className="text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Interview Prep
          </h2>
          <span className="font-sans text-[10px] text-stone-400 dark:text-stone-500 tracking-widest uppercase bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
            {INTERVIEW_QUESTIONS.length} questions
          </span>
        </div>

        <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed mb-8 max-w-2xl">
          Practice the questions asked at TC and vacation scheme interviews. Each question includes a framework, key points firms assess, tips, and common mistakes to avoid.
        </p>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INTERVIEW_CATEGORIES.map((cat) => {
            const colors = COLOR_MAP[cat.color] ?? COLOR_MAP.blue;
            const count = questionCount(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/interview/${cat.slug}`}
                className={`group rounded-xl border ${colors.border} ${colors.bg} p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-sans text-[10px] tracking-widest uppercase mb-1 ${colors.text}`}>
                      {cat.shortName}
                    </p>
                    <h3 className="font-serif text-[16px] font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-snug">
                      {cat.name}
                    </h3>
                  </div>
                  <span className={`flex-shrink-0 font-sans text-[10px] tracking-widest uppercase px-2 py-0.5 rounded ${colors.badge}`}>
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
                <div className={`flex items-center gap-1 text-[12px] font-medium mt-auto ${colors.text} group-hover:gap-2 transition-all`}>
                  Start practising
                  <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tips banner */}
        <div className="mt-8 rounded-xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 px-5 py-4">
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-2">
            How to use this
          </p>
          <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed">
            Work through questions in each category before any interview or open day. Read the guidance, form your answer out loud, then reveal the tips and framework. The goal is not to memorise answers — it is to understand what firms are actually assessing with each question.
          </p>
        </div>

      </main>
    </>
  );
}
