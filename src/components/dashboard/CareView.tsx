"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Stethoscope, MapPin, RotateCcw, UserRound, Phone, Globe, Check, Building2 } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { BodyMap } from "@/components/dashboard/BodyMap";
import {
  type BodyRegion,
  regionToBase,
  basePartsForRegions,
  specialtiesForRegions,
  centersNear,
} from "@/lib/care-catalog";
import { type CareState, getCare, saveCare, CARE_UPDATED_EVENT } from "@/lib/care-store";
import { getPerfil } from "@/lib/profile-store";

interface Props {
  userId: string | null;
}

export function CareView({ userId }: Props) {
  const t = useTranslations("dashboard.care");

  const [state, setState] = useState<CareState>({ regions: [], centerId: null, doctorName: "" });

  const provincia = useMemo(() => getPerfil(userId ?? undefined)?.datosPersonales?.provincia, [userId]);

  useEffect(() => {
    const refresh = () => setState(getCare(userId));
    refresh();
    window.addEventListener(CARE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CARE_UPDATED_EVENT, refresh);
  }, [userId]);

  const persist = useCallback(
    (next: CareState) => {
      setState(next);
      saveCare(next, userId);
    },
    [userId]
  );

  const toggle = useCallback(
    (region: BodyRegion) => {
      const has = state.regions.includes(region);
      const regions = has ? state.regions.filter((r) => r !== region) : [...state.regions, region];
      persist({ ...state, regions });
    },
    [state, persist]
  );

  const labelFor = useCallback(
    (region: BodyRegion) => {
      const base = t(`parts.${regionToBase(region)}`);
      const side = region.match(/_(izq|der)$/);
      return side ? `${base} (${t(`side.${side[1]}`)})` : base;
    },
    [t]
  );

  const baseParts = useMemo(() => basePartsForRegions(state.regions), [state.regions]);
  const specialties = useMemo(() => specialtiesForRegions(state.regions), [state.regions]);
  const centers = useMemo(() => centersNear(provincia), [provincia]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Muñeco */}
        <Reveal>
          <section className="rounded-2xl border border-rehub-100 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                  <UserRound className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold text-rehub-950">{t("bodyTitle")}</h3>
              </div>
              {state.regions.length > 0 && (
                <button
                  type="button"
                  onClick={() => persist({ ...state, regions: [] })}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rehub-200 bg-white px-2.5 py-1 text-xs font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("clear")}
                </button>
              )}
            </div>
            <p className="mb-3 text-xs text-rehub-900/55">{t("bodyHint")}</p>

            <BodyMap selected={state.regions} onToggle={toggle} labelFor={labelFor} />

            {baseParts.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {baseParts.map((part) => (
                  <span
                    key={part}
                    className="inline-flex items-center gap-1 rounded-full bg-rehub-100 px-2.5 py-0.5 text-xs font-medium text-rehub-700"
                  >
                    {t(`parts.${part}`)}
                  </span>
                ))}
              </div>
            )}
          </section>
        </Reveal>

        {/* Real specialty + real nearby centers */}
        <Reveal>
          <section className="rounded-2xl border border-rehub-100 bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                <Stethoscope className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-rehub-950">{t("resultTitle")}</h3>
            </div>

            {state.regions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-rehub-200 bg-rehub-50/40 px-4 py-8 text-center text-sm text-rehub-900/55">
                {t("emptyParts")}
              </p>
            ) : (
              <div className="space-y-4">
                {/* Specialty */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rehub-900/55">
                    {t("specialtyLabel")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center gap-1 rounded-lg bg-rehub-600/10 px-2.5 py-1 text-xs font-semibold text-rehub-700"
                      >
                        {t(`specialties.${specialty}`)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Real centers */}
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rehub-900/55">
                    <MapPin className="h-3 w-3 text-rehub-600" />
                    {t("centersLabel")}
                  </p>
                  <ul className="space-y-2">
                    {centers.map((center) => {
                      const isChosen = center.id === state.centerId;
                      const telHref = center.telefono ? `tel:${center.telefono.replace(/[^0-9+]/g, "")}` : null;
                      const webHref = center.web
                        ? center.web.startsWith("http")
                          ? center.web
                          : `https://${center.web}`
                        : null;
                      return (
                        <li
                          key={center.id}
                          className={`rounded-xl border px-3 py-2.5 transition-all ${
                            isChosen
                              ? "border-rehub-500 bg-rehub-50 ring-2 ring-rehub-500/20"
                              : "border-rehub-100 bg-white hover:border-rehub-200"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                              <Building2 className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-rehub-950">{center.nombre}</p>
                              <p className="text-xs text-rehub-900/55">{center.descripcion}</p>
                              {center.direccion && (
                                <p className="mt-0.5 text-xs text-rehub-900/45">{center.direccion}</p>
                              )}
                              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                                {telHref && (
                                  <a
                                    href={telHref}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-rehub-600 hover:text-rehub-700"
                                  >
                                    <Phone className="h-3 w-3" />
                                    {center.telefono}
                                  </a>
                                )}
                                {webHref && (
                                  <a
                                    href={webHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-rehub-600 hover:text-rehub-700"
                                  >
                                    <Globe className="h-3 w-3" />
                                    {center.web}
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    persist({ ...state, centerId: isChosen ? null : center.id })
                                  }
                                  className={`ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                    isChosen
                                      ? "bg-rehub-600 text-white"
                                      : "border border-rehub-200 bg-white text-rehub-800 hover:bg-rehub-50"
                                  }`}
                                >
                                  {isChosen ? <Check className="h-3 w-3" /> : null}
                                  {isChosen ? t("chosenCenter") : t("chooseCenter")}
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 text-xs text-rehub-900/45">{t("realNote")}</p>
                </div>
              </div>
            )}
          </section>
        </Reveal>
      </div>

      {/* Optional real doctor name (feeds the prescription QR) */}
      <Reveal>
        <section className="rounded-2xl border border-rehub-100 bg-white p-5 shadow-card">
          <label className="block">
            <span className="text-sm font-semibold text-rehub-950">{t("doctorNameLabel")}</span>
            <span className="mt-0.5 block text-xs text-rehub-900/55">{t("doctorNameHint")}</span>
            <input
              value={state.doctorName}
              onChange={(e) => persist({ ...state, doctorName: e.target.value })}
              placeholder={t("doctorNamePlaceholder")}
              className="mt-2 w-full max-w-sm rounded-xl border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-500 focus:ring-2 focus:ring-rehub-500/20"
            />
          </label>
        </section>
      </Reveal>
    </div>
  );
}
