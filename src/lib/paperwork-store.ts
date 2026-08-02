"use client";

/**
 * Módulo 4 — Trámites y seguros (BR-09). Responde a «uno de los vacíos más
 * señalados por los encuestados: la falta de orientación sobre los trámites
 * administrativos tras un accidente» (tesis.txt:363).
 *
 * El catálogo es dominicano a propósito (BR-18): ARS, SISALRIL, IDOPPRIL y la
 * póliza del vehículo. Es justo lo que las apps internacionales no contemplan
 * y una de las cuatro patas de la diferenciación del producto.
 */

import type { TipoAccidente, TipoSeguro } from "@/types/profile";

export type PaperworkStatus = "pendiente" | "en_proceso" | "resuelto" | "no_aplica";

export const PAPERWORK_STATUS_LABEL: Record<PaperworkStatus, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  no_aplica: "No aplica",
};

export interface PaperworkStepDef {
  id: string;
  label: string;
  help: string;
  /** Documento o dato que hay que tener a mano. */
  needs?: string;
  /** Días desde el accidente para no perder el derecho. */
  deadlineDays?: number;
  /** Si se omite, el paso aplica a todos. */
  onlyAccident?: TipoAccidente[];
  /** Si se omite, aplica a cualquier cobertura. */
  onlyInsurance?: TipoSeguro[];
}

/**
 * Pasos ordenados como los vive el paciente, no como los organiza la
 * aseguradora. Los plazos son los que se manejan habitualmente en el país y se
 * presentan como orientación, nunca como asesoría legal.
 */
export const PAPERWORK_STEPS: PaperworkStepDef[] = [
  {
    id: "reportar_ars",
    label: "Reportar el accidente a tu ARS",
    help: "Mientras más pronto abras el caso, menos te van a discutir después. Pide el número de reclamación y anótalo.",
    needs: "Cédula y número de afiliación",
    deadlineDays: 30,
  },
  {
    id: "acta_policial",
    label: "Conseguir el acta policial",
    help: "Sin el acta, la aseguradora del vehículo puede negarse a cubrir. Se solicita en el destacamento donde se levantó el caso.",
    needs: "Cédula y datos del accidente",
    deadlineDays: 15,
    onlyAccident: ["transito"],
  },
  {
    id: "notificar_riesgos",
    label: "Notificar el accidente laboral",
    help: "Tu empleador debe reportarlo al Seguro de Riesgos Laborales (IDOPPRIL). Si no lo hace, puedes notificarlo tú.",
    needs: "Carta o correo del empleador",
    deadlineDays: 3,
    onlyAccident: ["laboral"],
  },
  {
    id: "expediente_alta",
    label: "Reunir el expediente del alta",
    help: "Epicrisis, indicaciones médicas y estudios. Es el documento que sostiene todo lo demás: pide copia antes de salir del centro.",
    needs: "Epicrisis e indicaciones",
  },
  {
    id: "autorizacion_terapias",
    label: "Solicitar autorización para las terapias",
    help: "Casi ninguna ARS cubre fisioterapia sin autorización previa. Se pide con la indicación del médico tratante.",
    needs: "Indicación médica con diagnóstico",
  },
  {
    id: "subsidio",
    label: "Solicitar el subsidio por discapacidad temporal",
    help: "Si estás de baja, te corresponde un subsidio mientras dure la incapacidad. Se gestiona a través de tu empleador ante la ARS.",
    needs: "Certificado médico de incapacidad",
    onlyAccident: ["laboral", "transito"],
  },
  {
    id: "guardar_gastos",
    label: "Guardar facturas y recibos",
    help: "Todo lo que pagaste de tu bolsillo (medicamentos, transporte, terapias) puede reembolsarse. Sin el papel, no existe.",
    needs: "Facturas con NCF",
  },
  {
    id: "reclamacion",
    label: "Presentar la reclamación de reembolso",
    help: "Se entrega el expediente completo. Pide constancia de recibido: es lo que te permite reclamar si se pasan del plazo.",
    needs: "Expediente y facturas",
    deadlineDays: 60,
  },
  {
    id: "seguimiento",
    label: "Dar seguimiento a la reclamación",
    help: "Con el número de caso puedes preguntar en qué va. Si te la niegan, tienes derecho a que te expliquen por escrito.",
    needs: "Número de reclamación",
  },
];

export interface PaperworkState {
  /** `stepId` → estado. Lo que no está aquí se considera pendiente. */
  status: Record<string, PaperworkStatus>;
  /** `stepId` → nota libre del paciente (número de caso, con quién habló…). */
  notes: Record<string, string>;
  updatedAt: string;
}

const STORAGE_KEY = "rehub-tramites";
export const PAPERWORK_UPDATED_EVENT = "rehub-tramites-updated";

const EMPTY: PaperworkState = { status: {}, notes: {}, updatedAt: "" };

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function getPaperwork(userId?: string | null): PaperworkState {
  if (typeof window === "undefined") return EMPTY;
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<PaperworkState>;
    return {
      status: parsed.status ?? {},
      notes: parsed.notes ?? {},
      updatedAt: parsed.updatedAt ?? "",
    };
  } catch {
    return EMPTY;
  }
}

export function savePaperwork(state: PaperworkState, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(PAPERWORK_UPDATED_EVENT));
}

export function setStepStatus(
  stepId: string,
  status: PaperworkStatus,
  userId?: string | null
): PaperworkState {
  const current = getPaperwork(userId);
  const next: PaperworkState = {
    ...current,
    status: { ...current.status, [stepId]: status },
    updatedAt: new Date().toISOString(),
  };
  savePaperwork(next, userId);
  return next;
}

export function setStepNote(stepId: string, note: string, userId?: string | null): PaperworkState {
  const current = getPaperwork(userId);
  const next: PaperworkState = {
    ...current,
    notes: { ...current.notes, [stepId]: note },
    updatedAt: new Date().toISOString(),
  };
  savePaperwork(next, userId);
  return next;
}

/** Los pasos que le tocan a esta persona, según su accidente y su cobertura. */
export function applicableSteps(
  accident: TipoAccidente | undefined,
  insurance: TipoSeguro | undefined
): PaperworkStepDef[] {
  return PAPERWORK_STEPS.filter((step) => {
    if (step.onlyAccident && accident && !step.onlyAccident.includes(accident)) return false;
    if (step.onlyInsurance && insurance && !step.onlyInsurance.includes(insurance)) return false;
    return true;
  });
}

/**
 * Avance administrativo 0–100 sobre los pasos que de verdad aplican. Los
 * marcados "no aplica" salen del denominador — no son un fracaso, son un paso
 * que a esta persona no le toca. `null` mientras no se haya tocado ninguno.
 */
export function paperworkScore(
  steps: PaperworkStepDef[],
  state: PaperworkState
): number | null {
  const relevant = steps.filter((s) => (state.status[s.id] ?? "pendiente") !== "no_aplica");
  if (relevant.length === 0) return null;
  const touched = relevant.some((s) => (state.status[s.id] ?? "pendiente") !== "pendiente");
  if (!touched) return null;
  const points = relevant.reduce((sum, s) => {
    const status = state.status[s.id] ?? "pendiente";
    if (status === "resuelto") return sum + 1;
    if (status === "en_proceso") return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((points / relevant.length) * 100);
}
