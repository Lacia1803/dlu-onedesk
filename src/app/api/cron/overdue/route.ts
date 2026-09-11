import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

  // Nhắc quá hạn theo ĐÚNG deadline SLA (không dùng mốc 3 ngày cố định),
  // chỉ áp cho ticket đang xử lý và không bị tạm dừng SLA.
  const now = new Date();
  const overdueTickets = await db.ticket.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] },
      slaDeadline: { lt: now },
      slaPausedAt: null,
      maintenancePlanId: null,
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      slaDeadline: true,
      assignee: { select: { email: true, name: true } },
    },
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
        text: `Ticket #${t.id.slice(-6).toUpperCase()} đã QUÁ HẠN SLA.\nHạn SLA: ${t.slaDeadline?.toLocaleString("vi-VN") ?? "N/A"}\nNgày tạo: ${t.createdAt.toLocaleString("vi-VN")}\nVui lòng truy cập hệ thống để cập nhật tiến độ.`,
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
