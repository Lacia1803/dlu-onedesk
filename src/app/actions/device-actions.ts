"use server";

import { db } from "@/lib/db";
import { deviceSchema, DeviceFormValues, maintenanceSchema, MaintenanceFormValues, deviceSoftwareSchema, DeviceSoftwareFormValues } from "@/lib/validations/device";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function checkPermission(session: any) {
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
  let purchaseDate = parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null;
  let warrantyEnd = parsed.data.warrantyEnd ? new Date(parsed.data.warrantyEnd) : null;

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

  let purchaseDate = parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null;
  let warrantyEnd = parsed.data.warrantyEnd ? new Date(parsed.data.warrantyEnd) : null;

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

  await db.maintenanceLog.create({
    data: {
      ...parsed.data,
      deviceId,
      performedAt: new Date(parsed.data.performedAt),
    },
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
