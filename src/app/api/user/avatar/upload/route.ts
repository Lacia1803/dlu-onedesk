import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/cache";
import { saveUpload } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Vui lòng đăng nhập." }, { status: 401 });

  const { allowed } = rateLimit(`avatar:${session.user.id}`, 5, 60_000);
  if (!allowed) return NextResponse.json({ success: false, error: "Upload quá nhanh, thử lại sau." }, { status: 429 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ success: false, error: "Không có file gửi lên." }, { status: 400 });

  try {
    const url = await saveUpload(file, "avatars");
    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Lỗi lưu ảnh đại diện." }, { status: 400 });
  }
}
