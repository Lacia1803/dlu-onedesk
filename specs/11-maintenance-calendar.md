# Spec: Lịch bảo trì (Calendar View)

## Goal

Xem lịch sử bảo trì thiết bị theo tháng trên giao diện lịch trực quan.

## Scope

- Trang `/dashboard/maintenance` với month-view calendar.
- Hiển thị maintenance logs theo từng ngày, badge số lượng.
- Click sự kiện xem chi tiết (thiết bị, phòng, mô tả, chi phí, kỹ thuật viên).
- Điều hướng prev/next month + nút "Hôm nay".
- Chỉ ADMIN / TECHNICIAN xem (sidebar + convention).

## Dependencies

- MaintenanceLog model (đã có).
- date-fns (đã cài, include locale vi).
- MaintenanceList trên trang device detail không đổi.

## Invariants

- Không tạo/sửa log từ calendar — chỉ read-only view.
- Server Component fetch toàn bộ logs một lần, calendar filter client-side.

## Verification

- [x] `npx tsc --noEmit` pass
- [ ] Mở `/dashboard/maintenance`, thấy lịch tháng hiện tại
- [ ] Chuyển tháng, nút Hôm nay hoạt động
- [ ] Click sự kiện → dialog chi tiết đúng dữ liệu
