import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { getTodayDate } from '@/lib/storage';

export const metadata: Metadata = {
  title: 'Unsubscribe — Folio',
};

interface UnsubscribePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const isSuccess = params.success === '1';
  const isError = !isSuccess;

  const today = getTodayDate();

  return (
    <>
      <Header date={today} />
      <main className="min-h-[60vh] bg-stone-50 dark:bg-zinc-950 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-card p-8">
            {isSuccess ? (
              <>
                <p className="section-label text-stone-400 dark:text-stone-500 mb-3">
                  Digest
                </p>
                <h1 className="text-heading text-stone-900 dark:text-stone-50 mb-4">
                  You&apos;ve been unsubscribed
                </h1>
                <p className="text-body text-stone-600 dark:text-stone-400">
                  You won&apos;t receive any more weekly digest emails from Folio. You can still
                  access all your subscriber features on the site.
                </p>
              </>
            ) : (
              <>
                <p className="section-label text-stone-400 dark:text-stone-500 mb-3">
                  Error
                </p>
                <h1 className="text-heading text-stone-900 dark:text-stone-50 mb-4">
                  Invalid link
                </h1>
                <p className="text-body text-stone-600 dark:text-stone-400">
                  This unsubscribe link is invalid or has expired. If you need help, email{' '}
                  <a
                    href="mailto:hello@folioapp.co.uk"
                    className="text-stone-900 dark:text-stone-100 underline underline-offset-2"
                  >
                    hello@folioapp.co.uk
                  </a>
                  .
                </p>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-stone-100 dark:border-zinc-800">
              <Link
                href="/"
                className="text-caption text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                &larr; Back to Folio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
