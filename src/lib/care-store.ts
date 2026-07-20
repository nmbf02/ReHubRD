"use client";

/**
 * On-device store for the care flow: which body regions the person marked as
 * injured, which real center they picked, and (optionally) the real name of the
 * doctor who is treating them — used by the prescription QR. Zero-cost,
 * localStorage only.
 */

import type { BodyRegion } from "./care-catalog";

export interface CareState {
  regions: BodyRegion[];
  centerId: string | null;
  doctorName: string;
}

const STORAGE_KEY = "rehub-care";
export const CARE_UPDATED_EVENT = "rehub-care-updated";

const EMPTY: CareState = { regions: [], centerId: null, doctorName: "" };

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function getCare(userId?: string | null): CareState {
  if (typeof window === "undefined") return EMPTY;
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<CareState>;
    return {
      regions: Array.isArray(parsed.regions) ? (parsed.regions as BodyRegion[]) : [],
      centerId: typeof parsed.centerId === "string" ? parsed.centerId : null,
      doctorName: typeof parsed.doctorName === "string" ? parsed.doctorName : "",
    };
  } catch {
    return EMPTY;
  }
}

export function saveCare(state: CareState, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(CARE_UPDATED_EVENT));
}
