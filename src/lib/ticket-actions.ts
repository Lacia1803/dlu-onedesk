import { MaintenanceCycle, TicketStatus, TicketPriority } from "@prisma/client";

// SLA thresholds theo priority (giờ) — quy ước nghiệp vụ đồ án
// DEFAULT: cần thống nhất với phụ trách kỹ thuật trước khi dùng thật (xem specs/13)
export const SLA_HOURS: Record<TicketPriority, number> = {
  URGENT: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

// SLA thời gian phản hồi lần đầu theo priority (giờ)
export const RESPONSE_SLA_HOURS: Record<TicketPriority, number> = {
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 8,
  LOW: 24,
};

/** Tính SLA deadline giải quyết dựa trên priority */
export function computeSlaDeadline(priority: TicketPriority, from: Date = new Date()): Date {
  return new Date(from.getTime() + SLA_HOURS[priority] * 60 * 60 * 1000);
}

/** Tính hạn phản hồi lần đầu dựa trên priority */
export function computeResponseDeadline(priority: TicketPriority, from: Date = new Date()): Date {
  return new Date(from.getTime() + RESPONSE_SLA_HOURS[priority] * 60 * 60 * 1000);
}

/** Kiểm tra ticket quá hạn SLA chưa */
export function isOverdue(ticket: { status: TicketStatus; slaDeadline: Date | null }): boolean {
  if (ticket.status === TicketStatus.CLOSED || !ticket.slaDeadline) return false;
  return new Date() > ticket.slaDeadline;
}

/**
 * Cộng dồn thời gian tạm dừng SLA (chờ linh kiện) vào deadline.
 * Gọi khi resume từ WAITING_PARTS: deadline mới = deadline cũ + (now - pausedAt).
 */
export function extendSlaDeadline(deadline: Date, pausedAt: Date, now: Date = new Date()): Date {
  return new Date(deadline.getTime() + Math.max(0, now.getTime() - pausedAt.getTime()));
}

/** Giai đoạn của chu kỳ bảo trì cho 1 mốc thời gian, dùng để chống sinh ticket trùng */
export function periodForCycle(cycle: MaintenanceCycle, at: Date = new Date()): string {
  const y = at.getFullYear();
  const m = at.getMonth(); // 0-11
  if (cycle === MaintenanceCycle.MONTHLY) return `${y}-${String(m + 1).padStart(2, "0")}`;
  if (cycle === MaintenanceCycle.QUARTERLY) return `${y}-Q${Math.floor(m / 3) + 1}`;
  return `${y}-H${m < 6 ? 1 : 2}`; // SEMESTER
}

/** Đồ thị chuyển trạng thái hợp lệ (server-side enforcement) */
export const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.WAITING_PARTS, TicketStatus.RESOLVED],
  [TicketStatus.WAITING_PARTS]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
};

/** Reopen: CLOSED -> OPEN (chỉ creator trong 7 ngày hoặc admin) */
export const REOPEN_TRANSITION: [TicketStatus, TicketStatus] = [TicketStatus.CLOSED, TicketStatus.OPEN];

export function isValidTransition(from: TicketStatus, to: TicketStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
