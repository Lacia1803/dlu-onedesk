# Progress Tracker - DLU OneDesk

## Trạng thái hiện tại
**Phase:** Setup hoàn tất, chuẩn bị viết feature specs
**Ngày cập nhật:** 2026-09-09

## Completed
- [x] Đọc đề cương, phân tích yêu cầu
- [x] Chọn tech stack: Next.js + Prisma + PostgreSQL + shadcn/ui
- [x] Tạo context files (project-overview, code-standards, progress)
- [x] Setup project Next.js (TypeScript, Tailwind, App Router)
- [x] Cài dependencies (Prisma 6, NextAuth, Zod, React Hook Form, QR, Recharts)
- [x] Setup shadcn/ui + components (button, card, input, label, dialog, table, badge, select, textarea, dropdown-menu, avatar, separator, sheet, tabs, sonner)
- [x] Thiết kế database schema (8 models: User, Room, Device, Software, DeviceSoftware, Ticket, TicketComment, MaintenanceLog)
- [x] Tạo Prisma client utility (src/lib/db.ts)
- [x] Build test OK

## In Progress
(Chưa có)

## Pending
- [x] Feature: Auth (login/register/phân quyền)
- [ ] Feature: Quản lý phòng máy (CRUD)
- [ ] Feature: Quản lý thiết bị (CRUD + QR code)
- [ ] Feature: Quản lý phần mềm
- [ ] Feature: Hệ thống ticket
- [ ] Feature: Cẩm nang hỗ trợ (FAQ)
- [ ] Feature: Dashboard thống kê
- [ ] Feature: Live Notifications
- [ ] Feature: Lịch bảo trì (Calendar View)
- [ ] Feature: AI Chatbot (Gemini) (có Export Excel)
- [ ] Kiểm thử & sửa lỗi
- [ ] Viết tài liệu hướng dẫn sử dụng
- [ ] Deploy

## Known Issues
- npm cần `legacy-peer-deps=true` (.npmrc) do peer dependency conflicts
- Prisma dùng v6 (stable), không dùng v8 RC

## Notes
- 3 người trong nhóm, chưa phân công cụ thể ai làm phần nào
- Thời gian: 3-4 tháng
- Quy mô: 50-200 thiết bị, 5-10 phòng máy
