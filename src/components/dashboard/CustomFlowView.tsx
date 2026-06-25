"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import {
  getNecesidadesSeleccionadas,
  buildGuiasParaFlujo,
  type GuiaInline,
} from "@/lib/needs-options";
import { GUIAS_APOYO } from "@/lib/resources-guide";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";
import { Phone, Globe, ListChecks, Users, StickyNote, Map } from "lucide-react";

interface Props {
  userId?: string | null;
}

function BloqueGuia({ guia }: { guia: GuiaInline }) {
  const t = useTranslations("dashboard.customFlow");
  const tNeeds = useTranslations("dashboard.needs");

  return (
    <div className="rounded-2xl border border-rehub-100 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated hover:border-rehub-200">
      {/* Card header */}
      <div className="flex items-start gap-4 px-6 py-5 border-b border-rehub-100">
        <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-rehub-100 text-rehub-700 font-bold text-sm">
          {guia.orden}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-rehub-950 text-balance">
            {tNeeds(`options.${guia.needOptionId}.label`)}
          </h3>
          <p className="text-sm text-rehub-900/65 mt-1 text-pretty">{guia.descripcion}</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {guia.pasos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                <ListChecks size={14} />
              </span>
              <h4 className="text-sm font-semibold text-rehub-900">
                {t("stepsHeading")}
              </h4>
            </div>
            <ol className="space-y-2">
              {guia.pasos.map((paso, i) => (
                <li
                  key={i}
                  className="flex gap-3 p-3 rounded-xl bg-rehub-50/60 border border-rehub-100"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-rehub-600 text-white font-semibold text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-rehub-900/70 leading-relaxed">{paso}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {guia.contactos && guia.contactos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                <Users size={14} />
              </span>
              <h4 className="text-sm font-semibold text-rehub-900">
                {t("contactsHeading")}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {guia.contactos.map((c) => {
                const href =
                  c.tipo === "tel"
                    ? `tel:${c.valor.replace(/\D/g, "")}`
                    : c.tipo === "web"
                      ? (c.valor.startsWith("http") ? c.valor : `https://${c.valor}`)
                      : null;
                const icon = c.tipo === "tel" ? <Phone size={13} /> : c.tipo === "web" ? <Globe size={13} /> : null;
                const clase =
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rehub-200 bg-rehub-50 text-rehub-700 text-sm font-medium hover:bg-rehub-100 hover:border-rehub-300 transition-all";
                return href ? (
                  <a
                    key={c.nombre}
                    href={href}
                    target={c.tipo === "web" ? "_blank" : undefined}
                    rel={c.tipo === "web" ? "noopener noreferrer" : undefined}
                    className={clase}
                  >
                    {icon}
                    {c.nombre}: {c.valor}
                  </a>
                ) : (
                  <span key={c.nombre} className={clase}>
                    {c.nombre}: {c.valor}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {guia.nota && (
          <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <StickyNote size={14} />
            </span>
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>{t("notePrefix")}</strong> {guia.nota}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function FlujoPersonalizadoView({ userId }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const mounted = useIsClientMounted();
  const t = useTranslations("dashboard.customFlow");

  useEffect(() => {
    if (!mounted) return;
    setSeleccionados(getNecesidadesSeleccionadas(userId ?? undefined));
  }, [mounted, userId]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () =>
      setSeleccionados(getNecesidadesSeleccionadas(userId ?? undefined));
    window.addEventListener("rehub-necesidades-updated", handler);
    return () => window.removeEventListener("rehub-necesidades-updated", handler);
  }, [mounted, userId]);

  const guiasMap: Record<string, { descripcion: string; pasos?: string[]; contactos?: { nombre: string; valor: string; tipo: "tel" | "web" | "otros" }[]; nota?: string }> = {};
  for (const [id, g] of Object.entries(GUIAS_APOYO)) {
    guiasMap[id] = {
      descripcion: g.descripcion,
      pasos: g.pasos,
      contactos: g.contactos,
      nota: g.nota,
    };
  }

  const guias = buildGuiasParaFlujo(seleccionados, guiasMap);

  if (!mounted || guias.length === 0) return null;

  return (
    <section className="rounded-2xl border border-rehub-100 bg-white shadow-card overflow-hidden">
      <Reveal>
        <div className="flex items-center gap-3 px-6 lg:px-8 py-5 border-b border-rehub-100 bg-gradient-to-r from-rehub-50/60 to-transparent">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
            <Map size={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-rehub-950">{t("title")}</h2>
            <p className="text-sm text-rehub-900/55">{t("subtitle")}</p>
          </div>
        </div>
      </Reveal>

      <Stagger className="p-6 lg:p-8 space-y-4">
        {guias.map((guia) => (
          <StaggerItem key={guia.orden}>
            <BloqueGuia guia={guia} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
