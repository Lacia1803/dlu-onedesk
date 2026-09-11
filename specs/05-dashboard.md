# Feature Spec: Dashboard Thống kê

## Goal

Hiển thị tổng quan tình hình thiết bị và sự cố, hỗ trợ ra quyết định.

## Scope

### In Scope

- Thống kê tổng số (KPI cards): Tổng thiết bị, Thiết bị hỏng, Tổng ticket mở, Ticket quá hạn/khẩn cấp
- Biểu đồ trạng thái thiết bị (Pie chart)
- Biểu đồ ticket theo category/loại sự cố (Bar chart)
- Biểu đồ trend ticket theo ngày/tuần (Line chart)
- Bảng thiết bị cần bảo trì/hết hạn bảo hành sắp tới
- Phân quyền: Có view riêng cho Admin/Technician, view rút gọn cho User

### Out of Scope

- Report xuất ra PDF/Excel
- Custom dashboard widgets (kéo thả)
- Báo cáo theo KPIs SLA chi tiết

## Dependencies

- Tất cả models (User, Room, Device, Ticket)
- Thư viện Recharts (đã cài)
- shadcn/ui Card components

## Technical Design

### Routes

```
/dashboard              — Trang chủ sau khi login
```

### API Endpoints

```
GET /api/dashboard/stats           — KPI cards (device count, ticket count)
GET /api/dashboard/device-status   — Data cho Pie chart (group by status)
GET /api/dashboard/ticket-trends   — Data cho Line chart (ticket tạo/đóng theo 7-30 ngày)
GET /api/dashboard/maintenance     — Danh sách thiết bị hết hạn BH/cần bảo trì
```

### Dashboard Views

**1. View cho ADMIN & TECHNICIAN:**

- Hàng 1 (Cards): Tổng thiết bị | Đang hỏng | Ticket mới (OPEN) | Ticket chưa đóng
- Hàng 2 (Charts): Biểu đồ trạng thái thiết bị (Pie) | Biểu đồ ticket theo ngày (Line)
- Hàng 3 (Tables): 5 ticket mới nhất | Thiết bị cần bảo trì

**2. View cho USER:**

- Hàng 1 (Cards): Ticket của tôi | Đang xử lý | Hoàn thành
- Hàng 2: Danh sách ticket gần nhất của user đó

### Permissions

- API check role: nếu USER gọi các endpoint tổng quát → trả lỗi 403.
- Page UI render component khác nhau dựa trên session.user.role.

## Invariants

- Dữ liệu trả về từ API phải chính xác và được caching hợp lý (Next.js Route Cache / revalidate)
- Không rò rỉ dữ liệu toàn hệ thống cho User thường qua API /api/dashboard/stats

## Verification Checklist

- [ ] Login bằng Admin → thấy view admin (đầy đủ charts)
- [ ] Login bằng User → thấy view user (chỉ số của cá nhân)
- [ ] User gọi API thống kê tổng quát → bị chặn (403)
- [ ] Thêm thiết bị mới/đổi trạng thái → số liệu cập nhật
- [ ] Tạo ticket mới/đóng ticket → số liệu + chart cập nhật
- [ ] Biểu đồ Recharts render tốt trên màn hình mobile (responsive)
