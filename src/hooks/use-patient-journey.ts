"use client";

/**
 * Lee del disco todo lo que los seis módulos han registrado y lo convierte en
 * el estado del recorrido. Se recalcula cuando cualquier módulo emite su evento
 * de actualización, de modo que marcar una dosis mueve el carril del menú en el
 * acto, sin recargar.
 */

import { useCallback, useEffect, useState } from "react";
import { getPerfil } from "@/lib/profile-store";
import { getMedications, MEDICATIONS_UPDATED_EVENT } from "@/lib/medications-store";
import { getDoseLog, ADHERENCE_UPDATED_EVENT } from "@/lib/adherence-store";
import { getAppointments, APPOINTMENTS_UPDATED_EVENT } from "@/lib/appointments-store";
import { getMoodEntries, MOOD_UPDATED_EVENT } from "@/lib/emotional-store";
import { getPaperwork, PAPERWORK_UPDATED_EVENT } from "@/lib/paperwork-store";
import { getReintegration, REINTEGRATION_UPDATED_EVENT } from "@/lib/reintegration-store";
import {
  type JourneyState,
  type PatientSnapshot,
  EMPTY_SNAPSHOT,
  computeJourney,
} from "@/lib/journey";

const STORE_EVENTS = [
  MEDICATIONS_UPDATED_EVENT,
  ADHERENCE_UPDATED_EVENT,
  APPOINTMENTS_UPDATED_EVENT,
  MOOD_UPDATED_EVENT,
  PAPERWORK_UPDATED_EVENT,
  REINTEGRATION_UPDATED_EVENT,
  "rehub-perfil-updated",
];

export function readSnapshot(userId?: string | null): PatientSnapshot {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  const perfil = getPerfil(userId ?? undefined);
  return {
    dischargeDate: perfil?.situacionAccidente?.fechaAltaMedica,
    accidentType: perfil?.situacionAccidente?.tipoAccidente,
    insurance: perfil?.situacionAccidente?.tipoSeguro,
    // El hito es haber contado lo esencial del alta, no llenar el formulario
    // entero: el porcentaje de campos no mide recuperación (BR-10).
    profileComplete: Boolean(
      perfil?.situacionAccidente?.tipoAccidente && perfil?.situacionAccidente?.fechaAltaMedica
    ),
    medications: getMedications(userId),
    doseLog: getDoseLog(userId),
    appointments: getAppointments(userId),
    moods: getMoodEntries(userId),
    paperwork: getPaperwork(userId),
    reintegration: getReintegration(userId),
  };
}

export interface UsePatientJourney {
  /** `null` hasta que el componente monta: en el servidor no hay `localStorage`. */
  journey: JourneyState | null;
  snapshot: PatientSnapshot;
  refresh: () => void;
}

export function usePatientJourney(userId?: string | null): UsePatientJourney {
  const [snapshot, setSnapshot] = useState<PatientSnapshot>(EMPTY_SNAPSHOT);
  const [journey, setJourney] = useState<JourneyState | null>(null);

  const refresh = useCallback(() => {
    const snap = readSnapshot(userId);
    setSnapshot(snap);
    setJourney(computeJourney(snap, new Date()));
  }, [userId]);

  useEffect(() => {
    refresh();
    for (const event of STORE_EVENTS) window.addEventListener(event, refresh);
    return () => {
      for (const event of STORE_EVENTS) window.removeEventListener(event, refresh);
    };
  }, [refresh]);

  return { journey, snapshot, refresh };
}
