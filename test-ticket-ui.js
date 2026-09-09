const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@dlu.edu.vn');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => location.href.includes('/dashboard'), { timeout: 30000 });

    await page.goto('http://localhost:3000/dashboard/tickets/new', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.type('input[name="title"]', 'Màn hình bị giật lag liên tục');
    await page.type('textarea[name="description"]', 'Khi tôi mở quá 5 tab chorme, màn hình liên tục chớp nháy và giật lag.');
    await page.click('button[type="submit"]');
    
    await new Promise(r => setTimeout(r, 2000));
    const body = await page.evaluate(() => document.body.innerText);
    console.log("PAGE CONTENT AFTER SUBMIT:", body.substring(0, 1000));
  } finally {
    await browser.close();
  }
})();
