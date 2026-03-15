import { TrendingUp } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">

      {/* ── Sector Watch ── */}
      <div className="flex flex-col pt-5 pb-8 px-6">
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

      </div>

      {/* ── One to Follow ── */}
      <div className="flex flex-col pt-5 pb-8 px-6">
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
            <p className="text-body text-stone-600 dark:text-stone-400 leading-relaxed flex-1">
              {renderBold(oneToFollow.why)}
            </p>
          </>
        ) : (
          <p className="text-body text-stone-700 dark:text-stone-300 leading-relaxed flex-1">
            {oneToFollow}
          </p>
        )}

      </div>

    </div>
  );
}
