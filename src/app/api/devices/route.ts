import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/permissions";

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");

  const devices = await db.device.findMany({
    where: all ? {} : { deletedAt: null },
    select: { id: true, name: true, qrCode: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(devices);
}
