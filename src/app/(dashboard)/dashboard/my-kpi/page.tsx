import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MyKPIDashboard } from "@/components/dashboard/my-kpi";

export default async function MyKPIPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role === "USER") redirect("/dashboard");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
          <span className="text-primary">▶</span> MY.KPI
        </h1>
        <p className="mt-1 text-lg font-semibold">Hiệu suất làm việc cá nhân</p>
      </div>
      <MyKPIDashboard />
    </div>
  );
}
