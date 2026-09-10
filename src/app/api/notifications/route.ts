import { NextRequest, NextResponse } from "next/server";
import { getAllNotifications } from "@/app/actions/notification-actions";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") as "ALL" | "UNREAD" | string || "ALL";
  const take = parseInt(url.searchParams.get("take") ?? "50", 10);

  const data = await getAllNotifications(filter, take);
  return NextResponse.json(data);
}
