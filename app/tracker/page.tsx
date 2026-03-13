import { requireSubscription } from '@/lib/paywall';
import { TrackerView } from '@/components/TrackerView';

export const metadata = { title: 'Tracker — Folio' };

export default async function TrackerPage() {
  await requireSubscription();
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <TrackerView />
    </main>
  );
}
