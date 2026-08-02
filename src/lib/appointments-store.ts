"use client";

/**
 * Módulo 2 — Citas y terapias (BR-09). Segunda pieza del MVP que la tesis
 * declara: «registra cada cita con fecha, hora y profesional asignado y envía
 * recordatorios previos para reducir el ausentismo, uno de los principales
 * causantes del abandono terapéutico» (tesis.txt:359).
 *
 * En disco solamente, igual que el resto de los módulos: localStorage, sin
 * servidor y sin datos clínicos en la red.
 */

export type AppointmentKind = "consulta" | "fisioterapia" | "psicologia" | "estudio";

export type AppointmentStatus =
  | "programada"
  | "completada"
  | "reprogramada"
  | "ausente";

export interface Appointment {
  id: string;
  kind: AppointmentKind;
  /** Motivo visible, p. ej. "Terapia de rodilla". */
  title: string;
  professional: string;
  place?: string;
  /** ISO local `YYYY-MM-DDTHH:mm`. */
  datetime: string;
  status: AppointmentStatus;
  /**
   * Reservada a través de ReHub: dispara la comisión pactada con el centro
   * (BR-17), que nunca se le cobra al paciente.
   */
  bookedThroughRehub?: boolean;
  notes?: string;
  createdAt: string;
}

export const APPOINTMENT_KIND_LABEL: Record<AppointmentKind, string> = {
  consulta: "Consulta médica",
  fisioterapia: "Terapia física",
  psicologia: "Apoyo psicológico",
  estudio: "Estudio o análisis",
};

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  programada: "Programada",
  completada: "Completada",
  reprogramada: "Reprogramada",
  ausente: "No asistió",
};

const STORAGE_KEY = "rehub-citas";
export const APPOINTMENTS_UPDATED_EVENT = "rehub-citas-updated";

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function getAppointments(userId?: string | null): Appointment[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Appointment[];
    return Array.isArray(parsed) ? parsed.sort(byDatetime) : [];
  } catch {
    return [];
  }
}

export function saveAppointments(list: Appointment[], userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify([...list].sort(byDatetime)));
  window.dispatchEvent(new CustomEvent(APPOINTMENTS_UPDATED_EVENT));
}

export function upsertAppointment(cita: Appointment, userId?: string | null): Appointment[] {
  const list = getAppointments(userId);
  const exists = list.some((a) => a.id === cita.id);
  const next = exists ? list.map((a) => (a.id === cita.id ? cita : a)) : [...list, cita];
  saveAppointments(next, userId);
  return next;
}

export function removeAppointment(id: string, userId?: string | null): Appointment[] {
  const next = getAppointments(userId).filter((a) => a.id !== id);
  saveAppointments(next, userId);
  return next;
}

function byDatetime(a: Appointment, b: Appointment): number {
  return a.datetime.localeCompare(b.datetime);
}

/**
 * Una cita cuya hora ya pasó y sigue "programada" cuenta como ausencia: el
 * paciente no la marcó y nadie la reprogramó. Es la misma lógica que la tesis
 * aplica a las dosis — la falta de registro también es información (BR-10).
 */
export function isMissed(cita: Appointment, now: Date): boolean {
  return cita.status === "ausente" || (cita.status === "programada" && new Date(cita.datetime) < now);
}

export function isUpcoming(cita: Appointment, now: Date): boolean {
  return cita.status !== "completada" && cita.status !== "ausente" && new Date(cita.datetime) >= now;
}

/** Asistencia sobre las citas ya vencidas. `null` cuando todavía no hay ninguna. */
export function attendanceRate(list: Appointment[], now: Date): number | null {
  const past = list.filter((c) => c.status === "completada" || isMissed(c, now));
  if (past.length === 0) return null;
  const attended = past.filter((c) => c.status === "completada").length;
  return Math.round((attended / past.length) * 100);
}
