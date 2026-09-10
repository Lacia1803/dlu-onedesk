import { NextRequest, NextResponse } from "next/server";
import { getAllNotifications, NOTIFICATION_PAGE_SIZE } from "@/app/actions/notification-actions";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filter = (url.searchParams.get("filter") as "ALL" | "UNREAD" | string) || "ALL";
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);

  const data = await getAllNotifications(filter, page, NOTIFICATION_PAGE_SIZE);
  return NextResponse.json(data);
}
