# Hướng dẫn sử dụng DLU OneDesk

Hệ thống hỗ trợ kỹ thuật và quản lý thiết bị phòng máy – Đại học Đà Lạt.

---

## I. Dành cho Người dùng (USER)

### 1. Đăng nhập / Đăng ký

- Truy cập trang chủ `/login` hoặc `/register`.
- Nhập Email (tên miền `@dlu.edu.vn`) và Mật khẩu.

> **Lưu ý bảo mật:** Đăng ký công khai có thể bị Admin tắt bằng biến môi trường `DISABLE_REGISTRATION=true`, hoặc giới hạn chỉ Admin tạo tài khoản qua API (xem mục "Ghi chú bảo mật").

### 2. Gửi Báo cáo Sự cố (Ticket) & Điều hướng Mobile

- **Điều hướng trên di động**: Khi truy cập bằng điện thoại, nhấn vào biểu tượng **Menu (3 gạch)** ở góc trên bên trái Header để mở menu trượt.
- **Tạo ticket mới**: Vào menu **Tickets** → Chọn **Tạo Ticket mới** (`/dashboard/tickets/new`).
- **Phân trang & Tìm kiếm**: Trang Tickets và Thiết bị hỗ trợ tìm kiếm theo tên/serial/Mã QR và phân trang URL (`?page=...`).
- **Thông báo Realtime**: Khi có cập nhật mới về ticket hoặc phản hồi từ KTV, chuông thông báo ở Header sẽ "nảy số" đỏ ngay lập tức mà không cần tải lại trang.
- Điền tiêu đề, mô tả sự cố, danh mục (Phần cứng, Phần mềm, Mạng...) và chọn mức độ ưu tiên.
- **Có thể chọn thiết bị liên quan** (hoặc dùng tính năng quét QR).
- Xem các gợi ý FAQ hiển thị tự động khi gõ tiêu đề. Nếu FAQ chưa giải quyết được, bấm **"Vẫn gặp sự cố — tạo ticket từ mục này"** để điền sẵn thông tin.
- Có thể đính kèm ảnh bằng cách tải lên.

### 3. Tra cứu FAQ & Chát với AI Bot

- **Cẩm nang FAQ** (`/dashboard/faq`): Nhập từ khóa tìm kiếm. Nếu câu trả lời chưa giải quyết được vấn đề, bấm nút **"Tạo ticket từ FAQ"** để chuyển thẳng sang form báo lỗi.
- **AI Chatbot**: Nhấn icon Chat góc dưới bên phải màn hình để hỏi trực tiếp bot trợ lý. Bot sẽ dùng dữ liệu FAQ để trả lời và có nút bấm chuyển thành Ticket nếu cần.
- **Lịch sử chat AI** (`/dashboard/chat-history`): Xem lại các câu hỏi đã nhắn với AI.

### 4. Quét mã QR Thiết bị

- Vào menu **Thiết bị** → Chọn **Quét QR** (`/dashboard/devices/scan`).
- Cho phép trình duyệt truy cập Camera và đưa mã QR trên thiết bị vào khung quét.
- Sau khi nhận diện, hệ thống hiển thị tên thiết bị và 2 lựa chọn:
  - **Xem thông tin thiết bị**
  - **Báo cáo sự cố thiết bị này** (tự động chọn sẵn thiết bị trong form ticket).

### 5. Theo dõi & Đánh giá Ticket

- Xem danh sách ticket tại `/dashboard/tickets`.
- Sau khi Kỹ thuật viên xử lý và đóng ticket, bạn có thể:
  - **Đánh giá 1 - 5 sao** kèm góp ý.
  - **Mở lại ticket (Reopen)** trong vòng 7 ngày nếu sự cố chưa được khắc phục triệt để.

---

## II. Dành cho Kỹ thuật viên (TECHNICIAN)

### 1. Quản lý Ticket & Phân công

- Xem danh sách tất cả ticket tại `/dashboard/tickets`.
- Nút **"Nhận xử lý"** cho phép gán ticket cho chính mình nhanh chóng.
- Menu thao tác trên từng ticket: Đổi trạng thái (`OPEN`, `IN_PROGRESS`, `WAITING_PARTS`, `RESOLVED`, `CLOSED`), đổi mức độ ưu tiên, hoặc chuyển người xử lý.
- **Ghi chú nội bộ (Internal Note)**: Nhập ghi chú kỹ thuật (chỉ Tech/Admin mới nhìn thấy).
- **Chèn câu trả lời mẫu (Canned Replies)**: Sử dụng các câu phản hồi nhanh đã soạn sẵn khi bình luận.
- **Gộp ticket trùng (Incident Merge)**: Trên trang chi tiết ticket, bấm **"Gộp Ticket trùng"** và nhập danh sách mã ID của các ticket trùng lặp. Các ticket đó sẽ tự động đóng, người tạo nhận thông báo chuyển hướng về ticket gốc để xử lý chung.
- **Tạo FAQ từ ticket**: Với ticket đã xử lý (`RESOLVED`) hoặc đã đóng (`CLOSED`), bấm **"Tạo FAQ từ ticket"**. Hệ thống tự động trích xuất nội dung xử lý thành bản nháp FAQ (trạng thái ẩn) và gửi duyệt cho Admin.
- **SLA nâng cao**: Ticket được đếm ngược hạn xử lý theo mức ưu tiên. Khi chuyển sang `WAITING_PARTS` (chờ linh kiện), đồng hồ SLA tự động tạm dừng và cộng bù khi xử lý tiếp.

### 2. Kéo - thả Lịch Bảo trì (Drag & Drop Scheduling)

- Vào menu **Bảo trì** (`/dashboard/maintenance`).
- Danh sách ticket chưa lên lịch nằm ở bên trái.
- **Kéo ticket và thả vào ô ngày tương ứng trên lịch** để lên lịch sửa chữa.
- Hệ thống tự động cập nhật ngày bảo trì và hiển thị badge màu vàng trên lịch.

### 3. Xem KPI cá nhân

- Vào menu **KPI của tôi** (`/dashboard/my-kpi`).
- Theo dõi các chỉ số performance:
  - Tổng số ticket đã xử lý.
  - Thời gian xử lý trung bình (giờ).
  - Tỷ lệ ticket quá hạn.

---

## III. Dành cho Quản trị viên (ADMIN)

Toàn bộ quyền của Technician, bổ sung các tính năng quản trị cao cấp:

### 1. Dashboard & Báo cáo

- **Tổng quan** (`/dashboard`): Biểu đồ tròn phân bố trạng thái thiết bị, thống kê ticket, biểu đồ KPI kỹ thuật viên.
- **Xuất báo cáo snapshot**: Nút xuất ảnh PNG hoặc file PDF toàn bộ giao diện Dashboard.
- **Xuất file Excel / CSV**: Xuất danh sách thiết bị và danh sách ticket ra `.xlsx` hoặc `.csv` (đã kèm BOM UTF-8 mở không lỗi tiếng Việt).
- **Xuất PDF báo cáo KPI**: Nút **"Xuất KPI PDF"** trên Dashboard tạo file PDF bảng tổng hợp KPI của toàn bộ kỹ thuật viên.

### 2. Phân công tự động (Auto-assign) & Cảnh báo quá hạn

- Trong trang **Tickets**, tích chọn các ticket cần phân công → Bấm **"Tự động gán"**: Hệ thống sẽ tự tìm Kỹ thuật viên đang có ít công việc active nhất để gán.
- **Gửi Email Reminder quá hạn**: Bấm nút **"Gửi reminder quá hạn"** trên Dashboard. Hệ thống sẽ lọc các ticket >3 ngày chưa closed và gửi email nhắc nhở qua SMTP đến Kỹ thuật viên phụ trách.
- Các ticket quá hạn >3 ngày cũng sẽ có badge **"Quá hạn"** màu đỏ nổi bật trong bảng Ticket.

### 3. Quản lý Người dùng & Nhật ký Hệ thống (Audit Logs)

- **Quản lý người dùng** (`/admin/users`): Đổi vai trò (USER, TECHNICIAN, ADMIN), vô hiệu hóa (soft-delete), hoặc khôi phục người dùng đã bị xóa. Hỗ trợ nút **"Nhập dữ liệu"** để tải lên hàng loạt danh sách người dùng từ file Excel/CSV.
- **Nhật ký hệ thống** (`/admin/audit-logs`): Ghi lại toàn bộ lịch sử hành động quan trọng (tạo/sửa/xóa ticket, phân công, 2FA, xuất báo cáo, import file...) kèm thời gian, người thực hiện và IP/chi tiết.

### 4. Cài đặt Bảo mật 2 Lớp (2-FA)

- Vào mục **Cài đặt** (`/settings`).
- Bật **Bảo mật hai lớp (2-FA)**: Quét mã QR bằng ứng dụng Authenticator (Google Authenticator, Authy...) và nhập mã 6 chữ số để xác nhận.
- Khi đăng nhập, tài khoản đã bật 2-FA sẽ yêu cầu nhập OTP.

### 5. Trung tâm thông báo & cảnh báo

- **Trung tâm thông báo** (`/dashboard/notifications`): Liệt kê toàn bộ thông báo theo loại (Phân công, Trạng thái, Bình luận, Cảnh báo SLA, Bảo trì, FAQ...), hỗ trợ lọc và phân trang (20 mục/trang).
- **Bộ đếm nhanh**: Đầu trang hiển thị số **thông báo chưa đọc**, **ticket chờ xử lý**, và **FAQ chờ duyệt**.
- **Duyệt FAQ nháp**: Trang Quản lý FAQ hiển thị trạng thái "Chờ duyệt" kèm nút ✓ (duyệt) / ✗ (từ chối). Chỉ bản nháp được duyệt mới xuất hiện trong cẩm nang cho người dùng.
- **Điều chuyển thiết bị**: Trên trang chi tiết thiết bị, dùng dropdown chọn phòng mới để bàn giao thiết bị. Hành động được ghi vào lịch sử thiết bị (RELOCATION) và thông báo cho Tech/Admin.
- **Cảnh báo Slack (tuỳ chọn)**: Nếu cấu hình biến `SLACK_WEBHOOK_URL`, hệ thống sẽ đẩy cảnh báo **SLA quá hạn** và **đến hạn bảo trì định kỳ** sang kênh Slack của đội ngũ.

---

## IV. Ghi chú Bảo mật (Security Fixes)

Các cải tiến bảo mật đã áp dụng trong đợt hardening gần nhất:

1. **Giới hạn dữ liệu user trên Dashboard** (`src/app/actions/dashboard-actions.ts`):
   - Thay vì `include` nguyên object user (bao gồm cả `password` hash, `twoFactorSecret`...), truy vấn `recentTickets` nay dùng `select` chỉ lấy `{ id, name, email }` cho `creator`/`assignee`.
   - Giảm thiểu rủi ro rò rỉ thông tin nhạy cảm qua Server Action payload.

2. **Khóa đăng ký công khai** (`src/app/api/auth/register/route.ts`):
   - Endpoint `POST /api/auth/register` nay **yêu cầu session ADMIN** — người dùng vãng lai không thể tự tạo tài khoản.
   - Hỗ trợ tắt hoàn toàn bằng env `DISABLE_REGISTRATION=true` (return 403 ngay đầu handler).
   - Admin vẫn tạo user qua trang `/admin/users` (Import Excel/CSV) như bình thường.

3. **Rate limiting & validation giữ nguyên**: 5 req/phút theo IP, Zod schema, kiểm tra tên miền `@dlu.edu.vn`.

## V. Environment Variables

| Biến                            | Bắt buộc              | Mô tả                                                                                                            |
| ------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | ✅                    | Chuỗi kết nối PostgreSQL                                                                                         |
| `NEXTAUTH_SECRET`               | ✅                    | Key ký JWT session                                                                                               |
| `NEXTAUTH_URL`                  | ✅                    | Base URL của app (`http://localhost:3000`)                                                                       |
| `SLACK_WEBHOOK_URL`             | ⬜                    | Webhook Slack nhận cảnh báo SLA quá hạn / lịch bảo trì. Bỏ trống = tắt tính năng                                 |
| `CRON_SECRET`                   | ⬜ (khuyến nghị prod) | Bearer token bảo vệ `/api/cron/daily` và `/api/cron/overdue`. Thiếu secret → cron endpoint trả 401 (fail-closed) |
| `DISABLE_REGISTRATION`          | ⬜                    | `"true"` → tắt hoàn toàn API đăng ký công khai                                                                   |
| `GEMINI_API_KEY`                | ⬜                    | Key Gemini cho AI Chatbot                                                                                        |
| `ENCRYPTION_KEY`                | ✅ (khi bật 2FA)      | Key AES-256-GCM mã hóa 2FA secret                                                                                |
| `SMTP_HOST/PORT/USER/PASS/FROM` | ⬜                    | Cấu hình nodemailer gửi email reminder                                                                           |

**Cách dùng cron với `CRON_SECRET`** (crontab trên server):

```bash
0 8 * * 1-5 curl -s -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/overdue
```
