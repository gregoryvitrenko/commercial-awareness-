'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { TOPIC_STYLES, type Story } from '@/lib/types';
import { BookmarkButton } from './BookmarkButton';
import { firmNameToSlug } from '@/lib/firms-data';
import { stripBold } from '@/lib/bold';

interface StoryCardProps {
  story: Story;
  index: number;
  date: string;
  subscribed?: boolean;
}

export function StoryCard({ story, date, subscribed = false }: StoryCardProps) {
  const router = useRouter();
  const styles = TOPIC_STYLES[story.topic] ?? TOPIC_STYLES['International'];

  const plainSummary = stripBold(story.summary);
  const excerpt =
    plainSummary.length > 180
      ? plainSummary.slice(0, 177).trimEnd() + '…'
      : plainSummary;

  const plainTalkingPoint = stripBold(story.talkingPoint);
  const talkingPointTeaser = plainTalkingPoint.length > 110
    ? plainTalkingPoint.slice(0, 107).trimEnd() + '…'
    : plainTalkingPoint;

  const cardInner = (
    <article className="relative flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden px-5 pt-5 pb-6 h-full transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">

      {/* Bookmark button — top-right corner, stops link propagation */}
      <div className="absolute top-3 right-3">
        <BookmarkButton
          storyId={story.id}
          date={date}
          headline={story.headline}
          topic={story.topic}
          excerpt={excerpt}
          variant="card"
        />
      </div>

      {/* Category label */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
        <span className={`text-[10px] font-sans font-semibold tracking-[0.12em] uppercase ${styles.label}`}>
          {story.topic}
        </span>
      </div>

      {/* Headline — padded right so it clears the bookmark icon */}
      <h2 className="font-serif text-[19px] sm:text-[21px] font-bold leading-snug text-stone-900 dark:text-stone-50 tracking-tight mb-3 group-hover:underline decoration-stone-400 dark:decoration-stone-500 underline-offset-2 pr-6">
        {story.headline}
      </h2>

      {/* Excerpt */}
      <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-[1.65] line-clamp-3">
        {excerpt}
      </p>

      {/* Firm tags */}
      {story.firms && story.firms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {story.firms.map((firm) => {
            const firmSlug = firmNameToSlug(firm);
            const chipClass =
              'inline-block text-[10px] font-sans font-medium px-2 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700';
            return firmSlug ? (
              <Link
                key={firm}
                href={`/firms/${firmSlug}`}
                onClick={(e) => e.stopPropagation()}
                className={`${chipClass} hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors`}
              >
                {firm}
              </Link>
            ) : (
              <span key={firm} className={chipClass}>
                {firm}
              </span>
            );
          })}
        </div>
      )}

      {/* Interview angle teaser */}
      {story.talkingPoint && (
        <p className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] italic text-stone-400 dark:text-stone-500 leading-relaxed line-clamp-2 flex-shrink-0">
          &ldquo;{talkingPointTeaser}&rdquo;
        </p>
      )}

      {/* Read more indicator */}
      <p className="mt-4 text-[11px] font-sans font-medium tracking-wide text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors flex items-center gap-1.5">
        {subscribed ? (
          'Read article →'
        ) : (
          <>
            <Lock className="w-3 h-3" />
            Subscribe to read →
          </>
        )}
      </p>

    </article>
  );

  const destination = subscribed ? `/story/${story.id}?date=${date}` : '/upgrade';

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(destination)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') router.push(destination);
      }}
      className="block group cursor-pointer"
    >
      {cardInner}
    </div>
  );
}
