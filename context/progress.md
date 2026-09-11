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

## Recently Completed (đợt Chụp lại Toàn bộ Ảnh Giao diện & Bổ sung vào README — 2026-09-11)

- [x] **Xây dựng Script Chụp ảnh Tự động (`scripts/capture-all.mjs`)**: Harness Playwright tự kiểm chứng — log `h1` từng route, phát hiện redirect-về-login / trang lỗi / console error / HTTP 5xx, đóng băng animation (`animation-duration:0s`) để ảnh full-page deterministic, và trả exit code 1 nếu có trang lỗi.
- [x] **Chụp lại toàn bộ 17 màn hình hệ thống**: Landing, Login, Tra cứu Ticket, Dashboard, Tickets, Chi tiết Ticket, Rooms, Devices, Software, FAQ, Maintenance, KPI, Notifications, Chat History, Admin Users, Audit Logs, Settings. Ảnh chụp từ production build thật (viewport 1440×900, `deviceScaleFactor: 2`, locale `vi-VN`), **0 trang lỗi, 0 console error**.
- [x] **Khắc phục lỗi chụp sai trang Chi tiết Ticket**: Locator cũ `a[href^="/dashboard/tickets/"]` khớp phải nút "Tạo Ticket mới" nên ảnh bị chụp nhầm form tạo ticket. Đã lọc bỏ các route `/(new|edit)` để chỉ chụp ticket thật đang tồn tại.
- [x] **Tối ưu ảnh Landing Page**: Trang chủ cao ~16.000px nên ảnh full-page không đọc được trên GitHub; chuyển sang chụp theo viewport (hero section) và downscale về 1440px, giảm dung lượng từ 3.8MB xuống 1.1MB.
- [x] **Bổ sung mục "Giao diện Hệ thống" vào README**: 17 ảnh được nhóm theo 4 khu vực chức năng (Công khai / Dashboard & Ticket / Phòng máy - Thiết bị - Phần mềm / Quản trị & Cài đặt).
- [x] **Sửa `.gitignore` để commit được ảnh chụp**: Rule `*.png` trước đây chặn toàn bộ ảnh mới; bổ sung ngoại lệ `!public/screenshots/*.png`.
- [x] **Đồng bộ tài liệu theo thực tế mã nguồn**: Sửa README các thông tin sai — mật khẩu seed (`admin`/`tech`/`user` thay vì `Admin@123`...), email không có hậu tố `1`, và đường dẫn seed đúng là `node seed-data.js` (không phải `prisma/seed-data.js`).

## Recently Completed (đợt Cập nhật Sơ đồ Kiến trúc, Tài liệu & CI Workflow — 2026-09-11)

- [x] **Tích hợp Sơ đồ Kiến trúc Hệ thống (Archify)**: Xuất bản sơ đồ kiến trúc tương tác `dlu-onesk-architecture.html` / `.json` và ảnh chụp PNG vào `docs/images/architecture-overview.png`.
- [x] **Viết lại toàn diện README.md**: Cập nhật toàn bộ tổng quan hệ thống, sơ đồ tương tác, luồng nghiệp vụ, danh mục bảo mật doanh nghiệp, hướng dẫn cài đặt & deploy Docker, chi tiết test suite.
- [x] **Khắc phục cấu hình CI GitHub Actions**: Bổ sung bước `npx prisma generate` và cờ `--legacy-peer-deps` vào workflow `.github/workflows/ci.yml` và `pr.yml` giúp CI build & test tự động thông suốt.
- [x] **Khắc phục triệt để cảnh báo ESLint**: Xử lý biến `disabled` trong `src/components/ui/button.tsx`, đưa dự án về trạng thái hoàn hảo 0 errors, 0 warnings.
- [x] **Đồng bộ hóa 100% Repository**: Đã commit và push toàn bộ tài liệu, components, server actions và configuration lên GitHub.
- [x] **Khắc phục ảnh sơ đồ kiến trúc bị cắt trong README**: Ảnh `docs/images/architecture-overview.png` trước đây là ảnh chụp theo viewport nên mất phần dưới (PostgreSQL, Prisma ORM, Nodemailer, Khách vãng lai). Đã chụp lại toàn trang (full-page, 3200x3450) để sơ đồ hiển thị đầy đủ trên GitHub.

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

- [x] **Khắc phục triệt để lỗi Next.js 16 Async Params trên Device Routes**: Sửa lỗi `PrismaClientValidationError: id undefined` tại `DeviceDetailPage` (`/dashboard/devices/[id]`) và `EditDevicePage` (`/dashboard/devices/[id]/edit`) bằng cách unwrap `await params` theo chuẩn Next.js 15+, đảm bảo 100% route động trong hệ thống đều async an toàn.
- [x] **Triệt tiêu 100% ESLint & TypeScript Warning/Error**: Khắc phục toàn bộ 7 vấn đề linter — loại bỏ unused `Link` tại `login/page.tsx`, unused `signIn` tại `register-form.tsx`, loại bỏ `any` types tại `maintenance/page.tsx` (dùng `TicketItem`) và `kpi-actions.ts` (bỏ unused `now` và ép kiểu thừa `isOverdue`), loại bỏ unused eslint-disable trong `vietnamese-font.ts`. Đạt chuẩn **0 errors, 0 warnings**.
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
