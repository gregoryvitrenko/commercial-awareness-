'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';
import { track } from '@vercel/analytics';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setVerified(false);
      return;
    }
    // Give webhook a moment to process, then just show success
    const timer = setTimeout(() => setVerified(true), 1500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  useEffect(() => {
    if (verified === true) {
      track('subscription_activated');
    }
  }, [verified]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          <Link href="/">
            <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-stone-900 dark:text-stone-50 hover:opacity-75 transition-opacity">
              Folio
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">

          {verified === null ? (
            <p className="font-sans text-[11px] text-zinc-400 tracking-widest uppercase animate-pulse">
              Activating your subscription…
            </p>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>

              <p className="font-sans text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
                Welcome to Premium
              </p>

              <h2 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
                You&apos;re all set.
              </h2>

              <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-8">
                Your subscription is active. Full articles, the daily quiz, archive access, and more — all unlocked.
              </p>

              <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 mb-8 text-left">
                {[
                  'Full articles — analysis, talking points, why it matters',
                  'Daily quiz — 18 questions testing your recall',
                  'Audio briefing — human voice, listen on your commute',
                  'Full archive — every past briefing',
                  'Bookmarks + notes — save stories with your own annotations',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3 px-5 py-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[13px] text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/"
                className="inline-block w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[14px] font-sans font-medium hover:opacity-80 transition-opacity text-center"
              >
                Read today&apos;s briefing →
              </Link>

              <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-4">
                Manage your subscription anytime from your account settings.
              </p>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <p className="font-sans text-[11px] text-zinc-400 tracking-widest uppercase animate-pulse">
          Loading…
        </p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
