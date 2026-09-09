# Feature Spec: Authentication & Authorization

## Goal
Xây dựng hệ thống đăng nhập, đăng ký và phân quyền cho 3 vai trò: Admin, Technician, User.

## Scope
### In Scope
- Đăng ký tài khoản (email + password)
- Đăng nhập / Đăng xuất
- Phân quyền 3 vai trò (ADMIN, TECHNICIAN, USER)
- Middleware bảo vệ routes (redirect nếu chưa đăng nhập)
- Trang quản lý user (chỉ Admin)
- Đổi mật khẩu
- Profile page (xem/sửa thông tin cá nhân)

### Out of Scope
- OAuth (Google, Facebook...) — có thể thêm sau
- Quên mật khẩu / reset qua email
- 2FA

## Dependencies
- NextAuth.js (đã cài)
- Prisma User model (đã có)
- bcryptjs (đã cài)

## Technical Design

### Routes
```
/login              — Trang đăng nhập
/register           — Trang đăng ký
/dashboard          — Protected, redirect nếu chưa login
/settings/profile   — Xem/sửa thông tin cá nhân
/admin/users        — Quản lý user (ADMIN only)
```

### Auth Flow
1. User điền form → POST /api/auth/register → hash password → lưu DB → auto login
2. Login: NextAuth credentials provider → verify email + password → tạo session
3. Middleware: check session ở tất cả routes trong `(dashboard)/` group
4. Role check: helper function `requireRole()` cho API routes

### API Endpoints
```
POST   /api/auth/register     — Đăng ký
GET    /api/users              — Danh sách user (ADMIN)
PATCH  /api/users/[id]         — Cập nhật user/role (ADMIN)
DELETE /api/users/[id]         — Soft delete user (ADMIN)
PATCH  /api/users/[id]/password — Đổi mật khẩu
```

### Validation (Zod)
- Email: valid format, unique
- Password: min 6 ký tự
- Name: required, min 2 ký tự
- Role: enum ADMIN | TECHNICIAN | USER

## Invariants
- Password phải hash trước khi lưu DB (bcrypt, salt rounds = 10)
- User mặc định role = USER khi đăng ký
- Chỉ ADMIN mới đổi được role của user khác
- Không ai xóa được chính mình
- Soft delete: set deletedAt, không xóa record

## Verification Checklist
- [ ] Đăng ký tạo user mới với role USER
- [ ] Đăng nhập thành công với email + password đúng
- [ ] Đăng nhập thất bại với password sai → hiển thị lỗi
- [ ] Truy cập /dashboard khi chưa login → redirect /login
- [ ] User thường không truy cập được /admin/users
- [ ] Admin đổi role user khác thành công
- [ ] Đổi mật khẩu thành công
- [ ] Soft delete user → user không login được nữa
