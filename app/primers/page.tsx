import { BookOpen } from 'lucide-react';
import { Header } from '@/components/Header';
import { PrimerCard } from '@/components/PrimerCard';
import { PRIMERS } from '@/lib/primers-data';
import { requireSubscription } from '@/lib/paywall';
import { getTodayDate } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function PrimersPage() {
  await requireSubscription();
  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={16} className="text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Sector Primers
          </h2>
          <span className="font-sans text-[10px] text-stone-400 dark:text-stone-500 tracking-widest uppercase bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-chrome">
            {PRIMERS.length} topics
          </span>
        </div>
        <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed mb-8 max-w-2xl">
          Everything you need to understand the core practice areas of commercial law — written for
          interview prep, not textbooks.
        </p>

        {/* Primer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRIMERS.map((primer) => (
            <PrimerCard key={primer.slug} primer={primer} />
          ))}
        </div>
      </main>
    </>
  );
}
