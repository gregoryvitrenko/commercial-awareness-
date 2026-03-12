import { Header } from '@/components/Header';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { requireSubscription } from '@/lib/paywall';
import { getBriefing, getLatestBriefing, getTodayDate } from '@/lib/storage';
import { Headphones } from 'lucide-react';
import Link from 'next/link';

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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <PodcastPlayer briefing={briefing} />
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
          <Link
            href="/podcast/archive"
            className="section-label text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
          >
            Episode archive &rarr;
          </Link>
        </div>
      </main>
    </>
  );
}
