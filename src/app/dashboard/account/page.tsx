import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CuentaForm } from "@/components/dashboard/CuentaForm";
import { Suspense } from "react";

export default async function CuentaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/cuenta");
  }

  const userData = {
    id: session.user.id ?? "",
    email: session.user.email ?? null,
    name: session.user.name ?? null,
  };

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8 min-h-[50vh]">
      <h1 className="text-2xl font-bold text-rehub-dark mb-2">
        Configuración de cuenta
      </h1>
      <p className="text-rehub-dark/70 mb-8">
        Información de tu cuenta y preferencias.
      </p>
      <Suspense fallback={
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-rehub-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CuentaForm user={userData} />
      </Suspense>
    </div>
  );
}
