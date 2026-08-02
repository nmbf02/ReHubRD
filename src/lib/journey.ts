"use client";

/**
 * El recorrido de recuperación: la columna vertebral de la aplicación.
 *
 * Se modela una sola vez aquí y de este archivo derivan el menú, el dashboard,
 * el estado de cada módulo y las alertas que ven el médico y la institución.
 * Ver `docs/adr/0001-recovery-journey-as-navigation-spine.md`.
 *
 *   ALTA MÉDICA ─▶ ① Ingreso ─▶ ② Tratamiento ─▶ ③ Avance ─▶ ④ Reintegración ─▶ ALTA REHUB
 *
 * Dos reglas gobiernan todo lo de abajo:
 *
 *   BR-03  La etapa decide qué módulos se activan.
 *   BR-10  El avance sale de los datos de los módulos, jamás de campos llenos
 *          de un formulario. Y una señal sin datos NO es un cero: se excluye.
 */

import type { TipoAccidente, TipoSeguro } from "@/types/profile";
import type { Medication } from "./medications-store";
import { type DoseLog, adherenceRate, daysWithoutRecording } from "./adherence-store";
import { type Appointment, attendanceRate, isMissed, isUpcoming } from "./appointments-store";
import { type MoodEntry, moodScore } from "./emotional-store";
import { type PaperworkState, applicableSteps, paperworkScore } from "./paperwork-store";
import {
  type ReintegrationState,
  reintegrationScore,
  hasReturnedToWork,
} from "./reintegration-store";

// ─────────────────────────────────────────────────────────────── Etapas

export type StageId = "ingreso" | "tratamiento" | "avance" | "reintegracion" | "alta_rehub";

export const STAGE_ORDER: StageId[] = [
  "ingreso",
  "tratamiento",
  "avance",
  "reintegracion",
  "alta_rehub",
];

export interface StageDef {
  id: StageId;
  /** Número que se enseña. El alta ReHub no numera: es el final. */
  step: number | null;
  label: string;
  /** El verbo de la etapa: qué se hace aquí. */
  verb: string;
  blurb: string;
}

export const STAGES: Record<StageId, StageDef> = {
  ingreso: {
    id: "ingreso",
    step: 1,
    label: "Ingreso",
    verb: "Organizar",
    blurb:
      "Saliste del hospital con indicaciones en la mano. Aquí se ordenan: qué tomas, cuándo vuelves y qué trámite abriste.",
  },
  tratamiento: {
    id: "tratamiento",
    step: 2,
    label: "Tratamiento",
    verb: "Cumplir",
    blurb:
      "La etapa larga. Se trata de sostener las dosis y las terapias — que es exactamente donde la gente abandona.",
  },
  avance: {
    id: "avance",
    step: 3,
    label: "Avance",
    verb: "Sostener",
    blurb:
      "Ya hay constancia y se nota. Aquí se mide la mejoría y se cierra lo administrativo.",
  },
  reintegracion: {
    id: "reintegracion",
    step: 4,
    label: "Reintegración",
    verb: "Volver",
    blurb: "Volver al trabajo y a tu vida. El accidente deja de ser el centro del día.",
  },
  alta_rehub: {
    id: "alta_rehub",
    step: null,
    label: "Alta ReHub",
    verb: "Completado",
    blurb: "Recuperación completada. Este es el resumen de todo tu recorrido.",
  },
};

// ─────────────────────────────────────────────────────────────── Módulos

export type ModuleId =
  | "medicamentos"
  | "citas"
  | "emocional"
  | "tramites"
  | "progreso"
  | "reintegracion";

export interface ModuleDef {
  id: ModuleId;
  label: string;
  href: string;
  /** Etapa en que el módulo se activa (BR-03). */
  activatesAt: StageId;
  blurb: string;
}

/** Los seis módulos funcionales de la ficha técnica (BR-09, tesis.txt:156). */
export const MODULES: ModuleDef[] = [
  {
    id: "medicamentos",
    label: "Medicamentos",
    href: "/dashboard/medications",
    activatesAt: "ingreso",
    blurb: "Tus dosis y a qué hora toca cada una.",
  },
  {
    id: "citas",
    label: "Citas y terapias",
    href: "/dashboard/appointments",
    activatesAt: "ingreso",
    blurb: "Consultas y fisioterapia, con aviso antes.",
  },
  {
    id: "tramites",
    label: "Trámites y seguros",
    href: "/dashboard/paperwork",
    activatesAt: "ingreso",
    blurb: "Qué papel te toca ahora y ante quién.",
  },
  {
    id: "emocional",
    label: "Salud emocional",
    href: "/dashboard/emotional",
    activatesAt: "tratamiento",
    blurb: "Cómo vas por dentro, no solo por fuera.",
  },
  {
    id: "progreso",
    label: "Mi progreso",
    href: "/dashboard/progress",
    activatesAt: "tratamiento",
    blurb: "Todo junto: qué mejora y qué se está quedando atrás.",
  },
  {
    id: "reintegracion",
    label: "Reintegración",
    href: "/dashboard/reintegration",
    activatesAt: "reintegracion",
    blurb: "Volver al trabajo y a tu vida.",
  },
];

export function modulesFor(stage: StageId): ModuleDef[] {
  const reached = STAGE_ORDER.indexOf(stage);
  return MODULES.filter((m) => STAGE_ORDER.indexOf(m.activatesAt) <= reached);
}

export function isModuleActive(module: ModuleDef, stage: StageId): boolean {
  return STAGE_ORDER.indexOf(module.activatesAt) <= STAGE_ORDER.indexOf(stage);
}

// ─────────────────────────────────────────────────── Fotografía del paciente

/**
 * Todo lo que hace falta para situar a una persona en el recorrido. Es un
 * objeto plano a propósito: el paciente que ha iniciado sesión lo arma desde su
 * `localStorage`, y los pacientes de la cartera del médico lo traen ya hecho.
 */
export interface PatientSnapshot {
  /** Día 0 del recorrido (BR-01). */
  dischargeDate?: string;
  accidentType?: TipoAccidente;
  insurance?: TipoSeguro;
  /** Datos del alta registrados. Es un hito de la etapa 1, no el progreso (BR-10). */
  profileComplete: boolean;
  medications: Medication[];
  doseLog: DoseLog;
  appointments: Appointment[];
  moods: MoodEntry[];
  paperwork: PaperworkState;
  reintegration: ReintegrationState;
}

export const EMPTY_SNAPSHOT: PatientSnapshot = {
  profileComplete: false,
  medications: [],
  doseLog: {},
  appointments: [],
  moods: [],
  paperwork: { status: {}, notes: {}, updatedAt: "" },
  reintegration: { status: {}, achievedAt: {}, updatedAt: "" },
};

// ─────────────────────────────────────────────────────────────── Señales

export type SignalId = "adherencia" | "asistencia" | "animo" | "tramites" | "reintegracion";

export interface Signal {
  id: SignalId;
  label: string;
  /** 0–100, o `null` cuando todavía no hay nada que medir (BR-10). */
  value: number | null;
  /** Qué se está mirando exactamente, en una línea. */
  detail: string;
}

export const SIGNAL_LABEL: Record<SignalId, string> = {
  adherencia: "Adherencia",
  asistencia: "Asistencia a terapias",
  animo: "Ánimo",
  tramites: "Trámites",
  reintegracion: "Reintegración",
};

// ─────────────────────────────────────────────────────────────── Hitos

export interface MilestoneDef {
  id: string;
  stage: StageId;
  label: string;
  /** Qué hay que hacer para cumplirlo, en imperativo y sin jerga. */
  action: string;
  href: string;
}

/**
 * Se avanza cumpliendo hitos, no dejando pasar el tiempo (ADR 0001). Dos
 * personas con el mismo tiempo desde el alta y adherencias opuestas no pueden
 * estar en la misma etapa.
 */
export const MILESTONES: MilestoneDef[] = [
  // ① Ingreso — organizar lo que traes del hospital
  {
    id: "datos_alta",
    stage: "ingreso",
    label: "Datos de tu alta registrados",
    action: "Cuéntanos qué te pasó y cuándo saliste del hospital",
    href: "/dashboard/profile",
  },
  {
    id: "receta_cargada",
    stage: "ingreso",
    label: "Tu receta está cargada",
    action: "Agrega los medicamentos que te mandaron",
    href: "/dashboard/medications",
  },
  {
    id: "primera_cita",
    stage: "ingreso",
    label: "Tienes tu próxima cita agendada",
    action: "Agenda tu consulta de seguimiento o tu primera terapia",
    href: "/dashboard/appointments",
  },
  {
    id: "tramite_abierto",
    stage: "ingreso",
    label: "Abriste tu reclamación",
    action: "Reporta el accidente a tu ARS antes de que se venza el plazo",
    href: "/dashboard/paperwork",
  },

  // ② Tratamiento — cumplir
  {
    id: "dosis_registradas",
    stage: "tratamiento",
    label: "Estás marcando tus dosis",
    action: "Marca las dosis que vas tomando durante unos días",
    href: "/dashboard/medications",
  },
  {
    id: "terapia_asistida",
    stage: "tratamiento",
    label: "Tres terapias completadas",
    action: "Marca como completadas las citas a las que ya fuiste",
    href: "/dashboard/appointments",
  },
  {
    id: "animo_registrado",
    stage: "tratamiento",
    label: "Le sigues el pulso a tu ánimo",
    action: "Registra cómo te sientes unos cuantos días",
    href: "/dashboard/emotional",
  },

  // ③ Avance — sostener y medir
  {
    id: "adherencia_sostenida",
    stage: "avance",
    label: "Adherencia de 70 % o más",
    action: "Sostén tus dosis: vas por debajo del 70 %",
    href: "/dashboard/medications",
  },
  {
    id: "terapias_completadas",
    stage: "avance",
    label: "Ocho terapias completadas",
    action: "Sigue asistiendo a tus terapias",
    href: "/dashboard/appointments",
  },
  {
    id: "tramite_resuelto",
    stage: "avance",
    label: "Resolviste tus trámites principales",
    action: "Cierra los trámites que tienes en proceso",
    href: "/dashboard/paperwork",
  },

  // ④ Reintegración — volver
  {
    id: "plan_retorno",
    stage: "reintegracion",
    label: "Empezaste tu plan de retorno",
    action: "Marca en qué vas con tu vuelta al trabajo y a tu vida",
    href: "/dashboard/reintegration",
  },
  {
    id: "retorno_laboral",
    stage: "reintegracion",
    label: "Volviste al trabajo",
    action: "Marca tu primer día de vuelta cuando llegue",
    href: "/dashboard/reintegration",
  },
  {
    id: "vida_social",
    stage: "reintegracion",
    label: "Retomaste tu vida",
    action: "Marca la actividad que ya volviste a hacer",
    href: "/dashboard/reintegration",
  },
];

export interface MilestoneState extends MilestoneDef {
  done: boolean;
}

// ─────────────────────────────────────────────────────────────── Alertas

export type AlertId =
  | "adherencia_baja"
  | "sin_registro"
  | "cita_perdida"
  | "animo_bajo"
  | "estancamiento";

export type AlertSeverity = "alta" | "media";

export interface JourneyAlert {
  id: AlertId;
  severity: AlertSeverity;
  label: string;
  detail: string;
}

// ─────────────────────────────────────────────────────────── El cálculo

export interface JourneyState {
  stage: StageId;
  stageDef: StageDef;
  /** Días transcurridos desde el alta. `null` si no se ha registrado la fecha. */
  daysSinceDischarge: number | null;
  signals: Signal[];
  /** Promedio de las señales que SÍ tienen datos. `null` si ninguna los tiene. */
  recoveryIndex: number | null;
  milestones: MilestoneState[];
  /** Lo que falta para pasar a la siguiente etapa. */
  pending: MilestoneState[];
  alerts: JourneyAlert[];
  /** Cuánto de las cuatro etapas está cumplido, 0–100. Para el carril del menú. */
  journeyProgress: number;
}

export function computeJourney(snap: PatientSnapshot, now: Date): JourneyState {
  const adherence = adherenceRate(snap.medications, snap.doseLog, now);
  const attendance = attendanceRate(snap.appointments, now);
  const mood = moodScore(snap.moods, now);
  const steps = applicableSteps(snap.accidentType, snap.insurance);
  const paperwork = paperworkScore(steps, snap.paperwork);
  const reintegration = reintegrationScore(snap.reintegration);

  const completedTherapies = snap.appointments.filter((a) => a.status === "completada").length;
  const markedDoses = Object.values(snap.doseLog).filter((m) => m === "taken").length;
  const resolvedPaperwork = steps.filter((s) => snap.paperwork.status[s.id] === "resuelto").length;
  const reintegrationTouched = Object.values(snap.reintegration.status).some(
    (s) => s === "en_proceso" || s === "logrado"
  );
  const socialDone =
    snap.reintegration.status.actividad === "logrado" ||
    snap.reintegration.status.red === "logrado";

  const done: Record<string, boolean> = {
    datos_alta: snap.profileComplete,
    receta_cargada: snap.medications.length > 0,
    primera_cita: snap.appointments.length > 0,
    tramite_abierto: steps.some((s) => {
      const status = snap.paperwork.status[s.id];
      return status === "en_proceso" || status === "resuelto";
    }),

    // Tratamiento es «la etapa larga»: sus hitos tienen que costar algunas
    // semanas. Con umbrales de uno solo, todo el mundo la cruzaba de golpe y la
    // etapa aparecía siempre vacía en el embudo institucional.
    dosis_registradas: markedDoses >= 5,
    terapia_asistida: completedTherapies >= 3,
    animo_registrado: snap.moods.length >= 3,

    // El listón de Avance mide constancia sostenida, no un buen mes: ocho
    // terapias son ~dos meses de sesiones semanales. Con un umbral más bajo un
    // paciente llegaba a Reintegración al día 30, que no es creíble.
    adherencia_sostenida: adherence !== null && adherence >= 70,
    terapias_completadas: completedTherapies >= 8,
    tramite_resuelto: resolvedPaperwork >= 2,

    plan_retorno: reintegrationTouched,
    retorno_laboral: hasReturnedToWork(snap.reintegration),
    vida_social: socialDone,
  };

  const milestones: MilestoneState[] = MILESTONES.map((m) => ({ ...m, done: done[m.id] ?? false }));

  // La etapa es la primera cuyos hitos no están todos cumplidos.
  const stage: StageId =
    (["ingreso", "tratamiento", "avance", "reintegracion"] as StageId[]).find((id) =>
      milestones.some((m) => m.stage === id && !m.done)
    ) ?? "alta_rehub";

  const pending = milestones.filter((m) => m.stage === stage && !m.done);

  const signals: Signal[] = [
    {
      id: "adherencia",
      label: SIGNAL_LABEL.adherencia,
      value: adherence,
      detail:
        adherence === null
          ? "Todavía no ha vencido ninguna dosis"
          : "Dosis marcadas en los últimos 14 días",
    },
    {
      id: "asistencia",
      label: SIGNAL_LABEL.asistencia,
      value: attendance,
      detail:
        attendance === null
          ? "Aún no tienes citas vencidas"
          : `${completedTherapies} de ${snap.appointments.filter((a) => a.status === "completada" || isMissed(a, now)).length} citas cumplidas`,
    },
    {
      id: "animo",
      label: SIGNAL_LABEL.animo,
      value: mood,
      detail: mood === null ? "Sin registros esta semana" : "Promedio de los últimos 7 días",
    },
    {
      id: "tramites",
      label: SIGNAL_LABEL.tramites,
      value: paperwork,
      detail:
        paperwork === null
          ? "Sin trámites iniciados"
          : `${resolvedPaperwork} de ${steps.length} pasos resueltos`,
    },
    {
      id: "reintegracion",
      label: SIGNAL_LABEL.reintegracion,
      value: reintegration,
      detail: reintegration === null ? "Todavía no es momento" : "Hitos de retorno alcanzados",
    },
  ];

  const measured = signals.filter((s) => s.value !== null);
  const recoveryIndex =
    measured.length === 0
      ? null
      : Math.round(measured.reduce((sum, s) => sum + (s.value ?? 0), 0) / measured.length);

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const trackable = milestones.length;
  const journeyProgress =
    stage === "alta_rehub"
      ? 100
      : Math.round((milestones.filter((m) => m.done).length / trackable) * 100);

  return {
    stage,
    stageDef: STAGES[stage],
    daysSinceDischarge: daysSince(snap.dischargeDate, now),
    signals,
    recoveryIndex,
    milestones,
    pending,
    alerts: computeAlerts(snap, now, { adherence, mood, stageIndex }),
    journeyProgress,
  };
}

/**
 * Las alertas que el médico recibe (BR-11). Salen de las mismas señales que ve
 * el paciente: es el mismo dato leído desde los dos lados, que es lo que
 * permite avisar «sin depender del reporte verbal del paciente en la próxima
 * consulta» (tesis.txt:366).
 */
function computeAlerts(
  snap: PatientSnapshot,
  now: Date,
  ctx: { adherence: number | null; mood: number | null; stageIndex: number }
): JourneyAlert[] {
  const alerts: JourneyAlert[] = [];

  if (ctx.adherence !== null && ctx.adherence < 70) {
    alerts.push({
      id: "adherencia_baja",
      severity: ctx.adherence < 50 ? "alta" : "media",
      label: "Adherencia por debajo del umbral",
      detail: `${ctx.adherence} % de las dosis en 14 días`,
    });
  }

  const silent = daysWithoutRecording(snap.medications, snap.doseLog, now);
  if (silent >= 3) {
    alerts.push({
      id: "sin_registro",
      severity: silent >= 7 ? "alta" : "media",
      label: "Sin registrar dosis",
      detail: `${silent} días seguidos sin marcar`,
    });
  }

  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const missed = snap.appointments.filter(
    (a) => isMissed(a, now) && new Date(a.datetime) >= twoWeeksAgo
  );
  if (missed.length > 0) {
    alerts.push({
      id: "cita_perdida",
      severity: missed.length >= 2 ? "alta" : "media",
      label: missed.length >= 2 ? "Terapias perdidas" : "Terapia perdida",
      detail: `${missed.length} cita${missed.length > 1 ? "s" : ""} sin asistir en 14 días`,
    });
  }

  if (ctx.mood !== null && ctx.mood < 40) {
    alerts.push({
      id: "animo_bajo",
      severity: ctx.mood < 25 ? "alta" : "media",
      label: "Ánimo bajo sostenido",
      detail: "Registros emocionales por debajo del umbral",
    });
  }

  // Sigue en la etapa de ingreso un mes después del alta: no arrancó.
  const days = daysSince(snap.dischargeDate, now);
  if (days !== null && days >= 30 && ctx.stageIndex === 0) {
    alerts.push({
      id: "estancamiento",
      severity: "alta",
      label: "Sin arrancar el tratamiento",
      detail: `${days} días desde el alta y sigue en la etapa de ingreso`,
    });
  }

  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "alta" ? -1 : 1));
}

export function daysSince(isoDate: string | undefined, now: Date): number | null {
  if (!isoDate) return null;
  const then = new Date(isoDate.length <= 10 ? `${isoDate}T12:00` : isoDate);
  if (Number.isNaN(then.getTime())) return null;
  const ms = now.getTime() - then.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Lo que toca hoy: dosis pendientes y próxima cita. Alimenta el dashboard. */
export function upcomingAppointments(snap: PatientSnapshot, now: Date): Appointment[] {
  return snap.appointments.filter((a) => isUpcoming(a, now));
}
