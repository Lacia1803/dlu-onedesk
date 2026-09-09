import { db } from "@/lib/db";
import { DeviceForm } from "@/components/devices/device-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function EditDevicePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    redirect("/dashboard/devices");
  }

  const device = await db.device.findUnique({
    where: { id: params.id },
  });

  if (!device || device.deletedAt) {
    notFound();
  }

  const rooms = await db.room.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa Thiết bị</h1>
      <DeviceForm initialData={device} rooms={rooms} />
    </div>
  );
}
