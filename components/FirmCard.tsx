import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import type { FirmProfile, FirmTier } from '@/lib/types';
import { getDiversitySchemes } from '@/lib/diversity-data';

const TIER_BORDER: Record<FirmTier, string> = {
  'Magic Circle':  'border-l-blue-500 dark:border-l-blue-400',
  'Silver Circle': 'border-l-violet-500 dark:border-l-violet-400',
  'National':      'border-l-rose-500 dark:border-l-rose-400',
  'International': 'border-l-teal-500 dark:border-l-teal-400',
  'US Firms':      'border-l-amber-500 dark:border-l-amber-400',
  'Boutique':      'border-l-emerald-500 dark:border-l-emerald-400',
};

export function FirmCard({ firm }: { firm: FirmProfile }) {
  const hasDiversity = getDiversitySchemes(firm.slug).length > 0;

  return (
    <Link href={`/firms/${firm.slug}`} className="block group">
      <div
        className={`flex items-center gap-3 sm:gap-5 border-l-[3px] pl-4 pr-4 py-3.5
          bg-white dark:bg-stone-900
          border-t border-r border-b border-stone-100 dark:border-stone-800/80
          hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors rounded-r-sm
          ${TIER_BORDER[firm.tier]}`}
      >
        {/* ── Name + HQ ───────────────────────────────── */}
        <div className="min-w-0 w-44 sm:w-52 shrink-0">
          <p className="font-serif text-[14px] sm:text-[15px] font-semibold leading-snug text-stone-900 dark:text-stone-50 truncate group-hover:underline decoration-stone-400 dark:decoration-stone-500 underline-offset-2">
            {firm.name}
          </p>
          <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">
            {firm.hq}
          </p>
        </div>

        {/* ── Practice area pills ─────────────────────── */}
        <div className="hidden sm:flex flex-wrap gap-1 flex-1 min-w-0">
          {firm.practiceAreas.slice(0, 3).map((area) => (
            <span
              key={area}
              className="inline-block text-[9px] font-sans font-medium px-1.5 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 whitespace-nowrap"
            >
              {area}
            </span>
          ))}
        </div>

        {/* ── Right: diversity indicator + NQ + arrow ─ */}
        <div className="ml-auto shrink-0 flex items-center gap-3">
          {hasDiversity && (
            <span
              title="Has diversity & access schemes"
              className="text-rose-400 dark:text-rose-500 flex-shrink-0"
            >
              <Heart size={11} />
            </span>
          )}
          <span className="hidden xs:block text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
            NQ {firm.trainingContract.nqSalaryNote}
          </span>
          <ChevronRight
            size={13}
            className="shrink-0 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors"
          />
        </div>
      </div>
    </Link>
  );
}
