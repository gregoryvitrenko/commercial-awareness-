'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { TOPIC_STYLES, type Story } from '@/lib/types';
import { stripBold } from '@/lib/bold';
import { StoryCard } from './StoryCard';

interface NewspaperGridProps {
  stories: Story[];
  date: string;
  subscribed: boolean;
}

export function NewspaperGrid({ stories, date, subscribed }: NewspaperGridProps) {
  const router = useRouter();

  const lead = stories[0];
  const sidebarStories = stories.slice(1, 5);
  const belowFold = stories.slice(5, 8);

  if (!lead) return null;

  const leadStyles = TOPIC_STYLES[lead.topic] ?? TOPIC_STYLES['International'];
  const leadDestination = subscribed ? `/story/${lead.id}?date=${date}` : '/upgrade';

  return (
    <div>
      {/* ── Two-column newspaper section ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* Lead story — left column */}
        <div className="lg:col-span-8 lg:border-r lg:border-stone-200 dark:lg:border-stone-800 lg:pr-10">
          <div
            role="link"
            tabIndex={0}
            onClick={() => router.push(leadDestination)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push(leadDestination);
            }}
            className="group cursor-pointer"
          >
            <article>
              {/* Top story label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="section-label text-stone-400">Top Story</span>
                <span className="text-stone-300 dark:text-stone-600">/</span>
                <span className={`section-label ${leadStyles.label}`}>{lead.topic}</span>
              </div>

              {/* Large serif headline */}
              <h1 className="font-serif text-4xl lg:text-5xl leading-tight text-stone-900 dark:text-stone-50 tracking-tight mb-4 line-clamp-4 group-hover:opacity-75 transition-opacity">
                {lead.headline}
              </h1>

              {/* Topic colour bar */}
              <div className={`h-0.5 w-16 mb-5 ${leadStyles.dot}`} />

              {/* Excerpt — capped at 3 lines */}
              <p className="text-body text-stone-600 dark:text-stone-300 leading-relaxed mb-6 line-clamp-3">
                {stripBold(lead.summary)}
              </p>

              {/* Hero image — below the headline */}
              {lead.imageUrl && (
                <div className="relative mb-6 overflow-hidden rounded-card">
                  <div className="relative w-full" style={{ paddingBottom: '52%' }}>
                    <Image
                      src={lead.imageUrl}
                      alt={lead.headline}
                      fill
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                  {lead.imagePhotographer && lead.imagePhotographerUrl && (
                    <a
                      href={`${lead.imagePhotographerUrl}?utm_source=folio&utm_medium=referral`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 text-[10px] text-white/70 hover:text-white/100 transition-colors bg-black/30 rounded px-1.5 py-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Photo: {lead.imagePhotographer} / Unsplash
                    </a>
                  )}
                </div>
              )}

              {/* Read link */}
              <p className="text-label font-sans font-medium tracking-wide text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors flex items-center gap-1.5">
                {subscribed ? (
                  'Read full article →'
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    Subscribe to read →
                  </>
                )}
              </p>
            </article>
          </div>
        </div>

        {/* Sidebar — right column */}
        <div className="lg:col-span-4 space-y-6">

          {/* Subscription CTA — top of sidebar, non-subscribed users only */}
          {!subscribed && (
            <div className="rounded-card bg-[#2D3436] text-white p-6">
              <p className="font-serif text-xl font-semibold italic leading-snug mb-3">
                The Daily Briefing
              </p>
              <p className="text-caption text-stone-300 leading-relaxed mb-5">
                Daily commercial law briefings for future City trainees — curated stories, talking points, and firm intelligence, every morning.
              </p>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-chrome bg-white text-[#2D3436] text-caption font-semibold hover:bg-stone-100 transition-colors tracking-wide uppercase"
              >
                Subscribe for £4/month
              </Link>
            </div>
          )}

          {/* Market Intelligence list */}
          <div>
            <p className="section-label text-stone-400 mb-4">Market Intelligence</p>
            <div className="space-y-0 divide-y divide-stone-100 dark:divide-stone-800">
              {sidebarStories.map((s, i) => {
                const dest = subscribed ? `/story/${s.id}?date=${date}` : '/upgrade';
                return (
                  <div
                    key={s.id}
                    className="py-4 first:pt-0"
                  >
                    <div
                      className="flex gap-3 cursor-pointer group"
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(dest)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') router.push(dest);
                      }}
                    >
                      {/* Small italic number */}
                      <span className="font-serif text-sm italic text-stone-300 dark:text-stone-600 leading-none select-none flex-shrink-0 w-5 pt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {/* Headline only — compact */}
                      <h3 className="font-serif text-base font-semibold text-stone-800 dark:text-stone-100 leading-snug line-clamp-3 group-hover:underline decoration-stone-300 underline-offset-2">
                        {s.headline}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── Below-fold divider + 3-column grid ───────────────────────────────── */}
      {belowFold.length > 0 && (
        <>
          <div className="flex items-center gap-4 my-10">
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            <span className="section-label flex-shrink-0">More stories</span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-800">
            {belowFold.map((story, i) => (
              <div key={story.id} id={`story-${story.id}`} className="min-w-0 lg:px-8 first:lg:pl-0 last:lg:pr-0 py-8 lg:py-0">
                <StoryCard
                  story={story}
                  index={i + 5}
                  date={date}
                  subscribed={subscribed}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
