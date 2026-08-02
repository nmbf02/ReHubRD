"use client";

/**
 * Emisión de receta desde el panel del médico.
 *
 * Es el acto que le faltaba al rol: hasta ahora el médico solo observaba
 * (alertas, cartera, agenda). Aquí produce algo, y ese algo es lo único que la
 * farmacia puede verificar de verdad, porque el emisor es una cuenta
 * autenticada y no un campo de texto del paciente.
 */

import { useState } from "react";
import { FileSignature, Plus, Trash2, X, Loader2, Ban, ExternalLink, Lock } from "lucide-react";
import { timesForDosesPerDay } from "@/lib/medication-schedule";
import { cn } from "@/lib/utils";

interface Renglon {
  name: string;
  dose: string;
  dosesPerDay: number;
  firstTime: string;
}

const RENGLON_VACIO: Renglon = { name: "", dose: "", dosesPerDay: 3, firstTime: "08:00" };

interface Props {
  doctorName: string;
  patientId: string | null;
  patientName: string;
  center?: string;
  /**
   * Si la cuenta de la sesión es de profesional de salud. Se decide en el
   * servidor; aquí solo se usa para explicarlo antes de que el intento falle.
   * El control real está en la API — esto es cortesía, no seguridad.
   */
  canIssue: boolean;
}

interface RecetaEmitida {
  id: string;
  status: string;
}

export function IssuePrescription({
  doctorName,
  patientId,
  patientName,
  center,
  canIssue,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [renglones, setRenglones] = useState<Renglon[]>([{ ...RENGLON_VACIO }]);
  const [notas, setNotas] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emitida, setEmitida] = useState<RecetaEmitida | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const actualizar = (index: number, cambios: Partial<Renglon>) =>
    setRenglones((lista) => lista.map((r, i) => (i === index ? { ...r, ...cambios } : r)));

  const emitir = async () => {
    const meds = renglones
      .filter((r) => r.name.trim().length > 1)
      .map((r) => ({
        name: r.name.trim(),
        dose: r.dose.trim() || undefined,
        times: timesForDosesPerDay(r.dosesPerDay, r.firstTime),
      }));

    if (meds.length === 0) {
      setError("Añade al menos un medicamento.");
      return;
    }

    setOcupado(true);
    setError(null);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorName, patientId, patientName, center, meds, notes: notas }),
      });
      const datos = await res.json();
      if (!res.ok) {
        setError(datos?.error ?? "No pudimos emitir la receta.");
        return;
      }
      const receta = datos.prescription as RecetaEmitida;
      setEmitida(receta);

      const { toDataURL } = await import("qrcode");
      setQr(await toDataURL(`${window.location.origin}/verify/${receta.id}`, { margin: 1, width: 480 }));
    } catch {
      setError("No pudimos emitir la receta. Revisa la conexión.");
    } finally {
      setOcupado(false);
    }
  };

  const anular = async () => {
    if (!emitida) return;
    setOcupado(true);
    try {
      const res = await fetch(`/api/prescriptions/${emitida.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "anular" }),
      });
      if (res.ok) setEmitida({ ...emitida, status: "anulada" });
      else setError("No pudimos anularla.");
    } finally {
      setOcupado(false);
    }
  };

  const cerrar = () => {
    setAbierto(false);
    setRenglones([{ ...RENGLON_VACIO }]);
    setNotas("");
    setEmitida(null);
    setQr(null);
    setError(null);
  };

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-rehub-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rehub-700"
      >
        <FileSignature className="h-4 w-4" />
        Emitir receta
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rehub-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-rehub-100 bg-white p-5 shadow-elevated">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-rehub-950">
              {emitida ? "Receta emitida" : "Emitir receta"}
            </h3>
            <p className="text-sm text-rehub-900/60">
              {patientName}
              {center ? ` · ${center}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-rehub-900/50 transition-colors hover:bg-rehub-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!canIssue ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="text-sm leading-relaxed text-amber-900">
                <p className="font-semibold">Tu cuenta no es de profesional de salud.</p>
                <p className="mt-1">
                  El selector de rol sirve para <strong>ver</strong> los tres paneles con una sola
                  sesión, pero no otorga permisos. Emitir recetas exige entrar con una cuenta
                  médica, y eso lo comprueba el servidor — no el navegador.
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-rehub-900/55">
              Es justo lo que impide que un paciente se recete a sí mismo. Si abres la consola y
              llamas a la API directamente, responde <code className="font-mono">403</code>.
            </p>
          </div>
        ) : emitida ? (
          <div className="space-y-4 text-center">
            {qr && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qr}
                alt=""
                width={220}
                height={220}
                className={cn(
                  "mx-auto rounded-xl border border-rehub-100",
                  emitida.status === "anulada" && "opacity-30 grayscale"
                )}
              />
            )}
            <p className="text-sm text-rehub-900/70">
              {emitida.status === "anulada"
                ? "Anulada. Si alguien la escanea, verá que no debe dispensarse."
                : "El paciente enseña este código en la farmacia. Ahí se lee el estado en vivo."}
            </p>
            <a
              href={`/verify/${emitida.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rehub-700 hover:underline"
            >
              Ver lo que verá la farmacia
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {emitida.status !== "anulada" && (
              <button
                type="button"
                onClick={anular}
                disabled={ocupado}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" />
                Anular esta receta
              </button>
            )}
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {renglones.map((renglon, index) => (
              <div key={index} className="rounded-xl border border-rehub-100 p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={renglon.name}
                    onChange={(e) => actualizar(index, { name: e.target.value })}
                    placeholder="Medicamento"
                    className="rounded-lg border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-400"
                  />
                  <input
                    value={renglon.dose}
                    onChange={(e) => actualizar(index, { dose: e.target.value })}
                    placeholder="Dosis (500 mg)"
                    className="rounded-lg border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-400"
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-rehub-900/70">
                    Tomas/día
                    <select
                      value={renglon.dosesPerDay}
                      onChange={(e) => actualizar(index, { dosesPerDay: Number(e.target.value) })}
                      className="rounded-lg border border-rehub-200 px-2 py-1 text-sm outline-none focus:border-rehub-400"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-rehub-900/70">
                    Primera
                    <input
                      type="time"
                      value={renglon.firstTime}
                      onChange={(e) => actualizar(index, { firstTime: e.target.value })}
                      className="rounded-lg border border-rehub-200 px-2 py-1 text-sm outline-none focus:border-rehub-400"
                    />
                  </label>
                  <span className="text-xs tabular-nums text-rehub-900/45">
                    {timesForDosesPerDay(renglon.dosesPerDay, renglon.firstTime).join(" · ")}
                  </span>
                  {renglones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRenglones((l) => l.filter((_, i) => i !== index))}
                      className="ml-auto rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                      aria-label="Quitar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setRenglones((l) => [...l, { ...RENGLON_VACIO }])}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rehub-700 hover:underline"
            >
              <Plus className="h-4 w-4" />
              Otro medicamento
            </button>

            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Indicaciones (opcional)"
              className="w-full resize-none rounded-xl border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-400"
            />

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <button
              type="button"
              onClick={emitir}
              disabled={ocupado}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rehub-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rehub-700 disabled:opacity-50"
            >
              {ocupado ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSignature className="h-4 w-4" />
              )}
              Emitir y generar QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
