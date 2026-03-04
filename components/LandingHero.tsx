import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

const FEATURES = [
  'Full articles — analysis, talking points, why it matters',
  'Daily quiz — 18 questions testing your recall',
  'Audio briefing — human voice, listen on your commute',
  'Full archive — every past briefing',
];

export function LandingHero() {
  return (
    <div className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-4">
            For law students targeting Magic Circle, Silver Circle &amp; US firm TCs
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight mb-4">
            Stay commercially aware.<br />Every morning.
          </h2>
          <p className="text-[15px] text-stone-500 dark:text-stone-400 leading-[1.75] mb-8 max-w-lg">
            Six curated stories from M&amp;A, capital markets, regulation and more — with full analysis, interview talking points, and a daily quiz to sharpen your recall.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-stone-600 dark:text-stone-400">{f}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              href="/sign-up"
              className="inline-block px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[14px] font-medium hover:opacity-80 transition-opacity"
            >
              Start free — £4/month →
            </Link>
            <p className="text-[12px] text-stone-400 dark:text-stone-500">
              Headlines &amp; summaries below are always free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
