"use client";

import { useTranslations } from "next-intl";

/** Copy for `data.scenarios` (messages/data-scenarios.json). */
export function useScenarioCopy() {
  const t = useTranslations("data.scenarios");

  return {
    nombre: (scenarioId: string) => t(`${scenarioId}.nombre`),
    descripcion: (scenarioId: string) => t(`${scenarioId}.descripcion`),
    frecuenciaSeguimiento: (scenarioId: string) =>
      t(`${scenarioId}.frecuenciaSeguimiento`),
    pasoTitulo: (scenarioId: string, pasoIndex: number) =>
      t(`${scenarioId}.pasos.${pasoIndex}.titulo`),
    pasoDescripcion: (scenarioId: string, pasoIndex: number) =>
      t(`${scenarioId}.pasos.${pasoIndex}.descripcion`),
    pasoAccion: (scenarioId: string, pasoIndex: number) =>
      t(`${scenarioId}.pasos.${pasoIndex}.accion`),
    contactoNombre: (scenarioId: string, contactIndex: number) =>
      t(`${scenarioId}.contactos.${contactIndex}.nombre`),
  };
}
