import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Archive } from 'lucide-react';

interface HeaderProps {
  date: string;         // YYYY-MM-DD
  isArchive?: boolean;  // Show back link instead of archive link
  archiveDate?: string; // Display date for archive pages
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function Header({ date, isArchive = false, archiveDate }: HeaderProps) {
  const displayDate = archiveDate ?? date;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-12 gap-4">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
              Commercial Awareness
            </span>
            <span className="hidden sm:block w-px h-4 bg-zinc-300 dark:bg-zinc-700" />
            <span className="hidden sm:block font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
              Daily Briefing
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isArchive ? (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono tracking-wide text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
              >
                ← Today
              </Link>
            ) : (
              <Link
                href="/archive"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono tracking-wide text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
              >
                <Archive size={12} />
                Archive
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Date bar */}
        <div className="flex items-baseline justify-between pb-3 pt-1 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {formatDisplayDate(displayDate)}
            </h1>
            <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mt-0.5">
              Morning Briefing · 08:30 GMT
            </p>
          </div>
          {isArchive && (
            <span className="hidden sm:block font-mono text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
              Archive
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
