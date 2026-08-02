import { randomBytes } from "node:crypto";
import { pgPool } from "@/lib/db";

/**
 * Recetas emitidas por el médico. Servidor únicamente.
 *
 * La diferencia con el resumen que comparte el paciente (`prescription-share`)
 * es de fondo, no de forma: **aquí el emisor es el médico y los datos nunca
 * viajan en el QR**. El código lleva solo un identificador opaco; la farmacia
 * consulta el registro contra este servidor.
 *
 * Eso es lo que impide falsificarla o editarla — no la frescura de la página.
 * Un token que carga sus propios datos se puede reescribir entero por mucho que
 * se refresque; un identificador que hay que resolver contra el servidor, no.
 *
 * Lo que sí aporta consultar en vivo es el ESTADO: una receta anulada por el
 * médico o ya dispensada en otra farmacia se ve al instante.
 *
 * Techo honesto: esto acredita que el registro lo creó una cuenta de ReHub, no
 * que su titular sea un médico colegiado. «Auténtica dentro de ReHub» no es
 * «válida legalmente»; para eso haría falta verificar el exequátur y respaldo
 * regulatorio.
 */

export type PrescriptionStatus = "vigente" | "anulada" | "dispensada";

export interface PrescribedMed {
  name: string;
  dose?: string;
  /** Horas «HH:mm» en que toca la toma. */
  times: string[];
}

export interface Prescription {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string | null;
  patientName: string;
  center: string | null;
  meds: PrescribedMed[];
  notes: string | null;
  status: PrescriptionStatus;
  issuedAt: string;
  dispensedAt: string | null;
  cancelledAt: string | null;
}

/** `null` cuando no hay base configurada o no responde: la app sigue en pie. */
type Resultado<T> = { ok: true; value: T } | { ok: false; reason: "sin-base" | "error" };

let tablaLista = false;

/**
 * La tabla se crea la primera vez que hace falta. Este proyecto no tiene un
 * runner de migraciones y la base de producción vive en Neon, así que crearla
 * de forma perezosa evita un paso manual que se olvidaría justo antes de la
 * presentación.
 */
async function asegurarTabla(): Promise<boolean> {
  if (!pgPool) return false;
  if (tablaLista) return true;
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id            TEXT PRIMARY KEY,
      doctor_id     TEXT NOT NULL,
      doctor_name   TEXT NOT NULL,
      patient_id    TEXT,
      patient_name  TEXT NOT NULL,
      center        TEXT,
      meds          JSONB NOT NULL,
      notes         TEXT,
      status        TEXT NOT NULL DEFAULT 'vigente',
      issued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      dispensed_at  TIMESTAMPTZ,
      cancelled_at  TIMESTAMPTZ
    )
  `);
  await pgPool.query(
    `CREATE INDEX IF NOT EXISTS prescriptions_patient_idx ON prescriptions (patient_id)`
  );
  tablaLista = true;
  return true;
}

/**
 * Identificador del QR: corto para que el código sea fácil de escanear, y con
 * suficiente azar (80 bits) para que no se pueda adivinar probando.
 */
function nuevoId(): string {
  return randomBytes(10).toString("base64url");
}

interface FilaCruda {
  id: string;
  doctor_id: string;
  doctor_name: string;
  patient_id: string | null;
  patient_name: string;
  center: string | null;
  meds: PrescribedMed[];
  notes: string | null;
  status: PrescriptionStatus;
  issued_at: Date;
  dispensed_at: Date | null;
  cancelled_at: Date | null;
}

function aReceta(fila: FilaCruda): Prescription {
  return {
    id: fila.id,
    doctorId: fila.doctor_id,
    doctorName: fila.doctor_name,
    patientId: fila.patient_id,
    patientName: fila.patient_name,
    center: fila.center,
    meds: Array.isArray(fila.meds) ? fila.meds : [],
    notes: fila.notes,
    status: fila.status,
    issuedAt: fila.issued_at.toISOString(),
    dispensedAt: fila.dispensed_at?.toISOString() ?? null,
    cancelledAt: fila.cancelled_at?.toISOString() ?? null,
  };
}

async function conBase<T>(run: () => Promise<T>): Promise<Resultado<T>> {
  if (!pgPool) return { ok: false, reason: "sin-base" };
  try {
    if (!(await asegurarTabla())) return { ok: false, reason: "sin-base" };
    return { ok: true, value: await run() };
  } catch (error) {
    console.warn(
      "[recetas] La base de datos no respondió.",
      error instanceof Error ? error.message : error
    );
    return { ok: false, reason: "error" };
  }
}

export interface NuevaReceta {
  doctorId: string;
  doctorName: string;
  patientId: string | null;
  patientName: string;
  center?: string;
  meds: PrescribedMed[];
  notes?: string;
}

export async function issuePrescription(datos: NuevaReceta): Promise<Resultado<Prescription>> {
  return conBase(async () => {
    const id = nuevoId();
    const { rows } = await pgPool!.query<FilaCruda>(
      `INSERT INTO prescriptions
         (id, doctor_id, doctor_name, patient_id, patient_name, center, meds, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
       RETURNING *`,
      [
        id,
        datos.doctorId,
        datos.doctorName,
        datos.patientId,
        datos.patientName,
        datos.center ?? null,
        JSON.stringify(datos.meds),
        datos.notes ?? null,
      ]
    );
    return aReceta(rows[0]);
  });
}

export async function getPrescription(id: string): Promise<Resultado<Prescription | null>> {
  return conBase(async () => {
    const { rows } = await pgPool!.query<FilaCruda>(
      `SELECT * FROM prescriptions WHERE id = $1 LIMIT 1`,
      [id]
    );
    return rows[0] ? aReceta(rows[0]) : null;
  });
}

export async function listPrescriptionsForPatient(
  patientId: string
): Promise<Resultado<Prescription[]>> {
  return conBase(async () => {
    const { rows } = await pgPool!.query<FilaCruda>(
      `SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY issued_at DESC LIMIT 20`,
      [patientId]
    );
    return rows.map(aReceta);
  });
}

export async function listPrescriptionsByDoctor(
  doctorId: string
): Promise<Resultado<Prescription[]>> {
  return conBase(async () => {
    const { rows } = await pgPool!.query<FilaCruda>(
      `SELECT * FROM prescriptions WHERE doctor_id = $1 ORDER BY issued_at DESC LIMIT 50`,
      [doctorId]
    );
    return rows.map(aReceta);
  });
}

/**
 * Anular solo la puede el médico que la emitió. Se comprueba contra su id de
 * sesión, no contra un dato que venga en la petición.
 */
export async function cancelPrescription(
  id: string,
  doctorId: string
): Promise<Resultado<Prescription | null>> {
  return conBase(async () => {
    const { rows } = await pgPool!.query<FilaCruda>(
      `UPDATE prescriptions
          SET status = 'anulada', cancelled_at = now()
        WHERE id = $1 AND doctor_id = $2 AND status <> 'anulada'
        RETURNING *`,
      [id, doctorId]
    );
    return rows[0] ? aReceta(rows[0]) : null;
  });
}

/**
 * Marcar dispensada no pide sesión: quien tiene el código es la farmacia que
 * lo está atendiendo, igual que con una receta de papel — la posesión es la
 * credencial. Solo se permite sobre una receta vigente, para que una anulada no
 * pueda «resucitar» y para que no se dispense dos veces.
 */
export async function dispensePrescription(id: string): Promise<Resultado<Prescription | null>> {
  return conBase(async () => {
    const { rows } = await pgPool!.query<FilaCruda>(
      `UPDATE prescriptions
          SET status = 'dispensada', dispensed_at = now()
        WHERE id = $1 AND status = 'vigente'
        RETURNING *`,
      [id]
    );
    return rows[0] ? aReceta(rows[0]) : null;
  });
}
