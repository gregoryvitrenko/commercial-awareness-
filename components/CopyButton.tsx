'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono tracking-wide
        border transition-all duration-200 shrink-0
        ${
          copied
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 hover:border-zinc-600 dark:bg-zinc-800 dark:border-zinc-700'
        }
      `}
      title="Copy talking point"
    >
      {copied ? (
        <>
          <Check size={11} />
          Copied
        </>
      ) : (
        <>
          <Copy size={11} />
          Copy
        </>
      )}
    </button>
  );
}
