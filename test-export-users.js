const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@dlu.edu.vn');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => location.href.includes('/dashboard'), { timeout: 30000 });

    await page.goto('http://localhost:3000/admin/users', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => document.body.innerText.toUpperCase().includes('XUẤT NGƯỜI DÙNG'),
      { timeout: 10000 }
    );
    console.log('✓ Nút "Xuất người dùng" hiển thị');

    await page.evaluate(() => {
      const el = [...document.querySelectorAll('button, [role="button"]')].find(e =>
        e.innerText.toUpperCase().includes('XUẤT NGƯỜI DÙNG')
      );
      el.click();
    });

    await page.waitForFunction(
      () => document.body.innerText.toUpperCase().includes('EXPORT USERS'),
      { timeout: 10000 }
    );
    console.log('✓ Dialog EXPORT USERS mở');

    const hasColumns = await page.evaluate(() => {
      const t = document.body.innerText;
      return ['Tên', 'Email', 'Vai trò', 'Số điện thoại', 'Ngày tham gia', 'Trạng thái'].every(l => t.includes(l));
    });
    if (!hasColumns) throw new Error('Thiếu checkbox cột trong dialog');
    console.log('✓ Đủ 6 cột chọn xuất');

    const hasFormats = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('.xlsx') && t.includes('.csv');
    });
    if (!hasFormats) throw new Error('Thiếu lựa chọn định dạng');
    console.log('✓ Có Excel + CSV');

    console.log('\n=== EXPORT USERS DIALOG VERIFIED ===');
  } catch (err) {
    console.error('TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
