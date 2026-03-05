import { ClipboardList } from 'lucide-react';
import { Header } from '@/components/Header';
import { TrackerDashboard } from '@/components/TrackerDashboard';
import { requireSubscription } from '@/lib/paywall';
import { getTodayDate } from '@/lib/storage';
import { getTrackerForUser } from '@/lib/tracker';
import { getOnboarding } from '@/lib/onboarding';
import { FIRMS } from '@/lib/firms-data';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Application Tracker · Folio',
};

export default async function TrackerPage() {
  await requireSubscription();

  const { userId } = await auth();
  const effectiveUserId = userId ?? (process.env.PREVIEW_MODE === 'true' ? 'preview-dev' : null);
  const today = getTodayDate();

  const [applications, onboarding] = await Promise.all([
    effectiveUserId ? getTrackerForUser(effectiveUserId) : Promise.resolve([]),
    effectiveUserId ? getOnboarding(effectiveUserId) : Promise.resolve(null),
  ]);

  // Serialize firm data for client — only what's needed (name, slug, tier, deadlines)
  const firmsForClient = FIRMS.map((f) => ({
    slug: f.slug,
    name: f.name,
    shortName: f.shortName,
    tier: f.tier,
    deadlines: f.trainingContract.deadlines,
  }));

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList size={16} className="text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Application Tracker
          </h2>
        </div>
        <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed mb-8 max-w-2xl">
          Track your training contract and vacation scheme applications in one place.
          Add firms and programmes, update your status as you progress, and keep notes for each application.
        </p>

        <TrackerDashboard
          initialApplications={applications}
          targetFirmSlugs={onboarding?.targetFirms ?? []}
          firms={firmsForClient}
        />
      </main>
    </>
  );
}
