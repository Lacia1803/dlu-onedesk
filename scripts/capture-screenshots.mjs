import { chromium } from "playwright";
import { spawn } from "child_process";

const PORT = 3006;

async function run() {
  console.log("Starting Next.js server...");
  const server = spawn("npx", ["next", "start", "-p", PORT.toString()], {
    stdio: "inherit",
    env: { ...process.env, PORT: PORT.toString(), NEXTAUTH_URL: `http://localhost:${PORT}` },
  });

  // Wait for server to be ready
  await new Promise((r) => setTimeout(r, 4000));

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  async function login() {
    console.log("Logging in...");
    await page.goto(`http://localhost:${PORT}/login`);
    await page.fill('input[name="email"]', "admin@dlu.edu.vn");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(`http://localhost:${PORT}/dashboard`, { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));
  }

  try {
    await login();

    console.log("Capturing Dashboard...");
    await page.goto(`http://localhost:${PORT}/dashboard`);
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: "public/screenshots/real-dashboard.png" });

    console.log("Capturing Tickets...");
    await page.goto(`http://localhost:${PORT}/dashboard/tickets`);
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: "public/screenshots/real-tickets.png" });

    console.log("Capturing Devices (Rooms)...");
    await page.goto(`http://localhost:${PORT}/dashboard/devices`);
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: "public/screenshots/real-devices.png" });

    console.log("Capturing FAQ...");
    await page.goto(`http://localhost:${PORT}/dashboard/faq`);
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: "public/screenshots/real-faq.png" });

    console.log("Capturing KPI...");
    await page.goto(`http://localhost:${PORT}/dashboard/my-kpi`);
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: "public/screenshots/real-kpi.png" });

    console.log("Capturing Notifications...");
    await page.goto(`http://localhost:${PORT}/dashboard/notifications`);
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: "public/screenshots/real-notifications.png" });

    console.log("All screenshots captured successfully!");
  } catch (err) {
    console.error("Error during capture:", err);
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

run();
