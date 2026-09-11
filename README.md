# DLU OneDesk — Hệ thống Hỗ trợ Kỹ thuật & Quản lý Thiết bị Phòng máy

> **Đồ án Thực tập Tốt nghiệp** — Trường Đại học Đà Lạt (DLU)  
> **Tác giả:** aesc  
> **Phiên bản:** 1.0.0 (Production Ready)  

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Unit Tests](https://img.shields.io/badge/Unit_Tests-37%2F37_Pass-success.svg)](#-kiểm-thử--đảm-bảo-chất-lượng)
[![E2E Tests](https://img.shields.io/badge/E2E_Tests-19%2F19_Pass-success.svg)](#-kiểm-thử--đảm-bảo-chất-lượng)
[![Security](https://img.shields.io/badge/Security-Hardened_AES--256--GCM-red.svg)](#-bảo-mật--an-toàn-hệ-thống)

---

## 📌 Giới thiệu

**DLU OneDesk** là giải pháp phần mềm quản lý hỗ trợ kỹ thuật (IT Helpdesk) và thiết bị phòng máy chuyên dụng dành cho **Trường Đại học Đà Lạt**. Hệ thống được thiết kế nhằm hiện đại hóa quy trình tiếp nhận sự cố, tối ưu hóa công tác bảo trì phòng máy máy tính, tự động hóa phân công công việc, đo lường hiệu suất (KPI) kỹ thuật viên và tích hợp trí tuệ nhân tạo (AI Chatbot) hỗ trợ sinh viên & giảng viên 24/7.

![Architecture Diagram Overview](docs/images/architecture-overview.png)

---

## 🏗️ Kiến trúc Hệ thống (System Architecture)

Hệ thống được thiết kế theo kiến trúc **Next.js 16 App Router & Server Actions**, tách biệt thành các tầng rõ ràng:

* **Sơ đồ tương tác trực quan (Interactive Architecture):** [Mở bản thiết kế HTML tương tác](dlu-onesk-architecture.html) | [Xem file cấu hình JSON](dlu-onesk-architecture.json)

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Trình duyệt & Di động)"]
        UI["React 19 / Next.js Client Components"]
        MobileDrawer["Mobile Sheet Navigation Drawer"]
        QRScanner["Camera QR Code Scanner"]
        SSEListener["EventSource (SSE Realtime Listener)"]
    end

    subgraph SecurityLayer ["Security & Authentication Layer"]
        Middleware["Middleware Proxy (RBAC & Auth Guard)"]
        RateLimiter["Rate Limiter (5 req/phút/IP)"]
        AuthModule["NextAuth.js (Session & AES-256-GCM 2FA)"]
    end

    subgraph ServerLayer ["Server Layer (Next.js 16 App Router)"]
        APIRoutes["Server Actions & REST Endpoints (/api/*)"]
        SSEEngine["EventEmitter Bus (Realtime Push)"]
        StateMachine["Ticket State Machine Graph"]
        Scheduler["Cron Engine (SLA Alerts & Reminders)"]
    end

    subgraph DBLayer ["Database & Infrastructure Layer"]
        PrismaORM["Prisma ORM 6.19 (Indexed Models & Cascades)"]
        PostgreSQL[("PostgreSQL Primary Database")]
        StorageDriver["Strict Whitelist MIME File Storage Driver"]
    end

    subgraph ExternalServices ["External Integrations"]
        SMTP["Nodemailer (SMTP Notification Engine)"]
        GeminiAI["Google Gemini API (AI FAQ Chatbot)"]
    end

    UI --> Middleware
    MobileDrawer --> Middleware
    QRScanner --> Middleware
    Middleware --> RateLimiter
    RateLimiter --> AuthModule
    AuthModule --> APIRoutes
    APIRoutes --> StateMachine
    APIRoutes --> SSEEngine
    SSEEngine -.->|"Realtime Push"| SSEListener
    APIRoutes --> PrismaORM
    PrismaORM --> PostgreSQL
    APIRoutes --> StorageDriver
    APIRoutes --> SMTP
    APIRoutes --> GeminiAI
    Scheduler --> APIRoutes
```

---

## 🎯 Tính năng Nổi bật (Core Features)

### 📱 1. Tiếp nhận & Quản lý Ticket Sự cố (Helpdesk Core)
- **Tạo ticket linh hoạt:** Người dùng có thể báo hỏng thiết bị phòng máy, phân loại danh mục (Phần cứng, Phần mềm, Mạng, Khác), gán mức độ ưu tiên (LOW, MEDIUM, HIGH, URGENT) và đính kèm hình ảnh minh chứng.
- **Báo hỏng nhanh cho Khách vãng lai qua QR Code:** Sinh viên/giảng viên chỉ cần dùng smartphone quét mã QR dán trên thùng máy/bàn máy để tới thẳng `/devices/qr/[code]` và gửi báo hỏng tức thì qua mã sinh viên mà không cần đăng nhập.
- **Tra cứu tiến độ Ticket công khai (`/tickets/track`):** Tra cứu công khai tiến độ xử lý ticket thông qua CUID, 6 ký tự đuôi hoặc MSSV với thanh trạng thái 3 bước trực quan (`Tiếp nhận` → `Đang sửa chữa` → `Đã hoàn thành`), đảm bảo bảo mật không rò rỉ ghi chú nội bộ.
- **Đồ thị chuyển trạng thái chặt chẽ (State Machine Enforcement):** Hệ thống kiểm soát luồng trạng thái ticket chuẩn server-side (`OPEN` → `IN_PROGRESS` → `WAITING_PARTS` → `RESOLVED` → `CLOSED`), ngăn chặn cập nhật trái phép và tự động ghi nhận thời mốc `resolvedAt`, `closedAt`, `reopenedAt`.
- **Tính toán Deadline SLA chính xác:** Tự động tính thời hạn SLA theo giờ hành chính (Thứ 2 – Thứ 6, 7:30 – 17:00). Khi ticket chuyển sang `WAITING_PARTS` (chờ linh kiện), thời gian chờ sẽ được tạm dừng (pause SLA) và tự động cộng bù hạn chót khi quay lại xử lý.
- **Mở lại Ticket (Reopen):** Người tạo ticket hoặc Kỹ thuật viên có thể Reopen ticket đã đóng trong vòng 7 ngày nếu sự cố tái phát.
- **Xử lý hàng loạt (Bulk Actions):** Kỹ thuật viên/Admin có thể chọn nhiều ticket cùng lúc để đổi trạng thái, ưu tiên hoặc tự động phân công.

### 🛡️ 2. Bảo mật & An toàn Hệ thống (Enterprise Security Hardening)
- **Bảo mật 2 lớp (2-FA TOTP):** Mã hóa secret 2-FA trong CSDL bằng thuật toán **AES-256-GCM**.
- **Chống dò mã OTP & CPU DoS:** Giới hạn tần suất 5 yêu cầu/phút/IP trên endpoint `/api/auth/check-2fa`.
- **Xác thực Mật khẩu khi tắt 2-FA:** Yêu cầu người dùng nhập đúng mật khẩu hiện tại trước khi hủy kích hoạt 2-FA.
- **Ngăn chặn 100% Stored XSS qua Upload File:** Áp dụng cơ chế ánh xạ cứng từ MIME-type (`image/jpeg`, `image/png`, `image/webp`) sang đuôi file duy nhất. Đổi tên file ngẫu nhiên uuidv4, triệt tiêu nguy cơ tải lên file HTML/JS/SVG độc hại.
- **Sinh mật khẩu Admin ngẫu nhiên:** API `adminResetPassword` tạo mật khẩu tạm cryptographically secure qua `crypto.randomBytes(4)`.
- **Giới hạn độ dài Zod (Anti Payload DoS):** Ràng buộc độ dài tối đa cho email (254 ký tự), name (100 ký tự), mật khẩu (128 ký tự).
- **Session Guards toàn diện:** Đóng kín 100% các API route tĩnh bằng helper `requireApiSession`.
- **Database Cascade Delete:** Cấu hình `onDelete: Cascade` trong schema Prisma cho `TicketTransition` và `TicketComment` để duy trì tính toàn vẹn dữ liệu.

### 🤖 3. Trợ lý AI Gemini & Cẩm nang FAQ
- **AI Chatbot tư vấn 24/7:** Tích hợp Google Gemini API giải đáp thắc mắc kỹ thuật dựa trên dữ liệu FAQ thực tế của trường.
- **Lịch sử hội thoại cá nhân (`/dashboard/chat-history`):** Lưu trữ toàn bộ các phiên chat AI để người dùng xem lại.
- **Tạo ticket 1-click từ FAQ:** Khi bài viết cẩm nang chưa giải quyết được sự cố, người dùng có thể bấm nút tạo ngay ticket pre-fill thông tin từ câu hỏi FAQ.

### 📅 4. Lịch Bảo trì Kéo - Thả & Touch Screen Support
- Giao diện Lịch bảo trì hàng tháng trực quan (`/dashboard/maintenance`).
- **Drag & Drop:** Kéo thả ticket chưa phân lịch trực tiếp từ sidebar vào ô ngày trên lịch.
- **Touch Click-to-Schedule:** Hỗ trợ người dùng iPad/điện thoại thông qua chế độ chạm chọn ticket → chạm chọn ngày.

### 📊 5. Đo lường KPI & Xuất Báo cáo Đa định dạng
- **Dashboard KPI Kỹ thuật viên (`/dashboard/my-kpi`):** Thống kê số ticket đã hoàn thành, tỷ lệ đúng hạn SLA, điểm CSAT trung bình và biểu đồ phân bổ trạng thái.
- **Báo cáo PDF chuẩn Tiếng Việt Unicode:** Tích hợp font `DejaVuSans` (base64 subsetted) xuất file PDF không bị vỡ font tiếng Việt có dấu:
  - **Phiếu kỹ thuật sửa chữa (Ticket PDF Export):** Chứa mã QR, thông tin thiết bị, nhật ký xử lý và khung ký tên xác nhận.
  - **Báo cáo KPI Kỹ thuật viên (KPI PDF Export):** Bảng tổng hợp hiệu suất làm việc A4.
- **Xuất Excel / CSV:** Hỗ trợ UTF-8 BOM hiển thị chuẩn tiếng Việt trên Microsoft Excel.
- **Snapshot Dashboard:** Cho phép chụp và xuất toàn bộ giao diện báo cáo ra ảnh PNG hoặc PDF.

### 🖥️ 6. Quản lý Phòng máy, Thiết bị & Phần mềm
- **CRUD Phòng máy & Thiết bị:** Quản lý chi tiết danh sách phòng máy (A24.101, A24.102...), thông số kỹ thuật thiết bị (CPU, RAM, Disk, IP, MAC).
- **QR Code Generator & Camera Scanner:** Tự động sinh mã QR cho từng máy và hỗ trợ camera scanner ngay trên web để tra cứu/báo hỏng.
- **Quản lý Phần mềm môn học:** Quản lý danh sách phần mềm (AutoCAD, MATLAB, Visual Studio...) và gán/gỡ phần mềm trên từng máy.
- **Import Excel an toàn:** Nhập danh sách thiết bị và tài khoản từ file Excel, bảo vệ Node.js Event Loop bằng cơ chế cắt lô (Batch size = 10) khi băm mật khẩu `bcrypt`.

### 🔔 7. Thông báo Realtime SSE & Tự động hóa
- **Realtime Notifications (SSE):** Kết nối Server-Sent Events tại `/api/notifications/sse` cập nhật chuông thông báo đỏ ngay tức thì khi có ticket mới hoặc bình luận mới.
- **Tự động phân công (Auto-assign):** Thuật toán tìm Kỹ thuật viên có số lượng ticket đang xử lý (`OPEN`, `IN_PROGRESS`, `WAITING_PARTS`) ít nhất để tự động gán công việc.
- **Cảnh báo quá hạn (Overdue Alert):** Cron job kiểm tra và gửi email nhắc nhở Kỹ thuật viên khi ticket chớm quá hạn SLA.

---

## 📸 Giao diện Hệ thống (Screenshots)

Toàn bộ ảnh dưới đây được chụp trực tiếp từ hệ thống DLU OneDesk đang chạy ở môi trường production build, thông qua script tự động hóa Playwright tại [`scripts/capture-all.mjs`](scripts/capture-all.mjs) (viewport `1440×900`, `deviceScaleFactor: 2`, locale `vi-VN`).

### 🌐 Khu vực Công khai (Public)

| Trang chủ (Landing Page) | Đăng nhập |
| :---: | :---: |
| ![Trang chủ](public/screenshots/real-landing.png) | ![Đăng nhập](public/screenshots/real-login.png) |

**Tra cứu tiến độ Ticket công khai** (`/tickets/track`) — tra cứu không cần đăng nhập qua CUID, 6 ký tự đuôi hoặc MSSV:

![Tra cứu Ticket](public/screenshots/real-track.png)

### 📊 Dashboard & Nghiệp vụ Ticket

| Tổng quan Dashboard | Danh sách Ticket |
| :---: | :---: |
| ![Dashboard](public/screenshots/real-dashboard.png) | ![Danh sách Ticket](public/screenshots/real-tickets.png) |

| Chi tiết Ticket | KPI Kỹ thuật viên |
| :---: | :---: |
| ![Chi tiết Ticket](public/screenshots/real-ticket-detail.png) | ![KPI](public/screenshots/real-kpi.png) |

| Thông báo Realtime (SSE) | Lịch sử Chat AI |
| :---: | :---: |
| ![Thông báo](public/screenshots/real-notifications.png) | ![Lịch sử Chat](public/screenshots/real-chat-history.png) |

### 🖥️ Quản lý Phòng máy, Thiết bị & Phần mềm

| Quản lý Phòng máy | Quản lý Thiết bị |
| :---: | :---: |
| ![Phòng máy](public/screenshots/real-rooms.png) | ![Thiết bị](public/screenshots/real-devices.png) |

| Quản lý Phần mềm | Lịch bảo trì (Drag & Drop) |
| :---: | :---: |
| ![Phần mềm](public/screenshots/real-software.png) | ![Lịch bảo trì](public/screenshots/real-maintenance.png) |

**Cẩm nang Hỗ trợ (FAQ)** — nguồn dữ liệu cho AI Chatbot tư vấn:

![FAQ](public/screenshots/real-faq.png)

### 🔐 Quản trị & Cài đặt

| Quản lý Người dùng | Nhật ký Hệ thống (Audit Log) |
| :---: | :---: |
| ![Người dùng](public/screenshots/real-admin-users.png) | ![Audit Log](public/screenshots/real-admin-audit-logs.png) |

**Cài đặt Cá nhân** (`/settings`):

![Cài đặt](public/screenshots/real-settings.png)

---

## 🛠 Tech Stack

| Phân loại | Công nghệ / Thư viện | Ghi chú / Mục đích |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.4 (App Router, Turbopack) | React 19, Server Components, Server Actions |
| **Language** | TypeScript (Strict Mode) | Type-safe 100% từ DB đến UI |
| **Database & ORM** | PostgreSQL + Prisma ORM 6.19 | Indexed Foreign Keys, Cascade Deletes, Atomic Upserts |
| **Styling & UI** | Tailwind CSS v4, shadcn/ui (`@base-ui/react`) | Custom theme, Lucide React Icons, Recharts |
| **Authentication** | NextAuth.js (Credentials) | JWT Sessions, RBAC Proxy Middleware |
| **Security** | AES-256-GCM, Crypto randomBytes, Zod | Mã hóa 2FA, Whitelist File MIME, Rate Limiter |
| **AI Integration** | Google Gemini API (`@google/genai`) | AI Chatbot tư vấn sự cố & RAG FAQ |
| **PDF & Export** | `jspdf` (DejaVuSans Unicode), `html2canvas`, `xlsx` | In phiếu sửa chữa PDF, Xuất báo cáo KPI, Excel UTF-8 |
| **QR & Media** | `qrcode`, `html5-qrcode` | Sinh mã QR & Quét QR bằng Camera trình duyệt |
| **Notification** | EventSource (SSE), Nodemailer | Realtime push notification & Email SMTP |

---

## ⚙️ Cấu trúc Thư mục Dự án (Project Structure)

```text
dlu-onedesk/
├── docs/                           # Tài liệu hướng dẫn & Ảnh kiến trúc
│   ├── HuongDan.md                 # Hướng dẫn sử dụng chi tiết từng vai trò
│   └── images/                     # Ảnh sơ đồ kiến trúc hệ thống
├── prisma/                         # Schema CSDL
│   └── schema.prisma               # Prisma Schema (8 models có index & cascade)
├── seed-data.js                    # Script nạp dữ liệu mẫu thực tế
├── scripts/                        # Script tự động hóa (Playwright screenshots)
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Route đăng nhập, đăng ký, 2FA
│   │   ├── (dashboard)/            # Route dashboard bảo vệ bởi Auth Middleware
│   │   ├── actions/                # Server Actions (ticket, device, user, export)
│   │   ├── api/                    # API Endpoints (/api/auth, /api/tickets, /api/notifications)
│   │   ├── devices/qr/[code]/      # Luồng quét QR báo hỏng công khai
│   │   ├── landing/                # Trang chủ landing page công khai
│   │   └── tickets/track/          # Trang tra cứu tiến độ ticket công khai
│   ├── components/                 # React Components
│   │   ├── devices/                # Component thiết bị, QR scanner, import
│   │   ├── layout/                 # Header, Sidebar, Mobile Drawer, Notifications
│   │   ├── maintenance/            # Lịch bảo trì Drag-and-Drop & Touch
│   │   ├── tickets/                # Bảng ticket, form, timeline status
│   │   └── ui/                     # shadcn/ui base components
│   ├── lib/                        # Core Utilities & Security Libraries
│   │   ├── auth.ts                 # Cấu hình NextAuth, 2FA AES-256 encryption
│   │   ├── db.ts                   # Instance Prisma Client
│   │   ├── notifications.ts        # SSE EventEmitter & Email sender
│   │   ├── permissions.ts          # Session guards & RBAC helpers
│   │   ├── storage.ts              # Whitelist MIME file storage driver (Chống XSS)
│   │   ├── ticket-actions.ts       # SLA calculator & State machine validator
│   │   └── validations/            # Zod validation schemas
│   └── middleware.ts               # Proxy RBAC Route Middleware
├── public/screenshots/             # Ảnh chụp giao diện thực tế (Playwright)
├── tests/                          # Test Suite (Unit & E2E)
├── dlu-onesk-architecture.html     # Sơ đồ kiến trúc tương tác Archify HTML
├── dlu-onesk-architecture.json     # Cấu hình nguồn Archify JSON
└── README.md                       # Tài liệu hướng dẫn tổng quan dự án
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy Local (Getting Started)

### 1. Yêu cầu Tiền đề (Prerequisites)
- **Node.js**: Phiên bản 20.x trở lên.
- **Database**: PostgreSQL 15+ (Local PostgreSQL hoặc Cloud PostgreSQL như Supabase, Neon.tech...).

### 2. Tải mã nguồn & Cài đặt Dependencies
```bash
git clone https://github.com/Lacia1803/dlu-onedesk.git
cd dlu-onedesk
npm install --legacy-peer-deps
```

### 3. Cấu hình Bối cảnh Môi trường (`.env`)
Tạo file `.env` tại thư mục gốc của dự án và điền các biến sau:

```env
# Kết nối CSDL PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dlu_onedesk?schema=public"

# NextAuth Cấu hình & Khóa Bí mật
NEXTAUTH_SECRET="dlu-onedesk-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Khóa Mã hóa 2FA Secrets (32 ký tự Hex / AES-256-GCM)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Google Gemini AI API Key (Tùy chọn cho Chatbot)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Cấu hình Gửi Email SMTP (Tùy chọn cho Cảnh báo SLA)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="helpdesk@dlu.edu.vn"
SMTP_PASS="your-app-password"
SMTP_FROM="DLU OneDesk Helpdesk <no-reply@dlu.edu.vn>"
```

### 4. Đồng bộ CSDL & Nạp Dữ liệu Mẫu (Database Setup & Seed)
```bash
# Push schema sang PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Nạp bộ dữ liệu mẫu thực tế (4 phòng máy, 5 thiết bị, 5 phần mềm, 4 FAQ)
node seed-data.js
```

### 5. Khởi chạy Ứng dụng
```bash
# Môi trường phát triển (Development)
npm run dev

# Hoặc Biên dịch & Chạy Production
npm run build
npm run start
```
Mở trình duyệt và truy cập: `http://localhost:3000`

Tài khoản mẫu sau khi seed:
- **Admin:** `admin@dlu.edu.vn` / `admin`
- **Kỹ thuật viên:** `tech@dlu.edu.vn` / `tech`
- **Người dùng:** `user@dlu.edu.vn` / `user`

---

## 🔒 Hướng dẫn Kích hoạt & Sử dụng 2-FA (TOTP)

1. Đăng nhập hệ thống bằng tài khoản cá nhân.
2. Nhấp vào Avatar ở góc phải thanh Header → Chọn **Hồ sơ / Cài đặt** (`/dashboard/profile`).
3. Tại mục **Bảo mật hai lớp (2-FA)**, nhấp chọn **Kích hoạt 2-FA**.
4. Sử dụng ứng dụng **Google Authenticator** hoặc **Authy** trên điện thoại để quét mã QR hiển thị trên màn hình.
5. Nhập mã OTP 6 chữ số phát sinh từ ứng dụng authenticator và nhấp **Xác nhận & Kích hoạt**.
6. Từ lần đăng nhập tiếp theo, sau khi nhập thành công Email và Mật khẩu, hệ thống sẽ mở bước xác thực 2-FA yêu cầu mã OTP.
7. *Lưu ý an toàn:* Khi muốn tắt 2-FA, người dùng bắt buộc phải nhập lại mật khẩu hiện tại để xác minh chính chủ.

---

## 🐳 Triển khai với Docker (Production Docker Deployment)

Dự án cung cấp sẵn file `Dockerfile` tối ưu multi-stage build và `docker-compose.yml`:

```bash
# 1. Sao chép và cấu hình biến môi trường
cp .env.example .env

# 2. Build & Khởi chạy Container
docker compose up -d --build

# 3. Đồng bộ CSDL trong Container
docker compose exec web npx prisma db push

# 4. (Tùy chọn) Nạp dữ liệu mẫu
docker compose exec web node seed-data.js
```

---

## 🧪 Kiểm thử & Đảm bảo Chất lượng (Quality Assurance)

Dự án duy trì bộ kiểm thử tự động toàn diện đạt tỷ lệ vượt qua **100%**:

```bash
# Kiểm tra Lỗi kiểu TypeScript (Strict Mode)
npx tsc --noEmit

# Kiểm tra Lỗi Code Style & Linter
npm run lint

# Chạy toàn bộ 37 Unit Tests
npm run test:unit

# Chạy toàn bộ 19 E2E Integration Tests
node test-e2e-all.js
```

**Kết quả kiểm thử:**
- ✅ TypeScript Compilation: `0 errors`
- ✅ ESLint Code Style: `0 errors, 0 warnings`
- ✅ Unit Test Suite: `37/37 passed`
- ✅ E2E Integration Test Suite: `19/19 passed`
- ✅ Production Build: Pass 100% trên Next.js Turbopack compiler.

---

## 📄 Tài liệu Tham khảo & Hướng dẫn Chi tiết

- [Hướng dẫn Sử dụng Chi tiết Theo Vai trò](docs/HuongDan.md)
- [Bản phác thảo Kiến trúc HTML Tương tác](dlu-onesk-architecture.html)
- [Báo cáo Tiến độ & Lịch sử Cải tiến Dự án](context/progress.md)

---

## 📝 Giấy phép (License)

Đồ án Thực tập Tốt nghiệp — **Trường Đại học Đà Lạt (DLU)**.  
Bản quyền thuộc về tác giả **aesc** © 2026.
