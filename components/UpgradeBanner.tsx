import Link from 'next/link';

export function UpgradeBanner() {
  return (
    <div className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-[12px] text-stone-500 dark:text-stone-400">
          <span className="font-medium text-stone-700 dark:text-stone-300">Free tier:</span>{' '}
          You&apos;re seeing headlines and summaries. Subscribe for full articles, quiz, archive and audio.
        </p>
        <Link
          href="/upgrade"
          className="shrink-0 inline-block px-4 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-[12px] font-medium hover:opacity-80 transition-opacity"
        >
          Upgrade — £4/month →
        </Link>
      </div>
    </div>
  );
}
