import Link from 'next/link';
import type { Briefing } from '@/lib/types';
import { StoryGrid } from './StoryGrid';
import { SectorWatch } from './SectorWatch';

interface BriefingViewProps {
  briefing: Briefing;
  subscribed?: boolean;
}

export function BriefingView({ briefing, subscribed = false }: BriefingViewProps) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-10">

      {/* Strapline — always visible, orients new visitors */}
      <p className="font-sans text-[13px] text-stone-400 dark:text-stone-500 mb-8 leading-relaxed">
        Daily commercial law briefings for future City trainees — curated stories, talking points, and firm intelligence, every morning.
      </p>

      {/* Start Here callouts — guide non-subscribers to high-value content */}
      {!subscribed && (
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-3">
            Start here
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/primers"
              className="group block px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-sm hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
            >
              <span className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 block mb-1">
                Sector Primers
              </span>
              <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-100 group-hover:text-stone-900 dark:group-hover:text-stone-50 leading-snug">
                Background on M&amp;A, Capital Markets, Disputes &amp; more →
              </p>
            </Link>
            <Link
              href="/firms"
              className="group block px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-sm hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
            >
              <span className="font-mono text-[9px] tracking-widest uppercase text-stone-400 dark:text-stone-500 block mb-1">
                Firm Profiles
              </span>
              <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-100 group-hover:text-stone-900 dark:group-hover:text-stone-50 leading-snug">
                Deadlines, salaries &amp; culture notes for 37 City firms →
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* Story grid with practice group tabs */}
      <div className="mb-12">
        <StoryGrid stories={briefing.stories} date={briefing.date} subscribed={subscribed} />
      </div>

      {/* Bigger Picture */}
      {(briefing.sectorWatch || briefing.oneToFollow) && (
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500 font-sans flex-shrink-0">
              Bigger Picture
            </span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          </div>
          <SectorWatch
            sectorWatch={briefing.sectorWatch}
            oneToFollow={briefing.oneToFollow}
          />
        </section>
      )}

      {/* Footer */}
      <footer className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="font-mono text-[10px] text-stone-400 dark:text-stone-600 tracking-wide">
          Updated{' '}
          {new Date(briefing.generatedAt).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/London',
          })}{' '}
          GMT · {briefing.stories.length} stories
        </p>
        <p className="font-serif text-[11px] text-stone-400 dark:text-stone-600 italic">
          Commercial Awareness Daily
        </p>
      </footer>

    </main>
  );
}
