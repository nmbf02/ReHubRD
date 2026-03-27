import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlanView } from "@/components/dashboard/PlanView";
import { ROUTES, hrefLoginCallback } from "@/lib/routes";

export default async function PlanPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(hrefLoginCallback(ROUTES.plan));
  }

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <h1 className="text-2xl font-bold text-rehub-dark mb-2">Mi plan</h1>
      <p className="text-rehub-dark/70 mb-8">
        Recordatorios, recomendaciones prácticas y orientación adaptada a tu situación.
      </p>
      <PlanView userId={session.user.id ?? null} />
    </div>
  );
}
