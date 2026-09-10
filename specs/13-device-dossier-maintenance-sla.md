# Spec 13 — Hồ sơ thiết bị, Bảo trì định kỳ, SLA nâng cao

## Goal
1. **Hồ sơ thiết bị tổng hợp**: timeline sự cố + sửa chữa + thay linh kiện + điều chuyển; bảo trì gần nhất / tiếp theo.
2. **Bảo trì định kỳ tự sinh công việc**: kế hoạch theo phòng, chu kỳ tháng/quý/học kỳ, chống sinh trùng, checklist trong mô tả ticket.
3. **SLA nâng cao**: tách SLA phản hồi & giải quyết, tạm dừng khi chờ linh kiện, cảnh báo leo thang (nhắc tech sắp hết hạn → báo admin khi quá hạn).

## Scope
- Model mới: `DeviceHistory` (điều chuyển/thay đổi trạng thái), `MaintenancePlan` (kế hoạch bảo trì định kỳ)
- Ticket: + `firstResponseAt`, `slaPausedAt`, `maintenancePlanId`, `planPeriod` (dedup)
- Device: + `nextMaintenanceAt`
- MaintenanceLog: + `parts` (linh kiện đã thay, text tự do)
- `updateDevice`: tự ghi DeviceHistory khi đổi phòng (RELOCATION) / đổi trạng thái (STATUS_CHANGE)
- `addMaintenanceLog`: tự đẩy `nextMaintenanceAt = performedAt + 90 ngày`
- Cron mới `/api/cron/daily`: (a) sinh ticket bảo trì từ plan đến hạn (theo `period`), (b) nhắc tech khi còn <25% thời gian SLA, (c) thông báo admin khi quá hạn
- Comment đầu tiên của Tech/Admin trên ticket → set `firstResponseAt`
- Chuyển vào WAITING_PARTS → pause SLA; chuyển ra → cộng dồn thời gian tạm dừng vào deadline

## Giá trị SLA (DEFAULT — cần thống nhất với phụ trách kỹ thuật trước khi dùng thật)
| Priority | Phản hồi | Giải quyết |
|---|---|---|
| URGENT | 1h | 4h |
| HIGH | 2h | 8h |
| MEDIUM | 8h | 24h |
| LOW | 24h | 72h |

## Quy tắc
- SLA pause: chỉ WAITING_PARTS được tạm dừng; thời gian dừng = now - slaPausedAt, cộng vào slaDeadline khi resume.
- Dedup bảo trì: không sinh ticket plan X cho kỳ P nếu đã tồn tại ticket có cùng `maintenancePlanId` + `planPeriod`.
- Chu kỳ: MONTHLY=YYYY-MM, QUARTERLY=YYYY-Qn, SEMESTER=YYYY-Hn (lịch dương 6 tháng).
- User đã xóa (deletedAt) phải được admin gán lại ticket — không tự chuyển.

## Verification Checklist
- [ ] Unit test: extendSlaDeadline (pause/resume math), periodForCycle
- [ ] Tạo plan → chạy cron 2 lần → chỉ 1 bộ ticket được sinh
- [ ] Ticket URGENT comment từ tech → firstResponseAt được set
- [ ] OPEN→IN_PROGRESS→WAITING_PARTS→IN_PROGRESS → deadline lùi đúng thời gian chờ
- [ ] tsc + build pass
