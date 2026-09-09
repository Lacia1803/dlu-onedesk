import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập." }, { status: 401 });
    }

    const { allowed } = rateLimit(`upload:${session.user.id}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Tải lên quá nhanh. Thử lại sau." }, { status: 429 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "Không có file nào được gửi." }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ success: false, error: "Tối đa chỉ được tải lên 5 ảnh." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} không đúng định dạng hình ảnh (JPEG, PNG, WEBP).` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} vượt quá dung lượng tối đa 5MB.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Lỗi hệ thống khi tải ảnh lên." }, { status: 500 });
  }
}
