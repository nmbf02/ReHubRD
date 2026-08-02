import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  issuePrescription,
  listPrescriptionsForPatient,
  type PrescribedMed,
} from "@/lib/prescriptions";

/** Emitir exige sesión: el emisor sale de ella, nunca del cuerpo de la petición. */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Necesitas iniciar sesión." }, { status: 401 });
  }

  let cuerpo: {
    doctorName?: string;
    patientId?: string | null;
    patientName?: string;
    center?: string;
    meds?: PrescribedMed[];
    notes?: string;
  };
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición mal formada." }, { status: 400 });
  }

  const meds = (cuerpo.meds ?? [])
    .filter((m) => typeof m?.name === "string" && m.name.trim().length > 1)
    .map((m) => ({
      name: m.name.trim().slice(0, 120),
      dose: typeof m.dose === "string" ? m.dose.trim().slice(0, 60) || undefined : undefined,
      times: Array.isArray(m.times) ? m.times.filter((t) => /^\d{2}:\d{2}$/.test(t)) : [],
    }));

  if (meds.length === 0) {
    return NextResponse.json({ error: "Añade al menos un medicamento." }, { status: 400 });
  }
  if (!cuerpo.patientName?.trim()) {
    return NextResponse.json({ error: "Falta el nombre del paciente." }, { status: 400 });
  }

  const resultado = await issuePrescription({
    doctorId: session.user.id,
    // El nombre visible del médico puede venir del perfil; la identidad que
    // manda para anular es siempre `doctorId`, que sale de la sesión.
    doctorName: cuerpo.doctorName?.trim().slice(0, 120) || session.user.name || "Médico tratante",
    patientId: cuerpo.patientId?.trim() || null,
    patientName: cuerpo.patientName.trim().slice(0, 120),
    center: cuerpo.center?.trim().slice(0, 120) || undefined,
    meds,
    notes: cuerpo.notes?.trim().slice(0, 400) || undefined,
  });

  if (!resultado.ok) {
    return NextResponse.json(
      {
        error:
          resultado.reason === "sin-base"
            ? "Las recetas emitidas necesitan la base de datos, que no está disponible en este entorno."
            : "No pudimos guardar la receta. Inténtalo de nuevo.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ prescription: resultado.value }, { status: 201 });
}

/** Un paciente solo puede listar LAS SUYAS: el id sale de la sesión. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Necesitas iniciar sesión." }, { status: 401 });
  }

  const resultado = await listPrescriptionsForPatient(session.user.id);
  if (!resultado.ok) {
    return NextResponse.json({ prescriptions: [], unavailable: true });
  }
  return NextResponse.json({ prescriptions: resultado.value });
}
