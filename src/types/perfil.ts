/**
 * Tipos y estructura del perfil de recuperación ReHub.
 * Diseñado para ser extensible y migrar fácilmente a API/DB.
 */

export type TipoAccidente =
  | "transito"
  | "laboral"
  | "domestico"
  | "deportivo"
  | "otro";

export type EstadoFisico =
  | "estable"
  | "recuperacion"
  | "limitado"
  | "requiere_asistencia";

export type SituacionLaboral =
  | "activo"
  | "incapacidad_temporal"
  | "desempleado"
  | "pensionado"
  | "estudiante";

export type RedApoyo =
  | "fuerte"
  | "moderada"
  | "limitada"
  | "ninguna";

export type NivelMovilidad =
  | "sin_limitaciones"
  | "leves"
  | "moderadas"
  | "graves";

export type EstadoEmocional =
  | "bien"
  | "ansiedad"
  | "tristeza"
  | "estres"
  | "otro";

export type TipoSeguro =
  | "publico"
  | "privado"
  | "laboral"
  | "ninguno"
  | "no_sabe";

export type ProvinciaRD =
  | "santo_domingo"
  | "distrito_nacional"
  | "santiago"
  | "la_romana"
  | "san_pedro"
  | "puerto_plata"
  | "san_cristobal"
  | "otros";

export interface DatosPersonales {
  nombre?: string;
  telefono?: string;
  provincia?: ProvinciaRD;
  municipio?: string;
}

export interface SituacionAccidente {
  tipoAccidente: TipoAccidente;
  fechaAccidente?: string;
  fechaAltaMedica?: string;
  centroSalud?: string;
  tipoSeguro?: TipoSeguro;
  descripcionBreve?: string;
}

export interface EstadoActual {
  estadoFisico: EstadoFisico;
  nivelMovilidad: NivelMovilidad;
  estadoEmocional: EstadoEmocional;
  tratamientosActuales?: string;
}

export interface ContextoSocial {
  situacionLaboral: SituacionLaboral;
  redApoyo: RedApoyo;
  personasACargo?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
}

export interface PerfilRecuperacion {
  version: number;
  datosPersonales?: DatosPersonales;
  situacionAccidente: SituacionAccidente;
  estadoActual: EstadoActual;
  contextoSocial: ContextoSocial;
  notas?: string;
  creadoEn: string;
  actualizadoEn: string;
}

/** Campos requeridos para considerar el perfil "completo" */
export const CAMPOS_REQUERIDOS = [
  "tipoAccidente",
  "estadoFisico",
  "situacionLaboral",
  "redApoyo",
  "nivelMovilidad",
  "estadoEmocional",
] as const;

export const OPCIONES_TIPO_ACCIDENTE: Record<TipoAccidente, string> = {
  transito: "Tránsito / Vehículo",
  laboral: "Laboral",
  domestico: "Doméstico",
  deportivo: "Deportivo",
  otro: "Otro",
};

export const OPCIONES_ESTADO_FISICO: Record<EstadoFisico, string> = {
  estable: "Estable",
  recuperacion: "En recuperación",
  limitado: "Limitado",
  requiere_asistencia: "Requiere asistencia",
};

export const OPCIONES_SITUACION_LABORAL: Record<SituacionLaboral, string> = {
  activo: "Activo / Trabajando",
  incapacidad_temporal: "Incapacidad temporal",
  desempleado: "Desempleado",
  pensionado: "Pensionado / Jubilado",
  estudiante: "Estudiante",
};

export const OPCIONES_RED_APOYO: Record<RedApoyo, string> = {
  fuerte: "Fuerte (familia, amigos)",
  moderada: "Moderada",
  limitada: "Limitada",
  ninguna: "Ninguna o escasa",
};

export const OPCIONES_NIVEL_MOVILIDAD: Record<NivelMovilidad, string> = {
  sin_limitaciones: "Sin limitaciones",
  leves: "Leves",
  moderadas: "Moderadas",
  graves: "Graves",
};

export const OPCIONES_ESTADO_EMOCIONAL: Record<EstadoEmocional, string> = {
  bien: "Bien / Estable",
  ansiedad: "Ansiedad",
  tristeza: "Tristeza",
  estres: "Estrés",
  otro: "Otro",
};

export const OPCIONES_TIPO_SEGURO: Record<TipoSeguro, string> = {
  publico: "Público (ARS)",
  privado: "Privado",
  laboral: "Laboral",
  ninguno: "Ninguno",
  no_sabe: "No sé",
};

export const OPCIONES_PROVINCIA: Record<ProvinciaRD, string> = {
  santo_domingo: "Santo Domingo",
  distrito_nacional: "Distrito Nacional",
  santiago: "Santiago",
  la_romana: "La Romana",
  san_pedro: "San Pedro de Macorís",
  puerto_plata: "Puerto Plata",
  san_cristobal: "San Cristóbal",
  otros: "Otra provincia",
};
