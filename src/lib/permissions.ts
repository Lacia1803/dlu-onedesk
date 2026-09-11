import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

export type Role = "ADMIN" | "TECHNICIAN" | "USER";

/**
 * Trả về session nếu đã đăng nhập (và có role nằm trong allowed nếu truyền vào),
 * ngược lại trả về null. Dùng ở API route để chặn truy cập trái phép.
 */
export async function requireApiSession(...allowed: Role[]): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  if (allowed.length > 0 && !hasRole(session.user.role, ...allowed)) return null;
  return session;
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
