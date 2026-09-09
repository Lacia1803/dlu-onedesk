# Auth Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hệ thống xác thực (đăng ký, đăng nhập) và phân quyền (Admin, Technician, User) cho DLU OneDesk.

**Architecture:** Sử dụng NextAuth.js với Credentials Provider. Passwords được băm bằng `bcryptjs`. Middleware của Next.js sẽ bảo vệ các routes yêu cầu đăng nhập. Các API routes sẽ kiểm tra quyền bằng session của NextAuth. Giao diện dùng Tailwind và `shadcn/ui`.

**Tech Stack:** Next.js (App Router), NextAuth.js (v4), Prisma, bcryptjs, Zod, React Hook Form, shadcn/ui.

**Spec:** `specs/01-auth.md`

## Global Constraints
- Next.js App Router conventions.
- Zod cho mọi form validation và API payload validation.
- Không lưu plain text password (bcrypt hash 10 rounds).
- Shadcn UI components cho mọi UI.
- Tuân thủ `context/code-standards.md`.

---

### Task 1: Thiết lập NextAuth config & API Route

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `src/types/next-auth.d.ts` (Type augmentation cho NextAuth)

**Interfaces:**
- Produces: `authOptions` object (để sử dụng trong getServerSession)
- Produces: Mở rộng `Session` và `User` interface của NextAuth để chứa trường `role` và `id`.

- [ ] **Step 1: Mở rộng Types cho NextAuth**
Tạo file `src/types/next-auth.d.ts` để type-safe field `role` và `id` trong session.

```typescript
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
}
```

- [ ] **Step 2: Viết cấu hình NextAuth**
Tạo file `src/lib/auth.ts` chứa `authOptions`.

```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user || user.deletedAt) return null; // Không cho user bị soft delete login
        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
```

- [ ] **Step 3: Tạo API Route xử lý NextAuth**
Tạo file `src/app/api/auth/[...nextauth]/route.ts`.

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 4: Commit**
```bash
git add src/types/next-auth.d.ts src/lib/auth.ts src/app/api/auth/[...nextauth]/route.ts
git commit -m "feat(auth): add NextAuth configuration and API route"
```

---

### Task 2: API Đăng ký & Form Đăng ký

**Files:**
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/(auth)/register/page.tsx`
- Modify: `src/lib/validations/auth.ts` (Zod schemas)

**Interfaces:**
- Produces: API `POST /api/auth/register` (Nhận name, email, password; trả về JSON user).
- Produces: UI `/register`.

- [ ] **Step 1: Tạo Zod schema**
Tạo file `src/lib/validations/auth.ts`.

```typescript
import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
```

- [ ] **Step 2: Viết API Route Đăng ký**
Tạo file `src/app/api/auth/register/route.ts`.

```typescript
import { NextResponse } from "next-server"; // Hoặc next/server
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email đã tồn tại" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { name, email, password: hashedPassword, role: "USER" },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Lỗi hệ thống" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Viết UI Đăng ký**
Tạo file `src/app/(auth)/register/page.tsx`. Sử dụng `react-hook-form` và `@hookform/resolvers/zod`. Gọi API `/api/auth/register`, nếu thành công `signIn("credentials", { email, password, callbackUrl: "/dashboard" })`.

```tsx
"use client";
// Skeleton implementation: Import useForm, zodResolver, registerSchema, Button, Input, Form...
// Handle submit: fetch POST /api/auth/register -> if success, call signIn from next-auth/react
// Render form with name, email, password fields.
```

- [ ] **Step 4: Commit**
```bash
git add src/lib/validations/auth.ts src/app/api/auth/register/route.ts src/app/\(auth\)/register/page.tsx
git commit -m "feat(auth): implement register API and page"
```

---

### Task 3: Trang Đăng nhập & AuthProvider

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/components/providers/session-provider.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: Trang `/login`.

- [ ] **Step 1: Tạo Session Provider wrapper**
Tạo file `src/components/providers/session-provider.tsx`.

```tsx
"use client";
import { SessionProvider as Provider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
```

- [ ] **Step 2: Bọc layout.tsx với SessionProvider**
Cập nhật `src/app/layout.tsx`.

```tsx
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
// Bọc body content vào <SessionProvider> và thêm <Toaster />
```

- [ ] **Step 3: Viết UI Đăng nhập**
Tạo file `src/app/(auth)/login/page.tsx`.

```tsx
"use client";
import { signIn } from "next-auth/react";
// Skeleton: useForm(loginSchema), call signIn("credentials", { redirect: false, email, password })
// Nếu res?.error, show toast error. Nếu !res.error, router.push("/dashboard").
```

- [ ] **Step 4: Commit**
```bash
git add src/app/(auth)/login/page.tsx src/components/providers/session-provider.tsx src/app/layout.tsx
git commit -m "feat(auth): implement login page and session provider"
```

---

### Task 4: Middleware Bảo Vệ Route

**Files:**
- Create: `src/middleware.ts`

**Interfaces:**
- Khóa toàn bộ các routes `/dashboard`, `/admin`, `/settings` yêu cầu đăng nhập.

- [ ] **Step 1: Viết Middleware**
Tạo file `src/middleware.ts`.

```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role check for admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true, // Middleware always runs, logic inside function handles redirects
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/settings/:path*", "/login", "/register"],
};
```

- [ ] **Step 2: Commit**
```bash
git add src/middleware.ts
git commit -m "feat(auth): add middleware to protect routes"
```

---

### Task 5: Setup Layout Dashboard & Đăng xuất

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`

**Interfaces:**
- Produces: Layout chính của hệ thống sau khi login, có Sidebar và Header chứa nút Đăng xuất.

- [ ] **Step 1: Header component với User Dropdown**
Tạo file `src/components/layout/header.tsx`. Cần lấy data user từ `useSession()` để hiển thị tên, và nút Logout (gọi hàm `signOut()`).

- [ ] **Step 2: Sidebar Component**
Tạo file `src/components/layout/sidebar.tsx`. Hiển thị link theo Role (ví dụ link "Quản lý Users" chỉ hiện nếu session.user.role === "ADMIN").

- [ ] **Step 3: Dashboard Layout**
Tạo file `src/app/(dashboard)/layout.tsx`.

```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Placeholder Dashboard Page**
Tạo file `src/app/(dashboard)/dashboard/page.tsx`.

```tsx
export default function DashboardPage() {
  return <div>Welcome to DLU OneDesk Dashboard</div>;
}
```

- [ ] **Step 5: Commit**
```bash
git add src/components/layout src/app/\(dashboard\)
git commit -m "feat(ui): create dashboard layout and sidebar"
```
