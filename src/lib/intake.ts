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

/** Keywords (accent-free) that map a spoken answer to an option, per question. */
const KEYWORDS: Record<IntakeId, Record<string, string[]>> = {
  apoyo: {
    si: ["si", "tengo", "apoyo", "familia", "claro", "cuentan"],
    poco: ["poco", "algo", "mas o menos", "masomenos", "regular", "a veces"],
    no: ["no", "solo", "sola", "nadie", "ninguno", "ninguna"],
  },
  dinero: {
    si: ["si", "puedo", "tengo", "cubro"],
    dificil: ["dificil", "apenas", "cuesta", "ajustado", "un poco"],
    no: ["no", "no puedo", "no tengo", "sin dinero", "nada", "imposible"],
  },
  movilidad: {
    si: ["si", "puedo", "camino", "salgo", "muevo"],
    dificil: ["dificil", "apenas", "cuesta", "con ayuda", "un poco"],
    no: ["no", "no puedo", "no salgo", "cama", "silla", "encerrado", "encerrada"],
  },
  seguro: {
    si: ["si", "tengo", "ars", "senasa", "seguro"],
    nose: ["no se", "no estoy segura", "no estoy seguro", "quizas", "creo", "tal vez"],
    no: ["no", "no tengo", "ninguno", "sin seguro"],
  },
  animo: {
    bien: ["bien", "tranquil", "normal", "estable", "mejor"],
    bajo: ["ansios", "triste", "preocupad", "nervios", "bajon", "regular"],
    muymal: ["muy mal", "terrible", "fatal", "peor", "desesperad", "no puedo mas", "horrible"],
  },
};

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Best-effort match of a spoken transcript to one of the question's options. */
export function matchOption(id: IntakeId, transcript: string): string | null {
  const haystack = " " + normalize(transcript).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ") + " ";
  let best: string | null = null;
  let bestLen = 0;
  for (const [option, keywords] of Object.entries(KEYWORDS[id])) {
    for (const kw of keywords) {
      const needle = kw.length <= 3 ? " " + kw + " " : kw;
      if (haystack.includes(needle) && kw.length > bestLen) {
        best = option;
        bestLen = kw.length;
      }
    }
  }
  return best;
}

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
