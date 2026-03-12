import Link from 'next/link';
import { Lock } from 'lucide-react';
import { TabBar } from './TabBar';
import { StoryCard } from './StoryCard';
import { ALL_TOPICS } from '@/lib/topics';
import type { Story, TopicCategory } from '@/lib/types';

interface StoryGridProps {
  stories: Story[];
  date: string;
  subscribed?: boolean;
}

// ── Mid-grid nudge ────────────────────────────────────────────────────────────
// Appears between card 3 and 4 (after the user has read 4 free cards).
// Spans both columns. Non-subscribed users only.

function MidGridNudge() {
  return (
    <div className="col-span-1 lg:col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-sm px-5 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <Lock size={13} className="shrink-0 mt-0.5 text-stone-400 dark:text-stone-500" />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
              These previews are free.
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-relaxed">
              Full articles, the daily quiz, 37 firm interview packs, and the podcast are included at £4/mo.
            </p>
          </div>
        </div>
        <Link
          href="/upgrade"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-oxford-blue text-white text-[12px] font-medium hover:bg-oxford-blue-light transition-colors"
        >
          Subscribe — £4/mo →
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function StoryGrid({ stories, date, subscribed = false }: StoryGridProps) {
  const presentTopics = ALL_TOPICS.filter((t: TopicCategory) => stories.some(s => s.topic === t));

  // Index after which the nudge appears (0-indexed: after the 4th card)
  const NUDGE_AFTER = 3;

  return (
    <div>
      <TabBar presentTopics={presentTopics} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stories.map((story, i) => (
          // `contents` makes this wrapper transparent to the grid layout,
          // so StoryCard and MidGridNudge both become direct grid children.
          <div key={story.id} className="contents">
            <div id={`story-${story.id}`} className="min-w-0">
              <StoryCard story={story} index={i} date={date} subscribed={subscribed} />
            </div>
            {!subscribed && i === NUDGE_AFTER && <MidGridNudge />}
          </div>
        ))}
      </div>
    </div>
  );
}
