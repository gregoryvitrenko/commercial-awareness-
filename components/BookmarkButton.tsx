'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from './BookmarksProvider';
import type { TopicCategory } from '@/lib/types';

interface BookmarkButtonProps {
  storyId: string;
  date: string;
  headline: string;
  topic: TopicCategory;
  excerpt: string;
  /** 'card' = small corner icon, 'article' = labelled button */
  variant?: 'card' | 'article';
}

export function BookmarkButton({
  storyId,
  date,
  headline,
  topic,
  excerpt,
  variant = 'card',
}: BookmarkButtonProps) {
  const { savedIds, toggle, isLoading } = useBookmarks();
  const saved = savedIds.has(`${date}-${storyId}`);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await toggle({ storyId, date, headline, topic, excerpt });
  }

  if (isLoading) {
    if (variant === 'article') return <div className="w-[72px] h-[30px]" />;
    return null;
  }

  if (variant === 'article') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-[11px] font-sans font-medium transition-colors ${
          saved
            ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
        }`}
        aria-label={saved ? 'Remove bookmark' : 'Save this story'}
      >
        {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`p-1 rounded transition-colors ${
        saved
          ? 'text-amber-500 dark:text-amber-400'
          : 'text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400'
      }`}
      aria-label={saved ? 'Remove bookmark' : 'Save this story'}
    >
      {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
    </button>
  );
}
