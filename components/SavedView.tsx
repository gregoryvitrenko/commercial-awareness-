'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkX } from 'lucide-react';
import { useBookmarks } from './BookmarksProvider';
import { getNote } from '@/lib/bookmarks';
import { TOPIC_STYLES } from '@/lib/types';
import type { Bookmark as BookmarkData } from '@/lib/bookmarks';

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface SavedViewProps {
  today: string;
}

export function SavedView({ today }: SavedViewProps) {
  const { savedIds, toggle, isLoading } = useBookmarks();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoading) return;
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((data) => {
        const bms: BookmarkData[] = data.bookmarks ?? [];
        setBookmarks(bms);
        const noteMap: Record<string, string> = {};
        for (const b of bms) {
          const note = getNote(b.date, b.storyId);
          if (note) noteMap[`${b.date}-${b.storyId}`] = note;
        }
        setNotes(noteMap);
      });
  }, [isLoading, savedIds]);

  async function handleRemove(b: BookmarkData) {
    await toggle({ storyId: b.storyId, date: b.date, headline: b.headline, topic: b.topic, excerpt: b.excerpt });
  }

  if (isLoading) return null;

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <Bookmark className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
        <p className="text-sm text-stone-500 dark:text-stone-400">No saved stories yet.</p>
        <Link
          href="/"
          className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 underline underline-offset-4"
        >
          Read today&apos;s briefing →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((b) => {
        const styles = TOPIC_STYLES[b.topic] ?? TOPIC_STYLES['International'];
        const note = notes[`${b.date}-${b.storyId}`];
        const href = b.date === today ? `/story/${b.storyId}` : `/archive/${b.date}`;

        return (
          <div
            key={`${b.date}-${b.storyId}`}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm px-5 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
                  <span className={`text-[10px] font-sans font-semibold tracking-[0.12em] uppercase ${styles.label}`}>
                    {b.topic}
                  </span>
                  <span className="text-stone-300 dark:text-stone-700 text-[10px]">·</span>
                  <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                    {formatDate(b.date)}
                  </span>
                </div>

                <Link href={href} className="group">
                  <h3 className="font-serif text-[17px] font-bold leading-snug text-stone-900 dark:text-stone-50 tracking-tight group-hover:underline decoration-stone-400 dark:decoration-stone-500 underline-offset-2 mb-2">
                    {b.headline}
                  </h3>
                </Link>

                <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
                  {b.excerpt}
                </p>

                {note && (
                  <div className="mt-3 pl-3 border-l-2 border-amber-300 dark:border-amber-700">
                    <p className="text-[12px] text-stone-600 dark:text-stone-400 italic leading-relaxed line-clamp-2">
                      {note}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRemove(b)}
                className="flex-shrink-0 p-1.5 text-stone-300 dark:text-stone-600 hover:text-rose-400 dark:hover:text-rose-500 transition-colors"
                aria-label="Remove bookmark"
              >
                <BookmarkX className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
