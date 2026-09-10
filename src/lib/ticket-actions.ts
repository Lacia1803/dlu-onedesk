import { MaintenanceCycle, TicketStatus, TicketPriority } from "@prisma/client";

// SLA thresholds theo priority (giờ làm việc) — quy ước nghiệp vụ đồ án
export const SLA_HOURS: Record<TicketPriority, number> = {
  URGENT: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

// SLA thời gian phản hồi lần đầu theo priority (giờ làm việc)
export const RESPONSE_SLA_HOURS: Record<TicketPriority, number> = {
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 8,
  LOW: 24,
};

/**
 * Giờ làm việc Trung tâm CNTT ĐH Đà Lạt:
 * Sáng: 07:30 -> 11:30 (4h / 240m)
 * Chiều: 13:00 -> 17:00 (4h / 240m)
 * Làm từ Thứ 2 đến Thứ 6 (1 -> 5). Thứ 7 (6) và CN (0) nghỉ.
 */
function addWorkingHours(startDate: Date, hoursToAdd: number): Date {
  const current = new Date(startDate);
  let minutesRemaining = hoursToAdd * 60;

  while (minutesRemaining > 0) {
    const day = current.getDay(); // 0 = CN, 6 = T7
    const h = current.getHours();
    const m = current.getMinutes();
    const currentMinutesFromMidnight = h * 60 + m;

    // Nếu rơi vào cuối tuần → nhảy tới 07:30 sáng Thứ 2 kế tiếp
    if (day === 0 || day === 6) {
      const daysToAdd = day === 0 ? 1 : 2;
      current.setDate(current.getDate() + daysToAdd);
      current.setHours(7, 30, 0, 0);
      continue;
    }

    // Buổi sáng: 450 (07:30) -> 690 (11:30)
    // Buổi chiều: 780 (13:00) -> 1020 (17:00)
    const morningStart = 7 * 60 + 30; // 450
    const morningEnd = 11 * 60 + 30;  // 690
    const afternoonStart = 13 * 60;   // 780
    const afternoonEnd = 17 * 60;     // 1020

    if (currentMinutesFromMidnight < morningStart) {
      // Trước 7:30 sáng → nhảy tới 7:30 sáng cùng ngày
      current.setHours(7, 30, 0, 0);
    } else if (currentMinutesFromMidnight >= morningStart && currentMinutesFromMidnight < morningEnd) {
      // Đang trong ca sáng
      const availableInMorning = morningEnd - currentMinutesFromMidnight;
      if (minutesRemaining <= availableInMorning) {
        current.setMinutes(current.getMinutes() + minutesRemaining);
        minutesRemaining = 0;
      } else {
        minutesRemaining -= availableInMorning;
        current.setHours(13, 0, 0, 0); // Nhảy sang đầu ca chiều
      }
    } else if (currentMinutesFromMidnight >= morningEnd && currentMinutesFromMidnight < afternoonStart) {
      // Giờ nghỉ trưa (11:30 -> 13:00) → nhảy tới 13:00 cùng ngày
      current.setHours(13, 0, 0, 0);
    } else if (currentMinutesFromMidnight >= afternoonStart && currentMinutesFromMidnight < afternoonEnd) {
      // Đang trong ca chiều
      const availableInAfternoon = afternoonEnd - currentMinutesFromMidnight;
      if (minutesRemaining <= availableInAfternoon) {
        current.setMinutes(current.getMinutes() + minutesRemaining);
        minutesRemaining = 0;
      } else {
        minutesRemaining -= availableInAfternoon;
        // Hết ca chiều → nhảy tới 7:30 sáng ngày làm việc tiếp theo
        current.setDate(current.getDate() + (day === 5 ? 3 : 1)); // Nếu Thứ 6 thì nhảy sang Thứ 2
        current.setHours(7, 30, 0, 0);
      }
    } else {
      // Sau 17:00 chiều → nhảy tới 7:30 sáng ngày làm việc tiếp theo
      current.setDate(current.getDate() + (day === 5 ? 3 : 1));
      current.setHours(7, 30, 0, 0);
    }
  }

  return current;
}

/** Tính SLA deadline giải quyết dựa trên priority và Giờ hành chính ĐH Đà Lạt */
export function computeSlaDeadline(priority: TicketPriority, from: Date = new Date()): Date {
  return addWorkingHours(from, SLA_HOURS[priority]);
}

/** Tính hạn phản hồi lần đầu dựa trên priority và Giờ hành chính ĐH Đà Lạt */
export function computeResponseDeadline(priority: TicketPriority, from: Date = new Date()): Date {
  return addWorkingHours(from, RESPONSE_SLA_HOURS[priority]);
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
