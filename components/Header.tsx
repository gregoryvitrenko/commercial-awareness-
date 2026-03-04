import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthButtons } from './AuthButtons';
import { Archive, PenLine, Bookmark, Building2, BookOpen, Newspaper, Headphones, GraduationCap } from 'lucide-react';

interface HeaderProps {
  date: string;
  isArchive?: boolean;
  archiveDate?: string;
}

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const NAV_LINK = 'flex items-center gap-1.5 flex-1 justify-center py-2 text-[11px] font-sans font-semibold tracking-[0.1em] uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors';

export function Header({ date, isArchive = false, archiveDate }: HeaderProps) {
  const displayDate = archiveDate ?? date;

  return (
    <header className="sticky top-0 z-40 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
      {/* Thick top rule */}
      <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Row 1: Brand left · date + auth right */}
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="group">
            <h1 className="font-serif text-[22px] sm:text-[26px] font-bold tracking-tight text-stone-900 dark:text-stone-50 group-hover:opacity-75 transition-opacity">
              Commercial Awareness
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block font-mono text-[11px] text-stone-400 dark:text-stone-500 tracking-wide">
              {formatShortDate(displayDate)}
            </span>
            <ThemeToggle />
            <AuthButtons />
          </div>
        </div>

        {/* Row 2: Nav full-width */}
        <div className="flex items-center border-t border-stone-200 dark:border-stone-800">
          {isArchive ? (
            <>
              <span className="flex-1 font-mono text-[10px] tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500 py-2">
                Archive Edition
              </span>
              <Link
                href="/"
                className="font-sans text-[11px] font-semibold tracking-[0.1em] uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors py-2"
              >
                ← Today
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className={NAV_LINK}>
                <Newspaper size={11} />
                Briefing
              </Link>
              <Link href="/quiz" className={NAV_LINK}>
                <PenLine size={11} />
                Quiz
              </Link>
              <Link href="/saved" className={NAV_LINK}>
                <Bookmark size={11} />
                Bookmarks
              </Link>
              <Link href="/firms" className={NAV_LINK}>
                <Building2 size={11} />
                Firms
              </Link>
              <Link href="/primers" className={NAV_LINK}>
                <BookOpen size={11} />
                Primers
              </Link>
              <Link href="/archive" className={NAV_LINK}>
                <Archive size={11} />
                Archive
              </Link>
              <Link href="/tests" className={NAV_LINK}>
                <GraduationCap size={11} />
                Tests
              </Link>
              <Link href="/podcast" className={NAV_LINK}>
                <Headphones size={11} />
                Podcast
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
