"use server";

import { authenticator } from "@otplib/preset-default";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { userRoleUpdateSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import { requireFreshAdmin, requireFreshRole } from "@/lib/permissions";
import { buildWorkbookBuffer, bufferToBase64 } from "@/lib/xlsx";
import { format } from "date-fns";

/**
 * Kiểm tra quyền ADMIN với role tươi từ DB (không tin role trong JWT).
 */
async function requireAdmin() {
  return requireFreshAdmin();
}

export async function updateUserRole(data: { id: string; role: string }) {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Chỉ Admin mới có quyền đổi vai trò." };

  const parsed = userRoleUpdateSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ." };

  if (parsed.data.id === session.user.id) {
    return { success: false, error: "Bạn không thể tự đổi vai trò của chính mình." };
  }

  await db.user.update({
    where: { id: parsed.data.id },
    data: { role: parsed.data.role },
  });

  await logAudit({
    action: "USER_ROLE_UPDATE",
    entity: "User",
    entityId: parsed.data.id,
    details: { role: parsed.data.role },
    userId: session.user.id,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Chỉ Admin mới có quyền xóa người dùng." };

  if (id === session.user.id) {
    return { success: false, error: "Bạn không thể tự xóa tài khoản của chính mình." };
  }

  await db.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    action: "USER_DEACTIVATE",
    entity: "User",
    entityId: id,
    userId: session.user.id,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function restoreUser(id: string) {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Chỉ Admin mới có quyền khôi phục người dùng." };

  await db.user.update({
    where: { id },
    data: { deletedAt: null },
  });

  await logAudit({
    action: "USER_RESTORE",
    entity: "User",
    entityId: id,
    userId: session.user.id,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function enableTwoFactor(userId?: string) {
  const session = await requireFreshRole("ADMIN", "TECHNICIAN", "USER");
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const targetId = userId && session.user.role === "ADMIN" ? userId : session.user.id;
  const user = await db.user.findUnique({ where: { id: targetId } });
  if (!user) return { success: false, error: "Người dùng không tồn tại." };

  const secret = authenticator.generateSecret();
  await db.user.update({
    where: { id: targetId },
    data: { twoFactorSecret: encryptSecret(secret) },
  });

  const otpauth = authenticator.keyuri(user.email, "DLU OneDesk", secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return { success: true, qrCodeUrl, secret };
}

export async function verifyTwoFactor(code: string, userId?: string) {
  const session = await requireFreshRole("ADMIN", "TECHNICIAN", "USER");
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const targetId = userId && session.user.role === "ADMIN" ? userId : session.user.id;
  const user = await db.user.findUnique({ where: { id: targetId } });
  if (!user?.twoFactorSecret) return { success: false, error: "Chưa khởi tạo cấu hình 2FA." };

  const valid = authenticator.check(code, decryptSecret(user.twoFactorSecret));
  if (!valid) return { success: false, error: "Mã OTP không chính xác." };

  await db.user.update({
    where: { id: targetId },
    data: { twoFactorEnabled: true },
  });

  await logAudit({
    action: "USER_2FA_ENABLE",
    entity: "User",
    entityId: targetId,
    userId: session.user.id,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function disableTwoFactor(password: string, userId?: string) {
  const session = await requireFreshRole("ADMIN", "TECHNICIAN", "USER");
  if (!session) return { success: false, error: "Vui lòng đăng nhập." };

  const targetId = userId && session.user.role === "ADMIN" ? userId : session.user.id;

  if (targetId === session.user.id) {
    const user = await db.user.findUnique({ where: { id: targetId }, select: { password: true } });
    if (!user) return { success: false, error: "Người dùng không tồn tại." };
    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.default.compare(password, user.password);
    if (!valid) return { success: false, error: "Mật khẩu hiện tại không chính xác." };
  }

  await db.user.update({
    where: { id: targetId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  await logAudit({
    action: "USER_2FA_DISABLE",
    entity: "User",
    entityId: targetId,
    userId: session.user.id,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function getUsersExportData() {
  const session = await requireAdmin();
  if (!session) return null;

  // ponytail: trả toàn bộ user về client để build CSV; tách sang API route streaming nếu >10k dòng
  return db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      deletedAt: true,
    },
  });
}

const USER_COLUMN_LABELS: Record<string, string> = {
  name: "Tên",
  email: "Email",
  role: "Vai trò",
  phone: "Số điện thoại",
  createdAt: "Ngày tham gia",
  deletedAt: "Trạng thái",
};

/**
 * Xuất danh sách người dùng ra .xlsx trên server (không bundle exceljs xuống client).
 * `columns` là danh sách key cột người dùng chọn. Trả null nếu không có quyền.
 */
export async function getUsersExportWorkbook(
  columns: string[]
): Promise<{ filename: string; base64: string } | null> {
  const session = await requireAdmin();
  if (!session) return null;

  const validColumns = columns.filter((c) => c in USER_COLUMN_LABELS);
  if (validColumns.length === 0) return null;

  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      deletedAt: true,
    },
  });

  const rows = users.map((u) => {
    const row: Record<string, string> = {};
    for (const key of validColumns) {
      const label = USER_COLUMN_LABELS[key];
      if (key === "createdAt") row[label] = format(new Date(u.createdAt), "dd/MM/yyyy HH:mm");
      else if (key === "deletedAt") row[label] = u.deletedAt ? "Đã vô hiệu hóa" : "Hoạt động";
      else row[label] = ((u as Record<string, unknown>)[key] as string) || "";
    }
    return row;
  });

  const buffer = await buildWorkbookBuffer([{ name: "Users", rows }]);

  return {
    filename: `Users_Report_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`,
    base64: bufferToBase64(buffer),
  };
}
