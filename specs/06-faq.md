# Feature Spec: Cẩm nang Hỗ trợ (FAQ / Knowledge Base)

## Goal

Tạo trang Cẩm nang (FAQ) để sinh viên/giảng viên tự tìm hiểu cách khắc phục các lỗi cơ bản trước khi tạo ticket, giúp giảm tải cho bộ phận IT.

## Scope

### In Scope

- Danh sách câu hỏi/hướng dẫn (chia theo Category: Mạng, Phần mềm, Máy in...).
- Admin/Technician có thể thêm, sửa, xóa (soft delete/ẩn) các câu hỏi.
- Chức năng tìm kiếm câu hỏi.
- Tích hợp gợi ý FAQ trong trang tạo Ticket (khi người dùng gõ tiêu đề sự cố).

### Out of Scope

- Format văn bản Rich Text (WYSIWYG editor) phức tạp (chỉ dùng text/markdown cơ bản).
- Đánh giá "Bài viết này có hữu ích không".

## Dependencies

- Prisma `Faq` model (đã thêm vào schema).
- Auth system (check quyền tạo/sửa).

## Technical Design

### Routes

- `/faq` — Trang danh sách cẩm nang (cho mọi User).
- `/admin/faq` — Trang quản lý FAQ (chỉ Admin/Technician).

### API Endpoints

- `GET /api/faqs` — Lấy danh sách câu hỏi (Public cho user đã login).
- `POST /api/faqs` — Tạo câu hỏi mới (Admin/Technician).
- `PATCH /api/faqs/[id]` — Cập nhật / Ẩn câu hỏi.

## Verification Checklist

- [ ] User thường xem được danh sách và tìm kiếm FAQ.
- [ ] Technician thêm mới câu hỏi thành công.
- [ ] Giao diện FAQ hiển thị trực quan theo từng danh mục.
