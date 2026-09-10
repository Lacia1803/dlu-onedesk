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

// 1. Notification Bell → Notification Center
test("notification bell opens center and shows stats", async ({ page }) => {
  await login(page, "tech@dlu.edu.vn", "tech");
  // Ensure there is at least one unread notification (create via API if needed)
  const [response] = await Promise.all([
    page.waitForResponse((resp) => resp.url().includes("/api/notifications") && resp.status() === 200),
    page.click("button[aria-label='Thông báo']"), // bell button selector
  ]);
  await response.json();
  // Open center page
  await page.goto("/dashboard/notifications");
  await expect(page.locator("text=Thông báo")).toBeVisible();
  // Verify stat cards exist
  await expect(page.locator("text=Chưa đọc")).toBeVisible();
  await expect(page.locator("text=Ticket chờ xử lý")).toBeVisible();
  await expect(page.locator("text=FAQ chờ duyệt")).toBeVisible();
  // Verify at least one notification row
  await expect(page.locator(".border.rounded.p-3").first()).toBeVisible();
});

// 2. Device Transfer dropdown flow
test("device transfer uses room dropdown", async ({ page }) => {
  await login(page, "tech@dlu.edu.vn", "tech");
  // Go to a device detail page (pick first device)
  await page.goto("/dashboard/devices");
  await page.locator("a[href*='/dashboard/devices/']").first().click();
  // Open transfer modal
  await page.click("text=Điều chuyển thiết bị");
  // Wait for rooms to load
  await page.waitForSelector("select");
  const options = await page.$$eval("select option", (opts) => opts.map((o) => o.textContent));
  // Expect more than one room option (excluding disabled current)
  expect(options.length).toBeGreaterThan(1);
  // Choose a different room
  await page.selectOption("select", { index: 1 }); // select second option
  await page.click("text=Xác nhận bàn giao/điều chuyển");
  // Toast appears
  await expect(page.locator("text=Đã chuyển thiết bị")).toBeVisible();
});

// 3. Ticket Merge flow
test("merge duplicate tickets", async ({ page }) => {
  await login(page, "admin@dlu.edu.vn", "admin");
  // Create two duplicate tickets via UI (quick create)
  await page.goto("/dashboard/tickets/new");
  await page.fill("input[name='title']", "Duplicate Ticket Test");
  await page.fill("textarea[name='description']", "First duplicate");
  await page.selectOption("select[name='category']", "OTHER");
  await page.selectOption("select[name='priority']", "MEDIUM");
  await page.click("text=Gửi báo cáo");
  const firstId = page.url().split("/").pop() || "";

  await page.goto("/dashboard/tickets/new");
  await page.fill("input[name='title']", "Duplicate Ticket Test");
  await page.fill("textarea[name='description']", "Second duplicate");
  await page.selectOption("select[name='category']", "OTHER");
  await page.selectOption("select[name='priority']", "MEDIUM");
  await page.click("text=Gửi báo cáo");
  const secondId = page.url().split("/").pop() || "";

  // Open first ticket detail page
  await page.goto(`/dashboard/tickets/${firstId}`);
  // Open merge dialog and enter second ID
  await page.click("text=Gộp Ticket trùng");
  await page.fill("textarea", secondId);
  await page.click("text=Xác nhận Gộp");
  // Verify success toast
  await expect(page.locator("text=Đã gộp")).toBeVisible();
  // Verify second ticket is closed
  await page.goto(`/dashboard/tickets/${secondId}`);
  await expect(page.locator("text=ĐÓNG")).toBeVisible();
});

// 4. Create FAQ draft from a resolved ticket and approve it
test("faq draft creation and approval", async ({ page }) => {
  await login(page, "tech@dlu.edu.vn", "tech");
  // Create a ticket that will be resolved
  await page.goto("/dashboard/tickets/new");
  await page.fill("input[name='title']", "FAQ Draft Ticket");
  await page.fill("textarea[name='description']", "Issue description");
  await page.selectOption("select[name='category']", "OTHER");
  await page.selectOption("select[name='priority']", "MEDIUM");
  await page.click("text=Gửi báo cáo");
  // Add a technician comment (to be used as solution)
  await page.fill("textarea[name='content']", "Solution steps");
  await page.click("text=Thêm bình luận");
  // Resolve ticket
  await page.selectOption("select[name='status']", "RESOLVED");
  await page.click("text=Cập nhật Ticket");
  // Create FAQ draft
  await page.click("text=Tạo FAQ từ ticket");
  await expect(page.locator("text=Đã tạo bản nháp FAQ")).toBeVisible();

  // Switch to admin to approve
  await login(page, "admin@dlu.edu.vn", "admin");
  await page.goto("/dashboard/faq/manage");
  // Find the draft row (FAQ title matches ticket title)
  const row = page.locator(`text=FAQ Draft Ticket`).first();
  await row.locator("button:has-text('✓')").click();
  await expect(page.locator("text=Đã duyệt FAQ")).toBeVisible();
  // Verify it appears in public FAQ list
  await page.goto("/dashboard/faq");
  await expect(page.locator("text=FAQ Draft Ticket")).toBeVisible();
});
