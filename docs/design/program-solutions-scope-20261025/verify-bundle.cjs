/** @format */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = path.join(__dirname, "prototype");
const output =
  process.env.SCOPE_QA_OUTPUT || path.join(os.tmpdir(), `procollab-scope-qa-${Date.now()}`);
assert(!fs.existsSync(output), "Use a new output directory; historical evidence is immutable");
fs.mkdirSync(output, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "source-manifest.json"), "utf8"));
const errors = [];
const deniedRequests = [];
const checks = [];
const screenshots = [];
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
for (const [file, expected] of Object.entries(manifest.sourcesRawSha256)) {
  assert.equal(sha(path.join(root, file)), expected, file);
}
let browser;
async function run() {
  browser = await chromium.launch({
    headless: true,
    channel: process.env.BROWSER_CHANNEL || "msedge",
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const target = path.resolve(root, relative.endsWith("/") ? relative + "index.html" : relative);
    if (
      url.origin !== "http://127.0.0.1:8769" ||
      request.method() !== "GET" ||
      ["fetch", "xhr"].includes(request.resourceType()) ||
      !target.startsWith(root + path.sep) ||
      !fs.existsSync(target)
    ) {
      deniedRequests.push(url.origin + url.pathname);
      return route.abort();
    }
    const mime = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".svg": "image/svg+xml",
      ".woff2": "font/woff2",
    };
    await route.fulfill({ body: fs.readFileSync(target), contentType: mime[path.extname(target)] });
  });
  for (const screen of ["solutions", "analytics"]) {
    await page.goto(`http://127.0.0.1:8769/manager-v1/?screen=${screen}&format=kch&state=ready`);
    await page.evaluate(() => document.fonts.ready);
    assert.deepEqual(
      (await page.locator("nav.section-tabs button").allTextContents()).map(label => label.trim()),
      ["Участники", "Заявки", "Эксперты", "Результаты", "Аналитика", "Настройки", "Сертификаты"],
    );
    assert.equal(await page.locator('nav.section-tabs [data-screen="evaluation"]').count(), 0);
    assert.match(
      await page.locator("body").evaluate(node => getComputedStyle(node).fontFamily),
      /Mont/i,
    );
    assert(
      await page.evaluate(() =>
        [...document.fonts].some(font => font.family === "Mont" && font.status === "loaded"),
      ),
    );
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      checks.push({ screen, width, noOverflow: true });
      if ([390, 1440].includes(width)) {
        const name = `${screen}-${width}.png`;
        await page.screenshot({ path: path.join(output, name), fullPage: true });
        screenshots.push({ name, sha256: sha(path.join(output, name)) });
      }
    }
  }
  await page.locator("#prototype-screen").selectOption("evaluation");
  assert.equal(
    await page.locator('nav.section-tabs [aria-current="page"]').getAttribute("data-screen"),
    "solutions",
  );
  const body = await page.locator("#manager-main").innerHTML();
  const url = page.url();
  for (const section of ["participants", "experts", "settings", "certificates"]) {
    await page.locator(`[data-preserved-section="${section}"]`).click();
    assert.equal(await page.locator("#manager-main").innerHTML(), body);
    assert.equal(page.url(), url);
  }
  await page.goto("http://127.0.0.1:8769/public-v1/");
  for (const format of ["kch", "hack", "noncompetitive"]) {
    await page.locator("#format").selectOption(format);
    assert(await page.locator(".public-shell").isVisible());
    assert.match(await page.locator("#scope-note").innerText(), /API/);
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      checks.push({ screen: "public", format, width, noOverflow: true });
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(deniedRequests, []);
}
run()
  .then(() => {
    fs.writeFileSync(
      path.join(output, "bundle-qa.json"),
      JSON.stringify(
        {
          status: "PASS",
          sourceManifestSha256: sha(path.join(__dirname, "source-manifest.json")),
          sourceFiles: Object.keys(manifest.sourcesRawSha256).length,
          browser: "headless " + (process.env.BROWSER_CHANNEL || "msedge"),
          scope: "Frozen synthetic bundle smoke; not HTTP/API/Angular or complete design QA",
          checks,
          errors,
          deniedRequests,
          screenshots,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      JSON.stringify({ status: "PASS", checks: checks.length, output, errors, deniedRequests }),
    );
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
  });
