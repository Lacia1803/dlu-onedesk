# Spec 12 — Ticket Lifecycle + SLA

## Goal
Chuẩn hóa vòng đời ticket, SLA theo priority, lịch sử chuyển trạng thái có người thực hiện + thời gian.

## Scope
- Thêm `TicketTransition` model (from, to, reason, user, createdAt)
- Thêm `slaDeadline` vào Ticket, tự động tính khi tạo + khi đổi priority
- Enum quy tắc chuyển trạng thái `VALID_TRANSITIONS` trong `src/lib/ticket-actions.ts`
- Enforce server-side trong `updateTicket`, `reopenTicket`, `bulkUpdateTickets`
- UI: SLA badge ở detail page, lịch sử chuyển trạng thái

## Dependencies
- `TicketTransition` cần migrate DB (`npx prisma db push`)
- `TicketDetailPage` thêm include `transitions`

## Invariants
- Ticket CLOSED không thể chuyển trạng thái khác (phải dùng reopen)
- Reopen chỉ trong 7 ngày (trừ ADMIN)
- Tech chỉ chuyển theo đồ thị, ADMIN được tự do (trừ CLOSED)
- Bulk update vẫn ghi transition cho từng ticket
- Đổi priority → tính lại SLA deadline từ `createdAt` gốc

## SLA (giờ)
- URGENT: 4h
- HIGH: 8h
- MEDIUM: 24h
- LOW: 72h

## Verification Checklist
- [x] `npx tsc --noEmit` pass
- [x] `npm run build` pass
- [ ] Test manual: tạo ticket URGENT → check slaDeadline = createdAt + 4h
- [ ] Test manual: chuyển OPEN → RESOLVED trực tiếp (tech) → bị từ chối
- [ ] Test manual: reopen ticket quá 7 ngày → bị từ chối (trừ admin)
