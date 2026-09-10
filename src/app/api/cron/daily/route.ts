import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { notifyUsers, notifyAdminsAndTechs } from "@/lib/notifications";
import { sendAlert } from "@/lib/webhook";
import { computeSlaDeadline, computeResponseDeadline, periodForCycle } from "@/lib/ticket-actions";
import { MaintenanceCycle, TicketStatus } from "@prisma/client";

/**
 * Cron hàng ngày (gọi qua VPS crontab với Bearer CRON_SECRET):
 * 1. Sinh ticket bảo trì định kỳ từ MaintenancePlan đến hạn (chống trùng theo planPeriod).
 * 2. Nhắc kỹ thuật viên khi ticket sắp quá hạn SLA (còn <25% thời gian).
 * 3. Thông báo admin khi ticket đã quá hạn SLA.
 */
export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // ---------- 1. Sinh ticket bảo trì định kỳ ----------
  const plans = await db.maintenancePlan.findMany({
    where: { isActive: true },
    include: { room: { include: { devices: { where: { deletedAt: null } } } } },
  });

  let createdMaintenance = 0;
  for (const plan of plans) {
    const period = periodForCycle(plan.cycle as MaintenanceCycle, now);
    // Chống trùng: đã có ticket của plan này trong kỳ hiện tại thì bỏ qua
    const existing = await db.ticket.findFirst({
      where: { maintenancePlanId: plan.id, planPeriod: period },
      select: { id: true },
    });
    if (existing) continue;

    // Admin đầu tiên làm creator của ticket hệ thống
    const admin = await db.user.findFirst({ where: { role: "ADMIN", deletedAt: null } });
    if (!admin || plan.room.devices.length === 0) continue;

    // 1 ticket duy nhất cho cả phòng, gắn thiết bị đầu tiên làm mốc (checklist trong description)
    await db.ticket.create({
      data: {
        title: `Bảo trì định kỳ ${plan.name} — ${plan.room.name}`,
        description: `Kế hoạch bảo trì ${plan.room.name} (${plan.cycle}).\n\nChecklist:\n${plan.checklist}\n\nThiết bị trong phòng: ${plan.room.devices.length}. Vui lòng kiểm tra từng thiết bị và cập nhật MaintenanceLog.`,
        category: "OTHER",
        priority: "MEDIUM",
        status: "OPEN",
        creatorId: admin.id,
        maintenancePlanId: plan.id,
        planPeriod: period,
        slaDeadline: computeSlaDeadline("MEDIUM", now),
      },
    });
    createdMaintenance++;

    await notifyAdminsAndTechs(
      "Bảo trì định kỳ",
      `Đến hạn bảo trì ${plan.room.name} (${period})`,
      "/dashboard/maintenance",
      "MAINTENANCE"
    );
    await sendAlert("[DLU OneDesk] Đến hạn bảo trì định kỳ", `Phòng: ${plan.room.name}\nChu kỳ: ${period}`);
  }

  // ---------- 2 & 3. Cảnh báo SLA leo thang ----------
  const activeTickets = await db.ticket.findMany({
    where: {
      status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] },
      maintenancePlanId: null, // ticket bảo trì không áp cảnh báo SLA leo thang
      slaDeadline: { not: null },
      slaPausedAt: null,
    },
    include: { assignee: { select: { id: true, name: true } } },
  });

  let warned = 0;
  let escalated = 0;
  for (const t of activeTickets) {
    if (!t.slaDeadline) continue;
    const respDeadline = computeResponseDeadline(t.priority, t.createdAt);
    const remaining = t.slaDeadline.getTime() - now.getTime();
    const total = t.slaDeadline.getTime() - t.createdAt.getTime();

    if (now > t.slaDeadline) {
      // Quá hạn → báo admin
      await notifyAdminsAndTechs(
        "SLA quá hạn",
        `Ticket #${t.id.slice(-6).toUpperCase()} "${t.title}" đã quá hạn SLA (${t.priority}).`,
        `/dashboard/tickets/${t.id}`,
        "SLA_WARNING"
      );
      await sendAlert(
        "[DLU OneDesk] SLA quá hạn",
        `Ticket #${t.id.slice(-6).toUpperCase()} (${t.priority}) - Assignee: ${t.assignee?.name || "N/A"}`
      );
      escalated++;
    } else if (remaining < total * 0.25 && t.assignee) {
      // Sắp hết hạn (<25% thời gian còn lại) → nhắc tech được gán
      await notifyUsers(
        [t.assignee.id],
        "Sắp quá hạn SLA",
        `Ticket #${t.id.slice(-6).toUpperCase()} sắp quá hạn SLA (${t.priority}). Vui lòng ưu tiên xử lý.`,
        `/dashboard/tickets/${t.id}`,
        "SLA_WARNING"
      );
      warned++;
    }
    // ponytail: respDeadline chưa dùng để cảnh báo riêng — tách thêm khi có yêu cầu phân biệt 2 loại SLA
    void respDeadline;
  }

  await logAudit({
    action: "CRON_DAILY",
    entity: "System",
    details: { createdMaintenance, warned, escalated },
  });

  return NextResponse.json({ success: true, createdMaintenance, warned, escalated });
}
