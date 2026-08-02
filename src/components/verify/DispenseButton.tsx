"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

/**
 * Marcar dispensada desde la farmacia. No pide sesión: quien tiene el código
 * es quien está atendiendo, igual que con una receta de papel.
 *
 * Tras marcarla se refresca la página para releer el estado del servidor en
 * vez de pintarlo aquí: si otra farmacia se adelantó, lo correcto es enterarse,
 * no mostrar un éxito que no ocurrió.
 */
export function DispenseButton({ id }: { id: string }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispensar = async () => {
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "dispensar" }),
      });
      if (!res.ok) {
        setError(
          res.status === 409
            ? "Esta receta ya no está vigente. Actualiza para ver su estado."
            : "No pudimos registrarlo. Inténtalo de nuevo."
        );
        return;
      }
      router.refresh();
    } catch {
      setError("No pudimos registrarlo. Revisa la conexión.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={dispensar}
        disabled={ocupado}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rehub-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rehub-700 disabled:opacity-50"
      >
        {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Marcar como dispensada
      </button>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
