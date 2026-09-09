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

## In Progress
- [ ] Feature: Lịch bảo trì (Calendar View)

## Pending
- [ ] Feature: AI Chatbot (Gemini) + Export Excel
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
