import Link from 'next/link';
import { Brain, Users, ArrowRight } from 'lucide-react';
import type { TestMeta } from '@/lib/tests-data';

export function TestCard({ test }: { test: TestMeta }) {
  const Icon = test.slug === 'watson-glaser' ? Brain : Users;

  return (
    <Link
      href={`/tests/${test.slug}`}
      className="group block bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-card p-6 sm:p-8 hover:border-stone-300 dark:hover:border-stone-600 transition-colors flex flex-col"
    >
      {/* Gray icon square */}
      <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center mb-4">
        <Icon size={18} className="text-stone-500 dark:text-stone-400" />
      </div>

      {/* Vendor overline */}
      <p className="section-label text-stone-400 dark:text-stone-500 mb-2">{test.vendor}</p>

      {/* Title in large serif */}
      <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-snug mb-3">{test.name}</h2>

      {/* Strapline */}
      <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed mb-4">{test.strapline}</p>

      {/* Feature bullets */}
      <p className="section-label text-stone-400 dark:text-stone-500 mb-2">What it measures</p>
      <ul className="space-y-1 mb-6">
        {test.subtypes.slice(0, 4).map((subtype) => (
          <li key={subtype.name} className="flex items-start gap-2 text-[12px] text-stone-600 dark:text-stone-400">
            <span className="mt-1 w-1 h-1 rounded-full bg-stone-400 flex-shrink-0" />
            <span>{subtype.name}</span>
          </li>
        ))}
        {test.subtypes.length > 4 && (
          <li className="flex items-start gap-2 text-[12px] text-stone-600 dark:text-stone-400">
            <span className="mt-1 w-1 h-1 rounded-full bg-stone-400 flex-shrink-0" />
            <span>+ {test.subtypes.length - 4} more</span>
          </li>
        )}
      </ul>

      {/* Spacer to push CTA to bottom */}
      <div className="flex-1" />

      {/* Charcoal CTA */}
      <div className="inline-flex items-center gap-2 bg-charcoal text-white font-semibold text-sm px-5 py-3 rounded-chrome group-hover:bg-charcoal-light transition-colors">
        Start practising <ArrowRight size={14} />
      </div>
    </Link>
  );
}
