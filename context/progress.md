# Progress Tracker - DLU OneDesk

## Trạng thái hiện tại
**Phase:** Đang phát triển feature
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

## Recently Completed (đợt Code Quality — 2026-09-11)
- [x] Loại bỏ `any` trong `src/app/actions/*`: thay thế bằng `Prisma.UserWhereInput`, `Prisma.DeviceUncheckedCreateInput`, `Prisma.TicketUncheckedUpdateInput`, `Record<string, string>`, helper `cellStr()`/`errorMessage()`, exported interfaces `TechKPIResult`; bảo hành type-check strict.
- [x] Server actions trả plain objects (`{ success, error }`) thay vì `NextResponse.json` — loại bỏ `import { NextResponse }` khỏi tất cả action files; `NextResponse.json` chỉ dùng trong `src/app/api/*/route.ts` (bulk-update route đã thêm `{ status: 500 }`).
- [x] Thêm test tự động: 16 tests mới trong `tests/actions.test.mjs` — schema validation (register, password), rate limiter (chatbot 10/min, register 5/min), chatbot integration, PDF export jsPDF smoke test → tổng 37/37 pass.
- [x] Tài liệu 2FA: hướng dẫn kích hoạt 5 bước trong README (section 6); modal trợ giúp Dialog trong `two-factor-form.tsx` với GuideCircle icon + 5 bước + cảnh báo mất phone.
- [x] Xem xét Redis: `cache.ts` đã hỗ trợ Upstash REST fallback khi set env `UPSTASH_REDIS_REST_URL`/`TOKEN`; `sse.ts` ghi chú multi-instance cần Redis pub/sub — hiện tại đủ cho single-instance deploy.
- [x] ESLint clean-up: `npm run lint --fix` + fix thủ công → từ 97 problems (45 errors) xuống **0 errors**; fix unused imports, `any` types (eslint-disable cho Prisma dynamic queries + React Hook Form generics), `react-hooks/purity` (Date.now→const), `react-hooks/set-state-in-effect` (mount detection, initial fetch), `window.location.href`→`useRouter().push()`, bare JSX comments→`{/* */}`.
- [x] Type-check: `npx tsc --noEmit` pass 0 errors; `npm run build` pass; `npm run test:unit` 37/37 pass.

## Recently Completed (đợt Enterprise Improvements + UX bổ sung — 2026-09-11)
- [x] Nhóm 1 (Security & RBAC): `src/proxy.ts` — Next.js 16 Proxy bảo vệ route theo role (ADMIN_ONLY, STAFF_WRITE, redirect login kèm callbackUrl); cron endpoints (`/api/cron/daily`, `/api/cron/overdue`) chuyển sang fail-closed (401 khi thiếu/sai `CRON_SECRET`); CSAT rating chỉ creator của ticket được gửi.
- [x] Nhóm 2 (Account Lifecycle & Self-service): form đổi mật khẩu trong `/settings` (`changePassword` action + `password.ts` schema); Admin reset mật khẩu trong `/admin/users` (`adminResetPassword`, sinh mật khẩu tạm, set `mustChangePassword`); banner `FirstLoginBanner` cảnh báo trên dashboard khi tài khoản còn dùng mật khẩu mặc định/import.
- [x] Nhóm 3 (DB & Performance): Prisma `@@index` cho Ticket (creatorId/assigneeId/status+slaDeadline/roomId), Device, Notification (userId+isRead), AuditLog; server-side pagination + search URL params cho Users, Audit Logs, Rooms, Software; Docker volume `upload_data:/app/public/uploads`.
- [x] Nhóm 4 (Chuẩn hóa & SLA giờ hành chính): `computeSlaDeadline`/`computeResponseDeadline` tính theo giờ làm việc TTTT (07:30–11:30 & 13:00–17:00, T2–T6; nhảy giờ nghỉ trưa, ngoài giờ, cuối tuần); update `tests/sla.test.mjs` theo thuật toán mới — 21/21 pass; `tsc --noEmit` + `npm run build` pass.
- [x] Mobile UX: `MobileNav` (Sheet drawer trái, `md:hidden`) trong Header + `src/lib/nav-items.ts` dùng chung routes cho Sidebar/MobileNav theo role.
- [x] Pagination Tickets & Devices: `PaginationControls` URL-driven (?page=&q=&status=&priority=) cho `/dashboard/tickets` và `/dashboard/devices` (PAGE_SIZE 20, skip/take + count).
- [x] Realtime SSE: event bus `src/lib/sse.ts` (EventEmitter, single-instance) + route `/api/notifications/sse` (ReadableStream, keepalive 20s, cleanup abort); `notifyUsers`/`notifyAdminsAndTechs` emit sau khi tạo notification; `notification-bell.tsx` kết nối `EventSource` (toast "Thông báo mới" + re-fetch), giữ polling 15s làm fallback.

## Recently Completed (đợt hoàn thiện 4 nhóm tính năng nâng cao — 2026-09-11)
- [x] Nhóm 1 (Hạ tầng): Gộp `src/lib/rate-limit.ts` vào `src/lib/cache.ts` trả `{allowed}`, bổ sung Upstash Redis REST fallback khi có env, tạo `src/lib/storage.ts` chuẩn hóa upload, cập nhật các route avatar/tickets/register.
- [x] Nhóm 2 (UX/UI): Tối ưu polling notification trong `notification-bell.tsx` qua `visibilitychange` (ngừng poll khi ẩn tab), xác nhận Dark Mode hoạt động trơn tru.
- [x] Nhóm 3 (Nghiệp vụ): Tạo server action `importDevices` và `importUsers` từ file Excel/CSV (`src/app/actions/import-actions.ts`), tạo component `ImportButton` mount trên cả trang Quản lý Thiết bị và Quản lý Người dùng.
- [x] Nhóm 4 (Testing & Ops): Bổ sung Playwright test cho flow đăng nhập thất bại và cập nhật bộ test E2E (`tests/playwright-e2e.test.ts`), dọn dẹp các script test ad-hoc ở root (giữ lại seed). Build và 21/21 unit test pass hoàn toàn.

## Recently Completed (đợt nâng cấp chất lượng & UX/UI — 2026-09-10)
- [x] Nâng cấp UI/UX & Accessibility toàn diện: Thêm `EmptyState` component cho toàn bộ các trang danh sách rỗng, tạo `TableSkeleton` & `Skeleton` kèm file `loading.tsx` cho Next.js App Router, thêm `ErrorSummary` & ARIA-alert cho form validation, bổ sung `aria-label` & focus-visible ring cho toàn bộ icon-button/links (delete/edit), thêm CI workflow (`.github/workflows/ci.yml`), viết unit test mới (`ui-helpers.test.mjs`, 21/21 pass tổng).
- [x] Sửa ảnh giao diện Landing Page: Thay thế toàn bộ hand-coded mockup trong `mockups.tsx` bằng ảnh chụp thực tế hệ thống (`realDashboard`, `realTickets`, `realDevices`, `realFaq`, `realKpi`).
- [x] Tăng tương phản WCAG AA & Accessibility: Nâng tông `text-gold-500`/`text-gold-600` thành `text-gold-700` trên nền sáng (tỷ lệ tương phản 5.73:1), thêm focus ring (`focus-visible:ring-2`) cho toàn bộ nút thao tác chính/phụ & modal close, tăng kích thước nút menu di động lên `size-11` (44px touch target).
- [x] Xử lý tràn ngang di động (Mobile Overflow): Thêm `overflow-x: hidden` cho root landing page (`index.css`), điều chỉnh vị trí blob trang trí để triệt tiêu scroll ngang ở màn hình 375px/390px.
- [x] Spec & Header Link: Tạo `specs/user-profile.md` làm rõ trang Hồ sơ (`/settings`), cập nhật link dropdown avatar trên Header.
- [x] Pagination cho Notification Center: 20 mục/trang, prev/next + đếm trang, `getAllNotifications` trả `{items, total, totalPages}`, API nhận `?page=`.
- [x] Cache in-memory (`src/lib/cache.ts`): `cached(key, ttl, fn)` + `rateLimit(key, limit, window)` — áp cache 5 phút cho API `/api/rooms`, rate limit 10 req/phút/user cho transfer/merge/FAQ-draft.
- [x] Device Transfer Modal: dropdown chọn phòng (fetch `/api/rooms`), disable phòng hiện tại.
- [x] Slack webhook (`src/lib/webhook.ts`): `sendSlack()` no-op khi chưa set `SLACK_WEBHOOK_URL`; cron daily đẩy cảnh báo SLA quá hạn + đến hạn bảo trì.
- [x] Notification UI polish: label tiếng Việt theo loại + tooltip, toast khi mark-all-read/xóa, nút xóa từng thông báo, stat cards (Chưa đọc / Ticket chờ xử lý / FAQ chờ duyệt) qua `?stats=true`.
- [x] Fix build: tách `NOTIFICATION_PAGE_SIZE`/`notificationPageSkip` sang `src/lib/notification-utils.ts` (file "use server" chỉ được export async function).
- [x] Test cache/rate-limit: 5 case mới (17/17 pass tổng). Docs: `docs/HuongDan.md` bổ sung hướng dẫn gộp ticket, FAQ draft + duyệt, điều chuyển thiết bị, Slack.

## Recently Completed (đợt 4 tính năng nâng cao — 2026-09-10)
- [x] F1: Trung tâm thông báo toàn diện
  - Schema: trường `type` trên Notification (TICKET_ASSIGNED | TICKET_STATUS | TICKET_COMMENT | SLA_WARNING | MAINTENANCE | FAQ | GENERAL).
  - `notifyUsers`/`notifyAdminsAndTechs` nhận `type`; cập nhật toàn bộ call site trong ticket-actions + cron daily.
  - API `/api/notifications` + trang `/dashboard/notifications` (filter ALL/UNREAD/theo loại, dot màu theo loại).
  - NotificationBell: dot màu theo loại + link "Xem tất cả thông báo".
  - Actions mới: `getAllNotifications(filter)`, `deleteNotification`.
- [x] F2: Bàn giao/điều chuyển thiết bị
  - API `POST /api/devices/transfer` (ADMIN/TECH): đổi roomId + ghi DeviceHistory RELOCATION + thông báo Admin/Tech.
  - UI: `DeviceTransferModal` trên trang chi tiết thiết bị (chỉ hiện với TECH/ADMIN).
- [x] F3: Gộp ticket trùng (Incident Merge)
  - Action `mergeTickets(targetId, dupIds)`: đóng ticket trùng, ghi TicketTransition (reason "Merged into #X"), comment tổng hợp trên ticket gốc, notify creator, audit log.
  - UI: `MergeTicketDialog` trên ticket detail (TECH/ADMIN), nhập danh sách ID ticket trùng.
- [x] F4: Kết quả xử lý → bản nháp FAQ có duyệt
  - Action `createFaqDraftFromTicket`: chỉ áp dụng ticket RESOLVED/CLOSED, lấy comment Tech/Admin cuối + internalNote làm "Cách xử lý", tạo FAQ `isActive=false` (nháp), notify Admin "FAQ chờ duyệt".
  - Action `approveFaqDraft(id, approve)`: chỉ ADMIN duyệt/từ chối (toggle isActive).
  - UI: nút "Tạo FAQ từ ticket" (ticket detail), nút duyệt ✓/✗ trên trang quản lý FAQ (ADMIN).
- Test & Build: `tsc --noEmit` pass, `npm run build` pass, 12/12 unit test pass.

## Recently Completed (đợt review & nâng cấp 3 tính năng lớn — 2026-09-10)
- [x] Spec 13: Hồ sơ thiết bị, Bảo trì định kỳ tự sinh công việc, SLA nâng cao
  - **Hồ sơ thiết bị có chiều sâu**:
    - Model `DeviceHistory` ghi vết điều chuyển phòng (`RELOCATION`), thay đổi tình trạng (`STATUS_CHANGE`), thay thế linh kiện (`PART_REPLACED`).
    - `MaintenanceLog` mở rộng trường `parts` (linh kiện đã thay), tự động tính mốc `nextMaintenanceAt` (+90 ngày).
    - UI `/dashboard/devices/[id]`: Tab Lịch sử bảo trì chi tiết (`MaintenanceList`), tab Lịch sử sự cố liên kết toàn bộ Ticket, cảnh báo hết hạn bảo hành.
  - **Bảo trì định kỳ tự sinh công việc**:
    - Model `MaintenancePlan` (chu kỳ `MONTHLY`, `QUARTERLY`, `SEMESTER`, checklist bảo trì phòng máy).
    - Cron route `/api/cron/daily`: Tự sinh ticket bảo trì khi đến hạn kỳ (`planPeriod` chống sinh trùng), đính kèm checklist chi tiết vào ticket description, thông báo Tech/Admin.
  - **SLA nâng cao & Cảnh báo leo thang**:
    - Tách riêng SLA phản hồi (`computeResponseDeadline`) và SLA giải quyết (`computeSlaDeadline`).
    - Ghi nhận `firstResponseAt` tự động khi Tech/Admin gửi bình luận đầu tiên.
    - Cơ chế **Tạm dừng SLA** (`slaPausedAt`): Khi chuyển sang `WAITING_PARTS` (chờ linh kiện), tự động tạm dừng đếm SLA; khi chuyển sang trạng thái khác sẽ cộng dồn bù thời gian chờ (`extendSlaDeadline`).
    - Cảnh báo leo thang qua `/api/cron/daily`: Nhắc nhở KTV khi còn <25% thời hạn SLA, gửi cảnh báo cho Quản trị viên khi ticket đã quá hạn.
  - Test & Build: Unit test suite 12/12 pass, TypeScript 0 lỗi, Next.js production build hoàn tất.
- [x] Spec 12: Ticket Lifecycle + SLA theo priority (URGENT 4h / HIGH 8h / MEDIUM 24h / LOW 72h)
  - Model `TicketTransition` (from/to/reason/user/thời gian) + `slaDeadline` trên Ticket
  - Enforce server-side trong `updateTicket` (đồ thị chuyển trạng thái, chặn đóng khi chưa RESOLVED)
  - `reopenTicket`: reset slaDeadline mới + ghi transition + enforce 7 ngày server-side (trừ ADMIN)
  - `bulkUpdateTickets`: ghi `createMany` transition hàng loạt
  - UI: SLA badge (còn Xh / quá hạn) + section lịch sử chuyển trạng thái ở ticket detail
  - `tsc --noEmit` + `npm run build` pass
- [x] Unit Test Suite: 12/12 test cases cho SLA calculation, Overdue detection, Ticket transition graph (`npm run test:unit` dùng `node --test`)
- [x] CI/CD Pipeline: GitHub Actions `.github/workflows/ci.yml` (Postgres service, lint, typecheck, unit tests, Next.js build)
- [x] AI Chatbot Guardrails: Giới hạn system prompt chuyên sâu IT Helpdesk, chặn out-of-scope, không tự nhận là người thật
- [x] UX Safety: Confirm modal trước các hành động bulk update trạng thái/ưu tiên nguy hiểm
- [x] Device Lifecycle: Hiển thị ngày mua, thời hạn bảo hành (cảnh báo quá hạn), tab lịch sử sự cố gắn liền thiết bị
- [x] Deployment: Dockerfile multi-container `docker-compose.yml`, route `/api/cron/overdue` bảo vệ bằng Bearer token, tài liệu chi tiết `docs/DEPLOY.md`

## Previously Completed
- [x] Feature: Quét mã QR bằng Camera — component `QrScanner`, tự động resolve `DEV-xxx` QR qua API `/api/devices/lookup`, bổ sung tùy chọn Xem thông tin / Tạo ticket ngay sau khi quét.
- [x] Feature: In PDF phiếu sửa chữa Ticket — action `exportTicketPdf` (chữ ký 2 bên, ASCII safe), nút "In phiếu PDF" trên UI `/dashboard/tickets/[id]`.
- [x] Feature: Tự động tạo ticket từ FAQ — nút "Tạo ticket từ FAQ" trong `FaqSearch`, tự động điều hướng sang `/dashboard/tickets/new` và điền sẵn tiêu đề/mô tả.
- [x] Docs: Cập nhật file `README.md` với toàn bộ tech stack, danh sách tính năng tổng quát, và hướng dẫn chạy local.
- [x] Docs: Viết tài liệu `docs/HuongDan.md` cho cả 3 vai trò (USER, TECHNICIAN, ADMIN).
- [x] Feature: Cảnh báo quá hạn (Overdue) — Badge đỏ "Quá hạn" trong `BulkTicketTable` cho ticket >3 ngày chưa đóng, action `sendOverdueReminder` (dùng nodemailer), nút Gửi reminder trên `AdminDashboard`.
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
- [x] Feature: Landing page — tích hợp concept vào `src/app/landing/`, route `/` + `/landing`, theme Pine Green/Sun Gold + Be Vietnam Pro toàn app; screenshots thật từ hệ thống trong `public/screenshots/`.
- [x] Fix: Nút "Hồ sơ" trong dropdown avatar (Header) điều hướng tới `/settings` (trang hồ sơ đã có sẵn: profile-form + 2FA).
- [x] Feature: Bulk Actions cho Tickets — `BulkTicketTable` với checkbox chọn nhiều, chọn tất cả, toolbar đổi hàng loạt status/priority, action `bulkUpdateTickets` + API route `/api/tickets/bulk-update` (chỉ ADMIN/TECHNICIAN), test `test-bulk-actions.js` pass.

## Known Issues
- npm cần `legacy-peer-deps=true` (.npmrc) do peer dependency conflicts
- Prisma dùng v6 (stable), không dùng v8 RC

## Notes
- 3 người trong nhóm, chưa phân công cụ thể ai làm phần nào
- Thời gian: 3-4 tháng
- Quy mô: 50-200 thiết bị, 5-10 phòng máy
