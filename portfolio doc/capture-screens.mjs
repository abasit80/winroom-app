import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, "shots");
const base = process.env.WINROOM_URL ?? "http://localhost:3000";

const QUIET_CSS = `
  html, body { overflow: hidden !important; }
  * { scrollbar-width: none !important; animation: none !important; transition: none !important; }
  *::-webkit-scrollbar { display: none !important; }
`;

async function login(page) {
  await page.goto(`${base}/login`, { waitUntil: "networkidle0", timeout: 60000 });
  const ok = await page.evaluate(async () => {
    const attempt = async (email, password) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      return res.ok;
    };
    if (await attempt("shots@winroom.test", "winroom123")) return "login";
    const signup = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: "Capture Lead", email: "shots@winroom.test", password: "winroom123" }),
    });
    if (signup.ok) return "signup";
    return "";
  });
  if (!ok) throw new Error("Could not sign in to capture the desk.");
}

async function ready(page, needle) {
  await page.waitForFunction(
    (text) => document.body?.innerText?.includes(text),
    { timeout: 30000 },
    needle,
  );
  await page.addStyleTag({ content: QUIET_CSS });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((resolve) => setTimeout(resolve, 700));
}

async function clickTab(page, label) {
  await page.evaluate((name) => {
    const btn = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim() === name);
    btn?.click();
  }, label);
  await new Promise((resolve) => setTimeout(resolve, 400));
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, type: "png" });
  console.log("wrote", file);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--font-render-hinting=none", "--disable-web-security"],
});

await mkdir(outDir, { recursive: true });

const desktop = await browser.newPage();
await desktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await login(desktop);

await desktop.goto(`${base}/dashboard`, { waitUntil: "networkidle0", timeout: 60000 });
await ready(desktop, "RFP Discovery");
await shot(desktop, "discovery");

await desktop.goto(`${base}/dashboard/analytics`, { waitUntil: "networkidle0", timeout: 60000 });
await ready(desktop, "Analytics");
await shot(desktop, "analytics");

await desktop.goto(`${base}/dashboard/automation`, { waitUntil: "networkidle0", timeout: 60000 });
await ready(desktop, "Automation");
await shot(desktop, "automation");

await desktop.goto(`${base}/dashboard/analyzer/it-infra`, { waitUntil: "networkidle0", timeout: 60000 });
await ready(desktop, "IT Infrastructure Upgrade");
await shot(desktop, "analyzer-document");

await clickTab(desktop, "Matrix");
await ready(desktop, "Compliance matrix");
await shot(desktop, "analyzer-matrix");

await clickTab(desktop, "Decision");
await ready(desktop, "Go / No-Go");
await shot(desktop, "analyzer-decision");

const phone = await browser.newPage();
await phone.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await login(phone);

await phone.goto(`${base}/dashboard`, { waitUntil: "networkidle0", timeout: 60000 });
await ready(phone, "RFP Discovery");
await shot(phone, "phone-discovery");

await phone.goto(`${base}/dashboard/analyzer/it-infra`, { waitUntil: "networkidle0", timeout: 60000 });
await ready(phone, "IT Infrastructure Upgrade");
await clickTab(phone, "Decision");
await new Promise((resolve) => setTimeout(resolve, 500));
await shot(phone, "phone-decision");

await browser.close();
console.log("Captured genuine Winroom screens.");
