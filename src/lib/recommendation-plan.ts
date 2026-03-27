import type { NecesidadPrioritaria } from "./profile-needs";
import type { PerfilRecuperacion, TipoAccidente } from "@/types/profile";

export interface Recomendacion {
  id: string;
  necesidadId?: string;
  titulo: string;
  descripcion: string;
  accion?: string;
  href?: string;
  prioridad?: "alta" | "media" | "baja";
  categoria?: "fisico" | "emocional" | "laboral" | "logístico" | "universal";
}

/** Recomendaciones que siempre aplican a toda persona en recuperación */
export const RECOMENDACIONES_UNIVERSALES: Recomendacion[] = [
  {
    id: "univ-1",
    titulo: "Seguimiento semanal de tu estado",
    descripcion: "Registra cómo te sientes cada semana. Esto permite ajustar el plan y priorizar lo que más necesitas.",
    accion: "Actualizar seguimiento",
    href: "/dashboard/seguimiento",
    prioridad: "alta",
    categoria: "universal",
  },
  {
    id: "univ-2",
    titulo: "Documentación médica organizada",
    descripcion: "Guarda en un lugar seguro: informe de alta, recetas actuales, resultados de estudios, citas programadas.",
    accion: "Ver guía de documentos",
    href: "/dashboard/recursos",
    prioridad: "alta",
    categoria: "universal",
  },
  {
    id: "univ-3",
    titulo: "Descanso y ritmo de actividad",
    descripcion: "Escucha tu cuerpo. Alterna actividad y descanso. Evita forzarte en los días de más cansancio.",
    accion: "Registrar en seguimiento",
    href: "/dashboard/seguimiento",
    prioridad: "alta",
    categoria: "universal",
  },
  {
    id: "univ-4",
    titulo: "Contacto de emergencia registrado",
    descripcion: "Asegúrate de tener al menos una persona de confianza con su teléfono en tu perfil.",
    accion: "Completar en Mi perfil",
    href: "/dashboard/perfil",
    prioridad: "media",
    categoria: "universal",
  },
  {
    id: "univ-5",
    titulo: "Rutina de sueño estable",
    descripcion: "Intenta dormir y despertar a horas similares. El sueño favorece la recuperación física y emocional.",
    accion: "Actualizar seguimiento",
    href: "/dashboard/seguimiento",
    prioridad: "media",
    categoria: "universal",
  },
];

const MAPA_RECOMENDACIONES: Record<string, Recomendacion[]> = {
  "emocional-ansiedad": [
    {
      id: "rec-ans-1",
      necesidadId: "emocional-ansiedad",
      titulo: "Respiración 4-7-8",
      descripcion: "Inhala 4 segundos, retén 7, exhala 8. Repite 3-4 veces. Ayuda a calmar la ansiedad de forma inmediata.",
      accion: "Ver técnicas en Recursos",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "emocional",
    },
    {
      id: "rec-ans-2",
      necesidadId: "emocional-ansiedad",
      titulo: "Check-in emocional periódico",
      descripcion: "Actualiza tu estado emocional en el seguimiento para que las recomendaciones se adapten.",
      accion: "Ir a Seguimiento",
      href: "/dashboard/seguimiento",
      prioridad: "alta",
      categoria: "emocional",
    },
    {
      id: "rec-ans-3",
      necesidadId: "emocional-ansiedad",
      titulo: "Actividades que te calmen",
      descripcion: "Identifica qué te ayuda: caminata corta, música, hablar con alguien. Hazlo antes de que la ansiedad suba.",
      accion: "Registrar en seguimiento",
      href: "/dashboard/seguimiento",
      prioridad: "media",
      categoria: "emocional",
    },
    {
      id: "rec-ans-4",
      necesidadId: "emocional-ansiedad",
      titulo: "Evitar estimulantes en exceso",
      descripcion: "Reduce café, bebidas energéticas y pantallas antes de dormir si notas más ansiedad.",
      accion: "Ver más en Recursos",
      href: "/dashboard/recursos",
      prioridad: "media",
      categoria: "emocional",
    },
  ],
  "emocional-tristeza": [
    {
      id: "rec-tristeza-1",
      necesidadId: "emocional-tristeza",
      titulo: "Grupos de apoyo",
      descripcion: "Buscar grupos de apoyo en tu zona o en línea puede ayudar. Compartir con otros en situación similar reduce el aislamiento.",
      accion: "Ver recursos comunitarios",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "emocional",
    },
    {
      id: "rec-tristeza-2",
      necesidadId: "emocional-tristeza",
      titulo: "Rutinas que den estructura",
      descripcion: "Pequeñas rutinas diarias (levantarte a una hora, una actividad fija) ayudan a mantener estabilidad emocional.",
      accion: "Actualizar seguimiento",
      href: "/dashboard/seguimiento",
      prioridad: "media",
      categoria: "emocional",
    },
  ],
  movilidad: [
    {
      id: "rec-mov-1",
      necesidadId: "movilidad",
      titulo: "Plan de rehabilitación con tu médico",
      descripcion: "Coordina fisioterapia o rehabilitación adaptada a tus limitaciones. En RD, tu ARS puede cubrir sesiones según tu plan.",
      accion: "Ver centro de salud en perfil",
      href: "/dashboard/perfil",
      prioridad: "alta",
      categoria: "fisico",
    },
    {
      id: "rec-mov-2",
      necesidadId: "movilidad",
      titulo: "Accesibilidad en el hogar",
      descripcion: "Identifica cambios sencillos: barras de apoyo, eliminar obstáculos, mejorar iluminación. Pequeños ajustes hacen gran diferencia.",
      accion: "Ver recursos de accesibilidad",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "logístico",
    },
    {
      id: "rec-mov-3",
      necesidadId: "movilidad",
      titulo: "Transporte y desplazamientos",
      descripcion: "Planifica salidas con anticipación. Consulta opciones de transporte accesible en tu provincia.",
      accion: "Ver recursos de accesibilidad",
      href: "/dashboard/recursos",
      prioridad: "media",
      categoria: "logístico",
    },
  ],
  "movilidad-leve": [
    {
      id: "rec-mov-leve-1",
      necesidadId: "movilidad-leve",
      titulo: "Ejercicios según indicación médica",
      descripcion: "Mantén la actividad física dentro de lo indicado por tu médico. La movilización temprana acelera la recuperación.",
      accion: "Actualizar seguimiento",
      href: "/dashboard/seguimiento",
      prioridad: "media",
      categoria: "fisico",
    },
  ],
  "laboral-tramites": [
    {
      id: "rec-lab-1",
      necesidadId: "laboral-tramites",
      titulo: "Documentos para empleador y ARS",
      descripcion: "Reúne: certificado médico, informe de alta, licencia médica. Tu empleador debe registrar la licencia en SISALRIL para el subsidio por incapacidad.",
      accion: "Ver guía de trámites RD",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "laboral",
    },
    {
      id: "rec-lab-2",
      necesidadId: "laboral-tramites",
      titulo: "Comunicación con empleador",
      descripcion: "Informa por escrito sobre tu situación y fechas de reintegro previstas. Mantén copia de la comunicación.",
      accion: "Añadir nota en perfil",
      href: "/dashboard/perfil",
      prioridad: "alta",
      categoria: "laboral",
    },
    {
      id: "rec-lab-3",
      necesidadId: "laboral-tramites",
      titulo: "Subsidio por incapacidad (SISALRIL)",
      descripcion: "Si cotizas al SDSS y tu incapacidad supera 4 días, puedes tener derecho al subsidio. El empleador registra la licencia en virtual.sisalril.gob.do.",
      accion: "Ver recursos",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "laboral",
    },
    {
      id: "rec-lab-4",
      necesidadId: "laboral-tramites",
      titulo: "Si fue accidente laboral: IDOPPRIL",
      descripcion: "Los accidentes de trabajo pueden tener indemnización vía IDOPPRIL si hay pérdida de capacidad laboral entre 15% y 50%.",
      accion: "Información en Recursos",
      href: "/dashboard/recursos",
      prioridad: "media",
      categoria: "laboral",
    },
  ],
  "laboral-reinsercion": [
    {
      id: "rec-reins-1",
      necesidadId: "laboral-reinsercion",
      titulo: "Capacitación y reintegración",
      descripcion: "Explora programas de formación o reintegración adaptados a tus limitaciones actuales.",
      accion: "Ver recursos",
      href: "/dashboard/recursos",
      prioridad: "media",
      categoria: "laboral",
    },
  ],
  "red-apoyo": [
    {
      id: "rec-red-1",
      necesidadId: "red-apoyo",
      titulo: "Recursos comunitarios",
      descripcion: "Organizaciones y programas ofrecen acompañamiento a personas en recuperación. Revisa opciones en tu provincia.",
      accion: "Explorar recursos",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "logístico",
    },
    {
      id: "rec-red-2",
      necesidadId: "red-apoyo",
      titulo: "Contacto de emergencia",
      descripcion: "Asegura tener al menos un contacto de confianza registrado. Es importante para tu seguridad.",
      accion: "Completar en Mi perfil",
      href: "/dashboard/perfil",
      prioridad: "alta",
      categoria: "universal",
    },
    {
      id: "rec-red-3",
      necesidadId: "red-apoyo",
      titulo: "Aceptar ayuda cuando la ofrezcan",
      descripcion: "Compras, acompañamiento a citas, conversación. Pequeños gestos de apoyo facilitan el proceso.",
      accion: "Ver recursos comunitarios",
      href: "/dashboard/recursos",
      prioridad: "media",
      categoria: "emocional",
    },
  ],
  asistencia: [
    {
      id: "rec-asist-1",
      necesidadId: "asistencia",
      titulo: "Atención domiciliaria",
      descripcion: "Consulta con tu ARS opciones de enfermería o cuidado a domicilio según tu cobertura.",
      accion: "Ver recursos de salud",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "fisico",
    },
    {
      id: "rec-asist-2",
      necesidadId: "asistencia",
      titulo: "Centros de día y apoyo",
      descripcion: "Algunas instituciones ofrecen servicios de día para rehabilitación y acompañamiento.",
      accion: "Explorar Recursos",
      href: "/dashboard/recursos",
      prioridad: "media",
      categoria: "logístico",
    },
  ],
  tramites: [
    {
      id: "rec-tram-1",
      necesidadId: "tramites",
      titulo: "Documentos post-alta esenciales",
      descripcion: "Copia del informe médico, recetas actuales, resultados de estudios, cartas de tu centro de salud.",
      accion: "Guía en Recursos",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "logístico",
    },
    {
      id: "rec-tram-2",
      necesidadId: "tramites",
      titulo: "Verificar tu ARS",
      descripcion: "Confirma tu afiliación en virtual.sisalril.gob.do. Necesitarás tu ARS para trámites de incapacidad y rehabilitación.",
      accion: "Ver recursos",
      href: "/dashboard/recursos",
      prioridad: "media",
      categoria: "logístico",
    },
  ],
};

/** Tips adicionales según tipo de accidente */
const TIPS_POR_TIPO_ACCIDENTE: Record<TipoAccidente, Recomendacion[]> = {
  transito: [
    {
      id: "tip-trans-1",
      titulo: "Evaluación completa post-accidente",
      descripcion: "Lesiones como latigazo cervical o conmoción pueden manifestarse días después. Si tienes nuevos síntomas, consulta al médico.",
      prioridad: "alta",
      categoria: "fisico",
    },
    {
      id: "tip-trans-2",
      titulo: "Aspectos legales y seguro",
      descripcion: "Si hubo terceros involucrados, conserva toda la documentación. Consulta con un abogado si aplica.",
      accion: "Ver recursos",
      href: "/dashboard/recursos",
      prioridad: "media",
      categoria: "logístico",
    },
  ],
  laboral: [
    {
      id: "tip-lab-1",
      titulo: "Reporte al empleador",
      descripcion: "El accidente laboral debe estar debidamente reportado. Esto es necesario para IDOPPRIL y seguros.",
      accion: "Ver guía laboral",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "laboral",
    },
  ],
  domestico: [
    {
      id: "tip-dom-1",
      titulo: "Prevención de nuevos incidentes",
      descripcion: "Identifica qué causó el accidente y qué cambios podrían evitar que se repita.",
      prioridad: "media",
      categoria: "universal",
    },
  ],
  deportivo: [
    {
      id: "tip-dep-1",
      titulo: "Recuperación gradual para deporte",
      descripcion: "Consulta con tu médico el plan para volver a la actividad deportiva de forma segura.",
      accion: "Ver recursos de rehabilitación",
      href: "/dashboard/recursos",
      prioridad: "alta",
      categoria: "fisico",
    },
  ],
  otro: [],
};

export function obtenerRecomendaciones(
  necesidades: NecesidadPrioritaria[],
  perfil?: PerfilRecuperacion
): Recomendacion[] {
  const recs: Recomendacion[] = [];
  for (const n of necesidades) {
    const list = MAPA_RECOMENDACIONES[n.id];
    if (list) recs.push(...list);
  }
  if (perfil?.situacionAccidente?.tipoAccidente) {
    const tips = TIPS_POR_TIPO_ACCIDENTE[perfil.situacionAccidente.tipoAccidente];
    if (tips?.length) recs.push(...tips);
  }
  return recs;
}

export const RECORDATORIOS_SUGERIDOS = [
  {
    id: "rem-1",
    titulo: "Check-in semanal",
    descripcion: "Registra cómo te sientes física y emocionalmente. El plan se adapta según tus respuestas.",
    href: "/dashboard/seguimiento",
    frecuencia: "semanal",
  },
  {
    id: "rem-2",
    titulo: "Citas médicas",
    descripcion: "Revisa tus próximas citas y prepara preguntas para el médico.",
    href: "/dashboard/perfil",
    frecuencia: "según citas",
  },
  {
    id: "rem-3",
    titulo: "Documentos y trámites",
    descripcion: "Verifica que tengas todo para seguros, empleador o SISALRIL.",
    href: "/dashboard/recursos",
    frecuencia: "quincenal",
  },
  {
    id: "rem-4",
    titulo: "Tomar medicación",
    descripcion: "Si tienes tratamientos, mantén la adherencia según indicación médica.",
    href: "/dashboard/perfil",
    frecuencia: "diario",
  },
  {
    id: "rem-5",
    titulo: "Revisar tu plan",
    descripcion: "Las recomendaciones pueden cambiar según tu evolución. Revisa periódicamente.",
    href: "/dashboard/plan",
    frecuencia: "semanal",
  },
];

/** Checklist de acciones prioritarias para la vista del plan */
export const CHECKLIST_PRIORITARIO = [
  { id: "chk-1", texto: "Completar perfil de recuperación", href: "/dashboard/perfil" },
  { id: "chk-2", texto: "Registrar contacto de emergencia", href: "/dashboard/perfil" },
  { id: "chk-3", texto: "Reunir documentos médicos", href: "/dashboard/recursos" },
  { id: "chk-4", texto: "Actualizar seguimiento esta semana", href: "/dashboard/seguimiento" },
  { id: "chk-5", texto: "Verificar trámites laborales (si aplica)", href: "/dashboard/recursos" },
];
