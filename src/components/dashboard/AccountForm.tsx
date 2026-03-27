"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAccountData as getAccountData, saveAccountData } from "@/lib/account-store";

interface UserData {
  id?: string;
  email?: string | null;
  name?: string | null;
}

interface Props {
  user: UserData | null | undefined;
}

export function AccountForm({ user }: Props) {
  const safeUser: { email?: string | null; name?: string | null; id?: string | null } = user ?? {};

  const [showName, setShowName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errores, setErrores] = useState<{ email?: string; save?: string }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const datos = getAccountData(safeUser?.id ?? undefined);
      setShowName(datos?.showName ?? safeUser?.name ?? "");
      setPhoneNumber(datos?.phoneNumber ?? "");
      setContactEmail(datos?.contactEmail ?? "");
    } catch {
      setShowName(safeUser?.name ?? "");
    }
  }, [mounted, safeUser?.id, safeUser?.name]);

  function validateEmail(email: string): boolean {
    if (!email.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: { email?: string } = {};
    if (contactEmail.trim() && !validateEmail(contactEmail)) {
      err.email = "Ingresa un correo válido.";
    }
    setErrores(err);
    if (Object.keys(err).length > 0) return;

    setIsSaving(true);
    setErrores((prev) => ({ ...prev, save: undefined }));
    try {
      saveAccountData(
        {
          showName: showName.trim(),
          phoneNumber: phoneNumber.trim(),
          contactEmail: contactEmail.trim(),
        },
        safeUser?.id || undefined
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo guardar. Revisa que el almacenamiento local esté habilitado.";
      setErrores((prev) => ({ ...prev, save: msg }));
    } finally {
      setIsSaving(false);
    }
  }

  if (!mounted) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Datos editables */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-rehub-light/50 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-rehub-dark mb-6">
          Editar datos de cuenta
        </h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="nombreMostrar" className="block text-sm font-medium text-rehub-dark mb-2">
              Nombre para mostrar
            </label>
            <input
              id="nombreMostrar"
              type="text"
              value={showName}
              onChange={(e) => setShowName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
            />
            <p className="mt-1 text-xs text-rehub-dark/60">
              Se mostrará en el menú y mensajes de bienvenida.
            </p>
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-rehub-dark mb-2">
              Teléfono de contacto
            </label>
            <input
              id="telefono"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="809-000-0000"
              className="w-full px-4 py-3 rounded-xl border border-rehub-dark/20 focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none"
            />
          </div>
          <div>
            <label htmlFor="correoContacto" className="block text-sm font-medium text-rehub-dark mb-2">
              Correo de contacto <span className="text-rehub-dark/50 font-normal">(opcional)</span>
            </label>
            <input
              id="correoContacto"
              type="email"
              value={contactEmail}
              onChange={(ev) => {
                setContactEmail(ev.target.value);
                if (errores.email) setErrores((prev) => ({ ...prev, correo: undefined }));
              }}
              placeholder="otro@correo.com"
              className={`w-full px-4 py-3 rounded-xl border focus:border-rehub-primary focus:ring-2 focus:ring-rehub-primary/20 outline-none ${
                errores.email ? "border-red-300" : "border-rehub-dark/20"
              }`}
            />
            {errores.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errores.email}</p>
            )}
            <p className="mt-1 text-xs text-rehub-dark/60">
              Para recibir comunicaciones en una dirección distinta a la de tu cuenta.
            </p>
          </div>
          {errores.save && (
            <p className="text-sm text-red-600" role="alert">{errores.save}</p>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-rehub-primary text-white rounded-xl font-medium hover:bg-rehub-secondary transition-colors disabled:opacity-70"
          >
            {isSaving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Información de sesión (solo lectura) */}
      <div className="bg-white rounded-2xl border border-rehub-light/50 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-rehub-dark mb-6">
          Información de la cuenta
        </h2>
        <dl className="space-y-6">
          <div>
            <dt className="text-sm font-medium text-rehub-dark/70 mb-1">
              Correo de inicio de sesión
            </dt>
            <dd className="text-rehub-dark font-medium">{safeUser?.email ?? "—"}</dd>
            <p className="mt-1 text-xs text-rehub-dark/60">
              No se puede modificar. Usa «Correo de contacto» arriba para otra dirección.
            </p>
          </div>
          {getAccountData(safeUser?.id ?? undefined)?.contactEmail && (
            <div>
              <dt className="text-sm font-medium text-rehub-dark/70 mb-1">
                Correo de contacto
              </dt>
              <dd className="text-rehub-dark font-medium">
                {getAccountData(safeUser?.id ?? undefined)?.contactEmail}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-rehub-dark/70 mb-1">
              ID de usuario
            </dt>
            <dd className="text-sm text-rehub-dark/60 font-mono">
              {safeUser?.id ?? "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-rehub-light/30 rounded-2xl border border-rehub-primary/10 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-rehub-dark mb-2">
          Datos del perfil de recuperación
        </h2>
        <p className="text-sm text-rehub-dark/70 mb-4">
          Tipo de accidente, estado físico, situación laboral y más se configuran
          en Mi perfil.
        </p>
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rehub-primary text-white rounded-xl font-medium hover:bg-rehub-secondary transition-colors text-sm"
        >
          Ir a Mi perfil
        </Link>
      </div>
    </div>
  );
}
