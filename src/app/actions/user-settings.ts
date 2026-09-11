"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { userSettingsSchema } from "@/lib/validations/user-settings";
import { changePasswordSchema } from "@/lib/validations/password";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireFreshAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function updateUserSettings(data: { name: string; phone?: string; avatar?: string }) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const parsed = userSettingsSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      avatar: parsed.data.avatar || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
    return { success: false, error: msg };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });
  if (!user) return { success: false, error: "Người dùng không tồn tại." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) return { success: false, error: "Mật khẩu hiện tại không chính xác." };

  const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashed, mustChangePassword: false },
  });

  await logAudit({
    action: "PASSWORD_CHANGE",
    entity: "User",
    entityId: session.user.id,
    userId: session.user.id,
    details: { self: true },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function adminResetPassword(targetUserId: string) {
  const session = await requireFreshAdmin();
  if (!session) {
    return { success: false, error: "Chỉ Admin mới có quyền." };
  }
  if (targetUserId === session.user.id) {
    return { success: false, error: "Không thể đặt lại mật khẩu của chính mình." };
  }

  const user = await db.user.findUnique({
    where: { id: targetUserId },
    select: { email: true, deletedAt: true },
  });
  if (!user) return { success: false, error: "Người dùng không tồn tại." };

  // Sinh mật khẩu tạm ngẫu nhiên an toàn (không dùng email tránh lộ mật khẩu)
  const { randomBytes } = await import("crypto");
  const tempPassword = `Dlu@${randomBytes(4).toString("hex")}`;
  const hashed = await bcrypt.hash(tempPassword, 10);
  await db.user.update({
    where: { id: targetUserId },
    data: { password: hashed, mustChangePassword: true },
  });

  await logAudit({
    action: "ADMIN_PASSWORD_RESET",
    entity: "User",
    entityId: targetUserId,
    userId: session.user.id,
    details: { targetEmail: user.email },
  });

  revalidatePath("/admin/users");
  return { success: true, tempPassword };
}
