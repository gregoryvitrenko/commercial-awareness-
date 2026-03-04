import { getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { SavedView } from '@/components/SavedView';
import { Bookmark } from 'lucide-react';
import { requireSubscription } from '@/lib/paywall';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  await requireSubscription();
  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark size={15} className="text-stone-400" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            Saved Stories
          </h2>
        </div>
        <SavedView today={today} />
      </main>
    </>
  );
}
