import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/permissions";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  // Cache rooms list 5 min
  const rooms = await cached("rooms", 5 * 60 * 1000, async () => {
    return await db.room.findMany({ orderBy: { name: "asc" } });
  });
  return NextResponse.json(rooms);
}
