"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play, Square, Volume2 } from "lucide-react";

/**
 * Calming spoken welcome on the LANDING hero — the first thing someone who just
 * arrived injured hears, before "Comenzar". Plays a pre-generated ElevenLabs
 * clip (public/audio/welcome.mp3) over a soft, code-generated Web Audio ambient
 * pad; falls back to the browser's free speech synthesis if the clip is absent.
 * Zero-cost at runtime.
 */
export function WelcomeVoice() {
  const t = useTranslations("landing.welcomeVoice");
  const script = t("script");

  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  const startAmbient = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

      const oscs = [110, 164.81].map((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        osc.detune.value = i === 0 ? -4 : 5;
        osc.connect(master);
        osc.start();
        return osc;
      });

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
    const esVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("es"));
    if (esVoice) utter.voice = esVoice;
    utter.onend = () => stopAll();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [script, stopAll]);

  const play = useCallback(() => {
    setPlaying(true);
    setShowText(true);
    startAmbient();
    const audio = new Audio("/audio/welcome.mp3");
    audio.onended = () => stopAll();
    audio.onerror = () => speakFallback();
    audioRef.current = audio;
    audio.play().catch(() => speakFallback());
  }, [startAmbient, stopAll, speakFallback]);

  return (
    <div className="mt-8 max-w-xl rounded-xl border border-rehub-200 bg-gradient-to-br from-rehub-50 to-white p-4 shadow-soft dark:border-rehub-800 dark:from-rehub-900 dark:to-rehub-950">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={playing ? stopAll : play}
          aria-label={playing ? t("stop") : t("play")}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rehub-700 text-white shadow-soft transition-colors hover:bg-rehub-800 dark:bg-rehub-500 dark:hover:bg-rehub-400 ${
            playing ? "animate-pulse" : ""
          }`}
        >
          {playing ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
        </button>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-rehub-700 dark:text-rehub-300">
            <Volume2 className="h-3.5 w-3.5" />
            {t("eyebrow")}
          </p>
          <p className="text-sm font-semibold text-rehub-950 dark:text-white">{t("title")}</p>
          <p className="text-xs text-rehub-900/55 dark:text-rehub-100/55">{t("caption")}</p>
        </div>
      </div>
      {showText && (
        <p className="mt-3 text-pretty text-sm leading-relaxed text-rehub-900/70 dark:text-rehub-100/70">
          {script}
        </p>
      )}
    </div>
  );
}
