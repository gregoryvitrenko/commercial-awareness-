'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { CheckCircle2 } from 'lucide-react';
import { track } from '@vercel/analytics';

const PREMIUM_FEATURES = [
  'Walk into interviews with a point of view — full analysis and structured talking points for every deal',
  'Lock in the facts — 24 daily quiz questions keep your recall interview-sharp',
  'Know your target firms cold — interview packs with practice Qs and "why this firm?" angles for 38 firms',
  'Speak the language of deals — sector primers covering M&A, Capital Markets, Disputes & more',
  'Stay informed on the commute — audio briefing keeps you ahead without adding desk time',
  'Build your knowledge base — full archive and bookmarks for structured, long-term prep',
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
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

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="text-center mb-8">
            <p className="section-label mb-3">
              Premium
            </p>
            <h2 className="font-serif text-article tracking-tight text-stone-900 dark:text-stone-50 mb-2">
              £4 / month
            </h2>
            <p className="text-caption text-stone-500 dark:text-stone-400">
              Turn today&apos;s deals into confident interview answers in 10 minutes a day.
            </p>
          </div>

          {/* Features card */}
          <div className="rounded-card bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 mb-6">
            {PREMIUM_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3 px-5 py-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-caption text-stone-700 dark:text-stone-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="text-center mb-6">
            <p className="section-label mb-3">
              Join 200+ law students{/* TODO: update with real count when available */}
            </p>
            <blockquote>
              <p className="text-caption italic text-stone-600 dark:text-stone-400 leading-relaxed mb-1">
                {/* TODO: replace with real testimonial */}
                &ldquo;Folio is the only prep tool I actually open every morning — the talking points are sharp enough to use straight in interviews.&rdquo;
              </p>
              <cite className="text-label text-stone-400 dark:text-stone-500 not-italic">
                — LLB student, University of Bristol
              </cite>
            </blockquote>
          </div>

          {/* Free tier note */}
          <div className="rounded-card bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 px-5 py-4 mb-6">
            <p className="text-label text-stone-500 dark:text-stone-400">
              <span className="font-medium text-stone-700 dark:text-stone-300">Free tier:</span> Daily briefing headlines and summaries are always free. No credit card required to browse.
            </p>
          </div>

          {error && (
            <p className="text-label font-mono text-rose-500 dark:text-rose-400 mb-4 text-center">
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 rounded-chrome bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-caption font-sans font-medium hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Redirecting to checkout…' : isSignedIn ? 'Subscribe — £4/month →' : 'Create account & subscribe →'}
          </button>

          <p className="text-center text-label text-stone-400 dark:text-stone-500 mt-4">
            Cancel any time. Billed monthly via Stripe.
          </p>

          <div className="text-center mt-6">
            <Link href="/" className="text-label text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
              ← Back to briefing
            </Link>
          </div>

        </div>
      </main>

    </div>
  );
}
