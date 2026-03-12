'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { track } from '@vercel/analytics';

const OUTCOMES = [
  {
    label: 'Walk in with a point of view',
    body: 'Full analysis and structured talking points on every deal — not just the headline.',
  },
  {
    label: 'Quiz-sharp recall',
    body: '24 daily questions calibrated to TC interview depth, with streaks to keep you consistent.',
  },
  {
    label: 'Know 38 firms cold',
    body: 'Interview packs with practice questions and "why this firm?" angles, ready to use.',
  },
  {
    label: 'Speak the language',
    body: 'Sector primers covering M&A, Capital Markets, Disputes, and more — written for interviews.',
  },
  {
    label: 'Stay ahead on the commute',
    body: 'Audio briefing keeps you informed without adding desk time.',
  },
  {
    label: 'Build for the long run',
    body: 'Full archive and bookmarks for structured prep that compounds week over week.',
  },
];

export default function UpgradePage() {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track('upgrade_view');
  }, []);

  async function handleUpgrade() {
    track('checkout_click');
    if (!isSignedIn) {
      window.location.href = '/sign-up';
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to start checkout');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          <Link href="/">
            <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-stone-900 dark:text-stone-50 hover:text-stone-600 dark:hover:text-stone-400 transition-colors">
              Folio
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 lg:py-14">

        {/* Editorial headline */}
        <div className="mb-8">
          <p className="section-label mb-3">Premium</p>
          <h2 className="font-serif text-display font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-tight mb-3">
            Know the deals.<br />Own the interview.
          </h2>
          <p className="text-body text-stone-500 dark:text-stone-400 max-w-lg">
            Turn today&apos;s market news into confident interview answers — in 10 minutes a day.
          </p>
        </div>

        {/* Section rule */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          <span className="section-label flex-shrink-0">What you get</span>
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Two-column: outcomes + pricing */}
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10 mb-10">

          {/* Outcomes grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-stone-200 dark:bg-stone-800 rounded-card overflow-hidden border border-stone-200 dark:border-stone-800 mb-8 lg:mb-0">
            {OUTCOMES.map((outcome) => (
              <div
                key={outcome.label}
                className="bg-white dark:bg-stone-900 px-5 py-4"
              >
                <p className="font-serif text-[15px] font-semibold text-stone-900 dark:text-stone-100 mb-1 leading-snug">
                  {outcome.label}
                </p>
                <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed">
                  {outcome.body}
                </p>
              </div>
            ))}
          </div>

          {/* Dark conversion panel */}
          <div className="flex flex-col gap-4">
            <div className="rounded-card bg-stone-900 dark:bg-stone-950 px-6 py-7">
              {/* Overline */}
              <p className="section-label text-stone-400 mb-3">Monthly subscription</p>

              {/* Price */}
              <p className="font-serif text-display font-bold tracking-tight text-stone-50 leading-none mb-1">
                £4
              </p>
              <p className="text-caption text-stone-500 mb-6">
                per month · cancel any time
              </p>

              {/* Feature list */}
              <ul className="space-y-2 mb-6">
                {['Full article access + talking points', 'Daily quiz + firm interview packs', 'Audio briefing + full archive'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-[3px] w-1 h-1 rounded-full bg-stone-500 flex-shrink-0" />
                    <span className="text-caption text-stone-400 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              {error && (
                <p className="text-label font-sans text-rose-400 mb-3">{error}</p>
              )}

              {/* Border-style CTA button */}
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3 rounded-chrome bg-charcoal text-white text-caption font-sans font-medium hover:bg-charcoal-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Redirecting to checkout…'
                  : isSignedIn
                  ? 'Subscribe — £4/month →'
                  : 'Create account & subscribe →'}
              </button>

              <p className="text-center text-label text-stone-600 mt-3">
                Billed via Stripe · cancel any time
              </p>
            </div>

            {/* Free tier note */}
            <div className="rounded-card bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 px-5 py-4">
              <p className="text-label font-sans font-semibold text-stone-700 dark:text-stone-300 mb-1 uppercase tracking-widest">
                Free tier
              </p>
              <p className="text-caption text-stone-500 dark:text-stone-400 leading-relaxed">
                Daily briefing headlines and summaries are always free. No credit card required to browse.
              </p>
            </div>
          </div>
        </div>

        {/* Pull quote */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          <span className="section-label flex-shrink-0">From students</span>
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        </div>

        <div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-6 py-6 mb-10">
          <blockquote>
            <p className="font-serif text-subheading italic text-stone-700 dark:text-stone-300 leading-snug mb-4">
              {/* TODO: replace with real testimonial */}
              &ldquo;Folio is the only prep tool I actually open every morning — the talking points are sharp enough to use straight in interviews.&rdquo;
            </p>
            <cite className="section-label not-italic">
              {/* TODO: update count when live data available */}
              LLB student, University of Bristol &mdash; one of 200+ using Folio
            </cite>
          </blockquote>
        </div>

        <div className="text-center">
          <Link href="/" className="text-label text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
            ← Back to briefing
          </Link>
        </div>

      </main>
    </div>
  );
}
