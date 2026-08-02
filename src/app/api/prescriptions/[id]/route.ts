import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cancelPrescription, dispensePrescription, getPrescription } from "@/lib/prescriptions";

interface Contexto {
  params: { id: string };
}

/** Consulta pública: es lo que resuelve el QR en la farmacia. */
export async function GET(_request: Request, { params }: Contexto) {
  const resultado = await getPrescription(params.id);
  if (!resultado.ok) {
    return NextResponse.json({ error: "no-disponible" }, { status: 503 });
  }
  if (!resultado.value) {
    return NextResponse.json({ error: "no-encontrada" }, { status: 404 });
  }
  return NextResponse.json({ prescription: resultado.value });
}

/**
 * Dos acciones con permisos distintos:
 *
 * - `anular` — solo el médico que la emitió, comprobado contra su sesión.
 * - `dispensar` — sin sesión: quien tiene el código es la farmacia que está
 *   atendiendo, igual que con el papel. La posesión es la credencial.
 */
export async function PATCH(request: Request, { params }: Contexto) {
  let accion: string | undefined;
  try {
    ({ accion } = await request.json());
  } catch {
    return NextResponse.json({ error: "Petición mal formada." }, { status: 400 });
  }

  if (accion === "anular") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Necesitas iniciar sesión." }, { status: 401 });
    }
    const resultado = await cancelPrescription(params.id, session.user.id);
    if (!resultado.ok) {
      return NextResponse.json({ error: "no-disponible" }, { status: 503 });
    }
    if (!resultado.value) {
      // O no existe, o no la emitió esta cuenta, o ya estaba anulada. No se
      // distingue a propósito: decirlo permitiría sondear recetas ajenas.
      return NextResponse.json({ error: "no-permitido" }, { status: 404 });
    }
    return NextResponse.json({ prescription: resultado.value });
  }

  if (accion === "dispensar") {
    const resultado = await dispensePrescription(params.id);
    if (!resultado.ok) {
      return NextResponse.json({ error: "no-disponible" }, { status: 503 });
    }
    if (!resultado.value) {
      return NextResponse.json({ error: "no-vigente" }, { status: 409 });
    }
    return NextResponse.json({ prescription: resultado.value });
  }

  return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
}
