# Feature Spec: Quản lý Thiết bị & QR Code

## Goal

CRUD thiết bị (máy tính, thiết bị mạng, ngoại vi), quản lý phần mềm cài đặt, generate/scan mã QR, lịch sử bảo trì.

## Scope

### In Scope

- Danh sách thiết bị (table: search, filter theo phòng/loại/trạng thái)
- CRUD thiết bị (tên, loại, phòng, cấu hình, trạng thái...)
- Generate mã QR unique cho mỗi thiết bị
- Scan QR → xem chi tiết thiết bị hoặc tạo ticket nhanh
- Quản lý phần mềm cài trên thiết bị (thêm/xóa software)
- Xem lịch sử bảo trì/sửa chữa của thiết bị
- Thêm log bảo trì/sửa chữa

### Out of Scope

- In QR code hàng loạt
- Import thiết bị từ Excel/CSV
- Tracking linh kiện thay thế

## Dependencies

- Auth system (spec 01)
- Room management (spec 02) — thiết bị thuộc phòng
- Prisma models: Device, Software, DeviceSoftware, MaintenanceLog (đã có)
- Libraries: `qrcode` (generate), `html5-qrcode` (scan)

## Technical Design

### Routes

```
/devices                — Danh sách thiết bị
/devices/new            — Form tạo thiết bị
/devices/[id]           — Chi tiết thiết bị (tabs: info, software, maintenance)
/devices/[id]/edit      — Form sửa thiết bị
/devices/scan           — Trang scan QR
```

### API Endpoints

```
GET    /api/devices              — Danh sách (search, filter, pagination)
POST   /api/devices              — Tạo mới (ADMIN, TECHNICIAN)
GET    /api/devices/[id]         — Chi tiết
PATCH  /api/devices/[id]         — Cập nhật (ADMIN, TECHNICIAN)
DELETE /api/devices/[id]         — Soft delete (ADMIN)
GET    /api/devices/[id]/qr      — Generate QR code image
GET    /api/devices/qr/[code]    — Lookup thiết bị theo QR code

POST   /api/devices/[id]/software       — Thêm software vào thiết bị
DELETE /api/devices/[id]/software/[sid]  — Xóa software khỏi thiết bị

GET    /api/devices/[id]/maintenance     — Lịch sử bảo trì
POST   /api/devices/[id]/maintenance     — Thêm log bảo trì (TECHNICIAN, ADMIN)
```

### QR Code Flow

1. Tạo thiết bị → auto generate `qrCode` = `DEVICE-{cuid}`
2. GET `/api/devices/[id]/qr` → trả về PNG QR chứa URL: `{APP_URL}/devices/qr/{qrCode}`
3. User scan QR bằng camera → redirect tới trang chi tiết thiết bị
4. Từ trang chi tiết → nút "Báo sự cố" → tạo ticket với device đã pre-fill

### Specifications (JSON field)

```json
{
  "cpu": "Intel Core i5-12400",
  "ram": "8GB DDR4",
  "storage": "256GB SSD",
  "os": "Windows 11",
  "monitor": "Dell 24 inch"
}
```

Dùng dynamic key-value form, không fixed fields.

### Permissions

- USER: xem danh sách, xem chi tiết, scan QR
- TECHNICIAN: xem + tạo + sửa + thêm log bảo trì + quản lý software
- ADMIN: toàn quyền (bao gồm xóa)

### Validation (Zod)

- name: required, min 2, max 100
- type: enum DeviceType
- roomId: required, must exist
- status: enum DeviceStatus
- serialNumber: optional, unique
- specifications: optional JSON object
- Maintenance log: description required, type required (repair/maintenance/upgrade)

## Invariants

- qrCode phải unique, auto-generated, không cho user sửa
- serialNumber nếu có phải unique
- Thiết bị phải thuộc 1 phòng (roomId required)
- Soft delete: set deletedAt, thiết bị vẫn hiện trong lịch sử
- Software-device relation: không duplicate (unique constraint)

## Verification Checklist

- [ ] Danh sách thiết bị hiển thị, filter theo phòng/loại/trạng thái OK
- [ ] Tạo thiết bị → auto generate QR code
- [ ] Xem QR code image của thiết bị
- [ ] Scan QR → redirect đúng trang chi tiết
- [ ] Sửa thông tin thiết bị OK
- [ ] Thêm/xóa software trên thiết bị OK
- [ ] Thêm log bảo trì OK
- [ ] Xem lịch sử bảo trì đúng
- [ ] Xóa thiết bị (soft delete) OK
- [ ] User thường không tạo/sửa/xóa được thiết bị
