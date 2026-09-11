# Quy ước Commit (Commit Convention) - DLU OneDesk

Dự án này sử dụng tiêu chuẩn **Conventional Commits**. Mọi commit phải tuân thủ cấu trúc sau:

```
<type>(<scope>): <subject>

[optional body]
```

## Các loại Type cho phép:

- **feat**: Thêm một tính năng mới (Tương ứng với Minor version).
- **fix**: Vá lỗi (Tương ứng với Patch version).
- **docs**: Chỉ cập nhật tài liệu (README, Specs, Context...).
- **style**: Thay đổi về định dạng code (khoảng trắng, dấu phẩy, format code...). Không ảnh hưởng đến logic.
- **refactor**: Cấu trúc lại code nhưng không làm thay đổi logic (Không phải thêm feature, không phải fix bug).
- **perf**: Thay đổi code để cải thiện hiệu năng.
- **test**: Thêm mới hoặc sửa các test case có sẵn.
- **chore**: Các cập nhật về build tool, dependencies, cấu hình hệ thống (Ví dụ: thêm package, config Next.js...).

## Ví dụ:

- `feat(auth): Thêm form đăng ký tài khoản`
- `fix(dashboard): Khắc phục lỗi biểu đồ không hiển thị trên mobile`
- `chore: Cài đặt thư viện shadcn/ui`
- `docs: Cập nhật tiến độ dự án vào progress.md`

## Ngôn ngữ:

- Ghi chú (subject) bằng tiếng Anh hoặc tiếng Việt đều được, nhưng ưu tiên tiếng Anh nếu commit nhỏ, và tiếng Việt nếu giải thích tính năng/lỗi phức tạp.
- Cần viết ngắn gọn, súc tích (dưới 70 ký tự cho dòng đầu tiên).
