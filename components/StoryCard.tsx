import { CopyButton } from './CopyButton';
import { TOPIC_STYLES, type Story } from '@/lib/types';

interface StoryCardProps {
  story: Story;
  index: number;
}

export function StoryCard({ story, index }: StoryCardProps) {
  const styles = TOPIC_STYLES[story.topic] ?? TOPIC_STYLES['International'];
  const num = String(index + 1).padStart(2, '0');

  return (
    <article
      className={`
        relative flex flex-col rounded-xl overflow-hidden
        bg-white dark:bg-zinc-900
        border border-zinc-200 dark:border-zinc-800
        ${styles.border}
        shadow-lg ${styles.shadow}
        animate-fade-in
        transition-colors duration-200
      `}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 tabular-nums">
          {num}
        </span>
        <span
          className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-widest uppercase
            ${styles.badge}
          `}
        >
          {story.topic}
        </span>
      </div>

      {/* Headline */}
      <div className="px-5 pb-4">
        <h2 className="text-[17px] font-bold leading-snug text-zinc-900 dark:text-zinc-50 tracking-tight">
          {story.headline}
        </h2>
      </div>

      {/* Summary */}
      <div className="px-5 pb-5">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {story.summary}
        </p>
      </div>

      {/* Why it matters */}
      <div className="mx-5 mb-5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 px-4 py-3.5">
        <p className={`text-[10px] font-mono font-semibold tracking-widest uppercase mb-2 ${styles.label}`}>
          Why it matters to law firms
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {story.whyItMatters}
        </p>
      </div>

      {/* Talking point */}
      <div className="mx-5 mb-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
            Interview talking point
          </p>
          <CopyButton text={story.talkingPoint} />
        </div>
        <blockquote className="text-sm italic text-zinc-700 dark:text-zinc-300 leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-700 pl-3">
          &ldquo;{story.talkingPoint}&rdquo;
        </blockquote>
      </div>
    </article>
  );
}
