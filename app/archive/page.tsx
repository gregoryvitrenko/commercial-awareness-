import Link from 'next/link';
import { listBriefings, getBriefing, getTodayDate } from '@/lib/storage';
import { listPodcastDatesWithStatus } from '@/lib/podcast-storage';
import { Header } from '@/components/Header';
import { requireSubscription } from '@/lib/paywall';
import { BriefingsFilter } from './BriefingsFilter';

export const dynamic = 'force-dynamic';

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatLongDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ArchivePage() {
  await requireSubscription();

  const [briefingDates, podcastEpisodesRaw] = await Promise.all([
    listBriefings(),
    listPodcastDatesWithStatus(),
  ]);
  // Use briefing dates for the quizzes column — quiz:index may not be populated yet
  // (quizzes are generated fire-and-forget), but a briefing always exists for each date.
  const quizDates = briefingDates;

  const today = getTodayDate();
  const podcastDates = podcastEpisodesRaw.filter((e) => e.hasAudio).map((e) => e.date);

  // ── Build firm → dates index for the briefings filter ──────────────────────
  const displayDates = briefingDates.slice(0, 30);
  const recentBriefings = await Promise.all(displayDates.map((d) => getBriefing(d)));

  const firmDates: Record<string, string[]> = {};
  recentBriefings.forEach((briefing, i) => {
    if (!briefing) return;
    const date = displayDates[i];
    const firmsInBriefing = new Set<string>();
    briefing.stories.forEach((story) => {
      (story.firms ?? []).forEach((f) => firmsInBriefing.add(f));
    });
    firmsInBriefing.forEach((firm) => {
      if (!firmDates[firm]) firmDates[firm] = [];
      firmDates[firm].push(date);
    });
  });
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* v3 heading block */}
        <div className="mb-12">
          <p className="section-label mb-3">Historical Intelligence</p>
          <h1 className="font-serif text-5xl lg:text-6xl font-normal mb-4">The Archive</h1>
          <div className="w-16 h-px bg-stone-300 dark:bg-stone-700 mb-4" />
          <p className="text-caption text-stone-500 dark:text-stone-400 max-w-md">
            Past briefings, quizzes, and podcast episodes — in one place.
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Briefings column — with firm filter */}
          <div id="briefings">
            <h3 className="text-2xl font-serif italic border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
              Briefings
            </h3>
            <BriefingsFilter allDates={displayDates} firmDates={firmDates} today={today} />
          </div>

          {/* Quizzes column */}
          <div id="quizzes">
            <h3 className="text-2xl font-serif italic border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
              Quizzes
            </h3>
            <div className="space-y-0">
              {quizDates.slice(0, 30).map((date) => (
                <Link
                  key={date}
                  href={`/quiz/${date}`}
                  className="group block"
                >
                  <div className="py-2 border-b border-stone-100 dark:border-stone-800/50">
                    <span className="text-caption text-stone-400 dark:text-stone-500 block mb-0.5">
                      {formatShortDate(date)}
                    </span>
                    <span className="font-serif text-body text-stone-800 dark:text-stone-200 group-hover:underline underline-offset-2">
                      {formatLongDate(date)}
                    </span>
                  </div>
                </Link>
              ))}
              {quizDates.length === 0 && (
                <p className="text-caption text-stone-400">No entries yet.</p>
              )}
            </div>
          </div>

          {/* Podcasts column */}
          <div id="podcasts">
            <h3 className="text-2xl font-serif italic border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
              Podcasts
            </h3>
            <div className="space-y-0">
              {podcastDates.slice(0, 30).map((date) => (
                <Link
                  key={date}
                  href={date === today ? '/podcast' : `/podcast/${date}`}
                  className="group block"
                >
                  <div className="py-2 border-b border-stone-100 dark:border-stone-800/50">
                    <span className="text-caption text-stone-400 dark:text-stone-500 block mb-0.5">
                      {formatShortDate(date)}
                    </span>
                    <span className="font-serif text-body text-stone-800 dark:text-stone-200 group-hover:underline underline-offset-2">
                      {formatLongDate(date)}
                    </span>
                  </div>
                </Link>
              ))}
              {podcastDates.length === 0 && (
                <p className="text-caption text-stone-400">No entries yet.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
