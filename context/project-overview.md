# DLU OneDesk - Hệ thống hỗ trợ kỹ thuật

## Tổng quan

Hệ thống quản lý hỗ trợ kỹ thuật (DLU OneDesk) cho Trung tâm CNTT - Trường Đại học Đà Lạt.
Quản lý phòng máy, thiết bị, phần mềm + tiếp nhận/xử lý sự cố qua hệ thống ticket.

## Đồ án thực tập nghề nghiệp

- **Trường:** Đại học Đà Lạt - Khoa CNTT
- **Sinh viên:** Phùng Võ Quốc Hiền (2212364) + 2 thành viên
- **Thời gian:** HK1, 2026-2027 (3-4 tháng)
- **Đơn vị thực tập:** Trung tâm CNTT - ĐH Đà Lạt

## Quy mô

- 5-10 phòng máy, 50-200 thiết bị
- Đội IT 5-10 người
- Người dùng cuối: sinh viên, giảng viên, cán bộ

## Core Flows

### Flow 1: Quản lý thiết bị & phòng máy

- CRUD phòng máy (tên, vị trí, số máy)
- CRUD thiết bị (máy tính, thiết bị mạng, ngoại vi)
- Mỗi thiết bị có: hồ sơ chi tiết, mã QR, cấu hình, vị trí, tình trạng
- Quản lý phần mềm cài đặt trên từng máy
- Lịch sử sửa chữa / bảo trì

### Flow 2: Hệ thống ticket sự cố

- Người dùng scan QR trên thiết bị → tạo ticket nhanh
- Hoặc tạo ticket thủ công (chọn phòng, thiết bị, mô tả sự cố)
- Đính kèm hình ảnh mô tả lỗi khi tạo ticket (hoặc khi comment)
- Phân loại sự cố: máy không hoạt động, lỗi mạng, phần mềm, thiết bị ngoại vi
- Gán mức độ ưu tiên (thấp / trung bình / cao / khẩn cấp)
- Phân công nhân viên kỹ thuật xử lý
- Theo dõi trạng thái: mới → đang xử lý → chờ linh kiện → hoàn thành → đóng
- Lịch sử xử lý ticket

### Flow 3: Quản lý tài khoản & phân quyền

- 3 vai trò: Admin, Technician (nhân viên KT), User (người dùng cuối)
- Admin: toàn quyền quản lý
- Technician: xem/xử lý ticket được phân công, cập nhật thiết bị
- User: tạo ticket, theo dõi ticket của mình

### Flow 5: Lịch làm việc (Calendar View)

- Giao diện lịch biểu cho Kỹ thuật viên (Technician)
- Xem các thiết bị sắp đến hạn bảo trì, lịch xử lý ticket.

### Flow 6: Hệ thống thông báo (Real-time)

- Thông báo in-app khi có ticket mới, có comment hoặc đổi trạng thái.
- Push toast ngay lập tức trên màn hình.

### Flow 7: AI Chatbot Hỗ trợ (Gemini API)

- Chatbot tự động tư vấn, chẩn đoán lỗi bằng ngôn ngữ tự nhiên.
- Dựa trên dữ liệu Cẩm nang (FAQ) để hướng dẫn người dùng trước khi họ tạo ticket.

### Flow 4: Cẩm nang hỗ trợ (FAQ / Knowledge Base)

- Danh sách hướng dẫn khắc phục lỗi cơ bản (Mạng, Máy in, Phần mềm, v.v.)
- Giúp người dùng tự sửa lỗi trước khi gửi ticket
- Technician / Admin có quyền quản lý nội dung

### Flow 5: Dashboard thống kê

- Tổng số thiết bị theo trạng thái (hoạt động / hỏng / bảo trì)
- Số ticket theo trạng thái, theo loại sự cố
- Lịch bảo trì sắp tới
- Hiệu suất xử lý ticket (thời gian trung bình)
- Biểu đồ xu hướng sự cố theo thời gian
- Hỗ trợ xuất báo cáo thống kê ra file Excel (Export Excel)

## Tech Stack

- **Framework:** Next.js 14+ (App Router) — fullstack
- **Language:** TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** NextAuth.js (credentials)
- **QR Code:** `qrcode` (generate) + `html5-qrcode` (scan)
- **Deploy:** Vercel + Neon PostgreSQL (free tier)

## Kiến trúc

```
Next.js App (App Router)
├── app/                    # Pages + API routes
│   ├── (auth)/             # Login, Register
│   ├── (dashboard)/        # Protected pages
│   │   ├── dashboard/      # Trang tổng quan
│   │   ├── rooms/          # Quản lý phòng máy
│   │   ├── devices/        # Quản lý thiết bị
│   │   ├── tickets/        # Hệ thống ticket
│   │   ├── users/          # Quản lý user (admin)
│   │   └── settings/       # Cài đặt
│   └── api/                # API endpoints
├── components/             # Shared UI components
├── lib/                    # Utilities, DB client, auth config
├── prisma/                 # Schema + migrations
└── context/                # Project context files (this folder)
```

## Phân công nhóm (3 người)

- **Người A:** Quản lý thiết bị & phòng máy (CRUD, QR, lịch sử bảo trì)
- **Người B:** Hệ thống ticket (tạo, phân công, theo dõi, thông báo)
- **Người C:** Auth/phân quyền + Dashboard thống kê

## Out of Scope (không làm trong đồ án này)

- Chat realtime giữa user và technician
- Email/SMS notification
- Mobile app (chỉ responsive web)
- Inventory tracking (nhập/xuất kho linh kiện)
- Báo cáo xuất PDF/Excel (có thể thêm sau)
- Multi-tenant (chỉ 1 tổ chức)
