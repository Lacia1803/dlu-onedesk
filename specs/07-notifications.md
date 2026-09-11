# Feature Spec: Live Notifications

## Goal

Hệ thống thông báo Real-time cho Admin, Technician và User khi có sự kiện quan trọng xảy ra trên Ticket.

## Scope

### In Scope

- Đổ chuông/Toast notification ngay lập tức không cần F5.
- Lưu Notification vào Database để hiển thị trong "Quả chuông thông báo" (danh sách chưa đọc/đã đọc).
- Click vào thông báo chuyển hướng (link) tới chi tiết Ticket tương ứng.
- **Trigger Events:**
  - User tạo Ticket -> Báo cho toàn bộ Admin/Technician.
  - Admin phân công Ticket -> Báo cho Technician được assign.
  - Cập nhật trạng thái Ticket / Có comment mới -> Báo cho User tạo ticket và Assignee.

## Dependencies

- Prisma `Notification` model (đã thêm).
- Kỹ thuật: API Polling (gọi định kỳ mỗi 15-30s) **hoặc** Server-Sent Events (SSE) để tiết kiệm tài nguyên so với WebSocket nhưng vẫn Real-time.
