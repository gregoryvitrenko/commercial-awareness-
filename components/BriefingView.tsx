import Link from 'next/link';
import type { Briefing } from '@/lib/types';
import { StoryGrid } from './StoryGrid';
import { SectorWatch } from './SectorWatch';
import { FileText, GraduationCap, Building2, Headphones } from 'lucide-react';

interface BriefingViewProps {
  briefing: Briefing;
  subscribed?: boolean;
}

export function BriefingView({ briefing, subscribed = false }: BriefingViewProps) {
  const [year, month, day] = briefing.date.split('-').map(Number);
  const briefingDate = new Date(year, month - 1, day);
  const formattedDate = briefingDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-10">

      {/* Start Here callouts — guide non-subscribers to high-value content */}
      {!subscribed && (
        <div className="mb-8">
          <p className="section-label mb-3">
            Start here
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/primers"
              className="group block px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-card hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
            >
              <span className="section-label block mb-1">
                Sector Primers
              </span>
              <p className="text-caption font-semibold text-stone-800 dark:text-stone-100 group-hover:text-stone-900 dark:group-hover:text-stone-50 leading-snug">
                Background on M&amp;A, Capital Markets, Disputes &amp; more →
              </p>
            </Link>
            <Link
              href="/firms"
              className="group block px-4 py-3 border border-stone-200 dark:border-stone-800 rounded-card hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
            >
              <span className="section-label block mb-1">
                Firm Profiles
              </span>
              <p className="text-caption font-semibold text-stone-800 dark:text-stone-100 group-hover:text-stone-900 dark:group-hover:text-stone-50 leading-snug">
                Deadlines, salaries &amp; culture notes for 37 City firms →
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* Strapline */}
      <p className="font-serif text-base sm:text-lg italic text-stone-400 dark:text-stone-500 text-center mb-3 leading-relaxed">
        From commercial awareness to commercial fluency — briefings, quiz, firm intelligence, and interview prep, every morning.
      </p>

      {/* Date line */}
      <div className="flex items-center justify-center py-4 mb-2 border-b border-stone-200 dark:border-stone-800">
        <span className="section-label text-stone-400 dark:text-stone-500">
          {formattedDate}
        </span>
      </div>

      {/* Story grid with practice group tabs */}
      <div className="mb-12">
        <StoryGrid stories={briefing.stories} date={briefing.date} subscribed={subscribed} />
      </div>

      {/* Bigger Picture */}
      {(briefing.sectorWatch || briefing.oneToFollow) && (
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
            <span className="text-label font-sans font-semibold tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500 flex-shrink-0">
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

      {/* Post-briefing upgrade block — non-subscribed users only */}
      {!subscribed && (
        <section className="mb-10">
          <div className="border border-stone-200 dark:border-stone-800 rounded-card px-6 py-7 text-center">
            <p className="section-label mb-3">
              Subscriber access
            </p>
            <h3 className="font-serif text-heading font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-2 leading-snug">
              You&apos;ve read today&apos;s headlines.
            </h3>
            <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed mb-5 max-w-sm mx-auto">
              Turn them into confident interview answers — with full analysis, firm intelligence, and daily practice.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[
                { icon: FileText,      label: 'Full articles' },
                { icon: GraduationCap, label: 'Daily quiz' },
                { icon: Building2,     label: 'Firm interview packs' },
                { icon: Headphones,    label: 'Podcast' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-label font-medium px-2.5 py-1 rounded-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                >
                  <Icon size={11} className="text-stone-400 dark:text-stone-500" />
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-chrome bg-[#2D3436] dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-caption font-medium hover:bg-[#3d4547] dark:hover:bg-stone-300 transition-colors"
              >
                Subscribe — £4 / month →
              </Link>
              <Link
                href="/sign-in"
                className="text-caption text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              >
                Already subscribed? Sign in
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="section-label text-stone-400 dark:text-stone-600">
          Updated{' '}
          {new Date(briefing.generatedAt).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/London',
          })}{' '}
          GMT · {briefing.stories.length} stories
        </p>
        <p className="font-serif text-[11px] text-stone-400 dark:text-stone-600 italic">
          Folio
        </p>
      </footer>

    </main>
  );
}
