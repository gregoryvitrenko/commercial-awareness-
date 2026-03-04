'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PenLine, CheckCircle2 } from 'lucide-react';

interface StoredResult {
  score: number;
  total: number;
  completedAt: string;
}

function resultKey(date: string) {
  return `quiz-result-${date}`;
}

export function QuizBanner({ date }: { date: string }) {
  const [result, setResult] = useState<StoredResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(resultKey(date));
      if (raw) setResult(JSON.parse(raw));
    } catch {}
  }, [date]);

  // Don't render anything until mounted (avoids SSR/client mismatch)
  if (!mounted) return null;

  const isDone = result !== null;
  const pct = isDone ? Math.round((result.score / result.total) * 100) : 0;

  return (
    <Link
      href="/quiz"
      className="flex items-center gap-3 px-4 py-3 mb-6 rounded-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors group"
    >
      {isDone ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      ) : (
        <PenLine className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        {isDone ? (
          <p className="text-[12px] font-sans text-stone-700 dark:text-stone-300">
            <span className="font-semibold">Today&apos;s quiz complete</span>
            <span className="text-stone-400 dark:text-stone-500">
              {' '}· {result.score}/{result.total} correct ({pct}%)
            </span>
          </p>
        ) : (
          <p className="text-[12px] font-sans text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200">Test your recall</span>
            <span className="text-stone-400 dark:text-stone-500">
              {' '}· 21 questions · ~6 min
            </span>
          </p>
        )}
      </div>

      <span className="text-[11px] font-sans text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors flex-shrink-0">
        {isDone ? 'View results →' : 'Start quiz →'}
      </span>
    </Link>
  );
}
