import { CopyButton } from './CopyButton';
import { CopyLinkButton } from './CopyLinkButton';
import { BookmarkButton } from './BookmarkButton';
import { StoryNote } from './StoryNote';
import { CommentsSection } from './CommentsSection';
import { TOPIC_STYLES, type Story, type WhyItMatters, type TalkingPoints } from '@/lib/types';
import { renderBold, stripBold } from '@/lib/bold';

function isStructured(w: WhyItMatters | string): w is WhyItMatters {
  return typeof w === 'object' && w !== null && 'ukFirms' in w;
}

interface ArticleStoryProps {
  story: Story;
  date: string;
  subscribed?: boolean;
  currentUserId?: string;
}

export function ArticleStory({ story, date, subscribed = true, currentUserId }: ArticleStoryProps) {
  const styles = TOPIC_STYLES[story.topic] ?? TOPIC_STYLES['International'];

  const plainSummary = stripBold(story.summary);
  const excerpt =
    plainSummary.length > 180
      ? plainSummary.slice(0, 177).trimEnd() + '…'
      : plainSummary;

  return (
    <article className="border-t border-stone-200 dark:border-stone-800 py-10">
      {/* Category label + bookmark button */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
          <span className={`text-label font-sans font-semibold tracking-[0.12em] uppercase ${styles.label}`}>
            {story.topic}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyLinkButton />
          <BookmarkButton
            storyId={story.id}
            date={date}
            headline={story.headline}
            topic={story.topic}
            excerpt={excerpt}
            variant="article"
          />
        </div>
      </div>

      {/* Headline */}
      <h2 className="font-serif text-article leading-tight text-stone-900 dark:text-stone-50 tracking-tight mb-6">
        {story.headline}
      </h2>

      {/* Summary */}
      <p className="text-[16px] text-stone-700 dark:text-stone-300 leading-[1.75] mb-8">
        {renderBold(story.summary)}
      </p>

      {/* Why it matters */}
      <div className="mb-8">
        <p className={`text-label font-sans font-semibold tracking-[0.15em] uppercase mb-5 ${styles.label}`}>
          Why it matters to law firms
        </p>

        {isStructured(story.whyItMatters) ? (
          <div>
            {/* UK Firms / US Firms — side by side on md+ */}
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <p className="text-label font-sans font-semibold tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 mb-2.5">
                  UK Firms
                </p>
                <p className="text-body text-stone-700 dark:text-stone-300 leading-[1.75]">
                  {renderBold(story.whyItMatters.ukFirms)}
                </p>
              </div>
              <div className="md:border-l md:border-stone-150 md:dark:border-stone-800 md:pl-8">
                <p className="text-label font-sans font-semibold tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 mb-2.5">
                  US Firms in London
                </p>
                <p className="text-body text-stone-700 dark:text-stone-300 leading-[1.75]">
                  {renderBold(story.whyItMatters.usFirms)}
                </p>
              </div>
            </div>
            {/* On the Ground — full width */}
            <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
              <p className="text-label font-sans font-semibold tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 mb-2.5">
                On the Ground
              </p>
              <p className="text-body text-stone-700 dark:text-stone-300 leading-[1.75]">
                {renderBold(story.whyItMatters.onTheGround)}
              </p>
            </div>
          </div>
        ) : (
          /* Legacy plain-string format */
          <p className="text-[16px] text-stone-700 dark:text-stone-300 leading-[1.75]">
            {story.whyItMatters as string}
          </p>
        )}
      </div>

      {/* Talking points */}
      <div className="mb-8">
        <p className={`text-label font-sans font-semibold tracking-[0.15em] uppercase mb-5 ${styles.label}`}>
          Interview talking points
        </p>

        {story.talkingPoints ? (
          <div className="space-y-5">
            {/* Soundbite */}
            <div className="rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 px-5 py-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-label font-sans font-semibold tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500">
                  Soundbite
                </p>
                <CopyButton text={stripBold(story.talkingPoints.soundbite)} />
              </div>
              <p className="font-serif text-subheading font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                {renderBold(story.talkingPoints.soundbite)}
              </p>
            </div>

            {/* Partner answer */}
            <div className="rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 px-5 py-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-label font-sans font-semibold tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500">
                  Partner-length answer
                </p>
                <CopyButton text={stripBold(story.talkingPoints.partnerAnswer)} />
              </div>
              <p className="text-body text-stone-700 dark:text-stone-300 leading-[1.75]">
                {renderBold(story.talkingPoints.partnerAnswer)}
              </p>
            </div>

            {/* Full commercial */}
            <div className="rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 px-5 py-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-label font-sans font-semibold tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500">
                  Full commercial answer
                </p>
                <CopyButton text={stripBold(story.talkingPoints.fullCommercial)} />
              </div>
              <p className="text-body text-stone-700 dark:text-stone-300 leading-[1.75]">
                {renderBold(story.talkingPoints.fullCommercial)}
              </p>
            </div>
          </div>
        ) : (
          /* Legacy single talking point (briefings before 2026-03-05) */
          <div>
            <div className="flex items-center justify-end gap-2 mb-3">
              <CopyButton text={stripBold(story.talkingPoint)} />
            </div>
            <blockquote className="font-serif text-[16px] italic text-stone-700 dark:text-stone-300 leading-[1.75] border-l-2 border-stone-300 dark:border-stone-600 pl-5">
              &ldquo;{renderBold(story.talkingPoint)}&rdquo;
            </blockquote>
          </div>
        )}
      </div>

      {/* Sources */}
      {story.sources && story.sources.length > 0 && (
        <div className="mb-0">
          <p className="text-label font-sans font-semibold tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 mb-2">
            Sources
          </p>
          <ul className="space-y-1">
            {story.sources.map((src, i) => (
              <li key={i}>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline underline-offset-2 break-all transition-colors"
                >
                  {src}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Personal notes — autosaved to localStorage */}
      <StoryNote date={date} storyId={story.id} />

      {/* Community discussion */}
      <CommentsSection
        date={date}
        storyId={story.id}
        subscribed={subscribed}
        currentUserId={currentUserId}
      />
    </article>
  );
}
