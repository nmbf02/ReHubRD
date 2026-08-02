import {
  ShieldCheck,
  Ban,
  PackageCheck,
  TriangleAlert,
  Pill,
  Stethoscope,
  MapPin,
  CalendarDays,
  Clock,
  Info,
} from "lucide-react";
import { getPrescription, type PrescriptionStatus } from "@/lib/prescriptions";
import { BrandMark } from "@/components/brand/BrandMark";
import { DispenseButton } from "@/components/verify/DispenseButton";
import { cn } from "@/lib/utils";

/**
 * Verificación de una receta EMITIDA POR EL MÉDICO.
 *
 * A diferencia de `/verify?d=…` —que solo muestra el resumen que comparte el
 * paciente y no acredita nada—, aquí el código lleva únicamente un
 * identificador y el registro se lee de este servidor. El paciente nunca tiene
 * los datos en la mano, así que no hay nada que pueda editar.
 *
 * Se renderiza siempre en el momento (`force-dynamic`): el estado es el punto
 * de esta pantalla y una versión cacheada podría enseñar como vigente algo que
 * el médico acaba de anular.
 */
export const dynamic = "force-dynamic";

const ESTILO: Record<
  PrescriptionStatus,
  { rotulo: string; detalle: string; clase: string; Icono: typeof ShieldCheck }
> = {
  vigente: {
    rotulo: "Receta vigente",
    detalle: "Emitida en ReHub y no anulada",
    clase: "bg-rehub-600 text-white",
    Icono: ShieldCheck,
  },
  anulada: {
    rotulo: "Receta anulada",
    detalle: "El médico la dejó sin efecto",
    clase: "bg-red-600 text-white",
    Icono: Ban,
  },
  dispensada: {
    rotulo: "Ya dispensada",
    detalle: "Registrada como entregada",
    clase: "bg-amber-500 text-white",
    Icono: PackageCheck,
  },
};

/**
 * Zona fija del país. Esta pantalla se renderiza en el SERVIDOR (Vercel, en
 * UTC) mientras que la lista del paciente se pinta en su navegador: sin fijar
 * la zona, la misma receta emitida de noche salía «2 de agosto» en la farmacia
 * y «1 de agosto» en el móvil del paciente.
 */
const ZONA_RD = "America/Santo_Domingo";

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: ZONA_RD,
  });
}

export default async function VerificarRecetaPage({ params }: { params: { id: string } }) {
  const resultado = await getPrescription(params.id);
  const consultadoA = new Date().toLocaleTimeString("es-DO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ZONA_RD,
  });

  const receta = resultado.ok ? resultado.value : null;
  const sinBase = !resultado.ok;

  return (
    <main className="flex min-h-screen items-center justify-center bg-rehub-50/50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-center gap-2">
          <BrandMark className="h-8 w-8" />
          <span className="text-lg font-bold text-rehub-950">ReHub</span>
        </div>

        {receta ? (
          <div className="overflow-hidden rounded-2xl border border-rehub-100 bg-white shadow-card">
            <div className={cn("flex items-center gap-3 px-5 py-4", ESTILO[receta.status].clase)}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                {(() => {
                  const { Icono } = ESTILO[receta.status];
                  return <Icono className="h-6 w-6" />;
                })()}
              </span>
              <div>
                <p className="text-sm font-bold">{ESTILO[receta.status].rotulo}</p>
                <p className="text-xs opacity-85">{ESTILO[receta.status].detalle}</p>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-4 w-4 shrink-0 text-rehub-600" />
                <span className="text-rehub-900/60">Emitida por</span>
                <span className="ml-auto text-right font-semibold text-rehub-950">
                  {receta.doctorName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Pill className="h-4 w-4 shrink-0 text-rehub-600" />
                <span className="text-rehub-900/60">Paciente</span>
                <span className="ml-auto text-right font-medium text-rehub-950">
                  {receta.patientName}
                </span>
              </div>
              {receta.center && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-rehub-600" />
                  <span className="text-rehub-900/60">Centro</span>
                  <span className="ml-auto text-right font-medium text-rehub-950">
                    {receta.center}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 shrink-0 text-rehub-600" />
                <span className="text-rehub-900/60">Fecha de emisión</span>
                <span className="ml-auto font-medium text-rehub-950">
                  {formatearFecha(receta.issuedAt)}
                </span>
              </div>

              <div className="rounded-xl border border-rehub-100 bg-rehub-50/50 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-rehub-700">
                  <Pill className="h-3.5 w-3.5" />
                  Medicamentos
                </p>
                <ul className="space-y-1.5">
                  {receta.meds.map((med, index) => (
                    <li key={`${med.name}-${index}`} className="text-sm text-rehub-950">
                      <span className="font-medium">{med.name}</span>
                      {med.dose ? <span className="text-rehub-900/60"> · {med.dose}</span> : null}
                      {med.times.length > 0 ? (
                        <span className="text-rehub-900/50"> · {med.times.join(", ")}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {receta.notes && (
                  <p className="mt-2 border-t border-rehub-100 pt-2 text-xs text-rehub-900/70">
                    {receta.notes}
                  </p>
                )}
              </div>

              {receta.status === "dispensada" && receta.dispensedAt && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Registrada como dispensada el {formatearFecha(receta.dispensedAt)}. Si el paciente
                  vuelve a presentarla, ya fue entregada.
                </p>
              )}
              {receta.status === "anulada" && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-800">
                  El médico anuló esta receta. No debe dispensarse.
                </p>
              )}

              {receta.status === "vigente" && <DispenseButton id={receta.id} />}

              <p className="flex items-center gap-1.5 text-xs text-rehub-900/45">
                <Clock className="h-3.5 w-3.5" />
                Consultado a las {consultadoA} · el estado se lee en el momento
              </p>

              <p className="flex items-start gap-2 border-t border-rehub-100 pt-3 text-xs leading-relaxed text-rehub-900/55">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                El código solo lleva un identificador: estos datos se leen del servidor de ReHub, no
                del código, y por eso no pueden alterarse. Acredita que la emitió esta cuenta médica
                en ReHub; no sustituye la verificación del exequátur profesional.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-card">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <TriangleAlert className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-rehub-950">
              {sinBase ? "No pudimos consultar la receta" : "Esta receta no existe"}
            </p>
            <p className="mt-1 text-xs text-rehub-900/55">
              {sinBase
                ? "El servicio de verificación no está disponible ahora mismo. Inténtalo de nuevo en un momento."
                : "El código no corresponde a ninguna receta emitida en ReHub. No la aceptes como válida."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
