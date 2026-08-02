"use client";

/**
 * Recetas que el médico emitió para este paciente.
 *
 * Cierra el circuito que describe la tesis: el médico emite desde su cuenta,
 * el paciente lo ve aquí sin transcribir nada, y en la farmacia se comprueba
 * contra el servidor. El paciente nunca manipula el contenido — solo enseña el
 * código.
 */

import { useCallback, useEffect, useState } from "react";
import { FileSignature, QrCode, X, ShieldCheck, Ban, PackageCheck } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface MedRecetado {
  name: string;
  dose?: string;
  times: string[];
}

interface Receta {
  id: string;
  doctorName: string;
  center: string | null;
  meds: MedRecetado[];
  notes: string | null;
  status: "vigente" | "anulada" | "dispensada";
  issuedAt: string;
}

const ESTADO: Record<Receta["status"], { texto: string; clase: string; Icono: typeof ShieldCheck }> = {
  vigente: { texto: "Vigente", clase: "bg-rehub-50 text-rehub-700", Icono: ShieldCheck },
  anulada: { texto: "Anulada", clase: "bg-red-50 text-red-700", Icono: Ban },
  dispensada: { texto: "Ya dispensada", clase: "bg-amber-50 text-amber-700", Icono: PackageCheck },
};

export function PrescriptionsFromDoctor() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [qr, setQr] = useState<{ id: string; imagen: string } | null>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/prescriptions");
      if (!res.ok) return;
      const datos = await res.json();
      setRecetas(Array.isArray(datos.prescriptions) ? datos.prescriptions : []);
    } catch {
      // Sin base de datos no hay recetas emitidas; la pantalla simplemente no
      // aparece en lugar de mostrar un error que el paciente no puede resolver.
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const mostrarQr = async (id: string) => {
    const { toDataURL } = await import("qrcode");
    const imagen = await toDataURL(`${window.location.origin}/verify/${id}`, {
      margin: 1,
      width: 480,
    });
    setQr({ id, imagen });
  };

  if (cargando || recetas.length === 0) return null;

  return (
    <Reveal>
      <section className="mb-6 overflow-hidden rounded-3xl border border-rehub-100 bg-white shadow-card">
        <header className="border-b border-rehub-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-rehub-950">
            <FileSignature className="h-5 w-5 text-rehub-600" />
            Recetas de tu médico
          </h2>
          <p className="mt-0.5 text-sm text-rehub-900/60">
            Emitidas desde su cuenta. En la farmacia comprueban el estado escaneando el código.
          </p>
        </header>

        <ul className="divide-y divide-rehub-100">
          {recetas.map((receta) => {
            const { texto, clase, Icono } = ESTADO[receta.status];
            return (
              <li key={receta.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-rehub-950">
                      {receta.meds.map((m) => m.name).join(" · ")}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        clase
                      )}
                    >
                      <Icono className="h-3 w-3" />
                      {texto}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-rehub-900/55">
                    {receta.doctorName} ·{" "}
                    {new Date(receta.issuedAt).toLocaleDateString("es-DO", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => mostrarQr(receta.id)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-rehub-200 px-3 py-2 text-sm font-semibold text-rehub-700 transition-colors hover:bg-rehub-50"
                >
                  <QrCode className="h-4 w-4" />
                  Mostrar
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rehub-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs space-y-4 rounded-2xl border border-rehub-100 bg-white p-5 text-center shadow-elevated">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-rehub-950">Tu receta</h3>
              <button
                type="button"
                onClick={() => setQr(null)}
                aria-label="Cerrar"
                className="rounded-lg p-1 text-rehub-900/50 transition-colors hover:bg-rehub-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr.imagen}
              alt=""
              width={220}
              height={220}
              className="mx-auto rounded-xl border border-rehub-100"
            />
            <p className="rounded-xl bg-rehub-50 px-3 py-2 text-xs leading-relaxed text-rehub-900/70">
              Enséñalo en la farmacia. Comprueban ahí mismo quién la emitió y si sigue vigente.
            </p>
          </div>
        </div>
      )}
    </Reveal>
  );
}
