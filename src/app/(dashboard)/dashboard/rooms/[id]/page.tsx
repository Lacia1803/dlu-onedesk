import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, MapPin, Users } from "lucide-react";
import Link from "next/link";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const room = await db.room.findUnique({
    where: { id: resolvedParams.id, deletedAt: null },
    include: {
      devices: {
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!room) notFound();

  const activeCount = room.devices.filter((d) => d.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
        <Link
          href="/dashboard/rooms"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Quay lại
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vị trí</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.location}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sức chứa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.capacity} máy</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCount} / {room.devices.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách thiết bị</CardTitle>
        </CardHeader>
        <CardContent>
          {room.devices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Phòng máy chưa có thiết bị nào.</p>
          ) : (
            <ul className="space-y-2">
              {room.devices.map((device) => (
                <li
                  key={device.id}
                  className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md border"
                >
                  <div>
                    <Link
                      href={`/dashboard/devices/${device.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {device.name}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">{device.type}</span>
                  </div>
                  <div className="text-sm">
                    {device.status === "ACTIVE" && (
                      <span className="text-green-600">Đang hoạt động</span>
                    )}
                    {device.status === "BROKEN" && <span className="text-red-600">Hỏng</span>}
                    {device.status === "MAINTENANCE" && (
                      <span className="text-yellow-600">Bảo trì</span>
                    )}
                    {device.status === "RETIRED" && <span className="text-gray-500">Thanh lý</span>}
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
