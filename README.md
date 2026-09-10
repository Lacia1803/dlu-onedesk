# DLU OneDesk - Hệ thống Hỗ trợ Kỹ thuật & Quản lý Thiết bị Phòng máy

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)

Hệ thống hỗ trợ kỹ thuật IT Helpdesk dành cho Trường Đại học Đà Lạt (DLU), giúp tối ưu hóa quy trình tiếp nhận sự cố, quản lý thiết bị phòng máy, đo lường KPI kỹ thuật viên và tự động hóa vận hành.

---

## 🎯 Tính năng nổi bật

### 📱 1. Tiếp nhận & Quản lý Ticket
- **Tạo ticket sự cố**: Phân loại theo danh mục, mức độ ưu tiên, đính kèm hình ảnh và liên kết thiết bị.
- **Quét mã QR bằng Camera**: Quét mã QR dán trên thiết bị để tạo báo cáo sự cố hoặc xem thông tin tức thì (`/dashboard/devices/scan`).
- **Gợi ý tự động từ FAQ**: Tự động gợi ý câu trả lời từ cẩm nang khi nhập tiêu đề ticket, hoặc tạo ticket 1-click từ FAQ.
- **Đánh giá & Mở lại ticket**: Đánh giá 1-5 sao sau khi hoàn thành. Người tạo có quyền mở lại (Reopen) ticket trong vòng 7 ngày nếu lỗi tái phát.
- **Xử lý hàng loạt (Bulk Actions)**: Chọn nhiều ticket để đổi trạng thái, mức độ ưu tiên hoặc tự động gán.

### 🤖 2. Trợ lý AI & Cẩm nang FAQ
- **AI Chatbot (Gemini API)**: Trợ lý tư vấn sự cố 24/7 trực tiếp trên màn hình, tra cứu dữ liệu FAQ thực tế.
- **Lịch sử chat AI**: Lưu vết cuộc trò chuyện cá nhân để xem lại (`/dashboard/chat-history`).
- **Cẩm nang hỗ trợ**: Quản lý các câu hỏi thường gặp, hỗ trợ nút "Tạo ticket từ FAQ" khi thông tin chưa đủ giải quyết.

### 📅 3. Lịch Bảo trì Kéo - Thả (Drag & Drop)
- Giao diện lịch bảo trì hàng tháng trực quan (`/dashboard/maintenance`).
- **Drag & drop ticket**: Kéo ticket trực tiếp từ danh sách và thả vào ô ngày trên lịch để lên lịch sửa chữa.

### 📊 4. Đo lường KPI & Báo cáo
- **Dashboard KPI Kỹ thuật viên**: Đo lường số lượng ticket xử lý, thời gian xử lý trung bình và tỷ lệ quá hạn.
- **KPI cá nhân (`/dashboard/my-kpi`)**: Trang thống kê hiệu suất riêng cho từng kỹ thuật viên.
- **Xuất báo cáo đa dạng**:
  - **Excel / CSV**: Xuất danh sách thiết bị và ticket (hỗ trợ BOM UTF-8 tiếng Việt).
  - **Snapshot Dashboard**: Xuất toàn bộ giao diện dashboard ra ảnh PNG hoặc file PDF.
  - **Báo cáo KPI PDF**: Xuất bảng thống kê KPI kỹ thuật viên dạng PDF chuẩn A4.
  - **Phiếu sửa chữa PDF**: In phiếu kỹ thuật chi tiết cho từng ticket kèm ô ký tên xác nhận.

### ⚙️ 5. Vận hành Tự động & Quản trị
- **Tự động phân công (Auto-assign)**: Thuật toán tìm Kỹ thuật viên có số lượng ticket active ít nhất để gán việc.
- **Cảnh báo quá hạn (Overdue Alert)**: Tự động đánh dấu badge đỏ cho ticket >3 ngày và gửi email nhắc nhở qua SMTP (`nodemailer`).
- **Bảo mật 2 lớp (2-FA)**: Xác thực OTP qua Google Authenticator (`@otplib/preset-default` + `qrcode`).
- **Nhật ký hệ thống (Audit Logs)**: Ghi log toàn bộ các hành động nhạy cảm trong hệ thống (`/admin/audit-logs`).
- **Phân quyền linh hoạt**: Phân quyền chi tiết 3 cấp độ (USER, TECHNICIAN, ADMIN).

---

## 🛠 Tech Stack

- **Framework**: Next.js 16.3.4 (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, shadcn/ui (`@base-ui/react`), Lucide Icons
- **Database & ORM**: PostgreSQL, Prisma ORM 6.19
- **Authentication**: NextAuth.js (Credentials Provider, JWT, 2-FA OTP)
- **PDF & Canvas**: `jspdf`, `html2canvas`
- **Excel & QR**: `xlsx`, `qrcode`, `html5-qrcode`
- **Validation**: Zod, React Hook Form
- **Notification**: Sonner Toasts, Nodemailer (Email SMTP)

---

## 🚀 Hướng dẫn Cài đặt & Chạy Local

### 1. Prerequisite
- Node.js version >= 20.x
- PostgreSQL database đang chạy local hoặc cloud (Supabase, Neon, Neon.tech...)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/username/dlu-onedesk.git
cd dlu-onedesk
npm install --legacy-peer-deps
```

### 3. Cấu hình Env Variable (`.env`)
Tạo file `.env` ở thư mục gốc:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dlu_onedesk?schema=public"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# (Tùy chọn) Gemini AI Key
GEMINI_API_KEY="your-gemini-api-key"

# (Tùy chọn) SMTP Email Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="no-reply@dlu.edu.vn"
```

### 4. Push Database Schema & Generate Prisma Client
```bash
npx prisma db push
npx prisma generate
```

### 5. Khởi chạy ứng dụng
```bash
# Chạy môi trường phát triển (Dev)
npm run dev

# Hoặc Build & Chạy Production
npm run build
npm run start
```
Truy cập ứng dụng tại: `http://localhost:3000`

### 6. Deploy (Docker)

```bash
# Copy env mẫu và điền giá trị thật
cp .env.example .env

# Build + chạy app + DB (migrate schema lần đầu)
docker compose up -d --build
docker compose exec web npx prisma db push

# Cron nhắc ticket quá hạn mỗi sáng (trên VPS/host)
# 0 8 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/overdue
```

> Đang chạy local `npm run dev`? Chạy `docker compose up db -d` để chỉ dùng Postgres trong Docker.

---

## 📑 Tài liệu chi tiết

Xem hướng dẫn sử dụng chi tiết theo từng vai trò tại [docs/HuongDan.md](docs/HuongDan.md).

---

## 📝 License
Đồ án Thực tập tốt nghiệp - Trường Đại học Đà Lạt (DLU).
