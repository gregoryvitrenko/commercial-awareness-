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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="space-y-4 mb-12 text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">
            Practice Area Primers
          </span>
          <h2 className="text-5xl font-serif font-semibold">Topic Primers</h2>
          <p className="opacity-60 text-lg font-light">Eight areas. Essential for interviews.</p>
        </div>

        {/* Primer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRIMERS.map((primer) => (
            <PrimerCard key={primer.slug} primer={primer} />
          ))}
        </div>
      </main>
    </>
  );
}
