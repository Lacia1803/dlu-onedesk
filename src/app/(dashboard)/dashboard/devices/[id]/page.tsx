import Link from "next/link";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCodeDisplay } from "@/components/devices/qr-code-display";
import { MaintenanceList } from "@/components/devices/maintenance-list";
import { DeviceSoftwareList } from "@/components/devices/device-software-list";
import { DeviceTransferModal } from "@/components/devices/device-transfer-modal";
import { Badge } from "@/components/ui/badge";

export default async function DeviceDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const canEdit = role === "ADMIN" || role === "TECHNICIAN";

  const device = await db.device.findUnique({
    where: { id: params.id },
    include: {
      room: true,
      software: { include: { software: true } },
    }
  });

  if (!device || device.deletedAt) {
    notFound();
  }

  const maintenanceLogs = await db.maintenanceLog.findMany({
    where: { deviceId: params.id },
    include: { technician: { select: { name: true } } },
    orderBy: { performedAt: "desc" },
  });

  // Lịch sử ticket của thiết bị
  const deviceTickets = await db.ticket.findMany({
    where: { deviceId: params.id },
    select: {
      id: true, title: true, status: true, priority: true,
      createdAt: true, resolvedAt: true, closedAt: true, rating: true,
      creator: { select: { name: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const allSoftware = await db.software.findMany({ orderBy: { name: "asc" } });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge className="bg-green-500">Hoạt động</Badge>;
      case "BROKEN": return <Badge variant="destructive">Hỏng</Badge>;
      case "MAINTENANCE": return <Badge className="bg-yellow-500">Bảo trì</Badge>;
      case "RETIRED": return <Badge variant="secondary">Thanh lý</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{device.name}</h1>
          <p className="text-muted-foreground">Phòng: {device.room.name}</p>
        </div>
        <div>{getStatusBadge(device.status)}</div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Thông tin chung</TabsTrigger>
          <TabsTrigger value="software">Phần mềm</TabsTrigger>
          <TabsTrigger value="maintenance">Bảo trì</TabsTrigger>
          <TabsTrigger value="history">Lịch sử sự cố ({deviceTickets.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 border rounded-lg p-4 bg-card">
              <h3 className="font-semibold text-lg border-b pb-2">Chi tiết</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Loại:</span>
                <span>{device.type}</span>
                <span className="text-muted-foreground">Nhà sản xuất:</span>
                <span>{device.manufacturer || "-"}</span>
                <span className="text-muted-foreground">Model:</span>
                <span>{device.model || "-"}</span>
                <span className="text-muted-foreground">Số Serial:</span>
                <span className="font-mono">{device.serialNumber || "-"}</span>
                <span className="text-muted-foreground">Ngày mua:</span>
                <span>{device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString("vi-VN") : "-"}</span>
                <span className="text-muted-foreground">Hết bảo hành:</span>
                <span className={
                  device.warrantyEnd && new Date() > new Date(device.warrantyEnd)
                    ? "text-red-600 font-medium"
                    : ""
                }>
                  {device.warrantyEnd ? new Date(device.warrantyEnd).toLocaleDateString("vi-VN") : "-"}
                  {device.warrantyEnd && new Date() > new Date(device.warrantyEnd) && " (đã hết)"}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg border-b pb-2 pt-4">Cấu hình</h3>
              {device.specifications ? (
                <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(device.specifications, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">Không có dữ liệu cấu hình.</p>
              )}
              
              <h3 className="font-semibold text-lg border-b pb-2 pt-4">Ghi chú</h3>
              <p className="text-sm">{device.notes || "-"}</p>
            </div>
            
            <div className="space-y-4 flex flex-col items-center">
              {canEdit && <DeviceTransferModal deviceId={device.id} currentRoomId={device.roomId} />}
              <Link href={`/dashboard/tickets/new?deviceId=${device.id}`} className="w-full max-w-sm inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
                Báo cáo sự cố thiết bị này
              </Link>
              <QrCodeDisplay qrCode={device.qrCode} deviceName={device.name} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="software" className="pt-4">
          <DeviceSoftwareList
            deviceId={device.id}
            installedSoftware={device.software}
            allSoftware={allSoftware}
            canEdit={canEdit}
          />
        </TabsContent>
        
        <TabsContent value="maintenance" className="pt-4">
          <MaintenanceList deviceId={device.id} logs={maintenanceLogs} canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
