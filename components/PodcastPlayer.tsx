'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Headphones, Loader2, ChevronDown } from 'lucide-react';
import type { Briefing } from '@/lib/types';

const CHARS_PER_MINUTE = 650;
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
const LS_VOICE_KEY = 'podcast-voice-id';
const LS_OPEN_KEY = 'podcast-tab-open';

interface Voice {
  id: string;
  name: string;
  category: string;
}

function getBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'en-GB' && v.localService) ??
    voices.find((v) => v.lang === 'en-GB') ??
    voices.find((v) => v.lang === 'en-US' && v.localService) ??
    voices.find((v) => v.lang.startsWith('en') && v.localService) ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PodcastPlayer({ briefing }: { briefing: Briefing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(DEFAULT_VOICE_ID);
  const [voicesLoading, setVoicesLoading] = useState(true);

  const scriptRef = useRef<string | null>(null);
  const hasElevenLabsRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const charIndexRef = useRef(0);
  const statusRef = useRef<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  function updateStatus(s: typeof status) {
    statusRef.current = s;
    setStatus(s);
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);

    // Restore persisted state
    const savedVoice = localStorage.getItem(LS_VOICE_KEY);
    if (savedVoice) setSelectedVoiceId(savedVoice);

    const savedOpen = localStorage.getItem(LS_OPEN_KEY);
    if (savedOpen === 'true') setIsOpen(true);

    // Fetch ElevenLabs voice list
    setVoicesLoading(true);
    fetch('/api/podcast-voices')
      .then((r) => r.json())
      .then((data: { voices: Voice[] }) => {
        if (data.voices?.length > 0) setVoices(data.voices);
      })
      .catch(() => {})
      .finally(() => setVoicesLoading(false));

    return () => {
      window.speechSynthesis?.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  function toggleOpen() {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem(LS_OPEN_KEY, String(next));
      return next;
    });
  }

  // ── Script fetching ───────────────────────────────────────────────────────

  async function fetchScript(): Promise<{ script: string; hasElevenLabs: boolean }> {
    if (scriptRef.current) {
      return { script: scriptRef.current, hasElevenLabs: hasElevenLabsRef.current };
    }
    const res = await fetch('/api/podcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: briefing.date }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to generate script');
    scriptRef.current = data.script;
    hasElevenLabsRef.current = data.hasElevenLabs;
    return { script: data.script, hasElevenLabs: data.hasElevenLabs };
  }

  // ── ElevenLabs path ───────────────────────────────────────────────────────

  async function playWithElevenLabs(script: string, voiceId: string) {
    const res = await fetch('/api/podcast-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script, voiceId }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ElevenLabs error ${res.status}: ${text.slice(0, 120)}`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    audio.onloadedmetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    audio.onended = () => {
      updateStatus('idle');
      setProgress(0);
      audioRef.current = null;
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      updateStatus('error');
      setErrorMsg('Audio playback failed.');
      audioRef.current = null;
      URL.revokeObjectURL(url);
    };

    await audio.play();
    updateStatus('playing');
    if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
  }

  // ── Browser TTS path ──────────────────────────────────────────────────────

  const playTTSFromChar = useCallback((script: string, startChar: number) => {
    const remaining = script.slice(startChar);
    const utterance = new SpeechSynthesisUtterance(remaining);

    const applyVoice = () => {
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      applyVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = applyVoice;
    }

    utterance.rate = 0.95;
    utterance.onboundary = (event) => {
      const absolute = startChar + event.charIndex;
      charIndexRef.current = absolute;
      setProgress(absolute / script.length);
    };
    utterance.onend = () => {
      statusRef.current = 'idle';
      setStatus('idle');
      setProgress(1);
    };
    utterance.onerror = () => {
      statusRef.current = 'idle';
      setStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
    statusRef.current = 'playing';
    setStatus('playing');
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────

  async function handlePlay() {
    setErrorMsg(null);

    if (status === 'paused') {
      if (audioRef.current) {
        await audioRef.current.play();
      } else {
        window.speechSynthesis.resume();
      }
      updateStatus('playing');
      return;
    }

    updateStatus('loading');
    let script: string;
    let hasElevenLabs: boolean;
    try {
      ({ script, hasElevenLabs } = await fetchScript());
    } catch (err) {
      updateStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate script.');
      return;
    }

    if (hasElevenLabs) {
      setDuration((script.length / CHARS_PER_MINUTE) * 60);
      try {
        await playWithElevenLabs(script, selectedVoiceId);
      } catch (err) {
        updateStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'ElevenLabs playback failed.');
      }
    } else {
      charIndexRef.current = 0;
      setProgress(0);
      setDuration((script.length / CHARS_PER_MINUTE) * 60);
      window.speechSynthesis.cancel();
      playTTSFromChar(script, 0);
    }
  }

  function handlePause() {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      window.speechSynthesis.pause();
    }
    updateStatus('paused');
  }

  function handleStop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    updateStatus('idle');
    setProgress(0);
    setErrorMsg(null);
    charIndexRef.current = 0;
  }

  // ── Progress bar drag ─────────────────────────────────────────────────────

  function getFraction(clientX: number): number {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function seekAudioTo(fraction: number) {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = fraction * audioRef.current.duration;
    }
    setProgress(fraction);
  }

  function commitTTSSeek(fraction: number) {
    if (!scriptRef.current) return;
    const charIndex = Math.floor(fraction * scriptRef.current.length);
    charIndexRef.current = charIndex;
    setProgress(fraction);
    if (statusRef.current !== 'idle' && statusRef.current !== 'error') {
      window.speechSynthesis.cancel();
      playTTSFromChar(scriptRef.current, charIndex);
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    isDraggingRef.current = true;
    progressBarRef.current?.setPointerCapture(e.pointerId);
    const fraction = getFraction(e.clientX);
    if (audioRef.current) {
      seekAudioTo(fraction);
    } else {
      setProgress(fraction);
      if (scriptRef.current) charIndexRef.current = Math.floor(fraction * scriptRef.current.length);
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    const fraction = getFraction(e.clientX);
    if (audioRef.current) {
      seekAudioTo(fraction);
    } else {
      setProgress(fraction);
      if (scriptRef.current) charIndexRef.current = Math.floor(fraction * scriptRef.current.length);
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const fraction = getFraction(e.clientX);
    if (audioRef.current) {
      seekAudioTo(fraction);
    } else {
      commitTTSSeek(fraction);
    }
  }

  function handlePointerCancel() {
    isDraggingRef.current = false;
  }

  // ── Voice selection ───────────────────────────────────────────────────────

  function selectVoice(id: string) {
    setSelectedVoiceId(id);
    localStorage.setItem(LS_VOICE_KEY, id);
    // Stop current playback so next play uses the new voice
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (status === 'playing' || status === 'paused') {
      window.speechSynthesis.cancel();
      updateStatus('idle');
      setProgress(0);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const isActive = status === 'playing' || status === 'paused';
  const elapsed = duration != null ? progress * duration : null;
  const hasVoices = voices.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mb-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">

      {/* ── Tab header — always visible, click to expand ── */}
      <button
        onClick={toggleOpen}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <Headphones className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
        <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">
          Daily Briefing Podcast
        </span>
        {isActive && (
          <span className="flex items-center gap-1 ml-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
            · {elapsed != null && duration != null ? `${formatTime(elapsed)} / ${formatTime(duration)}` : ''}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 ml-auto text-zinc-400 dark:text-zinc-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Expanded panel ── */}
      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 pt-4 pb-4 space-y-4">

          {/* Voice grid */}
          <div>
            <p className="text-[10px] font-mono font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2">
              Voice
            </p>

            {voicesLoading ? (
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading voices…
              </div>
            ) : hasVoices ? (
              <div className="flex flex-wrap gap-1.5">
                {voices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVoice(v.id)}
                    disabled={isActive || status === 'loading'}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors disabled:opacity-40 ${
                      v.id === selectedVoiceId
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-semibold'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                No ElevenLabs voices found — check your API key is set.
              </p>
            )}
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {status === 'error' ? (
              <button
                onClick={() => { updateStatus('idle'); setErrorMsg(null); handlePlay(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-mono font-medium hover:opacity-80 transition-opacity"
              >
                <Play className="w-3 h-3" /> Retry
              </button>
            ) : (
              <button
                onClick={status === 'playing' ? handlePause : handlePlay}
                disabled={status === 'loading'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-mono font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Preparing…</>
                ) : status === 'playing' ? (
                  <><Pause className="w-3 h-3" /> Pause</>
                ) : status === 'paused' ? (
                  <><Play className="w-3 h-3" /> Resume</>
                ) : (
                  <><Play className="w-3 h-3" /> Listen</>
                )}
              </button>
            )}

            {isActive && (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-mono hover:opacity-80 transition-opacity"
              >
                <Square className="w-3 h-3" /> Stop
              </button>
            )}

            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wide tabular-nums ml-auto">
              {status === 'loading'
                ? 'Writing script…'
                : status === 'error'
                ? ''
                : elapsed != null && duration != null
                ? `${formatTime(elapsed)} / ${formatTime(duration)}`
                : duration != null
                ? `~${formatTime(duration)} est.`
                : ''}
            </span>
          </div>

          {/* Error message */}
          {errorMsg && (
            <p className="text-[11px] font-mono text-rose-500 dark:text-rose-400 break-all">
              {errorMsg}
            </p>
          )}

          {/* Progress bar */}
          <div
            ref={progressBarRef}
            className="group relative py-2 cursor-pointer select-none touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            <div className="relative h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-zinc-900 dark:bg-zinc-100 rounded-full pointer-events-none"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-900 dark:bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
              style={{ left: `${progress * 100}%` }}
            />
          </div>

        </div>
      )}
    </div>
  );
}
