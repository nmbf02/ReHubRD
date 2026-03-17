"use client";

import { useState, useEffect } from "react";
import {
  obtenerSitiosCercanos,
  type SitioCercano,
  type TipoSitio,
} from "@/lib/nearby-places";
import { getPerfilInicial } from "@/lib/profile-store";
import { getNecesidadesSeleccionadas } from "@/lib/needs-options";
import { OPCIONES_PROVINCIA } from "@/types/perfil";
import type { ProvinciaRD } from "@/types/perfil";

interface Props {
  userId?: string | null;
}

const ETIQUETA_TIPO: Record<TipoSitio, string> = {
  emergencia: "Emergencia",
  salud_mental: "Salud mental",
  hospital: "Hospital",
  centro_salud: "Centro de salud",
  rehabilitacion: "Rehabilitación",
  farmacia: "Farmacia",
  medicamentos: "Medicamentos",
  trámites: "Trámites",
};

const EMOJI_TIPO: Record<TipoSitio, string> = {
  emergencia: "🚨",
  salud_mental: "💚",
  hospital: "🏥",
  centro_salud: "🏥",
  rehabilitacion: "🦿",
  farmacia: "💊",
  medicamentos: "💊",
  trámites: "📋",
};

export function SitiosCercanosView({ userId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [provincia, setProvincia] = useState<ProvinciaRD | undefined>();
  const [necesidades, setNecesidades] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const perfil = getPerfilInicial(userId ?? undefined);
    setProvincia(perfil?.datosPersonales?.provincia);
    setNecesidades(getNecesidadesSeleccionadas(userId ?? undefined));
  }, [mounted, userId ?? undefined]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () =>
      setNecesidades(getNecesidadesSeleccionadas(userId ?? undefined));
    window.addEventListener("rehub-necesidades-updated", handler);
    return () => window.removeEventListener("rehub-necesidades-updated", handler);
  }, [mounted, userId ?? undefined]);

  const sitios = obtenerSitiosCercanos(provincia, necesidades);

  if (!mounted) return null;

  return (
    <section
      id="sitios-cercanos"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden scroll-mt-6"
    >
      <div className="px-6 lg:px-8 py-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-rehub-dark flex items-center gap-2">
          <span>📍</span> Sitios cercanos que pueden ayudarte
        </h2>
        <p className="mt-1 text-sm text-rehub-dark/60">
          {provincia
            ? `Según tu ubicación en ${OPCIONES_PROVINCIA[provincia] ?? provincia} y tus necesidades`
            : "Completa tu provincia en Mi perfil para ver sitios en tu zona. Mientras tanto: recursos nacionales."}
        </p>
      </div>
      <div className="p-6 lg:p-8">
        <div className="space-y-4">
          {sitios.map((sitio) => (
            <TarjetaSitio key={sitio.id} sitio={sitio} />
          ))}
        </div>
        {!provincia && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-900">
              <strong>Tip:</strong> Ve a Mi perfil → Ubicación y selecciona tu provincia para ver hospitales y centros de rehabilitación cercanos.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TarjetaSitio({ sitio }: { sitio: SitioCercano }) {
  return (
    <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-rehub-primary/20 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <span className="text-2xl shrink-0">{EMOJI_TIPO[sitio.tipo] ?? "📍"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-rehub-dark">{sitio.nombre}</h3>
            <span className="text-xs font-medium text-rehub-dark/60 bg-slate-200/80 px-2 py-0.5 rounded">
              {ETIQUETA_TIPO[sitio.tipo]}
            </span>
          </div>
          <p className="text-sm text-rehub-dark/70 mt-1">{sitio.descripcion}</p>
          {sitio.direccion && (
            <p className="text-xs text-rehub-dark/60 mt-2">📍 {sitio.direccion}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {sitio.telefono && (
            <a
              href={`tel:${sitio.telefono.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rehub-primary text-white rounded-lg text-sm font-medium hover:bg-rehub-secondary transition-colors"
            >
              📞 {sitio.telefono}
            </a>
          )}
          {sitio.web && (
            <a
              href={sitio.web.startsWith("http") ? sitio.web : `https://${sitio.web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-rehub-primary/30 text-rehub-primary rounded-lg text-sm font-medium hover:bg-rehub-primary/5 transition-colors"
            >
              Ver web →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
