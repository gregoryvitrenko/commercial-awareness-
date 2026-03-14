import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBriefing, getQuiz, getTodayDate } from '@/lib/storage';
import { Header } from '@/components/Header';
import { QuizInterface } from '@/components/QuizInterface';
import type { TopicCategory } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { requireSubscription } from '@/lib/paywall';

export const dynamic = 'force-dynamic';

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function QuizDatePage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ autostart?: string }>;
}) {
  await requireSubscription();
  const [{ date }, { autostart }] = await Promise.all([params, searchParams]);
  const today = getTodayDate();

  const briefing = await getBriefing(date);
  if (!briefing) notFound();

  const quiz = await getQuiz(date);

  const storyMeta = briefing.stories.map((s) => ({
    id: s.id,
    topic: s.topic as TopicCategory,
    headline: s.headline,
  }));

  const isToday = date === today;

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 section-label text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mb-8"
        >
          <ArrowLeft size={12} /> Back to Quiz
        </Link>

        <div className="space-y-3 mb-12">
          <span className="section-label opacity-40">Intelligence Training</span>
          <h2 className="text-5xl font-serif text-stone-900 dark:text-stone-50">
            {isToday ? 'Today' : formatDisplayDate(date)}
          </h2>
          {quiz && quiz.questions.length > 0 && (
            <p className="max-w-xl opacity-60 text-lg font-light font-sans">
              {quiz.questions.length} questions
            </p>
          )}
        </div>

        <QuizInterface
          date={date}
          initialQuiz={quiz}
          storyMeta={storyMeta}
          autoStart={autostart === '1'}
        />
      </main>
    </>
  );
}
