import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/cache";
import { saveUpload } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập." }, { status: 401 });
    }

    const { allowed } = await rateLimit(`upload:${session.user.id}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Tải lên quá nhanh. Thử lại sau." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "Không có file nào được gửi." },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { success: false, error: "Tối đa chỉ được tải lên 5 ảnh." },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      try {
        const url = await saveUpload(file, "tickets");
        urls.push(url);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi lưu file.";
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi tải ảnh lên." },
      { status: 500 }
    );
  }
}
