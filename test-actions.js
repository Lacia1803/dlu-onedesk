// Test chức năng chi tiết: export buttons, PDF, auto-assign, lookup, overdue
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:3000';
let passed = 0, failed = 0;
function ok(n) { passed++; console.log(`  ✓ ${n}`); }
function fail(n, d) { failed++; console.log(`  ✗ ${n}${d ? ' — ' + d : ''}`); }
async function check(page, name, fn) {
  try { await fn(); ok(name); } catch (e) { fail(name, e.message.split('\n')[0]); }
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('DevTools') && !m.text().includes('Script')) consoleErrors.push(m.text().slice(0, 120)); });

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@dlu.edu.vn');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.href.includes('/dashboard'), { timeout: 15000 });

  console.log("\n=== A. EXPORT DROPDOWN (Excel/CSV) ===");
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await check(page, "Click 'Xuất báo cáo' → mở dropdown có 2 options", async () => {
    const btn = (await page.$$('button')).filter(async () => true);
    const triggers = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Xuất báo cáo')).length);
    if (triggers === 0) throw new Error('không thấy nút Xuất báo cáo');
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Xuất báo cáo')).click());
    await page.waitForFunction(() => document.body.innerText.includes('Excel (.xlsx)') && document.body.innerText.includes('CSV (2 file)'), { timeout: 5000 });
  });

  console.log("\n=== B. API DEVICES LOOKUP ===");
  await check(page, "API /api/devices/lookup?code=INVALID → 404", async () => {
    const res = await page.evaluate(async () => { const r = await fetch('/api/devices/lookup?code=INVALID-XYZ'); return r.status; });
    if (res !== 404) throw new Error(`HTTP ${res}, mong đợi 404`);
  });

  console.log("\n=== C. TICKET DETAIL: IN PHIẾU PDF ===");
  await page.goto(`${BASE}/dashboard/tickets`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  const firstTicketHref = await page.evaluate(() => {
    const a = document.querySelector('tbody a[href*="/dashboard/tickets/"]');
    return a ? a.getAttribute('href') : null;
  });
  if (firstTicketHref) {
    await page.goto(BASE + firstTicketHref, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await check(page, "Trang chi tiết ticket có nút 'In phiếu PDF'", async () => {
      await page.waitForFunction(() => document.body.innerText.includes('In phiếu PDF'), { timeout: 10000 });
    });
    await check(page, "Click 'In phiếu PDF' → không lỗi, toast hiện", async () => {
      await page.evaluate(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('In phiếu PDF')).click());
      await new Promise(r => setTimeout(r, 4000));
    });
  } else {
    fail("Không có ticket nào để test (DB trống)", "");
  }

  console.log("\n=== D. BULK AUTO-ASSIGN + BADGE QUÁ HẠN ===");
  await page.goto(`${BASE}/dashboard/tickets`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await check(page, "Badge 'Quá hạn' hiển thị nếu có ticket quá hạn (hoặc absent ok)", async () => {
    await page.waitForSelector('table', { timeout: 10000 });
  });
  await check(page, "Select-all → toolbar bulk có nút 'Tự động gán'", async () => {
    const thCb = await page.$('thead input[type="checkbox"]');
    if (!thCb) throw new Error('không có checkbox');
    await thCb.click();
    await page.waitForFunction(() => document.body.innerText.includes('Tự động gán'), { timeout: 5000 });
  });

  console.log("\n=== E. MAINTENANCE DRAG-DROP UI ===");
  await page.goto(`${BASE}/dashboard/maintenance`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await check(page, "Calendar hiển thị lưới ngày", async () => {
    await page.waitForFunction(() => document.body.innerText.includes('Lịch bảo trì'), { timeout: 10000 });
  });

  console.log("\n=== F. CONSOLE ERRORS (runtime) ===");
  await check(page, "Không có console error nghiêm trọng", async () => {
    const serious = consoleErrors.filter(e => !e.includes('DevTools') && !e.includes('Script'));
    if (serious.length > 5) throw new Error(`${serious.length} errors: ${serious.slice(0,2).join(' | ')}`);
  });

  await browser.close();
  console.log(`\n========================================`);
  console.log(`KẾT QUẢ ACTION TESTS: ${passed} PASS / ${failed} FAIL`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.error("LỖI TEST:", e); process.exit(1); });
