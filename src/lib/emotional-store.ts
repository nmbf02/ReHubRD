"use client";

/**
 * Módulo 3 — Salud emocional (BR-09). La tesis lo justifica con el 70 % que
 * percibe el abandono terapéutico como habitual y pide «recursos de apoyo
 * emocional accesibles durante todo el proceso» (tesis.txt:45, 361).
 *
 * Límite explícito del módulo, en palabras del documento: «No reemplaza la
 * atención presencial, sino que evita que el componente emocional quede
 * desatendido». La interfaz debe decirlo, no insinuarlo.
 */

/** 1 = muy mal, 5 = bien. Escala corta a propósito: se registra en un toque. */
export type MoodScore = 1 | 2 | 3 | 4 | 5;

export type MoodTag =
  | "dolor"
  | "ansiedad"
  | "tristeza"
  | "frustracion"
  | "miedo"
  | "soledad"
  | "cansancio"
  | "esperanza";

export interface MoodEntry {
  id: string;
  /** `YYYY-MM-DD`: un registro por día, el último gana. */
  date: string;
  score: MoodScore;
  tags: MoodTag[];
  note?: string;
  createdAt: string;
}

export const MOOD_LABEL: Record<MoodScore, string> = {
  1: "Muy mal",
  2: "Mal",
  3: "Regular",
  4: "Bien",
  5: "Muy bien",
};

export const MOOD_EMOJI: Record<MoodScore, string> = {
  1: "😞",
  2: "😔",
  3: "😐",
  4: "🙂",
  5: "😊",
};

export const MOOD_TAG_LABEL: Record<MoodTag, string> = {
  dolor: "Dolor",
  ansiedad: "Ansiedad",
  tristeza: "Tristeza",
  frustracion: "Frustración",
  miedo: "Miedo",
  soledad: "Soledad",
  cansancio: "Cansancio",
  esperanza: "Esperanza",
};

const STORAGE_KEY = "rehub-animo";
export const MOOD_UPDATED_EVENT = "rehub-animo-updated";

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function getMoodEntries(userId?: string | null): MoodEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MoodEntry[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.date.localeCompare(a.date)) : [];
  } catch {
    return [];
  }
}

export function saveMoodEntries(list: MoodEntry[], userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(MOOD_UPDATED_EVENT));
}

/** Un registro por día: si ya existe uno para esa fecha, se reemplaza. */
export function recordMood(entry: MoodEntry, userId?: string | null): MoodEntry[] {
  const next = [...getMoodEntries(userId).filter((e) => e.date !== entry.date), entry].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  saveMoodEntries(next, userId);
  return next;
}

/** Promedio de los últimos `days` días, normalizado a 0–100. `null` si no hay registros. */
export function moodScore(list: MoodEntry[], now: Date, days = 7): number | null {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const recent = list.filter((e) => new Date(`${e.date}T12:00`) >= cutoff);
  if (recent.length === 0) return null;
  const avg = recent.reduce((sum, e) => sum + e.score, 0) / recent.length;
  return Math.round(((avg - 1) / 4) * 100);
}

/** Días seguidos con registro, contando hacia atrás desde hoy. */
export function moodStreak(list: MoodEntry[], now: Date): number {
  const dates = new Set(list.map((e) => e.date));
  let streak = 0;
  const cursor = new Date(now);
  while (dates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
