import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { FirmsDirectory } from '@/components/FirmsDirectory';
import { FIRMS } from '@/lib/firms-data';
import { requireSubscription } from '@/lib/paywall';
import { getTodayDate } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Law Firm Profiles',
  description: 'Profiles for 55 UK and US law firms — Magic Circle, Silver Circle, and top US firms. Salaries, training contract deadlines, practice areas, diversity schemes, and interview prep.',
  openGraph: {
    title: 'Law Firm Profiles | Folio',
    description: 'Profiles for 55 firms including Allen & Overy Shearman, Clifford Chance, Freshfields, Linklaters, Slaughter and May, Latham & Watkins, and more.',
  },
};

export default async function FirmsPage() {
  await requireSubscription();
  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Page heading */}
        <div className="space-y-4 mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">
            Directory
          </span>
          <h2 className="text-5xl font-serif">Law Firm Profiles</h2>
          <p className="max-w-xl opacity-60 text-lg font-light">{FIRMS.length} firms. Magic Circle to boutique.</p>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-5 py-4 mb-8">
          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800">
            <ShieldCheck size={14} className="text-stone-400 dark:text-stone-500" />
          </div>
          <div>
            <p className="section-label mb-1.5">Data Verification</p>
            <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed">
              Deadline windows shown are approximate and based on typical prior-year cycles.
              Always verify opening and closing dates on each firm&apos;s official graduate recruitment page before applying.
            </p>
          </div>
        </div>

        {/* Search + tier jump links + firm grid — all client-side */}
        <FirmsDirectory firms={FIRMS} />

      </main>
    </>
  );
}
