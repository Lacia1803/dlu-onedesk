# Code Review — DLU OneDesk
**Stack:** Next.js 16.3.4 (App Router) + TypeScript + Prisma 6 + PostgreSQL + NextAuth v4 + shadcn/ui
**Mục đích:** Hệ thống quản lý hỗ trợ kỹ thuật — phòng máy, thiết bị, ticket sự cố, FAQ, chatbot AI
**Ngày review:** 2026-09-09

---

## Critical (Bug / Security)

### C0. Export Excel leak password hash của toàn bộ user ra client [MỚI]
**File:** `src/app/actions/dashboard-actions.ts:90-94`
```ts
db.ticket.findMany({
  include: { creator: true, assignee: true, device: true },
```
`creator: true` / `assignee: true` lấy TOÀN BỘ field User — gồm cả `password` (bcrypt hash) — rồi return về client qua Server Action. Bất kỳ Admin/Technician nào bấm "Xuất Excel" cũng nhận được hash password của mọi user trong payload (dù UI chỉ render `name`). Sửa: `select` từng field cần thiết, không bao giờ include `password`.

### C1. ~~Không có middleware bảo vệ route~~ — ĐÍNH CHÍNH: proxy ĐÃ TỒN TẠI
**File:** `src/proxy.ts` (Next.js 16 đổi tên middleware → proxy)
Lần review trước kết luận sai do chỉ tìm `src/middleware.ts`. Thực tế `src/proxy.ts` dùng `withAuth` + matcher `/dashboard/:path*`, `/admin/:path*`, `/settings/:path*`, redirect unauthenticated → `/login`, chặn non-ADMIN khỏi `/admin/*`. Route đã được bảo vệ ở lớp edge.
Tồn dư nhỏ (không còn Critical): `dashboard/page.tsx:9` vẫn `if (!session) return null` thay vì `redirect("/login")` — defense-in-depth, nên sửa cho nhất quán nhưng proxy đã chặn trước đó.

### C2. Registration không giới hạn ai được đăng ký
**File:** `src/app/api/auth/register/route.ts:6-37`
Endpoint `/api/auth/register` mở cho mọi request. Bất kỳ ai cũng có thể tạo tài khoản `role: "USER"`. Trong hệ thống IT helpdesk nội bộ, đăng ký nên bị chặn hoặc chỉ admin mới tạo được user.

### C3. Chatbot gửi system prompt dưới dạng user message
**File:** `src/app/actions/chatbot-actions.ts:43-44`
```ts
{ role: "user" as const, parts: [{ text: systemMessage }] },
```
System prompt + FAQ context được gửi tin nhắn đầu tiên với role `"user"` thay vì dùng Gemini system instruction. Điều này:
- Dễ bị prompt injection — người dùng có thể override system prompt bằng cách viết "Bỏ qua các hướng dẫn trên..."
- Gemini API hỗ trợ `systemInstruction` parameter riêng, nên dùng đó

### C4. ~~`.env` có thể bị commit lên git~~ — ĐÃ KIỂM TRA, AN TOÀN
`.gitignore:34` có `.env*` → secrets không bị commit. Không cần sửa.

### C5. Không có rate limiting
Không có middleware hay library nào giới hạn request. Register endpoint, chatbot endpoint (Gọi Gemini API — tốn tiền), và API auth đều có thể bị abuse.

---

## High (UX / Architecture)

### H1. Sidebar active state logic sai (operator precedence)
**File:** `src/components/layout/sidebar.tsx:100-101`
```ts
pathname.startsWith(route.href) && route.href !== "/dashboard" || pathname === route.href
```
Do `&&` có ưu tiên cao hơn `||`, logic thực tế là:
`(pathname.startsWith(href) && href !== "/dashboard") || pathname === href`
→ Route `/dashboard` chỉ highlight khi `pathname === "/dashboard"` — OK.
Nhưng route `/dashboard/rooms` sẽ highlight KHI NÀO `pathname.startsWith("/dashboard/rooms")` — đúng.
Tuy nhiên route `/dashboard` sẽ highlight cho TẤT CẢ trang con (`/dashboard/rooms`, `/dashboard/devices`...) vì `pathname.startsWith("/dashboard")` là true. Chỉ bị chặn khi `route.href === "/dashboard"` nhưng logic toán tử ưu tiên sai.

Cần thêm ngoặc rõ ràng hoặc refactor.

### H2. Sidebar ẩn hoàn toàn trên mobile — không có mobile navigation
**File:** `src/components/layout/sidebar.tsx:83`
```tsx
<div className="hidden border-r bg-muted/40 md:block md:w-64">
```
Sidebar `hidden` trên mobile, header có placeholder nhưng không có hamburger menu.
→ User trên mobile KHÔNG THỂ điều hướng.

### H3. Route "/admin/users" và "/settings" tồn tại trong sidebar nhưng KHÔNG CÓ page
**File:** `src/components/layout/sidebar.tsx:71-79`
Sidebar hiển thị "Người dùng" (link `/admin/users`) và "Cài đặt" (link `/settings`) nhưng không có file page tương ứng → sẽ crash hoặc hiện 404.

### H4. Dashboard query lấy TOÀN BỘ devices chỉ để đếm theo status
**File:** `src/app/actions/dashboard-actions.ts:25-26`
```ts
db.device.findMany({ where: { deletedAt: null }, select: { status: true } })
```
Lấy toàn bộ bản ghi devices chỉ để tính `statusCounts`. Với 200 devices thì OK, nhưng với scale lớn sẽ lãng phí. Nên dùng `groupBy`:
```ts
db.device.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true })
```

### H5. Không có loading states (loading.tsx)
Không có file `loading.tsx` nào trong `(dashboard)/`. Khi Server Component fetch data, user thấy trang trắng cho đến khi data xong. Cần thêm `loading.tsx` với skeleton/spinner.

### H6. Không có error boundaries
Không có `error.tsx` nào. Nếu Server Component throw error (DB down, query fail), user thấy crash page thay vì error UI.

---

## Medium (Code Quality)

### M1. Duplicate permission checking logic
Mỗi action function đều viết lại check session + role:
```ts
const session = await getServerSession(authOptions);
if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TECHNICIAN")) {
  return { success: false, error: "..." };
}
```
Pattern này lặp lại ~15 lần. Nên tách thành helper `requirePermission(session, roles[])` returning `{ ok: true, session }` hoặc throw.

### M2. `session: any` type casting
**File:** `src/app/actions/device-actions.ts:9`
```ts
function checkPermission(session: any) {
```
Loại bỏ `any`. Dùng type `Session | null` từ NextAuth hoặc type custom.

### M3. `updateTicket` dùng `delete` trên parsed data — mutation trực tiếp
**File:** `src/app/actions/ticket-actions.ts:105-106`
```ts
delete parsed.data.priority;
delete parsed.data.assigneeId;
```
`parsed.data` là object từ Zod parse — mutate trực tiếp có thể gây unexpected side effects. Nên spread ra object mới.

### M4. QR code generation dùng `Math.random()` — không unique guaranteed
**File:** `src/app/actions/device-actions.ts:42`
```ts
const qrCode = `DEV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
```
`Math.random()` không đảm bảo uniqueness. Với 200 devices thì collision risk thấp nhưng vẫn có. Nên dùng `crypto.randomUUID()` hoặc check uniqueness.

### M5. `checkPermission` function trong device-actions check ADMIN+TECH nhưng `deleteDevice` check ADMIN riêng — không nhất quán
**File:** `src/app/actions/device-actions.ts:9-14` vs `97-98`
`createDevice`/`updateDevice` dùng `checkPermission()` (ADMIN + TECHNICIAN), `deleteDevice` check inline ADMIN only. Pattern không nhất quán, dễ gây confusion khi maintain.

### M6. Không có Zod validation cho register endpoint input length limits
**File:** `src/lib/validations/auth.ts` (chưa đọc nhưng register không check max length password, name length)

### M7. Comment model trong Prisma không có cascade delete — khi xóa ticket, comments tồn tại orphan
Schema `TicketComment` liên kết với `Ticket` nhưng không có `onDelete: Cascade`.

---

## Nice-to-have (Tính năng mới / Cải tiến)

### N1. Không có trang quản lý User (Users management)
Sidebar link `/admin/users` nhưng chưa có page. Spec mention admin quản lý user.

### N2. Không có trang Settings
Sidebar link `/settings` nhưng chưa có page.

### N3. Ticket image upload chưa được implement
Spec mention "Đính kèm hình ảnh mô tả lỗi khi tạo ticket" nhưng `TicketForm` và `ticketSchema` hiện tại không hỗ trợ upload image. Field `images String[]` có trong schema nhưng form không collect.

### N4. Notification bell polling luôn chạy — kể cả khi tab ẩn
**File:** `src/components/layout/notification-bell.tsx:42`
`setInterval(15s)` chạy liên tục. Nên dùng `document.visibilityState` để pause khi tab ẩn, tiết kiệm DB queries.

### N5. Không có toast feedback khi server action fail
Nhiều action return `{ success: false, error: "..." }` nhưng client components không luôn check và toast error message cho user.

### N6. FAQ manage page không có search/filter
Trang `/dashboard/faq/manage` hiển thị toàn bộ FAQ nhưng không có search hay filter theo category.

### N7. Device form không có auto-generated QR preview
Khi tạo thiết bị, QR code được gen ở server. User không thấy preview QR trước khi submit.

---

## Tổng kết

| Mức độ | Số lượng |
|--------|----------|
| Critical | 6 |
| High | 6 |
| Medium | 7 |
| Nice-to-have | 7 |

**Ưu tiên sửa:** C0 (password leak qua export) → C3 (chatbot prompt injection) → C2 (registration mở) → H1 (sidebar bug) → H3 (broken routes) → H5 (loading states)

---

## Đính chính sau review vòng 2 (đọc đủ codebase)

- **C1 bị hạ cấp:** `src/proxy.ts` chính là middleware của Next.js 16 (đổi tên từ `middleware.ts`). Auth route protection ĐÃ CÓ. Chỉ còn tồn dư `dashboard/page.tsx:9` return null thay vì redirect.
- **C0 phát hiện mới:** Export Excel include `password` hash của user trong payload trả về client.
- **M6 đã đọc `src/lib/validations/auth.ts`:** register có min length nhưng KHÔNG có max length — `password` không giới hạn trên, `name`/`email` không max. Người dùng có thể gửi password 10MB làm bcrypt treo server. Xác nhận là lỗi thật.
