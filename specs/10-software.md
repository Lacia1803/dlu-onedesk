# Feature Spec: Quản lý Phần mềm

## Goal
CRUD phần mềm — quản lý danh sách phần mềm cài đặt trên các thiết bị.

## Scope
### In Scope
- Danh sách phần mềm (table có search)
- Tạo phần mềm mới (tên, phiên bản, giấy phép)
- Sửa thông tin phần mềm
- Xóa phần mềm (hard delete — vì Software không có deletedAt)
- Xem chi tiết phần mềm (kèm danh sách thiết bị đã cài)
- Gắn/bỏ phần mềm vào thiết bị (thao tác trên device detail page)

### Out of Scope
- Auto-update version
- License management phức tạp

## Dependencies
- Auth (spec 01)
- Device (spec 03) — relation DeviceSoftware
- Prisma models: Software, DeviceSoftware (đã có)

## Technical Design

### Routes
```
/software              — Danh sách phần mềm
/software/new          — Form tạo mới
/software/[id]         — Chi tiết (danh sách thiết bị đã cài)
/software/[id]/edit    — Form sửa
```

### Server Actions
```
createSoftware(data)          — Tạo mới (ADMIN, TECHNICIAN)
updateSoftware(id, data)      — Cập nhật (ADMIN, TECHNICIAN)
deleteSoftware(id)            — Xóa (ADMIN)
```

### Permissions
- USER: xem danh sách, xem chi tiết
- TECHNICIAN: xem + tạo + sửa
- ADMIN: toàn quyền (bao gồm xóa)

### Validation (Zod)
- name: required, min 2, max 100
- version: optional, max 50
- license: optional, max 200

## Invariants
- Tên phần mềm + version phải unique (combination)
- Không xóa phần mềm nếu vẫn có thiết bị đang cài đặt (via DeviceSoftware)

## Verification Checklist
- [ ] Danh sách phần mềm hiển thị đúng
- [ ] Search theo tên hoạt động
- [ ] Tạo phần mềm mới thành công
- [ ] Sửa thông tin phần mềm thành công
- [ ] Xóa phần mềm không có device → thành công
- [ ] Xóa phần mềm còn device đang cài → báo lỗi
- [ ] Chi tiết hiển thị danh sách thiết bị đã cài
