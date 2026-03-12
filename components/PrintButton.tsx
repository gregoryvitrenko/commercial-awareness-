'use client';

import { Printer } from 'lucide-react';

interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className = '' }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className={`inline-flex items-center gap-1.5 text-[11px] font-sans font-medium px-3 py-1.5 rounded-sm border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors print:hidden ${className}`}
    >
      <Printer size={12} />
      Export PDF
    </button>
  );
}
