'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Loader2, Download } from 'lucide-react';
import type { Briefing } from '@/lib/types';

const CHARS_PER_MINUTE = 650;
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'; // Daniel (British, Broadcaster)
const NUM_BARS = 28;
const WAVEFORM_HEIGHTS = [12, 28, 18, 40, 24, 36, 16, 44, 20, 32, 14, 38, 22, 48, 18, 34, 26, 42, 16, 30, 20, 44, 14, 36, 24, 40, 18, 28];

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const scriptRef = useRef<string | null>(null);
  const hasElevenLabsRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const charIndexRef = useRef(0);
  const statusRef = useRef<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const speedRef = useRef(1);
  const [speed, setSpeed] = useState(1);

  // ── Web Audio API refs ────────────────────────────────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const waveBarRefs = useRef<(HTMLDivElement | null)[]>([]);

  function updateStatus(s: typeof status) {
    statusRef.current = s;
    setStatus(s);
  }

  // ── Waveform animation ────────────────────────────────────────────────────

  function startWaveformAnimation() {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function tick() {
      analyser!.getByteFrequencyData(dataArray);
      waveBarRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const binIndex = Math.floor(i * bufferLength / NUM_BARS);
        const value = dataArray[binIndex] / 255;
        const height = Math.max(3, Math.round(3 + value * 45));
        bar.style.height = `${height}px`;
      });
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  function stopWaveformAnimation() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    waveBarRefs.current.forEach((bar, i) => {
      if (bar) bar.style.height = `${WAVEFORM_HEIGHTS[i] ?? 20}px`;
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);

    fetch(`/api/podcast-audio?date=${briefing.date}&voiceId=${VOICE_ID}&check=true`)
      .then((r) => r.json())
      .then((d: { exists: boolean }) => { if (d.exists) setAudioReady(true); })
      .catch(() => {});

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      window.speechSynthesis?.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefing.date]);

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

    let audioUrl: string;
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      audioUrl = data.url;
    } else {
      const blob = await res.blob();
      audioUrl = URL.createObjectURL(blob);
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // ── Web Audio API setup ──────────────────────────────────────────────────
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch { /* ignore */ }
        sourceRef.current = null;
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaElementSource(audio);
      sourceRef.current = source;
      source.connect(analyser);
      analyser.connect(ctx.destination);
    } catch {
      // Web Audio API unavailable — visualisation degrades gracefully
    }
    // ────────────────────────────────────────────────────────────────────────

    audio.ontimeupdate = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    audio.onloadedmetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    audio.onended = () => {
      stopWaveformAnimation();
      updateStatus('idle');
      setProgress(0);
      audioRef.current = null;
      if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
      setAudioReady(true);
    };
    audio.onerror = () => {
      stopWaveformAnimation();
      updateStatus('error');
      setErrorMsg('Audio playback failed.');
      audioRef.current = null;
      if (audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
    };

    audio.playbackRate = speedRef.current;
    await audio.play();
    startWaveformAnimation();
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
        if (audioCtxRef.current?.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        await audioRef.current.play();
        startWaveformAnimation();
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
        await playWithElevenLabs(VOICE_ID);
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
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    updateStatus('paused');
  }

  function handleStop() {
    stopWaveformAnimation();
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
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    } else if (statusRef.current === 'playing' && scriptRef.current) {
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

  // ── Download ──────────────────────────────────────────────────────────────

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/podcast-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: briefing.date, voiceId: VOICE_ID }),
      });
      if (!res.ok) {
        setErrorMsg('Download failed — try playing the audio first.');
        return;
      }

      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        const a = document.createElement('a');
        a.href = data.url;
        a.download = `folio-${briefing.date}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `folio-${briefing.date}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setAudioReady(true);
    } catch {
      setErrorMsg('Download failed.');
    } finally {
      setIsDownloading(false);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const isPlaying = status === 'playing';
  const isActive = status === 'playing' || status === 'paused';
  const isLoading = status === 'loading';
  const elapsed = duration != null ? progress * duration : null;
  const episodeTitle = briefing.stories[0]?.headline;
  const episodeSubtitle = briefing.stories[0]?.talkingPoints?.soundbite ?? briefing.stories[0]?.talkingPoint;

  // ── Helpers ───────────────────────────────────────────────────────────────

  function formatCoverDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0">

      {/* ── Hero block ─────────────────────────────────────────────────────── */}
      <div className="relative bg-stone-900 text-stone-50 overflow-hidden">
        {/* Oxford blue ambient glow — subtle accent layer */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 20% 50%, rgba(0,33,71,0.35) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] relative z-10">

          {/* Left: episode info + player */}
          <div className="px-8 pt-8 pb-7 flex flex-col gap-4">

            {/* Overline row */}
            <div className="flex items-center gap-3">
              <span className="section-label bg-stone-800 text-stone-400 px-2 py-0.5">Latest Episode</span>
              <span className="section-label text-stone-600">{formatCoverDate(briefing.date)}</span>
            </div>

            {/* Episode title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-50 leading-tight tracking-tight">
              {episodeTitle ?? formatCoverDate(briefing.date)}
            </h1>

            {/* Subtitle */}
            {episodeSubtitle && (
              <p className="text-sm text-stone-400 leading-relaxed line-clamp-2 max-w-lg">
                {episodeSubtitle}
              </p>
            )}

            {/* Player row: button + waveform + timestamp */}
            <div className="flex items-end gap-4 pt-1">

              {/* Play / Pause / Error button */}
              {status === 'error' ? (
                <button
                  onClick={() => { updateStatus('idle'); setErrorMsg(null); handlePlay(); }}
                  className="flex-shrink-0 flex items-center gap-1.5 text-[12px] font-sans font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Play className="w-4 h-4" /> Retry
                </button>
              ) : (
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  disabled={isLoading}
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-stone-900 flex items-center justify-center hover:bg-stone-100 disabled:opacity-40 transition-colors shadow-md"
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

              {/* Waveform bars — heights driven by Web Audio API when playing */}
              <div className="flex items-end gap-[2px] h-12 flex-1">
                {WAVEFORM_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    ref={(el) => { waveBarRefs.current[i] = el; }}
                    style={{ height: h }}
                    className={`w-[3px] rounded-sm flex-shrink-0 ${isPlaying ? 'bg-white/50' : 'bg-white/20'}`}
                  />
                ))}
              </div>

              {/* Timestamp */}
              <span className="flex-shrink-0 text-[11px] font-sans tabular-nums text-stone-500 pb-1">
                {elapsed != null ? formatTime(elapsed) : (duration != null ? formatTime(duration) : '--:--')}
              </span>
            </div>

            {/* Loading / error feedback */}
            {isLoading && <p className="section-label text-stone-600">Generating audio...</p>}
            {errorMsg && <p className="text-[11px] font-sans text-rose-400 break-all">{errorMsg}</p>}
          </div>

          {/* Right: cover art card — hidden on mobile */}
          <div className="hidden lg:flex items-center justify-center p-6">
            <div className="relative w-44 h-44 rounded-lg bg-stone-800/50 border border-stone-700/50 overflow-hidden flex flex-col items-center justify-center">
              {/* Decorative circles */}
              <div className="absolute -top-7 -right-7 w-32 h-32 rounded-full border border-stone-600/40 pointer-events-none" />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-full border border-stone-600/40 pointer-events-none" />

              {/* Brand name */}
              <span className="font-serif text-lg font-semibold text-stone-400 select-none">Folio Daily</span>

              {/* Bottom labels */}
              <div className="absolute bottom-3 inset-x-0 flex justify-between px-3">
                <span className="section-label text-stone-600">Intelligence Unit</span>
                <span className="section-label text-stone-600">Audio Briefing</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Controls strip ─────────────────────────────────────────────────── */}
      <div className="bg-stone-950 px-6 py-3">
        {/* Progress scrubber */}
        <div
          ref={progressBarRef}
          className="relative h-1.5 bg-stone-800 cursor-pointer select-none touch-none group mb-2"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div
            className="absolute inset-y-0 left-0 bg-stone-400 group-hover:bg-stone-300 transition-colors"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-stone-100 shadow opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
            style={{ left: `${progress * 100}%` }}
          />
        </div>

        {/* Time stamps + controls row */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-sans tabular-nums text-stone-500">
            {elapsed != null ? formatTime(elapsed) : '0:00'}
          </span>

          <div className="flex-1" />

          <button
            onClick={cycleSpeed}
            className="text-[12px] font-sans font-semibold text-stone-500 hover:text-stone-300 transition-colors tabular-nums"
            aria-label="Change playback speed"
            title="Playback speed"
          >
            {speed}&times;
          </button>

          {isActive && (
            <button
              onClick={handleStop}
              className="text-stone-500 hover:text-stone-300 transition-colors"
              aria-label="Stop"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="text-stone-500 hover:text-stone-300 transition-colors disabled:opacity-40"
            aria-label="Download audio"
            title={audioReady ? 'Download MP3' : 'Generate and download MP3'}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>

          <span className="text-[10px] font-sans tabular-nums text-stone-500">
            {duration != null ? formatTime(duration) : '--:--'}
          </span>
        </div>
      </div>

      {/* ── Briefing notes panel ───────────────────────────────────────────── */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-card mt-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <p className="section-label text-stone-400">Briefing Notes</p>
        </div>

        {briefing.stories.map((story, index) => (
          <div
            key={story.id}
            className="relative px-6 py-5 border-b border-stone-100 dark:border-stone-800 last:border-0 overflow-hidden"
          >
            <span className="absolute right-4 top-2 font-mono text-6xl font-bold text-stone-900 dark:text-stone-100 opacity-[0.06] select-none leading-none">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="relative">
              <p className="section-label text-stone-400 mb-1">{story.topic}</p>
              <p className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 leading-snug mb-1">
                {story.headline}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                {story.talkingPoints?.soundbite ?? story.talkingPoint}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
