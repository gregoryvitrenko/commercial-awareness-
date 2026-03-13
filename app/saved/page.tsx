import { getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { SavedView } from '@/components/SavedView';
import { requireSubscription } from '@/lib/paywall';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  await requireSubscription();
  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-12">
          <p className="section-label mb-3">Personal Archive</p>
          <h1 className="font-serif text-5xl lg:text-6xl font-normal mb-4">Saved Stories</h1>
          <div className="w-16 h-px bg-stone-300 dark:bg-stone-700 mb-4" />
          <p className="text-caption text-stone-500 dark:text-stone-400">
            Bookmarked stories and notes.
          </p>
        </div>
        <SavedView today={today} />
      </main>
    </>
  );
}
