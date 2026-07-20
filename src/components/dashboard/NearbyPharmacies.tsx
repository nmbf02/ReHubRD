"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Navigation, Clock, Phone, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Reveal } from "@/components/ui/motion";

interface Pharmacy {
  id: string;
  name: string;
  lat: number;
  lon: number;
  hours: string | null;
  phone: string | null;
  street: string | null;
  distance?: number;
}

type Status = "idle" | "locating" | "loading" | "ok" | "empty" | "denied" | "error";

function haversineMeters(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function NearbyPharmacies() {
  const t = useTranslations("dashboard.pharmacies");
  const [status, setStatus] = useState<Status>("idle");
  const [items, setItems] = useState<Pharmacy[]>([]);

  const find = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("denied");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setStatus("loading");
        try {
          const res = await fetch(`/api/pharmacies?lat=${latitude}&lon=${longitude}&radius=4000`);
          if (!res.ok) {
            setStatus("error");
            return;
          }
          const data = (await res.json()) as { pharmacies?: Pharmacy[] };
          const list = (data.pharmacies ?? [])
            .map((p) => ({ ...p, distance: haversineMeters(latitude, longitude, p.lat, p.lon) }))
            .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
            .slice(0, 12);
          setItems(list);
          setStatus(list.length ? "ok" : "empty");
        } catch {
          setStatus("error");
        }
      },
      () => setStatus("denied"),
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  }, []);

  const officialLink = (
    <a
      href="https://promesecal.gob.do"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-rehub-600 hover:text-rehub-700"
    >
      <ExternalLink className="h-3 w-3" />
      {t("puebloLink")}
    </a>
  );

  return (
    <Reveal>
      <section className="mt-6 rounded-2xl border border-rehub-100 bg-white p-5 shadow-card">
        <div className="mb-1 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
            <MapPin className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-rehub-950">{t("title")}</h3>
        </div>
        <p className="mb-4 text-xs text-rehub-900/55">{t("intro")}</p>

        {/* Farmacia del Pueblo honest note */}
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5 text-xs leading-relaxed text-rehub-900/70">
          {t("pueblo")} {officialLink}
        </div>

        {status === "idle" && (
          <button
            type="button"
            onClick={find}
            className="inline-flex items-center gap-2 rounded-xl bg-rehub-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700"
          >
            <Navigation className="h-4 w-4" />
            {t("cta")}
          </button>
        )}

        {(status === "locating" || status === "loading") && (
          <p className="flex items-center gap-2 text-sm text-rehub-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            {status === "locating" ? t("locating") : t("loading")}
          </p>
        )}

        {(status === "denied" || status === "error" || status === "empty") && (
          <div className="space-y-3">
            <p className="text-sm text-rehub-900/70">
              {status === "denied" ? t("denied") : status === "error" ? t("error") : t("empty")}
            </p>
            <button
              type="button"
              onClick={find}
              className="inline-flex items-center gap-2 rounded-xl border border-rehub-200 bg-white px-3 py-1.5 text-xs font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("retry")}
            </button>
          </div>
        )}

        {status === "ok" && (
          <ul className="space-y-2">
            {items.map((pharmacy) => (
              <li
                key={pharmacy.id}
                className="flex items-start gap-3 rounded-xl border border-rehub-100 bg-white px-3 py-2.5 transition-all hover:border-rehub-200 hover:shadow-elevated"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rehub-100 text-rehub-700">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-rehub-950">{pharmacy.name}</p>
                    {typeof pharmacy.distance === "number" && (
                      <span className="shrink-0 rounded-full bg-rehub-100 px-2 py-0.5 text-xs font-medium text-rehub-700">
                        {formatDistance(pharmacy.distance)}
                      </span>
                    )}
                  </div>
                  {pharmacy.street && <p className="text-xs text-rehub-900/55">{pharmacy.street}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    {pharmacy.hours && (
                      <span className="inline-flex items-center gap-1 text-xs text-rehub-900/55">
                        <Clock className="h-3 w-3" />
                        {pharmacy.hours}
                      </span>
                    )}
                    {pharmacy.phone && (
                      <a
                        href={`tel:${pharmacy.phone.replace(/[^0-9+]/g, "")}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rehub-600 hover:text-rehub-700"
                      >
                        <Phone className="h-3 w-3" />
                        {pharmacy.phone}
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 rounded-lg border border-rehub-200 bg-white px-2.5 py-1 text-xs font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
                    >
                      <Navigation className="h-3 w-3" />
                      {t("directions")}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  );
}
