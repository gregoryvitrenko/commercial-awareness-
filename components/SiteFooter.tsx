import Link from 'next/link';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

        <p className="font-mono text-[10px] text-stone-400 dark:text-stone-600 tracking-wide">
          © {year} Commercial Awareness Daily
        </p>

        <nav className="flex items-center gap-6">
          <Link
            href="/terms"
            className="font-mono text-[10px] text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="font-mono text-[10px] text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"
          >
            Privacy
          </Link>
          <a
            href="mailto:hello@[YOURDOMAIN]"
            className="font-mono text-[10px] text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"
          >
            Contact
          </a>
        </nav>

      </div>
    </footer>
  );
}
