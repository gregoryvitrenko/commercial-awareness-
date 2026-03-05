import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthButtons } from './AuthButtons';
import { NavDropdowns } from './NavDropdowns';
import { FolioMark } from './FolioLogo';

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


export function Header({ date, isArchive = false, archiveDate }: HeaderProps) {
  const displayDate = archiveDate ?? date;

  return (
    <header className="sticky top-0 z-40 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
      {/* Thick top rule */}
      <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Row 1: date left · brand centre · auth right */}
        <div className="grid grid-cols-3 items-center py-3">
          <span className="hidden sm:block font-mono text-[11px] text-stone-400 dark:text-stone-500 tracking-wide">
            {formatShortDate(displayDate)}
          </span>
          <Link href="/" className="group flex items-center justify-center gap-2.5">
            <FolioMark size={34} className="text-stone-900 dark:text-stone-50 group-hover:opacity-75 transition-opacity flex-shrink-0" />
            <h1 className="font-serif text-[32px] sm:text-[38px] font-bold tracking-tight text-stone-900 dark:text-stone-50 group-hover:opacity-75 transition-opacity">
              Folio
            </h1>
          </Link>
          <div className="flex items-center gap-3 justify-end">
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
              <div className="flex items-center gap-4">
                <Link
                  href="/archive"
                  className="font-sans text-[11px] font-semibold tracking-[0.1em] uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors py-2"
                >
                  ← Archive
                </Link>
                <Link
                  href="/"
                  className="font-sans text-[11px] font-semibold tracking-[0.1em] uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors py-2"
                >
                  Today →
                </Link>
              </div>
            </>
          ) : (
            <NavDropdowns />
          )}
        </div>

      </div>
    </header>
  );
}
