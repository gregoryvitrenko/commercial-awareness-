import { getBriefing, getLatestBriefing, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { BriefingView } from '@/components/BriefingView';
import { GenerateButton } from '@/components/GenerateButton';
import { LandingHero } from '@/components/LandingHero';
import { getSubscriptionStatus } from '@/lib/paywall';
import { auth } from '@clerk/nextjs/server';

const ADMIN_USER_ID = 'user_3AR29PSfsNfmy9wxcyjCvplC7hH';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const today = getTodayDate();
  const { userId } = await auth();
  const isAdmin = userId === ADMIN_USER_ID;

  const [briefing, subscriptionStatus] = await Promise.all([
    getBriefing(today).then((b) => b ?? getLatestBriefing()),
    getSubscriptionStatus(),
  ]);

  if (!briefing) {
    return (
      <>
        <Header date={today} />
        {(subscriptionStatus === 'unauthenticated' || subscriptionStatus === 'free') && <LandingHero />}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center text-center gap-10">
          <div className="space-y-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500 font-sans">
              No briefing yet
            </p>
            <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
              Your morning briefing will appear here
            </h2>
            <p className="text-[15px] text-stone-500 dark:text-stone-400 max-w-sm leading-[1.7]">
              Generate your first briefing using live web search and AI synthesis.
            </p>
          </div>
          {isAdmin && <GenerateButton />}
        </main>
      </>
    );
  }

  const isStale = briefing.date !== today;
  const subscribed = subscriptionStatus === 'subscribed';

  return (
    <>
      <Header date={today} />
      {(subscriptionStatus === 'unauthenticated' || subscriptionStatus === 'free') && <LandingHero />}
      {isStale && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-sm bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Showing briefing from {briefing.date} — today&apos;s hasn&apos;t been generated yet.
            </p>
            {isAdmin && <GenerateButton />}
          </div>
        </div>
      )}
      <BriefingView briefing={briefing} subscribed={subscribed} />
    </>
  );
}
