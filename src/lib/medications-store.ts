"use client";

/**
 * On-device store for the medication schedule (MVP slice 1 — clinical-minimal,
 * zero-cost). Data never leaves the device: it lives in localStorage, mirroring
 * the pattern in `profile-store` / `followup-store`. No server, no PHI on the
 * wire. Sharing / QR / server persistence are a later slice (see docs/plans).
 */

export interface Medication {
  id: string;
  /** Drug name, e.g. "Amoxicilina". */
  name: string;
  /** Free-text dose, e.g. "500 mg". */
  dose?: string;
  /** Daily dose times as "HH:mm", sorted ascending. */
  times: string[];
  withFood?: boolean;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = "rehub-medicamentos";
export const MEDICATIONS_UPDATED_EVENT = "rehub-medicamentos-updated";

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function getMedications(userId?: string | null): Medication[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Medication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMedications(list: Medication[], userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(MEDICATIONS_UPDATED_EVENT));
}

export function upsertMedication(med: Medication, userId?: string | null): Medication[] {
  const list = getMedications(userId);
  const exists = list.some((m) => m.id === med.id);
  const next = exists
    ? list.map((m) => (m.id === med.id ? med : m))
    : [...list, med];
  saveMedications(next, userId);
  return next;
}

export function removeMedication(id: string, userId?: string | null): Medication[] {
  const next = getMedications(userId).filter((m) => m.id !== id);
  saveMedications(next, userId);
  return next;
}
