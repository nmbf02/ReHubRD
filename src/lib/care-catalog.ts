/**
 * Body-part → specialty mapping and REAL nearby-center lookup for the "señala
 * dónde te duele" flow. No fictional doctors: the tangible output is the real
 * medical specialty you likely need plus REAL rehabilitation/health centers
 * near you, sourced from `nearby-places` (ADR filiales, provincial hospitals,
 * SNS lines — all real RD data). A real per-center doctor directory is the
 * "modo real" upgrade (needs a data partnership), documented in the README.
 */

import type { ProvinciaRD } from "@/types/profile";
import { obtenerSitiosCercanos, type SitioCercano } from "@/lib/nearby-places";

export type BasePart =
  | "cabeza"
  | "cuello"
  | "hombro"
  | "pecho"
  | "brazo"
  | "codo"
  | "mano"
  | "abdomen"
  | "cadera"
  | "muslo"
  | "rodilla"
  | "pierna"
  | "pie";

export type BodyRegion =
  | "cabeza"
  | "cuello"
  | "pecho"
  | "abdomen"
  | "cadera"
  | "hombro_izq"
  | "hombro_der"
  | "brazo_izq"
  | "brazo_der"
  | "codo_izq"
  | "codo_der"
  | "mano_izq"
  | "mano_der"
  | "muslo_izq"
  | "muslo_der"
  | "rodilla_izq"
  | "rodilla_der"
  | "pierna_izq"
  | "pierna_der"
  | "pie_izq"
  | "pie_der";

export const BODY_REGIONS: BodyRegion[] = [
  "cabeza",
  "cuello",
  "pecho",
  "abdomen",
  "cadera",
  "hombro_izq",
  "hombro_der",
  "brazo_izq",
  "brazo_der",
  "codo_izq",
  "codo_der",
  "mano_izq",
  "mano_der",
  "muslo_izq",
  "muslo_der",
  "rodilla_izq",
  "rodilla_der",
  "pierna_izq",
  "pierna_der",
  "pie_izq",
  "pie_der",
];

export type Specialty =
  | "ortopedia"
  | "traumatologia"
  | "fisiatria"
  | "neurologia"
  | "medicina_general";

const BASE_SPECIALTIES: Record<BasePart, Specialty[]> = {
  cabeza: ["neurologia", "medicina_general"],
  cuello: ["fisiatria", "traumatologia", "neurologia"],
  hombro: ["ortopedia", "traumatologia", "fisiatria"],
  pecho: ["medicina_general"],
  brazo: ["ortopedia", "traumatologia"],
  codo: ["ortopedia", "traumatologia"],
  mano: ["ortopedia", "traumatologia"],
  abdomen: ["medicina_general"],
  cadera: ["ortopedia", "fisiatria"],
  muslo: ["ortopedia", "traumatologia"],
  rodilla: ["ortopedia", "fisiatria"],
  pierna: ["ortopedia", "traumatologia"],
  pie: ["ortopedia", "traumatologia"],
};

/** Strip the left/right suffix to get the underlying body part. */
export function regionToBase(region: BodyRegion): BasePart {
  return region.replace(/_(izq|der)$/, "") as BasePart;
}

/** Unique base parts for a set of selected regions. */
export function basePartsForRegions(regions: BodyRegion[]): BasePart[] {
  const seen = new Set<BasePart>();
  for (const region of regions) seen.add(regionToBase(region));
  return Array.from(seen);
}

/** Specialties that usually treat the selected regions. */
export function specialtiesForRegions(regions: BodyRegion[]): Specialty[] {
  const set = new Set<Specialty>();
  for (const region of regions) {
    for (const specialty of BASE_SPECIALTIES[regionToBase(region)] ?? []) set.add(specialty);
  }
  return Array.from(set);
}

/** REAL nearby rehabilitation / health centers for the person's province. */
export function centersNear(provincia?: ProvinciaRD): SitioCercano[] {
  return obtenerSitiosCercanos(provincia).filter(
    (site) => site.tipo === "rehabilitacion" || site.tipo === "hospital" || site.tipo === "centro_salud"
  );
}
