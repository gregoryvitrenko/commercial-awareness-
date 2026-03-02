import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Archive } from 'lucide-react';

interface HeaderProps {
  date: string;
  isArchive?: boolean;
  archiveDate?: string;
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
    <header className="sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Masthead row */}
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-mono text-[12px] font-bold tracking-[0.18em] uppercase text-zinc-900 dark:text-zinc-100">
              Commercial Awareness Daily
            </span>
            {isArchive && (
              <span className="hidden sm:inline font-mono text-[9px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                Archive
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1">
            {isArchive ? (
              <Link
                href="/"
                className="px-3 py-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                ← Today
              </Link>
            ) : (
              <Link
                href="/archive"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <Archive size={11} />
                Archive
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Date row */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 py-3">
          <h1 className="text-2xl sm:text-[28px] font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
            {formatDisplayDate(displayDate)}
          </h1>
          <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mt-1">
            Morning Briefing · 08:30 GMT
          </p>
        </div>

      </div>
    </header>
  );
}
