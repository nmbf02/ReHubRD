"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconRefresh,
  IconClipboard,
  IconBook,
  IconUser,
} from "@/components/ui/Icons";
import { getPerfilInicial } from "@/lib/profile-store";
import {
  getCheckIns,
  saveCheckInAndUpdatePerfil,
  type HasAccessToMedication,
} from "@/lib/followup-store";
import {
  identificarEscenario,
  type FlujoEscenario,
} from "@/lib/scenary-workflow";
import type { PhysicalState, MobilityLevel, EmotionalState } from "@/types/profile";
import {
  OPCIONES_ESTADO_FISICO,
  OPCIONES_NIVEL_MOVILIDAD,
  OPCIONES_ESTADO_EMOCIONAL,
} from "@/types/profile";

interface Props {
  userId?: string | null;
}

function formatFecha(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-DO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const LABEL_BIENESTAR: Record<number, string> = {
  1: "Muy bajo",
  2: "Bajo",
  3: "Regular",
  4: "Bien",
  5: "Muy bien",
};

export function SeguimientoView({ userId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [estadoFisico, setEstadoFisico] = useState<PhysicalState>("recuperacion");
  const [nivelMovilidad, setNivelMovilidad] = useState<MobilityLevel>("leves");
  const [estadoEmocional, setEstadoEmocional] = useState<EmotionalState>("estres");
  const [bienestar, setBienestar] = useState(3);
  const [accesoMedicamentos, setAccesoMedicamentos] = useState<HasAccessToMedication | "">("");
  const [notas, setNotas] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flujoRecomendado, setFlujoRecomendado] = useState<FlujoEscenario | null>(null);
  const [checkIns, setCheckIns] = useState<ReturnType<typeof getCheckIns>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const perfil = getPerfilInicial(userId ?? undefined);
    setEstadoFisico(perfil.estadoActual.physicalState ?? "recuperacion");
    setNivelMovilidad(perfil.estadoActual.mobilityLevel ?? "leves");
    setEstadoEmocional(perfil.estadoActual.emotionalState ?? "estres");
    const cis = getCheckIns(userId ?? undefined);
    setCheckIns(cis);
    // Mostrar flujo recomendado según último check-in si existe
    if (cis.length > 0) {
      const ultimo = cis[0]!;
      const escenario = identificarEscenario({
        bienestar: ultimo.wellBeing,
        nivelMovilidad: ultimo.movilityLevel,
        accesoMedicamentos: ultimo.hasAccessToMedication,
        redApoyo: perfil.contextoSocial?.redApoyo,
        estadoEmocional: ultimo.emotionalState,
      });
      setFlujoRecomendado(escenario);
    }
  }, [mounted, userId ?? undefined]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => setCheckIns(getCheckIns(userId ?? undefined));
    window.addEventListener("rehub-seguimiento-updated", handler);
    return () => window.removeEventListener("rehub-seguimiento-updated", handler);
  }, [mounted, userId ?? undefined]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    setFlujoRecomendado(null);
    const perfil = getPerfilInicial(userId ?? undefined);
    const datosCheckIn = {
      estadoFisico,
      nivelMovilidad,
      estadoEmocional,
      bienestar,
      notas: notas.trim() || undefined,
      accesoMedicamentos: accesoMedicamentos || undefined,
    };
    saveCheckInAndUpdatePerfil(datosCheckIn, perfil, userId ?? undefined);
    const escenario = identificarEscenario({
      bienestar,
      nivelMovilidad,
      accesoMedicamentos: accesoMedicamentos || undefined,
      redApoyo: perfil.contextoSocial?.redApoyo,
      estadoEmocional,
    });
    setFlujoRecomendado(escenario);
    setIsSaving(false);
    setSaved(true);
    setCheckIns(getCheckIns(userId ?? undefined));
    setNotas("");
    setTimeout(() => setSaved(false), 5000);
  }

  if (!mounted) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Flujo de recuperación */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-rehub-dark/80 uppercase tracking-wider">
            Tu flujo de recuperación
          </h2>
        </div>
        <div className="p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard/perfil"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconUser className="w-4 h-4" />
              1. Mi perfil
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <Link
              href="/dashboard/plan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconClipboard className="w-4 h-4" />
              2. Mi plan
            </Link>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rehub-primary/15 text-rehub-primary border border-rehub-primary/30 text-sm font-medium">
              <IconRefresh className="w-4 h-4" />
              3. Seguimiento
            </span>
            <span className="text-slate-300 hidden sm:inline">→</span>
            <Link
              href="/dashboard/recursos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-rehub-dark hover:bg-rehub-primary/10 hover:text-rehub-primary transition-colors text-sm font-medium"
            >
              <IconBook className="w-4 h-4" />
              4. Recursos
            </Link>
          </div>
        </div>
      </section>

      {/* Formulario de check-in */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            Nuevo check-in
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            Registra tu estado actual para que el plan se adapte a tu evolución
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-rehub-dark mb-2">
              ¿Cómo te sientes hoy? (escala general)
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setBienestar(n)}
                  className={`w-12 h-12 rounded-xl font-semibold text-sm transition-colors ${
                    bienestar === n
                      ? "bg-rehub-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-rehub-dark/60">
              {LABEL_BIENESTAR[bienestar]}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-rehub-dark mb-2">
              Estado físico
            </label>
            <select
              value={estadoFisico}
              onChange={(e) => setEstadoFisico(e.target.value as PhysicalState)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
            >
              {Object.entries(OPCIONES_ESTADO_FISICO).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rehub-dark mb-2">
              Nivel de movilidad
            </label>
            <select
              value={nivelMovilidad}
              onChange={(e) => setNivelMovilidad(e.target.value as MobilityLevel)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
            >
              {Object.entries(OPCIONES_NIVEL_MOVILIDAD).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rehub-dark mb-2">
              Estado emocional
            </label>
            <select
              value={estadoEmocional}
              onChange={(e) => setEstadoEmocional(e.target.value as EmotionalState)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
            >
              {Object.entries(OPCIONES_ESTADO_EMOCIONAL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-rehub-dark mb-2">
              ¿Tienes acceso a tus medicamentos actualmente?
            </label>
            <select
              value={accesoMedicamentos}
              onChange={(e) => setAccesoMedicamentos(e.target.value as HasAccessToMedication | "")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
            >
              <option value="">No aplica / No tomo medicamentos</option>
              <option value="si">Sí, tengo acceso</option>
              <option value="no">No, no tengo acceso</option>
              <option value="parcial">Parcial (faltan algunos)</option>
              <option value="no_se">No sé</option>
            </select>
            <p className="mt-1 text-xs text-rehub-dark/50">
              Tu respuesta ayuda a personalizar el plan. Si no tienes medicamentos, te guiamos a recursos gratuitos.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-rehub-dark mb-2">
              Notas <span className="text-rehub-dark/50 font-normal">(opcional)</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Dificultades, logros, algo que quieras registrar..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-rehub-primary text-white rounded-xl font-semibold hover:bg-rehub-secondary transition-colors disabled:opacity-70"
          >
            {isSaving ? "Guardando..." : saved ? "✓ Registrado" : "Registrar check-in"}
          </button>
        </form>
      </section>

      {/* Flujo recomendado (tras guardar) */}
      {flujoRecomendado && (
        <section
          className={`rounded-2xl border overflow-hidden ${
            flujoRecomendado.prioridad === "urgente"
              ? "bg-red-50/80 border-red-200"
              : "bg-white border-slate-200/80 shadow-sm"
          }`}
        >
          <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{flujoRecomendado.emoji}</span>
              <div>
                <h2 className="text-lg font-semibold text-rehub-dark">
                  Tu plan según tu situación
                </h2>
                <p className="text-sm text-rehub-dark/70 mt-0.5">
                  {flujoRecomendado.nombre}
                </p>
                <p className="text-xs text-rehub-dark/60 mt-1">
                  Seguimiento sugerido: {flujoRecomendado.frecuenciaSeguimiento}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8 space-y-4">
            {flujoRecomendado.contactosDirectos && flujoRecomendado.contactosDirectos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {flujoRecomendado.contactosDirectos.map((c) => (
                  <a
                    key={c.nombre}
                    href={`tel:${c.numero.replace(/\D/g, "")}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rehub-primary text-white rounded-lg text-sm font-medium hover:bg-rehub-secondary transition-colors"
                  >
                    {c.nombre}: {c.numero}
                  </a>
                ))}
              </div>
            )}
            <ol className="space-y-3">
              {flujoRecomendado.pasos.map((paso) => (
                <li key={paso.orden} className="flex gap-4">
                  <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-rehub-primary/20 text-rehub-primary font-semibold text-sm">
                    {paso.orden}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-rehub-dark">{paso.titulo}</p>
                    <p className="text-sm text-rehub-dark/70 mt-0.5">{paso.descripcion}</p>
                    {paso.href && (
                      <Link
                        href={paso.href}
                        className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${
                          paso.urgente ? "text-red-600 hover:text-red-700" : "text-rehub-primary hover:text-rehub-secondary"
                        }`}
                      >
                        {paso.accion}
                        <span aria-hidden>→</span>
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/dashboard/recursos#flujos-guia"
              className="inline-block mt-4 text-sm font-medium text-rehub-primary hover:underline"
            >
              Ver guía completa de flujos por situación →
            </Link>
          </div>
        </section>
      )}

      {/* Historial */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            Historial de check-ins
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            Tus registros recientes
          </p>
        </div>
        <div className="p-6 lg:p-8">
          {checkIns.length === 0 ? (
            <div className="text-center py-12 text-rehub-dark/60">
              <IconRefresh className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aún no tienes check-ins registrados.</p>
              <p className="text-sm mt-1">Completa el formulario de arriba para comenzar.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {checkIns.map((ci) => (
                <li
                  key={ci.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-rehub-dark">
                      {formatFecha(ci.date)}
                    </span>
                    <span className="text-sm font-semibold text-rehub-primary">
                      Bienestar: {ci.wellBeing}/5
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-rehub-dark/70">
                    <span>{OPCIONES_ESTADO_FISICO[ci.physicalState]}</span>
                    <span>·</span>
                    <span>{OPCIONES_NIVEL_MOVILIDAD[ci.movilityLevel]}</span>
                    <span>·</span>
                    <span>{OPCIONES_ESTADO_EMOCIONAL[ci.emotionalState]}</span>
                    {ci.hasAccessToMedication && (
                      <>
                        <span>·</span>
                        <span>
                          Medicamentos: {ci.hasAccessToMedication === "si" ? "Sí" : ci.hasAccessToMedication === "no" ? "No" : ci.hasAccessToMedication === "parcial" ? "Parcial" : "N/A"}
                        </span>
                      </>
                    )}
                  </div>
                  {ci.notes && (
                    <p className="mt-2 text-sm text-rehub-dark/80 border-t border-slate-100 pt-2">
                      {ci.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Ayuda gratuita y Planes de acogida */}
      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-rehub-dark">
            Ayuda gratuita y Planes de acogida
          </h2>
          <p className="mt-1 text-sm text-rehub-dark/60">
            Si necesitas servicios sin costo o programas de acompañamiento
          </p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/recursos#ayuda-gratuita"
              className="flex items-start gap-4 p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-rehub-primary/40 transition-all group"
            >
              <span className="text-2xl">🎁</span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  Ayuda gratuita
                </h3>
                <p className="text-sm text-rehub-dark/70 mt-1">
                  Líneas 811 y 809-200-1400, medicamentos Promese/CAL, ADR, programas sociales.
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-rehub-primary">Ver recursos →</span>
              </div>
            </Link>
            <Link
              href="/dashboard/recursos#planes-acogida"
              className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-rehub-primary/5 hover:border-rehub-primary/30 transition-all group"
            >
              <span className="text-2xl">🏠</span>
              <div>
                <h3 className="font-semibold text-rehub-dark group-hover:text-rehub-primary transition-colors">
                  Planes de acogida
                </h3>
                <p className="text-sm text-rehub-dark/70 mt-1">
                  ADR (35 centros), seguimiento post-alta, grupos de apoyo, reinserción laboral.
                </p>
                <span className="mt-2 inline-block text-sm font-medium text-rehub-primary">Ver recursos →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Enlaces */}
      <section className="bg-gradient-to-r from-rehub-primary/5 to-rehub-accent/5 rounded-2xl border border-rehub-primary/20 p-6 lg:p-8">
        <h3 className="font-semibold text-rehub-dark mb-4">Relacionado</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/plan"
            className="inline-flex items-center gap-2 px-5 py-3 bg-rehub-primary text-white rounded-xl font-medium hover:bg-rehub-secondary transition-colors"
          >
            <IconClipboard className="w-5 h-5" />
            Ver mi plan
          </Link>
          <Link
            href="/dashboard/recursos"
            className="inline-flex items-center gap-2 px-5 py-3 border border-rehub-primary/30 text-rehub-primary rounded-xl font-medium hover:bg-rehub-primary/5 transition-colors"
          >
            <IconBook className="w-5 h-5" />
            Recursos
          </Link>
        </div>
      </section>
    </div>
  );
}
