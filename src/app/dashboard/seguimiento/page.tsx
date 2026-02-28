import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SeguimientoView } from "@/components/dashboard/SeguimientoView";

export default async function SeguimientoPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/seguimiento");
  }

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <h1 className="text-2xl font-bold text-rehub-dark mb-2">Seguimiento</h1>
      <p className="text-rehub-dark/70 mb-8">
        Check-ins periódicos para que el sistema ajuste tu acompañamiento según tu evolución.
      </p>
      <SeguimientoView userId={session.user.id ?? null} />
    </div>
  );
}
