import { Building2, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/Header';
import { FirmsDirectory } from '@/components/FirmsDirectory';
import { FIRMS } from '@/lib/firms-data';
import { requireSubscription } from '@/lib/paywall';
import { getTodayDate } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function FirmsPage() {
  await requireSubscription();
  const today = getTodayDate();

  return (
    <>
      <Header date={today} isArchive />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Page heading */}
        <div className="flex items-center gap-3 mb-6">
          <Building2 size={16} className="text-zinc-400" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Firm Profiles
          </h2>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {FIRMS.length} firms
          </span>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2.5 rounded-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-4 py-3 mb-8">
          <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
          <p className="text-[12px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Deadline windows shown are approximate and based on typical prior-year cycles.
            Always verify opening and closing dates on each firm&apos;s official graduate recruitment page before applying.
          </p>
        </div>

        {/* Search + tier jump links + firm grid — all client-side */}
        <FirmsDirectory firms={FIRMS} />

      </main>
    </>
  );
}
