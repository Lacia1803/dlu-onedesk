const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push('pageerror: '+err.message));
  page.on('error', err => errors.push('error: '+err.message));
  // Login
  await page.goto('http://localhost:3000/login', {waitUntil: 'domcontentloaded'});
  await page.type('input[name="email"]', 'admin@dlu.edu.vn');
  await page.type('input[name="password"]', 'admin123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({waitUntil: 'domcontentloaded'}),
  ]);
  console.log('After login URL:', page.url());
  // Navigate to admin users
  await page.goto('http://localhost:3000/admin/users', {waitUntil: 'domcontentloaded'});
  console.log('Admin page URL:', page.url());
  const html = await page.content();
  fs.writeFileSync('admin-users.html', html);
  await page.screenshot({path: 'admin-users.png', fullPage: true});
  const hasTable = await page.$('table') !== null;
  const hasDropdown = await page.$('select, [role="listbox"]') !== null;
  const hasSearch = await page.$('input[name="q"]') !== null;
  let searchResult = false;
  if (hasSearch) {
    await page.type('input[name="q"]', 'admin');
    await page.keyboard.press('Enter');
    await new Promise(r=>setTimeout(r,2000));
    const rows = await page.$$('tbody tr');
    searchResult = rows.length > 0;
  }
  console.log(JSON.stringify({hasTable, hasDropdown, hasSearch, searchResult, errors}));
  await browser.close();
})();
