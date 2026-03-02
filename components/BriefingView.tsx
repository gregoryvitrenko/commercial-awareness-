import type { Briefing } from '@/lib/types';
import { StoryCard } from './StoryCard';
import { SectorWatch } from './SectorWatch';
import { PodcastPlayer } from './PodcastPlayer';

interface BriefingViewProps {
  briefing: Briefing;
}

export function BriefingView({ briefing }: BriefingViewProps) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* Podcast player */}
      <PodcastPlayer briefing={briefing} />

      {/* Story grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        {briefing.stories.map((story, i) => (
          <div key={story.id} id={`story-${story.id}`}>
            <StoryCard story={story} index={i} />
          </div>
        ))}
      </div>

      {/* Bigger Picture */}
      {(briefing.sectorWatch || briefing.oneToFollow) && (
        <section>
          <div className="flex items-center gap-4 mb-5">
            <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 flex-shrink-0">
              Bigger Picture
            </span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <SectorWatch
            sectorWatch={briefing.sectorWatch}
            oneToFollow={briefing.oneToFollow}
          />
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wide">
          Generated{' '}
          {new Date(briefing.generatedAt).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/London',
          })}{' '}
          GMT · {briefing.stories.length} stories
        </p>
        <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wide">
          Commercial Awareness Daily
        </p>
      </footer>

    </main>
  );
}
