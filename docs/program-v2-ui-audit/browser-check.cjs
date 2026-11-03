/** @format */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const fixture = require("./fixtures.cjs");
const { measure } = require("../responsive/browser-harness.cjs");
const phase = process.argv[2] || "after";
const widths = (process.env.WIDTHS || "320,390,768,1440,1920").split(",").map(Number);
const base = process.env.PROGRAM_UI_BASE || "http://127.0.0.1:4200";
const destination = path.join(__dirname, "screenshots", phase);
fs.mkdirSync(destination, { recursive: true });
const screens = [
  ["participants", "participants"],
  ["projects", "projects"],
  ["experts", "experts"],
  ["distribution", "experts"],
  ["results", "results"],
  ["analytics", "analytics"],
  ...["basic", "dates", "materials", "project-form", "criteria", "organizers", "registration"].map(
    tab => ["settings-" + tab, "settings?tab=" + tab],
  ),
  ["certificates", "certificates"],
];
async function launch(width) {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    reducedMotion: "reduce",
  });
  await context.addCookies(
    ["accessToken", "refreshToken", "devAccessToken", "devRefreshToken"].map(name => ({
      name,
      value: "isolated-program-visual-fixture",
      url: base,
    })),
  );
  await context.addInitScript(() => localStorage.setItem("cookieConsent", "declined"));
  const requests = [],
    errors = [];
  await context.route("**/*", async route => {
    const req = route.request(),
      url = new URL(req.url());
    if (url.origin === base) return route.continue();
    if (["dev.procollab.ru", "api.procollab.ru"].includes(url.hostname)) {
      let body = null;
      try {
        body = req.postDataJSON();
      } catch {}
      requests.push({ path: url.pathname, query: url.search, method: req.method(), body });
      const result = fixture.response(url, req.method(), body);
      return route.fulfill({ json: result ?? {}, headers: { "Access-Control-Allow-Origin": "*" } });
    }
    return route.fulfill({ body: "", status: 200 });
  });
  await context.routeWebSocket("**", socket => socket.onMessage(() => {}));
  const page = await context.newPage();
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => {
    if (m.type() === "error") errors.push(m.text());
  });
  return { browser, context, page, requests, errors };
}
async function open(page, version, route, name) {
  await page.goto(`${base}/office/program/${version === "v1" ? 1 : 12}/management/${route}`);
  await page.locator(".management__tabs").waitFor();
  if (name === "distribution")
    await page.getByRole("button", { name: "Распределение экспертов", exact: true }).click();
  if (name === "distribution")
    await page
      .locator('.experts__tabs button[aria-current="page"]')
      .filter({ hasText: "Распределение экспертов" })
      .waitFor();
  await page.waitForTimeout(180);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}
async function assertPopulatedScreen(page, name) {
  const selector = {
    participants: ".management__participants tbody tr",
    projects: ".management__projects tbody tr",
    experts: ".experts__table tbody tr, .solution-analytics__table tbody tr",
    distribution: ".experts__table--projects tbody tr, .solution-analytics__table tbody tr",
    results: ".results__row",
    analytics: ".summary-card__value",
    "settings-basic": "#program-name",
    "settings-dates": ".management__form input",
    "settings-materials": ".management__material",
    "settings-project-form": ".project-form__row",
    "settings-criteria": ".criteria__row",
    "settings-organizers": ".organizers__row-actions",
    "settings-registration": ".registration__row",
    certificates: "app-certificate-canvas",
  }[name];
  if (!selector) throw new Error(`Unknown screen: ${name}`);
  await page.locator(selector).first().waitFor();
  const count = await page.locator(selector).count();
  if (!count) throw new Error(`No populated content in ${name}`);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);
  return { selector, populatedElements: count };
}
async function capture() {
  const results = [];
  for (const width of widths) {
    const { browser, page, requests, errors } = await launch(width);
    for (const version of ["v1", "v2"])
      for (const [name, route] of screens) {
        if (process.env.SCREENS && !process.env.SCREENS.split(",").includes(name)) continue;
        const startErrors = errors.length;
        try {
          await open(page, version, route, name);
          const readiness = await assertPopulatedScreen(page, name);
          const metrics = await measure(page);
          const file = `${version}-${name}-${width}.png`;
          await page.screenshot({ path: path.join(destination, file), fullPage: true });
          results.push({
            version,
            screen: name,
            width,
            file,
            readiness,
            ...metrics,
            errors: errors.slice(startErrors),
          });
          console.log(
            `${phase} ${version} ${name} ${width}: overflow=${metrics.overflows.length}, errors=${errors.length - startErrors}`,
          );
        } catch (error) {
          results.push({
            version,
            screen: name,
            width,
            failure: error.message,
            errors: errors.slice(startErrors),
          });
          console.log(`${version} ${name}: ${error.message}`);
        }
      }
    fs.writeFileSync(
      path.join(__dirname, `${phase}-requests-${width}.json`),
      JSON.stringify(requests, null, 2),
    );
    await browser.close();
  }
  fs.writeFileSync(path.join(__dirname, `${phase}-results.json`), JSON.stringify(results, null, 2));
  if (
    results.some(
      r => r.failure || r.errors.length || r.overflows?.length || r.pageWidth > r.width + 1,
    )
  )
    process.exitCode = 1;
}
if (require.main === module)
  capture().catch(e => {
    console.error(e);
    process.exitCode = 1;
  });
module.exports = { launch, open, base };
