"use client";

import type { PerfilRecuperacion } from "@/types/perfil";

const STORAGE_KEY = "rehub-perfil";
const VERSION_ACTUAL = 1;

const PERFIL_VACIO: Omit<PerfilRecuperacion, "creadoEn" | "actualizadoEn"> = {
  version: VERSION_ACTUAL,
  situacionAccidente: {
    tipoAccidente: "transito",
  },
  estadoActual: {
    estadoFisico: "recuperacion",
    nivelMovilidad: "leves",
    estadoEmocional: "estres",
  },
  contextoSocial: {
    situacionLaboral: "incapacidad_temporal",
    redApoyo: "moderada",
  },
};

function migrarPerfil(raw: unknown): PerfilRecuperacion | null {
  const ahora = new Date().toISOString();

  // Migración desde versión antigua (estructura plana)
  if (raw && typeof raw === "object" && "tipoAccidente" in raw && !("situacionAccidente" in raw)) {
    const viejo = raw as Record<string, unknown>;
    return {
      version: VERSION_ACTUAL,
      situacionAccidente: {
        tipoAccidente: (viejo.tipoAccidente as PerfilRecuperacion["situacionAccidente"]["tipoAccidente"]) ?? "transito",
        fechaAltaMedica: viejo.fechaAlta as string | undefined,
        tipoSeguro: undefined,
      },
      estadoActual: {
        estadoFisico: (viejo.estadoFisico as PerfilRecuperacion["estadoActual"]["estadoFisico"]) ?? "recuperacion",
        nivelMovilidad: (viejo.nivelMovilidad as PerfilRecuperacion["estadoActual"]["nivelMovilidad"]) ?? "leves",
        estadoEmocional: (viejo.estadoEmocional as PerfilRecuperacion["estadoActual"]["estadoEmocional"]) ?? "estres",
      },
      contextoSocial: {
        situacionLaboral: (viejo.situacionLaboral as PerfilRecuperacion["contextoSocial"]["situacionLaboral"]) ?? "incapacidad_temporal",
        redApoyo: (viejo.redApoyo as PerfilRecuperacion["contextoSocial"]["redApoyo"]) ?? "moderada",
      },
      notas: viejo.notas as string | undefined,
      creadoEn: (viejo.actualizadoEn as string) ?? ahora,
      actualizadoEn: ahora,
    };
  }

  // Estructura nueva con validación básica
  if (raw && typeof raw === "object" && "situacionAccidente" in raw) {
    const p = raw as Record<string, unknown>;
    const situacion = p.situacionAccidente as PerfilRecuperacion["situacionAccidente"];
    const estado = p.estadoActual as PerfilRecuperacion["estadoActual"];
    const contexto = p.contextoSocial as PerfilRecuperacion["contextoSocial"];

    if (situacion && estado && contexto) {
      return {
        version: (p.version as number) ?? VERSION_ACTUAL,
        datosPersonales: p.datosPersonales as PerfilRecuperacion["datosPersonales"],
        situacionAccidente: situacion,
        estadoActual: estado,
        contextoSocial: contexto,
        notas: p.notas as string | undefined,
        creadoEn: (p.creadoEn as string) ?? ahora,
        actualizadoEn: (p.actualizadoEn as string) ?? ahora,
      };
    }
  }

  return null;
}

export function getPerfil(userId?: string): PerfilRecuperacion | null {
  if (typeof window === "undefined") return null;
  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return migrarPerfil(parsed);
  } catch {
    return null;
  }
}

export function savePerfil(
  perfil: {
    datosPersonales?: PerfilRecuperacion["datosPersonales"];
    situacionAccidente: Partial<PerfilRecuperacion["situacionAccidente"]>;
    estadoActual: Partial<PerfilRecuperacion["estadoActual"]>;
    contextoSocial: Partial<PerfilRecuperacion["contextoSocial"]>;
    notas?: string;
  },
  userId?: string
): PerfilRecuperacion {
  const existente = getPerfil(userId);
  const ahora = new Date().toISOString();

  const situacionBase = existente?.situacionAccidente ?? PERFIL_VACIO.situacionAccidente;
  const estadoBase = existente?.estadoActual ?? PERFIL_VACIO.estadoActual;
  const contextoBase = existente?.contextoSocial ?? PERFIL_VACIO.contextoSocial;

  const completo: PerfilRecuperacion = {
    version: VERSION_ACTUAL,
    datosPersonales: perfil.datosPersonales ?? existente?.datosPersonales,
    situacionAccidente: { ...situacionBase, ...perfil.situacionAccidente },
    estadoActual: { ...estadoBase, ...perfil.estadoActual },
    contextoSocial: { ...contextoBase, ...perfil.contextoSocial },
    notas: perfil.notas ?? existente?.notas,
    creadoEn: existente?.creadoEn ?? ahora,
    actualizadoEn: ahora,
  };

  const key = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(completo));
  }
  return completo;
}

export function getPerfilInicial(userId?: string): PerfilRecuperacion {
  const existente = getPerfil(userId);
  if (existente) return existente;

  const ahora = new Date().toISOString();
  return {
    ...PERFIL_VACIO,
    situacionAccidente: { ...PERFIL_VACIO.situacionAccidente },
    estadoActual: { ...PERFIL_VACIO.estadoActual },
    contextoSocial: { ...PERFIL_VACIO.contextoSocial },
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}

export function calcularProgreso(perfil: PerfilRecuperacion): number {
  let completados = 0;
  const total = 10;

  if (perfil.datosPersonales?.provincia) completados++;
  if (perfil.situacionAccidente.tipoAccidente) completados++;
  if (perfil.situacionAccidente.fechaAltaMedica) completados++;
  if (perfil.situacionAccidente.tipoSeguro) completados++;
  if (perfil.estadoActual.estadoFisico) completados++;
  if (perfil.estadoActual.nivelMovilidad) completados++;
  if (perfil.estadoActual.estadoEmocional) completados++;
  if (perfil.contextoSocial.situacionLaboral) completados++;
  if (perfil.contextoSocial.redApoyo) completados++;
  if (perfil.contextoSocial.contactoEmergencia || perfil.contextoSocial.telefonoEmergencia) completados++;

  return Math.round((completados / total) * 100);
}
