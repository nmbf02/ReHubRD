"use client";

/**
 * Perfil con el que se está usando ReHub. La tesis define cuatro (paciente,
 * familiar, profesional de salud, institución) y le cobra a tres de ellos, así
 * que el rol no es un detalle de permisos: decide qué producto estás usando.
 * Ver `docs/adr/0002-role-based-navigation.md` (BR-05).
 *
 * El familiar comparte el panel del paciente y queda fuera del MVP; el tipo ya
 * deja el hueco para añadirlo sin tocar el resto.
 */

export type RehubRole = "paciente" | "medico" | "institucion";

/** Tipo de institución aliada. Cada una compra un indicador distinto (BR-07). */
export type InstitutionKind = "ars" | "empresa" | "centro";

export interface RoleState {
  role: RehubRole;
  /** Solo aplica cuando `role === "institucion"`. */
  institution: InstitutionKind;
}

const STORAGE_KEY = "rehub-rol";
export const ROLE_UPDATED_EVENT = "rehub-rol-updated";

const DEFAULT: RoleState = { role: "paciente", institution: "ars" };

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function getRole(userId?: string | null): RoleState {
  if (typeof window === "undefined") return DEFAULT;
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return DEFAULT;
  try {
    const parsed = JSON.parse(raw) as Partial<RoleState>;
    return {
      role: isRole(parsed.role) ? parsed.role : DEFAULT.role,
      institution: isInstitution(parsed.institution) ? parsed.institution : DEFAULT.institution,
    };
  } catch {
    return DEFAULT;
  }
}

export function saveRole(state: RoleState, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(ROLE_UPDATED_EVENT));
}

function isRole(value: unknown): value is RehubRole {
  return value === "paciente" || value === "medico" || value === "institucion";
}

function isInstitution(value: unknown): value is InstitutionKind {
  return value === "ars" || value === "empresa" || value === "centro";
}

/** Cómo se presenta cada rol en el selector y en la cabecera del panel. */
export const ROLE_LABEL: Record<RehubRole, string> = {
  paciente: "Paciente",
  medico: "Profesional de salud",
  institucion: "Institución",
};

export const ROLE_TAGLINE: Record<RehubRole, string> = {
  paciente: "Tu recuperación, paso a paso",
  medico: "Tus pacientes, sin esperar a la próxima consulta",
  institucion: "Tu población, con datos de adherencia",
};

/**
 * Qué compra cada institución. La tesis es explícita: «cada aliado adquiere el
 * servicio porque mejora un indicador propio: adherencia, ocupación de agenda,
 * siniestralidad o ausentismo laboral» (BR-07). El panel abre por ahí.
 */
export interface InstitutionProfile {
  label: string;
  /** Cómo llama esta institución a las personas que sigue. */
  populationNoun: string;
  /** El indicador que justifica la licencia. */
  headlineMetric: string;
  headlineHelp: string;
  /** Plan y tarifa mensual con ITBIS, tal como la tabla 8 de la tesis (BR-08). */
  plan: string;
  monthlyFee: number;
}

export const INSTITUTION_PROFILE: Record<InstitutionKind, InstitutionProfile> = {
  ars: {
    label: "ARS / Aseguradora",
    populationNoun: "afiliados",
    headlineMetric: "Adherencia al tratamiento",
    headlineHelp:
      "Un afiliado que abandona la terapia alarga el siniestro y encarece el caso.",
    plan: "Plan ARS",
    monthlyFee: 59_000,
  },
  empresa: {
    label: "Empresa",
    populationNoun: "colaboradores",
    headlineMetric: "Retorno laboral",
    headlineHelp:
      "Cada semana de ausentismo evitada es costo directo que la empresa no paga.",
    plan: "Licencia corporativa",
    monthlyFee: 17_700,
  },
  centro: {
    label: "Centro de rehabilitación",
    populationNoun: "pacientes",
    headlineMetric: "Abandono de terapias",
    headlineHelp:
      "La silla vacía de una terapia perdida no se recupera: es agenda y es ingreso.",
    plan: "Plan Centro de rehabilitación",
    monthlyFee: 8_000,
  },
};

/** Tarifa del plan del médico tratante, tabla 8 de la tesis (BR-08). */
export const DOCTOR_PLAN = { label: "Médico Premium", monthlyFee: 590 } as const;

/** Comisión por cita reservada a través de ReHub (BR-17). Nunca la paga el paciente. */
export const BOOKING_COMMISSION = 177;
