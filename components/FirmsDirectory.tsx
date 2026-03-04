'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { FirmCard } from './FirmCard';
import type { FirmProfile, FirmTier } from '@/lib/types';

const TIER_ORDER: FirmTier[] = ['Magic Circle', 'Silver Circle', 'International', 'US Firms', 'Boutique'];

function tierId(tier: FirmTier): string {
  return 'tier-' + tier.toLowerCase().replace(/\s+/g, '-');
}

const TIER_JUMP: Record<FirmTier, string> = {
  'Magic Circle':
    'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40',
  'Silver Circle':
    'border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40',
  'International':
    'border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40',
  'US Firms':
    'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40',
  'Boutique':
    'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
};

export function FirmsDirectory({ firms }: { firms: FirmProfile[] }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = firms.filter((firm) => {
    if (!q) return true;
    return (
      firm.name.toLowerCase().includes(q) ||
      firm.shortName.toLowerCase().includes(q) ||
      firm.aliases.some((a) => a.toLowerCase().includes(q)) ||
      firm.practiceAreas.some((a) => a.toLowerCase().includes(q)) ||
      firm.hq.toLowerCase().includes(q)
    );
  });

  const byTier = TIER_ORDER.reduce<Record<FirmTier, FirmProfile[]>>(
    (acc, tier) => {
      acc[tier] = filtered.filter((f) => f.tier === tier);
      return acc;
    },
    {} as Record<FirmTier, FirmProfile[]>
  );

  const totalMatches = filtered.length;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search firms, practice areas, cities…"
          className="w-full pl-9 pr-9 py-2.5 text-[13px] font-sans bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm text-stone-900 dark:text-stone-50 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-500 dark:focus:border-stone-400 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Tier jump links — hidden while searching (less relevant when filtering) */}
      {!q && (
        <div className="flex flex-wrap gap-2 mb-8">
          {TIER_ORDER.map((tier) => (
            <a
              key={tier}
              href={`#${tierId(tier)}`}
              className={`text-[10px] font-sans font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-sm border transition-colors ${TIER_JUMP[tier]}`}
            >
              {tier}
            </a>
          ))}
        </div>
      )}

      {/* Search result count */}
      {q && (
        <p className="text-[11px] font-mono text-stone-400 dark:text-stone-500 mb-6">
          {totalMatches === 0 ? (
            <>No firms match <span className="text-stone-600 dark:text-stone-300">&ldquo;{query}&rdquo;</span></>
          ) : (
            <>
              <span className="text-stone-700 dark:text-stone-200 font-semibold">{totalMatches}</span>
              {' '}firm{totalMatches === 1 ? '' : 's'} match{totalMatches === 1 ? 'es' : ''}{' '}
              <span className="text-stone-600 dark:text-stone-300">&ldquo;{query}&rdquo;</span>
            </>
          )}
        </p>
      )}

      {/* Tier sections */}
      <div className="space-y-10">
        {TIER_ORDER.map((tier) => {
          const tierFirms = byTier[tier];
          // Hide empty tiers when searching
          if (q && tierFirms.length === 0) return null;
          return (
            <div key={tier} id={tierId(tier)} className="scroll-mt-28">
              <h3 className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-3">
                {tier}
                {q && (
                  <span className="ml-2 font-sans normal-case tracking-normal text-stone-400 dark:text-stone-500">
                    ({tierFirms.length})
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tierFirms.map((firm) => (
                  <FirmCard key={firm.slug} firm={firm} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {q && totalMatches === 0 && (
        <div className="text-center py-16">
          <p className="text-[13px] text-stone-400 dark:text-stone-500 mb-3">
            No firms match &ldquo;{query}&rdquo;
          </p>
          <button
            onClick={() => setQuery('')}
            className="text-[11px] font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 underline underline-offset-2 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
