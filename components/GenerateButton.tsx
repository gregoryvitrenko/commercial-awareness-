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
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
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
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleGenerate}
        disabled={status === 'loading'}
        className="
          inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-mono tracking-wide
          bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
          border border-zinc-200 dark:border-zinc-700
          hover:bg-zinc-200 dark:hover:bg-zinc-700
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
          className={`text-xs font-mono ${
            status === 'error' ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
