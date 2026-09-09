<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DLU OneDesk - Project Rules (All Agents)

## Bắt buộc đọc trước khi code
1. `context/project-overview.md` — tổng quan project, tech stack, kiến trúc, scope
2. `context/code-standards.md` — convention, naming, patterns, UI context
3. `context/progress.md` — tiến độ hiện tại, tránh làm lại việc đã xong

## Quy tắc làm việc
1. **Spec-driven:** Mỗi feature có spec trong `specs/`. Đọc spec trước khi code feature đó.
2. **Từng unit nhỏ:** Hoàn thành 1 feature → verify → cập nhật `context/progress.md` → tiếp.
3. **Không tự ý thay đổi kiến trúc** hoặc thêm dependency mới mà không hỏi.
4. **Tuân thủ code standards:** TypeScript strict, Server Components mặc định, shadcn/ui, Tailwind.
5. **Giữ scope:** Không thêm feature ngoài đề cương.
6. **Cập nhật progress:** Sau mỗi thay đổi quan trọng, cập nhật `context/progress.md`.
