"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play, Square, Volume2 } from "lucide-react";

/**
 * Calming spoken welcome for someone who just arrived injured and may not feel
 * like reading. Plays a pre-generated ElevenLabs clip (public/audio/welcome.mp3)
 * over a soft, code-generated ambient pad (Web Audio — no asset). If the MP3 is
 * not present, it falls back to the browser's free speech synthesis so it never
 * breaks. Zero-cost at runtime.
 */
export function WelcomeVoice() {
  const t = useTranslations("dashboard.welcomeVoice");
  const script = t("script");

  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  const startAmbient = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0.0;
      master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 380;
      master.connect(filter);
      filter.connect(ctx.destination);

      // two softly detuned oscillators = a warm, breathing pad
      const freqs = [110, 164.81];
      const oscs = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        osc.detune.value = i === 0 ? -4 : 5;
        osc.connect(master);
        osc.start();
        return osc;
      });

      // slow "breathing" of the volume
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);
      lfo.start();

      nodesRef.current = {
        stop: () => {
          try {
            master.gain.cancelScheduledValues(ctx.currentTime);
            master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
            oscs.forEach((o) => o.stop(ctx.currentTime + 0.7));
            lfo.stop(ctx.currentTime + 0.7);
          } catch {
            /* noop */
          }
        },
      };
    } catch {
      /* ambient is optional */
    }
  }, []);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    nodesRef.current?.stop();
    nodesRef.current = null;
    setTimeout(() => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    }, 800);
    setPlaying(false);
  }, []);

  const speakFallback = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      stopAll();
      return;
    }
    const utter = new SpeechSynthesisUtterance(script);
    utter.lang = "es-ES";
    utter.rate = 0.9;
    utter.pitch = 1;
    const esVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("es"));
    if (esVoice) utter.voice = esVoice;
    utter.onend = () => stopAll();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [script, stopAll]);

  const play = useCallback(() => {
    setPlaying(true);
    startAmbient();
    const audio = new Audio("/audio/welcome.mp3");
    audio.volume = 1;
    audio.onended = () => stopAll();
    audio.onerror = () => speakFallback(); // MP3 not present yet → free browser voice
    audioRef.current = audio;
    audio.play().catch(() => speakFallback());
  }, [startAmbient, stopAll, speakFallback]);

  return (
    <section className="overflow-hidden rounded-2xl border border-rehub-100 bg-gradient-to-br from-rehub-50 to-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow ${
            playing ? "animate-pulse" : ""
          }`}
        >
          <Volume2 className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-rehub-700/70">{t("eyebrow")}</p>
          <h3 className="text-lg font-bold text-rehub-950">{t("title")}</h3>
          <p className="mt-0.5 text-sm text-rehub-900/60">{t("caption")}</p>
        </div>
        <button
          type="button"
          onClick={playing ? stopAll : play}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700"
        >
          {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? t("stop") : t("play")}
        </button>
      </div>

      {playing && (
        <p className="mt-4 max-w-3xl text-pretty text-sm leading-relaxed text-rehub-900/70">{script}</p>
      )}
    </section>
  );
}
