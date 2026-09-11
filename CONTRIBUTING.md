# Quy trình Đóng góp (Contributing Guide) - DLU OneDesk

Chào mừng bạn tham gia đóng góp cho dự án **DLU OneDesk**! Để đảm bảo chất lượng mã nguồn và duy trì kiến trúc nhất quán, vui lòng tuân thủ các quy tắc sau:

---

## 🌿 1. Quy tắc đặt tên Branch

Mọi branch mới phải bắt đầu bằng loại công việc (prefix) theo chuẩn:

- `feat/<tên-tính-năng>`: Thêm tính năng mới (ví dụ: `feat/realtime-sse-notifications`).
- `fix/<mô-tả-lỗi>`: Khắc phục lỗi (ví dụ: `fix/xss-chatbot-guard`).
- `docs/<tên-tài-liệu>`: Cập nhật tài liệu (ví dụ: `docs/update-testing-md`).
- `refactor/<tên-module>`: Tái cấu trúc mã nguồn không làm thay đổi tính năng.
- `chore/<tên-task>`: Cập nhật dependencies, cấu hình CI/CD, build tools.

---

## 💬 2. Quy ước Git Commit Message

Tuân thủ nghiêm ngặt chuẩn **Conventional Commits** (xem chi tiết tại `context/commit-convention.md`):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types hợp lệ:

- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Tài liệu
- `style`: Định dạng code (space, semi...)
- `refactor`: Tái cấu trúc
- `perf`: Tối ưu hiệu năng
- `test`: Thêm/sửa test
- `chore`: Cấu hình build, deps

### Ví dụ:

```bash
git commit -m "fix(security): sanitize user input in guest report form"
git commit -m "feat(realtime): add SSE endpoint for live notifications"
```

---

## 🧪 3. Quy trình Kiểm thử & Chất lượng Code trước khi Push

Trước khi tạo Pull Request hoặc push code lên branch chính:

1. **Kiểm tra linter**:

   ```bash
   npm run lint
   ```

   _Yêu cầu_: **0 errors, 0 warnings**.

2. **Kiểm tra Type-check**:

   ```bash
   npx tsc --noEmit
   ```

   _Yêu cầu_: **0 errors**.

3. **Chạy Unit Tests**:

   ```bash
   npm run test:unit
   ```

   _Yêu cầu_: Tất cả test cases pass (`37/37 pass`).

4. **Kiểm tra Format code**:
   ```bash
   npx prettier --check .
   ```

---

## 🚀 4. Quy trình Pull Request (PR)

1. Đẩy branch lên GitHub: `git push origin feat/your-feature-name`.
2. Tạo PR vào branch `master` (hoặc `main`).
3. Điền đầy đủ thông tin vào template PR:
   - Mô tả thay đổi.
   - Danh sách ticket / issue liên quan.
   - Kết quả kiểm thử tự động.
4. Đảm bảo GitHub Actions CI pass toàn bộ các bước trước khi merge.
