"use client";

/**
 * Población de demostración para los paneles del médico y de la institución.
 *
 * Punto importante: **no se inventan los indicadores**. Se generan historiales
 * verosímiles (dosis marcadas, citas asistidas o perdidas, registros de ánimo,
 * trámites) y luego se pasan por `computeJourney`, el mismo motor que usa el
 * paciente. Así el panel del médico y la pantalla del paciente no pueden
 * contradecirse: son el mismo dato leído desde los dos lados (ADR 0003).
 *
 * Determinista por semilla fija — sin `Math.random`, para que dos renders
 * consecutivos no muestren cifras distintas.
 */

import type { TipoAccidente } from "@/types/profile";
import type { Medication } from "./medications-store";
import type { DoseLog } from "./adherence-store";
import { doseKey } from "./adherence-store";
import type { Appointment, AppointmentKind, AppointmentStatus } from "./appointments-store";
import type { MoodEntry, MoodScore } from "./emotional-store";
import { toDateKey } from "./emotional-store";
import { PAPERWORK_STEPS, type PaperworkState } from "./paperwork-store";
import { REINTEGRATION_MILESTONES, type ReintegrationState } from "./reintegration-store";
import { type JourneyState, type PatientSnapshot, computeJourney } from "./journey";

// ───────────────────────────────────────────────────── Azar reproducible

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

function between(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ───────────────────────────────────────────────────────── Datos locales

const NOMBRES = [
  "Ramón Pérez", "Yokasta Núñez", "Wilkin Rodríguez", "Altagracia Peña",
  "Franklin Almonte", "Yamilex Batista", "Eddy Ventura", "Josefina Reyes",
  "Radhamés Cruz", "Carolina Then", "Ambiorix Guzmán", "Nurys Fernández",
  "Starlin Mejía", "Rosanna Ortiz", "Domingo Cabrera", "Ivelisse Santana",
  "Juan Carlos Difó", "Massiel Grullón", "Elvin Paulino", "Yaritza Espinal",
  "Nelson Tavárez", "Dahiana Contreras", "Braulio Made", "Scarlet Jiménez",
  "Manuel Emilio Polanco", "Leidy Vásquez", "Héctor Bonilla", "Kenia Marte",
  "Roberto Frías", "Anyelina Suero", "Confesor Liriano", "Milagros Abreu",
];

const ARS = [
  "ARS Humano", "ARS Palic", "ARS Universal", "ARS SeNaSa",
  "ARS Futuro", "ARS Monumental", "ARS Renacer",
];

const EMPRESAS = [
  "Zona Franca Victoria", "Constructora del Yaque", "Induveca",
  "Transporte del Cibao", "Grupo Ramos", "Textiles Santiago",
];

const CENTROS = [
  "Centro de Rehabilitación Cibao", "Fisiocentro Santiago",
  "Rehabilitar RD", "Centro Ortopédico del Norte",
];

const MEDICOS = [
  { id: "dr-taveras", name: "Dra. Marisol Taveras", specialty: "Ortopedia" },
  { id: "dr-gomez", name: "Dr. Luis Gómez", specialty: "Fisiatría" },
];

const FARMACOS: Array<{ name: string; dose: string; perDay: number }> = [
  { name: "Ibuprofeno", dose: "400 mg", perDay: 3 },
  { name: "Acetaminofén", dose: "500 mg", perDay: 3 },
  { name: "Amoxicilina", dose: "500 mg", perDay: 3 },
  { name: "Diclofenaco", dose: "50 mg", perDay: 2 },
  { name: "Omeprazol", dose: "20 mg", perDay: 1 },
  { name: "Tramadol", dose: "50 mg", perDay: 2 },
  { name: "Complejo B", dose: "1 tab", perDay: 1 },
];

const ACCIDENTES: TipoAccidente[] = ["transito", "laboral", "domestico", "deportivo"];

const TERAPIAS: Array<{ kind: AppointmentKind; title: string }> = [
  { kind: "fisioterapia", title: "Terapia física" },
  { kind: "fisioterapia", title: "Rehabilitación de rodilla" },
  { kind: "consulta", title: "Consulta de seguimiento" },
  { kind: "psicologia", title: "Apoyo psicológico" },
  { kind: "estudio", title: "Radiografía de control" },
];

/**
 * Cómo va cada paciente.
 *
 * La mezcla está calibrada a lo que la tesis promete, no a lo que promete el
 * folleto ni al escenario sin ReHub: **reducir ≥30 % el abandono** (BR-14).
 * Una población mayoritariamente al día con una minoría clara en riesgo es lo
 * que hace útil el panel de alertas — si media cartera está en rojo, la alerta
 * deja de señalar nada. Los pisos de adherencia no bajan de 25 % porque un 0 %
 * se lee como dato roto, no como paciente que abandona.
 */
type Archetype = "ingresando" | "al_dia" | "en_riesgo" | "abandonando" | "reintegrando" | "completado";

interface ArchetypeSpec {
  weight: number;
  days: [number, number];
  adherence: [number, number];
  attendance: [number, number];
  mood: [number, number];
  paperworkDone: [number, number];
  reintegration: number;
}

const ARCHETYPES: Record<Archetype, ArchetypeSpec> = {
  ingresando:   { weight: 5, days: [4, 14],    adherence: [72, 95], attendance: [60, 100], mood: [2, 4], paperworkDone: [0, 1], reintegration: 0 },
  al_dia:       { weight: 8, days: [25, 90],   adherence: [82, 98], attendance: [85, 100], mood: [3, 5], paperworkDone: [3, 6], reintegration: 0 },
  en_riesgo:    { weight: 5, days: [20, 75],   adherence: [55, 69], attendance: [55, 78],  mood: [2, 3], paperworkDone: [1, 3], reintegration: 0 },
  abandonando:  { weight: 3, days: [30, 110],  adherence: [25, 48], attendance: [30, 55],  mood: [1, 2], paperworkDone: [0, 2], reintegration: 0 },
  reintegrando: { weight: 5, days: [95, 165],  adherence: [78, 96], attendance: [80, 100], mood: [3, 5], paperworkDone: [5, 8], reintegration: 5 },
  completado:   { weight: 3, days: [175, 240], adherence: [85, 99], attendance: [90, 100], mood: [4, 5], paperworkDone: [8, 9], reintegration: 10 },
};

function archetypeFor(rng: () => number): Archetype {
  const entries = Object.entries(ARCHETYPES) as Array<[Archetype, ArchetypeSpec]>;
  const total = entries.reduce((sum, [, spec]) => sum + spec.weight, 0);
  let roll = rng() * total;
  for (const [id, spec] of entries) {
    roll -= spec.weight;
    if (roll <= 0) return id;
  }
  return "al_dia";
}

// ─────────────────────────────────────────────── Construcción del historial

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function timesFor(perDay: number): string[] {
  if (perDay === 1) return ["08:00"];
  if (perDay === 2) return ["08:00", "20:00"];
  return ["08:00", "14:00", "20:00"];
}

function buildSnapshot(
  rng: () => number,
  spec: ArchetypeSpec,
  accidentType: TipoAccidente,
  now: Date
): PatientSnapshot {
  const daysSince = between(rng, spec.days[0], spec.days[1]);
  const discharge = addDays(now, -daysSince);

  // Medicamentos, cargados el día siguiente al alta.
  const medCount = between(rng, 1, 3);
  const chosen = new Set<number>();
  const medications: Medication[] = [];
  for (let i = 0; i < medCount; i += 1) {
    let index = between(rng, 0, FARMACOS.length - 1);
    while (chosen.has(index)) index = (index + 1) % FARMACOS.length;
    chosen.add(index);
    const farmaco = FARMACOS[index];
    medications.push({
      id: `med-${i}-${index}`,
      name: farmaco.name,
      dose: farmaco.dose,
      times: timesFor(farmaco.perDay),
      createdAt: addDays(discharge, 1).toISOString(),
    });
  }

  // Registro de dosis: la probabilidad de marcar apunta a la adherencia objetivo.
  // Las últimas semanas pesan más porque la adherencia se mide sobre 14 días.
  const targetAdherence = between(rng, spec.adherence[0], spec.adherence[1]) / 100;
  const doseLog: DoseLog = {};
  const medStart = addDays(discharge, 1);
  for (let offset = daysSince - 1; offset >= 0; offset -= 1) {
    const day = addDays(now, -offset);
    if (day < medStart) continue;
    for (const med of medications) {
      for (const time of med.times) {
        const [h] = time.split(":").map((n) => parseInt(n, 10));
        const at = new Date(day);
        at.setHours(h, 0, 0, 0);
        if (at > now) continue;
        if (rng() < targetAdherence) doseLog[doseKey(med.id, day, time)] = "taken";
      }
    }
  }

  // Citas: una cada ~7 días desde el alta, más una futura si sigue en proceso.
  const targetAttendance = between(rng, spec.attendance[0], spec.attendance[1]) / 100;
  const appointments: Appointment[] = [];
  let slot = 0;
  for (let offset = daysSince - 3; offset > 0; offset -= 7) {
    const terapia = pick(rng, TERAPIAS);
    const when = addDays(now, -offset);
    when.setHours(between(rng, 8, 16), rng() < 0.5 ? 0 : 30, 0, 0);
    const status: AppointmentStatus = rng() < targetAttendance ? "completada" : "ausente";
    appointments.push({
      id: `cita-${slot}`,
      kind: terapia.kind,
      title: terapia.title,
      professional: pick(rng, MEDICOS).name,
      place: pick(rng, CENTROS),
      datetime: localIso(when),
      status,
      bookedThroughRehub: rng() < 0.6,
      createdAt: addDays(when, -5).toISOString(),
    });
    slot += 1;
  }
  if (spec.reintegration < 10) {
    const terapia = pick(rng, TERAPIAS);
    const when = addDays(now, between(rng, 1, 9));
    when.setHours(between(rng, 8, 16), 0, 0, 0);
    appointments.push({
      id: `cita-prox-${slot}`,
      kind: terapia.kind,
      title: terapia.title,
      professional: pick(rng, MEDICOS).name,
      place: pick(rng, CENTROS),
      datetime: localIso(when),
      status: "programada",
      bookedThroughRehub: rng() < 0.6,
      createdAt: now.toISOString(),
    });
  }

  // Ánimo: registros salteados de los últimos 10 días.
  const moods: MoodEntry[] = [];
  for (let offset = 0; offset < 10; offset += 1) {
    if (rng() < 0.45) continue;
    const day = addDays(now, -offset);
    const score = between(rng, spec.mood[0], spec.mood[1]) as MoodScore;
    moods.push({
      id: `animo-${offset}`,
      date: toDateKey(day),
      score,
      tags: score <= 2 ? ["dolor", "frustracion"] : score >= 4 ? ["esperanza"] : ["cansancio"],
      createdAt: day.toISOString(),
    });
  }

  // Trámites: se resuelven en orden, con uno en proceso al frente.
  const resolvedCount = between(rng, spec.paperworkDone[0], spec.paperworkDone[1]);
  const paperwork: PaperworkState = { status: {}, notes: {}, updatedAt: now.toISOString() };
  PAPERWORK_STEPS.forEach((step, index) => {
    if (index < resolvedCount) paperwork.status[step.id] = "resuelto";
    else if (index === resolvedCount && resolvedCount > 0) paperwork.status[step.id] = "en_proceso";
  });

  // Reintegración: solo tiene sentido en las etapas finales.
  const reintegration: ReintegrationState = { status: {}, achievedAt: {}, updatedAt: now.toISOString() };
  REINTEGRATION_MILESTONES.slice(0, spec.reintegration).forEach((milestone) => {
    reintegration.status[milestone.id] = "logrado";
    reintegration.achievedAt[milestone.id] = addDays(now, -between(rng, 1, 20)).toISOString();
  });
  if (spec.reintegration > 0 && spec.reintegration < REINTEGRATION_MILESTONES.length) {
    reintegration.status[REINTEGRATION_MILESTONES[spec.reintegration].id] = "en_proceso";
  }

  return {
    dischargeDate: toDateKey(discharge),
    accidentType,
    insurance: accidentType === "laboral" ? "laboral" : "publico",
    profileComplete: true,
    medications,
    doseLog,
    appointments,
    moods,
    paperwork,
    reintegration,
  };
}

/** `YYYY-MM-DDTHH:mm` en hora local, que es como se guardan las citas. */
function localIso(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${toDateKey(date)}T${h}:${m}`;
}

// ─────────────────────────────────────────────────────────── La cohorte

export interface CohortPatient {
  id: string;
  name: string;
  age: number;
  accidentType: TipoAccidente;
  insurer: string;
  employer: string;
  center: string;
  doctorId: string;
  doctorName: string;
  snapshot: PatientSnapshot;
  journey: JourneyState;
}

/**
 * Siempre la misma población para la misma fecha. `now` entra por parámetro
 * para que los cálculos sean reproducibles y para no llamar a `new Date()` en
 * medio del render.
 */
export function buildCohort(now: Date, size = 28): CohortPatient[] {
  const rng = mulberry32(20260801);
  const patients: CohortPatient[] = [];

  for (let i = 0; i < size; i += 1) {
    const archetype = archetypeFor(rng);
    const spec = ARCHETYPES[archetype];
    const accidentType = pick(rng, ACCIDENTES);
    const snapshot = buildSnapshot(rng, spec, accidentType, now);
    const medico = MEDICOS[i % MEDICOS.length];

    patients.push({
      id: `paciente-${i}`,
      name: NOMBRES[i % NOMBRES.length],
      age: between(rng, 25, 55),
      accidentType,
      insurer: pick(rng, ARS),
      employer: pick(rng, EMPRESAS),
      center: pick(rng, CENTROS),
      doctorId: medico.id,
      doctorName: medico.name,
      snapshot,
      journey: computeJourney(snapshot, now),
    });
  }

  return patients;
}

/** El médico con el que se demuestra el panel. */
export const DEMO_DOCTOR = MEDICOS[0];

export function patientsOf(cohort: CohortPatient[], doctorId: string): CohortPatient[] {
  return cohort.filter((p) => p.doctorId === doctorId);
}
