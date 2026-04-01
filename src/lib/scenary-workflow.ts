/**
 * Flujos por escenario en ReHub.
 * Textos de UI viven en messages/data-scenarios.json (namespace data.scenarios).
 */

import type { PerfilRecuperacion } from "@/types/profile";
import { ROUTES, hrefResourcesGuide, hrefResourcesHash } from "@/lib/routes";

export type AccesoMedicamentos = "si" | "no" | "parcial" | "no_se";

export interface CondicionesCheckIn {
  bienestar: number;
  nivelMovilidad: string;
  accesoMedicamentos?: AccesoMedicamentos;
  redApoyo?: string;
  estadoEmocional?: string;
}

/** Solo estructura (href, orden). Copy: data.scenarios.{id}.pasos[i] */
export interface PasoFlujo {
  orden: number;
  href?: string;
  urgente?: boolean;
}

export interface FlujoEscenario {
  id: string;
  emoji: string;
  prioridad: "urgente" | "alta" | "media" | "normal";
  pasos: PasoFlujo[];
  contactosDirectos?: { numero: string }[];
}

const ESCENARIOS: FlujoEscenario[] = [
  {
    id: "urgente-mal-sin-medicamentos",
    emoji: "🚨",
    prioridad: "urgente",
    pasos: [
      { orden: 1, href: "tel:811", urgente: true },
      {
        orden: 2,
        href: hrefResourcesGuide("ayudaPagarMedicamentos"),
        urgente: true,
      },
      { orden: 3, href: hrefResourcesGuide("sola") },
      { orden: 4, href: hrefResourcesHash("ayuda-gratuita") },
      { orden: 5, href: ROUTES.followup },
    ],
    contactosDirectos: [
      { numero: "811" },
      { numero: "809-200-1400" },
      { numero: "911" },
    ],
  },
  {
    id: "mal-sin-medicamentos",
    emoji: "⚠️",
    prioridad: "alta",
    pasos: [
      { orden: 1, href: "tel:811", urgente: true },
      { orden: 2, href: hrefResourcesGuide("ayudaPagarMedicamentos") },
      { orden: 3, href: hrefResourcesHash("ayuda-gratuita") },
      { orden: 4, href: ROUTES.followup },
    ],
  },
  {
    id: "no-puedo-caminar",
    emoji: "🦿",
    prioridad: "alta",
    pasos: [
      { orden: 1, href: "tel:8096897151" },
      { orden: 2, href: hrefResourcesGuide("transporte") },
      { orden: 3, href: hrefResourcesGuide("accesibilidad") },
      { orden: 4, href: hrefResourcesHash("planes-acogida") },
    ],
  },
  {
    id: "sin-medicamentos-ok",
    emoji: "💊",
    prioridad: "media",
    pasos: [
      { orden: 1, href: hrefResourcesGuide("ayudaPagarMedicamentos") },
      { orden: 2, href: hrefResourcesGuide("medicamentos") },
      { orden: 3, href: ROUTES.followup },
    ],
  },
  {
    id: "me-siento-mal-movilidad-ok",
    emoji: "💚",
    prioridad: "alta",
    pasos: [
      { orden: 1, href: "tel:811", urgente: true },
      { orden: 2, href: hrefResourcesGuide("apoyoEmocional") },
      { orden: 3, href: ROUTES.followup },
    ],
  },
  {
    id: "estoy-sola-o-solo",
    emoji: "🤝",
    prioridad: "alta",
    pasos: [
      { orden: 1, href: "tel:8092001400", urgente: true },
      { orden: 2, href: hrefResourcesGuide("sola") },
      { orden: 3, href: ROUTES.profile },
      { orden: 4, href: hrefResourcesHash("planes-acogida") },
    ],
  },
  {
    id: "dolor-cronico",
    emoji: "🩹",
    prioridad: "alta",
    pasos: [
      { orden: 1, href: hrefResourcesGuide("segundoDiagnostico") },
      { orden: 2, href: hrefResourcesGuide("dolorCronico") },
      { orden: 3, href: hrefResourcesGuide("fisioterapia") },
    ],
  },
  {
    id: "general",
    emoji: "📋",
    prioridad: "normal",
    pasos: [
      { orden: 1, href: ROUTES.plan },
      { orden: 2, href: ROUTES.resources },
      { orden: 3, href: ROUTES.followup },
    ],
  },
];

export function identificarEscenario(
  condiciones: CondicionesCheckIn
): FlujoEscenario {
  const { bienestar, nivelMovilidad, accesoMedicamentos, redApoyo } =
    condiciones;

  if (
    bienestar <= 2 &&
    (nivelMovilidad === "moderadas" || nivelMovilidad === "graves") &&
    (accesoMedicamentos === "no" || accesoMedicamentos === "parcial")
  ) {
    return ESCENARIOS.find((e) => e.id === "urgente-mal-sin-medicamentos")!;
  }

  if (bienestar <= 2 && accesoMedicamentos === "no") {
    return ESCENARIOS.find((e) => e.id === "mal-sin-medicamentos")!;
  }

  if (
    bienestar <= 2 &&
    nivelMovilidad !== "graves" &&
    nivelMovilidad !== "moderadas"
  ) {
    return ESCENARIOS.find((e) => e.id === "me-siento-mal-movilidad-ok")!;
  }

  if (nivelMovilidad === "graves" || nivelMovilidad === "moderadas") {
    return ESCENARIOS.find((e) => e.id === "no-puedo-caminar")!;
  }

  if (
    (accesoMedicamentos === "no" || accesoMedicamentos === "parcial") &&
    bienestar >= 3
  ) {
    return ESCENARIOS.find((e) => e.id === "sin-medicamentos-ok")!;
  }

  if (redApoyo === "limitada" || redApoyo === "ninguna") {
    return ESCENARIOS.find((e) => e.id === "estoy-sola-o-solo")!;
  }

  return ESCENARIOS.find((e) => e.id === "general")!;
}

export function identificarEscenarioDesdePerfil(
  perfil: PerfilRecuperacion
): FlujoEscenario {
  const nivelMovilidad = perfil.estadoActual?.mobilityLevel ?? "leves";
  const redApoyo = perfil.contextoSocial?.redApoyo ?? "moderada";
  const estadoEmocional = perfil.estadoActual?.emotionalState ?? "bien";

  if (
    (estadoEmocional === "ansiedad" ||
      estadoEmocional === "tristeza" ||
      estadoEmocional === "estres") &&
    (nivelMovilidad === "graves" || nivelMovilidad === "moderadas")
  ) {
    return ESCENARIOS.find((e) => e.id === "urgente-mal-sin-medicamentos")!;
  }

  if (nivelMovilidad === "graves" || nivelMovilidad === "moderadas") {
    return ESCENARIOS.find((e) => e.id === "no-puedo-caminar")!;
  }

  if (
    estadoEmocional === "ansiedad" ||
    estadoEmocional === "tristeza" ||
    estadoEmocional === "estres"
  ) {
    return ESCENARIOS.find((e) => e.id === "me-siento-mal-movilidad-ok")!;
  }

  if (redApoyo === "limitada" || redApoyo === "ninguna") {
    return ESCENARIOS.find((e) => e.id === "estoy-sola-o-solo")!;
  }

  return ESCENARIOS.find((e) => e.id === "general")!;
}

export { ESCENARIOS };
