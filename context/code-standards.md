# Code Standards - DLU OneDesk

## TypeScript

- Strict mode enabled
- Không dùng `any` — dùng proper types hoặc `unknown`
- Interface cho data models, Type cho unions/utilities
- Đặt tên: PascalCase cho types/interfaces, camelCase cho variables/functions

## Next.js Patterns

- App Router (không dùng Pages Router)
- Server Components mặc định — chỉ dùng `"use client"` khi cần interactivity
- API routes trong `app/api/` — RESTful naming
- Server Actions cho form mutations đơn giản
- Middleware cho auth protection

## File & Folder Naming

- Folders: kebab-case (`device-management/`)
- Components: PascalCase (`DeviceCard.tsx`)
- Utilities/hooks: camelCase (`useDevices.ts`, `formatDate.ts`)
- Types: đặt trong file sử dụng, hoặc `types/` folder nếu shared

## Components

- shadcn/ui là component library chính — không tự viết lại những gì đã có
- Custom components trong `components/` folder
- Layout components: `components/layout/`
- Feature components: `components/[feature]/` (ví dụ: `components/tickets/`)
- Shared/common: `components/ui/` (shadcn) + `components/shared/`

## Styling

- Tailwind CSS utility classes — không viết custom CSS trừ khi bắt buộc
- Dùng `cn()` helper (from shadcn) để merge classnames
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)
- Dark mode: hỗ trợ qua Tailwind `dark:` variant

## Database & Prisma

- Schema trong `prisma/schema.prisma`
- Model names: PascalCase singular (`Device`, `Ticket`, `Room`)
- Field names: camelCase
- Relations: explicit naming
- Enum cho status fields
- `createdAt` và `updatedAt` trên mọi model
- Soft delete qua `deletedAt` field (không xóa thật data)

## API Design

- RESTful endpoints: `GET /api/devices`, `POST /api/devices`, `PATCH /api/devices/[id]`
- Response format thống nhất:
  ```json
  { "success": true, "data": {...} }
  { "success": false, "error": "message" }
  ```
- Validation input ở API layer bằng Zod
- Error handling: try/catch wrapper, return proper HTTP status codes

## Auth & Authorization

- NextAuth.js session-based
- Middleware check auth cho tất cả routes trong `(dashboard)/`
- API routes: check session + role trước khi xử lý
- Role check helper: `requireRole(session, "ADMIN")`

## Git

- Branch naming: `feature/[tên-feature]`, `fix/[tên-bug]`
- Commit message: tiếng Việt hoặc tiếng Anh đều OK, miễn rõ ràng
- Mỗi feature = 1 branch → merge vào `main` khi xong

## UI Context

- Color scheme: Professional, clean — phù hợp hệ thống IT enterprise
- Primary color: Blue (trust, technology)
- Status colors: Green (active/resolved), Yellow (warning/pending), Red (error/critical), Gray (inactive)
- Font: Inter (default của Tailwind)
- Border radius: `rounded-lg` default
- Spacing: consistent với Tailwind scale (4, 8, 12, 16, 24, 32)
- Icons: Lucide React (đi kèm shadcn/ui)
- Tables: shadcn DataTable cho danh sách thiết bị, ticket
- Forms: React Hook Form + Zod validation + shadcn form components
- Toast notifications: sonner (đi kèm shadcn)
- Modals/Dialogs: shadcn Dialog
- Charts (dashboard): Recharts
