import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBriefing, getLatestBriefing, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { ArticleStory } from '@/components/ArticleStory';
import { requireSubscription } from '@/lib/paywall';
import { isValidDate } from '@/lib/security';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  await requireSubscription();
  const { userId } = await auth();
  const { id } = await params;
  const { date: dateParam } = await searchParams;

  const today = getTodayDate();

  // If a date is provided (e.g. from archive or saved view), load that specific briefing.
  // Fall back to today's/latest for direct navigation from the main briefing.
  const briefing = (dateParam && isValidDate(dateParam))
    ? await getBriefing(dateParam)
    : (await getBriefing(today)) ?? (await getLatestBriefing());

  if (!briefing) notFound();

  const story = briefing.stories.find(s => s.id === id);
  if (!story) notFound();

  return (
    <>
      <Header date={briefing.date} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Back to briefing */}
        <div className="mt-6 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-sans font-medium tracking-wide text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Briefing
          </Link>
        </div>

        <ArticleStory
          story={story}
          date={briefing.date}
          subscribed={true}
          currentUserId={userId ?? undefined}
        />

      </main>
    </>
  );
}
