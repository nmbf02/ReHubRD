"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  User,
  Building2,
  Activity,
  Users,
  FileText,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
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
} from "@/types/profile";
import {
  OPCIONES_TIPO_ACCIDENTE,
  OPCIONES_ESTADO_FISICO,
  OPCIONES_SITUACION_LABORAL,
  OPCIONES_RED_APOYO,
  OPCIONES_NIVEL_MOVILIDAD,
  OPCIONES_ESTADO_EMOCIONAL,
  OPCIONES_TIPO_SEGURO,
  OPCIONES_PROVINCIA,
} from "@/types/profile";
import { getPerfilInicial, saveProfile, calcularProgreso } from "@/lib/profile-store";
import { ROUTES } from "@/lib/routes";
import { identificarNecesidades } from "@/lib/profile-needs";
import { FormField } from "./FormField";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

interface Props {
  userId?: string;
  userName?: string | null;
  userEmail?: string | null;
}

type ErroresForm = Partial<Record<string, string>>;

const inputClass =
  "w-full rounded-xl border border-rehub-200 bg-white px-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15";

export function PerfilForm({ userId, userName, userEmail }: Props) {
  const tp = useTranslations("dashboard.profileForm");
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
      err.tipoAccidente = tp("validation.tipoAccidente");
    }
    if (!perfil.estadoActual.physicalState) {
      err.estadoFisico = tp("validation.estadoFisico");
    }
    if (!perfil.estadoActual.mobilityLevel) {
      err.nivelMovilidad = tp("validation.nivelMovilidad");
    }
    if (!perfil.estadoActual.emotionalState) {
      err.estadoEmocional = tp("validation.estadoEmocional");
    }
    if (!perfil.contextoSocial.situacionLaboral) {
      err.situacionLaboral = tp("validation.situacionLaboral");
    }
    if (!perfil.contextoSocial.redApoyo) {
      err.redApoyo = tp("validation.redApoyo");
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil || !validar()) return;

    setIsSaving(true);
    try {
      saveProfile(
        {
          datosPersonales: perfil.datosPersonales,
          accidentState: perfil.situacionAccidente,
          overallCondition: perfil.estadoActual,
          socialContext: perfil.contextoSocial,
          notas: perfil.notas,
        },
        userId
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setErrores({ general: tp("errors.saveFailed") });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !perfil) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rehub-primary border-t-transparent" />
      </div>
    );
  }

  const progreso = calcularProgreso(perfil);
  const necesidades = identificarNecesidades(perfil);

  const secciones = [
    { id: "datos", titulo: tp("sections.datos"), Icon: User },
    { id: "accidente", titulo: tp("sections.accidente"), Icon: Building2 },
    { id: "estado", titulo: tp("sections.estado"), Icon: Activity },
    { id: "contexto", titulo: tp("sections.contexto"), Icon: Users },
    { id: "notas", titulo: tp("sections.notas"), Icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Completitud bar */}
      <Reveal>
        <div className="rounded-2xl border border-rehub-100 bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-rehub-900">
              {tp("completitud")}
            </span>
            <span className="text-sm font-semibold text-rehub-600">
              {progreso}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-rehub-100">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </Reveal>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errores.general && (
          <div
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errores.general}
          </div>
        )}

        <Stagger className="space-y-4">
          {secciones.map((sec) => {
            const isOpen = seccionAbierta === sec.id;
            return (
              <StaggerItem key={sec.id}>
                <div className="overflow-hidden rounded-2xl border border-rehub-100 bg-white shadow-soft transition-all hover:border-rehub-200 hover:shadow-card">
                  {/* Section header / toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setSeccionAbierta((s) => (s === sec.id ? "" : sec.id))
                    }
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-rehub-50/60"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                        <sec.Icon className="h-4 w-4" />
                      </span>
                      <span className="font-semibold text-rehub-950">{sec.titulo}</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-rehub-900/50 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="space-y-5 border-t border-rehub-100 px-5 pb-6 pt-5">
                      {sec.id === "datos" && (
                        <>
                          <div className="rounded-xl border border-rehub-100 bg-rehub-50/60 p-4 text-sm text-rehub-900/75">
                            <p>
                              {tp.rich("accountHint", {
                                name: (chunks) => <strong>{chunks}</strong>,
                                phone: (chunks) => <strong>{chunks}</strong>,
                              })}
                            </p>
                            <Link
                              href={ROUTES.account}
                              className="mt-2 inline-flex items-center gap-1 font-medium text-rehub-600 hover:underline"
                            >
                              {tp("goAccount")}
                            </Link>
                          </div>
                          <FormField label={tp("provincia")} optional id="provincia">
                            <select
                              id="provincia"
                              value={perfil.datosPersonales?.provincia ?? ""}
                              onChange={(e) =>
                                setPerfil({
                                  ...perfil,
                                  datosPersonales: {
                                    ...perfil.datosPersonales,
                                    provincia: (e.target.value as ProvinciaRD) || undefined,
                                  },
                                })
                              }
                              className={inputClass}
                            >
                              <option value="">{tp("selectProvincia")}</option>
                              {Object.entries(OPCIONES_PROVINCIA).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label={tp("municipio")} optional id="municipio">
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
                              placeholder={tp("municipioPh")}
                              className={inputClass}
                            />
                          </FormField>
                        </>
                      )}

                      {sec.id === "accidente" && (
                        <>
                          <FormField
                            label={tp("tipoAccidente")}
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
                              className={inputClass}
                            >
                              {Object.entries(OPCIONES_TIPO_ACCIDENTE).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label={tp("fechaAlta")} optional>
                            <input
                              type="date"
                              value={perfil.situacionAccidente.fechaAltaMedica ?? ""}
                              onChange={(e) =>
                                actualizar(
                                  "situacionAccidente",
                                  "fechaAltaMedica",
                                  e.target.value || undefined
                                )
                              }
                              className={inputClass}
                            />
                          </FormField>
                          <FormField label={tp("centroSalud")} optional>
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
                              placeholder={tp("centroSaludPh")}
                              className={inputClass}
                            />
                          </FormField>
                          <FormField label={tp("tipoSeguro")} optional>
                            <select
                              value={perfil.situacionAccidente.tipoSeguro ?? ""}
                              onChange={(e) =>
                                actualizar(
                                  "situacionAccidente",
                                  "tipoSeguro",
                                  (e.target.value as TipoSeguro) || undefined
                                )
                              }
                              className={inputClass}
                            >
                              <option value="">{tp("selectOption")}</option>
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
                            label={tp("estadoFisico")}
                            error={errores.estadoFisico}
                          >
                            <select
                              value={perfil.estadoActual.physicalState ?? ""}
                              onChange={(e) =>
                                actualizar(
                                  "estadoActual",
                                  "estadoFisico",
                                  e.target.value as PhysicalState
                                )
                              }
                              className={inputClass}
                            >
                              {Object.entries(OPCIONES_ESTADO_FISICO).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </FormField>
                          <FormField
                            label={tp("nivelMovilidad")}
                            error={errores.nivelMovilidad}
                          >
                            <select
                              value={perfil.estadoActual.mobilityLevel ?? ""}
                              onChange={(e) =>
                                actualizar(
                                  "estadoActual",
                                  "nivelMovilidad",
                                  e.target.value as MobilityLevel
                                )
                              }
                              className={inputClass}
                            >
                              {Object.entries(OPCIONES_NIVEL_MOVILIDAD).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </FormField>
                          <FormField
                            label={tp("estadoEmocional")}
                            error={errores.estadoEmocional}
                          >
                            <select
                              value={perfil.estadoActual.emotionalState ?? ""}
                              onChange={(e) =>
                                actualizar(
                                  "estadoActual",
                                  "estadoEmocional",
                                  e.target.value as EmotionalState
                                )
                              }
                              className={inputClass}
                            >
                              {Object.entries(OPCIONES_ESTADO_EMOCIONAL).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label={tp("tratamientos")} optional>
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
                              placeholder={tp("tratamientosPh")}
                              className={inputClass}
                            />
                          </FormField>
                        </>
                      )}

                      {sec.id === "contexto" && (
                        <>
                          <FormField
                            label={tp("situacionLaboral")}
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
                              className={inputClass}
                            >
                              {Object.entries(OPCIONES_SITUACION_LABORAL).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </FormField>
                          <FormField
                            label={tp("redApoyo")}
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
                              className={inputClass}
                            >
                              {Object.entries(OPCIONES_RED_APOYO).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </FormField>
                          <FormField label={tp("contactoEmergencia")} optional>
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
                              placeholder={tp("contactoEmergenciaPh")}
                              className={inputClass}
                            />
                          </FormField>
                          <FormField label={tp("telefonoEmergencia")} optional>
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
                              className={inputClass}
                            />
                          </FormField>
                        </>
                      )}

                      {sec.id === "notas" && (
                        <FormField label={tp("notas")} optional>
                          <textarea
                            value={perfil.notas ?? ""}
                            onChange={(e) =>
                              setPerfil({
                                ...perfil,
                                notas: e.target.value || undefined,
                              })
                            }
                            rows={4}
                            placeholder={tp("notasPh")}
                            className={`${inputClass} resize-none`}
                          />
                        </FormField>
                      )}
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Sticky save bar */}
        <div className="sticky bottom-20 z-30 -mx-2 rounded-xl border border-rehub-100 bg-white/95 px-4 py-3 shadow-elevated backdrop-blur-sm lg:bottom-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saved && <CheckCircle2 className="h-4 w-4" />}
            {isSaving
              ? tp("saveSaving")
              : saved
              ? tp("saveSaved")
              : tp("saveSubmit")}
          </button>
        </div>
      </form>

      {/* Necesidades identificadas */}
      {necesidades.length > 0 && (
        <Reveal>
          <div className="rounded-2xl border border-rehub-100 bg-white p-6 shadow-soft lg:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-rehub-950">
                  {tp("needsTitle")}
                </h2>
                <p className="text-sm text-rehub-900/65">
                  {tp("needsSub")}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {necesidades.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border p-4 ${
                    n.prioridad === "alta"
                      ? "border-red-200 bg-red-50"
                      : n.prioridad === "media"
                      ? "border-amber-200 bg-amber-50"
                      : "border-rehub-100 bg-rehub-50/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        n.prioridad === "alta"
                          ? "bg-red-200 text-red-800"
                          : n.prioridad === "media"
                          ? "bg-amber-200 text-amber-800"
                          : "bg-rehub-100 text-rehub-700"
                      }`}
                    >
                      {n.prioridad === "alta"
                        ? tp("priorityHigh")
                        : n.prioridad === "media"
                        ? tp("priorityMedium")
                        : tp("priorityLow")}
                    </span>
                    <div>
                      <h3 className="font-medium text-rehub-950">{n.titulo}</h3>
                      <p className="mt-1 text-sm text-rehub-900/65">
                        {n.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
