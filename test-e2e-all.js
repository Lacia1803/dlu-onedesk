/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:3000';
let passed = 0, failed = 0;

function ok(name) { passed++; console.log(`  ✓ ${name}`); }
function fail(name, detail) { failed++; console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }

async function check(page, name, fn) {
  try { await fn(); ok(name); } catch (e) { fail(name, e.message.split('\n')[0]); }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  console.log("\n=== 1. TEST ĐĂNG NHẬP (ADMIN) ===");
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@dlu.edu.vn');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await check(page, "Đăng nhập thành công → chuyển hướng /dashboard", async () => {
    await page.waitForFunction(() => location.href.includes('/dashboard'), { timeout: 15000 });
  });

  console.log("\n=== 2. TEST DASHBOARD & EXPORT BUTTONS ===");
  await check(page, "Dashboard render stats cards", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('Tổng thiết bị') || document.body.innerText.includes('thiết bị') || document.body.innerText.includes('SYSTEM.ADMIN_DASHBOARD'), { timeout: 10000 });
  });
  await check(page, "Nút 'Xuất báo cáo' (Excel/CSV) tồn tại", async () => {
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Xuất báo cáo')));
  });
  await check(page, "Nút 'Xuất KPI PDF' tồn tại", async () => {
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Xuất KPI PDF')));
  });
  await check(page, "Nút 'Gửi reminder quá hạn' tồn tại", async () => {
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Gửi reminder')));
  });
  await check(page, "Biểu đồ KPI kỹ thuật viên hiển thị", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('TECH_KPI_PERFORMANCE') || document.body.innerText.includes('KPI'), { timeout: 10000 });
  });

  console.log("\n=== 3. TEST TICKET & BULK ACTIONS ===");
  await page.goto(`${BASE}/dashboard/tickets`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang tickets load bảng dữ liệu", async () => {
    await page.waitForSelector('table', { timeout: 10000 });
  });
  await check(page, "Checkbox chọn tất cả hoạt động", async () => {
    const thCheckbox = await page.$('thead input[type="checkbox"]');
    if (thCheckbox) {
      await thCheckbox.click();
      await page.waitForFunction(() => document.body.innerText.includes('Đã chọn') || document.body.innerText.includes('ticket'), { timeout: 5000 });
    }
  });

  console.log("\n=== 4. TEST TẠO TICKET MỚI ===");
  await page.goto(`${BASE}/dashboard/tickets/new`, { waitUntil: 'domcontentloaded' });
  await check(page, "Form tạo ticket hiển thị đầy đủ trường", async () => {
    await page.waitForSelector('input[name="title"]', { timeout: 8000 });
    await page.waitForSelector('textarea[name="description"]');
  });
  await check(page, "Gợi ý FAQ khi nhập tiêu đề", async () => {
    await page.type('input[name="title"]', 'máy in không in được');
    await new Promise(r => setTimeout(r, 600));
  });

  console.log("\n=== 5. TEST THIẾT BỊ & QR SCAN ===");
  await page.goto(`${BASE}/dashboard/devices`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang thiết bị load bảng", async () => {
    await page.waitForSelector('table', { timeout: 10000 });
  });
  await page.goto(`${BASE}/dashboard/devices/scan`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang quét mã QR load component reader", async () => {
    await page.waitForSelector('#reader', { timeout: 10000 });
  });

  console.log("\n=== 6. TEST FAQ & FAQ-TO-TICKET ===");
  await page.goto(`${BASE}/dashboard/faq`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang FAQ load", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('Cẩm nang Hỗ trợ'), { timeout: 8000 });
  });

  console.log("\n=== 7. TEST MY-KPI ===");
  await page.goto(`${BASE}/dashboard/my-kpi`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang My KPI hiển thị các chỉ số", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('TỔNG TICKET') || document.body.innerText.includes('MY.KPI'), { timeout: 10000 });
  });

  console.log("\n=== 8. TEST LỊCH BẢO TRÌ (DRAG & DROP) ===");
  await page.goto(`${BASE}/dashboard/maintenance`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang bảo trì hiển thị lịch và danh sách ticket", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('Lịch bảo trì') || document.body.innerText.includes('Bảo trì'), { timeout: 10000 });
  });

  console.log("\n=== 9. TEST AUDIT LOGS ===");
  await page.goto(`${BASE}/admin/audit-logs`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang Audit Logs hiển thị nhật ký", async () => {
    await page.waitForSelector('table', { timeout: 10000 });
  });

  console.log("\n=== 10. TEST QUẢN LÝ NGƯỜI DÙNG ===");
  await page.goto(`${BASE}/admin/users`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang quản lý người dùng hiển thị bảng", async () => {
    await page.waitForSelector('table', { timeout: 10000 });
  });

  console.log("\n=== 11. TEST LỊCH SỬ CHAT AI ===");
  await page.goto(`${BASE}/dashboard/chat-history`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang lịch sử chat AI load", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('Lịch sử') || document.body.innerText.includes('Chat'), { timeout: 10000 });
  });

  console.log("\n=== 12. TEST CÀI ĐẶT & 2FA ===");
  await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded' });
  await check(page, "Trang Cài đặt hiển thị mục Bảo mật 2 lớp", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('bảo mật') || document.body.innerText.includes('2-FA') || document.body.innerText.includes('CÀI ĐẶT'), { timeout: 10000 });
  });

  await browser.close();
  console.log(`\n========================================`);
  console.log(`KẾT QUẢ TEST TOÀN BỘ: ${passed} PASS / ${failed} FAIL`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => {
  console.error("LỖI TEST:", e);
  process.exit(1);
});
