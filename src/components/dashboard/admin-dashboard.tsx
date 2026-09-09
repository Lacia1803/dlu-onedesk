import { getAdminStats } from "@/app/actions/dashboard-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExportButton } from "@/components/dashboard/export-button";
import { DevicePieChart } from "@/components/dashboard/device-pie-chart";
import { TicketStatusBadge } from "@/components/tickets/status-badge";
import { Laptop, AlertTriangle, Ticket, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ExportButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Tổng thiết bị" 
          value={stats.totalDevices} 
          icon={<Laptop className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Thiết bị hỏng" 
          value={stats.brokenDevices} 
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />} 
        />
        <StatCard 
          title="Ticket mở" 
          value={stats.openTickets} 
          icon={<Ticket className="h-4 w-4 text-blue-500" />} 
        />
        <StatCard 
          title="Ticket chưa xử lý xong" 
          value={stats.unresolvedTickets} 
          icon={<Clock className="h-4 w-4 text-orange-500" />} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card border rounded-lg p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-medium mb-4">Trạng thái thiết bị</h3>
          <div className="flex-1 min-h-0">
            <DevicePieChart data={stats.pieData} />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-medium mb-4">Ticket mới nhất</h3>
          <div className="flex-1 overflow-y-auto divide-y pr-2">
            {stats.recentTickets.length === 0 ? (
              <p className="text-muted-foreground py-4">Chưa có ticket nào.</p>
            ) : (
              stats.recentTickets.map(ticket => (
                <div key={ticket.id} className="py-3 flex justify-between items-start">
                  <div>
                    <Link href={`/dashboard/tickets/${ticket.id}`} className="font-medium hover:underline text-primary line-clamp-1">
                      {ticket.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tạo bởi {ticket.creator.name} • {format(new Date(ticket.createdAt), "dd/MM HH:mm")}
                    </p>
                  </div>
                  <div>
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
