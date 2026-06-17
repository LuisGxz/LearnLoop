// Capture screenshots at 3 breakpoints (390 / 768 / 1280). Usage:
//   MSYS_NO_PATHCONV=1 node scripts/shots.mjs <path> <name>
// or via `npm run shots -- <path> <name>` (sets MSYS_NO_PATHCONV for you).
//
// MSYS_NO_PATHCONV=1 is required under git-bash: otherwise MSYS rewrites a
// leading-slash <path> arg like "/about" into a Windows path and the browser
// navigates to an invalid URL (blank capture). No console/pageerror listeners
// here — those checks live in the Playwright E2E suite (Fase 10).
import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'node:fs';

const path = process.argv[2] ?? '/';
const name = process.argv[3] ?? 'page';
const base = process.env.SHOT_BASE ?? 'http://localhost:4200';
const outDir = 'docs/screenshots';
mkdirSync(outDir, { recursive: true });

const breakpoints = [
  [390, 844, 'mobile'],
  [768, 1024, 'tablet'],
  [1280, 900, 'desktop'],
];

let failed = false;
for (const [w, h, label] of breakpoints) {
  const file = `${outDir}/${name}-${label}.png`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'en-US' });
  const page = await ctx.newPage();
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500); // let fonts + lazy chunk settle
  await page.evaluate(() => document.body.innerText.length); // flush layout
  await page.screenshot({ path: file, fullPage: true });
  await browser.close();
  const bytes = statSync(file).size;
  console.log(`${bytes >= 15_000 ? 'saved' : 'WARN blank'} ${name}-${label}.png (${bytes}B)`);
  if (bytes < 15_000) failed = true;
}
if (failed) process.exitCode = 1;
