import { Header } from '@/components/Header';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { requireSubscription } from '@/lib/paywall';
import { getBriefing, getLatestBriefing, getTodayDate } from '@/lib/storage';
import { Headphones } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PodcastPage() {
  await requireSubscription();

  const today = getTodayDate();
  const briefing = await getBriefing(today).then((b) => b ?? getLatestBriefing());

  if (!briefing) {
    return (
      <>
        <Header date={today} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center py-20 space-y-2">
            <Headphones className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
            <p className="text-sm text-stone-500 dark:text-stone-400">
              No briefing available yet. Check back after the morning update.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header date={today} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <PodcastPlayer briefing={briefing} />
      </main>
    </>
  );
}
