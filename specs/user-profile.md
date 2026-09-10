# Spec: Trang Hồ Sơ Người Dùng

## Goal
Người dùng xem và chỉnh sửa thông tin cá nhân (tên, SĐT, avatar), bật/tắt 2FA.

##现状 (Đối chiếu codebase — 10/09/2026)
Trang hồ sơ **đã tồn tại** dưới dạng `/settings`:
- `src/app/(dashboard)/settings/page.tsx` — Server Component, load user từ DB.
- `src/components/settings/profile-form.tsx` — avatar upload + tên + SĐT (react-hook-form + zod).
- `src/components/settings/two-factor-form.tsx` — 2FA.
- Actions: `src/app/actions/user-settings.ts` (`updateUserSettings`), `user-actions.ts` (`enableTwoFactor`...).
- Validation: `src/lib/validations/user-settings.ts`.
- Avatar API: `src/app/api/user/avatar/upload/route.ts` (JPEG/PNG/WEBP, max 5MB, rate-limit 5/phút).

## Gap còn lại (đã fix trong unit này)
- Nút "Hồ sơ" trên dropdown avatar ở `Header` không link tới đâu → đã link `/settings`.

## Invariants
- Chỉ chỉnh sửa hồ sơ của chính mình (action lấy `session.user.id`, không nhận id từ client).
- Validate phía server bằng zod.

## Verification checklist
- [x] Header dropdown "Hồ sơ / Cài đặt" điều hướng tới `/settings`.
- [x] `npx tsc --noEmit` pass.
- [ ] Smoke manual: đổi tên → toast → reload giữ giá trị; upload avatar 5MB+ bị chặn.

## Ngoài scope (ghi chú, chưa làm)
- Đổi mật khẩu tại `/settings` (admin-only hiện tại) — thêm khi user yêu cầu.
- Trang "hồ sơ công khai" xem thông tin KT viên — YAGNI.