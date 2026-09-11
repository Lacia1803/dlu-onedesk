import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Server } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function SoftwareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const software = await db.software.findUnique({
    where: { id: resolvedParams.id },
    include: {
      devices: {
        include: { device: true },
        orderBy: { installedAt: "desc" },
      },
    },
  });

  if (!software) notFound();

  const activeDevices = software.devices.filter((ds) => ds.device.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{software.name}</h1>
          <p className="text-muted-foreground">
            {software.version ? `Phiên bản: ${software.version}` : "Chưa có phiên bản"}
          </p>
        </div>
        <Link
          href="/dashboard/software"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Quay lại
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thiết bị</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{software.devices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDevices.length}</div>
          </CardContent>
        </Card>
      </div>

      {software.license && (
        <Card>
          <CardHeader>
            <CardTitle>Giấy phép</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{software.license}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thiết bị đã cài đặt</CardTitle>
        </CardHeader>
        <CardContent>
          {software.devices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có thiết bị nào cài đặt phần mềm này.
            </p>
          ) : (
            <ul className="space-y-2">
              {software.devices.map((ds) => (
                <li
                  key={ds.id}
                  className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md border"
                >
                  <div>
                    <Link
                      href={`/dashboard/devices/${ds.device.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {ds.device.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">{ds.device.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Cài đặt: {ds.installedAt.toLocaleDateString("vi-VN")}
                    </span>
                    <Badge
                      variant={
                        ds.device.status === "ACTIVE"
                          ? "default"
                          : ds.device.status === "BROKEN"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {ds.device.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
