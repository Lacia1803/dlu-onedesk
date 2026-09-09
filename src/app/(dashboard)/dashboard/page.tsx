import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ExportSnapshot } from "@/components/dashboard/export-snapshot";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  const isAdminOrTech = session.user.role === "ADMIN" || session.user.role === "TECHNICIAN";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
      <ExportSnapshot>
        {isAdminOrTech ? <AdminDashboard /> : <UserDashboard />}
      </ExportSnapshot>
    </div>
  );
}
