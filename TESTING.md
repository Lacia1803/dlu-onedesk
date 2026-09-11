# Manual Testing Guide – DLU OneDesk

## Overview
This document describes a **step‑by‑step manual test plan** covering every user‑facing feature, including the newly added enhancements. Follow the checklist on a local development server (`npm run dev`) **or** a deployed instance. All actions should be performed with three roles:

- **USER** – normal staff submitting tickets.
- **TECHNICIAN** – support staff handling tickets, devices, and FAQ drafts.
- **ADMIN** – manager with full permissions (approve FAQ, configure Slack, etc.).

The guide assumes you have a fresh dev database (run `npx prisma db push` after pulling the repo). Use the default credentials created by `seed-admin.js`:

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@dlu.edu.vn | admin |
| TECHNICIAN | tech@dlu.edu.vn | tech |
| USER | user@dlu.edu.vn | user |

---

## 1. Notification Center (All roles)
### 1.1 Verify bell icon & unread count
1. Log in as **TECHNICIAN**.
2. Observe the bell in the sidebar – a red dot should appear if there are unread notifications.
3. Click the bell – you should land on **/dashboard/notifications**.
4. Verify the header shows three stat cards: **Chưa đọc**, **Ticket chờ xử lý**, **FAQ chờ duyệt**.
5. Ensure the numbers match the counts in the database (`SELECT COUNT(*) FROM notification WHERE isRead = false AND userId = <techId>` etc.).

### 1.2 Pagination & filtering
1. In the notifications page, switch the filter to **"SLA_WARNING"**. At least one notification should appear (the cron‑daily job creates an SLA warning if a ticket is near deadline).
2. If there are more than 20 items, use **Trang trước / Trang sau** buttons to navigate. Verify the page number updates correctly.
3. Click **"Đánh dấu tất cả đã đọc"** – all notifications should disappear from the list and the red dot on the bell must vanish.
4. Refresh the page – the list should be empty.

### 1.3 Delete individual notification
1. Trigger a new notification (e.g., create a ticket → assign to the tech). A new entry appears.
2. Click the **✕** button on that row – a toast *"Đã xóa thông báo"* appears and the row disappears.
3. Verify the DB record is deleted (`SELECT * FROM notification WHERE id = '<removed-id>'`).

---

## 2. Device Transfer (ADMIN / TECHNICIAN)
### 2.1 Open device detail page
1. Log in as **TECHNICIAN**.
2. Navigate to **Thiết bị → Danh sách** and click a device.
3. Confirm the **DeviceTransferModal** is visible with a **dropdown** of rooms (the current room is disabled).

### 2.2 Transfer device
1. Choose a different room from the dropdown and click **"Xác nhận bàn giao/điều chuyển"**.
2. A toast *"Đã chuyển thiết bị"* should appear and the page reloads.
3. Verify the device’s `roomId` changed in the DB and a new `DeviceHistory` entry of type `RELOCATION` exists.
4. Ensure a notification is sent to Admin/Tech (type **GENERAL**) and appears in the Notification Center.

### 2.3 Rate‑limit test
1. Rapidly repeat the transfer action more than **10 times within a minute**.
2. After the 10th request the API should return **429** and a toast *"Quá nhiều yêu cầu, vui lòng chờ"*.

---

## 3. Ticket Merge (ADMIN / TECHNICIAN)
### 3.1 Prepare duplicate tickets
1. As **USER**, create three tickets with the same title (e.g., *"Màn hình không hiển thị"*).
2. As **TECHNICIAN**, open the **first ticket** (the intended target).
3. Click **"Gộp Ticket trùng"** (MergeTicketDialog) and input the IDs of the other two tickets (comma‑separated).

### 3.2 Execute merge
1. Click **"Xác nhận Gộp"**.
2. Verify:
   - The two duplicate tickets are now **CLOSED** with an internal note indicating they were merged.
   - A comment is added to the target ticket summarising the merge.
   - The original creators of the duplicates receive a notification (type **TICKET_STATUS**).
   - An audit log entry `TICKET_MERGE` exists.
3. Attempt another merge with the same IDs – the API should return an error because the tickets are already closed.

### 3.3 Rate‑limit test
1. Repeat the merge operation rapidly (more than 10 times within a minute).
2. After the limit is hit the API returns **429** and a toast *"Quá nhiều yêu cầu gộp ticket, vui lòng chờ 1 phút."*.

---

## 4. FAQ Draft from Ticket (ADMIN / TECHNICIAN)
### 4.1 Create FAQ draft
1. As **TECHNICIAN**, open a **RESOLVED** or **CLOSED** ticket that has a technician comment.
2. Click **"Tạo FAQ từ ticket"**.
3. Verify the action returns **success** and a new FAQ record with `isActive = false` is created.
4. An admin receives a Slack alert (if `SLACK_WEBHOOK_URL` set) *"FAQ chờ duyệt"* and an in‑app notification.

### 4.2 Approve / reject FAQ draft (ADMIN)
1. Log in as **ADMIN** and navigate to **Quản lý Cẩm nang FAQ**.
2. The draft appears with status **Ẩn**.
3. Click the **✓** button – the FAQ becomes **Hiện** and a toast *"Đã duyệt FAQ"* appears.
4. Verify the FAQ is now visible in the public FAQ list (`/dashboard/faq`).
5. Repeat and click **✗** to reject – the FAQ remains hidden, and a toast *"Đã từ chối FAQ"* appears.

---

## 5. Slack Alerts (Optional – requires `SLACK_WEBHOOK_URL`)
1. Set `SLACK_WEBHOOK_URL` in `.env` to a valid Slack Incoming Webhook URL.
2. Trigger a **SLA quá hạn** scenario (create a ticket with **URGENT** priority and manually set the `slaDeadline` to a past date via DB).
3. Run the daily cron (`curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily`).
4. Verify a message appears in the designated Slack channel with the expected format.
5. Similarly, create a maintenance plan that is due today and run the cron – a **Bảo trì định kỳ** Slack alert should be posted.

---

## 6. Rate‑Limit on Sensitive Endpoints (General)
| Endpoint | Limit | Expected response after limit exceeded |
|----------|-------|----------------------------------------|
| `POST /api/devices/transfer` | 10/min/user | **429** – *"Quá nhiều yêu cầu, vui lòng chờ"* |
| `POST /api/ticket-merge` (via action) | 10/min/user | **429** – *"Quá nhiều yêu cầu gộp ticket, vui lòng chờ 1 phút."* |
| `POST /api/faq/draft` (createFaqDraftFromTicket) | 10/min/user | **429** – *"Quá nhiều yêu cầu tạo FAQ, vui lòng chờ 1 phút."* |

Test each by sending rapid consecutive requests (e.g., using a script or Postman collection) and confirming the limit response.

---

## 7. UI Polish Checks (Visual QA)
- Verify all notification type labels are displayed in **Vietnamese** (Phân công, Trạng thái, …) and tooltips show the description.
- Ensure the **Toast** appears on every action (mark‑all‑read, delete, transfer, merge, FAQ draft, approve/reject).
- Confirm that the **stat cards** on the Notification Center reflect the correct numbers.
- Check that the **DeviceTransferModal** uses a `<select>` dropdown with the current room disabled.
- Validate that the **Pagination** controls are disabled appropriately on first/last pages.
- Test on mobile viewport (responsive) – the notification list should still be scrollable.

---

## 8. Documentation Sync
1. Commit `TESTING.md` to the repository.
2. Update `docs/HuongDan.md`:
   - Add a section **“Trung tâm thông báo & cảnh báo”** linking to the new Notification Center.
   - Mention the **Slack webhook** configuration.
   - Reference the **Device Transfer** dropdown and cache behavior.
   - Add the **FAQ draft** workflow description.
3. Update `context/progress.md` to mark *Notification center stats* and *Tests + docs* as completed.
4. Ensure the README lists the new environment variable `SLACK_WEBHOOK_URL`.

---

## 9. Acceptance Checklist
- [ ] All manual test steps pass on a clean DB.
- [ ] No console errors in the browser.
- [ ] Unit tests (`npm test`) still pass (17/17).
- [ ] Build succeeds (`npm run build`).
- [ ] Documentation files (`TESTING.md`, updated `HuongDan.md`, `DEPLOY.md`) are committed.
- [ ] Progress file updated.

**When every checklist item is ticked, the project is ready for production deployment.**
