import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { db } from "@/lib/db";

export async function GET() {
  // Cache rooms list 5 min
  const rooms = await cached("rooms", 5 * 60 * 1000, async () => {
    return await db.room.findMany({ orderBy: { name: "asc" } });
  });
  return NextResponse.json(rooms);
}
