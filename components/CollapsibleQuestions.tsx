'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleQuestionsProps {
  questions: string[];
  firmShortName: string;
}

export function CollapsibleQuestions({ questions, firmShortName }: CollapsibleQuestionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 text-caption text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
      >
        <span>{open ? 'Collapse questions' : `${questions.length} questions — expand`}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-5">
          <p className="text-caption text-stone-400 dark:text-stone-500 mb-5 leading-relaxed">
            Tailored to {firmShortName} — drawn from the firm&apos;s profile, practice areas, and recent news. Try answering each one aloud.
          </p>
          <ol className="space-y-4">
            {questions.map((question, i) => (
              <li key={i} className="flex gap-4">
                <span className="shrink-0 font-serif text-body text-stone-400 dark:text-stone-500 leading-none mt-0.5 w-6 text-right">
                  {i + 1}.
                </span>
                <p className="text-body text-stone-700 dark:text-stone-300 leading-relaxed">
                  {question}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
