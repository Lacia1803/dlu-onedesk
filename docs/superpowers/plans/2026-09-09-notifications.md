# Live Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a notification system (bell icon) with background polling to notify users of ticket updates without refreshing the page.

**Architecture:**

- Backend: A simple utility function to insert `Notification` records. We'll hook this into existing Server Actions in `ticket-actions.ts`.
- Frontend: A `NotificationBell` Client Component mounted in the `Header`. It polls an API endpoint (or calls a Server Action) every 30 seconds to fetch unread notifications. Clicking a notification marks it as read and navigates to the ticket.

**Tech Stack:** Next.js 14, Prisma, PostgreSQL, Shadcn UI (DropdownMenu, Badge), `lucide-react`.

**Spec:** `specs/07-notifications.md`

## Global Constraints

- Strict TypeScript.
- Notifications are private (users only fetch notifications where `userId === session.user.id`).
- Polling interval: 15-30s.

---

### Task 1: Server Actions for Notifications

**Files:**

- Create: `src/app/actions/notification-actions.ts`

**Interfaces:**

- Produces: `getUnreadNotifications()`, `markAsRead(id)`, `markAllAsRead()`.

- [ ] **Step 1: Write Fetch Actions**
      Create `src/app/actions/notification-actions.ts` (`"use server"`).
- `getUnreadNotifications()`: Fetch notifications where `userId = session.user.id` and `isRead = false`, order by `createdAt` desc.

- [ ] **Step 2: Write Mutation Actions**
- `markAsRead(id)`: Update notification `isRead = true`.
- `markAllAsRead()`: Update all notifications for current user to `isRead = true`.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/notification-actions.ts
git commit -m "feat: add notification server actions"
```

---

### Task 2: Utility for Triggering Notifications

**Files:**

- Create: `src/lib/notifications.ts`
- Modify: `src/app/actions/ticket-actions.ts`

**Interfaces:**

- Consumes: DB context.
- Produces: `notifyUsers(userIds, title, message, linkUrl)`, `notifyAdminsAndTechs(title, message, linkUrl)`.

- [ ] **Step 1: Write Utility Functions**
      Create `src/lib/notifications.ts`.
- `notifyUsers(userIds: string[], title, message, linkUrl)`: `db.notification.createMany`.
- `notifyAdminsAndTechs(...)`: Fetch all users where role in `[ADMIN, TECHNICIAN]`, then `notifyUsers()`.

- [ ] **Step 2: Hook into Ticket Actions**
      In `src/app/actions/ticket-actions.ts`:
- On `createTicket`: call `notifyAdminsAndTechs("Ticket mới", ...)`
- On `addTicketComment`: call `notifyUsers` (notify creator if commented by tech, notify assignee if commented by user/creator).
- On `updateTicket`:
  - If assignee changed, notify new assignee.
  - If status changed, notify creator.

- [ ] **Step 3: Commit**

```bash
git add src/lib/notifications.ts src/app/actions/ticket-actions.ts
git commit -m "feat: integrate notification triggers into tickets"
```

---

### Task 3: Notification Bell UI

**Files:**

- Create: `src/components/layout/notification-bell.tsx`
- Modify: `src/components/layout/header.tsx`

**Interfaces:**

- Consumes: Notification Server Actions, Shadcn Dropdown/Popover.
- Produces: Bell icon with unread count badge, dropdown list of notifications.

- [ ] **Step 1: Create Bell Component**
      Create `src/components/layout/notification-bell.tsx` (Client component).
- Use `useEffect` with `setInterval` (e.g., 15000ms) to call `getUnreadNotifications()` and update state.
- Render a Bell icon. If `unreadCount > 0`, show a red absolute positioned dot/badge with the count.
- Wrap in `DropdownMenu`. `DropdownMenuContent` displays up to 10 unread notifications.
- Include a "Đánh dấu tất cả đã đọc" button calling `markAllAsRead()`.
- Clicking a notification calls `markAsRead(id)`, closes dropdown, and `router.push(linkUrl)`.

- [ ] **Step 2: Mount in Header**
      In `src/components/layout/header.tsx`, import and render `<NotificationBell />` next to the User avatar dropdown.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/notification-bell.tsx src/components/layout/header.tsx
git commit -m "feat: add notification bell UI and polling"
```
