"use server";

import { db } from "@/lib/db";
import { roomSchema, RoomFormValues } from "@/lib/validations/room";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createRoom(data: RoomFormValues) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." };
  }

  const parsed = roomSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const exists = await db.room.findFirst({ where: { name: parsed.data.name, deletedAt: null } });
  if (exists) return { success: false, error: "Tên phòng máy đã tồn tại." };

  await db.room.create({ data: parsed.data });
  revalidatePath("/dashboard/rooms");
  return { success: true };
}

export async function updateRoom(id: string, data: RoomFormValues) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." };
  }

  const parsed = roomSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const exists = await db.room.findFirst({
    where: { name: parsed.data.name, deletedAt: null, id: { not: id } }
  });
  if (exists) return { success: false, error: "Tên phòng máy đã tồn tại." };

  await db.room.update({ where: { id }, data: parsed.data });
  revalidatePath("/dashboard/rooms");
  revalidatePath(`/dashboard/rooms/${id}`);
  return { success: true };
}

export async function deleteRoom(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Chỉ Admin mới có quyền xóa phòng máy." };
  }

  const activeDevices = await db.device.count({
    where: { roomId: id, deletedAt: null, status: "ACTIVE" }
  });
  if (activeDevices > 0) {
    return { success: false, error: "Không thể xóa. Phòng này đang có thiết bị hoạt động." };
  }

  await db.room.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/dashboard/rooms");
  return { success: true };
}
