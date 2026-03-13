'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Menu, X, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AuthButtons } from './AuthButtons';

interface HeaderProps {
  date: string;
  isArchive?: boolean;
  archiveDate?: string;
}

// Flat nav links (no dropdown)
const NAV_LINKS = [
  { label: 'Quiz', href: '/quiz' },
  { label: 'Tests', href: '/tests' },
  { label: 'Interview', href: '/interview' },
  { label: 'Fit', href: '/firm-fit' },
  { label: 'Tracker', href: '/tracker' },
  { label: 'Events', href: '/events' },
  { label: 'Archive', href: '/archive' },
  { label: 'Saved', href: '/saved' },
  { label: 'Firms', href: '/firms' },
  { label: 'Primers', href: '/primers' },
];

// Sub-items under the "Daily" dropdown
const DAILY_LINKS = [
  { label: 'Briefing', href: '/' },
  { label: 'Podcast', href: '/podcast' },
];

export function Header({ date, isArchive = false, archiveDate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const dailyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  // "Daily" parent is active when on briefing or podcast
  const dailyActive = pathname === '/' || pathname === '/podcast' || pathname.startsWith('/podcast/');

  function handleDailyMouseEnter() {
    if (dailyTimeout.current) clearTimeout(dailyTimeout.current);
    setDailyOpen(true);
  }

  function handleDailyMouseLeave() {
    dailyTimeout.current = setTimeout(() => setDailyOpen(false), 120);
  }

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Single row: wordmark left · flat nav centre · auth + hamburger right */}
        <div className="flex items-center h-12 gap-4">

          {/* Left: Folio wordmark */}
          <Link
            href="/"
            aria-label="Folio"
            className="flex items-center gap-1 flex-shrink-0 text-stone-900 dark:text-stone-50 hover:text-stone-600 dark:hover:text-stone-400 transition-colors no-underline"
          >
            <span className="font-serif text-display font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>Folio</span>
          </Link>

          {/* Centre: nav — desktop only */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">

            {/* Daily dropdown */}
            <div
              className="relative"
              onMouseEnter={handleDailyMouseEnter}
              onMouseLeave={handleDailyMouseLeave}
            >
              <button
                className={[
                  'flex items-center gap-0.5 px-2.5 py-1 font-sans text-label uppercase tracking-wide transition-colors',
                  dailyActive
                    ? 'text-stone-900 dark:text-stone-100 border-b-2 border-stone-900 dark:border-stone-100'
                    : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300',
                ].join(' ')}
                aria-expanded={dailyOpen}
                aria-haspopup="true"
              >
                Daily
                <ChevronDown
                  size={11}
                  className={[
                    'transition-transform duration-150',
                    dailyOpen ? 'rotate-180' : '',
                  ].join(' ')}
                />
              </button>

              {dailyOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-36 bg-paper border border-stone-200 dark:border-stone-700 rounded-card shadow-sm py-1 z-50"
                  onMouseEnter={handleDailyMouseEnter}
                  onMouseLeave={handleDailyMouseLeave}
                >
                  {DAILY_LINKS.map(({ label, href }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={[
                          'flex items-center px-3 py-2 font-sans text-label uppercase tracking-wide transition-colors',
                          active
                            ? 'text-stone-900 dark:text-stone-100 font-semibold'
                            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100',
                        ].join(' ')}
                        onClick={() => setDailyOpen(false)}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Flat nav links */}
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'px-2.5 py-1 font-sans text-label uppercase tracking-wide transition-colors',
                    active
                      ? 'text-stone-900 dark:text-stone-100 border-b-2 border-stone-900 dark:border-stone-100'
                      : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300',
                  ].join(' ')}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: bookmark (desktop) + theme toggle + auth + hamburger (mobile) */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <Link
              href="/saved"
              aria-label="Saved"
              className="hidden md:flex items-center justify-center w-7 h-7 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <Bookmark size={16} />
            </Link>
            <ThemeToggle />
            <AuthButtons />
            <button
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-chrome text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Archive sub-row — only when isArchive=true */}
        {isArchive && (
          <div className="flex items-center border-t border-stone-200 dark:border-stone-800 py-2 gap-4">
            <span className="flex-1 font-sans text-label tracking-[0.15em] uppercase text-stone-400 dark:text-stone-500">
              Archive Edition
            </span>
            <Link
              href="/archive"
              className="font-sans text-label font-semibold uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              &larr; Archive
            </Link>
            <Link
              href="/"
              className="font-sans text-label font-semibold uppercase text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Today &rarr;
            </Link>
          </div>
        )}

      </div>

      {/* Mobile drawer — flat list including Daily sub-items */}
      {!isArchive && mobileOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-paper">
          <nav className="max-w-5xl mx-auto px-4 py-2">
            {/* Daily sub-items shown inline with indentation */}
            <div className="flex items-center px-4 py-2">
              <span className="font-sans text-label uppercase tracking-wide text-stone-400 dark:text-stone-500">Daily</span>
            </div>
            {DAILY_LINKS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'flex items-center pl-8 pr-4 py-3 font-sans text-caption transition-colors min-h-[44px]',
                    active
                      ? 'text-stone-900 dark:text-stone-100 font-medium'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100',
                  ].join(' ')}
                >
                  {label}
                </Link>
              );
            })}

            {/* Rest of nav */}
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'flex items-center px-4 py-3 font-sans text-caption transition-colors min-h-[44px]',
                    active
                      ? 'text-stone-900 dark:text-stone-100 font-medium'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100',
                  ].join(' ')}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
