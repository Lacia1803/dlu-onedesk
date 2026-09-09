const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.setDefaultTimeout(15000);

  try {
    console.log("Navigating to login...");
    // domcontentloaded — tránh treo do notification polling (setInterval 15s)
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 15000 });

    console.log("Filling login form...");
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@dlu.edu.vn');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Chờ URL chuyển sang dashboard (dev server + bcrypt có thể mất ~6-10s)
    await page.waitForFunction(
      () => location.href.includes('/dashboard'),
      { timeout: 30000 }
    );

    console.log("URL after login:", page.url());
    const body = await page.evaluate(() => document.body.innerText);
    console.log("PAGE CONTENT:", body.substring(0, 500));

  } catch (err) {
    console.error("❌ Test failed:", err.message || err);
  } finally {
    await browser.close();
  }
})();
