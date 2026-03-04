'use client';

import { useState, useEffect, useRef } from 'react';
import { getNote, saveNote } from '@/lib/bookmarks';

interface StoryNoteProps {
  date: string;
  storyId: string;
}

export function StoryNote({ date, storyId }: StoryNoteProps) {
  const [text, setText] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(getNote(date, storyId));
  }, [date, storyId]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setText(val);
    setSaveState('saving');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveNote(date, storyId, val);
      setSaveState('saved');
    }, 700);
  }

  return (
    <div className="mt-8 pt-8 border-t border-stone-100 dark:border-stone-800">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500">
          My notes
        </p>
        <span className={`text-[10px] font-mono transition-opacity duration-300 ${
          saveState === 'saved'
            ? 'text-stone-400 dark:text-stone-500 opacity-100'
            : 'opacity-0'
        }`}>
          saved
        </span>
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Jot down your own talking points, application angles, or things to follow up…"
        rows={4}
        className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-sm px-3.5 py-3 text-[14px] text-stone-700 dark:text-stone-300 placeholder:text-stone-300 dark:placeholder:text-stone-600 leading-relaxed resize-none focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors font-sans"
      />
    </div>
  );
}
