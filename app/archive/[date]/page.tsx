import { notFound } from 'next/navigation';
import { getBriefing, listBriefings } from '@/lib/storage';
import { Header } from '@/components/Header';
import { BriefingView } from '@/components/BriefingView';

interface Params {
  params: Promise<{ date: string }>;
}

export async function generateStaticParams() {
  const dates = await listBriefings();
  return dates.map((date) => ({ date }));
}

export async function generateMetadata({ params }: Params) {
  const { date } = await params;
  return {
    title: `${date} · Commercial Awareness Daily`,
  };
}

export const dynamic = 'force-dynamic';

export default async function ArchiveDatePage({ params }: Params) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const briefing = await getBriefing(date);
  if (!briefing) notFound();

  return (
    <>
      <Header date={new Date().toISOString().split('T')[0]} isArchive archiveDate={date} />
      <BriefingView briefing={briefing} />
    </>
  );
}
