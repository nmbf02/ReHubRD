import { getTranslations } from "next-intl/server";
import { TriangleAlert, Pill, Stethoscope, MapPin, CalendarDays, Info } from "lucide-react";
import { decodeShare } from "@/lib/prescription-share";
import { BrandMark } from "@/components/brand/BrandMark";

/**
 * Página pública que se abre al escanear el QR que el paciente enseña en la
 * farmacia.
 *
 * **Esta pantalla NO verifica nada, y por eso no lo dice.** Antes se
 * presentaba con un escudo y el titular «Receta verificada · Firmada en
 * ReHub», pero los datos viajan dentro del propio código y el nombre del
 * médico es un campo de texto que escribe el paciente: cualquiera podía
 * fabricar un enlace y obtener un sello verde sobre una receta inventada.
 * Afirmar autenticidad que no se puede respaldar es peor que no ofrecerla,
 * sobre todo tratándose de medicamentos.
 *
 * Lo que sí hace —y es útil— es enseñar el tratamiento de forma legible, para
 * que en la farmacia no tengan que descifrar letra manuscrita. Una
 * verificación real exigiría que el médico emitiera la receta desde su propia
 * cuenta, un registro firmado en el servidor, un identificador opaco en el QR
 * y la posibilidad de anularla (ver README, «modo real»).
 */
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { d?: string };
}) {
  const t = await getTranslations("verify");
  const payload = searchParams.d ? decodeShare(searchParams.d) : null;

  const formattedDate = payload
    ? new Date(payload.date).toLocaleDateString("es-DO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-rehub-50/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-center gap-2">
          <BrandMark className="h-8 w-8" />
          <span className="text-lg font-bold text-rehub-950">ReHub</span>
        </div>

        {payload ? (
          <div className="overflow-hidden rounded-2xl border border-rehub-100 bg-white shadow-card">
            {/* Cabecera neutra: informa, no certifica. */}
            <div className="flex items-center gap-3 border-b border-rehub-100 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                <Pill className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-rehub-950">{t("verified")}</p>
                <p className="text-xs text-rehub-900/55">{t("verifiedSub")}</p>
              </div>
            </div>

            {/* El límite, arriba y legible — no en letra pequeña al pie. */}
            <div className="flex items-start gap-2.5 border-b border-amber-200 bg-amber-50/70 px-5 py-3.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <p className="text-xs leading-relaxed text-amber-900">{t("notice")}</p>
            </div>

            <div className="space-y-3 p-5">
              {payload.doctor && (
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="h-4 w-4 shrink-0 text-rehub-600" />
                  <span className="text-rehub-900/60">
                    {t("approvedBy")}{" "}
                    <span className="text-rehub-900/45">({t("sourceNote")})</span>
                  </span>
                  <span className="ml-auto font-semibold text-rehub-950">{payload.doctor}</span>
                </div>
              )}
              {payload.center && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-rehub-600" />
                  <span className="text-rehub-900/60">{t("center")}</span>
                  <span className="ml-auto font-medium text-rehub-950">{payload.center}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 shrink-0 text-rehub-600" />
                <span className="text-rehub-900/60">{t("date")}</span>
                <span className="ml-auto font-medium text-rehub-950">{formattedDate}</span>
              </div>

              <div className="rounded-xl border border-rehub-100 bg-rehub-50/50 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-rehub-700">
                  <Pill className="h-3.5 w-3.5" />
                  {t("meds")}
                </p>
                <ul className="space-y-1.5">
                  {payload.meds.map((med, index) => (
                    <li key={`${med.n}-${index}`} className="text-sm text-rehub-950">
                      <span className="font-medium">{med.n}</span>
                      {med.d ? <span className="text-rehub-900/60"> · {med.d}</span> : null}
                      {med.t.length > 0 ? (
                        <span className="text-rehub-900/50"> · {med.t.join(", ")}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs leading-relaxed text-rehub-900/50">{t("demoNote")}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-card">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <TriangleAlert className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-rehub-950">{t("invalid")}</p>
            <p className="mt-1 text-xs text-rehub-900/55">{t("invalidSub")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
