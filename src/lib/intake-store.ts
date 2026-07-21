"use client";

/** On-device store for the conversational intake answers. Zero-cost, localStorage. */

import type { IntakeAnswers } from "./intake";

const STORAGE_KEY = "rehub-intake";
export const INTAKE_UPDATED_EVENT = "rehub-intake-updated";

function keyFor(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
}

export function getIntake(userId?: string | null): IntakeAnswers {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(keyFor(userId));
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as IntakeAnswers;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveIntake(answers: IntakeAnswers, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(userId), JSON.stringify(answers));
  window.dispatchEvent(new CustomEvent(INTAKE_UPDATED_EVENT));
}
