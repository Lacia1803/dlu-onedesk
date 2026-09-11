import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/cache";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed } = rateLimit(`register:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Quá nhiều yêu cầu. Thử lại sau." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

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

    const hashedPassword = await bcrypt.hash(password, 10);
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
  } catch {
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống hoặc dữ liệu không hợp lệ" },
      { status: 500 }
    );
  }
}
