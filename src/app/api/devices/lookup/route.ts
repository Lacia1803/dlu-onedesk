import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/permissions";

// ponytail: resolve QR code -> device id for scan flow
export async function GET(request: NextRequest) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const code = new URL(request.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Thiếu code" }, { status: 400 });

  const device = await db.device.findUnique({
    where: { qrCode: code },
    select: { id: true, name: true, deletedAt: true },
  });

  if (!device || device.deletedAt) {
    return NextResponse.json({ error: "Không tìm thấy thiết bị" }, { status: 404 });
  }
  return NextResponse.json({ id: device.id, name: device.name });
}
