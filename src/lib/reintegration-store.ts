"use client";

/**
 * Módulo 6 — Reintegración laboral y social (BR-09, BR-02). Es el final del
 * recorrido: la tesis define el alcance del producto como «desde el alta médica
 * hasta su reintegración laboral y social» (tesis.txt:352).
 *
 * También es el módulo que la licencia corporativa compra: la empresa mide
 * ausentismo y retorno (BR-07, BR-08).
 */

export type MilestoneStatus = "pendiente" | "en_proceso" | "logrado" | "no_aplica";

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  logrado: "Logrado",
  no_aplica: "No aplica",
};

export type MilestoneTrack = "laboral" | "social" | "autonomia";

export const TRACK_LABEL: Record<MilestoneTrack, string> = {
  laboral: "Volver al trabajo",
  social: "Volver a tu vida",
  autonomia: "Valerte por ti",
};

export interface ReintegrationMilestoneDef {
  id: string;
  track: MilestoneTrack;
  label: string;
  help: string;
}

/**
 * Tres carriles en paralelo, no una escalera. Alguien puede recuperar su vida
 * social mucho antes de volver al trabajo, y al revés; obligarlos a un orden
 * único describiría mal la recuperación.
 */
export const REINTEGRATION_MILESTONES: ReintegrationMilestoneDef[] = [
  {
    id: "evaluacion",
    track: "laboral",
    label: "Evaluar si ya puedes volver",
    help: "Tu médico valora qué puedes hacer y qué todavía no. Volver antes de tiempo es la causa más común de recaída.",
  },
  {
    id: "certificado_alta",
    track: "laboral",
    label: "Certificado de alta laboral",
    help: "El documento que tu empleador necesita para reincorporarte formalmente.",
  },
  {
    id: "conversacion",
    track: "laboral",
    label: "Hablar con tu empleador",
    help: "Acordar fecha y condiciones antes de aparecer. Llegar con un plan cambia por completo la conversación.",
  },
  {
    id: "adaptacion",
    track: "laboral",
    label: "Acordar tareas o jornada adaptada",
    help: "Volver a media jornada o con tareas livianas es un retorno válido, no un favor.",
  },
  {
    id: "retorno_parcial",
    track: "laboral",
    label: "Primer día de vuelta",
    help: "Aunque sea parcial. A partir de aquí la recuperación se sostiene sola.",
  },
  {
    id: "retorno_total",
    track: "laboral",
    label: "Retomar tu jornada completa",
    help: "Cierre del carril laboral.",
  },
  {
    id: "movilidad",
    track: "autonomia",
    label: "Moverte sin ayuda",
    help: "Transporte, escaleras, cargar tus cosas. La independencia física es lo que hace posible todo lo demás.",
  },
  {
    id: "sin_dolor",
    track: "autonomia",
    label: "Pasar el día sin dolor limitante",
    help: "No es que no duela nunca: es que el dolor ya no decide tu día.",
  },
  {
    id: "actividad",
    track: "social",
    label: "Retomar una actividad que te gusta",
    help: "Deporte, iglesia, salir con amigos. Es el indicador que más rápido mejora el ánimo.",
  },
  {
    id: "red",
    track: "social",
    label: "Volver a tu vida con los tuyos",
    help: "Reencontrarte con tu círculo sin que el accidente sea el tema.",
  },
];

export interface ReintegrationState {
  status: Record<string, MilestoneStatus>;
  /** Fecha en que se marcó como logrado, para el resumen del recorrido. */
  achievedAt: Record<string, string>;
  updatedAt: string;
}

const STORAGE_KEY = "rehub-reintegracion";
export const REINTEGRATION_UPDATED_EVENT = "rehub-reintegracion-updated";

const EMPTY: ReintegrationState = { status: {}, achievedAt: {}, updatedAt: "" };

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function getReintegration(userId?: string | null): ReintegrationState {
  if (typeof window === "undefined") return EMPTY;
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<ReintegrationState>;
    return {
      status: parsed.status ?? {},
      achievedAt: parsed.achievedAt ?? {},
      updatedAt: parsed.updatedAt ?? "",
    };
  } catch {
    return EMPTY;
  }
}

export function saveReintegration(state: ReintegrationState, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(REINTEGRATION_UPDATED_EVENT));
}

export function setMilestoneStatus(
  id: string,
  status: MilestoneStatus,
  userId?: string | null
): ReintegrationState {
  const current = getReintegration(userId);
  const achievedAt = { ...current.achievedAt };
  if (status === "logrado") achievedAt[id] = new Date().toISOString();
  else delete achievedAt[id];

  const next: ReintegrationState = {
    status: { ...current.status, [id]: status },
    achievedAt,
    updatedAt: new Date().toISOString(),
  };
  saveReintegration(next, userId);
  return next;
}

/** Avance de reintegración 0–100. `null` mientras no se haya tocado ningún hito. */
export function reintegrationScore(state: ReintegrationState): number | null {
  const relevant = REINTEGRATION_MILESTONES.filter(
    (m) => (state.status[m.id] ?? "pendiente") !== "no_aplica"
  );
  if (relevant.length === 0) return null;
  const touched = relevant.some((m) => (state.status[m.id] ?? "pendiente") !== "pendiente");
  if (!touched) return null;
  const points = relevant.reduce((sum, m) => {
    const status = state.status[m.id] ?? "pendiente";
    if (status === "logrado") return sum + 1;
    if (status === "en_proceso") return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((points / relevant.length) * 100);
}

/** ¿Volvió a trabajar? Es el indicador que compra la licencia corporativa (BR-07). */
export function hasReturnedToWork(state: ReintegrationState): boolean {
  return state.status.retorno_total === "logrado" || state.status.retorno_parcial === "logrado";
}
