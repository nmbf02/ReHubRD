"use client";

/**
 * Registro de dosis del módulo 1 — Medicamentos. Es la mitad que faltaba: la
 * receta ya se guardaba (`medications-store`), pero no el **cumplimiento**, que
 * es lo que la tesis pide de forma expresa: «cada dosis tomada o no registrada
 * construye un historial de cumplimiento que alimenta el panel del médico
 * tratante y genera alertas automáticas ante incumplimientos reiterados»
 * (tesis.txt:357).
 *
 * De aquí sale la adherencia, que es a su vez el indicador que compra la ARS
 * (BR-07) y el disparador de la alerta al médico (BR-11).
 */

import type { Medication } from "./medications-store";
import { toDateKey } from "./emotional-store";

export type DoseMark = "taken" | "skipped";

/** `medId|YYYY-MM-DD|HH:mm` → marca. Lo ausente significa "sin registrar". */
export type DoseLog = Record<string, DoseMark>;

const STORAGE_KEY = "rehub-dosis";
export const ADHERENCE_UPDATED_EVENT = "rehub-dosis-updated";

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function doseKey(medId: string, date: Date, time: string): string {
  return `${medId}|${toDateKey(date)}|${time}`;
}

export function getDoseLog(userId?: string | null): DoseLog {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as DoseLog;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDoseLog(log: DoseLog, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify(log));
  window.dispatchEvent(new CustomEvent(ADHERENCE_UPDATED_EVENT));
}

export function markDose(
  medId: string,
  date: Date,
  time: string,
  mark: DoseMark | null,
  userId?: string | null
): DoseLog {
  const log = { ...getDoseLog(userId) };
  const key = doseKey(medId, date, time);
  if (mark === null) delete log[key];
  else log[key] = mark;
  saveDoseLog(log, userId);
  return log;
}

export interface ScheduledDose {
  medId: string;
  medName: string;
  dose?: string;
  time: string;
  /** Momento exacto en que tocaba. */
  at: Date;
  key: string;
  mark: DoseMark | null;
  /** Su hora ya pasó. Solo las vencidas cuentan para la adherencia (BR-10). */
  due: boolean;
}

/** Las dosis de un día concreto, en orden, con su marca si la tiene. */
export function dosesForDay(
  meds: Medication[],
  log: DoseLog,
  day: Date,
  now: Date
): ScheduledDose[] {
  const doses: ScheduledDose[] = [];
  for (const med of meds) {
    // Una receta no genera dosis anteriores al día en que se cargó.
    const startedOn = new Date(med.createdAt);
    startedOn.setHours(0, 0, 0, 0);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    if (dayStart < startedOn) continue;

    for (const time of med.times) {
      const [h, m] = time.split(":").map((n) => parseInt(n, 10));
      const at = new Date(day);
      at.setHours(Number.isNaN(h) ? 8 : h, Number.isNaN(m) ? 0 : m, 0, 0);
      const key = doseKey(med.id, day, time);
      doses.push({
        medId: med.id,
        medName: med.name,
        dose: med.dose,
        time,
        at,
        key,
        mark: log[key] ?? null,
        due: at <= now,
      });
    }
  }
  return doses.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/**
 * Adherencia 0–100 sobre las dosis ya vencidas de los últimos `days` días.
 *
 * Una dosis vencida y sin marcar cuenta como no tomada — así lo define la
 * tesis. `null` cuando todavía no ha vencido ninguna: eso es "aún no hay nada
 * que medir", que no es lo mismo que cero (BR-10).
 */
export function adherenceRate(
  meds: Medication[],
  log: DoseLog,
  now: Date,
  days = 14
): number | null {
  let due = 0;
  let taken = 0;
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - offset);
    for (const dose of dosesForDay(meds, log, day, now)) {
      if (!dose.due) continue;
      due += 1;
      if (dose.mark === "taken") taken += 1;
    }
  }
  if (due === 0) return null;
  return Math.round((taken / due) * 100);
}

/** Días seguidos sin marcar una sola dosis vencida. Alimenta la alerta de silencio. */
export function daysWithoutRecording(
  meds: Medication[],
  log: DoseLog,
  now: Date,
  maxLookback = 30
): number {
  if (meds.length === 0) return 0;
  let silent = 0;
  for (let offset = 0; offset < maxLookback; offset += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - offset);
    const doses = dosesForDay(meds, log, day, now).filter((d) => d.due);
    if (doses.length === 0) continue;
    if (doses.some((d) => d.mark !== null)) break;
    silent += 1;
  }
  return silent;
}
