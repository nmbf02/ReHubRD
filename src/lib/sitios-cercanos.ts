/**
 * Sitios cercanos por provincia en República Dominicana.
 * Evalúa qué lugares pueden ayudar según ubicación y necesidades.
 */

import type { ProvinciaRD } from "@/types/perfil";

export type TipoSitio =
  | "emergencia"
  | "salud_mental"
  | "hospital"
  | "centro_salud"
  | "rehabilitacion"
  | "farmacia"
  | "medicamentos"
  | "trámites";

export interface SitioCercano {
  id: string;
  nombre: string;
  tipo: TipoSitio;
  descripcion: string;
  telefono?: string;
  web?: string;
  direccion?: string;
  horario?: string;
}

/** Sitios que aplican a todas las provincias */
const SITIOS_NACIONALES: SitioCercano[] = [
  { id: "emerg-911", nombre: "Emergencias", tipo: "emergencia", descripcion: "Emergencias médicas y de seguridad", telefono: "911" },
  { id: "salud-mental-811", nombre: "Línea de Salud Mental", tipo: "salud_mental", descripcion: "Atención psicológica gratuita y confidencial", telefono: "811" },
  { id: "cuida-salud-mental", nombre: "Cuida tu Salud Mental", tipo: "salud_mental", descripcion: "Primera ayuda psicológica, crisis, ansiedad", telefono: "809-200-1400" },
  { id: "sns-311", nombre: "Información SNS", tipo: "centro_salud", descripcion: "Orientación sobre centros de salud públicos", telefono: "311" },
  { id: "adr-central", nombre: "ADR - Rehabilitación", tipo: "rehabilitacion", descripcion: "35 centros a nivel nacional. Busca el más cercano en su web.", telefono: "809-689-7151", web: "rehabilitacion.org.do/filiales" },
];

/** Sitios por provincia - hospitales, centros de salud, ADR */
const SITIOS_POR_PROVINCIA: Record<ProvinciaRD, SitioCercano[]> = {
  distrito_nacional: [
    { id: "dn-hosp-general", nombre: "Hospital Docente Dr. Francisco E. Moscoso Puello", tipo: "hospital", descripcion: "Hospital público de referencia", direccion: "Av. Ortega y Gasset, DN" },
    { id: "dn-hosp-materno", nombre: "Hospital Materno Infantil", tipo: "hospital", descripcion: "Atención materno-infantil" },
    { id: "dn-adr", nombre: "ADR Sede Nacional", tipo: "rehabilitacion", descripcion: "Miraflores, Santo Domingo", direccion: "Calle Mary Pérez Viuda Marranzini esq. Leopoldo Navarro", telefono: "809-689-7151", web: "rehabilitacion.org.do" },
  ],
  santo_domingo: [
    { id: "sd-hosp", nombre: "Hospitales zona metropolitana", tipo: "hospital", descripcion: "Red de hospitales y centros públicos en Santo Domingo. Consulta el más cercano al 311." },
    { id: "sd-adr", nombre: "ADR - Centros en Santo Domingo", tipo: "rehabilitacion", descripcion: "Varios centros. Consulta rehabilitacion.org.do/filiales", telefono: "809-689-7151", web: "rehabilitacion.org.do/filiales" },
  ],
  santiago: [
    { id: "stg-hosp-pou", nombre: "Hospital Dr. Arturo Grullón", tipo: "hospital", descripcion: "Hospital infantil de referencia regional" },
    { id: "stg-hosp-materno", nombre: "Hospital San Vicente de Paúl", tipo: "hospital", descripcion: "Hospital regional Santiago" },
    { id: "stg-adr", nombre: "ADR Santiago", tipo: "rehabilitacion", descripcion: "Centro de rehabilitación", web: "rehabilitacion.org.do/filiales" },
  ],
  la_romana: [
    { id: "rom-hosp", nombre: "Hospital Central La Romana", tipo: "hospital", descripcion: "Hospital provincial" },
    { id: "rom-adr", nombre: "ADR La Romana", tipo: "rehabilitacion", descripcion: "Consulta ubicación exacta en ADR", web: "rehabilitacion.org.do/filiales" },
  ],
  san_pedro: [
    { id: "spm-hosp", nombre: "Hospital Regional San Pedro de Macorís", tipo: "hospital", descripcion: "Hospital provincial" },
    { id: "spm-adr", nombre: "ADR San Pedro", tipo: "rehabilitacion", descripcion: "Centro de rehabilitación", web: "rehabilitacion.org.do/filiales" },
  ],
  puerto_plata: [
    { id: "pp-hosp", nombre: "Hospital Dr. Ricardo Limardo", tipo: "hospital", descripcion: "Hospital provincial Puerto Plata" },
    { id: "pp-adr", nombre: "ADR Puerto Plata", tipo: "rehabilitacion", descripcion: "Centro de rehabilitación", web: "rehabilitacion.org.do/filiales" },
  ],
  san_cristobal: [
    { id: "sc-hosp", nombre: "Hospital Provincial San Cristóbal", tipo: "hospital", descripcion: "Hospital provincial" },
    { id: "sc-adr", nombre: "ADR San Cristóbal", tipo: "rehabilitacion", descripcion: "Consulta en ADR filiales", web: "rehabilitacion.org.do/filiales" },
  ],
  otros: [
    { id: "otros-hospital", nombre: "Hospital provincial más cercano", tipo: "hospital", descripcion: "Consulta en tu Dirección Provincial de Salud o llama al 311" },
    { id: "otros-adr", nombre: "ADR - Buscar centro cercano", tipo: "rehabilitacion", descripcion: "35 centros en RD. Busca por ubicación en rehabilitacion.org.do/filiales", telefono: "809-689-7151", web: "rehabilitacion.org.do/filiales" },
  ],
};

/** Obtiene sitios según provincia y necesidades seleccionadas */
export function obtenerSitiosCercanos(
  provincia?: ProvinciaRD,
  necesidadesIds?: string[]
): SitioCercano[] {
  const resultado: SitioCercano[] = [...SITIOS_NACIONALES];

  if (provincia && provincia !== "otros") {
    const deProvincia = SITIOS_POR_PROVINCIA[provincia] ?? [];
    resultado.push(...deProvincia);
  } else {
    resultado.push(...SITIOS_POR_PROVINCIA.otros);
  }

  // Ordenar por relevancia según necesidades (opcional)
  if (necesidadesIds?.length) {
    const priorizar = new Set<TipoSitio>();
    for (const id of necesidadesIds) {
      if (id.includes("medicamento") || id === "sin-medicamentos" || id === "medicamentos-delivery") {
        priorizar.add("medicamentos").add("farmacia").add("hospital");
      }
      if (id.includes("rehab") || id === "no-puedo-caminar" || id === "fisioterapia") priorizar.add("rehabilitacion");
      if (id.includes("emocional") || id === "estoy-sola" || id === "abrumado") priorizar.add("salud_mental");
      if (id.includes("tramite") || id === "derechos-laborales") priorizar.add("trámites");
    }
    if (priorizar.size > 0) {
      resultado.sort((a, b) => {
        const aMatch = priorizar.has(a.tipo) ? 1 : 0;
        const bMatch = priorizar.has(b.tipo) ? 1 : 0;
        return bMatch - aMatch;
      });
    }
  }

  return resultado;
}
