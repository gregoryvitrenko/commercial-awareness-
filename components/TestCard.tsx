import Link from 'next/link';
import { ChevronRight, Clock, BarChart2 } from 'lucide-react';
import type { TestMeta } from '@/lib/tests-data';

export function TestCard({ test }: { test: TestMeta }) {
  return (
    <Link
      href={`/tests/${test.slug}`}
      className="group block bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-card p-6 sm:p-8 hover:border-stone-300 dark:hover:border-stone-600 transition-colors flex flex-col"
    >
      {/* Vendor overline */}
      <p className="section-label text-stone-400 dark:text-stone-500 mb-3">{test.vendor}</p>

      {/* Title in large serif */}
      <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-snug mb-3">{test.name}</h2>

      {/* Description */}
      <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed mb-4">{test.description}</p>

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <Clock size={11} /><span>{test.timeNote}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <BarChart2 size={11} /><span>{test.difficulty}</span>
        </div>
      </div>

      {/* Used by — first 4 firms only */}
      <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-6">
        <span className="font-medium text-stone-500 dark:text-stone-400">Used by: </span>
        {test.usedBy.slice(0, 4).join(', ')}{test.usedBy.length > 4 && ` + ${test.usedBy.length - 4} more`}
      </p>

      {/* Spacer to push CTA to bottom */}
      <div className="flex-1" />

      {/* Oxford blue CTA */}
      <div className="inline-flex items-center gap-2 bg-charcoal text-white font-semibold text-sm px-5 py-3 rounded-chrome group-hover:bg-charcoal-light transition-colors">
        Start practising <ChevronRight size={14} />
      </div>
    </Link>
  );
}
