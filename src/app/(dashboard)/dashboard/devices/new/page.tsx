import { db } from "@/lib/db";
import { DeviceForm } from "@/components/devices/device-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewDevicePage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    redirect("/dashboard/devices");
  }

  const rooms = await db.room.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Thêm Thiết bị</h1>
      <DeviceForm rooms={rooms} />
    </div>
  );
}
