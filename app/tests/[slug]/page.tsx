import { notFound } from 'next/navigation';
import { GraduationCap, Clock, Building2, ChevronLeft, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TestPractice } from '@/components/TestPractice';
import { getTestBySlug } from '@/lib/tests-data';
import { requireSubscription } from '@/lib/paywall';
import { getTodayDate } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function TestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSubscription();
  const { slug } = await params;
  const test = getTestBySlug(slug);
  if (!test) notFound();

  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Back link */}
        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 rounded-sm px-3 py-1.5 transition-colors mb-8"
        >
          <ChevronLeft size={14} />
          All tests
        </Link>

        {/* Hero */}
        <div className="mb-8 pl-5 border-l-[4px] border-l-stone-900 dark:border-l-stone-100">
          <span className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-2 block">
            {test.vendor}
          </span>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight mb-3">
            {test.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-stone-400 dark:text-stone-500">
              <Clock size={11} />
              {test.timeNote}
            </span>
            <span
              className={`inline-block text-[10px] font-sans font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded-sm ${
                test.difficulty === 'Hard'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {test.difficulty}
            </span>
          </div>
        </div>

        <div className="space-y-4">

          {/* Overview */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-stone-400 dark:text-stone-500">
                <GraduationCap size={13} />
              </span>
              <span className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-500 dark:text-stone-400">
                Overview
              </span>
            </div>
            <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-[1.75] mb-5">
              {test.description}
            </p>

            {/* Used by */}
            {test.usedBy.length > 0 && (
              <div>
                <p className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-2">
                  Used by {test.usedBy.length} of 38 profiled firms
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {test.usedBy.map((firm) => (
                    <span
                      key={firm}
                      className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                    >
                      <Building2 size={9} />
                      {firm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subtypes / sections */}
          {test.subtypes.length > 1 && (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-stone-400 dark:text-stone-500">
                  <GraduationCap size={13} />
                </span>
                <span className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-500 dark:text-stone-400">
                  Test Sections
                </span>
              </div>
              <div className="space-y-4">
                {test.subtypes.map((subtype, i) => (
                  <div key={subtype.name} className="flex gap-4">
                    <span className="font-sans text-[11px] text-stone-400 dark:text-stone-500 shrink-0 mt-0.5 w-4">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-200 mb-0.5">
                        {subtype.name}
                      </p>
                      <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed">
                        {subtype.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-stone-400 dark:text-stone-500">
                <Lightbulb size={13} />
              </span>
              <span className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-500 dark:text-stone-400">
                Tips
              </span>
            </div>
            <ul className="space-y-2.5">
              {test.tips.map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-sans text-[10px] text-stone-300 dark:text-stone-600 shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed">
                    {tip}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice component */}
          <TestPractice testType={test.slug} />

        </div>
      </main>
    </>
  );
}
