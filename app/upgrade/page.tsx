'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { CheckCircle2 } from 'lucide-react';

const PREMIUM_FEATURES = [
  'In-depth articles — structured talking points so you always have something sharp to say',
  'Daily quiz — 24 questions to lock in the facts before your application',
  'Firm interview packs — talking points, practice Qs & "why this firm?" crib sheet for 38 firms',
  'Sector Primers — deep-dive explainers on M&A, Capital Markets, Disputes & more',
  'Audio briefing — listen on your commute, arrive at the interview informed',
  'Full archive + bookmarks — build your commercial knowledge base over time',
];

export default function UpgradePage() {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          <Link href="/">
            <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-stone-900 dark:text-stone-50 hover:opacity-75 transition-opacity">
              Commercial Awareness
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="text-center mb-8">
            <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
              Premium
            </p>
            <h2 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">
              £4 / month
            </h2>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              Turn today&apos;s deals into confident interview answers in 10 minutes a day.
            </p>
          </div>

          {/* Features card */}
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 mb-6">
            {PREMIUM_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3 px-5 py-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-zinc-700 dark:text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Free tier note */}
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 px-5 py-4 mb-6">
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Free tier:</span> Daily briefing headlines and summaries are always free. No credit card required to browse.
            </p>
          </div>

          {error && (
            <p className="text-[12px] font-mono text-rose-500 dark:text-rose-400 mb-4 text-center">
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[14px] font-sans font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Redirecting to checkout…' : isSignedIn ? 'Subscribe — £4/month →' : 'Create account & subscribe →'}
          </button>

          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-4">
            Cancel any time. Billed monthly via Stripe.
          </p>

          <div className="text-center mt-6">
            <Link href="/" className="text-[12px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              ← Back to briefing
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
