import { stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import path from "node:path";
import puppeteer from "puppeteer";
import sharp from "sharp";

const dir = path.dirname(fileURLToPath(import.meta.url));
const html = path.join(dir, "index.html");
const shotsDir = path.join(dir, "shots");

/** Upwork recommended portfolio thumbnail (4:3). */
const UPWORK_W = 1000;
const UPWORK_H = 750;

/** Layout is authored at 2x Upwork size. */
const DESIGN_W = UPWORK_W * 2;
const DESIGN_H = UPWORK_H * 2;

/** Must match export deviceScaleFactor for 1:1 screenshot pixels. */
const RENDER_SCALE = 3;

/** Exact CSS pixel sizes in index.html — img files = these × RENDER_SCALE. */
const DESKTOP_CSS_W = 1180;
const DESKTOP_CSS_H = 738;
const PHONE_CSS_W = 294;
const PHONE_CSS_H = 636;

async function prepareShots() {
  const desktopOut = path.join(shotsDir, "desktop-discovery-baked.png");
  const phoneOut = path.join(shotsDir, "phone-decision-baked.png");

  await sharp(path.join(shotsDir, "desktop-discovery.png"))
    .resize(DESKTOP_CSS_W * RENDER_SCALE, DESKTOP_CSS_H * RENDER_SCALE, {
      kernel: sharp.kernel.lanczos3,
      fit: "cover",
      position: "left top",
    })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.25 })
    .png({ compressionLevel: 6, adaptiveFiltering: true })
    .toFile(desktopOut);

  await sharp(path.join(shotsDir, "phone-decision.png"))
    .resize(PHONE_CSS_W * RENDER_SCALE, PHONE_CSS_H * RENDER_SCALE, {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
    })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.25 })
    .png({ compressionLevel: 6, adaptiveFiltering: true })
    .toFile(phoneOut);

  console.log(`Prepared 1:1 shots at ${RENDER_SCALE}x (${DESKTOP_CSS_W * RENDER_SCALE}x${DESKTOP_CSS_H * RENDER_SCALE} desktop).`);
  return { desktopOut, phoneOut };
}

await prepareShots();

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--font-render-hinting=medium",
    "--disable-web-security",
    "--force-color-profile=srgb",
  ],
});

const page = await browser.newPage();
await page.setViewport({
  width: DESIGN_W,
  height: DESIGN_H,
  deviceScaleFactor: RENDER_SCALE,
});
await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle0", timeout: 120000 });
await page.evaluateHandle("document.fonts.ready");
await page.evaluate(() => {
  document.querySelectorAll("img.shot").forEach((img) => {
    img.style.imageRendering = "auto";
  });
});
await new Promise((resolve) => setTimeout(resolve, 1200));

const raw = await page.screenshot({
  type: "png",
  clip: { x: 0, y: 0, width: DESIGN_W, height: DESIGN_H },
  omitBackground: false,
});

await browser.close();

const masterW = DESIGN_W * RENDER_SCALE;
const masterH = DESIGN_H * RENDER_SCALE;

const pngOpts = {
  compressionLevel: 6,
  adaptiveFiltering: true,
  effort: 10,
};

const master = sharp(raw).png(pngOpts);

const upworkOut = path.join(dir, "Winroom-Thumbnail-Upwork.png");
const hqOut = path.join(dir, "Winroom-Thumbnail-2x.png");
const maxOut = path.join(dir, "Winroom-Thumbnail-Max.png");
const masterOut = path.join(dir, "Winroom-Thumbnail-Master.png");
const mainOut = path.join(dir, "Winroom-Thumbnail.png");

async function writePng(pipeline, file) {
  const tmp = `${file}.tmp.png`;
  await pipeline.toFile(tmp);
  const fs = await import("node:fs/promises");
  try {
    await fs.unlink(file);
  } catch {
    /* ignore missing */
  }
  await fs.rename(tmp, file);
}

await writePng(master.clone(), masterOut);

await writePng(
  master.clone().resize(4000, 3000, { kernel: sharp.kernel.lanczos3 }).png(pngOpts),
  maxOut,
);

await writePng(
  master.clone().resize(DESIGN_W, DESIGN_H, { kernel: sharp.kernel.lanczos3 }).png(pngOpts),
  hqOut,
);

await writePng(
  master.clone().resize(UPWORK_W, UPWORK_H, { kernel: sharp.kernel.lanczos3 }).png(pngOpts),
  upworkOut,
);

await writePng(sharp(hqOut), mainOut);

async function logFile(file) {
  const meta = await sharp(file).metadata();
  const bytes = (await stat(file)).size;
  console.log(`Wrote ${path.basename(file)} (${meta.width}x${meta.height}, ${(bytes / 1024).toFixed(0)} KB)`);
}

await logFile(upworkOut);
await logFile(hqOut);
await logFile(maxOut);
await logFile(masterOut);
await logFile(mainOut);

console.log(`\nMaster render: ${masterW}x${masterH} with 1:1 embedded UI pixels (no browser downscale blur).`);
console.log("Upwork upload: Winroom-Thumbnail-Max.png (4000x3000, Upwork max sharp).");
