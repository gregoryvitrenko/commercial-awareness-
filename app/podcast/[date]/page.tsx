import { notFound } from 'next/navigation';
import { getBriefing, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { PodcastPlayer } from '@/components/PodcastPlayer';
import { requireSubscription } from '@/lib/paywall';
import { isValidDate } from '@/lib/security';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Params {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { date } = await params;
  return {
    title: `${date} Podcast · Folio`,
  };
}

export const dynamic = 'force-dynamic';

export default async function PodcastDatePage({ params }: Params) {
  await requireSubscription();
  const { date } = await params;

  if (!isValidDate(date)) notFound();

  const today = getTodayDate();
  const briefing = await getBriefing(date);
  if (!briefing) notFound();

  return (
    <>
      <Header date={today} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/podcast/archive"
          className="inline-flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-6"
        >
          <ChevronLeft size={11} />
          Podcast Archive
        </Link>
        <PodcastPlayer briefing={briefing} />
      </main>
    </>
  );
}
