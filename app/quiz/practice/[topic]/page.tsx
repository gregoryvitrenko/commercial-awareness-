import { requireSubscription } from '@/lib/paywall';
import { getPracticeSet, savePracticeSet, getTodayDate } from '@/lib/storage';
import { generatePracticeSet } from '@/lib/quiz';
import { Header } from '@/components/Header';
import { QuizInterface } from '@/components/QuizInterface';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

const SLUG_TO_LABEL: Record<string, string> = {
  'ma': 'M&A',
  'capital-markets': 'Capital Markets',
  'banking-finance': 'Banking & Finance',
  'energy-tech': 'Energy & Tech',
  'regulation': 'Regulation',
  'disputes': 'Disputes',
  'international': 'International',
  'ai-law': 'AI & Law',
};

export default async function QuizPracticePage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  await requireSubscription();

  const { topic: topicSlug } = await params;
  const topicLabel = SLUG_TO_LABEL[topicSlug];
  const today = getTodayDate();

  if (!topicLabel) {
    return (
      <>
        <Header date={today} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/quiz" className="inline-flex items-center gap-2 section-label text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mb-8">
            <ArrowLeft size={12} /> Back to Quiz
          </Link>
          <p className="text-body text-stone-500 dark:text-stone-400">Practice area not found.</p>
        </main>
      </>
    );
  }

  // Fetch from cache; generate on-demand if not yet seeded.
  // First-ever load will be slow (~10s) — subsequent visits are instant from Redis.
  let practiceSet = await getPracticeSet(topicSlug);
  if (!practiceSet) {
    try {
      const generated = await generatePracticeSet(topicSlug, topicLabel);
      await savePracticeSet(topicSlug, generated);
      practiceSet = generated;
    } catch (err) {
      console.error(`[practice] On-demand generation failed for ${topicSlug}:`, err);
    }
  }

  return (
    <>
      <Header date={today} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/quiz" className="inline-flex items-center gap-2 section-label text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mb-8">
          <ArrowLeft size={12} /> Back to Quiz
        </Link>
        <div className="space-y-3 mb-12 text-center">
          <span className="section-label opacity-40">Deep Practice</span>
          <h2 className="text-5xl font-serif text-stone-900 dark:text-stone-50">{topicLabel}</h2>
          {practiceSet && (
            <p className="opacity-60 text-lg font-light font-sans">
              {practiceSet.questions.length} questions — updated weekly
            </p>
          )}
        </div>

        {practiceSet ? (
          <QuizInterface
            date={today}
            initialQuiz={{ date: today, generatedAt: practiceSet.generatedAt, questions: practiceSet.questions }}
            storyMeta={[]}
            isPractice={true}
          />
        ) : (
          <div className="rounded-card border border-stone-200 dark:border-stone-800 p-10 text-center space-y-3">
            <p className="text-body text-stone-500 dark:text-stone-400">
              Could not load practice questions for {topicLabel}.
            </p>
            <p className="text-caption text-stone-400 dark:text-stone-500">
              Please try again in a moment.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
