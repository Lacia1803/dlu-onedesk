# Feature Spec: Quản lý Phòng máy

## Goal

CRUD phòng máy — tạo, xem, sửa, xóa (soft delete) phòng máy tại Trung tâm CNTT.

## Scope

### In Scope

- Danh sách phòng máy (table có search, filter)
- Tạo phòng máy mới (tên, vị trí, sức chứa, mô tả)
- Sửa thông tin phòng máy
- Xóa phòng máy (soft delete)
- Xem chi tiết phòng máy (kèm danh sách thiết bị trong phòng)

### Out of Scope

- Sơ đồ bố trí phòng máy (layout/map)
- Lịch sử thay đổi phòng

## Dependencies

- Auth system (spec 01) — cần login + role check
- Prisma Room model (đã có)

## Technical Design

### Routes

```
/rooms              — Danh sách phòng máy
/rooms/new          — Form tạo phòng mới
/rooms/[id]         — Chi tiết phòng (+ danh sách thiết bị)
/rooms/[id]/edit    — Form sửa thông tin phòng
```

### API Endpoints

```
GET    /api/rooms          — Danh sách (có search, pagination)
POST   /api/rooms          — Tạo mới (ADMIN, TECHNICIAN)
GET    /api/rooms/[id]     — Chi tiết (kèm devices)
PATCH  /api/rooms/[id]     — Cập nhật (ADMIN, TECHNICIAN)
DELETE /api/rooms/[id]     — Soft delete (ADMIN)
```

### Permissions

- USER: xem danh sách, xem chi tiết
- TECHNICIAN: xem + tạo + sửa
- ADMIN: toàn quyền (bao gồm xóa)

### Validation (Zod)

- name: required, min 2, max 100
- location: required, min 2
- capacity: required, integer, min 1, max 500
- description: optional, max 500

## Invariants

- Không xóa phòng nếu còn thiết bị đang ACTIVE trong phòng
- Tên phòng unique (trong các phòng chưa bị xóa)
- Soft delete: set deletedAt

## Verification Checklist

- [ ] Danh sách phòng hiển thị đúng, có pagination
- [ ] Search phòng theo tên hoạt động
- [ ] Tạo phòng mới thành công
- [ ] Tạo phòng trùng tên → báo lỗi
- [ ] Sửa thông tin phòng thành công
- [ ] Xóa phòng không có thiết bị → thành công
- [ ] Xóa phòng còn thiết bị ACTIVE → báo lỗi
- [ ] User thường không tạo/sửa/xóa được phòng
- [ ] Chi tiết phòng hiển thị danh sách thiết bị
