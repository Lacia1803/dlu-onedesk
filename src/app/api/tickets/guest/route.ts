import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guestTicketSchema } from "@/lib/validations/guest-ticket";
import { computeSlaDeadline } from "@/lib/ticket-actions";
import { rateLimit } from "@/lib/cache";
import { notifyAdminsAndTechs } from "@/lib/notifications";

/**
 * POST /api/tickets/guest
 * Create a ticket without authentication — uses studentId instead of userId.
 * Rate-limited by IP address.
 */
export async function POST(req: NextRequest) {
  // Rate limit by IP (10 requests per minute)
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimit(`guest-ticket:${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const parsed = guestTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const { studentId, title, description } = parsed.data;
  const deviceId = (body as any).deviceId;

  // Validate device exists
  if (!deviceId) {
    return NextResponse.json({ success: false, error: "Thiếu thông tin thiết bị." }, { status: 400 });
  }

  const device = await db.device.findUnique({ where: { id: deviceId }, select: { id: true, deletedAt: true } });
  if (!device || device.deletedAt) {
    return NextResponse.json({ success: false, error: "Thiết bị không tồn tại." }, { status: 404 });
  }

  // Create a system "guest" user reference — we store studentId in the ticket notes
  // since Ticket requires a creatorId, we use/find a special "Guest" user
  let guestUser = await db.user.findFirst({
    where: { email: "guest@system.local" },
  });

  if (!guestUser) {
    guestUser = await db.user.create({
      data: {
        name: "Khách vãng lai",
        email: "guest@system.local",
        password: "", // never used
        role: "USER",
      },
    });
  }

  const slaDeadline = computeSlaDeadline("MEDIUM");

  const ticket = await db.ticket.create({
    data: {
      title,
      description: `${description}\n\n[Mã sinh viên/Người báo]: ${studentId}`,
      category: "OTHER",
      priority: "MEDIUM",
      status: "OPEN",
      creatorId: guestUser.id,
      deviceId,
      images: [],
      slaDeadline,
    },
  });

  // Notify admins and techs
  await notifyAdminsAndTechs(
    "Báo cáo từ khách vãng lai",
    `Ticket #${ticket.id.slice(-6).toUpperCase()}: ${title} (Người báo: ${studentId})`,
    `/dashboard/tickets/${ticket.id}`,
    "TICKET_STATUS"
  );

  return NextResponse.json({ success: true, ticketId: ticket.id });
}
