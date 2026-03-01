import type { Briefing } from '@/lib/types';
import { StoryCard } from './StoryCard';
import { SectorWatch } from './SectorWatch';
import { TOPIC_STYLES } from '@/lib/types';

interface BriefingViewProps {
  briefing: Briefing;
}

// Topic legend displayed above the grid
function TopicLegend({ topics }: { topics: string[] }) {
  const unique = Array.from(new Set(topics)) as (keyof typeof TOPIC_STYLES)[];
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {unique.map((topic) => {
        const s = TOPIC_STYLES[topic];
        if (!s) return null;
        return (
          <span
            key={topic}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-widest uppercase ${s.badge}`}
          >
            {topic}
          </span>
        );
      })}
    </div>
  );
}

export function BriefingView({ briefing }: BriefingViewProps) {
  const topics = briefing.stories.map((s) => s.topic);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Topic legend */}
      <TopicLegend topics={topics} />

      {/* Story grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {briefing.stories.map((story, i) => (
          <StoryCard key={story.id} story={story} index={i} />
        ))}
      </div>

      {/* Sector Watch + One to Follow */}
      {(briefing.sectorWatch || briefing.oneToFollow) && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
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
      <footer className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wide">
          Generated {new Date(briefing.generatedAt).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/London',
          })} GMT · {briefing.stories.length} stories
        </p>
        <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wide">
          Commercial Awareness Daily
        </p>
      </footer>
    </main>
  );
}
