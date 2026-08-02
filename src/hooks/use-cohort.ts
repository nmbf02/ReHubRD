"use client";

/**
 * La población que ven los paneles de aliado.
 *
 * Detalle deliberado: **el paciente que tiene la sesión abierta entra en la
 * cartera como uno más**. Así, marcar una dosis como paciente y cambiar al rol
 * de médico enseña la alerta apareciendo — que es el mecanismo que la tesis
 * describe y por el que el médico paga (BR-11).
 */

import { useEffect, useState } from "react";
import { computeJourney } from "@/lib/journey";
import { buildCohort, DEMO_DOCTOR, type CohortPatient } from "@/lib/demo-cohort";
import { readSnapshot } from "./use-patient-journey";
import { getAccountData } from "@/lib/account-store";

const STORE_EVENTS = [
  "rehub-medicamentos-updated",
  "rehub-dosis-updated",
  "rehub-citas-updated",
  "rehub-animo-updated",
  "rehub-tramites-updated",
  "rehub-reintegracion-updated",
  "rehub-perfil-updated",
];

export interface UseCohort {
  /** `null` hasta que monta en el cliente. */
  cohort: CohortPatient[] | null;
  /** Los del médico de demostración, con el usuario de la sesión al frente. */
  mine: CohortPatient[] | null;
}

export function useCohort(userId?: string | null, userName?: string | null): UseCohort {
  const [cohort, setCohort] = useState<CohortPatient[] | null>(null);

  useEffect(() => {
    const build = () => {
      const now = new Date();
      const generated = buildCohort(now);
      const snapshot = readSnapshot(userId);

      // Solo se suma si de verdad ha empezado a usar la app; si no, ensuciaría
      // los indicadores con un caso vacío.
      const hasActivity = snapshot.medications.length > 0 || snapshot.appointments.length > 0;
      if (!hasActivity) {
        setCohort(generated);
        return;
      }

      const displayName = getAccountData(userId ?? undefined)?.showName || userName || "Tu paciente";
      const self: CohortPatient = {
        id: "sesion-actual",
        name: `${displayName} (tu sesión)`,
        age: 34,
        accidentType: snapshot.accidentType ?? "transito",
        insurer: "ARS Humano",
        employer: "Zona Franca Victoria",
        center: "Centro de Rehabilitación Cibao",
        doctorId: DEMO_DOCTOR.id,
        doctorName: DEMO_DOCTOR.name,
        snapshot,
        journey: computeJourney(snapshot, now),
      };
      setCohort([self, ...generated]);
    };

    build();
    for (const event of STORE_EVENTS) window.addEventListener(event, build);
    return () => {
      for (const event of STORE_EVENTS) window.removeEventListener(event, build);
    };
  }, [userId, userName]);

  return {
    cohort,
    mine: cohort ? cohort.filter((p) => p.doctorId === DEMO_DOCTOR.id) : null,
  };
}
