import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TicketStatus } from "@prisma/client";
import nodemailer from "nodemailer";
import { logAudit } from "@/lib/audit";

// Fail-Closed: chỉ chấp nhận khi CRON_SECRET được cấu hình và Bearer khớp.
// ponytail: Basic bearer token check for cron. Upgrade to HMAC signature or provider-specific headers if on AWS/GCP.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({ success: false, message: "SMTP not configured" }, { status: 200 });
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const overdueTickets = await db.ticket.findMany({
    where: { status: { not: TicketStatus.CLOSED }, createdAt: { lt: threeDaysAgo } },
    select: { id: true, title: true, createdAt: true, assignee: { select: { email: true, name: true } } },
  });

  if (overdueTickets.length === 0) {
    return NextResponse.json({ success: true, count: 0, message: "No overdue tickets" });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || "no-reply@dlu.edu.vn";
  const results = await Promise.allSettled(
    overdueTickets.map(async (t) => {
      if (!t.assignee?.email) return null;
      return transporter.sendMail({
        from,
        to: t.assignee.email,
        subject: `[DLU OneDesk] Nhắc nhở ticket quá hạn: ${t.title}`,
        text: `Ticket #${t.id.slice(-6).toUpperCase()} đã mở hơn 3 ngày chưa đóng.\nNgày tạo: ${t.createdAt.toLocaleString("vi-VN")}\nVui lòng truy cập hệ thống để cập nhật tiến độ.`,
      });
    })
  );

  const sentCount = results.filter((r) => r.status === "fulfilled" && r.value !== null).length;

  await logAudit({
    action: "CRON_OVERDUE_REMINDER",
    entity: "Ticket",
    details: { sent: sentCount, total: overdueTickets.length },
  });

  return NextResponse.json({ success: true, sent: sentCount, total: overdueTickets.length });
}
