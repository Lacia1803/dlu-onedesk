# Nhật ký Thay đổi (CHANGELOG) - DLU OneDesk

Mọi thay đổi quan trọng của dự án DLU OneDesk được ghi nhận chi tiết tại đây.

---

## [1.2.0] - 2026-09-11

### ✨ Features & Enhancements

- **Mobile Navigation Drawer**: Tích hợp hamburger menu dạng Sheet drawer responsive cho thiết bị di động.
- **Phân trang Server-side**: Áp dụng phân trang 20 mục/trang và đồng bộ state trên URL query parameters cho Tickets và Devices.
- **Realtime SSE Notifications**: Tích hợp Server-Sent Events tại `/api/notifications/sse` thông báo tức thì kèm fallback polling 15s.
- **Khách vãng lai báo sự cố**: Cho phép sinh viên/khách báo hỏng qua QR Code `/devices/qr/[code]` không cần đăng nhập, có rate-limiting theo IP.
- **Trình mã hóa 2FA & DoS Guard**: Mã hóa bí mật 2FA bằng AES-256-GCM và áp dụng max length 72 ký tự cho password schema.
- **Cấu hình CSP & Cookie**: Thiết lập Content Security Policy header và cookie flags (`httpOnly`, `sameSite=lax`, `secure`).
- **Trang 404 & Error Tùy biến**: Giao diện lỗi chuyên nghiệp mang thương hiệu Trường Đại học Đà Lạt (`not-found.tsx`, `error.tsx`).

### 🐛 Bug Fixes

- **Sửa Lịch sử sự cố**: Khôi phục `<TabsContent value="history">` hiển thị danh sách ticket của thiết bị.
- **Sửa Seed Data**: Tạo đủ 3 tài khoản thử nghiệm (`admin`, `tech`, `user`) khớp với `TESTING.md`.
- **Thay `window.confirm()`**: Chuyển sang `AlertDialog` linh hoạt và thẩm mỹ.
- **Bổ sung DB Index**: Đánh chỉ mục `@@index` cho tất cả khóa ngoại FK trong Prisma schema.

---

## [1.1.0] - 2026-09-10

### ✨ Features

- **SLA Giờ hành chính**: Thuật toán SLA nhảy giờ nghỉ trưa, ngoài giờ và cuối tuần (TTTT DLU).
- **Cảnh báo quá hạn & Slack Webhook**: Tích hợp Slack webhook báo SLA quá hạn và lịch bảo trì.
- **KPI Kỹ thuật viên & Export PDF**: Thống kê KPI cá nhân và xuất báo cáo PDF chuẩn A4.

---

## [1.0.0] - 2026-09-01

### 🎉 Initial Release

- Phát hành phiên bản đầu tiên của hệ thống DLU OneDesk với đầy đủ các module: Auth, Quản lý phòng máy, Thiết bị, Phần mềm, Ticket, FAQ và AI Chatbot.
