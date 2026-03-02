'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { TOPIC_STYLES, type Story } from '@/lib/types';

interface StoryCardProps {
  story: Story;
  index: number;
}

export function StoryCard({ story, index }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const styles = TOPIC_STYLES[story.topic] ?? TOPIC_STYLES['International'];
  const num = String(index + 1).padStart(2, '0');

  return (
    <article
      className={`flex flex-col rounded-md overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${styles.topBorder}`}
    >
      {/* Header — always visible, click to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex flex-col text-left w-full px-5 pt-4 pb-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
              {num}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 select-none">·</span>
            <span className={`font-mono text-[10px] font-semibold tracking-widest uppercase ${styles.badge}`}>
              {story.topic}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
        <h2 className="text-[17px] font-bold leading-snug text-zinc-900 dark:text-zinc-50 tracking-tight">
          {story.headline}
        </h2>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">

          {/* Summary */}
          <div className="px-5 py-5">
            <p className="text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {story.summary}
            </p>
          </div>

          {/* Why it matters */}
          <div className="px-5 pb-5">
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5">
              <p className={`text-[10px] font-mono font-semibold tracking-widest uppercase mb-3 ${styles.label}`}>
                Why it matters to law firms
              </p>
              <p className="text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {story.whyItMatters}
              </p>
            </div>
          </div>

          {/* Talking point */}
          <div className="px-5 pb-5">
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
                  Interview talking point
                </p>
                <CopyButton text={story.talkingPoint} />
              </div>
              <blockquote className="text-[15px] italic text-zinc-700 dark:text-zinc-300 leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                &ldquo;{story.talkingPoint}&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Sources */}
          {story.sources && story.sources.length > 0 && (
            <div className="px-5 pb-5">
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2">
                  Sources
                </p>
                <ul className="space-y-1">
                  {story.sources.map((src, i) => (
                    <li key={i}>
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2 break-all transition-colors"
                      >
                        {src}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      )}
    </article>
  );
}
