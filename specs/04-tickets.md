# Feature Spec: Hệ thống Ticket Sự cố

## Goal
Quản lý vòng đời ticket: tạo, phân công, cập nhật trạng thái, comment, đóng ticket.

## Scope
### In Scope
- Tạo ticket (thủ công hoặc qua scan QR thiết bị)
- Danh sách ticket (lọc theo trạng thái, người tạo, người được giao, phòng)
- Xem chi tiết ticket + comment thread
- Đổi trạng thái, mức độ ưu tiên
- Phân công (assign) cho Technician
- Thông báo in-app (hiển thị indicator)

### Out of Scope
- Gửi email/SMS notification
- Auto-assignment (round-robin)
- SLA tracking phức tạp (chỉ có thời gian resolvedAt)

## Dependencies
- Auth (ai tạo ticket, ai comment)
- Device (ticket liên quan thiết bị nào)
- Prisma models: Ticket, TicketComment (đã có)

## Technical Design

### Routes
```
/tickets                 — Danh sách ticket (với filter)
/tickets/new             — Form tạo ticket (hỗ trợ pre-fill deviceId)
/tickets/[id]            — Chi tiết ticket (info, trạng thái, comments)
```

### API Endpoints
```
GET    /api/tickets              — Danh sách (search, filter, pagination)
POST   /api/tickets              — Tạo mới
GET    /api/tickets/[id]         — Chi tiết + comments
PATCH  /api/tickets/[id]         — Cập nhật (status, priority, assignee)
POST   /api/tickets/[id]/comments— Thêm comment
```

### Ticket Flow
1. **OPEN:** Mới tạo. Trống assignee.
2. **Assign:** Admin/Kỹ thuật viên gán assignee → (tùy chọn) cập nhật status thành IN_PROGRESS.
3. **IN_PROGRESS:** Đang xử lý. Có thể đổi qua WAITING_PARTS nếu thiếu linh kiện.
4. **RESOLVED:** Xử lý xong, ghi nhận `resolvedAt`.
5. **CLOSED:** Đóng ticket (hoàn tất), ghi nhận `closedAt`.

### Permissions
- USER: 
  - Tạo ticket mới
  - Xem danh sách ticket DO MÌNH TẠO
  - Cập nhật trạng thái ticket CỦA MÌNH thành CLOSED
  - Comment trên ticket của mình
- TECHNICIAN:
  - Xem TẤT CẢ ticket
  - Nhận ticket (assign to self)
  - Đổi trạng thái, priority
  - Comment trên tất cả ticket
- ADMIN:
  - Toàn quyền
  - Có thể assign ticket cho người khác

### Validation (Zod)
- title: required, min 5, max 150
- description: required, min 10
- category: enum TicketCategory
- priority: enum TicketPriority
- deviceId: optional, must exist if provided
- status: enum TicketStatus
- assigneeId: optional, must be TECHNICIAN or ADMIN if provided
- comment content: required, min 1

## Invariants
- User thường không được xem ticket của người khác
- Chỉ TECHNICIAN/ADMIN mới được phân công xử lý (không assign cho USER)
- Khi status chuyển sang RESOLVED, set `resolvedAt = now()`
- Khi status chuyển sang CLOSED, set `closedAt = now()`

## Verification Checklist
- [ ] User tạo ticket thành công (có và không có deviceId)
- [ ] User chỉ xem được ticket của mình
- [ ] Technician xem được tất cả ticket
- [ ] Admin assign ticket cho technician thành công
- [ ] Thay đổi trạng thái ticket → auto cập nhật resolvedAt/closedAt đúng
- [ ] Thêm comment thành công, hiển thị người tạo + thời gian
- [ ] Scan QR từ device page → nút báo lỗi → sang form ticket pre-fill thiết bị
- [ ] Filter danh sách ticket theo status/priority/assignee hoạt động tốt
