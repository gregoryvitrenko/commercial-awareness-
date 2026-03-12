'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { FirmCard } from './FirmCard';
import type { FirmProfile, FirmTier } from '@/lib/types';

const TIER_ORDER: FirmTier[] = ['Magic Circle', 'Silver Circle', 'National', 'International', 'US Firms', 'Boutique'];

type TierFilter = FirmTier | 'All';

export function FirmsDirectory({ firms }: { firms: FirmProfile[] }) {
  const [query, setQuery] = useState('');
  const [activeTier, setActiveTier] = useState<TierFilter>('All');
  const q = query.trim().toLowerCase();

  // Search takes precedence — if query is active, ignore tier filter
  const filtered = firms.filter((firm) => {
    if (q) {
      return (
        firm.name.toLowerCase().includes(q) ||
        firm.shortName.toLowerCase().includes(q) ||
        firm.aliases.some((a) => a.toLowerCase().includes(q)) ||
        firm.practiceAreas.some((a) => a.toLowerCase().includes(q)) ||
        firm.hq.toLowerCase().includes(q)
      );
    }
    if (activeTier !== 'All') {
      return firm.tier === activeTier;
    }
    return true;
  });

  const byTier = TIER_ORDER.reduce<Record<FirmTier, FirmProfile[]>>(
    (acc, tier) => {
      acc[tier] = filtered.filter((f) => f.tier === tier);
      return acc;
    },
    {} as Record<FirmTier, FirmProfile[]>
  );

  const totalMatches = filtered.length;

  // Count per tier from full unfiltered list (for sidebar badges)
  const tierCounts = TIER_ORDER.reduce<Record<FirmTier, number>>(
    (acc, tier) => {
      acc[tier] = firms.filter((f) => f.tier === tier).length;
      return acc;
    },
    {} as Record<FirmTier, number>
  );

  const isSearching = q.length > 0;

  return (
    <div className="lg:flex lg:gap-8 lg:items-start">
      {/* ── Left sidebar ─────────────────────────────── */}
      <aside className="lg:w-52 lg:shrink-0 lg:sticky lg:top-24 mb-6 lg:mb-0">
        <p className="section-label text-stone-500 dark:text-stone-400 mb-3 hidden lg:block">
          Filter by tier
        </p>

        {/* Tier filter tabs — horizontal row on mobile, vertical list on desktop */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
          {/* All button */}
          <button
            onClick={() => { setActiveTier('All'); setQuery(''); }}
            className={`flex items-center gap-1.5 w-max lg:w-full text-left text-[12px] font-sans font-medium px-3 py-2 rounded-chrome transition-colors whitespace-nowrap shrink-0
              ${!isSearching && activeTier === 'All'
                ? 'bg-oxford-blue text-white'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
              }
              ${isSearching ? 'opacity-50 pointer-events-none' : ''}`}
          >
            All
            <span className={`section-label ml-auto ${!isSearching && activeTier === 'All' ? 'text-white/70' : 'text-stone-400 dark:text-stone-500'}`}>
              {firms.length}
            </span>
          </button>

          {/* Tier buttons */}
          {TIER_ORDER.map((tier) => (
            <button
              key={tier}
              onClick={() => { setActiveTier(tier); setQuery(''); }}
              className={`flex items-center gap-1.5 w-max lg:w-full text-left text-[12px] font-sans font-medium px-3 py-2 rounded-chrome transition-colors whitespace-nowrap shrink-0
                ${!isSearching && activeTier === tier
                  ? 'bg-oxford-blue text-white'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
                }
                ${isSearching ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {tier}
              <span className={`section-label ml-auto ${!isSearching && activeTier === tier ? 'text-white/70' : 'text-stone-400 dark:text-stone-500'}`}>
                {tierCounts[tier]}
              </span>
            </button>
          ))}
        </div>

        {/* Divider — desktop only */}
        <div className="hidden lg:block h-px bg-stone-200 dark:bg-stone-700 my-4" />

        {/* Search input */}
        <div className="relative mt-4 lg:mt-0">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value) setActiveTier('All'); }}
            placeholder="Search firms…"
            className="w-full pl-9 pr-9 py-2.5 text-[12px] font-sans bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-chrome text-stone-900 dark:text-stone-50 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-stone-500 dark:focus:border-stone-400 transition-colors"
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
      </aside>

      {/* ── Right: firm grid ─────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Search result count */}
        {q && (
          <p className="text-[11px] font-sans text-stone-400 dark:text-stone-500 mb-6">
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
            // When tier filter is active (no search), only show the active tier
            if (!q && activeTier !== 'All' && tier !== activeTier) return null;
            // Hide empty tiers when searching
            if (q && tierFirms.length === 0) return null;
            return (
              <div key={tier}>
                <div className="mb-4">
                  {/* Full-width editorial rule above tier name */}
                  <div className="h-px bg-stone-900 dark:bg-stone-100 mb-3" />
                  <h3 className="flex items-baseline gap-3 font-sans text-sm tracking-widest uppercase text-stone-900 dark:text-stone-100">
                    {tier}
                    {q && (
                      <span className="font-sans normal-case tracking-normal text-label text-stone-400 dark:text-stone-500">
                        {tierFirms.length} firms
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex flex-col gap-1.5">
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
    </div>
  );
}
