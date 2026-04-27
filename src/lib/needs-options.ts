/**
 * Selectable need options for a personalized recovery flow.
 * Labels for the UI live in `messages/*.json` under `dashboard.needs.options`.
 */

import { hrefResourcesHash } from "@/lib/routes";

export interface OpcionNecesidad {
  id: string;
  emoji: string;
  /** Maps to MAPA_RECOMENDACIONES in plan-recomendaciones */
  necesidadId?: string;
  /** Maps to resources guide id (recursos?guia=X) */
  guiaId?: string;
  /** Direct link to a resources hash section */
  hrefDirecto?: string;
}

/** Need chips the user can toggle; display titles come from i18n */
export const OPCIONES_NECESIDADES: OpcionNecesidad[] = [
  { id: "apoyo-emocional", emoji: "💚", necesidadId: "emocional-ansiedad", guiaId: "apoyoEmocional" },
  { id: "no-puedo-caminar", emoji: "🦿", necesidadId: "movilidad", guiaId: "transporte" },
  { id: "sin-medicamentos", emoji: "💊", guiaId: "ayudaPagarMedicamentos" },
  { id: "estoy-sola", emoji: "🤝", necesidadId: "red-apoyo", guiaId: "sola" },
  { id: "transporte", emoji: "🚗", guiaId: "transporte" },
  { id: "medicamentos-delivery", emoji: "💊", guiaId: "medicamentos" },
  { id: "fisioterapia", emoji: "🦿", guiaId: "fisioterapia", hrefDirecto: hrefResourcesHash("planes-acogida") },
  { id: "tramites", emoji: "📋", necesidadId: "tramites", guiaId: "tramites" },
  { id: "accesibilidad", emoji: "🏠", necesidadId: "movilidad", guiaId: "accesibilidad" },
  { id: "derechos-laborales", emoji: "⚖️", necesidadId: "laboral-tramites", guiaId: "derechosLaborales" },
  { id: "dolor", emoji: "🩹", guiaId: "dolorCronico" },
  { id: "abrumado", emoji: "😓", guiaId: "abrumado" },
  { id: "volver-trabajo", emoji: "💼", necesidadId: "laboral-reinsercion", guiaId: "volverTrabajo" },
  { id: "cuidador", emoji: "👩‍⚕️", necesidadId: "asistencia", guiaId: "cuidador" },
  { id: "miedo-conducir", emoji: "🚙", guiaId: "miedoConducir" },
  { id: "ayuda-gratuita", emoji: "🎁", hrefDirecto: hrefResourcesHash("ayuda-gratuita") },
  { id: "planes-acogida", emoji: "🏠", hrefDirecto: hrefResourcesHash("planes-acogida") },
  { id: "asesoria-legal", emoji: "⚖️", guiaId: "asesoriaLegal" },
  { id: "segunda-opinion", emoji: "🩺", guiaId: "segundoDiagnostico" },
  { id: "problemas-dormir", emoji: "😴", guiaId: "problemasDormir" },
];

const STORAGE_KEY = "rehub-necesidades-seleccionadas";

export function getNecesidadesSeleccionadas(userId?: string): string[] {
  if (typeof window === "undefined") return [];
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNecesidadesSeleccionadas(
  ids: string[],
  userId?: string
): void {
  if (typeof window === "undefined") return;
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("rehub-necesidades-updated"));
}

export interface GuiaInline {
  orden: number;
  /** Matches `id` in `OPCIONES_NECESIDADES`; title from `dashboard.needs.options.{id}.label` */
  needOptionId: string;
  emoji: string;
  descripcion: string;
  pasos: string[];
  contactos?: { nombre: string; valor: string; tipo: "tel" | "web" | "otros" }[];
  nota?: string;
}

/** Inline guide body (descriptions and steps still sourced in TS; migrate to messages over time). */
export function getGuiaContenido(
  op: OpcionNecesidad,
  guiaFromRecursos?: { descripcion: string; pasos?: string[]; contactos?: { nombre: string; valor: string; tipo: "tel" | "web" | "otros" }[]; nota?: string }
): Omit<GuiaInline, "orden" | "needOptionId" | "emoji"> {
  if (guiaFromRecursos) {
    return {
      descripcion: guiaFromRecursos.descripcion,
      pasos: guiaFromRecursos.pasos ?? [],
      contactos: guiaFromRecursos.contactos,
      nota: guiaFromRecursos.nota,
    };
  }
  if (op.id === "ayuda-gratuita") {
    return {
      descripcion: "Servicios y programas sin costo en República Dominicana.",
      pasos: [
        "Líneas 811 y 809-200-1400: atención psicológica gratuita, confidencial.",
        "Promese/CAL y Pausam: medicamentos gratuitos en hospitales públicos.",
        "Hospitales y centros del MSP: consultas. ARS cubre según tu plan.",
        "Asociación Dominicana de Rehabilitación: 35 centros. Aceptan ARS.",
        "Comedores económicos, subsidios. Alcaldía, iglesias, organizaciones.",
        "Defensoría del Pueblo, IDOPPRIL para accidentes laborales.",
      ],
      contactos: [
        { nombre: "Salud mental", tipo: "tel", valor: "811" },
        { nombre: "Cuida tu Salud Mental", tipo: "tel", valor: "809-200-1400" },
        { nombre: "Emergencias", tipo: "tel", valor: "911" },
      ],
    };
  }
  if (op.id === "planes-acogida") {
    return {
      descripcion: "Programas de acompañamiento y reinserción post-accidente.",
      pasos: [
        "ADR (Asociación Dominicana de Rehabilitación): 35 centros. Terapia física, ocupacional, apoyo psicológico, inserción laboral. Tel: 809-689-7151, WhatsApp: 809-969-0565.",
        "ReHub: plan personalizado, check-ins y guías. Actualiza tu seguimiento.",
        "Grupos de apoyo: buscar en redes o pedir referencias en centros de salud.",
        "Iglesias y organizaciones comunitarias: acompañamiento.",
      ],
      contactos: [
        { nombre: "ADR", tipo: "tel", valor: "809-689-7151" },
      ],
    };
  }
  return { descripcion: "", pasos: [] };
}

/** Build inline guides for the custom flow from selected need ids */
export function buildGuiasParaFlujo(
  idsSeleccionados: string[],
  guiasMap: Record<string, { descripcion: string; pasos?: string[]; contactos?: { nombre: string; valor: string; tipo: "tel" | "web" | "otros" }[]; nota?: string }>
): GuiaInline[] {
  return idsSeleccionados
    .map((id, i) => {
      const op = OPCIONES_NECESIDADES.find((o) => o.id === id);
      if (!op) return null;
      const guia = op.guiaId ? guiasMap[op.guiaId] : undefined;
      const contenido = getGuiaContenido(op, guia);
      return {
        orden: i + 1,
        needOptionId: op.id,
        emoji: op.emoji,
        ...contenido,
      };
    })
    .filter((p): p is GuiaInline => p !== null);
}
