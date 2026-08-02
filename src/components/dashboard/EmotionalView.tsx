"use client";

/**
 * Módulo 3 — Salud emocional. La tesis lo justifica con el 70 % que percibe el
 * abandono terapéutico como habitual y exige que el componente emocional no
 * quede desatendido (tesis.txt:45, 361).
 *
 * Con un límite que el propio documento fija y que la pantalla dice en voz
 * alta: **no reemplaza la atención presencial**.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HeartPulse, Phone, Info, MessageCircleHeart, Users } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import {
  type MoodEntry,
  type MoodScore,
  type MoodTag,
  MOOD_EMOJI,
  MOOD_LABEL,
  MOOD_TAG_LABEL,
  MOOD_UPDATED_EVENT,
  getMoodEntries,
  moodScore,
  moodStreak,
  recordMood,
  toDateKey,
} from "@/lib/emotional-store";
import { ROUTES, hrefResourcesHash } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface Props {
  userId: string | null;
}

export function EmotionalView({ userId }: Props) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [draftScore, setDraftScore] = useState<MoodScore | null>(null);
  const [draftTags, setDraftTags] = useState<MoodTag[]>([]);
  const [draftNote, setDraftNote] = useState("");

  const reload = useCallback(() => {
    setEntries(getMoodEntries(userId));
    setNow(new Date());
  }, [userId]);

  useEffect(() => {
    reload();
    window.addEventListener(MOOD_UPDATED_EVENT, reload);
    return () => window.removeEventListener(MOOD_UPDATED_EVENT, reload);
  }, [reload]);

  const today = now ? toDateKey(now) : "";
  const todayEntry = entries.find((entry) => entry.date === today);

  useEffect(() => {
    if (todayEntry) {
      setDraftScore(todayEntry.score);
      setDraftTags(todayEntry.tags);
      setDraftNote(todayEntry.note ?? "");
    }
  }, [todayEntry]);

  const { weekScore, streak, strip } = useMemo(() => {
    if (!now) return { weekScore: null, streak: 0, strip: [] as Array<{ date: string; entry?: MoodEntry }> };
    const days: Array<{ date: string; entry?: MoodEntry }> = [];
    for (let offset = 13; offset >= 0; offset -= 1) {
      const day = new Date(now);
      day.setDate(day.getDate() - offset);
      const key = toDateKey(day);
      days.push({ date: key, entry: entries.find((e) => e.date === key) });
    }
    return { weekScore: moodScore(entries, now), streak: moodStreak(entries, now), strip: days };
  }, [entries, now]);

  const save = () => {
    if (!now || draftScore === null) return;
    recordMood(
      {
        id: todayEntry?.id ?? `animo-${Date.now().toString(36)}`,
        date: today,
        score: draftScore,
        tags: draftTags,
        note: draftNote.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
      userId
    );
    reload();
  };

  const toggleTag = (tag: MoodTag) => {
    setDraftTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  };

  if (!now) {
    return <div className="h-56 animate-pulse rounded-3xl border border-rehub-100 bg-white/60" />;
  }

  return (
    <div className="space-y-6">
      {/* Registro de hoy */}
      <Reveal>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <header className="border-b border-rehub-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
              <HeartPulse className="h-5 w-5 text-rehub-600" />
              ¿Cómo te sientes hoy?
            </h2>
            <p className="mt-0.5 text-sm text-rehub-900/60">
              {todayEntry
                ? "Ya lo registraste. Puedes cambiarlo si el día cambió."
                : "Un toque basta. Nadie más ve tus notas."}
            </p>
          </header>

          <div className="p-6">
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as MoodScore[]).map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setDraftScore(score)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1.5 rounded-2xl border py-3 transition-all",
                    draftScore === score
                      ? "border-rehub-400 bg-rehub-50 shadow-soft"
                      : "border-rehub-100 hover:-translate-y-0.5 hover:border-rehub-200 hover:bg-rehub-50/50"
                  )}
                >
                  <span className="text-2xl">{MOOD_EMOJI[score]}</span>
                  <span className="text-[11px] font-medium text-rehub-900/65">
                    {MOOD_LABEL[score]}
                  </span>
                </button>
              ))}
            </div>

            {draftScore !== null && (
              <>
                <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-rehub-900/50">
                  ¿Qué pesa más hoy? (opcional)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(MOOD_TAG_LABEL) as MoodTag[]).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        draftTags.includes(tag)
                          ? "border-rehub-400 bg-rehub-100 text-rehub-800"
                          : "border-rehub-200 text-rehub-900/60 hover:bg-rehub-50"
                      )}
                    >
                      {MOOD_TAG_LABEL[tag]}
                    </button>
                  ))}
                </div>

                <textarea
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                  placeholder="Si quieres, escribe qué pasó hoy."
                  rows={2}
                  className="mt-4 w-full resize-none rounded-xl border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-400"
                />

                <button
                  type="button"
                  onClick={save}
                  className="mt-3 w-full rounded-xl bg-rehub-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rehub-700 sm:w-auto sm:px-6"
                >
                  {todayEntry ? "Actualizar" : "Guardar"}
                </button>
              </>
            )}
          </div>
        </section>
      </Reveal>

      {/* Tu quincena */}
      <Reveal delay={0.05}>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
          <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rehub-100 px-6 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-rehub-950">Tus últimos 14 días</h2>
            <div className="flex items-center gap-4 text-xs">
              {weekScore !== null && (
                <span className="font-medium text-rehub-900/65">
                  Semana: <strong className="tabular-nums text-rehub-950">{weekScore}/100</strong>
                </span>
              )}
              {streak > 0 && (
                <span className="font-medium text-rehub-700">
                  {streak} día{streak > 1 ? "s" : ""} seguidos
                </span>
              )}
            </div>
          </header>
          <div className="p-6">
            <div className="flex items-end justify-between gap-1">
              {strip.map(({ date, entry }) => {
                const height = entry ? 20 + entry.score * 14 : 12;
                return (
                  <div key={date} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      title={entry ? MOOD_LABEL[entry.score] : "Sin registro"}
                      style={{ height }}
                      className={cn(
                        "w-full rounded-md transition-all",
                        !entry && "border border-dashed border-rehub-200 bg-rehub-50/40",
                        entry && entry.score <= 2 && "bg-red-300",
                        entry && entry.score === 3 && "bg-amber-300",
                        entry && entry.score >= 4 && "bg-rehub-400"
                      )}
                    />
                    <span className="text-[9px] tabular-nums text-rehub-900/40">
                      {date.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-rehub-900/55">
              Las barras vacías son días sin registro. No son un fallo: sirven para que tú y tu médico
              vean cuándo dejaste de contar cómo ibas.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Apoyo real. El límite del módulo, dicho en voz alta. */}
      <Reveal delay={0.08}>
        <section className="overflow-hidden rounded-3xl border border-rehub-100 bg-gradient-to-br from-rehub-50/70 to-white shadow-card">
          <div className="p-6">
            <div className="flex items-start gap-3 rounded-2xl border border-rehub-200/70 bg-white/70 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-rehub-600" />
              <p className="text-sm leading-relaxed text-rehub-900/75">
                Este módulo <strong>no reemplaza la atención presencial</strong>. Está para que la parte
                emocional de tu recuperación no quede desatendida, y para conectarte con un profesional
                cuando haga falta — sin costo para ti.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <a
                href="tel:811"
                className="group flex items-center gap-3 rounded-2xl border border-rehub-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 group-hover:bg-brand-gradient group-hover:text-white">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-rehub-950">Línea 811</span>
                  <span className="block text-xs text-rehub-900/60">Salud mental, gratuita</span>
                </span>
              </a>
              <Link
                href={hrefResourcesHash("apoyo-emocional")}
                className="group flex items-center gap-3 rounded-2xl border border-rehub-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 group-hover:bg-brand-gradient group-hover:text-white">
                  <MessageCircleHeart className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-rehub-950">Guías de apoyo</span>
                  <span className="block text-xs text-rehub-900/60">Qué hacer cuando cuesta</span>
                </span>
              </Link>
              <Link
                href={ROUTES.appointments}
                className="group flex items-center gap-3 rounded-2xl border border-rehub-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700 group-hover:bg-brand-gradient group-hover:text-white">
                  <Users className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-rehub-950">Hablar con alguien</span>
                  <span className="block text-xs text-rehub-900/60">Agenda con un psicólogo aliado</span>
                </span>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
