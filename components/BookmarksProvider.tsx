'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '@/lib/bookmarks';

interface BookmarksContextValue {
  savedIds: Set<string>;
  toggle: (bookmark: Omit<Bookmark, 'savedAt'>) => Promise<void>;
  isLoading: boolean;
}

const BookmarksContext = createContext<BookmarksContextValue>({
  savedIds: new Set(),
  toggle: async () => {},
  isLoading: false,
});

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((data) => {
        setSavedIds(new Set(data.ids ?? []));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const toggle = useCallback(
    async (bookmark: Omit<Bookmark, 'savedAt'>) => {
      const key = `${bookmark.date}-${bookmark.storyId}`;
      const isSaved = savedIds.has(key);

      // Optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(key);
        else next.add(key);
        return next;
      });

      await fetch('/api/bookmarks', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isSaved
            ? { date: bookmark.date, storyId: bookmark.storyId }
            : bookmark
        ),
      });
    },
    [savedIds]
  );

  return (
    <BookmarksContext.Provider value={{ savedIds, toggle, isLoading }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
