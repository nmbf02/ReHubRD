"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { getAccountData as getAccountData, saveAccountData } from "@/lib/account-store";
import {
  User,
  Phone,
  Mail,
  LogIn,
  Hash,
  Check,
  Loader2,
  ArrowRight,
  UserCircle,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

interface UserData {
  id?: string;
  email?: string | null;
  name?: string | null;
}

interface Props {
  user: UserData | null | undefined;
}

export function AccountForm({ user }: Props) {
  const ta = useTranslations("dashboard.accountForm");
  const tCommon = useTranslations("common");
  const safeUser: { email?: string | null; name?: string | null; id?: string | null } = user ?? {};

  const [showName, setShowName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const mounted = useIsClientMounted();
  const [errores, setErrores] = useState<{ email?: string; save?: string }>({});

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
      err.email = ta("emailInvalid");
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
      const msg = e instanceof Error ? e.message : ta("saveFailed");
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
    <Stagger className="space-y-6">
      {/* ── Editable data panel ── */}
      <StaggerItem>
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-rehub-100 bg-white shadow-card"
        >
          {/* Panel header */}
          <div className="flex items-center gap-3 border-b border-rehub-100 px-6 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-rehub-950">{ta("editTitle")}</h2>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-5 p-6">
            {/* Display name */}
            <div>
              <label
                htmlFor="nombreMostrar"
                className="block text-sm font-medium text-rehub-900 mb-1.5"
              >
                {ta("displayName")}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-rehub-900/40">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="nombreMostrar"
                  type="text"
                  value={showName}
                  onChange={(e) => setShowName(e.target.value)}
                  placeholder={ta("displayNamePh")}
                  className="w-full rounded-xl border border-rehub-200 bg-white pl-10 pr-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15"
                />
              </div>
              <p className="mt-1.5 text-xs text-rehub-900/55">{ta("displayNameHint")}</p>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-rehub-900 mb-1.5"
              >
                {ta("phone")}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-rehub-900/40">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  id="telefono"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="809-000-0000"
                  className="w-full rounded-xl border border-rehub-200 bg-white pl-10 pr-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:border-rehub-500 focus:ring-4 focus:ring-rehub-500/15"
                />
              </div>
            </div>

            {/* Contact email */}
            <div>
              <label
                htmlFor="correoContacto"
                className="block text-sm font-medium text-rehub-900 mb-1.5"
              >
                {ta("contactEmail")}
                <span className="ml-1 text-rehub-900/50 font-normal">
                  {tCommon("optionalMarker")}
                </span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-rehub-900/40">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="correoContacto"
                  type="email"
                  value={contactEmail}
                  onChange={(ev) => {
                    setContactEmail(ev.target.value);
                    if (errores.email) setErrores((prev) => ({ ...prev, correo: undefined }));
                  }}
                  placeholder={ta("contactEmailPh")}
                  className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-rehub-950 outline-none transition-all placeholder:text-rehub-900/40 focus:ring-4 ${
                    errores.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                      : "border-rehub-200 focus:border-rehub-500 focus:ring-rehub-500/15"
                  }`}
                />
              </div>
              {errores.email && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errores.email}
                </p>
              )}
              <p className="mt-1.5 text-xs text-rehub-900/55">{ta("contactEmailHint")}</p>
            </div>

            {errores.save && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
                {errores.save}
              </p>
            )}

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rehub-600 px-5 py-2.5 font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {ta("saveSaving")}
                  </>
                ) : saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    {ta("saveSaved")}
                  </>
                ) : (
                  ta("saveSubmit")
                )}
              </button>
            </div>
          </div>
        </form>
      </StaggerItem>

      {/* ── Session info panel (read-only) ── */}
      <StaggerItem>
        <div className="rounded-2xl border border-rehub-100 bg-white shadow-card">
          {/* Panel header */}
          <div className="flex items-center gap-3 border-b border-rehub-100 px-6 py-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
              <LogIn className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-rehub-950">{ta("sessionTitle")}</h2>
            </div>
          </div>

          {/* Session fields */}
          <dl className="divide-y divide-rehub-100 px-6">
            <div className="py-4">
              <dt className="text-xs font-medium text-rehub-900/55 uppercase tracking-wide mb-1">
                {ta("loginEmail")}
              </dt>
              <dd className="flex items-center gap-2 text-rehub-950 font-medium text-sm">
                <Mail className="h-3.5 w-3.5 text-rehub-400 shrink-0" />
                {safeUser?.email ?? "—"}
              </dd>
              <p className="mt-1 text-xs text-rehub-900/55">{ta("loginEmailHint")}</p>
            </div>

            {getAccountData(safeUser?.id ?? undefined)?.contactEmail && (
              <div className="py-4">
                <dt className="text-xs font-medium text-rehub-900/55 uppercase tracking-wide mb-1">
                  {ta("contactEmail")}
                </dt>
                <dd className="flex items-center gap-2 text-rehub-950 font-medium text-sm">
                  <Mail className="h-3.5 w-3.5 text-rehub-400 shrink-0" />
                  {getAccountData(safeUser?.id ?? undefined)?.contactEmail}
                </dd>
              </div>
            )}

            <div className="py-4">
              <dt className="text-xs font-medium text-rehub-900/55 uppercase tracking-wide mb-1">
                {ta("userId")}
              </dt>
              <dd className="flex items-center gap-2 text-sm text-rehub-900/60 font-mono">
                <Hash className="h-3.5 w-3.5 text-rehub-400 shrink-0" />
                {safeUser?.id ?? "—"}
              </dd>
            </div>
          </dl>
        </div>
      </StaggerItem>

      {/* ── Profile box ── */}
      <StaggerItem>
        <div className="rounded-2xl border border-rehub-200 bg-gradient-to-br from-rehub-50 to-white p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <UserCircle className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-rehub-950 mb-1">
                {ta("profileBoxTitle")}
              </h2>
              <p className="text-sm text-rehub-900/70 mb-4">{ta("profileBoxBody")}</p>
              <Link
                href={ROUTES.profile}
                className="inline-flex items-center gap-2 rounded-xl bg-rehub-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 hover:shadow-glow-lg"
              >
                {ta("goProfile")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </StaggerItem>
    </Stagger>
  );
}
