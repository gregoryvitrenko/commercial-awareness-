import Link from 'next/link';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

        <p className="font-sans text-label text-stone-400 dark:text-stone-600 tracking-wide">
          © {year} Folio
        </p>

        <nav className="flex items-center gap-6">
          <a
            href="mailto:hello@folioapp.co.uk"
            className="font-sans text-label text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"
          >
            Feedback
          </a>
          <Link
            href="/terms"
            className="font-sans text-label text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="font-sans text-label text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"
          >
            Privacy
          </Link>
          <a
            href="mailto:hello@folioapp.co.uk"
            className="font-sans text-label text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"
          >
            Contact
          </a>
          <a
            href="https://www.linkedin.com/in/gregory-vitrenko-7258a0350"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-label text-stone-400 dark:text-stone-600 hover:text-stone-700 dark:hover:text-stone-300 transition-colors tracking-wide"
          >
            LinkedIn
          </a>
        </nav>

      </div>
    </footer>
  );
}
