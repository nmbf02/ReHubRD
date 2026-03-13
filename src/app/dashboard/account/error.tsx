"use client";

import Link from "next/link";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Algo salió mal
        </h2>
        <p className="text-sm text-red-700 mb-6">
          No se pudo cargar la configuración de cuenta. Intenta de nuevo.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
