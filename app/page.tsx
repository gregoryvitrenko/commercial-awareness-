import { getBriefing, getLatestBriefing, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { BriefingView } from '@/components/BriefingView';
import { GenerateButton } from '@/components/GenerateButton';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const today = getTodayDate();
  const briefing = (await getBriefing(today)) ?? (await getLatestBriefing());

  if (!briefing) {
    return (
      <>
        <Header date={today} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center gap-8">
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
              No briefing yet
            </p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Your morning briefing will appear here
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Click below to generate your first briefing using Claude + live web search.
            </p>
          </div>

          <GenerateButton />
        </main>
      </>
    );
  }

  const isStale = briefing.date !== today;

  return (
    <>
      <Header date={today} />
      {isStale && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
            <p className="text-xs font-mono tracking-wide">
              Showing briefing from {briefing.date} — today&apos;s hasn&apos;t been generated yet.
            </p>
            <GenerateButton />
          </div>
        </div>
      )}
      <BriefingView briefing={briefing} />
    </>
  );
}
