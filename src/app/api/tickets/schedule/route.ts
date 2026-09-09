import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scheduleTicket } from "@/app/actions/ticket-actions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, scheduledAt } = await req.json();
    if (!id || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const res = await scheduleTicket(id, new Date(scheduledAt));
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Schedule ticket API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
