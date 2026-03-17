"use client";

import type {
  EstadoFisico,
  NivelMovilidad,
  EstadoEmocional,
} from "@/types/perfil";
import { savePerfil } from "./profile-store";
import type { PerfilRecuperacion } from "@/types/perfil";

export type AccesoMedicamentos = "si" | "no" | "parcial" | "no_se";

export interface CheckIn {
  id: string;
  fecha: string;
  estadoFisico: EstadoFisico;
  nivelMovilidad: NivelMovilidad;
  estadoEmocional: EstadoEmocional;
  bienestar: number;
  notas?: string;
  /** ¿Tienes acceso a tus medicamentos actualmente? */
  accesoMedicamentos?: AccesoMedicamentos;
}

const STORAGE_KEY = "rehub-seguimiento";
const MAX_CHECKINS = 30;

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
    fecha: ahora,
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
  perfil: PerfilRecuperacion,
  userId?: string
): CheckIn {
  const guardado = addCheckIn(checkIn, userId);
  savePerfil(
    {
      situacionAccidente: {},
      estadoActual: {
        estadoFisico: checkIn.estadoFisico,
        nivelMovilidad: checkIn.nivelMovilidad,
        estadoEmocional: checkIn.estadoEmocional,
      },
      contextoSocial: {},
    },
    userId
  );
  return guardado;
}
