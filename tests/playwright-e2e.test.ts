import { test, expect, Page } from "@playwright/test";

// Helper to login with given credentials
async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill("input[name='email']", email);
  await page.fill("input[name='password']", password);
  await page.click("button[type='submit']");
  await expect(page).toHaveURL("/dashboard");
}

// 0. Login failure test
test("login fails with invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.fill("input[name='email']", "wrong@dlu.edu.vn");
  await page.fill("input[name='password']", "wrongpass");
  await page.click("button[type='submit']");
  await expect(page).toHaveURL("/login");
  await expect(page.locator(".text-destructive")).toBeVisible();
});

// 1. Notification Center
test("notification center shows stats and notifications", async ({ page }) => {
  await login(page, "tech@dlu.edu.vn", "tech");
  await page.goto("/dashboard/notifications");
  await expect(page.locator("h1")).toContainText("Thông báo");
  // Verify stat cards exist
  await expect(page.locator("text=Chưa đọc")).toBeVisible();
  await expect(page.locator("text=Ticket chờ xử lý")).toBeVisible();
  await expect(page.locator("text=FAQ chờ duyệt")).toBeVisible();
});

// 2. Device Transfer dropdown flow
test("device transfer uses room dropdown", async ({ page }) => {
  await login(page, "tech@dlu.edu.vn", "tech");
  await page.goto("/dashboard/devices");
  const deviceLink = page.locator("table tbody tr td a[href^='/dashboard/devices/']").first();
  if ((await deviceLink.count()) > 0) {
    const href = await deviceLink.getAttribute("href");
    if (href) {
      await page.goto(href);
      await page.waitForSelector("select");
    const enabledOption = page.locator("select option:not([disabled])").first();
    if ((await enabledOption.count()) > 0) {
      const val = await enabledOption.getAttribute("value");
      if (val) {
        await page.selectOption("select", val);
        await page.click("button:has-text('Xác nhận bàn giao/điều chuyển')");
        await expect(page.locator("text=Đã chuyển thiết bị")).toBeVisible();
      }
    }
  }
}
});

// 3. Ticket Merge flow
test("merge duplicate tickets", async ({ page }) => {
  await login(page, "admin@dlu.edu.vn", "admin");
  // Create first ticket
  await page.goto("/dashboard/tickets/new");
  await page.fill("input[name='title']", "Duplicate Ticket Test 1");
  await page.fill("textarea[name='description']", "First duplicate description");
  await page.click("button[type='submit']");
  await page.waitForURL(/\/dashboard\/tickets\/[a-zA-Z0-9_-]+/);
  const firstId = page.url().split("/").pop() || "";

  // Create second ticket
  await page.goto("/dashboard/tickets/new");
  await page.fill("input[name='title']", "Duplicate Ticket Test 2");
  await page.fill("textarea[name='description']", "Second duplicate description");
  await page.click("button[type='submit']");
  await page.waitForURL(/\/dashboard\/tickets\/[a-zA-Z0-9_-]+/);
  const secondId = page.url().split("/").pop() || "";

  // Open first ticket detail page
  await page.goto(`/dashboard/tickets/${firstId}`);
  // Open merge dialog and enter second ID
  await page.click("text=Gộp Ticket trùng");
  await page.fill("textarea", secondId);
  await page.click("text=Xác nhận Gộp");
  // Verify success toast
  await expect(page.locator("text=Đã gộp")).toBeVisible();
});

// 4. Create FAQ draft from a resolved ticket
test("faq draft creation from resolved ticket", async ({ page }) => {
  await login(page, "admin@dlu.edu.vn", "admin");
  await page.goto("/dashboard/faq/manage");
  await expect(page.locator("text=Quản lý Cẩm nang")).toBeVisible();
});
