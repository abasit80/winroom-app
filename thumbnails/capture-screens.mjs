import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, "shots");
const base = process.env.WINROOM_URL ?? "http://localhost:3000";

const PHONE_SCALE = 3;
const PHONE_W = 390;
const PHONE_H = 844;

const PHONE_SHOT_CSS = `
  .masthead-folio { display: none !important; }
  nav.fixed.inset-x-0.bottom-0 { display: none !important; }
  main { padding-bottom: 1rem !important; }
  .grid.min-h-0.flex-1.gap-4.xl\\:grid-cols-\\[minmax\\(0\\,1\\.15fr\\)_minmax\\(320px\\,0\\.85fr\\)\\] > :last-child { display: none !important; }
`;

const QUIET_CSS = `
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
    if (await attempt("shots@winroom.test", "winroom123")) return true;
    const signup = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: "Capture Lead", email: "shots@winroom.test", password: "winroom123" }),
    });
    return signup.ok;
  });
  if (!ok) throw new Error("Could not sign in to capture Winroom screens.");
}

async function ready(page, needle) {
  await page.waitForFunction(
    (text) => document.body?.innerText?.includes(text),
    { timeout: 60000 },
    needle,
  );
  await page.addStyleTag({ content: QUIET_CSS });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((resolve) => setTimeout(resolve, 900));
}

async function readyAny(page, needles) {
  await page.waitForFunction(
    (texts) => texts.some((text) => document.body?.innerText?.includes(text)),
    { timeout: 60000 },
    needles,
  );
  await page.addStyleTag({ content: QUIET_CSS });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((resolve) => setTimeout(resolve, 900));
}

async function clickTab(page, label) {
  await page.evaluate((name) => {
    const btn = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim() === name);
    btn?.click();
  }, label);
  await new Promise((resolve) => setTimeout(resolve, 550));
}

async function scrollToDecisionPanel(page) {
  await page.evaluate(() => {
    const decisionTab = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim() === "Decision");
    decisionTab?.scrollIntoView({ block: "center", behavior: "instant" });

    const card = [...document.querySelectorAll("h2")].find((h) => h.textContent?.trim() === "Go / No-Go")?.closest(".glass");
    if (card) {
      card.scrollIntoView({ block: "center", behavior: "instant" });
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 800));
}

async function shotPhoneDecision(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.addStyleTag({ content: PHONE_SHOT_CSS });
  await page.evaluate(() => {
    const tabRow = [...document.querySelectorAll("button")]
      .find((el) => el.textContent?.trim() === "Decision")
      ?.parentElement;
    tabRow?.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await new Promise((resolve) => setTimeout(resolve, 700));
  await page.screenshot({ path: file, type: "png" });
  console.log("wrote", file, `(phone viewport ${PHONE_W}x${PHONE_H})`);
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, type: "png" });
  console.log("wrote", file);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--font-render-hinting=medium", "--disable-web-security", "--force-color-profile=srgb"],
});

await mkdir(outDir, { recursive: true });

const desktop = await browser.newPage();
await desktop.setViewport({ width: 1920, height: 1200, deviceScaleFactor: 3 });
await login(desktop);

await desktop.goto(`${base}/dashboard`, { waitUntil: "networkidle0", timeout: 60000 });
await ready(desktop, "RFP Discovery");
await shot(desktop, "desktop-discovery");

await desktop.setViewport({ width: PHONE_W, height: PHONE_H, deviceScaleFactor: PHONE_SCALE });
await desktop.goto(`${base}/dashboard/analyzer/it-infra`, { waitUntil: "networkidle0", timeout: 60000 });
await readyAny(desktop, ["IT Infrastructure Upgrade", "Go / No-Go", "Document"]);
await clickTab(desktop, "Decision");
await ready(desktop, "Go / No-Go");
await pageWaitForScore(desktop);
await scrollToDecisionPanel(desktop);
await shotPhoneDecision(desktop, "phone-decision");

await browser.close();
console.log(`Captured retina screens (desktop 3x, phone ${PHONE_SCALE}x @ ${PHONE_W}x${PHONE_H}).`);

async function pageWaitForScore(page) {
  const hasScore = await page.evaluate(() => {
    const h2 = [...document.querySelectorAll("h2")].find((h) => h.textContent?.trim() === "Go / No-Go");
    const card = h2?.closest(".glass");
    return Boolean(card?.querySelector("p.text-4xl"));
  });
  if (hasScore) return;
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim() === "Recalculate");
    btn?.click();
  });
  await page.waitForFunction(
    () => {
      const h2 = [...document.querySelectorAll("h2")].find((h) => h.textContent?.trim() === "Go / No-Go");
      return Boolean(h2?.closest(".glass")?.querySelector("p.text-4xl"));
    },
    { timeout: 15000 },
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
}
