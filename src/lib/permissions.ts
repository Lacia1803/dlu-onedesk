import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";
import { db } from "@/lib/db";

export type Role = "ADMIN" | "TECHNICIAN" | "USER";

/**
 * Trả về session nếu đã đăng nhập (và có role nằm trong allowed nếu truyền vào),
 * ngược lại trả về null. Dùng ở API route để chặn truy cập trái phép.
 */
export async function requireApiSession(...allowed: Role[]): Promise<Session | null> {
  if (allowed.length === 0) {
    const session = await getServerSession(authOptions);
    return session ?? null;
  }
  // Có yêu cầu vai trò → kiểm tra role tươi từ DB (không tin JWT cũ).
  return requireFreshRole(...allowed);
}

export function hasRole(userRole: string | undefined | null, ...allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as Role);
}

export function isAdmin(userRole: string | undefined | null): boolean {
  return userRole === "ADMIN";
}

export function isTechnicianOrAdmin(userRole: string | undefined | null): boolean {
  return userRole === "ADMIN" || userRole === "TECHNICIAN";
}

/**
 * Trả về user còn hoạt động (deletedAt = null) NẾU role hiện tại trong DB nằm
 * trong allowed. Khác requireApiSession ở chỗ KHÔNG tin role trong JWT — role
 * trong token có thể đã cũ tới 30 ngày (ví dụ admin vừa bị hạ quyền vẫn giữ
 * quyền admin tới khi token hết hạn). Dùng cho mọi thao tác nhạy cảm.
 */
export async function requireFreshRole(...allowed: Role[]): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, deletedAt: true },
  });
  if (!user || user.deletedAt) return null;
  if (allowed.length > 0 && !hasRole(user.role, ...allowed)) return null;

  // Trả session với role đã được refresh từ DB cho caller dùng tiếp.
  return { ...session, user: { ...session.user, role: user.role } };
}

/** Tiện ích: yêu cầu quyền ADMIN với role tươi từ DB. */
export async function requireFreshAdmin(): Promise<Session | null> {
  return requireFreshRole("ADMIN");
}
