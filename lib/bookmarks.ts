import type { TopicCategory } from './types';

export interface Bookmark {
  storyId: string;
  date: string;       // YYYY-MM-DD (briefing date)
  headline: string;
  topic: TopicCategory;
  excerpt: string;    // truncated summary for card preview
  savedAt: string;    // ISO timestamp
}

const BOOKMARKS_KEY = 'bookmarks';

function noteKey(date: string, storyId: string): string {
  return `note-${date}-${storyId}`;
}

export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(date: string, storyId: string): boolean {
  return getBookmarks().some((b) => b.date === date && b.storyId === storyId);
}

export function addBookmark(bookmark: Bookmark): void {
  const existing = getBookmarks().filter(
    (b) => !(b.date === bookmark.date && b.storyId === bookmark.storyId)
  );
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([bookmark, ...existing]));
}

export function removeBookmark(date: string, storyId: string): void {
  const existing = getBookmarks().filter(
    (b) => !(b.date === date && b.storyId === storyId)
  );
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(existing));
}

export function getNote(date: string, storyId: string): string {
  try {
    return localStorage.getItem(noteKey(date, storyId)) ?? '';
  } catch {
    return '';
  }
}

export function saveNote(date: string, storyId: string, text: string): void {
  try {
    if (text.trim()) {
      localStorage.setItem(noteKey(date, storyId), text);
    } else {
      localStorage.removeItem(noteKey(date, storyId));
    }
  } catch {}
}
