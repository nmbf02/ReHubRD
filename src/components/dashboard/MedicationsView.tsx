"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Pill,
  Camera,
  Sparkles,
  Plus,
  Clock,
  Trash2,
  Pencil,
  Bell,
  Loader2,
  Utensils,
  ShieldCheck,
  AlertTriangle,
  Check,
  QrCode,
  X,
} from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import {
  type Medication,
  getMedications,
  upsertMedication,
  removeMedication,
  MEDICATIONS_UPDATED_EVENT,
} from "@/lib/medications-store";
import {
  type ParsedMedication,
  timesForDosesPerDay,
  nextTimeOccurrence,
  parsePrescriptionText,
} from "@/lib/medication-schedule";
import { getCare } from "@/lib/care-store";
import { encodeShare } from "@/lib/prescription-share";

interface Props {
  userId: string | null;
}

type OcrStatus = "idle" | "reading" | "ok" | "empty" | "error";

interface DraftState {
  id: string | null;
  name: string;
  dose: string;
  dosesPerDay: number;
  firstTime: string;
  withFood: boolean;
  notes: string;
}

const EMPTY_DRAFT: DraftState = {
  id: null,
  name: "",
  dose: "",
  dosesPerDay: 3,
  firstTime: "08:00",
  withFood: false,
  notes: "",
};

function genId(): string {
  return `med-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function notify(title: string, body?: string) {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
  } else {
    // eslint-disable-next-line no-alert
    alert(`${title}\n${body ?? ""}`);
  }
}

export function MedicationsView({ userId }: Props) {
  const t = useTranslations("dashboard.medications");

  const [meds, setMeds] = useState<Medication[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("idle");
  const [candidates, setCandidates] = useState<ParsedMedication[]>([]);
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [showForm, setShowForm] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [shareQr, setShareQr] = useState<string | null>(null);
  const [shareDoctor, setShareDoctor] = useState<string | undefined>(undefined);
  const [shareBusy, setShareBusy] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const timers = useRef<Record<string, number>>({});

  // Load + stay in sync with the on-device store.
  useEffect(() => {
    const refresh = () => setMeds(getMedications(userId));
    refresh();
    window.addEventListener(MEDICATIONS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MEDICATIONS_UPDATED_EVENT, refresh);
  }, [userId]);

  // --- Reminders (on-device, while the app is open) ---
  const clearTimers = useCallback(() => {
    Object.values(timers.current).forEach((id) => clearTimeout(id));
    timers.current = {};
  }, []);

  const scheduleOne = useCallback(
    (key: string, hhmm: string, name: string) => {
      if (timers.current[key]) clearTimeout(timers.current[key]);
      const when = nextTimeOccurrence(hhmm, new Date());
      const delay = Math.max(0, when.getTime() - Date.now());
      timers.current[key] = window.setTimeout(() => {
        notify(t("notifyTitle", { name }), t("notifyBody"));
        scheduleOne(key, hhmm, name); // reschedule for the next day
      }, delay);
    },
    [t]
  );

  useEffect(() => {
    if (!remindersOn) return;
    clearTimers();
    meds.forEach((m) => m.times.forEach((hhmm) => scheduleOne(`${m.id}-${hhmm}`, hhmm, m.name)));
    return clearTimers;
  }, [remindersOn, meds, scheduleOne, clearTimers]);

  // --- Photo + OCR ---
  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setOcrStatus("idle");
    setCandidates([]);
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function runOcr() {
    if (!photoFile) return;
    setOcrStatus("reading");
    setCandidates([]);
    try {
      const { default: Tesseract } = await import("tesseract.js");
      const result = await Tesseract.recognize(photoFile, "spa");
      const parsed = parsePrescriptionText(result.data.text ?? "");
      if (parsed.length === 0) {
        setOcrStatus("empty");
        return;
      }
      setCandidates(parsed);
      setOcrStatus("ok");
    } catch {
      setOcrStatus("error");
    }
  }

  function addCandidate(candidate: ParsedMedication) {
    const med: Medication = {
      id: genId(),
      name: candidate.name,
      dose: candidate.dose,
      times: timesForDosesPerDay(candidate.dosesPerDay ?? 1, "08:00"),
      createdAt: new Date().toISOString(),
    };
    setMeds(upsertMedication(med, userId));
    setCandidates((prev) => prev.filter((c) => c !== candidate));
  }

  // --- Manual form ---
  function openAdd() {
    setDraft(EMPTY_DRAFT);
    setShowForm(true);
  }

  function openEdit(med: Medication) {
    setDraft({
      id: med.id,
      name: med.name,
      dose: med.dose ?? "",
      dosesPerDay: med.times.length || 1,
      firstTime: med.times[0] ?? "08:00",
      withFood: Boolean(med.withFood),
      notes: med.notes ?? "",
    });
    setShowForm(true);
  }

  function submitDraft(event: React.FormEvent) {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    const med: Medication = {
      id: draft.id ?? genId(),
      name,
      dose: draft.dose.trim() || undefined,
      times: timesForDosesPerDay(draft.dosesPerDay, draft.firstTime),
      withFood: draft.withFood,
      notes: draft.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setMeds(upsertMedication(med, userId));
    setShowForm(false);
    setDraft(EMPTY_DRAFT);
  }

  function onRemove(id: string) {
    setMeds(removeMedication(id, userId));
  }

  async function enableReminders() {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setRemindersOn(true);
  }

  async function openShare() {
    if (meds.length === 0) return;
    setShareBusy(true);
    try {
      const care = getCare(userId);
      const doctorName = care.doctorName.trim() || undefined;
      const token = encodeShare({
        v: 1,
        meds: meds.map((m) => ({ n: m.name, d: m.dose, t: m.times })),
        doctor: doctorName,
        date: new Date().toISOString(),
      });
      const url = `${window.location.origin}/verify?d=${token}`;
      const { toDataURL } = await import("qrcode");
      const dataUrl = await toDataURL(url, { width: 320, margin: 1 });
      setShareDoctor(doctorName);
      setShareQr(dataUrl);
    } catch {
      setShareQr(null);
    } finally {
      setShareBusy(false);
    }
  }

  const doseOptions = [
    { value: 1, label: t("form.freqDaily") },
    { value: 2, label: t("form.freqTwice") },
    { value: 3, label: t("form.freqThrice") },
    { value: 4, label: t("form.freqFour") },
  ];

  return (
    <div className="space-y-6">
      {/* Honesty + privacy banner */}
      <Reveal>
        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm sm:flex-row sm:items-center sm:gap-4">
          <span className="flex items-center gap-2 font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t("disclaimer")}
          </span>
          <span className="flex items-center gap-2 text-rehub-900/60 sm:ml-auto">
            <ShieldCheck className="h-4 w-4 shrink-0 text-rehub-600" />
            {t("deviceNote")}
          </span>
        </div>
      </Reveal>

      {/* Prescription photo + OCR */}
      <Reveal>
        <section className="rounded-2xl border border-rehub-100 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-rehub-950">{t("photo.title")}</h3>
              <p className="text-xs text-rehub-900/55">{t("photo.hint")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-rehub-200 bg-rehub-50/50 p-4 sm:w-52">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="max-h-40 w-full rounded-lg object-contain" />
              ) : (
                <Pill className="h-10 w-10 text-rehub-300" />
              )}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-rehub-200 bg-white px-3 py-1.5 text-xs font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
              >
                <Camera className="h-3.5 w-3.5" />
                {photoUrl ? t("photo.change") : t("photo.take")}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onPhotoChange}
                className="hidden"
              />
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <button
                type="button"
                disabled={!photoFile || ocrStatus === "reading"}
                onClick={runOcr}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rehub-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ocrStatus === "reading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {ocrStatus === "reading" ? t("photo.reading") : t("photo.autofill")}
              </button>
              <p className="text-xs text-rehub-900/50">{t("photo.autofillHint")}</p>

              {ocrStatus === "ok" && (
                <p className="text-xs font-medium text-rehub-700">{t("photo.readOk")}</p>
              )}
              {ocrStatus === "empty" && (
                <p className="text-xs font-medium text-amber-700">{t("photo.readEmpty")}</p>
              )}
              {ocrStatus === "error" && (
                <p className="text-xs font-medium text-red-600">{t("photo.readError")}</p>
              )}

              {/* Parsed candidates — user confirms each */}
              {candidates.length > 0 && (
                <ul className="space-y-2">
                  {candidates.map((c, i) => (
                    <li
                      key={`${c.name}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-rehub-100 bg-rehub-50/50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-rehub-950">{c.name}</p>
                        <p className="text-xs text-rehub-900/55">
                          {[c.dose, c.dosesPerDay ? `${c.dosesPerDay}×/día` : null]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addCandidate(c)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rehub-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-rehub-700"
                      >
                        <Plus className="h-3 w-3" />
                        {t("list.add")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Schedule list */}
      <Reveal>
        <section className="rounded-2xl border border-rehub-100 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                <Clock className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-rehub-950">{t("list.title")}</h3>
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rehub-200 bg-white px-3 py-1.5 text-xs font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("form.title")}
            </button>
          </div>

          {meds.length === 0 ? (
            <p className="rounded-xl border border-dashed border-rehub-200 bg-rehub-50/40 px-4 py-6 text-center text-sm text-rehub-900/55">
              {t("list.empty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {meds.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col gap-3 rounded-xl border border-rehub-100 bg-white px-4 py-3 transition-all hover:border-rehub-200 hover:shadow-elevated sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-rehub-950">{m.name}</p>
                      {m.dose && (
                        <span className="rounded-full bg-rehub-100 px-2 py-0.5 text-xs font-medium text-rehub-700">
                          {m.dose}
                        </span>
                      )}
                      {m.withFood && (
                        <span className="inline-flex items-center gap-1 text-xs text-rehub-900/55">
                          <Utensils className="h-3 w-3" />
                          {t("list.withFood")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.times.map((hhmm) => (
                        <span
                          key={hhmm}
                          className="inline-flex items-center gap-1 rounded-lg bg-rehub-50 px-2 py-0.5 text-xs font-medium text-rehub-700"
                        >
                          <Clock className="h-3 w-3" />
                          {hhmm}
                        </span>
                      ))}
                    </div>
                    {m.notes && <p className="mt-1 text-xs text-rehub-900/55">{m.notes}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rehub-200 bg-white px-3 py-1.5 text-xs font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
                    >
                      <Pencil className="h-3 w-3" />
                      {t("list.edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(m.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t("list.delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Reminders control */}
          {meds.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-rehub-100 bg-rehub-50/60 p-4 sm:flex-row sm:items-center">
              {remindersOn ? (
                <span className="flex items-center gap-2 text-sm font-medium text-rehub-700">
                  <Check className="h-4 w-4" />
                  {t("list.remindersOn")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={enableReminders}
                  className="inline-flex items-center gap-2 rounded-xl bg-rehub-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700"
                >
                  <Bell className="h-4 w-4" />
                  {t("list.enableReminders")}
                </button>
              )}
              <p className="text-xs text-rehub-900/55 sm:ml-auto">{t("list.remindersHint")}</p>
            </div>
          )}

          {meds.length > 0 && (
            <button
              type="button"
              onClick={openShare}
              disabled={shareBusy}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rehub-200 bg-white px-4 py-2 text-sm font-semibold text-rehub-800 transition-all hover:bg-rehub-50 disabled:opacity-50"
            >
              {shareBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
              {t("share.button")}
            </button>
          )}
        </section>
      </Reveal>

      {/* Add / edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-rehub-950/40 p-4 backdrop-blur-sm sm:items-center">
          <form
            onSubmit={submitDraft}
            className="w-full max-w-md space-y-4 rounded-2xl border border-rehub-100 bg-white p-5 shadow-elevated"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rehub-100 text-rehub-700">
                <Pill className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-rehub-950">
                {draft.id ? t("form.editTitle") : t("form.title")}
              </h3>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-rehub-900/80">{t("form.name")}</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder={t("form.namePlaceholder")}
                className="w-full rounded-xl border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-500 focus:ring-2 focus:ring-rehub-500/20"
                autoFocus
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-rehub-900/80">{t("form.dose")}</span>
                <input
                  value={draft.dose}
                  onChange={(e) => setDraft((d) => ({ ...d, dose: e.target.value }))}
                  placeholder={t("form.dosePlaceholder")}
                  className="w-full rounded-xl border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-500 focus:ring-2 focus:ring-rehub-500/20"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-rehub-900/80">{t("form.startTime")}</span>
                <input
                  type="time"
                  value={draft.firstTime}
                  onChange={(e) => setDraft((d) => ({ ...d, firstTime: e.target.value }))}
                  className="w-full rounded-xl border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-500 focus:ring-2 focus:ring-rehub-500/20"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-rehub-900/80">{t("form.frequency")}</span>
              <select
                value={draft.dosesPerDay}
                onChange={(e) => setDraft((d) => ({ ...d, dosesPerDay: Number(e.target.value) }))}
                className="w-full rounded-xl border border-rehub-200 bg-white px-3 py-2 text-sm outline-none focus:border-rehub-500 focus:ring-2 focus:ring-rehub-500/20"
              >
                {doseOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-rehub-900/55">{t("form.times")}:</span>
              {timesForDosesPerDay(draft.dosesPerDay, draft.firstTime).map((hhmm) => (
                <span
                  key={hhmm}
                  className="inline-flex items-center gap-1 rounded-lg bg-rehub-50 px-2 py-0.5 text-xs font-medium text-rehub-700"
                >
                  <Clock className="h-3 w-3" />
                  {hhmm}
                </span>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-rehub-900/80">
              <input
                type="checkbox"
                checked={draft.withFood}
                onChange={(e) => setDraft((d) => ({ ...d, withFood: e.target.checked }))}
                className="h-4 w-4 rounded border-rehub-300 text-rehub-600 focus:ring-rehub-500/30"
              />
              {t("form.withFood")}
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-rehub-900/80">{t("form.notes")}</span>
              <input
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder={t("form.notesPlaceholder")}
                className="w-full rounded-xl border border-rehub-200 px-3 py-2 text-sm outline-none focus:border-rehub-500 focus:ring-2 focus:ring-rehub-500/20"
              />
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={!draft.name.trim()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rehub-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-rehub-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {t("form.save")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-rehub-200 bg-white px-4 py-2.5 text-sm font-semibold text-rehub-800 transition-all hover:bg-rehub-50"
              >
                {t("form.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Share / verify QR modal */}
      {shareQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rehub-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs space-y-4 rounded-2xl border border-rehub-100 bg-white p-5 text-center shadow-elevated">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-rehub-950">{t("share.title")}</h3>
              <button
                type="button"
                onClick={() => setShareQr(null)}
                aria-label={t("form.cancel")}
                className="rounded-lg p-1 text-rehub-900/50 transition-colors hover:bg-rehub-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shareQr}
              alt=""
              width={220}
              height={220}
              className="mx-auto rounded-xl border border-rehub-100"
            />
            {shareDoctor ? (
              <p className="text-sm font-medium text-rehub-900/70">
                {t("share.approvedBy", { name: shareDoctor })}
              </p>
            ) : (
              <p className="text-xs text-amber-700">{t("share.noDoctor")}</p>
            )}
            <p className="text-xs leading-relaxed text-rehub-900/50">{t("share.hint")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
