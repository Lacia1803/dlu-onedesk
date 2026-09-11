"use server";

import { db } from "@/lib/db";
import { softwareSchema, SoftwareFormValues } from "@/lib/validations/software";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireFreshAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function createSoftware(data: SoftwareFormValues) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." };
  }

  const parsed = softwareSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const exists = await db.software.findFirst({
    where: {
      name: parsed.data.name,
      version: parsed.data.version || null,
    },
  });
  if (exists) return { success: false, error: "Phần mềm này đã tồn tại." };

  await db.software.create({
    data: {
      name: parsed.data.name,
      version: parsed.data.version || null,
      license: parsed.data.license || null,
    },
  });
  revalidatePath("/dashboard/software");
  return { success: true };
}

export async function updateSoftware(id: string, data: SoftwareFormValues) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
    return { success: false, error: "Bạn không có quyền thực hiện thao tác này." };
  }

  const parsed = softwareSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  const exists = await db.software.findFirst({
    where: {
      name: parsed.data.name,
      version: parsed.data.version || null,
      id: { not: id },
    },
  });
  if (exists) return { success: false, error: "Phần mềm này đã tồn tại." };

  await db.software.update({
    where: { id },
    data: {
      name: parsed.data.name,
      version: parsed.data.version || null,
      license: parsed.data.license || null,
    },
  });
  revalidatePath("/dashboard/software");
  revalidatePath(`/dashboard/software/${id}`);
  return { success: true };
}

export async function deleteSoftware(id: string) {
  const session = await requireFreshAdmin();
  if (!session) {
    return { success: false, error: "Chỉ Admin mới có quyền xóa phần mềm." };
  }

  const deviceCount = await db.deviceSoftware.count({ where: { softwareId: id } });
  if (deviceCount > 0) {
    return {
      success: false,
      error: `Không thể xóa. Còn ${deviceCount} thiết bị đang cài đặt phần mềm này.`,
    };
  }

  await db.software.delete({ where: { id } });
  revalidatePath("/dashboard/software");
  return { success: true };
}
