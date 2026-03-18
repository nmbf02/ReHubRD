"use client";

import type {
  PhysicalState,
  MobilityLevel,
  EmotionalState,
} from "@/types/perfil";
import { savePerfil } from "./profile-store";
import type { PerfilRecuperacion } from "@/types/perfil";

export type HasAccessToMedication = "si" | "no" | "parcial" | "no_se";

export interface CheckIn {
  id: string;
  date: string;
  physicalState: PhysicalState;
  movilityLevel: MobilityLevel;
  emotionalState: EmotionalState;
  wellBeing: number;
  notes?: string;
  /** ¿Tienes acceso a tus medicamentos actualmente? */
  hasAccessToMedication?: HasAccessToMedication;
}

const STORAGE_KEY = "rehub-seguimiento";
const MAX_CHECKINS = 30;
// should check here, this undefined doesn't look right.  TODO: Felix
export function getCheckIns(userId?: string): CheckIn[] {
  if (typeof window === "undefined") return [];
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CheckIn[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addCheckIn(
  checkIn: Omit<CheckIn, "id" | "fecha">,
  userId?: string
): CheckIn {
  const ahora = new Date().toISOString();
  const nuevo: CheckIn = {
    ...checkIn,
    id: `ci-${Date.now()}`,
    date: ahora,
  };
  const existentes = getCheckIns(userId);
  const todos = [nuevo, ...existentes].slice(0, MAX_CHECKINS);
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(todos));
    window.dispatchEvent(new CustomEvent("rehub-seguimiento-updated"));
  }
  return nuevo;
}

export function saveCheckInAndUpdatePerfil(
  checkIn: Omit<CheckIn, "id" | "fecha">,
  profile: PerfilRecuperacion,
  userId?: string
): CheckIn {
  const saved = addCheckIn(checkIn, userId);
  savePerfil(
    {
      accidentState: {},
      overallCondition: {
        estadoFisico: checkIn.physicalState,
        nivelMovilidad: checkIn.movilityLevel,
        estadoEmocional: checkIn.emotionalState,
      },
      contextoSocial: {},
    },
    userId
  );
  return saved;
}
