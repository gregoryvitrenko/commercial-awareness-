import { TrendingUp, Eye } from 'lucide-react';

interface SectorWatchProps {
  sectorWatch: string;
  oneToFollow: string;
}

export function SectorWatch({ sectorWatch, oneToFollow }: SectorWatchProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Sector Watch */}
      <div className="rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-t-2 border-t-violet-500 px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={12} className="text-violet-500 dark:text-violet-400 flex-shrink-0" />
          <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-violet-600 dark:text-violet-400">
            Sector Watch
          </p>
        </div>
        <p className="text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {sectorWatch}
        </p>
      </div>

      {/* One to Follow */}
      <div className="rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-t-2 border-t-amber-500 px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={12} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
          <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-amber-600 dark:text-amber-400">
            One to Follow
          </p>
        </div>
        <p className="text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {oneToFollow}
        </p>
      </div>

    </div>
  );
}
