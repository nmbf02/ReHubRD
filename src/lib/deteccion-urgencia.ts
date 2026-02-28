/**
 * Detección de situación urgente o prioridad alta.
 * Casos: me siento mal + no puedo caminar + no tengo medicamentos, etc.
 */

import type { PerfilRecuperacion } from "@/types/perfil";
import type { CheckIn } from "./seguimiento-store";

export type NivelUrgencia = "urgente" | "alta" | "normal";

export type NecesidadInmediata =
  | "medicamentos"
  | "transporte"
  | "apoyo_emocional"
  | "estoy_sola"
  | "asistencia"
  | "dolor";

export interface SituacionDetectada {
  nivel: NivelUrgencia;
  motivos: string[];
  necesidadesInmediatas: NecesidadInmediata[];
  accionesPrimeras: { titulo: string; href: string; tipo: "tel" | "link" }[];
  guiasRecomendadas: { id: string; titulo: string; href: string }[];
}

const GUIAS_POR_NECESIDAD: Record<NecesidadInmediata, { id: string; titulo: string }> = {
  medicamentos: { id: "medicamentos", titulo: "Conseguir medicamentos" },
  transporte: { id: "transporte", titulo: "Ir a un lugar" },
  apoyo_emocional: { id: "apoyoEmocional", titulo: "Apoyo emocional" },
  estoy_sola: { id: "sola", titulo: "Estoy sola o solo" },
  asistencia: { id: "cuidador", titulo: "Necesito un cuidador" },
  dolor: { id: "dolorCronico", titulo: "El dolor no me deja" },
};

export function detectarSituacion(
  perfil: PerfilRecuperacion,
  ultimoCheckIn?: CheckIn | null
): SituacionDetectada {
  const motivos: string[] = [];
  const necesidades: NecesidadInmediata[] = [];
  const { estadoActual, contextoSocial } = perfil;

  // Bienestar muy bajo en último check-in
  const bienestarBajo = ultimoCheckIn && ultimoCheckIn.bienestar <= 2;
  if (bienestarBajo) {
    motivos.push("Bienestar muy bajo en tu último registro");
    necesidades.push("apoyo_emocional");
  }

  // No puede caminar / movilidad grave
  const movilidadGrave =
    estadoActual.nivelMovilidad === "graves" ||
    estadoActual.nivelMovilidad === "moderadas";
  if (movilidadGrave) {
    motivos.push("Movilidad reducida");
    if (!necesidades.includes("transporte")) necesidades.push("transporte");
  }

  // Requiere asistencia
  const requiereAsistencia = estadoActual.estadoFisico === "requiere_asistencia";
  if (requiereAsistencia) {
    motivos.push("Requiere asistencia");
    necesidades.push("asistencia");
  }

  // Estado emocional negativo
  const emocionalMal =
    estadoActual.estadoEmocional === "ansiedad" ||
    estadoActual.estadoEmocional === "estres" ||
    estadoActual.estadoEmocional === "tristeza";
  if (emocionalMal && !necesidades.includes("apoyo_emocional")) {
    necesidades.push("apoyo_emocional");
  }

  // Red de apoyo limitada o ninguna
  const sinRed =
    contextoSocial.redApoyo === "limitada" ||
    contextoSocial.redApoyo === "ninguna";
  if (sinRed) {
    motivos.push("Red de apoyo limitada");
    if (!necesidades.includes("estoy_sola")) necesidades.push("estoy_sola");
  }

  // Necesidades indicadas en el check-in
  const necesidadesCheckIn = ultimoCheckIn?.necesidadesAhora ?? [];
  necesidadesCheckIn.forEach((n) => {
    if (!necesidades.includes(n)) necesidades.push(n);
  });

  const notas = ultimoCheckIn?.notas?.toLowerCase() ?? "";
  if (notas.includes("medicamento") || notas.includes("medicamentos")) {
    if (!necesidades.includes("medicamentos")) necesidades.push("medicamentos");
  }
  if (notas.includes("dolor") || notas.includes("duele")) {
    if (!necesidades.includes("dolor")) necesidades.push("dolor");
  }

  // Calcular nivel
  const puntos =
    (bienestarBajo ? 2 : 0) +
    (movilidadGrave ? 1 : 0) +
    (requiereAsistencia ? 2 : 0) +
    (sinRed ? 1 : 0) +
    necesidades.length;

  let nivel: NivelUrgencia = "normal";
  if (puntos >= 4 || bienestarBajo) {
    nivel = "urgente";
  } else if (puntos >= 2 || necesidades.length >= 2) {
    nivel = "alta";
  }

  // Acciones primeras: siempre incluir líneas de ayuda si hay necesidad
  const accionesPrimeras: SituacionDetectada["accionesPrimeras"] = [];
  if (necesidades.length > 0) {
    accionesPrimeras.push(
      { titulo: "811 (salud mental)", href: "tel:811", tipo: "tel" },
      { titulo: "809-200-1400", href: "tel:8092001400", tipo: "tel" }
    );
  }
  if (nivel === "urgente") {
    accionesPrimeras.unshift({
      titulo: "911 (emergencias)",
      href: "tel:911",
      tipo: "tel",
    });
  }

  // Guías recomendadas según necesidades detectadas
  const guiasRecomendadas = [...new Set(necesidades)].map((n) => ({
    ...GUIAS_POR_NECESIDAD[n],
    href: `/dashboard/recursos?guia=${GUIAS_POR_NECESIDAD[n].id}`,
  }));

  return {
    nivel,
    motivos: [...new Set(motivos)],
    necesidadesInmediatas: [...new Set(necesidades)],
    accionesPrimeras,
    guiasRecomendadas,
  };
}
