import { GraduationCap } from 'lucide-react';
import { Header } from '@/components/Header';
import { TestCard } from '@/components/TestCard';
import { TESTS } from '@/lib/tests-data';
import { requireSubscription } from '@/lib/paywall';
import { getTodayDate } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function TestsPage() {
  await requireSubscription();
  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap size={16} className="text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Aptitude Tests
          </h2>
          <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500 tracking-widest uppercase bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
            {TESTS.length} tests
          </span>
        </div>
        <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed mb-8 max-w-2xl">
          Practice the online assessments used by Magic Circle and US firms at application stage.
          Questions are AI-generated fresh each session so you never see the same question twice.
        </p>

        {/* Test grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TESTS.map((test) => (
            <TestCard key={test.slug} test={test} />
          ))}
        </div>
      </main>
    </>
  );
}
