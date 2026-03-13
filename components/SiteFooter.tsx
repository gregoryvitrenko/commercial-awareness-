import Link from 'next/link';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-paper dark:bg-stone-950 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left: Folio wordmark */}
        <Link
          href="/"
          className="font-serif text-sm font-semibold text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400 transition-colors"
        >
          Folio
        </Link>

        {/* Center: copyright */}
        <p className="font-sans text-label uppercase tracking-widest text-stone-400 dark:text-stone-500">
          © {year} Folio
        </p>

        {/* Right: nav links */}
        <nav className="flex items-center gap-5">
          <Link
            href="/terms"
            className="font-sans text-label uppercase tracking-wide text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            Legal
          </Link>
          <Link
            href="/privacy"
            className="font-sans text-label uppercase tracking-wide text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            Privacy
          </Link>
          <a
            href="mailto:hello@folioapp.co.uk"
            className="font-sans text-label uppercase tracking-wide text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            Contact
          </a>
        </nav>

      </div>
    </footer>
  );
}
