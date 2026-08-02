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

/** Admite dosis compuestas como «500/125 mg» de las combinaciones. */
const DOSE_UNIT = /(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)\s*(mg|ml|mcg|ui|cc|gr|g)\b/i;

/**
 * Datos del encabezado y del paciente. Una receta trae mucho más texto que
 * medicamentos, y sin esta lista el lector proponía «RECETA MÉDICA», «Edad» y
 * «Talla» como si fueran fármacos.
 */
const LINEA_ADMINISTRATIVA =
  /^(receta|nombre|apellido|paciente|edad|sexo|alergias?|talla|peso|imc|temperatura|presi[oó]n|diagn[oó]stico|firma|sello|fecha|dr\.?|dra\.?|c[eé]d\.?|universidad|tel\.?|fax|col\.?|calle|av\.?|cob\.?|afiliado|sanatorio|cl[ií]nica|hospital|centro|l[ií]neas)\b/i;

/** Etiqueta de sección que precede a la prescripción propiamente dicha. */
const ETIQUETA_SECCION =
  /^\s*(tratamiento|indicaciones?|medicamentos?|prescripci[oó]n|receta|rp)\s*[:.\-–]\s*/i;

/** Forma farmacéutica: sobra en el nombre del medicamento. */
const PRESENTACION =
  /\b(tabletas?|comprimidos?|c[aá]psulas?|caps\.?|jarabe|suspensi[oó]n|ampollas?|sobres?|gotas|crema|ung[üu]ento|inyectable|v[ií]a\s+oral)\b/gi;

/** «cada 8 horas» / «c/8h» / «2 veces al día» → tomas por día. */
function dosesPerDayFrom(text: string): number | undefined {
  const cada =
    text.match(/cada\s*(\d{1,2})\s*(?:h\b|horas?)/i) || text.match(/c\/\s*(\d{1,2})\s*h/i);
  if (cada) {
    const horas = parseInt(cada[1], 10);
    if (horas > 0 && horas <= 24) return Math.max(1, Math.round(24 / horas));
  }
  const veces = text.match(/(\d)\s*(?:veces|vez)\s*(?:al|por)?\s*d[ií]a/i);
  if (veces) {
    const n = parseInt(veces[1], 10);
    if (n > 0 && n <= 6) return n;
  }
  // «1 cápsula al día», «2 tabletas por día».
  const porDia = text.match(
    /(\d)\s*(?:c[aá]psulas?|tabletas?|comprimidos?|sobres?|cucharadas?)\s*(?:al|por|cada)\s*d[ií]a/i
  );
  if (porDia) {
    const n = parseInt(porDia[1], 10);
    if (n > 0 && n <= 6) return n;
  }
  return undefined;
}

/**
 * El nombre del fármaco es lo que va ANTES de su dosis. Cortar en la primera
 * cifra evita arrastrar la posología entera al nombre («Ibuprofeno 400 mg - 1
 * cada 8 horas por 5 días»), que es como se ve en las recetas en lista.
 */
function limpiarNombre(texto: string): string {
  return texto
    .replace(/^[•\-*\d.)\s]+/, "")
    .split(/[,;(]/)[0]
    .split(/\d/)[0]
    .replace(PRESENTACION, "")
    .replace(/\s{2,}/g, " ")
    .replace(/[\s.\-–:]+$/, "")
    .trim();
}

/**
 * Extrae medicamentos candidatos del texto que devuelve el OCR.
 *
 * Dos cosas que la versión anterior no hacía y que la volvían inservible
 * incluso con una receta impresa perfectamente leída:
 *
 * 1. **Exigir evidencia.** Antes, CUALQUIER línea con tres letras se proponía
 *    como medicamento. Ahora un candidato necesita una dosis o una frecuencia;
 *    sin eso no es una prescripción, es el membrete.
 * 2. **Unir la posología con su fármaco.** La indicación se reparte en varias
 *    líneas («Amoxicilina … 500/125 mg,» / «tomar 1 cada 8 horas,» / «durante 7
 *    días»), así que las continuaciones se agrupan con el medicamento al que
 *    pertenecen en vez de tratarse como fármacos sueltos.
 *
 * Sigue siendo asistivo: la persona confirma siempre antes de guardar nada.
 */
export function parsePrescriptionText(text: string): ParsedMedication[] {
  const lineas = text
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea.length >= 3);

  const bloques: string[] = [];

  for (const linea of lineas) {
    const conEtiqueta = ETIQUETA_SECCION.test(linea);
    const cuerpo = linea.replace(ETIQUETA_SECCION, "").trim();
    if (cuerpo.length < 3) continue;
    if (!conEtiqueta && LINEA_ADMINISTRATIVA.test(cuerpo)) continue;

    // Abre bloque una etiqueta de sección, una viñeta o un nombre propio con
    // dosis. Lo demás continúa la indicación del bloque anterior.
    const esViñeta = /^[•\-*]|^\d+[.)]\s/.test(linea);
    const empiezaConNombre = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}/.test(cuerpo);
    const abreBloque =
      conEtiqueta || esViñeta || (empiezaConNombre && DOSE_UNIT.test(cuerpo));

    if (abreBloque || bloques.length === 0) bloques.push(cuerpo);
    else bloques[bloques.length - 1] += ` ${cuerpo}`;
  }

  const meds: ParsedMedication[] = [];

  for (const bloque of bloques) {
    const dosis = bloque.match(DOSE_UNIT);
    const tomas = dosesPerDayFrom(bloque);
    // Sin dosis ni frecuencia no hay prescripción que extraer.
    if (!dosis && !tomas) continue;

    const nombre = limpiarNombre(bloque);
    if (nombre.length < 3 || LINEA_ADMINISTRATIVA.test(nombre)) continue;

    meds.push({
      name: nombre,
      dose: dosis ? `${dosis[1].replace(/\s/g, "")} ${dosis[2].toLowerCase()}` : undefined,
      dosesPerDay: tomas,
    });
    if (meds.length >= 8) break;
  }

  return meds;
}
