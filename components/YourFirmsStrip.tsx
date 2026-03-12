import Link from 'next/link';
import { getFirmBySlug } from '@/lib/firms-data';

interface YourFirmsStripProps {
  slugs: string[];
}

/**
 * A subtle strip shown above the briefing for subscribed users who have
 * selected target firms during onboarding. Links directly to firm profiles.
 */
export function YourFirmsStrip({ slugs }: YourFirmsStripProps) {
  const firms = slugs.map((slug) => getFirmBySlug(slug)).filter(Boolean);
  if (firms.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
        <span className="font-sans text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 shrink-0">
          Tracking
        </span>
        {firms.map((firm) => (
          <Link
            key={firm!.slug}
            href={`/firms/${firm!.slug}`}
            className="text-[12px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            {firm!.shortName}
          </Link>
        ))}
        <span className="text-stone-200 dark:text-stone-700 select-none">·</span>
        <Link
          href="/onboarding"
          className="text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          Edit →
        </Link>
      </div>
    </div>
  );
}
