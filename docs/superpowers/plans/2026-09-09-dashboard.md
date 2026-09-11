# Dashboard & Export Excel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the main dashboard displaying KPIs, Recharts (Pie/Line), role-based views, and a feature to export data to Excel.

**Architecture:** We use Server Actions to fetch dashboard statistics securely. The dashboard page will render different server components (`AdminDashboard` vs `UserDashboard`) based on `session.user.role`. Export Excel will be handled by fetching data and using the `xlsx` library on the client to generate the `.xlsx` file.

**Tech Stack:** Next.js 14, Prisma, Recharts, `xlsx`, Tailwind CSS, Shadcn UI.

**Spec:** `specs/05-dashboard.md` (Note: User specifically requested Export Excel functionality, overriding the "Out of Scope" note in the original spec).

## Global Constraints

- Strict TypeScript.
- Admin/Technician see full system stats; User only sees their own ticket stats.
- Charts must be responsive.

---

### Task 1: Setup & Utilities

**Files:**

- Modify: `package.json`

**Interfaces:**

- Produces: Installed dependencies (`recharts`, `xlsx`).

- [ ] **Step 1: Install packages**

```bash
npm install recharts xlsx
npm install -D @types/recharts
```

_(Note: recharts might already be installed, ensure it is. Install xlsx for Excel export)._

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install recharts and xlsx for dashboard"
```

---

### Task 2: Server Actions for Statistics

**Files:**

- Create: `src/app/actions/dashboard-actions.ts`

**Interfaces:**

- Consumes: Prisma DB.
- Produces: `getAdminStats()`, `getUserStats()`, `getExportData()`.

- [ ] **Step 1: Write getAdminStats**
      Create `src/app/actions/dashboard-actions.ts` (`"use server"`).
      Implement `getAdminStats()`:
- Count total devices, broken devices (status='BROKEN').
- Count total open tickets, unresolved tickets.
- Aggregate devices by status for Pie Chart.
- Fetch 5 most recent tickets.

- [ ] **Step 2: Write getUserStats & getExportData**
      Implement `getUserStats()`:
- Count tickets created by `session.user.id` (Open, In Progress, Resolved).
- Fetch 5 most recent tickets created by user.
  Implement `getExportData()`:
- Fetch all devices and all tickets to export. Check Admin/Tech permission.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/dashboard-actions.ts
git commit -m "feat: add dashboard and export server actions"
```

---

### Task 3: Dashboard UI Components (Charts & Cards)

**Files:**

- Create: `src/components/dashboard/stat-card.tsx`
- Create: `src/components/dashboard/device-pie-chart.tsx`
- Create: `src/components/dashboard/export-button.tsx`

**Interfaces:**

- Consumes: Recharts, `xlsx`, Server Actions.
- Produces: Reusable dashboard widgets.

- [ ] **Step 1: Stat Card**
      Create `src/components/dashboard/stat-card.tsx` using Shadcn `Card`. Props: `title`, `value`, `icon`, `description`.

- [ ] **Step 2: Recharts Component**
      Create `src/components/dashboard/device-pie-chart.tsx` (Client component) using `PieChart`, `Pie`, `Cell`, `Tooltip`, `ResponsiveContainer` from `recharts`.

- [ ] **Step 3: Export Button**
      Create `src/components/dashboard/export-button.tsx` (Client component).
      On click: Call `getExportData()`, format data into arrays, use `xlsx.utils.book_new()`, `xlsx.utils.json_to_sheet()`, and `xlsx.writeFile()` to trigger browser download of `dlu-onedesk-report.xlsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/
git commit -m "feat: add dashboard charts and export components"
```

---

### Task 4: Role-based Dashboard Pages

**Files:**

- Create: `src/components/dashboard/admin-dashboard.tsx`
- Create: `src/components/dashboard/user-dashboard.tsx`
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

**Interfaces:**

- Consumes: UI Components, Stats Actions.
- Produces: The complete dashboard view.

- [ ] **Step 1: User Dashboard**
      Create `src/components/dashboard/user-dashboard.tsx` (Server component). Await `getUserStats()`. Render 3 StatCards and a small table of recent tickets.

- [ ] **Step 2: Admin Dashboard**
      Create `src/components/dashboard/admin-dashboard.tsx` (Server component). Await `getAdminStats()`. Render 4 StatCards, the `DevicePieChart`, `ExportButton`, and recent tickets list.

- [ ] **Step 3: Assemble Main Page**
      Update `src/app/(dashboard)/dashboard/page.tsx`. Check `session.user.role`. If USER, render `<UserDashboard />`. Else render `<AdminDashboard />`.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/admin-dashboard.tsx src/components/dashboard/user-dashboard.tsx src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: implement role-based dashboard views"
```
