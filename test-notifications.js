const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@dlu.edu.vn' } });
  const notif = await prisma.notification.create({
    data: { userId: admin.id, title: "Test Thông báo ABCXYZ", message: "test", isRead: false, linkUrl: "/dashboard" }
  });

  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 500));
    await page.type('input[type="email"]', 'admin@dlu.edu.vn');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => location.href.includes('/dashboard'), { timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    await page.waitForFunction(() => !document.querySelector('.cn-toast'), { timeout: 15000 });
    await new Promise(r => setTimeout(r, 500));

    // Separate mousedown and mouseup to avoid clicking menu item that appears under cursor
    const box = { x: 692, y: 9.5 };
    await page.mouse.move(box.x + 18, box.y + 18);
    await page.mouse.down();
    await new Promise(r => setTimeout(r, 800)); // menu opens on pointerdown
    await page.mouse.up(); // mouseup lands wherever - menu item may get hovered but click only fires if pointer didn't move

    const state1 = await page.evaluate(() => {
      const triggers = Array.from(document.querySelectorAll('[aria-haspopup="menu"]'));
      const bell = triggers.find(t => t.querySelector('.sr-only')?.textContent?.includes('Thông báo'));
      return {
        url: location.href,
        triggerCount: triggers.length,
        expanded: bell?.getAttribute('aria-expanded'),
        hasNotif: document.body.innerHTML.includes('ABCXYZ'),
        menus: document.querySelectorAll('[role="menu"]').length,
      };
    });
    console.log("After mousedown/mouseup:", JSON.stringify(state1, null, 2));
    await page.screenshot({ path: 'test-screenshot.png' });

  } catch (err) { console.error("❌", err); }
  finally {
    // Check notification read state before cleanup
    const check = await prisma.notification.findFirst({ where: { title: "Test Thông báo ABCXYZ" } });
    console.log("Notification isRead after test:", check?.isRead);
    await browser.close();
    await prisma.notification.deleteMany({ where: { title: "Test Thông báo ABCXYZ" } });
    await prisma.$disconnect();
  }
})();
