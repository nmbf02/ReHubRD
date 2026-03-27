/**
 * Opciones seleccionables para crear un flujo personalizado.
 * El usuario elige sus necesidades y ReHub genera un plan adaptado.
 */

export interface OpcionNecesidad {
  id: string;
  titulo: string;
  emoji: string;
  /** Mapea a MAPA_RECOMENDACIONES en plan-recomendaciones */
  necesidadId?: string;
  /** Mapea a guía en recursos (recursos?guia=X) */
  guiaId?: string;
  /** Para enlace directo a sección (recursos#X) */
  hrefDirecto?: string;
}

/** 18 opciones para que el usuario seleccione sus necesidades */
export const OPCIONES_NECESIDADES: OpcionNecesidad[] = [
  { id: "apoyo-emocional", titulo: "Necesito apoyo emocional", emoji: "💚", necesidadId: "emocional-ansiedad", guiaId: "apoyoEmocional" },
  { id: "no-puedo-caminar", titulo: "No puedo caminar / Movilidad reducida", emoji: "🦿", necesidadId: "movilidad", guiaId: "transporte" },
  { id: "sin-medicamentos", titulo: "No tengo medicamentos", emoji: "💊", guiaId: "ayudaPagarMedicamentos" },
  { id: "estoy-sola", titulo: "Estoy sola o solo", emoji: "🤝", necesidadId: "red-apoyo", guiaId: "sola" },
  { id: "transporte", titulo: "Necesito transporte", emoji: "🚗", guiaId: "transporte" },
  { id: "medicamentos-delivery", titulo: "Necesito conseguir medicamentos", emoji: "💊", guiaId: "medicamentos" },
  { id: "fisioterapia", titulo: "Fisioterapia o rehabilitación", emoji: "🦿", guiaId: "fisioterapia", hrefDirecto: "/dashboard/resources#planes-acogida" },
  { id: "tramites", titulo: "Trámites y documentos", emoji: "📋", necesidadId: "tramites", guiaId: "tramites" },
  { id: "accesibilidad", titulo: "Accesibilidad en casa", emoji: "🏠", necesidadId: "movilidad", guiaId: "accesibilidad" },
  { id: "derechos-laborales", titulo: "Derechos laborales", emoji: "⚖️", necesidadId: "laboral-tramites", guiaId: "derechosLaborales" },
  { id: "dolor", titulo: "Me duele mucho", emoji: "🩹", guiaId: "dolorCronico" },
  { id: "abrumado", titulo: "Me siento abrumado", emoji: "😓", guiaId: "abrumado" },
  { id: "volver-trabajo", titulo: "Quiero volver al trabajo", emoji: "💼", necesidadId: "laboral-reinsercion", guiaId: "volverTrabajo" },
  { id: "cuidador", titulo: "Necesito un cuidador", emoji: "👩‍⚕️", necesidadId: "asistencia", guiaId: "cuidador" },
  { id: "miedo-conducir", titulo: "Miedo a salir o conducir", emoji: "🚙", guiaId: "miedoConducir" },
  { id: "ayuda-gratuita", titulo: "Ayuda gratuita", emoji: "🎁", hrefDirecto: "/dashboard/resources#ayuda-gratuita" },
  { id: "planes-acogida", titulo: "Planes de acogida", emoji: "🏠", hrefDirecto: "/dashboard/resources#planes-acogida" },
  { id: "asesoria-legal", titulo: "Asesoría legal", emoji: "⚖️", guiaId: "asesoriaLegal" },
  { id: "segunda-opinion", titulo: "Segunda opinión médica", emoji: "🩺", guiaId: "segundoDiagnostico" },
  { id: "problemas-dormir", titulo: "Problemas para dormir", emoji: "😴", guiaId: "problemasDormir" },
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
  titulo: string;
  emoji: string;
  descripcion: string;
  pasos: string[];
  contactos?: { nombre: string; valor: string; tipo: "tel" | "web" | "otros" }[];
  nota?: string;
}

/** Obtiene el contenido de guía para mostrar inline (sin redirección) */
export function getGuiaContenido(
  op: OpcionNecesidad,
  guiaFromRecursos?: { descripcion: string; pasos?: string[]; contactos?: { nombre: string; valor: string; tipo: "tel" | "web" | "otros" }[]; nota?: string }
): Omit<GuiaInline, "orden" | "titulo" | "emoji"> {
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

/** Genera las guías completas para mostrar inline según las necesidades seleccionadas */
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
        titulo: op.titulo,
        emoji: op.emoji,
        ...contenido,
      };
    })
    .filter((p): p is GuiaInline => p !== null);
}
