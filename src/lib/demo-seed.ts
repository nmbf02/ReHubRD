"use client";

/**
 * Siembra un paciente a mitad de recuperación en el almacenamiento del usuario.
 *
 * Existe por una razón concreta: **una aplicación vacía no puede enseñar un
 * flujo**. Recién registrado, el paciente está en el día 0 y no hay adherencia,
 * ni terapias, ni progreso que mostrar — que es lo correcto para él y lo
 * inservible para una demostración.
 *
 * El caso sembrado cae a propósito en la etapa de **Avance** con un solo hito
 * pendiente (completar la cuarta terapia), de modo que se puede marcar en vivo
 * y ver el recorrido pasar a Reintegración.
 *
 * Nunca se ejecuta solo: siempre lo dispara el usuario.
 */

import { saveProfile } from "./profile-store";
import { saveMedications, type Medication } from "./medications-store";
import { saveDoseLog, doseKey, type DoseLog } from "./adherence-store";
import { saveAppointments, type Appointment } from "./appointments-store";
import { saveMoodEntries, toDateKey, type MoodEntry, type MoodScore } from "./emotional-store";
import { savePaperwork, type PaperworkState } from "./paperwork-store";
import { saveReintegration, type ReintegrationState } from "./reintegration-store";

/** Días desde el alta médica del caso sembrado. */
const DAYS_SINCE_DISCHARGE = 47;

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function localIso(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${toDateKey(date)}T${h}:${m}`;
}

export function seedDemoPatient(userId?: string | null): void {
  const now = new Date();
  const discharge = addDays(now, -DAYS_SINCE_DISCHARGE);
  const accident = addDays(discharge, -4);

  // ── Perfil: accidente de tránsito con ARS, lo más común del mercado meta
  saveProfile(
    {
      datosPersonales: { provincia: "santiago", municipio: "Santiago de los Caballeros" },
      accidentState: {
        tipoAccidente: "transito",
        fechaAccidente: toDateKey(accident),
        fechaAltaMedica: toDateKey(discharge),
        centroSalud: "Hospital Metropolitano de Santiago",
        tipoSeguro: "publico",
        descripcionBreve: "Fractura de tibia y contusiones tras choque en motor.",
      },
      overallCondition: {
        physicalState: "recuperacion",
        mobilityLevel: "moderadas",
        emotionalState: "estres",
        tratamientosActuales: "Fisioterapia 2 veces por semana",
      },
      socialContext: {
        situacionLaboral: "incapacidad_temporal",
        redApoyo: "moderada",
        personasACargo: "2",
        contactoEmergencia: "Ana Rodríguez",
        telefonoEmergencia: "809-555-0142",
      },
    },
    userId ?? undefined
  );
  // `saveProfile` no emite evento propio; el recorrido escucha éste para
  // recalcularse sin recargar.
  window.dispatchEvent(new CustomEvent("rehub-perfil-updated"));

  // ── Medicamentos: cargados al día siguiente del alta
  const medStart = addDays(discharge, 1);
  const medications: Medication[] = [
    {
      id: "demo-med-ibuprofeno",
      name: "Ibuprofeno",
      dose: "400 mg",
      times: ["08:00", "14:00", "20:00"],
      withFood: true,
      createdAt: medStart.toISOString(),
    },
    {
      id: "demo-med-calcio",
      name: "Calcio + Vitamina D",
      dose: "1 tab",
      times: ["09:00"],
      createdAt: medStart.toISOString(),
    },
  ];
  saveMedications(medications, userId);

  // ── Registro de dosis: adherencia ≈78 %, con un bache reciente creíble.
  // El patrón es determinista (no usa azar) para que la demo sea repetible.
  const doseLog: DoseLog = {};
  let counter = 0;
  for (let offset = DAYS_SINCE_DISCHARGE - 1; offset >= 0; offset -= 1) {
    const day = addDays(now, -offset);
    if (day < medStart) continue;
    for (const med of medications) {
      for (const time of med.times) {
        const [hour] = time.split(":").map((n) => parseInt(n, 10));
        const at = new Date(day);
        at.setHours(hour, 0, 0, 0);
        if (at > now) continue;
        counter += 1;
        // Se salta ~1 de cada 4 (78 % aprox.) y algo más en la última semana.
        const skipEvery = offset <= 6 ? 3 : 5;
        if (counter % skipEvery !== 0) doseLog[doseKey(med.id, day, time)] = "taken";
      }
    }
  }
  saveDoseLog(doseLog, userId);

  // ── Citas: 7 terapias completadas, 1 perdida y 1 futura.
  //
  // El número es deliberado: el hito de Avance pide **ocho** completadas, así
  // que el caso queda a UNA sola de pasar a Reintegración. En la defensa se
  // marca la cita de la semana como asistida y el recorrido cambia de etapa
  // delante de todos.
  const appointments: Appointment[] = [
    buildAppointment("demo-cita-1", "fisioterapia", "Terapia de rodilla", addDays(now, -44), 9, 0, "completada"),
    buildAppointment("demo-cita-2", "fisioterapia", "Terapia de rodilla", addDays(now, -39), 9, 0, "completada"),
    buildAppointment("demo-cita-3", "consulta", "Consulta de control", addDays(now, -34), 11, 30, "completada"),
    buildAppointment("demo-cita-4", "fisioterapia", "Terapia de rodilla", addDays(now, -30), 9, 0, "ausente"),
    buildAppointment("demo-cita-5", "fisioterapia", "Terapia de rodilla", addDays(now, -25), 9, 0, "completada"),
    buildAppointment("demo-cita-6", "fisioterapia", "Terapia de rodilla", addDays(now, -19), 9, 0, "completada"),
    buildAppointment("demo-cita-7", "fisioterapia", "Terapia de rodilla", addDays(now, -13), 9, 0, "completada"),
    buildAppointment("demo-cita-8", "fisioterapia", "Terapia de rodilla", addDays(now, -6), 9, 0, "completada"),
    buildAppointment("demo-cita-9", "consulta", "Consulta de seguimiento", addDays(now, 5), 15, 0, "programada"),
  ];
  saveAppointments(appointments, userId);

  // ── Ánimo: dos semanas con altibajos, mejorando al final
  const scores: MoodScore[] = [2, 3, 2, 3, 3, 4, 3, 4, 4, 3, 4, 5];
  const moods: MoodEntry[] = scores.map((score, index) => {
    const day = addDays(now, -(scores.length - 1 - index));
    return {
      id: `demo-animo-${index}`,
      date: toDateKey(day),
      score,
      tags: score <= 2 ? ["dolor", "frustracion"] : score >= 4 ? ["esperanza"] : ["cansancio"],
      createdAt: day.toISOString(),
    };
  });
  saveMoodEntries(moods, userId);

  // ── Trámites: reclamación abierta y avanzando
  const paperwork: PaperworkState = {
    status: {
      reportar_ars: "resuelto",
      acta_policial: "resuelto",
      expediente_alta: "resuelto",
      autorizacion_terapias: "resuelto",
      subsidio: "en_proceso",
      guardar_gastos: "en_proceso",
      reclamacion: "pendiente",
      seguimiento: "pendiente",
    },
    notes: {
      reportar_ars: "Caso ARS-2026-08841, abierto el 12 de junio",
      autorizacion_terapias: "Autorizadas 12 sesiones",
    },
    updatedAt: now.toISOString(),
  };
  savePaperwork(paperwork, userId);

  // ── Reintegración: todavía no arranca. Es la etapa que viene.
  const reintegration: ReintegrationState = { status: {}, achievedAt: {}, updatedAt: "" };
  saveReintegration(reintegration, userId);
}

function buildAppointment(
  id: string,
  kind: Appointment["kind"],
  title: string,
  day: Date,
  hour: number,
  minute: number,
  status: Appointment["status"]
): Appointment {
  const when = new Date(day);
  when.setHours(hour, minute, 0, 0);
  return {
    id,
    kind,
    title,
    professional: kind === "consulta" ? "Dra. Marisol Taveras" : "Lic. Pedro Núñez",
    place: "Centro de Rehabilitación Cibao",
    datetime: localIso(when),
    status,
    bookedThroughRehub: true,
    createdAt: addDays(when, -6).toISOString(),
  };
}

/** Deja el recorrido en blanco, como una cuenta recién creada. */
export function clearPatientData(userId?: string | null): void {
  if (typeof window === "undefined") return;
  const suffix = userId ? `-${userId}` : "";
  const keys = [
    "rehub-perfil",
    "rehub-medicamentos",
    "rehub-dosis",
    "rehub-citas",
    "rehub-animo",
    "rehub-tramites",
    "rehub-reintegracion",
  ];
  for (const key of keys) {
    localStorage.removeItem(`${key}${suffix}`);
    localStorage.removeItem(key);
  }
  for (const event of [
    "rehub-perfil-updated",
    "rehub-medicamentos-updated",
    "rehub-dosis-updated",
    "rehub-citas-updated",
    "rehub-animo-updated",
    "rehub-tramites-updated",
    "rehub-reintegracion-updated",
  ]) {
    window.dispatchEvent(new CustomEvent(event));
  }
}
