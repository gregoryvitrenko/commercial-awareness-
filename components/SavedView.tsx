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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookmarks.map((b) => {
        const styles = TOPIC_STYLES[b.topic] ?? TOPIC_STYLES['International'];
        const note = notes[`${b.date}-${b.storyId}`];
        const href = `/story/${b.storyId}?date=${b.date}`;

        return (
          <div
            key={`${b.date}-${b.storyId}`}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-card p-5"
          >
            {/* Top row: date + remove button */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-stone-400 dark:text-stone-500">
                {formatDate(b.date)}
              </span>
              <div className="flex items-center gap-2">
                {/* Filled bookmark icon — dark, not interactive */}
                <Bookmark className="w-4 h-4 text-stone-800 dark:text-stone-200" fill="currentColor" />
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(b)}
                  className="p-1 text-stone-300 dark:text-stone-600 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
                  aria-label="Remove bookmark"
                >
                  <BookmarkX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Large serif headline */}
            <Link href={href} className="group block mb-4">
              <h3 className="font-serif text-heading font-semibold leading-snug text-stone-900 dark:text-stone-50 tracking-tight group-hover:underline decoration-stone-300 underline-offset-2">
                {b.headline}
              </h3>
            </Link>

            {/* Bottom row: topic chip + read time */}
            <div className="flex items-center gap-3">
              <span className={`inline-block px-2.5 py-0.5 rounded-pill border text-label font-sans uppercase tracking-wide ${styles.label} border-current`}>
                {b.topic}
              </span>
              <span className="text-label text-stone-400 dark:text-stone-500 font-sans uppercase tracking-wide">
                8 Min Read
              </span>
            </div>

            {/* Inline note (if present) */}
            {note && (
              <div className="mt-4 pl-3 border-l-2 border-charcoal dark:border-charcoal/60">
                <p className="text-caption text-stone-600 dark:text-stone-400 italic leading-relaxed line-clamp-2">
                  {note}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
