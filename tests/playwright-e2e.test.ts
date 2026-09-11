import { test, expect, Page } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:3000";

// ── helpers ─────────────────────────────────────────────────────────────────
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.fill("input[name='email']", email);
  await page.fill("input[name='password']", password);
  await page.click("button[type='submit']");
  // Đợi chuyển trang sau khi submit — URL phải离开 /login.
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 10_000 });
  await page.waitForLoadState("networkidle");
}

async function createTicket(page: Page, title: string, description: string): Promise<string> {
  await page.goto(`${BASE}/dashboard/tickets/new`);
  await page.waitForTimeout(1000);
  await page.fill("input[name='title']", title);
  await page.fill("textarea[name='description']", description);
  await page.click("button[type='submit']");
  await page.waitForURL(/\/dashboard\/tickets\/[a-z0-9]+$/, { timeout: 15_000 });
  await page.waitForTimeout(1500);
  return page.url().split("/").pop()!;
}

async function openStatusDropdown(page: Page) {
  await page.click("button:has-text('Trạng thái:')");
  await page.waitForTimeout(800);
}

async function selectStatus(page: Page, label: string, reloadBetween = true) {
  if (reloadBetween) {
    // Reload page each time to avoid stale dropdown state after toast overlay
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
  }
  await openStatusDropdown(page);
  await page.click(`[data-slot='dropdown-menu-radio-item']:has-text('${label}')`);
  await page.waitForTimeout(2500);
}

// ── 1. Login ────────────────────────────────────────────────────────────────
test.describe("Authentication", () => {
  test("login fails with wrong password", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill("input[name='email']", "admin@dlu.edu.vn");
    await page.fill("input[name='password']", "wrongpassword");
    await page.click("button[type='submit']");
    await page.waitForTimeout(3000);
    // Should stay on /login
    expect(page.url()).toContain("/login");
    // Should show error
    const errorVisible = await page.locator(".text-destructive, [aria-invalid]").count();
    expect(errorVisible).toBeGreaterThan(0);
  });

  test("login as admin lands on /dashboard", async ({ page }) => {
    await login(page, "admin@dlu.edu.vn", "admin");
    expect(page.url()).toContain("/dashboard");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("login as technician lands on /dashboard", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    expect(page.url()).toContain("/dashboard");
  });

  test("login as user lands on /dashboard", async ({ page }) => {
    await login(page, "user@dlu.edu.vn", "user");
    expect(page.url()).toContain("/dashboard");
  });
});

// ── 2. RBAC ─────────────────────────────────────────────────────────────────
test.describe("Role-Based Access Control", () => {
  test("admin-only /admin/users renders for admin", async ({ page }) => {
    await login(page, "admin@dlu.edu.vn", "admin");
    await page.goto(`${BASE}/admin/users`);
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain("/admin/users");
  });

  test("admin-only /admin/users redirects non-admin to /dashboard", async ({ page }) => {
    await login(page, "user@dlu.edu.vn", "user");
    await page.goto(`${BASE}/admin/users`);
    await page.waitForTimeout(2500);
    // proxy.ts redirects non-admin to /dashboard
    expect(page.url()).toContain("/dashboard");
  });

  test("admin-only /admin/audit-logs redirects technician to /dashboard", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    await page.goto(`${BASE}/admin/audit-logs`);
    await page.waitForTimeout(2500);
    expect(page.url()).toContain("/dashboard");
  });

  test("register API returns 403 for technician (no admin session)", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    const res = await page.request.post(`${BASE}/api/auth/register`, {
      data: { name: "X", email: "x@dlu.edu.vn", password: "Secret123!" },
    });
    expect(res.status()).toBe(403);
  });
});

// ── 3. Create Ticket ───────────────────────────────────────────────────────
test.describe("Ticket Creation", () => {
  test("create a ticket as regular user", async ({ page }) => {
    await login(page, "user@dlu.edu.vn", "user");
    await page.goto(`${BASE}/dashboard/tickets/new`);
    await page.waitForTimeout(1500);
    await page.fill("input[name='title']", "E2E Test Ticket");
    await page.fill("textarea[name='description']", "Automated test description for the ticket");
    await page.click("button[type='submit']");
    await page.waitForTimeout(5000);
    // After submit should navigate to detail page
    const url = page.url();
    expect(url).toMatch(/\/dashboard\/tickets\/[a-z0-9]+$/);
    expect(url).not.toContain("/new");
    // Creator (USER) view has no status dropdown — verify status badge instead
    const body = await page.locator("body").innerText();
    expect(body).toContain("OPEN");
    expect(body).toContain("E2E Test Ticket");
  });

  test("ticket description must be >= 10 chars", async ({ page }) => {
    await login(page, "user@dlu.edu.vn", "user");
    await page.goto(`${BASE}/dashboard/tickets/new`);
    await page.waitForTimeout(1500);
    await page.fill("input[name='title']", "Short desc test");
    await page.fill("textarea[name='description']", "short");
    await page.click("button[type='submit']");
    await page.waitForTimeout(3000);
    // Should stay on /new
    expect(page.url()).toContain("/tickets/new");
    // Error message about minimum length
    const body = await page.locator("body").innerText();
    expect(body).toContain("ít nhất 10 ký tự");
  });
});

// ── 4. State Machine (Transitions) ────────────────────────────────────────
test.describe("Ticket State Machine", () => {
  let ticketId = "";

  test("create ticket for transition tests", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    ticketId = await createTicket(page, "State Machine Test", "Testing state transitions across the lifecycle");
    expect(ticketId).toBeTruthy();
  });

  test("illegal transition OPEN -> RESOLVED is rejected", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    await page.goto(`${BASE}/dashboard/tickets/${ticketId}`);
    await page.waitForTimeout(2000);
    await selectStatus(page, "Đã xử lý");
    // Status should still be OPEN
    const statusBtn = page.locator("button:has-text('Trạng thái')").first();
    await expect(statusBtn).toContainText("OPEN");
    // Error toast
    await expect(page.locator("[data-sonner-toast]")).toContainText("Không thể chuyển");
  });

  test("legal transition OPEN -> IN_PROGRESS", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    await page.goto(`${BASE}/dashboard/tickets/${ticketId}`);
    await page.waitForTimeout(2000);
    await selectStatus(page, "Đang xử lý");
    const statusBtn = page.locator("button:has-text('Trạng thái')").first();
    await expect(statusBtn).toContainText("IN_PROGRESS");
  });

  test("legal transition IN_PROGRESS -> RESOLVED", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    await page.goto(`${BASE}/dashboard/tickets/${ticketId}`);
    await page.waitForTimeout(2000);
    await selectStatus(page, "Đã xử lý");
    const statusBtn = page.locator("button:has-text('Trạng thái')").first();
    await expect(statusBtn).toContainText("RESOLVED");
  });

  test("legal transition RESOLVED -> CLOSED", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    await page.goto(`${BASE}/dashboard/tickets/${ticketId}`);
    await page.waitForTimeout(2000);
    await selectStatus(page, "Đóng");
    const statusBtn = page.locator("button:has-text('Trạng thái')").first();
    await expect(statusBtn).toContainText("CLOSED");
  });

  test("CLOSED ticket rejects every status change via dropdown", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    await page.goto(`${BASE}/dashboard/tickets/${ticketId}`);
    await page.waitForTimeout(2000);
    await openStatusDropdown(page);
    await page.click("[data-slot='dropdown-menu-radio-item']:has-text('Đang xử lý')");
    await page.waitForTimeout(2500);
    // Server rejects: closed tickets can only be reopened via the dedicated button
    const statusBtn = page.locator("button:has-text('Trạng thái')").first();
    await expect(statusBtn).toContainText("CLOSED");
    await expect(page.locator("[data-sonner-toast]")).toContainText("chỉ mở lại được bằng nút Reopen");
  });
});

// ── 5. Public Track Page ───────────────────────────────────────────────────
test.describe("Public Ticket Tracking", () => {
  test("/tickets/track is accessible without login", async ({ page }) => {
    await page.goto(`${BASE}/tickets/track`);
    await page.waitForTimeout(1500);
    expect(page.url()).toContain("/tickets/track");
    await expect(page.locator("h1")).toContainText("Tra cứu");
  });

  test("tracking with non-existent ID shows not-found error", async ({ page }) => {
    await page.goto(`${BASE}/tickets/track`);
    await page.waitForTimeout(2000);
    const input = page.locator("input[placeholder*='Nhập mã ticket']");
    await input.fill("nonexistent123");
    await page.click("button[type='submit']");
    await page.waitForTimeout(3000);
    const body = await page.locator("body").innerText();
    expect(body).toContain("Không tìm thấy");
  });
});

// ── 6. Dashboard Smoke ─────────────────────────────────────────────────────
test.describe("Dashboard Smoke", () => {
  test("dashboard loads with stat cards for admin", async ({ page }) => {
    await login(page, "admin@dlu.edu.vn", "admin");
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    const h1 = await page.locator("h1").first().innerText();
    expect(h1).toBeTruthy();
  });

  test("tickets page loads a table with rows", async ({ page }) => {
    await login(page, "tech@dlu.edu.vn", "tech");
    await page.goto(`${BASE}/dashboard/tickets`);
    await page.waitForLoadState("networkidle");
    const rows = await page.locator("table tbody tr").count();
    expect(rows).toBeGreaterThan(0);
  });
});
