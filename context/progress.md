# Progress Tracker - DLU OneDesk

## Trạng thái hiện tại

**Phase:** Sẵn sàng Deploy
**Ngày cập nhật:** 2026-09-11

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

- [ ] Deploy (Vercel/Render/Railway)
- [ ] Kiểm thử diện rộng & Feedback người dùng thật

## Recently Completed (đợt Khắc phục Lỗ hổng Bảo mật Nghiêm trọng & Lỗi nghiệp vụ — 2026-09-11)

- [x] **Ngăn chặn 100% Stored XSS khi Upload File**: Áp dụng cơ chế ánh xạ cứng MIME-type thành phần mở rộng file (chỉ cho phép `.jpg`, `.png`, `.webp`) trong `src/lib/storage.ts`, loại bỏ hoàn toàn việc sử dụng tên file do client cung cấp, vô hiệu hóa việc tải lên các mã thực thi độc hại (HTML/SVG/JS).
- [x] **Ngăn chặn Brute-force & CPU DoS trên Auth**: Thêm Rate-limiter (5 req/phút/IP) vào endpoint `/api/auth/check-2fa` giúp chống dò mã OTP và chống tấn công cạn kiệt CPU do gọi hàm bcrypt liên tục.
- [x] **Sửa lỗi Race Condition (P2002) cho Guest Report**: Đổi từ lệnh `findFirst` + `create` sang giao dịch nguyên tử `db.user.upsert` trên endpoint `/api/tickets/guest`, khắc phục triệt để lỗi Unique Constraint khi sinh viên quét QR báo hỏng đồng loạt.
- [x] **Xác thực Mật khẩu khi tắt 2FA (Privilege Escalation Prevention)**: Yêu cầu người dùng (cả quản trị viên) nhập chính xác mật khẩu hiện tại thông qua hộp thoại trước khi được phép vô hiệu hóa Bảo mật 2 lớp (`disableTwoFactor`).
- [x] **Sinh mật khẩu Admin an toàn**: Loại bỏ cơ chế lấy email làm mật khẩu dự phòng. API `adminResetPassword` hiện sinh chuỗi ngẫu nhiên bằng `crypto.randomBytes(4)` (ví dụ: `Dlu@a1b2c3d4`) gửi về cho Admin để cấp cho người dùng.
- [x] **Bảo vệ Node.js Event Loop khi Import Excel**: Cắt lô tác vụ `bcrypt.hash` trong `importUsers` (Batch size = 10) và chặn import vượt quá 200 dòng, ngăn sự cố sập ứng dụng (Thread-pool exhaustion).
- [x] **Ràng buộc Max Length trên Auth (Zod)**: Áp dụng giới hạn `max(100)` cho name, `max(254)` cho email và `max(128)` cho password trong `src/lib/validations/auth.ts`, ngăn chặn Payload DoS.
- [x] **Sửa lỗi State Machine Bypass khi Bulk Update**: `bulkUpdateTickets` hiện đã áp dụng hàm `isValidTransition` giống `updateTicket`, tự động sinh Timestamp (`resolvedAt`, `closedAt`) chính xác thay vì chỉ đổi `status` và lọc bỏ các yêu cầu cập nhật ticket đã `CLOSED`.
- [x] **Phân quyền API bằng Session Guards**: Viết hàm trợ thủ `requireApiSession` (`src/lib/permissions.ts`) và đóng kín 100% các route API tĩnh (`/api/faqs`, `/api/devices`, v.v.), đảm bảo dữ liệu không rò rỉ ra ngoài khi chưa đăng nhập.
- [x] **Bảo vệ Dữ liệu Nhạy cảm khi Export**: Kiểm tra hàm `getUsersExportData` đảm bảo `select` chỉ lấy các trường an toàn, loại bỏ 100% `password`, `twoFactorSecret`.
- [x] **Database Integrity (Cascade Delete)**: Bổ sung `onDelete: Cascade` vào `TicketTransition` và `TicketComment` trong `schema.prisma` để ngăn cản lỗi Orphan Data.
- [x] **Kiểm thử thành công 100%**: Sửa lỗi Base-UI Props cho `<Button>`, vượt qua 37/37 Unit Test, TypeScript biên dịch 0 lỗi, Build Next.js Production mượt mà.

## Recently Completed (đợt Kiểm toán Toàn diện, Clean-up Lint & Seed Data Mẫu Thực tế — 2026-09-11)

- [x] **Triệt tiêu 100% ESLint & TypeScript Warning/Error**: Khắc phục toàn bộ 7 vấn đề linter. Đạt chuẩn **0 errors, 0 warnings**.
- [x] **Phản hồi Trực quan Form Đăng nhập**: Bổ sung state `errorMessage` hiển thị cảnh báo đỏ trực tiếp ngay trên form đăng nhập ngoài toast thông báo, nâng cao trải nghiệm người dùng khó tính.
- [x] **Tương thích Cookie Session Local & Production**: Cập nhật logic `secure` cookie trong `src/lib/auth.ts` chỉ bật khi chạy HTTPS thật sự.
- [x] **Xây dựng Bộ Dữ liệu Mẫu Thực tế (`seed-data.js`)**: Nạp đầy đủ 4 phòng máy thực tế, 5 gói phần mềm môn học, 5 thiết bị, 4 bài cẩm nang FAQ, 1 kế hoạch bảo trì.
- [x] **Verification & Test Suite**: `npx tsc --noEmit` 0 errors, `npm run lint` 0 errors/warnings, `npm run test:unit` 37/37 pass, `node test-e2e-all.js` 19/19 pass 100%, Next.js production build pass 100%.

## Recently Completed (đợt Khắc phục 6 Điểm nghẽn Vận hành, Bảo mật & UX — 2026-09-11)

- [x] **Điểm nghẽn 1 (2FA Landing Page)**: Tích hợp bước kiểm tra 2FA (`/api/auth/check-2fa`) và ô nhập mã OTP ngay trong modal đăng nhập ở Header trang chủ.
- [x] **Điểm nghẽn 2 (Tra cứu Ticket công khai)**: Xây dựng trang `/tickets/track` + server action `trackTicket` hỗ trợ tra cứu tiến độ ticket qua CUID, 6 ký tự đuôi hoặc MSSV không cần đăng nhập.
- [x] **Điểm nghẽn 3 (Chống dán nhãn Overdue sai)**: Loại bỏ nhãn "Quá hạn SLA" trên các ticket ở trạng thái `RESOLVED`, `CLOSED`, `CANCELLED` qua helper `isOverdue`.
- [x] **Điểm nghẽn 4 (PDF Tiếng Việt Unicode)**: Tích hợp font DejaVuSans (Regular/Bold) subsetted base64 vào `ticket-pdf-export` và `kpi-pdf-export`, hỗ trợ 100% tiếng Việt có dấu.
- [x] **Điểm nghẽn 5 (Click-to-Schedule di động)**: Bổ sung chế độ chọn ticket + chạm chọn ngày lên lịch bảo trì bên cạnh HTML5 Drag-and-Drop trên `MaintenanceCalendar`.
- [x] **Điểm nghẽn 6 (Đồng bộ Đăng ký tài khoản)**: Thay link đăng ký công khai bằng hướng dẫn liên hệ TTTT tại `/login`, hỗ trợ phân quyền hiển thị form tạo user cho Admin tại `/register`.

## Recently Completed (đợt Khắc phục 17 lỗi & Nâng cấp bảo mật — 2026-09-11)

- [x] Trạng thái `CANCELLED`: Thêm giá trị `CANCELLED` vào `TicketStatus` enum, cập nhật đồ thị chuyển trạng thái `VALID_TRANSITIONS`, cho phép người tạo tự hủy ticket.
- [x] Báo hỏng nhanh vãng lai: Tạo luồng báo hỏng không cần đăng nhập qua Mã sinh viên tại `/devices/qr/[code]` + API `POST /api/tickets/guest`.
- [x] Thay `window.confirm`: Thay thế toàn bộ 5 vị trí dùng `window.confirm()` bằng component `AlertDialog` của shadcn/ui.
- [x] DB Index FKs: Bổ sung `@@index` cho tất cả khóa ngoại chưa có index trong Prisma schema.
- [x] Refactor Import Excel: Dùng `db.$transaction` + `createMany` và mã hóa bcrypt song song (`Promise.all`) trong `importDevices` / `importUsers`.
- [x] Mã hóa 2FA Secret: Dùng thuật toán AES-256-GCM với `ENCRYPTION_KEY` để mã hóa `twoFactorSecret` trong CSDL.
- [x] Chống DoS Password: Thêm ràng buộc `.max(72)` cho tất cả schema mật khẩu (Zod).

## Code Quality
- [x] Loại bỏ `any` trong `src/app/actions/*`.
- [x] Server actions trả plain objects (`{ success, error }`) thay vì `NextResponse.json`.
- [x] Thêm test tự động: 37/37 pass.
- [x] Type-check: `npx tsc --noEmit` pass 0 errors; `npm run build` pass.

## Enterprise Improvements + UX bổ sung
- [x] Proxy middleware bảo vệ route.
- [x] Tối ưu hóa UI/UX, hỗ trợ PDF, xuất báo cáo đa định dạng.
- [x] Hỗ trợ Realtime Notifications (SSE) + Rate limits.
- [x] Device Transfer Lifecycle & Ticket Merging.

## Known Issues

- npm cần `legacy-peer-deps=true` (.npmrc) do peer dependency conflicts
- Prisma dùng v6 (stable), không dùng v8 RC
