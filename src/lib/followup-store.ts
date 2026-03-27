"use client";

import type {
  PhysicalState,
  MobilityLevel,
  EmotionalState,
} from "@/types/profile";
import { saveProfile } from "./profile-store";
import type { PerfilRecuperacion } from "@/types/profile";

export type HasAccessToMedication = "si" | "no" | "parcial" | "no_se";

/** Immediate needs flagged in a check-in (aligns with urgency-detention). */
export type CheckInImmediateNeed =
  | "medicamentos"
  | "transporte"
  | "apoyo_emocional"
  | "estoy_sola"
  | "asistencia"
  | "dolor";

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
  /** When the follow-up form collects explicit need tags */
  necesidadesAhora?: CheckInImmediateNeed[];
}

const STORAGE_KEY = "rehub-seguimiento";
const MAX_CHECKINS = 30;
// should check here, this undefined doesn't look right. neither the userId as type string wtf xd TODO: Felix
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
  checkIn: Omit<CheckIn, "id" | "date">,
  userId?: string
): CheckIn {
  const ahora = new Date().toISOString();
  const newUser: CheckIn = {
    ...checkIn,
    id: `ci-${Date.now()}`,
    date: ahora,
  };
  const existentUsers = getCheckIns(userId);
  const allUsers = [newUser, ...existentUsers].slice(0, MAX_CHECKINS);
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(allUsers));
    window.dispatchEvent(new CustomEvent("rehub-seguimiento-updated"));
  }
  return newUser;
}

export function saveCheckInAndUpdatePerfil(
  checkIn: Omit<CheckIn, "id" | "date">,
  profile: PerfilRecuperacion,
  userId?: string
): CheckIn {
  const saved = addCheckIn(checkIn, userId);
  saveProfile(
    {
      accidentState: {},
      overallCondition: {
        physicalState: checkIn.physicalState,
        mobilityLevel: checkIn.movilityLevel,
        emotionalState: checkIn.emotionalState,
      },
      socialContext: {},
    },
    userId
  );
  return saved;
}
