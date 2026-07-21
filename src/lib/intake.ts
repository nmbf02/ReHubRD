/**
 * Conversational intake: a few questions about the person's real situation
 * (support, money, mobility, insurance, mood) → tailored suggestions that point
 * to REAL destinations already in the app. On-device, zero-cost. The "apoyo
 * para tu cirugía" suggestion is a Fase-3 preview (crowdfunding), shown as
 * "próximamente" — no money is moved here.
 */

import { ROUTES, hrefResourcesHash } from "@/lib/routes";

export type IntakeId = "apoyo" | "dinero" | "movilidad" | "seguro" | "animo";

export const INTAKE_QUESTIONS: { id: IntakeId; options: string[] }[] = [
  { id: "apoyo", options: ["si", "poco", "no"] },
  { id: "dinero", options: ["si", "dificil", "no"] },
  { id: "movilidad", options: ["si", "dificil", "no"] },
  { id: "seguro", options: ["si", "nose", "no"] },
  { id: "animo", options: ["bien", "bajo", "muymal"] },
];

export type IntakeAnswers = Partial<Record<IntakeId, string>>;

export type SuggestionTone = "normal" | "urgent" | "free" | "soon";

export interface IntakeSuggestion {
  id: string;
  tone: SuggestionTone;
  href?: string;
  tel?: string;
}

/** Map the answers to concrete, real suggestions (most urgent first). */
export function suggestionsFor(answers: IntakeAnswers): IntakeSuggestion[] {
  const out: IntakeSuggestion[] = [];

  if (answers.animo === "muymal") {
    out.push({ id: "emergencia-emocional", tone: "urgent", tel: "811" });
  }
  if (answers.apoyo === "no" || answers.apoyo === "poco") {
    out.push({ id: "circulo", tone: "normal", href: ROUTES.dashboard });
  }
  if (answers.dinero === "no") {
    out.push({ id: "ayuda-gratuita", tone: "free", href: hrefResourcesHash("ayuda-gratuita") });
    out.push({ id: "apoyo-cirugia", tone: "soon" });
  }
  if (answers.dinero === "dificil" || answers.dinero === "no") {
    out.push({ id: "farmacia-pueblo", tone: "free", href: ROUTES.medications });
  }
  if (answers.movilidad === "no" || answers.movilidad === "dificil") {
    out.push({ id: "transporte", tone: "normal", href: hrefResourcesHash("ayuda-gratuita") });
  }
  if (answers.seguro === "no" || answers.seguro === "nose") {
    out.push({ id: "seguro", tone: "normal", href: ROUTES.resources });
  }
  if (answers.animo === "bajo") {
    out.push({ id: "apoyo-emocional", tone: "normal", tel: "811" });
  }
  // Always useful next step
  out.push({ id: "mi-lesion", tone: "normal", href: ROUTES.care });

  return out;
}
