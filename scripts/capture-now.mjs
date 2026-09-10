import { chromium } from 'playwright';

const BASE = 'http://localhost:3006';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

console.log('Logging in...');
await page.goto(`${BASE}/login`);
await page.fill('input[name="email"]', 'admin@dlu.edu.vn');
await page.fill('input[name="password"]', 'admin123');
await page.click('button[type="submit"]');
try {
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 20000 });
  console.log('Login OK:', page.url());
} catch (e) {
  console.log('Login failed, current URL:', page.url());
  const body = await page.textContent('body');
  console.log('Body:', body?.slice(0, 500));
  await browser.close();
  process.exit(1);
}
await new Promise((r) => setTimeout(r, 2000));

for (const [route, file] of [
  ['/dashboard', 'public/screenshots/real-dashboard.png'],
  ['/dashboard/tickets', 'public/screenshots/real-tickets.png'],
  ['/dashboard/devices', 'public/screenshots/real-devices.png'],
  ['/dashboard/faq', 'public/screenshots/real-faq.png'],
  ['/dashboard/my-kpi', 'public/screenshots/real-kpi.png'],
  ['/dashboard/notifications', 'public/screenshots/real-notifications.png'],
]) {
  console.log('Capturing', route);
  await page.goto(`${BASE}${route}`);
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: file });
  console.log('Saved', file);
}

await browser.close();
console.log('Done!');
