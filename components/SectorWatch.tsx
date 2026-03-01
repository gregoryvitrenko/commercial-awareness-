import { TrendingUp, Eye } from 'lucide-react';

interface SectorWatchProps {
  sectorWatch: string;
  oneToFollow: string;
}

export function SectorWatch({ sectorWatch, oneToFollow }: SectorWatchProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      {/* Sector Watch */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-violet-500 px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={13} className="text-violet-400" />
          <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-violet-400">
            Sector Watch
          </p>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {sectorWatch}
        </p>
      </div>

      {/* One to Follow */}
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-amber-500 px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={13} className="text-amber-400" />
          <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-amber-400">
            One to Follow
          </p>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {oneToFollow}
        </p>
      </div>
    </div>
  );
}
