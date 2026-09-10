import { getAdminStats } from "@/app/actions/dashboard-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExportButton } from "@/components/dashboard/export-button";
import { ExportKpiButton } from "@/components/dashboard/export-kpi-button";
import { OverdueReminderButton } from "@/components/dashboard/overdue-reminder-button";
import { DevicePieChart } from "@/components/dashboard/device-pie-chart";
import { TicketStatusBadge } from "@/components/tickets/status-badge";
import Link from "next/link";
import { format } from "date-fns";

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="border-b pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
      <span className="text-primary">▶</span> {label}
    </h3>
  );
}

export async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-primary">▶</span> SYSTEM.ADMIN_DASHBOARD
          </h1>
          <p className="mt-1 text-lg font-semibold">Trung tâm điều hành hỗ trợ kỹ thuật</p>
        </div>
        <div className="hidden font-mono text-xs text-muted-foreground md:block">
          [ UPTIME: LIVE // {format(new Date(), "dd-MM-yyyy HH:mm:ss")} ]
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <ExportButton />
        <ExportKpiButton />
        <OverdueReminderButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tổng thiết bị" value={stats.totalDevices} />
        <StatCard title="Thiết bị hỏng" value={stats.brokenDevices} />
        <StatCard title="Ticket mở" value={stats.openTickets} />
        <StatCard title="Chưa xử lý xong" value={stats.unresolvedTickets} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-sm bg-card p-5 flex flex-col h-[400px]">
          <SectionHeader label="DEVICE.STATUS_DISTRIBUTION" />
          <div className="flex-1 min-h-0 pt-4">
            <DevicePieChart data={stats.pieData} />
          </div>
        </div>

        <div className="border rounded-sm bg-card p-5 flex flex-col h-[400px]">
          <SectionHeader label="TICKETS.RECENT_ACTIVITY" />
          <div className="flex-1 overflow-y-auto divide-y divide-border pt-2">
            {stats.recentTickets.length === 0 ? (
              <p className="py-4 font-mono text-sm text-muted-foreground">
                {"// Chưa có ticket nào."}
              </p>
            ) : (
              stats.recentTickets.map(ticket => (
                <div key={ticket.id} className="py-3 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="font-mono text-sm text-primary hover:underline line-clamp-1"
                    >
                      {ticket.title}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      by {ticket.creator.name ?? "unknown"} • {format(new Date(ticket.createdAt), "dd/MM HH:mm")}
                    </p>
                  </div>
                  <TicketStatusBadge status={ticket.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
