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
- [x] Feature: Canned Replies + Rating/Reopen — model `CannedReply` + CRUD actions, tooltip "Chèn trả lời mẫu" trong khung bình luận; Rating 1-5 sao + feedback widget trên ticket CLOSED, nút "Mở lại" trong 7 ngày (reopenedAt audit).
- [x] Feature: KPI kỹ thuật viên — action `getTechKPI(userId?)` (scoped per user), `TechKPIDashboard` (AdminDashboard) + trang `/dashboard/my-kpi` (MyKPI + link sidebar "KPI của tôi" cho ADMIN/TECH).
- [x] Feature: Auto-assign + cảnh báo quá hạn — action `autoAssignTicket` (gán cho tech ít việc, audit + notify + toast), nút "Tự động gán" trong BulkTicketTable.
- [x] Feature: Xuất PDF báo cáo KPI — action `exportKpiPdf` (jsPDF text table, ASCII-safe, chỉ ADMIN), nút "Xuất KPI PDF" trong AdminDashboard.
- [x] Fix: khôi phục `getTicketsForTechnician` (bị ghi đè), Prisma `db push` thêm `rating`/`feedback`/`reopenedAt` + `CannedReply`; `tsc --noEmit` + `npm run build` pass.
- [x] Task 5 Toast auto-assign/reopen: RatingWidget + BulkTicketTable hiển thị toast ngay khi hành động thành công.
- [x] Task 4 Canned-reply picker: TicketComments nhận cannedReplies, title tooltip đầy đủ.
- [x] Feature: Kéo-thả lên lịch Ticket — thêm `scheduledAt` vào Ticket, API `POST /api/tickets/schedule` + action `scheduleTicket` (chỉ ADMIN/TECH), `TechnicianTicketList` items draggable (HTML5 DnD), `MaintenanceCalendar` nhận drop vào ô ngày và hiển thị ticket đã lên lịch (badge vàng).
- [x] Feature: Export CSV — nút "Xuất báo cáo" dạng dropdown (Excel / CSV); CSV sinh 2 file (Thiết bị, Tickets) có BOM UTF-8 để mở tiếng Việt đúng trong Excel.
- [x] Feature: Lịch sử chat AI — model `ChatLog`, lưu fire-and-forget sau mỗi câu trả lời bot (user đã đăng nhập), trang `/dashboard/chat-history` + link sidebar.
- [x] Feature: Phân quyền UI — `src/lib/permissions.ts` (`hasRole`/`isAdmin`/`isTechnicianOrAdmin`) + component `PermissionWrapper`.
- [x] Feature: Internal Note + Quick Assign (Sprint 1) — trường `internalNote` chỉ Tech/Admin thấy, nút "Nhận xử lý" trong danh sách ticket.
- [x] Feature: Export Dashboard PNG/PDF — `ExportSnapshot` dùng html2canvas + jspdf, nút "Xuất ảnh PNG" / "Xuất PDF" trên dashboard.
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
