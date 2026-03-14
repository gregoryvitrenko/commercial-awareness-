import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Scale } from 'lucide-react';
import { Header } from '@/components/Header';
import { getTodayDate } from '@/lib/storage';

export const metadata: Metadata = {
  title: 'Fit Assessment · Folio',
  description: 'Find the right firm and practice area for you. Take the Firm Fit quiz to discover which law firm matches your style, or the Area Fit quiz to find your ideal practice area.',
};

export const dynamic = 'force-dynamic';

export default async function FitPage() {
  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Page heading */}
        <div className="space-y-4 mb-12 text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold opacity-40 font-sans">
            Self Assessment
          </span>
          <h2 className="text-5xl font-serif font-semibold">Fit Assessment</h2>
          <p className="opacity-60 text-lg font-light">
            Find the right firm and practice area for you.
          </p>
        </div>

        {/* Two-card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

          {/* Firm Fit card */}
          <Link
            href="/firm-fit"
            className="group block bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-card p-6 hover:border-stone-300 dark:hover:border-stone-600 transition-colors flex flex-col"
          >
            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center mb-4">
              <Building2 size={18} className="text-stone-500 dark:text-stone-400" />
            </div>
            <p className="section-label text-stone-400 dark:text-stone-500 mb-2">2 minutes</p>
            <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-snug mb-3">
              Firm Fit Quiz
            </h3>
            <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
              Discover which type of law firm matches your personality, ambitions, and working style. Get personalised recommendations from 38 profiles.
            </p>
            <div className="flex-1" />
            <div className="inline-flex items-center gap-2 bg-charcoal text-white font-semibold text-sm px-5 py-3 rounded-chrome group-hover:bg-charcoal-light transition-colors">
              Start quiz
            </div>
          </Link>

          {/* Area Fit card */}
          <Link
            href="/area-fit"
            className="group block bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-card p-6 hover:border-stone-300 dark:hover:border-stone-600 transition-colors flex flex-col"
          >
            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center mb-4">
              <Scale size={18} className="text-stone-500 dark:text-stone-400" />
            </div>
            <p className="section-label text-stone-400 dark:text-stone-500 mb-2">2 minutes</p>
            <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-snug mb-3">
              Area Fit Quiz
            </h3>
            <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
              Find out which legal practice area matches your working style and interests. M&A, disputes, banking, regulation, AI and more.
            </p>
            <div className="flex-1" />
            <div className="inline-flex items-center gap-2 bg-charcoal text-white font-semibold text-sm px-5 py-3 rounded-chrome group-hover:bg-charcoal-light transition-colors">
              Start quiz
            </div>
          </Link>

        </div>
      </main>
    </>
  );
}
