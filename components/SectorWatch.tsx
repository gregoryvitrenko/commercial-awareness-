import { TrendingUp, Zap } from 'lucide-react';
import type { SectorWatchData, OneToFollowData } from '@/lib/types';
import { renderBold } from '@/lib/bold';

interface SectorWatchProps {
  sectorWatch: string | SectorWatchData;
  oneToFollow: string | OneToFollowData;
}

function isSWData(v: unknown): v is SectorWatchData {
  return typeof v === 'object' && v !== null && 'trend' in v && 'body' in v;
}

function isOTFData(v: unknown): v is OneToFollowData {
  return typeof v === 'object' && v !== null && 'story' in v && 'why' in v;
}

export function SectorWatch({ sectorWatch, oneToFollow }: SectorWatchProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800">

      {/* ── Sector Watch ── */}
      <div className="relative flex flex-col pt-5 pb-8 md:pr-8 overflow-hidden">
        {/* Top editorial accent line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-stone-900 dark:bg-stone-100" />

        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={11} className="text-stone-500 dark:text-stone-400 flex-shrink-0" />
          <span className="section-label">
            Sector Watch
          </span>
        </div>

        {isSWData(sectorWatch) ? (
          <>
            <h3 className="font-serif text-2xl lg:text-3xl leading-tight text-stone-900 dark:text-stone-50 mb-5">
              {renderBold(sectorWatch.trend)}
            </h3>
            <p className="text-body text-stone-600 dark:text-stone-400 leading-relaxed flex-1">
              {renderBold(sectorWatch.body)}
            </p>
          </>
        ) : (
          <p className="text-body text-stone-700 dark:text-stone-300 leading-relaxed flex-1">
            {sectorWatch}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-stone-100 dark:border-stone-800">
          <span className="section-label text-stone-400 dark:text-stone-500">Market Intelligence Unit</span>
          <span className="inline-block w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-600" />
        </div>
      </div>

      {/* ── One to Follow ── */}
      <div className="flex flex-col pt-5 pb-8 md:pl-8">
        <div className="flex items-center gap-2 mb-6">
          {/* Pulsing amber dot — signals developing/live story */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 dark:bg-amber-500 opacity-70" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 dark:bg-amber-400" />
          </span>
          <span className="section-label">
            One to Follow
          </span>
        </div>

        {isOTFData(oneToFollow) ? (
          <>
            <h3 className="font-serif text-2xl lg:text-3xl leading-tight text-stone-900 dark:text-stone-50 mb-5">
              {renderBold(oneToFollow.story)}
            </h3>
            <p className="text-body text-stone-500 dark:text-stone-400 leading-relaxed flex-1">
              {renderBold(oneToFollow.why)}
            </p>
          </>
        ) : (
          <p className="text-body text-stone-700 dark:text-stone-300 leading-relaxed flex-1">
            {oneToFollow}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-stone-200 dark:border-stone-700">
            <Zap size={11} className="text-stone-400 dark:text-stone-500" />
          </div>
          <span className="section-label text-stone-400 dark:text-stone-500">Legal Precedent Alert</span>
        </div>
      </div>

    </div>
  );
}
