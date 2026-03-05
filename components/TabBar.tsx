'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOPIC_STYLES, type TopicCategory } from '@/lib/types';
import { TOPIC_SLUGS } from '@/lib/topics';

interface TabBarProps {
  presentTopics: TopicCategory[];
  activeTopic?: TopicCategory;
}

export function TabBar({ presentTopics, activeTopic }: TabBarProps) {
  const pathname = usePathname();
  // Optimistic state: switches the active underline the instant you click,
  // before the server responds — gives zero-delay visual feedback.
  const [pending, setPending] = useState<TopicCategory | 'all' | null>(null);

  const displayActive: TopicCategory | 'all' | null =
    pending ?? activeTopic ?? (pathname === '/' ? 'all' : null);
  const isAll = displayActive === 'all';

  return (
    <div className="flex items-end overflow-x-auto no-scrollbar border-b border-stone-200 dark:border-stone-800 mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
      <Link
        href="/"
        onClick={() => setPending('all')}
        className={`flex-shrink-0 px-3 py-2.5 text-[11px] font-sans font-semibold tracking-[0.1em] uppercase border-b-2 -mb-px transition-colors whitespace-nowrap
          ${isAll
            ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100'
            : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
      >
        All
      </Link>
      {presentTopics.map(topic => {
        const styles = TOPIC_STYLES[topic];
        const slug = TOPIC_SLUGS[topic];
        const isActive = displayActive === topic;
        return (
          <Link
            key={topic}
            href={`/topic/${slug}`}
            onClick={() => setPending(topic)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-sans font-semibold tracking-[0.1em] uppercase border-b-2 -mb-px transition-colors whitespace-nowrap
              ${isActive
                ? `border-stone-900 dark:border-stone-100 ${styles.label}`
                : 'border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
              }`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
            {topic}
          </Link>
        );
      })}
      {/* Trailing spacer — padding-right doesn't expand scroll area in overflow containers on Safari/Firefox */}
      <span className="flex-shrink-0 w-4 sm:w-6" aria-hidden="true" />
    </div>
  );
}
