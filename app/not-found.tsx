import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-50 mb-3">
        404
      </h1>
      <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
        Page not found.
      </p>
      <Link
        href="/"
        className="font-sans text-[11px] tracking-wide uppercase text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
      >
        Back to briefing
      </Link>
    </div>
  );
}
