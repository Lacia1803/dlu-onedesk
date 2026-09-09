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

    console.log("Navigating to room creation...");
    await page.goto('http://localhost:3000/dashboard/rooms/new', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    
    await page.type('input[name="name"]', 'Lab A101 - Test E2E');
    await page.type('input[name="location"]', 'Tầng 1 - Khu A');
    // Clear existing capacity value which is 0 by default possibly?
    await page.click('input[name="capacity"]', {clickCount: 3});
    await page.keyboard.press('Backspace');
    await page.type('input[name="capacity"]', '40');
    await page.click('button[type="submit"]');
    
    await new Promise(r => setTimeout(r, 2000));
    console.log("URL after creation:", page.url());
    
    const body = await page.evaluate(() => document.body.innerText);
    if (body.includes('Lab A101')) {
      console.log("✅ Room successfully created and appears in list!");
    } else {
      console.log("❌ Room not found in list.");
      console.log("Page content:", body.substring(0, 500));
    }
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    await browser.close();
  }
})();
