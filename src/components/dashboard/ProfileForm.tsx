"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type {
  PerfilRecuperacion,
  TipoAccidente,
  PhysicalState,
  SituacionLaboral,
  RedApoyo,
  MobilityLevel,
  EmotionalState,
  TipoSeguro,
  ProvinciaRD,
} from "@/types/perfil";
import {
  OPCIONES_TIPO_ACCIDENTE,
  OPCIONES_ESTADO_FISICO,
  OPCIONES_SITUACION_LABORAL,
  OPCIONES_RED_APOYO,
  OPCIONES_NIVEL_MOVILIDAD,
  OPCIONES_ESTADO_EMOCIONAL,
  OPCIONES_TIPO_SEGURO,
  OPCIONES_PROVINCIA,
} from "@/types/perfil";
import { getPerfilInicial, savePerfil, calcularProgreso } from "@/lib/profile-store";
import { identificarNecesidades } from "@/lib/profile-needs";
import { FormField } from "./FormField";
import { IconUser, IconBuilding, IconChart, IconUsers, IconNote } from "@/components/ui/Icons";

interface Props {
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
}

type ErroresForm = Partial<Record<string, string>>;

export function PerfilForm({ userId, userName, userEmail }: Props) {
  const [perfil, setPerfil] = useState<PerfilRecuperacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errores, setErrores] = useState<ErroresForm>({});
  const [seccionAbierta, setSeccionAbierta] = useState<string>("datos");

  const cargarPerfil = useCallback(() => {
    setPerfil(getPerfilInicial(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  function actualizar<T extends keyof PerfilRecuperacion>(
    seccion: T,
    campo: string,
    valor: unknown
  ) {
    if (!perfil) return;
    const actual = perfil[seccion] as Record<string, unknown>;
    setPerfil({
      ...perfil,
      [seccion]: { ...actual, [campo]: valor },
    });
    if (errores[campo]) {
      setErrores((e) => ({ ...e, [campo]: undefined }));
    }
  }

  function validar(): boolean {
    const err: ErroresForm = {};
    if (!perfil) return false;

    if (!perfil.situacionAccidente.tipoAccidente) {
      err.tipoAccidente = "Indica el tipo de accidente.";
    }
    if (!perfil.estadoActual.estadoFisico) {
      err.estadoFisico = "Indica tu estado físico.";
    }
    if (!perfil.estadoActual.nivelMovilidad) {
      err.nivelMovilidad = "Indica tu nivel de movilidad.";
    }
    if (!perfil.estadoActual.estadoEmocional) {
      err.estadoEmocional = "Indica tu estado emocional.";
    }
    if (!perfil.contextoSocial.situacionLaboral) {
      err.situacionLaboral = "Indica tu situación laboral.";
    }
    if (!perfil.contextoSocial.redApoyo) {
      err.redApoyo = "Indica tu red de apoyo.";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil || !validar()) return;

    setIsSaving(true);
    try {
      savePerfil(
        {
          datosPersonales: perfil.datosPersonales,
          accidentState: perfil.situacionAccidente,
          overallCondition: perfil.estadoActual,
          contextoSocial: perfil.contextoSocial,
          notas: perfil.notas,
        },
        userId
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setErrores({ general: "No se pudo guardar. Intenta de nuevo." });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !perfil) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progreso = calcularProgreso(perfil);
  const necesidades = identificarNecesidades(perfil);

  const secciones = [
    { id: "datos", titulo: "Ubicación", Icon: IconUser },
    { id: "accidente", titulo: "Situación del accidente", Icon: IconBuilding },
    { id: "estado", titulo: "Estado actual", Icon: IconChart },
    { id: "contexto", titulo: "Contexto social", Icon: IconUsers },
    { id: "notas", titulo: "Notas adicionales", Icon: IconNote },
  ];

  return (
    <div className="space-y-8">
      {/* Progreso */}
      <div className="bg-white rounded-2xl border border-rehub-light/50 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-rehub-dark">
            Completitud del perfil
          </span>
          <span className="text-sm font-semibold text-rehub-primary">
            {progreso}%
          </span>
        </div>
        <div className="h-2 bg-rehub-light/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-rehub-primary rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errores.general && (
          <div
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            role="alert"
          >
            {errores.general}
          </div>
        )}

        {secciones.map((sec) => (
          <div
            key={sec.id}
            className="bg-white rounded-2xl border border-rehub-light/50 overflow-hidden"
          >
            <button
              type="button"
              onClick={() =>
                setSeccionAbierta((s) => (s === sec.id ? "" : sec.id))
              }
              className="w-full flex items-center justify-between p-6 text-left hover:bg-rehub-light/20 transition-colors"
            >
              <span className="flex items-center gap-3">
                <sec.Icon />
                <span className="font-semibold text-rehub-dark">{sec.titulo}</span>
              </span>
              <svg
                className={`w-5 h-5 text-rehub-dark/60 transition-transform ${
                  seccionAbierta === sec.id ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {seccionAbierta === sec.id && (
              <div className="px-6 pb-6 pt-0 space-y-6 border-t border-rehub-light/50">
                {sec.id === "datos" && (
                  <>
                    <div className="p-4 rounded-xl bg-rehub-light/30 border border-rehub-light/50 text-sm text-rehub-dark/80">
                      <p>
                        Tu <strong>nombre</strong>, <strong>teléfono</strong> y correo de contacto
                        se gestionan en la sección de cuenta.
                      </p>
                      <Link
                        href="/dashboard/cuenta"
                        className="inline-flex items-center gap-1 mt-2 text-rehub-primary font-medium hover:underline"
                      >
                        Ir a Cuenta →
                      </Link>
                    </div>
                    <FormField label="Provincia" optional id="provincia">
                      <select
                        id="provincia"
                        value={perfil.datosPersonales?.provincia ?? ""}
                        onChange={(e) =>
                          setPerfil({
                            ...perfil,
                            datosPersonales: {
                              ...perfil.datosPersonales,
                              provincia: (e.target
                                .value as ProvinciaRD) || undefined,
                            },
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      >
                        <option value="">Selecciona provincia</option>
                        {Object.entries(OPCIONES_PROVINCIA).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Municipio o ciudad" optional id="municipio">
                      <input
                        id="municipio"
                        type="text"
                        value={perfil.datosPersonales?.municipio ?? ""}
                        onChange={(e) =>
                          setPerfil({
                            ...perfil,
                            datosPersonales: {
                              ...perfil.datosPersonales,
                              municipio: e.target.value || undefined,
                            },
                          })
                        }
                        placeholder="Ej: Santo Domingo Este, Santiago"
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      />
                    </FormField>
                  </>
                )}

                {sec.id === "accidente" && (
                  <>
                    <FormField
                      label="Tipo de accidente"
                      error={errores.tipoAccidente}
                      id="tipoAccidente"
                    >
                      <select
                        id="tipoAccidente"
                        value={perfil.situacionAccidente.tipoAccidente ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "situacionAccidente",
                            "tipoAccidente",
                            e.target.value as TipoAccidente
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      >
                        {Object.entries(OPCIONES_TIPO_ACCIDENTE).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Fecha de alta médica" optional>
                      <input
                        type="date"
                        value={
                          perfil.situacionAccidente.fechaAltaMedica ?? ""
                        }
                        onChange={(e) =>
                          actualizar(
                            "situacionAccidente",
                            "fechaAltaMedica",
                            e.target.value || undefined
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      />
                    </FormField>
                    <FormField label="Centro de salud" optional>
                      <input
                        type="text"
                        value={perfil.situacionAccidente.centroSalud ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "situacionAccidente",
                            "centroSalud",
                            e.target.value || undefined
                          )
                        }
                        placeholder="Nombre del hospital o centro"
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      />
                    </FormField>
                    <FormField label="Tipo de seguro" optional>
                      <select
                        value={perfil.situacionAccidente.tipoSeguro ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "situacionAccidente",
                            "tipoSeguro",
                            (e.target.value as TipoSeguro) || undefined
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      >
                        <option value="">Selecciona</option>
                        {Object.entries(OPCIONES_TIPO_SEGURO).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </>
                )}

                {sec.id === "estado" && (
                  <>
                    <FormField
                      label="Estado físico general"
                      error={errores.estadoFisico}
                    >
                      <select
                        value={perfil.estadoActual.estadoFisico ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "estadoActual",
                            "estadoFisico",
                            e.target.value as PhysicalState
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      >
                        {Object.entries(OPCIONES_ESTADO_FISICO).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField
                      label="Nivel de movilidad"
                      error={errores.nivelMovilidad}
                    >
                      <select
                        value={perfil.estadoActual.nivelMovilidad ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "estadoActual",
                            "nivelMovilidad",
                            e.target.value as MobilityLevel
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      >
                        {Object.entries(OPCIONES_NIVEL_MOVILIDAD).map(
                          ([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          )
                        )}
                      </select>
                    </FormField>
                    <FormField
                      label="Estado emocional percibido"
                      error={errores.estadoEmocional}
                    >
                      <select
                        value={perfil.estadoActual.estadoEmocional ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "estadoActual",
                            "estadoEmocional",
                            e.target.value as EmotionalState
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      >
                        {Object.entries(OPCIONES_ESTADO_EMOCIONAL).map(
                          ([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          )
                        )}
                      </select>
                    </FormField>
                    <FormField label="Tratamientos actuales" optional>
                      <input
                        type="text"
                        value={perfil.estadoActual.tratamientosActuales ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "estadoActual",
                            "tratamientosActuales",
                            e.target.value || undefined
                          )
                        }
                        placeholder="Fisioterapia, medicación, etc."
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      />
                    </FormField>
                  </>
                )}

                {sec.id === "contexto" && (
                  <>
                    <FormField
                      label="Situación laboral"
                      error={errores.situacionLaboral}
                    >
                      <select
                        value={perfil.contextoSocial.situacionLaboral ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "contextoSocial",
                            "situacionLaboral",
                            e.target.value as SituacionLaboral
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      >
                        {Object.entries(OPCIONES_SITUACION_LABORAL).map(
                          ([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          )
                        )}
                      </select>
                    </FormField>
                    <FormField
                      label="Red de apoyo familiar / social"
                      error={errores.redApoyo}
                    >
                      <select
                        value={perfil.contextoSocial.redApoyo ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "contextoSocial",
                            "redApoyo",
                            e.target.value as RedApoyo
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      >
                        {Object.entries(OPCIONES_RED_APOYO).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Contacto de emergencia" optional>
                      <input
                        type="text"
                        value={perfil.contextoSocial.contactoEmergencia ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "contextoSocial",
                            "contactoEmergencia",
                            e.target.value || undefined
                          )
                        }
                        placeholder="Nombre de la persona"
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      />
                    </FormField>
                    <FormField label="Teléfono de emergencia" optional>
                      <input
                        type="tel"
                        value={perfil.contextoSocial.telefonoEmergencia ?? ""}
                        onChange={(e) =>
                          actualizar(
                            "contextoSocial",
                            "telefonoEmergencia",
                            e.target.value || undefined
                          )
                        }
                        placeholder="809-000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
                      />
                    </FormField>
                  </>
                )}

                {sec.id === "notas" && (
                  <FormField label="Notas adicionales" optional>
                    <textarea
                      value={perfil.notas ?? ""}
                      onChange={(e) =>
                        setPerfil({
                          ...perfil,
                          notas: e.target.value || undefined,
                        })
                      }
                      rows={4}
                      placeholder="Cualquier información relevante sobre tu situación, necesidades especiales, etc."
                      className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none resize-none"
                    />
                  </FormField>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="sticky bottom-20 lg:bottom-4 z-30 bg-white/95 backdrop-blur-sm py-4 -mx-2 px-2 rounded-xl border border-rehub-light/50">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-rehub-primary text-white rounded-xl font-semibold hover:bg-rehub-secondary transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-rehub-primary/20"
          >
            {isSaving
              ? "Guardando..."
              : saved
              ? "✓ Guardado correctamente"
              : "Guardar perfil"}
          </button>
        </div>
      </form>

      {/* Necesidades identificadas */}
      {necesidades.length > 0 && (
        <div className="bg-white rounded-2xl border border-rehub-light/50 p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-rehub-dark mb-2">
            Necesidades prioritarias identificadas
          </h2>
          <p className="text-sm text-rehub-dark/70 mb-6">
            Según tu perfil, estas son las áreas donde ReHub te puede acompañar.
          </p>
          <div className="space-y-4">
            {necesidades.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border ${
                  n.prioridad === "alta"
                    ? "bg-red-50 border-red-200"
                    : n.prioridad === "media"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-rehub-light/30 border-rehub-light/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded shrink-0 ${
                      n.prioridad === "alta"
                        ? "bg-red-200 text-red-800"
                        : n.prioridad === "media"
                        ? "bg-amber-200 text-amber-800"
                        : "bg-rehub-primary/20 text-rehub-dark"
                    }`}
                  >
                    {n.prioridad === "alta"
                      ? "Alta"
                      : n.prioridad === "media"
                      ? "Media"
                      : "Baja"}
                  </span>
                  <div>
                    <h3 className="font-medium text-rehub-dark">{n.titulo}</h3>
                    <p className="text-sm text-rehub-dark/70 mt-1">
                      {n.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
