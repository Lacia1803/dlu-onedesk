const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@dlu.edu.vn');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 6000));
    console.log("URL:", page.url());
    const body = await page.evaluate(() => document.body.innerText);
    console.log("BODY:", body.substring(0, 600));
  } catch (e) {
    console.error("ERR:", e.message);
  } finally { await browser.close(); }
})();
