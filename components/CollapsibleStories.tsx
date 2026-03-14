'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { TOPIC_STYLES } from '@/lib/types';

interface Story {
  id: string;
  topic: string;
  headline: string;
  date: string;
}

interface CollapsibleStoriesProps {
  stories: Story[];
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CollapsibleStories({ stories }: CollapsibleStoriesProps) {
  const [open, setOpen] = useState(false);

  if (stories.length === 0) {
    return (
      <p className="text-caption text-stone-400 dark:text-stone-500">
        No recent stories found for this firm.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-3"
      >
        {/* empty left — heading already rendered by SectionHeading above */}
        <p className="text-caption text-stone-400 dark:text-stone-500">
          {open ? 'Click to collapse' : `${stories.length} stor${stories.length === 1 ? 'y' : 'ies'} — click to expand`}
        </p>
        <ChevronDown
          size={14}
          className={`shrink-0 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
          {stories.map((story) => {
            const styles =
              TOPIC_STYLES[story.topic as keyof typeof TOPIC_STYLES] ??
              TOPIC_STYLES['International'];
            return (
              <Link
                key={`${story.date}-${story.id}`}
                href={`/story/${story.id}`}
                className="flex items-start gap-3 py-3 group hover:bg-stone-50 dark:hover:bg-stone-800/30 -mx-6 px-6 transition-colors"
              >
                <span className={`mt-1.5 inline-block w-1.5 h-1.5 shrink-0 rounded-full ${styles.dot}`} />
                <div className="min-w-0">
                  <p className="text-caption font-medium text-stone-800 dark:text-stone-200 leading-snug group-hover:underline decoration-stone-400 dark:decoration-stone-500 underline-offset-2">
                    {story.headline}
                  </p>
                  <p className="text-label font-sans text-stone-400 dark:text-stone-500 mt-0.5">
                    {formatDisplayDate(story.date)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
