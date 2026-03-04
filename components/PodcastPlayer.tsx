'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Loader2, Download, SlidersHorizontal } from 'lucide-react';
import type { Briefing } from '@/lib/types';

const CHARS_PER_MINUTE = 650;
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // Daniel (British, authoritative)
const LS_VOICE_KEY = 'podcast-voice-id';

interface Voice {
  id: string;
  name: string;
  label: string;
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

// Animated EQ bars — active when playing, static grey when idle/paused
function EqBars({ active }: { active: boolean }) {
  return (
    <>
      <style>{`
        @keyframes eq-a { 0%,100%{height:3px} 50%{height:14px} }
        @keyframes eq-b { 0%,100%{height:12px} 40%{height:3px} }
        @keyframes eq-c { 0%,100%{height:6px} 65%{height:15px} }
        @keyframes eq-d { 0%,100%{height:10px} 30%{height:4px} 70%{height:13px} }
      `}</style>
      <div className="flex items-end gap-[2px] h-[16px] flex-shrink-0">
        {[
          { anim: 'eq-a', dur: '0.9s',  delay: '0s',    staticH: '3px'  },
          { anim: 'eq-b', dur: '0.65s', delay: '0.1s',  staticH: '12px' },
          { anim: 'eq-c', dur: '1.1s',  delay: '0.05s', staticH: '6px'  },
          { anim: 'eq-d', dur: '0.75s', delay: '0.15s', staticH: '10px' },
        ].map((bar, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-[1.5px] transition-colors duration-300 ${
              active ? 'bg-stone-500 dark:bg-stone-400' : 'bg-stone-300 dark:bg-stone-600'
            }`}
            style={{
              height: bar.staticH,
              animation: active
                ? `${bar.anim} ${bar.dur} ease-in-out ${bar.delay} infinite`
                : 'none',
            }}
          />
        ))}
      </div>
    </>
  );
}

export function PodcastPlayer({ briefing }: { briefing: Briefing }) {
  const [isOpen, setIsOpen] = useState(false); // voice panel open
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(DEFAULT_VOICE_ID);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [audioReady, setAudioReady] = useState(false);

  const scriptRef = useRef<string | null>(null);
  const hasElevenLabsRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const charIndexRef = useRef(0);
  const statusRef = useRef<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const speedRef = useRef(1);
  const [speed, setSpeed] = useState(1);

  function updateStatus(s: typeof status) {
    statusRef.current = s;
    setStatus(s);
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);

    const savedVoice = localStorage.getItem(LS_VOICE_KEY);
    if (savedVoice) setSelectedVoiceId(savedVoice);

    const savedVoice2 = localStorage.getItem(LS_VOICE_KEY) ?? DEFAULT_VOICE_ID;
    fetch(`/api/podcast-audio?date=${briefing.date}&voiceId=${savedVoice2}&check=true`)
      .then((r) => r.json())
      .then((d: { exists: boolean }) => { if (d.exists) setAudioReady(true); })
      .catch(() => {});

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefing.date]);

  // Re-check audio readiness when voice changes
  useEffect(() => {
    setAudioReady(false);
    fetch(`/api/podcast-audio?date=${briefing.date}&voiceId=${selectedVoiceId}&check=true`)
      .then((r) => r.json())
      .then((d: { exists: boolean }) => { if (d.exists) setAudioReady(true); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoiceId, briefing.date]);

  function toggleVoicePanel() {
    setIsOpen((prev) => !prev);
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

  async function playWithElevenLabs(voiceId: string) {
    const res = await fetch('/api/podcast-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: briefing.date, voiceId }),
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
      setAudioReady(true);
    };
    audio.onerror = () => {
      updateStatus('error');
      setErrorMsg('Audio playback failed.');
      audioRef.current = null;
      URL.revokeObjectURL(url);
    };

    audio.playbackRate = speedRef.current;
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

    utterance.rate = speedRef.current * 0.95;
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
        await playWithElevenLabs(selectedVoiceId);
        setAudioReady(true);
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

  // ── Speed control ─────────────────────────────────────────────────────────

  function cycleSpeed() {
    const idx = SPEEDS.indexOf(speedRef.current);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    speedRef.current = next;
    setSpeed(next);
    // Apply immediately to whichever playback path is active
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    } else if (statusRef.current === 'playing' && scriptRef.current) {
      // Restart TTS from current char position with new rate
      window.speechSynthesis.cancel();
      playTTSFromChar(scriptRef.current, charIndexRef.current);
    }
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

  const isPlaying = status === 'playing';
  const isActive = status === 'playing' || status === 'paused';
  const isLoading = status === 'loading';
  const elapsed = duration != null ? progress * duration : null;
  const hasVoices = voices.length > 0;

  // ── Helpers ───────────────────────────────────────────────────────────────

  function formatCoverDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">

      {/* ── Cover art ──────────────────────────────────────────────────────── */}
      <div className="relative bg-stone-950 aspect-square flex flex-col items-center justify-center overflow-hidden select-none">

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #d6d3d1 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Soft radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0c0a09_100%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">

          {/* Large EQ bars / spinner */}
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-stone-500 animate-spin" />
          ) : (
            <div className="flex items-end gap-[4px] h-[52px]">
              {[
                { anim: 'eq-a', dur: '0.9s',  delay: '0s',    staticH: '8px'  },
                { anim: 'eq-b', dur: '0.65s', delay: '0.1s',  staticH: '36px' },
                { anim: 'eq-c', dur: '1.1s',  delay: '0.05s', staticH: '18px' },
                { anim: 'eq-d', dur: '0.75s', delay: '0.15s', staticH: '28px' },
                { anim: 'eq-a', dur: '0.85s', delay: '0.08s', staticH: '12px' },
              ].map((bar, i) => (
                <div
                  key={i}
                  className={`w-[5px] rounded-[2px] transition-colors duration-300 ${
                    isPlaying ? 'bg-stone-300' : 'bg-stone-600'
                  }`}
                  style={{
                    height: bar.staticH,
                    animation: isPlaying
                      ? `${bar.anim} ${bar.dur} ease-in-out ${bar.delay} infinite`
                      : 'none',
                  }}
                />
              ))}
            </div>
          )}

          {/* Brand + date */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-stone-500 mb-2">
              Commercial Awareness Daily
            </p>
            <p className="font-serif text-2xl text-white leading-tight">
              Daily Briefing
            </p>
            <p className="font-mono text-[9px] text-stone-500 mt-2 tracking-wide">
              {isLoading ? 'Writing script…' : formatCoverDate(briefing.date)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Voice panel ────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="border-b border-stone-100 dark:border-stone-800 px-5 pt-3 pb-3 space-y-2">
          {errorMsg && (
            <p className="text-[11px] font-sans text-rose-500 break-all">{errorMsg}</p>
          )}
          {(hasVoices || voicesLoading) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-sans text-stone-400 dark:text-stone-500">Voice</span>
              {voicesLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-stone-400" />
              ) : voices.map((v) => {
                const isSelected = v.id === selectedVoiceId;
                return (
                  <button
                    key={v.id}
                    onClick={() => selectVoice(v.id)}
                    disabled={isActive || isLoading}
                    className={`px-2.5 py-1 rounded text-[11px] font-sans transition-colors disabled:opacity-40 ${
                      isSelected
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Progress scrubber ──────────────────────────────────────────────── */}
      <div
        ref={progressBarRef}
        className="relative h-1.5 bg-stone-100 dark:bg-stone-800 cursor-pointer select-none touch-none group"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="absolute inset-y-0 left-0 bg-stone-500 dark:bg-stone-400 group-hover:bg-stone-700 dark:group-hover:bg-stone-300 transition-colors"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Scrubber thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-stone-900 dark:bg-stone-100 shadow opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      {/* ── Time stamps ────────────────────────────────────────────────────── */}
      <div className="flex justify-between px-5 pt-2 pb-0">
        <span className="text-[10px] font-mono tabular-nums text-stone-400 dark:text-stone-500">
          {elapsed != null ? formatTime(elapsed) : '0:00'}
        </span>
        <span className="text-[10px] font-mono tabular-nums text-stone-400 dark:text-stone-500">
          {duration != null ? formatTime(duration) : '--:--'}
        </span>
      </div>

      {/* ── Controls ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-3 pb-5">

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          className="w-10 h-10 flex items-center justify-center text-[12px] font-mono font-semibold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors tabular-nums"
          aria-label="Change playback speed"
          title="Playback speed"
        >
          {speed}×
        </button>

        {/* Centre: Stop + Play/Pause */}
        <div className="flex items-center gap-3">
          {isActive && (
            <button
              onClick={handleStop}
              className="w-9 h-9 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              aria-label="Stop"
            >
              <Square className="w-5 h-5" />
            </button>
          )}

          {status === 'error' ? (
            <button
              onClick={() => { updateStatus('idle'); setErrorMsg(null); handlePlay(); }}
              className="flex items-center gap-1.5 text-[12px] font-sans font-semibold text-rose-500 hover:text-rose-600 transition-colors px-3 h-14"
            >
              <Play className="w-4 h-4" /> Retry
            </button>
          ) : (
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={isLoading}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-40 transition-colors shadow-md"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 translate-x-[1px]" />
              )}
            </button>
          )}
        </div>

        {/* Right: Download + Voice */}
        <div className="flex items-center gap-1">
          {audioReady && (
            <a
              href={`/api/podcast-audio?date=${briefing.date}&voiceId=${selectedVoiceId}&download=true`}
              download={`commercial-awareness-${briefing.date}.mp3`}
              className="w-10 h-10 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              aria-label="Download audio"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
          {(hasVoices || voicesLoading) && (
            <button
              onClick={toggleVoicePanel}
              className={`w-10 h-10 flex items-center justify-center transition-colors ${
                isOpen
                  ? 'text-stone-700 dark:text-stone-200'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              aria-label="Voice settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}
          {/* Placeholder to keep layout balanced when no right-side buttons */}
          {!audioReady && !hasVoices && !voicesLoading && (
            <div className="w-10 h-10" />
          )}
        </div>

      </div>

      {/* ── Error message ──────────────────────────────────────────────────── */}
      {errorMsg && !isOpen && (
        <p className="text-[11px] font-sans text-rose-500 text-center px-5 pb-4 -mt-2 break-all">
          {errorMsg}
        </p>
      )}

    </div>
  );
}
