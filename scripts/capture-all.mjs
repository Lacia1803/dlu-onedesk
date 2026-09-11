import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = "public/screenshots";

// [route, output name, fullPage?] — public routes are shot before login, the rest after.
// The landing page is ~16000px tall; a full-page shot is unusable in the README, so
// it is captured at viewport size (hero section only).
const PUBLIC_SHOTS = [
  ["/", "landing", false],
  ["/login", "login"],
  ["/tickets/track", "track"],
];

const AUTHED_SHOTS = [
  ["/dashboard", "dashboard"],
  ["/dashboard/tickets", "tickets"],
  ["/dashboard/rooms", "rooms"],
  ["/dashboard/devices", "devices"],
  ["/dashboard/software", "software"],
  ["/dashboard/faq", "faq"],
  ["/dashboard/maintenance", "maintenance"],
  ["/dashboard/my-kpi", "kpi"],
  ["/dashboard/notifications", "notifications"],
  ["/dashboard/chat-history", "chat-history"],
  ["/admin/users", "admin-users"],
  ["/admin/audit-logs", "admin-audit-logs"],
  ["/settings", "settings"],
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: "vi-VN",
  timezoneId: "Asia/Ho_Chi_Minh",
});
const page = await context.newPage();

const problems = [];
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error" && !/favicon|Download the React DevTools/i.test(m.text())) {
    problems.push(`console: ${m.text().slice(0, 160)}`);
  }
});
page.on("response", (r) => {
  if (r.status() >= 500) problems.push(`HTTP ${r.status()} ${r.url()}`);
});

// Freeze animations so full-page shots are deterministic.
await context.addInitScript(() => {
  const css = `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;caret-color:transparent!important}`;
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  });
});

async function login() {
  console.log("Logging in as admin@dlu.edu.vn ...");
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', "admin@dlu.edu.vn");
  await page.fill('input[name="password"]', "admin");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await page.waitForLoadState("networkidle").catch(() => {});
  console.log("  ✓ logged in ->", page.url());
}

async function shoot(route, name, { expectAuth = true, fullPage = true } = {}) {
  const mark = problems.length;
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const url = page.url();
  const title = await page.title();
  const h1 = await page
    .locator("h1")
    .first()
    .textContent()
    .catch(() => null);
  const bodyText = ((await page.textContent("body")) || "").replace(/\s+/g, " ");

  const redirected = expectAuth && /\/login/.test(url) && !/\/login$/.test(route);
  const errored = /Application error|Internal Server Error|Unhandled Runtime Error/i.test(bodyText);

  const file = `${OUT}/real-${name}.png`;
  await page.screenshot({ path: file, fullPage });

  const flags = [
    redirected ? "REDIRECTED-TO-LOGIN" : "",
    errored ? "ERROR-PAGE" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const newProblems = problems.slice(mark);
  console.log(
    `  ${flags ? "✗" : "✓"} ${route} -> real-${name}.png  h1="${(h1 || title || "").trim().slice(0, 50)}" ${flags}`
  );
  if (newProblems.length) {
    for (const p of [...new Set(newProblems)].slice(0, 3)) console.log(`      ! ${p}`);
  }
  return { route, name, url, h1: (h1 || "").trim(), redirected, errored };
}

async function clickFirstDetail() {
  // Drill into an existing ticket row to capture a detail view. The list page's
  // first `a[href^="/dashboard/tickets/"]` is the "New Ticket" button, so the
  // create/edit routes are filtered out — only a real CUID row counts.
  await page.goto(`${BASE}/dashboard/tickets`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1500);
  const links = page.locator('a[href^="/dashboard/tickets/"]');
  const count = await links.count();
  let href = null;
  for (let i = 0; i < count; i++) {
    const candidate = await links.nth(i).getAttribute("href");
    if (candidate && !/\/(new|edit)(\/|$)/.test(candidate)) {
      href = candidate;
      break;
    }
  }
  if (!href) {
    console.log("  ! no ticket row link found, skipping detail shot");
    return null;
  }
  await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2000);
  const h1 = await page.locator("h1").first().textContent().catch(() => "");
  await page.screenshot({ path: `${OUT}/real-ticket-detail.png`, fullPage: true });
  console.log(`  ✓ ${href} -> real-ticket-detail.png  h1="${(h1 || "").trim().slice(0, 50)}"`);
  return href;
}

const results = [];
try {
  for (const [route, name, fullPage] of PUBLIC_SHOTS) {
    results.push(await shoot(route, name, { expectAuth: false, fullPage }));
  }

  await login();

  const detailHref = await clickFirstDetail();

  for (const [route, name] of AUTHED_SHOTS) {
    results.push(await shoot(route, name));
  }

  const bad = results.filter((r) => r.redirected || r.errored);
  console.log(`\nCaptured ${results.length + (detailHref ? 1 : 0)} screenshots.`);
  if (bad.length) {
    console.log("PROBLEM PAGES:");
    for (const b of bad) console.log(`  - ${b.route} ${b.redirected ? "redirected" : ""} ${b.errored ? "errored" : ""}`);
    process.exitCode = 1;
  }
  const uniq = [...new Set(problems)];
  if (uniq.length) {
    console.log(`\nConsole/network issues (${uniq.length}):`);
    for (const p of uniq.slice(0, 15)) console.log(`  ! ${p}`);
  }
} catch (err) {
  console.error("FAILED:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
