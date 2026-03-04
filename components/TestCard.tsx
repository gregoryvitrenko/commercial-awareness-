import Link from 'next/link';
import { ChevronRight, Clock, BarChart2 } from 'lucide-react';
import type { TestMeta } from '@/lib/tests-data';

export function TestCard({ test }: { test: TestMeta }) {
  return (
    <Link
      href={`/tests/${test.slug}`}
      className="group block bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-6 py-5 hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
    >
      {/* Vendor badge */}
      <p className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-3">
        {test.vendor}
      </p>

      {/* Title */}
      <h2 className="font-serif text-[20px] font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-snug mb-1.5 group-hover:underline decoration-stone-400 dark:decoration-stone-500 underline-offset-2">
        {test.name}
      </h2>

      {/* Strapline */}
      <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
        {test.strapline}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <Clock size={11} />
          <span>{test.timeNote}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <BarChart2 size={11} />
          <span>{test.difficulty}</span>
        </div>
      </div>

      {/* Used by */}
      <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-4">
        <span className="font-medium text-stone-500 dark:text-stone-400">Used by: </span>
        {test.usedBy.slice(0, 5).join(', ')}
        {test.usedBy.length > 5 && ` + ${test.usedBy.length - 5} more`}
      </p>

      {/* Subtype pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {test.subtypes.map((s) => (
          <span
            key={s.name}
            className="text-[10px] px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 rounded-sm"
          >
            {s.name}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
        Start practising
        <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
