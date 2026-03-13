"use client";

export interface DatosCuenta {
  showName?: string;
  phoneNumber?: string;
  contactEmail?: string;  // Correo adicional editable (para comunicaciones)
  updated: string;
}

const STORAGE_KEY = "rehub-cuenta";

export function getDatosCuenta(userId?: string): DatosCuenta | null {
  if (typeof window === "undefined") return null;
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DatosCuenta;
  } catch {
    return null;
  }
}

export function saveDatosCuenta(
  datos: { showName?: string; phoneNumber?: string; contactEmail?: string },
  userId?: string
): DatosCuenta {
  const existente = getDatosCuenta(userId);
  const actualizadoEn = new Date().toISOString();
  const completo: DatosCuenta = {
    showName: datos.showName !== undefined ? (datos.showName || undefined) : existente?.showName,
    phoneNumber: datos.phoneNumber !== undefined ? (datos.phoneNumber || undefined) : existente?.phoneNumber,
    contactEmail: datos.contactEmail !== undefined ? (datos.contactEmail || undefined) : existente?.contactEmail,
    updated: actualizadoEn,
  };
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(completo));
      window.dispatchEvent(new CustomEvent("rehub-cuenta-updated"));
    } catch (e) {
      throw new Error(
        "No se pudo guardar. ¿Usas modo incógnito o almacenamiento deshabilitado?"
      );
    }
  }
  return completo;
}
