/**
 * Pure helpers for turning a dose frequency into concrete daily times, and a
 * best-effort parser that turns OCR text from a prescription photo into
 * candidate medications. The parser is assistive only — the user always
 * confirms before anything is saved or scheduled (safer, and honest about
 * client-side OCR limits, especially on handwritten prescriptions).
 */

/** Build evenly-spaced daily dose times from a doses-per-day count. */
export function timesForDosesPerDay(dosesPerDay: number, firstTime = "08:00"): string[] {
  const doses = Math.min(Math.max(Math.round(dosesPerDay), 1), 6);
  const [rawH, rawM] = firstTime.split(":").map((n) => parseInt(n, 10));
  const startMinutes = (Number.isNaN(rawH) ? 8 : rawH) * 60 + (Number.isNaN(rawM) ? 0 : rawM);
  const interval = Math.round((24 * 60) / doses);
  const times: string[] = [];
  for (let i = 0; i < doses; i += 1) {
    const total = (startMinutes + i * interval) % (24 * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return times.sort();
}

/** Next Date at which "HH:mm" occurs, at or after `from` (rolls to tomorrow). */
export function nextTimeOccurrence(hhmm: string, from: Date): Date {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const when = new Date(from);
  when.setHours(Number.isNaN(h) ? 8 : h, Number.isNaN(m) ? 0 : m, 0, 0);
  if (when.getTime() <= from.getTime()) when.setDate(when.getDate() + 1);
  return when;
}

export interface ParsedMedication {
  name: string;
  dose?: string;
  dosesPerDay?: number;
}

const DOSE_UNIT = /(\d+(?:[.,]\d+)?)\s*(mg|ml|g|mcg|ui|cc)\b/i;

/** Best-effort extraction of candidate medications from raw OCR text. */
export function parsePrescriptionText(text: string): ParsedMedication[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 3);

  const meds: ParsedMedication[] = [];

  for (const line of lines) {
    const doseMatch = line.match(DOSE_UNIT);

    let dosesPerDay: number | undefined;
    const everyHours =
      line.match(/cada\s*(\d{1,2})\s*(?:h|horas?)/i) || line.match(/c\/\s*(\d{1,2})\s*h/i);
    if (everyHours) {
      const hours = parseInt(everyHours[1], 10);
      if (hours > 0 && hours <= 24) dosesPerDay = Math.max(1, Math.round(24 / hours));
    }
    if (!dosesPerDay) {
      const perDay = line.match(/(\d)\s*(?:veces|vez)\s*(?:al|por)?\s*d[ií]a/i);
      if (perDay) dosesPerDay = parseInt(perDay[1], 10);
    }

    const nameMatch = line.match(
      /^[•\-*\d.)\s]*([A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,})?)/
    );
    const name = nameMatch ? nameMatch[1].trim() : "";
    if (name.length < 3) continue;

    meds.push({
      name: name.replace(/\s{2,}/g, " "),
      dose: doseMatch ? `${doseMatch[1]} ${doseMatch[2].toLowerCase()}` : undefined,
      dosesPerDay,
    });
    if (meds.length >= 8) break;
  }

  return meds;
}
