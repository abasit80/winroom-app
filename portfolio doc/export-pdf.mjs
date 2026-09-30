import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import path from "node:path";
import puppeteer from "puppeteer";

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = path.join(dir, "index.html");
const out = path.join(dir, "Winroom-Client-Case-Study.pdf");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--font-render-hinting=none", "--disable-web-security"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1680, height: 1188, deviceScaleFactor: 2 });
await page.emulateMediaType("print");
await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle0", timeout: 120000 });
await page.evaluateHandle("document.fonts.ready");
await new Promise((resolve) => setTimeout(resolve, 600));

await page.pdf({
  path: out,
  width: "297mm",
  height: "210mm",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
console.log(`Wrote ${out}`);
