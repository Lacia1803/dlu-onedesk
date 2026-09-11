import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/cache";
import { requireFreshAdmin } from "@/lib/permissions";

export async function POST(req: Request) {
  try {
    if (process.env.DISABLE_REGISTRATION === "true") {
      return NextResponse.json(
        { success: false, error: "Đăng ký tài khoản công khai đã bị vô hiệu hóa." },
        { status: 403 }
      );
    }

    const session = await requireFreshAdmin();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Chỉ quản trị viên mới có quyền tạo người dùng mới." },
        { status: 403 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed } = await rateLimit(`register:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Quá nhiều yêu cầu. Thử lại sau." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (body === null) {
      return NextResponse.json({ success: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.", fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    if (!email.endsWith("@dlu.edu.vn")) {
      return NextResponse.json(
        { success: false, error: "Chỉ email @dlu.edu.vn mới được đăng ký." },
        { status: 403 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email đã tồn tại trong hệ thống" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống hoặc dữ liệu không hợp lệ" },
      { status: 500 }
    );
  }
}
