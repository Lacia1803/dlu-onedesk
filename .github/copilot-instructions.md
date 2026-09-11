# DLU OneDesk - Project Rules

Đọc các file sau TRƯỚC KHI code:

- `context/project-overview.md` — tổng quan, tech stack, kiến trúc, scope
- `context/code-standards.md` — convention, naming, UI context
- `context/progress.md` — tiến độ hiện tại

Đọc spec tương ứng trong `specs/` trước khi code feature.

## Quy tắc

- Spec-driven: đọc spec → code → verify → cập nhật progress
- TypeScript strict, Server Components mặc định, shadcn/ui, Tailwind
- Không tự ý thêm dependency hoặc thay đổi kiến trúc
- Không thêm feature ngoài scope
- Cập nhật `context/progress.md` sau mỗi thay đổi quan trọng
