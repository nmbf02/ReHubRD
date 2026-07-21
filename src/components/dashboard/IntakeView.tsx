"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MessageCircleHeart, ArrowRight, Phone, Sparkles, Clock, Mic, Square, RotateCcw } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import {
  INTAKE_QUESTIONS,
  suggestionsFor,
  matchOption,
  type IntakeAnswers,
  type IntakeId,
  type SuggestionTone,
} from "@/lib/intake";
import { getIntake, saveIntake, INTAKE_UPDATED_EVENT } from "@/lib/intake-store";

interface Props {
  userId: string | null;
}

type RecEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: RecEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

const TONE_STYLES: Record<SuggestionTone, string> = {
  urgent: "border-red-200 bg-red-50/70",
  free: "border-rehub-200 bg-rehub-50/70",
  soon: "border-amber-200 bg-amber-50/60",
  normal: "border-rehub-100 bg-white",
};

export function IntakeView({ userId }: Props) {
  const t = useTranslations("dashboard.intake");
  const [answers, setAnswers] = useState<IntakeAnswers>({});

  // voice state
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [step, setStep] = useState(0);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "speaking" | "listening" | "unclear">("idle");
  const [heard, setHeard] = useState("");

  const voiceOnRef = useRef(false);
  const recRef = useRef<SpeechRec | null>(null);

  useEffect(() => {
    const win = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    setVoiceSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    const refresh = () => setAnswers(getIntake(userId));
    refresh();
    window.addEventListener(INTAKE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(INTAKE_UPDATED_EVENT, refresh);
  }, [userId]);

  const persist = useCallback(
    (next: IntakeAnswers) => {
      setAnswers(next);
      saveIntake(next, userId);
    },
    [userId]
  );

  const choose = useCallback(
    (id: IntakeId, value: string) => persist({ ...answers, [id]: value }),
    [answers, persist]
  );

  // --- voice helpers ---
  const speak = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      u.rate = 0.98;
      const esVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("es"));
      if (esVoice) u.voice = esVoice;
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      u.onend = finish;
      u.onerror = finish;
      setTimeout(finish, Math.min(9000, 1800 + text.length * 55)); // safety
      window.speechSynthesis.speak(u);
    });
  }, []);

  const listenOnce = useCallback(() => {
    return new Promise<string | null>((resolve) => {
      const win = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
      const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!Ctor) return resolve(null);
      const rec = new Ctor();
      recRef.current = rec;
      rec.lang = "es-DO";
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      rec.continuous = false;
      let settled = false;
      let timer: ReturnType<typeof setTimeout>;
      const done = (value: string | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        recRef.current = null;
        resolve(value);
      };
      rec.onresult = (e) => {
        try {
          done(e.results[0][0].transcript);
        } catch {
          done(null);
        }
      };
      rec.onerror = () => done(null);
      rec.onend = () => done(null);
      timer = setTimeout(() => { try { rec.stop(); } catch { /* noop */ } done(null); }, 9000);
      try { rec.start(); } catch { done(null); }
    });
  }, []);

  const stopVoice = useCallback(() => {
    voiceOnRef.current = false;
    setVoiceOn(false);
    setVoiceStatus("idle");
    try { recRef.current?.abort(); } catch { /* noop */ }
    recRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const runStep = useCallback(
    async (index: number) => {
      if (!voiceOnRef.current) return;
      if (index >= INTAKE_QUESTIONS.length) {
        setVoiceStatus("idle");
        await speak(t("voice.done"));
        return;
      }
      const q = INTAKE_QUESTIONS[index];
      setStep(index);
      setHeard("");
      setVoiceStatus("speaking");
      await speak(t(`questions.${q.id}.q`));
      if (!voiceOnRef.current) return;
      setVoiceStatus("listening");
      const transcript = await listenOnce();
      if (!voiceOnRef.current) return;
      if (transcript) setHeard(transcript);
      const match = transcript ? matchOption(q.id, transcript) : null;
      if (match) {
        choose(q.id, match);
        setVoiceStatus("idle");
        setTimeout(() => runStep(index + 1), 500);
      } else {
        setVoiceStatus("unclear");
      }
    },
    [speak, listenOnce, choose, t]
  );

  const startVoice = useCallback(() => {
    voiceOnRef.current = true;
    setVoiceOn(true);
    const firstUnanswered = INTAKE_QUESTIONS.findIndex((q) => !answers[q.id]);
    const first = firstUnanswered === -1 ? 0 : firstUnanswered;
    void (async () => {
      setVoiceStatus("speaking");
      await speak(t("intro")); // the bot introduces itself, then asks
      if (!voiceOnRef.current) return;
      runStep(first);
    })();
  }, [answers, runStep, speak, t]);

  useEffect(() => () => { voiceOnRef.current = false; try { recRef.current?.abort(); } catch { /* noop */ } }, []);

  const suggestions = useMemo(() => suggestionsFor(answers), [answers]);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        {/* Bot introduces itself */}
        <Reveal>
          <section className="rounded-2xl border border-rehub-100 bg-gradient-to-br from-rehub-50 to-white p-5 shadow-card">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <MessageCircleHeart className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-rehub-700/70">{t("introTitle")}</p>
                <p className="mt-1 text-sm leading-relaxed text-rehub-900/75">{t("intro")}</p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Voice control */}
        {voiceSupported && (
          <Reveal>
            <section className="flex flex-col gap-3 rounded-2xl border border-rehub-200 bg-gradient-to-br from-rehub-50 to-white p-4 shadow-card sm:flex-row sm:items-center">
              {!voiceOn ? (
                <button
                  type="button"
                  onClick={startVoice}
                  className="inline-flex items-center gap-2 rounded-xl bg-rehub-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700"
                >
                  <Mic className="h-4 w-4" />
                  {t("voice.start")}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={stopVoice}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100"
                  >
                    <Square className="h-4 w-4" />
                    {t("voice.stop")}
                  </button>
                  {voiceStatus === "unclear" && (
                    <button
                      type="button"
                      onClick={() => runStep(step)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rehub-200 bg-white px-3.5 py-2 text-sm font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t("voice.repeat")}
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-rehub-900/60 sm:ml-auto">
                {voiceOn
                  ? voiceStatus === "speaking"
                    ? t("voice.speaking")
                    : voiceStatus === "listening"
                    ? t("voice.listening")
                    : voiceStatus === "unclear"
                    ? t("voice.unclear")
                    : t("voice.on")
                  : t("voice.hint")}
                {heard ? ` — "${heard}"` : ""}
              </p>
            </section>
          </Reveal>
        )}

        {INTAKE_QUESTIONS.map((question, i) => {
          const isCurrent = voiceOn && i === step;
          return (
            <Reveal key={question.id}>
              <section
                className={`rounded-2xl border bg-white p-5 shadow-card transition-all ${
                  isCurrent ? "border-rehub-500 ring-2 ring-rehub-500/20" : "border-rehub-100"
                }`}
              >
                <p className="mb-3 text-sm font-semibold text-rehub-950">{t(`questions.${question.id}.q`)}</p>
                <div className="flex flex-wrap gap-2">
                  {question.options.map((option) => {
                    const active = answers[question.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          choose(question.id, option);
                          if (voiceOn) { try { recRef.current?.abort(); } catch { /* noop */ } setTimeout(() => runStep(i + 1), 300); }
                        }}
                        className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                          active
                            ? "border-rehub-500 bg-rehub-600 text-white shadow-glow"
                            : "border-rehub-200 bg-white text-rehub-800 hover:bg-rehub-50"
                        }`}
                      >
                        {t(`questions.${question.id}.${option}`)}
                      </button>
                    );
                  })}
                </div>
              </section>
            </Reveal>
          );
        })}
      </div>

      {/* Live suggestions */}
      <Reveal>
        <section className="lg:sticky lg:top-6 rounded-2xl border border-rehub-100 bg-gradient-to-br from-rehub-50 to-white p-5 shadow-card">
          <div className="mb-1 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
              <MessageCircleHeart className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-rehub-950">{t("suggestionsTitle")}</h3>
          </div>
          <p className="mb-4 text-xs text-rehub-900/55">{t("description")}</p>

          {answeredCount === 0 ? (
            <p className="rounded-xl border border-dashed border-rehub-200 bg-white/60 px-4 py-8 text-center text-sm text-rehub-900/55">
              {t("suggestionsEmpty")}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {suggestions.map((s) => (
                <li key={s.id} className={`rounded-xl border p-3.5 ${TONE_STYLES[s.tone]}`}>
                  <div className="flex items-start gap-2">
                    {s.tone === "soon" && <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
                    {s.tone === "free" && <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rehub-600" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-rehub-950">{t(`sug.${s.id}.t`)}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-rehub-900/60">{t(`sug.${s.id}.d`)}</p>
                      {s.href && (
                        <Link href={s.href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rehub-600 hover:text-rehub-700">
                          {t("go")}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                      {s.tel && (
                        <a href={`tel:${s.tel}`} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rehub-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-rehub-700">
                          <Phone className="h-3 w-3" />
                          {t("call")} {s.tel}
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>
    </div>
  );
}
