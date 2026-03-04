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

    fetch(`/api/podcast-audio?date=${briefing.date}&check=true`)
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">

      {/* Voice panel — slides in above the bar */}
      {isOpen && (
        <div className="border-b border-stone-100 dark:border-stone-800 px-4 pt-3 pb-2 space-y-2">
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

      {/* Progress bar — full-width scrubber flush to the top of the bar */}
      <div
        ref={progressBarRef}
        className="relative h-1 bg-stone-100 dark:bg-stone-800 cursor-pointer select-none touch-none group"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="absolute inset-y-0 left-0 bg-stone-400 dark:bg-stone-500 group-hover:bg-stone-500 dark:group-hover:bg-stone-400 transition-colors"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Main control row */}
      <div className="flex items-center gap-3 px-4 sm:px-6 h-14">

        {/* EQ bars / loader */}
        <div className="flex-shrink-0">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-stone-400 dark:text-stone-500 animate-spin" />
          ) : (
            <EqBars active={isPlaying} />
          )}
        </div>

        {/* Title + time */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-sans font-semibold text-stone-800 dark:text-stone-200 leading-tight truncate">
            Daily Briefing Podcast
          </p>
          <p className="text-[10px] font-mono tabular-nums text-stone-400 dark:text-stone-500 leading-tight">
            {isLoading
              ? 'Writing script…'
              : elapsed != null && duration != null
              ? `${formatTime(elapsed)} / ${formatTime(duration)}`
              : duration != null
              ? `~${formatTime(duration)}`
              : '~4 min'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Stop */}
          {isActive && (
            <button
              onClick={handleStop}
              className="w-8 h-8 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              aria-label="Stop"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          {/* Play / Pause / Retry */}
          {status === 'error' ? (
            <button
              onClick={() => { updateStatus('idle'); setErrorMsg(null); handlePlay(); }}
              className="flex items-center gap-1.5 text-[11px] font-sans font-semibold text-rose-500 hover:text-rose-600 transition-colors px-2"
            >
              <Play className="w-3.5 h-3.5" /> Retry
            </button>
          ) : (
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={isLoading}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-300 disabled:opacity-40 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 translate-x-[1px]" />
              )}
            </button>
          )}

          {/* Download — only when audio cached */}
          {audioReady && (
            <a
              href={`/api/podcast-audio?date=${briefing.date}&download=true`}
              download={`commercial-awareness-${briefing.date}.mp3`}
              className="w-8 h-8 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              aria-label="Download audio"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            className="h-8 px-2 text-[11px] font-mono font-semibold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors tabular-nums"
            aria-label="Change playback speed"
            title="Playback speed"
          >
            {speed === 1 ? '1×' : `${speed}×`}
          </button>

          {/* Voice selector toggle — only when ElevenLabs voices exist */}
          {(hasVoices || voicesLoading) && (
            <button
              onClick={toggleVoicePanel}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${
                isOpen
                  ? 'text-stone-700 dark:text-stone-200'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
              aria-label="Voice settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
