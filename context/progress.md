# Progress Tracker - DLU OneDesk

## Trạng thái hiện tại
**Phase:** Đang phát triển feature
**Ngày cập nhật:** 2026-09-09

## Completed
- [x] Đọc đề cương, phân tích yêu cầu
- [x] Chọn tech stack: Next.js + Prisma + PostgreSQL + shadcn/ui
- [x] Tạo context files (project-overview, code-standards, progress)
- [x] Setup project Next.js (TypeScript, Tailwind, App Router)
- [x] Cài dependencies (Prisma 6, NextAuth, Zod, React Hook Form, QR, Recharts)
- [x] Setup shadcn/ui + components
- [x] Thiết kế database schema (8 models)
- [x] Tạo Prisma client utility (src/lib/db.ts)
- [x] Feature: Auth (login/register/phân quyền)
- [x] Feature: Quản lý phòng máy (CRUD)
- [x] Feature: Quản lý thiết bị (CRUD + QR code)
- [x] Feature: Quản lý phần mềm (CRUD + gán/gỡ trên thiết bị)
- [x] Feature: Hệ thống ticket
- [x] Feature: Cẩm nang hỗ trợ (FAQ)
- [x] Feature: Dashboard thống kê
- [x] Feature: Live Notifications
- [x] Feature: Lịch bảo trì (Calendar View)

## In Progress
- (none)

## Pending
- [ ] Kiểm thử & sửa lỗi
- [ ] Viết tài liệu hướng dẫn sử dụng
- [ ] Deploy

## Recently Completed
- [x] Feature: AI Chatbot (Gemini) — widget chat góc phải, dùng FAQ context, gợi ý tạo ticket
- [x] Feature: Export Excel — nút "Xuất Excel" trên dashboard, export thiết bị + tickets ra .xlsx
- [x] Feature: Khôi phục người dùng đã vô hiệu hóa (soft-delete restore) — action `restoreUser` + nút "Khôi phục" trong trang Quản lý Người dùng
- [x] Feature: Bảo mật 2 lớp (2-FA) — cài `@otplib/preset-default` + `qrcode`, action `enableTwoFactor`/`verifyTwoFactor`/`disableTwoFactor`, UI QR/OTP trong Settings và xác thực trong `authorize` NextAuth.
- [x] Feature: Nhật ký hệ thống (Audit Logs) — model `AuditLog`, helper `logAudit()`, ghi log cho các hành động user (đổi vai trò, vô hiệu hóa/khôi phục, 2FA) và ticket (tạo, cập nhật, bulk), trang `/admin/audit-logs` chỉ ADMIN xem được.
- [x] Feature: Bulk Actions cho Tickets — `BulkTicketTable` với checkbox chọn nhiều, chọn tất cả, toolbar đổi hàng loạt status/priority, action `bulkUpdateTickets` + API route `/api/tickets/bulk-update` (chỉ ADMIN/TECHNICIAN), test `test-bulk-actions.js` pass.

## Known Issues
- npm cần `legacy-peer-deps=true` (.npmrc) do peer dependency conflicts
- Prisma dùng v6 (stable), không dùng v8 RC

## Notes
- 3 người trong nhóm, chưa phân công cụ thể ai làm phần nào
- Thời gian: 3-4 tháng
- Quy mô: 50-200 thiết bị, 5-10 phòng máy
