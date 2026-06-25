"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import {
  obtenerSitiosCercanos,
  type SitioCercano,
  type TipoSitio,
} from "@/lib/nearby-places";
import { getPerfilInicial } from "@/lib/profile-store";
import { getNecesidadesSeleccionadas } from "@/lib/needs-options";
import { OPCIONES_PROVINCIA } from "@/types/profile";
import type { ProvinciaRD } from "@/types/profile";
import {
  Siren,
  Brain,
  Hospital,
  Cross,
  Dumbbell,
  Pill,
  Tablets,
  ClipboardList,
  MapPin,
  Phone,
  ExternalLink,
} from "lucide-react";
import { Stagger, StaggerItem, Reveal } from "@/components/ui/motion";

interface Props {
  userId?: string | null;
}

const ICON_TIPO: Record<TipoSitio, React.ComponentType<{ className?: string }>> = {
  emergencia: Siren,
  salud_mental: Brain,
  hospital: Hospital,
  centro_salud: Cross,
  rehabilitacion: Dumbbell,
  farmacia: Pill,
  medicamentos: Tablets,
  trámites: ClipboardList,
};

const COLOR_TIPO: Record<TipoSitio, { chip: string; badge: string }> = {
  emergencia: {
    chip: "bg-red-100 text-red-700",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
  salud_mental: {
    chip: "bg-emerald-100 text-emerald-700",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  hospital: {
    chip: "bg-rehub-100 text-rehub-700",
    badge: "border-rehub-200 bg-rehub-50 text-rehub-700",
  },
  centro_salud: {
    chip: "bg-sky-100 text-sky-700",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
  },
  rehabilitacion: {
    chip: "bg-violet-100 text-violet-700",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
  farmacia: {
    chip: "bg-teal-100 text-teal-700",
    badge: "border-teal-200 bg-teal-50 text-teal-700",
  },
  medicamentos: {
    chip: "bg-cyan-100 text-cyan-700",
    badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  trámites: {
    chip: "bg-amber-100 text-amber-700",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

export function SitiosCercanosView({ userId }: Props) {
  const mounted = useIsClientMounted();
  const t = useTranslations("dashboard.closePlaces");
  const [provincia, setProvincia] = useState<ProvinciaRD | undefined>();
  const [necesidades, setNecesidades] = useState<string[]>([]);

  useEffect(() => {
    if (!mounted) return;
    const perfil = getPerfilInicial(userId ?? undefined);
    setProvincia(perfil?.datosPersonales?.provincia);
    setNecesidades(getNecesidadesSeleccionadas(userId ?? undefined));
  }, [mounted, userId]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () =>
      setNecesidades(getNecesidadesSeleccionadas(userId ?? undefined));
    window.addEventListener("rehub-necesidades-updated", handler);
    return () => window.removeEventListener("rehub-necesidades-updated", handler);
  }, [mounted, userId]);

  const sitios = obtenerSitiosCercanos(provincia, necesidades);

  if (!mounted) return null;

  const provinceLabel = provincia
    ? OPCIONES_PROVINCIA[provincia] ?? provincia
    : "";

  return (
    <section
      id="sitios-cercanos"
      className="bg-white rounded-2xl border border-rehub-100 shadow-card overflow-hidden scroll-mt-6"
    >
      {/* Header */}
      <Reveal direction="up" duration={0.5}>
        <div className="px-6 lg:px-8 py-5 border-b border-rehub-100 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-rehub-950 leading-snug">
              {t("title")}
            </h2>
            <p className="mt-0.5 text-sm text-rehub-900/60">
              {provincia
                ? t("withProvince", { province: provinceLabel })
                : t("noProvince")}
            </p>
          </div>
        </div>
      </Reveal>

      {/* List */}
      <div className="p-6 lg:p-8">
        <Stagger className="space-y-3">
          {sitios.map((sitio) => (
            <StaggerItem key={sitio.id}>
              <TarjetaSitio sitio={sitio} />
            </StaggerItem>
          ))}
        </Stagger>

        {!provincia && (
          <Reveal direction="up" delay={0.2} duration={0.5}>
            <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900">
                <strong>{t("tipLabel")}</strong> {t("tipBody")}
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function TarjetaSitio({ sitio }: { sitio: SitioCercano }) {
  const t = useTranslations("dashboard.closePlaces");
  const IconComponent = ICON_TIPO[sitio.tipo] ?? MapPin;
  const colors = COLOR_TIPO[sitio.tipo] ?? {
    chip: "bg-rehub-100 text-rehub-700",
    badge: "border-rehub-200 bg-rehub-50 text-rehub-700",
  };

  return (
    <div className="group p-5 rounded-xl border border-rehub-100 bg-gradient-to-br from-white to-rehub-50/50 transition-all hover:-translate-y-0.5 hover:shadow-elevated hover:border-rehub-200">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Icon chip */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.chip}`}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-rehub-950 leading-snug">
              {sitio.nombre}
            </h3>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}
            >
              {t(`types.${sitio.tipo}`)}
            </span>
          </div>
          <p className="text-sm text-rehub-900/65 mt-1 text-pretty">
            {sitio.descripcion}
          </p>
          {sitio.direccion && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rehub-900/50">
              <MapPin className="h-3 w-3 shrink-0" />
              {sitio.direccion}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {sitio.telefono && (
            <a
              href={`tel:${sitio.telefono.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 rounded-xl bg-rehub-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
            >
              <Phone className="h-3.5 w-3.5" />
              {sitio.telefono}
            </a>
          )}
          {sitio.web && (
            <a
              href={sitio.web.startsWith("http") ? sitio.web : `https://${sitio.web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-rehub-200 bg-white px-4 py-2 text-sm font-semibold text-rehub-800 transition-all hover:bg-rehub-50 hover:border-rehub-300"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("seeWebsite")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
