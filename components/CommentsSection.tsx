'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import type { Comment } from '@/lib/types';

interface CommentsSectionProps {
  date: string;
  storyId: string;
  subscribed: boolean;
  currentUserId?: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CommentsSection({ date, storyId, subscribed, currentUserId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track the userId for the current session (from prop, updated after first post)
  const [myUserId, setMyUserId] = useState<string | null>(currentUserId ?? null);

  useEffect(() => {
    fetch(`/api/comments?date=${date}&storyId=${storyId}`)
      .then((r) => r.json())
      .then((d: { comments: Comment[] }) => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date, storyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, storyId, text }),
    });

    if (res.ok) {
      const { comment } = await res.json() as { comment: Comment };
      setComments((prev) => [comment, ...prev]);
      setText('');
      if (!myUserId) setMyUserId(comment.userId);
    } else {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setError(d.error ?? 'Failed to post comment. Please try again.');
    }
    setSubmitting(false);
  }

  async function handleDelete(comment: Comment) {
    // Optimistic update
    setComments((prev) => prev.filter((c) => c.id !== comment.id));

    const res = await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: comment.date, storyId: comment.storyId, commentId: comment.id }),
    });

    if (!res.ok) {
      // Revert on failure
      setComments((prev) => [comment, ...prev].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  }

  const charCount = text.length;
  const nearLimit = charCount > 400;

  return (
    <div className="mt-10">
      {/* Section divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        <span className="text-[9px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500 font-sans flex-shrink-0">
          Discussion
        </span>
        <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
      </div>

      {/* Comment list */}
      {loading ? (
        <p className="text-[12px] font-sans text-stone-400 dark:text-stone-500">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-[12px] font-sans text-stone-400 dark:text-stone-500 mb-6">
          No comments yet. Be the first.
        </p>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-stone-50 dark:bg-stone-800/60 rounded-sm border border-stone-100 dark:border-stone-800 px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-[12px] font-sans font-semibold text-stone-700 dark:text-stone-300 truncate">
                    {c.userName}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500 flex-shrink-0">
                    {relativeTime(c.createdAt)}
                  </span>
                </div>
                {myUserId === c.userId && (
                  <button
                    onClick={() => handleDelete(c)}
                    className="text-stone-300 dark:text-stone-700 hover:text-rose-400 dark:hover:text-rose-500 transition-colors flex-shrink-0"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap break-words">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Compose area */}
      {subscribed ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Share your take on this story…"
              rows={3}
              className="w-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-sm px-3 py-2 text-[13px] text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600 resize-none focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600"
            />
            {(focused || nearLimit) && (
              <span
                className={`absolute bottom-2 right-3 text-[10px] font-mono tabular-nums pointer-events-none ${
                  nearLimit
                    ? charCount >= 500
                      ? 'text-rose-500'
                      : 'text-amber-500'
                    : 'text-stone-400 dark:text-stone-600'
                }`}
              >
                {charCount}/500
              </span>
            )}
          </div>

          {error && (
            <p className="text-[11px] font-sans text-rose-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="text-[12px] font-sans font-semibold text-stone-800 dark:text-stone-200 hover:text-stone-500 dark:hover:text-stone-400 disabled:opacity-40 transition-colors"
          >
            {submitting ? 'Posting…' : 'Post comment →'}
          </button>
        </form>
      ) : (
        <p className="text-[12px] font-sans text-stone-400 dark:text-stone-500">
          <Link
            href="/upgrade"
            className="font-semibold text-stone-700 dark:text-stone-300 hover:underline underline-offset-2"
          >
            Subscribe
          </Link>{' '}
          to join the discussion.
        </p>
      )}
    </div>
  );
}
