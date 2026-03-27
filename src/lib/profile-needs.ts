import type { PerfilRecuperacion } from "@/types/profile";

export interface NecesidadPrioritaria {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: "alta" | "media" | "baja";
}

/**
 * Identifica las necesidades prioritarias a partir del perfil de recuperación.
 * Basado en el flujo ReHub: diagnóstico social inicial.
 */
export function identificarNecesidades(
  perfil: PerfilRecuperacion
): NecesidadPrioritaria[] {
  const { estadoActual, contextoSocial } = perfil;
  const necesidades: NecesidadPrioritaria[] = [];

  // Estado emocional
  if (estadoActual.emotionalState === "ansiedad" || estadoActual.emotionalState === "estres") {
    necesidades.push({
      id: "emocional-ansiedad",
      titulo: "Apoyo emocional",
      descripcion: "Priorizar recursos y orientación para manejo de ansiedad y estrés.",
      prioridad: "alta",
    });
  }
  if (estadoActual.emotionalState === "tristeza") {
    necesidades.push({
      id: "emocional-tristeza",
      titulo: "Apoyo emocional",
      descripcion: "Orientación hacia recursos de acompañamiento psicológico o grupos de apoyo.",
      prioridad: "alta",
    });
  }

  // Movilidad
  if (estadoActual.mobilityLevel === "graves" || estadoActual.mobilityLevel === "moderadas") {
    necesidades.push({
      id: "movilidad",
      titulo: "Orientación logística y accesibilidad",
      descripcion: "Información sobre rehabilitación, desplazamiento y adaptaciones necesarias.",
      prioridad: "alta",
    });
  }
  if (estadoActual.mobilityLevel === "leves") {
    necesidades.push({
      id: "movilidad-leve",
      titulo: "Seguimiento de movilidad",
      descripcion: "Recomendaciones para mantener y mejorar la movilidad.",
      prioridad: "media",
    });
  }

  // Situación laboral
  if (contextoSocial.situacionLaboral === "incapacidad_temporal") {
    necesidades.push({
      id: "laboral-tramites",
      titulo: "Orientación sobre trámites laborales",
      descripcion: "Información sobre incapacidad, seguros y reintegración al trabajo.",
      prioridad: "alta",
    });
  }
  if (contextoSocial.situacionLaboral === "desempleado") {
    necesidades.push({
      id: "laboral-reinsercion",
      titulo: "Reinserción laboral",
      descripcion: "Orientación sobre opciones de reintegración y recursos disponibles.",
      prioridad: "media",
    });
  }

  // Red de apoyo
  if (contextoSocial.redApoyo === "limitada" || contextoSocial.redApoyo === "ninguna") {
    necesidades.push({
      id: "red-apoyo",
      titulo: "Red de apoyo social",
      descripcion: "Información sobre recursos comunitarios y redes de acompañamiento.",
      prioridad: "alta",
    });
  }

  // Estado físico
  if (estadoActual.physicalState === "requiere_asistencia") {
    necesidades.push({
      id: "asistencia",
      titulo: "Cuidados y asistencia",
      descripcion: "Orientación sobre servicios de atención domiciliaria o centros de apoyo.",
      prioridad: "alta",
    });
  }

  // Siempre incluir trámites como media
  necesidades.push({
    id: "tramites",
    titulo: "Trámites y documentación",
    descripcion: "Orientación sobre documentos médicos, seguros y otros trámites post-alta.",
    prioridad: "media",
  });

  // Ordenar: alta primero, luego media, luego baja
  const orden = { alta: 0, media: 1, baja: 2 };
  return necesidades.sort(
    (a, b) => orden[a.prioridad] - orden[b.prioridad]
  );
}
