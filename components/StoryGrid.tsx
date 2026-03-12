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
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[12px] font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
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

  // Split stories into editorial sections
  const lead = stories[0] ?? null;
  const secondary = stories.length >= 3 ? stories.slice(1, 3) : [];
  const remaining = stories.length >= 3 ? stories.slice(3) : stories.slice(1);

  return (
    <div>
      <TabBar presentTopics={presentTopics} />

      {lead && (
        <>
          {/* Lead story: featured variant on lg+, standard on mobile */}
          <div className="mb-6">
            <div className="hidden lg:block">
              <div id={`story-${lead.id}`} className="min-w-0">
                <StoryCard story={lead} index={0} date={date} subscribed={subscribed} featured />
              </div>
            </div>
            <div className="lg:hidden">
              <div id={`story-${lead.id}-mobile`} className="min-w-0">
                <StoryCard story={lead} index={0} date={date} subscribed={subscribed} />
              </div>
            </div>
          </div>

          {/* Secondary row: 2-column on lg+ */}
          {secondary.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {secondary.map((story, i) => (
                <div key={story.id} id={`story-${story.id}`} className="min-w-0">
                  <StoryCard story={story} index={i + 1} date={date} subscribed={subscribed} />
                </div>
              ))}
            </div>
          )}

          {/* Divider: lg+ only */}
          <div className="hidden lg:block h-px bg-stone-200 dark:bg-stone-800 mb-6" />
        </>
      )}

      {/* Remaining grid: standard 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {remaining.map((story, i) => (
          <div key={story.id} className="contents">
            <div id={`story-${story.id}`} className="min-w-0">
              <StoryCard story={story} index={i + (stories.length >= 3 ? 3 : 1)} date={date} subscribed={subscribed} />
            </div>
            {!subscribed && i === 0 && <MidGridNudge />}
          </div>
        ))}
      </div>
    </div>
  );
}
