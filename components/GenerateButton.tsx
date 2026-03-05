'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface GenerateButtonProps {
  onGenerated?: () => void;
}

export function GenerateButton({ onGenerated }: GenerateButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setStatus('loading');
    setMessage('');

    // Generation calls 8 Tavily queries + Claude synthesis — allow up to 5 minutes.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error ?? 'Generation failed');
        return;
      }
      setStatus('done');
      setMessage(`Briefing generated for ${data.date}`);
      if (onGenerated) onGenerated();
      // Reload page after short delay to show new briefing
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      clearTimeout(timeout);
      setStatus('error');
      if (e instanceof DOMException && e.name === 'AbortError') {
        setMessage('Timed out after 5 minutes — check server logs');
      } else {
        setMessage(e instanceof Error ? e.message : 'Unknown error');
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-sans tracking-wide
          bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100
          border border-stone-200 dark:border-stone-700
          hover:bg-stone-200 dark:hover:bg-stone-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        <RefreshCw
          size={14}
          className={status === 'loading' ? 'animate-spin' : ''}
        />
        {status === 'loading' ? 'Generating…' : 'Generate briefing'}
      </button>
      {message && (
        <p
          className={`text-xs font-sans ${
            status === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
