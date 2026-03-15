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
    plainSummary.length > 220
      ? plainSummary.slice(0, 217).trimEnd() + '…'
      : plainSummary;

  // Prefer soundbite (short, punchy) for the card teaser; fall back to legacy talkingPoint
  const talkingPointRaw = story.talkingPoints?.soundbite ?? story.talkingPoint;
  const plainTalkingPoint = stripBold(talkingPointRaw);
  const talkingPointTeaser = plainTalkingPoint.length > 110
    ? plainTalkingPoint.slice(0, 107).trimEnd() + '…'
    : plainTalkingPoint;

  const destination = subscribed ? `/story/${story.id}?date=${date}` : '/upgrade';

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(destination)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') router.push(destination);
      }}
      className="group cursor-pointer flex flex-col h-full py-2"
    >
      <article className="flex flex-col h-full">

        {/* Category label */}
        <div className="flex items-center gap-2 mb-5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
          <span className={`section-label ${styles.label}`}>
            {story.topic}
          </span>
          {/* Bookmark — inline with label, stops link propagation */}
          <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
            <BookmarkButton
              storyId={story.id}
              date={date}
              headline={story.headline}
              topic={story.topic}
              excerpt={excerpt}
              variant="card"
            />
          </div>
        </div>

        {/* Headline — large serif, no explicit weight (Playfair Display default) */}
        <h2 className="font-serif text-2xl lg:text-3xl leading-tight text-stone-900 dark:text-stone-50 tracking-tight mb-5 group-hover:opacity-75 transition-opacity">
          {story.headline}
        </h2>

        {/* Thin colour bar under headline */}
        <div className={`h-px w-10 mb-5 ${styles.dot}`} />

        {/* Excerpt */}
        <p className="text-body text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-4 flex-1">
          {excerpt}
        </p>

        {/* Firm tags */}
        {story.firms && story.firms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4" onClick={(e) => e.stopPropagation()}>
            {story.firms.map((firm) => {
              const firmSlug = firmNameToSlug(firm);
              const chipClass =
                'inline-block text-label font-sans font-medium px-2 py-0.5 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700';
              return firmSlug ? (
                <Link
                  key={firm}
                  href={`/firms/${firmSlug}`}
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
        {(story.talkingPoints || story.talkingPoint) && (
          <p className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-label italic text-stone-400 dark:text-stone-500 leading-relaxed line-clamp-2">
            &ldquo;{talkingPointTeaser}&rdquo;
          </p>
        )}

        {/* Footer row — "Market Intelligence" label + coloured dot */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
          <span className="section-label text-stone-400 dark:text-stone-500">
            {subscribed ? (
              <span className="group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                Read article →
              </span>
            ) : (
              <span className="flex items-center gap-1 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                <Lock className="w-3 h-3" />
                Subscribe to read
              </span>
            )}
          </span>
          <span className={`inline-block w-2 h-2 rounded-full ${styles.dot}`} />
        </div>

      </article>
    </div>
  );
}
