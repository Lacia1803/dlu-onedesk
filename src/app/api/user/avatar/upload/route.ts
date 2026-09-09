import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Vui lòng đăng nhập." }, { status: 401 });

  const { allowed } = rateLimit(`avatar:${session.user.id}`, 5, 60_000);
  if (!allowed) return NextResponse.json({ success: false, error: "Upload quá nhanh, thử lại sau." }, { status: 429 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ success: false, error: "Không có file gửi lên." }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, error: "Định dạng ảnh không hợp lệ (JPEG, PNG, WEBP)." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ success: false, error: "Kích thước ảnh vượt quá 5MB." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "avatars");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  const url = `/avatars/${filename}`;

  return NextResponse.json({ success: true, url });
}
