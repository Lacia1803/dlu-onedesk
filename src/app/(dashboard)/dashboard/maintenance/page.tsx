import { getAllMaintenanceLogs } from "@/app/actions/maintenance-actions";
import { MaintenanceCalendar } from "@/components/maintenance/maintenance-calendar";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const logs = await getAllMaintenanceLogs();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lịch bảo trì</h1>
        <p className="text-sm text-muted-foreground">
          Xem toàn bộ lịch sử bảo trì thiết bị theo tháng.
        </p>
      </div>
      <MaintenanceCalendar initialLogs={logs} />
    </div>
  );
}
