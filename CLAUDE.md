@AGENTS.md

# DLU OneDesk - Hệ thống hỗ trợ kỹ thuật

## Quy tắc làm việc
1. **Đọc context trước khi code:** Luôn đọc `context/project-overview.md`, `context/code-standards.md`, `context/progress.md` trước khi bắt đầu bất kỳ task nào.
2. **Spec-driven:** Mỗi feature phải có spec trong `specs/` trước khi code. Spec gồm: goal, scope, dependencies, invariants, verification checklist.
3. **Làm từng unit nhỏ:** Không code nhiều feature cùng lúc. Hoàn thành 1 spec → verify → cập nhật progress → tiếp spec tiếp theo.
4. **Cập nhật progress:** Sau mỗi thay đổi quan trọng, cập nhật `context/progress.md`.
5. **Tuân thủ code standards:** Theo đúng convention trong `context/code-standards.md`.
6. **Không tự ý thay đổi kiến trúc:** Nếu cần thay đổi architecture, thảo luận trước.
7. **Giữ scope nhỏ:** Không thêm feature ngoài đề cương trừ khi được yêu cầu.
- `context/commit-convention.md` — Quy ước viết Git Commit
