import { NextRequest, NextResponse } from "next/server";
import { getAllNotifications, getNotificationStats } from "@/app/actions/notification-actions";
import { NOTIFICATION_PAGE_SIZE } from "@/lib/notification-utils";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filter = (url.searchParams.get("filter") as "ALL" | "UNREAD" | string) || "ALL";
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const includeStats = url.searchParams.get("stats") === "true";

  const [data, stats] = await Promise.all([
    getAllNotifications(filter, page, NOTIFICATION_PAGE_SIZE),
    includeStats ? getNotificationStats() : Promise.resolve(null),
  ]);

  return NextResponse.json({ ...data, stats });
}
