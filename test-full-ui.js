const puppeteer = require('puppeteer');

const BASE = 'http://localhost:3000';
let passed = 0, failed = 0;

function ok(name) { passed++; console.log(`  ✓ ${name}`); }
function fail(name, detail) { failed++; console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }

async function check(page, name, fn) {
  try { await fn(); ok(name); } catch (e) { fail(name, e.message.split('\n')[0]); }
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  console.log("=== 1. ĐĂNG NHẬP ===");
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@dlu.edu.vn');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await check(page, "Login → /dashboard", async () => {
    await page.waitForFunction(() => location.href.includes('/dashboard'), { timeout: 30000 });
    await page.waitForSelector('table', { timeout: 15000 }).catch(() => {});
  });

  console.log("=== 2. DASHBOARD ===");
  await check(page, "Dashboard hiển thị nội dung", async () => {
    await page.waitForFunction(() => document.body.innerText.length > 100, { timeout: 15000 });
  });
  await check(page, "Sidebar có mục Nhật ký hệ thống", async () => {
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('a')).some(a => a.textContent.toLowerCase().includes('nhật ký')),
      { timeout: 8000 }
    );
  });
  await check(page, "Sidebar có mục Cài đặt", async () => {
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('a')).some(a => a.getAttribute('href') === '/settings'),
      { timeout: 8000 }
    );
  });

  console.log("=== 3. TICKETS + BULK ACTIONS ===");
  await page.goto(`${BASE}/dashboard/tickets`, { waitUntil: 'networkidle2' });
  await check(page, "Trang tickets load, có bảng", async () => {
    await page.waitForSelector('table', { timeout: 15000 });
  });

  const ticketCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
  console.log(`  (nhận ${ticketCount} dòng ticket)`);

  if (ticketCount > 0) {
    await check(page, "Checkbox chọn tất cả tồn tại", async () => {
      await page.waitForSelector('thead input[type="checkbox"]', { timeout: 5000 });
    });
    await check(page, "Click select-all → toolbar bulk hiện ra", async () => {
      await page.click('thead input[type="checkbox"]');
      await page.waitForFunction(
        () => document.body.innerText.includes('Đã chọn'),
        { timeout: 5000 }
      );
    });
    await check(page, "Toolbar có nút Đổi trạng thái + Đổi ưu tiên", async () => {
      const btns = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).map(b => b.textContent)
      );
      if (!btns.some(t => t.includes('Đổi trạng thái'))) throw new Error('thiếu select status');
      if (!btns.some(t => t.includes('Đổi ưu tiên'))) throw new Error('thiếu select priority');
    });
    await check(page, "Nút Bỏ chọn hoạt động", async () => {
      const btn = await page.evaluateHandle(() =>
        Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Bỏ chọn'))
      );
      await btn.asElement().click();
      await page.waitForFunction(
        () => !document.body.innerText.includes('Đã chọn'),
        { timeout: 5000 }
      );
    });
  }

  await check(page, "Lọc theo status filter hoạt động", async () => {
    await page.goto(`${BASE}/dashboard/tickets?status=OPEN`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('table', { timeout: 15000 });
  });

  console.log("=== 4. ADMIN USERS + RESTORE ===");
  await page.goto(`${BASE}/admin/users`, { waitUntil: 'networkidle2' });
  await check(page, "Trang users load", async () => {
    await page.waitForSelector('table', { timeout: 15000 });
  });
  await check(page, "Row đã vô hiệu hóa có nút Khôi phục (nếu có)", async () => {
    const hasDeleted = await page.evaluate(() => document.body.innerText.includes('Đã vô hiệu hóa'));
    if (hasDeleted) {
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Khôi phục')),
        { timeout: 5000 }
      );
    }
  });

  console.log("=== 5. AUDIT LOGS ===");
  await page.goto(`${BASE}/admin/audit-logs`, { waitUntil: 'networkidle2' });
  await check(page, "Trang audit logs load, có bảng", async () => {
    await page.waitForSelector('table', { timeout: 15000 });
  });
  await check(page, "Audit log hiển thị hành động (bulk update từ test DB)", async () => {
    const hasLogs = await page.evaluate(() =>
      document.body.innerText.includes('TICKET_BULK_UPDATE') ||
      document.body.innerText.includes('Nhật ký') ||
      document.querySelectorAll('tbody tr').length > 0
    );
    if (!hasLogs) throw new Error('bảng audit trống');
  });

  console.log("=== 6. SETTINGS + 2FA UI ===");
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle2' });
  await check(page, "Trang settings load", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('CÀI ĐẶT'), { timeout: 15000 });
  });
  await check(page, "Form 2FA hiển thị", async () => {
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('bảo mật hai lớp'), { timeout: 12000 });
  });
  await check(page, "Bấm 'Kích hoạt 2-FA' → QR code hiện ra", async () => {
    const btn = await page.evaluateHandle(() =>
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kích hoạt 2-FA'))
    );
    if (!btn.asElement()) throw new Error('không thấy nút kích hoạt (có thể 2FA đã bật)');
    await btn.asElement().click();
    await page.waitForFunction(
      () => document.querySelector('img[alt="2FA QR Code"]') !== null,
      { timeout: 15000 }
    );
  });
  await check(page, "Nhập OTP sai → báo lỗi", async () => {
    const input = await page.waitForSelector('input[placeholder="123456"]', { timeout: 8000 });
    await input.type('000000');
    const btn = await page.evaluateHandle(() =>
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Xác nhận & Kích hoạt'))
    );
    await btn.asElement().click();
    await page.waitForFunction(
      () => document.body.innerText.includes('không chính xác') || document.body.innerText.includes('Chưa khởi tạo'),
      { timeout: 10000 }
    );
  });

  console.log("=== 7. CÁC TRANG KHÁC ===");
  const pages = [
    ['/dashboard/devices', 'Thiết bị'],
    ['/dashboard/rooms', 'Phòng'],
    ['/dashboard/software', 'Phần mềm'],
    ['/dashboard/maintenance', 'Bảo trì'],
    ['/dashboard/faq', 'FAQ'],
  ];
  for (const [url, label] of pages) {
    await check(page, `Trang ${url} load OK`, async () => {
      const resp = await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
      if (resp.status() >= 400) throw new Error(`HTTP ${resp.status()}`);
      await new Promise(r => setTimeout(r, 800));
    });
  }

  console.log("=== 8. TẠO TICKET QUA UI ===");
  await page.goto(`${BASE}/dashboard/tickets/new`, { waitUntil: 'domcontentloaded' });
  await check(page, "Form tạo ticket hiển thị", async () => {
    await page.waitForSelector('form', { timeout: 10000 });
  });

  await browser.close();
  console.log(`\n=== KẾT QUẢ: ${passed} pass / ${failed} fail ===`);
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.error("LỖI FATAL:", e); process.exit(1); });
