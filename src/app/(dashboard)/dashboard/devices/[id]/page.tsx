import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCodeDisplay } from "@/components/devices/qr-code-display";
import { MaintenanceList } from "@/components/devices/maintenance-list";
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
    orderBy: { performedAt: "desc" },
  });

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
                <span>{device.serialNumber || "-"}</span>
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
              <QrCodeDisplay qrCode={device.qrCode} deviceName={device.name} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="software" className="pt-4">
          <div className="border rounded-md divide-y">
            {device.software.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">Chưa có phần mềm nào được cài đặt.</div>
            ) : (
              device.software.map((ds) => (
                <div key={ds.id} className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{ds.software.name}</h4>
                    <p className="text-sm text-muted-foreground">Phiên bản: {ds.software.version || "-"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="maintenance" className="pt-4">
          <MaintenanceList deviceId={device.id} logs={maintenanceLogs} canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
