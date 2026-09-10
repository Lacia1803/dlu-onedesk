"use server";

import { db } from "@/lib/db";
import { deviceSchema, DeviceFormValues, maintenanceSchema, MaintenanceFormValues, deviceSoftwareSchema, DeviceSoftwareFormValues } from "@/lib/validations/device";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type MaintenanceLogWithDetails = {
  id: string;
  type: string;
  description: string;
  parts: string | null;
  cost: number | null;
  performedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deviceId: string;
  technicianId: string;
  technician: { name: string };
};

function checkPermission(session: { user: { role: string } } | null) {
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return false;
  }
  return true;
}

export async function createDevice(data: DeviceFormValues) {
  const session = await getServerSession(authOptions);
  if (!checkPermission(session)) return { success: false, error: "Không có quyền thao tác." };

  const parsed = deviceSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  if (parsed.data.serialNumber) {
    const exists = await db.device.findFirst({ where: { serialNumber: parsed.data.serialNumber, deletedAt: null } });
    if (exists) return { success: false, error: "Số Serial đã tồn tại." };
  }

  // Handle optional dates safely
  const purchaseDate = parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null;
  const warrantyEnd = parsed.data.warrantyEnd ? new Date(parsed.data.warrantyEnd) : null;

  // Handle JSON specifications
  let specsObj = null;
  if (parsed.data.specifications) {
    try {
      specsObj = JSON.parse(parsed.data.specifications);
    } catch {
      return { success: false, error: "Cấu hình phải là chuỗi JSON hợp lệ." };
    }
  }

  const qrCode = `DEV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  await db.device.create({
    data: {
      ...parsed.data,
      purchaseDate,
      warrantyEnd,
      specifications: specsObj,
      qrCode,
    },
  });

  revalidatePath("/dashboard/devices");
  return { success: true };
}

export async function updateDevice(id: string, data: DeviceFormValues) {
  const session = await getServerSession(authOptions);
  if (!checkPermission(session)) return { success: false, error: "Không có quyền thao tác." };

  const parsed = deviceSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  if (parsed.data.serialNumber) {
    const exists = await db.device.findFirst({ where: { serialNumber: parsed.data.serialNumber, deletedAt: null, id: { not: id } } });
    if (exists) return { success: false, error: "Số Serial đã tồn tại." };
  }

  const before = await db.device.findUnique({ where: { id } });
  if (!before) return { success: false, error: "Thiết bị không tồn tại." };

  const purchaseDate = parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null;
  const warrantyEnd = parsed.data.warrantyEnd ? new Date(parsed.data.warrantyEnd) : null;

  let specsObj = null;
  if (parsed.data.specifications) {
    try {
      specsObj = JSON.parse(parsed.data.specifications);
    } catch {
      return { success: false, error: "Cấu hình phải là chuỗi JSON hợp lệ." };
    }
  }

  await db.device.update({
    where: { id },
    data: {
      ...parsed.data,
      purchaseDate,
      warrantyEnd,
      specifications: specsObj,
    },
  });

  // Ghi DeviceHistory cho thay đổi nghiệp vụ quan trọng (điều chuyển, đổi trạng thái)
  const history: { type: "RELOCATION" | "STATUS_CHANGE"; description: string }[] = [];
  if (before.roomId !== parsed.data.roomId) {
    const [oldRoom, newRoom] = await Promise.all([
      db.room.findUnique({ where: { id: before.roomId }, select: { name: true } }),
      db.room.findUnique({ where: { id: parsed.data.roomId }, select: { name: true } }),
    ]);
    history.push({ type: "RELOCATION", description: `Điều chuyển: ${oldRoom?.name ?? "?"} → ${newRoom?.name ?? "?"}` });
  }
  if (before.status !== parsed.data.status) {
    history.push({ type: "STATUS_CHANGE", description: `Tình trạng: ${before.status} → ${parsed.data.status}` });
  }
  if (history.length > 0) {
    await db.deviceHistory.createMany({
      data: history.map((h) => ({ deviceId: id, type: h.type, description: h.description, userId: session!.user.id })),
    });
  }

  revalidatePath("/dashboard/devices");
  revalidatePath(`/dashboard/devices/${id}`);
  return { success: true };
}

export async function deleteDevice(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Chỉ Admin mới có quyền xóa thiết bị." };

  await db.device.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/dashboard/devices");
  return { success: true };
}

export async function addMaintenanceLog(deviceId: string, data: MaintenanceFormValues) {
  const session = await getServerSession(authOptions);
  if (!checkPermission(session)) return { success: false, error: "Không có quyền thao tác." };

  const parsed = maintenanceSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const performedAt = new Date(parsed.data.performedAt);

  await db.maintenanceLog.create({
    data: {
      ...parsed.data,
      deviceId,
      technicianId: session!.user.id,
      performedAt,
    },
  });

  // Ghi lịch sử thiết bị + đẩy mốc bảo trì kế tiếp (mặc định 90 ngày)
  await db.deviceHistory.create({
    data: {
      deviceId,
      type: "PART_REPLACED",
      description: `Bảo trì: ${parsed.data.description}${parsed.data.parts ? ` | Linh kiện: ${parsed.data.parts}` : ""}`,
      userId: session!.user.id,
    },
  });
  await db.device.update({
    where: { id: deviceId },
    data: { nextMaintenanceAt: new Date(performedAt.getTime() + 90 * 24 * 60 * 60 * 1000) },
  });

  revalidatePath(`/dashboard/devices/${deviceId}`);
  return { success: true };
}

export async function addSoftwareToDevice(deviceId: string, data: DeviceSoftwareFormValues) {
  const session = await getServerSession(authOptions);
  if (!checkPermission(session)) return { success: false, error: "Không có quyền thao tác." };

  const parsed = deviceSoftwareSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const exists = await db.deviceSoftware.findFirst({
    where: { deviceId, softwareId: parsed.data.softwareId }
  });

  if (exists) return { success: false, error: "Phần mềm này đã được cài đặt trên thiết bị." };

  await db.deviceSoftware.create({
    data: { deviceId, softwareId: parsed.data.softwareId },
  });

  revalidatePath(`/dashboard/devices/${deviceId}`);
  return { success: true };
}

export async function removeSoftwareFromDevice(id: string, deviceId: string) {
  const session = await getServerSession(authOptions);
  if (!checkPermission(session)) return { success: false, error: "Không có quyền thao tác." };

  await db.deviceSoftware.delete({ where: { id } });

  revalidatePath(`/dashboard/devices/${deviceId}`);
  return { success: true };
}
