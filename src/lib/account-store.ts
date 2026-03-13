"use client";

export interface AccountDataProps {
  showName?: string;
  phoneNumber?: string;
  contactEmail?: string;  // Correo adicional editable (para comunicaciones)
  updated: string;
}

const STORAGE_KEY = "rehub-cuenta";

export function getAccountData(userId?: string): AccountDataProps | null {
  if (typeof window === "undefined") return null;
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AccountDataProps;
  } catch {
    return null;
  }
}

export function saveAccountData(
  data: { showName?: string; phoneNumber?: string; contactEmail?: string },
  userId?: string
): AccountDataProps {
  const account = getAccountData(userId);
  const updated = new Date().toISOString();
  const AccountDataInfo: AccountDataProps = {
    showName: data.showName !== undefined ? (data.showName || undefined) : account?.showName,
    phoneNumber: data.phoneNumber !== undefined ? (data.phoneNumber || undefined) : account?.phoneNumber,
    contactEmail: data.contactEmail !== undefined ? (data.contactEmail || undefined) : account?.contactEmail,
    updated: updated,
  };
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(AccountDataInfo));
      window.dispatchEvent(new CustomEvent("rehub-cuenta-updated"));
    } catch (e) {
      throw new Error(
        "No se pudo guardar. ¿Usas modo incógnito o almacenamiento deshabilitado?"
      );
    }
  }
  return AccountDataInfo;
}
