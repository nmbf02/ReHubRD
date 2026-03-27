/**
 * Flujos por escenario en ReHub.
 * Cuando indicas: "me siento mal", "no puedo caminar", "no tengo medicamentos", etc.,
 * ReHub te ofrece un plan y seguimiento adaptados.
 */

import type { PerfilRecuperacion } from "@/types/profile";

export type AccesoMedicamentos = "si" | "no" | "parcial" | "no_se";

export interface CondicionesCheckIn {
  bienestar: number;
  nivelMovilidad: string;
  accesoMedicamentos?: AccesoMedicamentos;
  redApoyo?: string;
  estadoEmocional?: string;
}

export interface PasoFlujo {
  orden: number;
  titulo: string;
  descripcion: string;
  href?: string;
  accion: string;
  urgente?: boolean;
}

export interface FlujoEscenario {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  prioridad: "urgente" | "alta" | "media" | "normal";
  frecuenciaSeguimiento: string;
  pasos: PasoFlujo[];
  contactosDirectos?: { nombre: string; numero: string }[];
}

const ESCENARIOS: FlujoEscenario[] = [
  {
    id: "urgente-mal-sin-medicamentos",
    nombre: "Me siento mal, no puedo caminar y no tengo medicamentos",
    descripcion: "Situación crítica: bajo bienestar, movilidad limitada y sin acceso a medicamentos.",
    emoji: "🚨",
    prioridad: "urgente",
    frecuenciaSeguimiento: "Check-in en 2-3 días. Si empeora, busca ayuda ahora.",
    pasos: [
      {
        orden: 1,
        titulo: "Habla con alguien ahora",
        descripcion: "Líneas gratuitas: 811 y 809-200-1400. Psicólogos y orientadores disponibles.",
        href: "tel:811",
        accion: "Llamar 811",
        urgente: true,
      },
      {
        orden: 2,
        titulo: "Conseguir medicamentos",
        descripcion: "Promese/CAL y hospitales públicos ofrecen medicamentos gratuitos. Pregunta en tu centro de salud más cercano.",
        href: "/dashboard/resources?guia=ayudaPagarMedicamentos",
        accion: "Ver guía medicamentos",
        urgente: true,
      },
      {
        orden: 3,
        titulo: "Transporte y acompañamiento",
        descripcion: "Si estás sola o solo: Movep, familia, vecinos. Pide ayuda para llegar al centro de salud o farmacia.",
        href: "/dashboard/resources?guia=sola",
        accion: "Ver guía estoy sola/o",
      },
      {
        orden: 4,
        titulo: "Ayuda gratuita",
        descripcion: "Revisa programas sin costo: 811, Promese/CAL, ADR, comedores económicos.",
        href: "/dashboard/resources#ayuda-gratuita",
        accion: "Ver ayuda gratuita",
      },
      {
        orden: 5,
        titulo: "Próximo check-in",
        descripcion: "Registra tu estado en 2-3 días para ajustar el plan.",
        href: "/dashboard/followup",
        accion: "Actualizar seguimiento",
      },
    ],
    contactosDirectos: [
      { nombre: "Salud mental", numero: "811" },
      { nombre: "Cuida tu Salud Mental", numero: "809-200-1400" },
      { nombre: "Emergencias", numero: "911" },
    ],
  },
  {
    id: "mal-sin-medicamentos",
    nombre: "Me siento mal y no tengo medicamentos",
    descripcion: "Bienestar bajo y sin acceso a tratamiento.",
    emoji: "⚠️",
    prioridad: "alta",
    frecuenciaSeguimiento: "Check-in en 3-5 días.",
    pasos: [
      {
        orden: 1,
        titulo: "Apoyo emocional",
        descripcion: "811 y 809-200-1400: atención psicológica gratuita.",
        href: "tel:811",
        accion: "Llamar 811",
        urgente: true,
      },
      {
        orden: 2,
        titulo: "Medicamentos sin costo",
        descripcion: "Promese/CAL, programas en hospitales públicos. Pregunta en tu centro de salud.",
        href: "/dashboard/resources?guia=ayudaPagarMedicamentos",
        accion: "Ver guía",
      },
      {
        orden: 3,
        titulo: "Ayuda gratuita",
        descripcion: "Recursos sin costo en República Dominicana.",
        href: "/dashboard/resources#ayuda-gratuita",
        accion: "Ver recursos",
      },
      {
        orden: 4,
        titulo: "Seguimiento",
        descripcion: "Actualiza en unos días.",
        href: "/dashboard/followup",
        accion: "Registrar check-in",
      },
    ],
  },
  {
    id: "no-puedo-caminar",
    nombre: "No puedo caminar o tengo movilidad muy limitada",
    descripcion: "Necesitas rehabilitación, transporte y adaptaciones.",
    emoji: "🦿",
    prioridad: "alta",
    frecuenciaSeguimiento: "Check-in semanal.",
    pasos: [
      {
        orden: 1,
        titulo: "Rehabilitación (ADR)",
        descripcion: "35 centros en RD. Terapia física, ocupacional, apoyo psicológico. Tel: 809-689-7151.",
        href: "tel:8096897151",
        accion: "Llamar ADR",
      },
      {
        orden: 2,
        titulo: "Transporte",
        descripcion: "Movep, OMSA, familia. Planifica traslados con anticipación.",
        href: "/dashboard/resources?guia=transporte",
        accion: "Ver guía transporte",
      },
      {
        orden: 3,
        titulo: "Accesibilidad en casa",
        descripcion: "Barras de apoyo, iluminación, eliminar obstáculos.",
        href: "/dashboard/resources?guia=accesibilidad",
        accion: "Ver guía accesibilidad",
      },
      {
        orden: 4,
        titulo: "Planes de acogida",
        descripcion: "Programas de acompañamiento y reinserción.",
        href: "/dashboard/resources#planes-acogida",
        accion: "Ver planes",
      },
    ],
  },
  {
    id: "sin-medicamentos-ok",
    nombre: "No tengo medicamentos pero me siento estable",
    descripcion: "Prioridad: conseguir tratamiento. Tu estado emocional es estable.",
    emoji: "💊",
    prioridad: "media",
    frecuenciaSeguimiento: "Check-in en 1 semana.",
    pasos: [
      {
        orden: 1,
        titulo: "Ayuda para pagar medicamentos",
        descripcion: "Promese/CAL, centros de salud, programas sociales.",
        href: "/dashboard/resources?guia=ayudaPagarMedicamentos",
        accion: "Ver guía",
      },
      {
        orden: 2,
        titulo: "Opciones de delivery",
        descripcion: "PedidosYa, farmacias con envío a domicilio.",
        href: "/dashboard/resources?guia=medicamentos",
        accion: "Ver guía medicamentos",
      },
      {
        orden: 3,
        titulo: "Seguimiento",
        descripcion: "Actualiza cuando consigas o si cambia tu situación.",
        href: "/dashboard/followup",
        accion: "Registrar check-in",
      },
    ],
  },
  {
    id: "me-siento-mal-movilidad-ok",
    nombre: "Me siento mal pero puedo moverme",
    descripcion: "Prioridad: apoyo emocional. Tu movilidad permite desplazarte.",
    emoji: "💚",
    prioridad: "alta",
    frecuenciaSeguimiento: "Check-in en 3-5 días.",
    pasos: [
      {
        orden: 1,
        titulo: "Hablar con alguien",
        descripcion: "811 y 809-200-1400: confidencial, gratuito.",
        href: "tel:811",
        accion: "Llamar 811",
        urgente: true,
      },
      {
        orden: 2,
        titulo: "Apoyo emocional",
        descripcion: "Recursos y técnicas para manejar ansiedad, estrés, tristeza.",
        href: "/dashboard/resources?guia=apoyoEmocional",
        accion: "Ver guía",
      },
      {
        orden: 3,
        titulo: "Seguimiento",
        descripcion: "Actualiza en unos días para ajustar el plan.",
        href: "/dashboard/followup",
        accion: "Registrar check-in",
      },
    ],
  },
  {
    id: "estoy-sola-o-solo",
    nombre: "Estoy sola o solo y necesito apoyo",
    descripcion: "Red de apoyo limitada. Necesitas orientación y recursos.",
    emoji: "🤝",
    prioridad: "alta",
    frecuenciaSeguimiento: "Check-in semanal.",
    pasos: [
      {
        orden: 1,
        titulo: "Líneas de ayuda",
        descripcion: "809-200-1400 y 811. No estás sola. Habla con alguien.",
        href: "tel:8092001400",
        accion: "Llamar",
        urgente: true,
      },
      {
        orden: 2,
        titulo: "Guía: Estoy sola o solo",
        descripcion: "Recursos, vecinos, organizaciones comunitarias.",
        href: "/dashboard/resources?guia=sola",
        accion: "Ver guía",
      },
      {
        orden: 3,
        titulo: "Contacto de emergencia",
        descripcion: "Registra una persona de confianza en tu perfil.",
        href: "/dashboard/profile",
        accion: "Completar perfil",
      },
      {
        orden: 4,
        titulo: "Planes de acogida",
        descripcion: "Programas de acompañamiento.",
        href: "/dashboard/resources#planes-acogida",
        accion: "Ver planes",
      },
    ],
  },
  {
    id: "dolor-cronico",
    nombre: "El dolor no me deja",
    descripcion: "Dolor persistente que afecta tu día a día.",
    emoji: "🩹",
    prioridad: "alta",
    frecuenciaSeguimiento: "Check-in semanal.",
    pasos: [
      {
        orden: 1,
        titulo: "Consulta con tu médico",
        descripcion: "Revisar tratamiento. Segunda opinión si lo necesitas.",
        href: "/dashboard/resources?guia=segundoDiagnostico",
        accion: "Ver guía",
      },
      {
        orden: 2,
        titulo: "Guía: Dolor crónico",
        descripcion: "Opciones y recursos para manejar el dolor.",
        href: "/dashboard/resources?guia=dolorCronico",
        accion: "Ver guía",
      },
      {
        orden: 3,
        titulo: "Fisioterapia y rehabilitación",
        descripcion: "ADR y centros de salud pueden ayudar.",
        href: "/dashboard/resources?guia=fisioterapia",
        accion: "Ver recursos",
      },
    ],
  },
  {
    id: "general",
    nombre: "Seguimiento general",
    descripcion: "Tu situación requiere acompañamiento continuo.",
    emoji: "📋",
    prioridad: "normal",
    frecuenciaSeguimiento: "Check-in semanal.",
    pasos: [
      {
        orden: 1,
        titulo: "Revisar tu plan",
        descripcion: "Recomendaciones según tu perfil.",
        href: "/dashboard/plan",
        accion: "Ver mi plan",
      },
      {
        orden: 2,
        titulo: "Recursos",
        descripcion: "24 guías para distintas situaciones.",
        href: "/dashboard/resources",
        accion: "Explorar recursos",
      },
      {
        orden: 3,
        titulo: "Seguimiento",
        descripcion: "Actualiza tu estado regularmente.",
        href: "/dashboard/followup",
        accion: "Registrar check-in",
      },
    ],
  },
];

/**
 * Detecta qué escenario aplica según las condiciones del check-in (y opcionalmente perfil).
 */
export function identificarEscenario(
  condiciones: CondicionesCheckIn
): FlujoEscenario {
  const { bienestar, nivelMovilidad, accesoMedicamentos, redApoyo } =
    condiciones;

  // Urgente: mal + no caminar + sin medicamentos
  if (
    bienestar <= 2 &&
    (nivelMovilidad === "moderadas" || nivelMovilidad === "graves") &&
    (accesoMedicamentos === "no" || accesoMedicamentos === "parcial")
  ) {
    return ESCENARIOS.find((e) => e.id === "urgente-mal-sin-medicamentos")!;
  }

  // Mal + sin medicamentos (aunque pueda caminar)
  if (bienestar <= 2 && accesoMedicamentos === "no") {
    return ESCENARIOS.find((e) => e.id === "mal-sin-medicamentos")!;
  }

  // Mal + movilidad OK
  if (bienestar <= 2 && nivelMovilidad !== "graves" && nivelMovilidad !== "moderadas") {
    return ESCENARIOS.find((e) => e.id === "me-siento-mal-movilidad-ok")!;
  }

  // No puedo caminar (movilidad grave/moderada)
  if (nivelMovilidad === "graves" || nivelMovilidad === "moderadas") {
    return ESCENARIOS.find((e) => e.id === "no-puedo-caminar")!;
  }

  // Sin medicamentos pero estable
  if (
    (accesoMedicamentos === "no" || accesoMedicamentos === "parcial") &&
    bienestar >= 3
  ) {
    return ESCENARIOS.find((e) => e.id === "sin-medicamentos-ok")!;
  }

  // Estoy sola/o
  if (redApoyo === "limitada" || redApoyo === "ninguna") {
    return ESCENARIOS.find((e) => e.id === "estoy-sola-o-solo")!;
  }

  return ESCENARIOS.find((e) => e.id === "general")!;
}

/**
 * Identifica escenario solo con perfil (sin check-in reciente).
 */
export function identificarEscenarioDesdePerfil(perfil: PerfilRecuperacion): FlujoEscenario {
  const nivelMovilidad = perfil.estadoActual?.mobilityLevel ?? "leves";
  const redApoyo = perfil.contextoSocial?.redApoyo ?? "moderada";
  const estadoEmocional = perfil.estadoActual?.emotionalState ?? "bien";

  // Emocional bajo + movilidad limitada
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
