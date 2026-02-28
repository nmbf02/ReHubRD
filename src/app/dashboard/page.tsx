import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InicioDashboard } from "@/components/dashboard/InicioDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <InicioDashboard
        userName={session?.user?.name ?? null}
        userId={session?.user?.id ?? null}
      />
    </div>
  );
}
