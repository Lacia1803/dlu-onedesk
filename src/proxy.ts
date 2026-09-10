import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Proxy (Next.js 16 — thay thế middleware.ts đã deprecated).
 * Chạy trên Node.js runtime, bảo vệ RBAC ngay trước khi request tới trang:
 * - Chưa đăng nhập → /login?callbackUrl=...
 * - USER thường chặn các trang quản trị (/admin) và trang tạo/sửa phòng máy, thiết bị.
 */

// Các trang chỉ dành cho ADMIN
const ADMIN_ONLY = [/^\/admin(\/.*)?$/];

// Các trang tạo/sửa resource kỹ thuật — TECHNICIAN + ADMIN
const STAFF_WRITE = [
  /^\/dashboard\/rooms\/(new|[^/]+\/edit)$/,
  /^\/dashboard\/devices\/new$/,
  /^\/dashboard\/devices\/[^/]+\/edit$/,
  /^\/dashboard\/software(\/.*)?$/,
];

function matches(patterns: RegExp[], pathname: string) {
  return patterns.some((re) => re.test(pathname));
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  // 1. Chưa đăng nhập → về login kèm callbackUrl
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // 2. RBAC tầng Edge: chặn theo vai trò
  if (role === "ADMIN" && matches(ADMIN_ONLY, pathname)) {
    return NextResponse.next();
  }
  if (matches(ADMIN_ONLY, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (matches(STAFF_WRITE, pathname) && role !== "ADMIN" && role !== "TECHNICIAN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/settings/:path*"],
};
