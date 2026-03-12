import Link from 'next/link';
import { ChevronRight, Clock, BookOpen } from 'lucide-react';
import type { Primer, TopicCategory } from '@/lib/types';
import { TOPIC_STYLES } from '@/lib/types';

export function PrimerCard({ primer }: { primer: Primer }) {
  const styles = TOPIC_STYLES[primer.category];

  return (
    <Link href={`/primers/${primer.slug}`} className="block group">
      <article className="flex flex-col h-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 pt-5 pb-5 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
        {/* Category + read time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${styles.dot}`} />
            <span className={`text-[10px] font-sans font-semibold tracking-[0.08em] uppercase ${styles.label}`}>
              {primer.category}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 font-sans">
            <Clock size={10} />
            {primer.readTimeMinutes} min
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-[18px] font-bold leading-snug text-stone-900 dark:text-stone-50 tracking-tight group-hover:underline decoration-stone-400 dark:decoration-stone-500 underline-offset-2 mb-2">
          {primer.title}
        </h3>

        {/* Strapline */}
        <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
          {primer.strapline}
        </p>

        {/* Footer: sections + key terms count */}
        <div className="mt-auto pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-stone-400 dark:text-stone-500">
              <span className="font-sans font-semibold text-stone-600 dark:text-stone-300">
                {primer.sections.length}
              </span>
              {' '}sections
            </span>
            <span className="text-[11px] text-stone-400 dark:text-stone-500">
              <span className="font-sans font-semibold text-stone-600 dark:text-stone-300">
                {primer.keyTerms.length}
              </span>
              {' '}key terms
            </span>
          </div>
          <ChevronRight
            size={14}
            className="shrink-0 text-stone-300 dark:text-stone-600 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors"
          />
        </div>
      </article>
    </Link>
  );
}
