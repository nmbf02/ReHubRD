import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PerfilForm } from "@/components/dashboard/ProfileForm";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <h1 className="text-2xl font-bold text-rehub-dark mb-2">Mi perfil</h1>
      <p className="text-rehub-dark/70 mb-8">
        Completa la información sobre tu situación para que ReHub pueda identificar
        tus necesidades prioritarias y ofrecerte un acompañamiento adaptado.
      </p>
      <PerfilForm
        userId={session?.user?.id}
        userName={session?.user?.name ?? undefined}
        userEmail={session?.user?.email ?? undefined}
      />
    </div>
  );
}
