/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch } = require("../responsive/browser-harness.cjs");
require("../mobile-polish/fixtures.cjs");
const phase = process.argv[2],
  baseUrl = process.argv[3];
const screens = [
  [
    "empty-feed",
    "/office/feed",
    /\/feed\/$/,
    {
      count: 0,
      results: [],
      counts: { all: 0, project: 0, vacancy: 0, news: 0, partnerprogram: 0, education: 0 },
    },
    ".page__feed--no-items",
  ],
  [
    "empty-vacancies",
    "/office/vacancies/all",
    /\/vacancies\/$/,
    { count: 0, results: [] },
    ".page__vacancies--no-items",
  ],
  ["empty-courses", "/office/courses/all", /\/courses\/$/, [], "app-list .courses"],
];
(async () => {
  const directory = path.join(__dirname, "screenshots", phase);
  fs.mkdirSync(directory, { recursive: true });
  const rows = [];
  for (const width of [1440, 1920])
    for (const [name, route, endpoint, response, selector] of screens) {
      const h = await launch(width, { baseUrl });
      try {
        await h.context.route(
          url => endpoint.test(url.pathname),
          async request => {
            await request.fulfill({ json: response });
          },
        );
        await h.page.goto(baseUrl + "/office/feed");
        await h.page.waitForLoadState("networkidle");
        if (route !== "/office/feed")
          await h.page.evaluate(route => {
            history.pushState({}, "", route);
            dispatchEvent(new PopStateEvent("popstate"));
          }, route);
        await h.page.locator(selector).first().waitFor({ state: "attached" });
        await h.page.waitForLoadState("networkidle");
        await h.page.evaluate(() => {
          for (const img of document.images) img.loading = "eager";
        });
        await h.page.evaluate(() => document.fonts.ready);
        await h.page.waitForFunction(() => [...document.images].every(img => img.complete));
        await h.page.addStyleTag({
          content:
            "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}",
        });
        assert.deepEqual(h.errors, []);
        await h.page.screenshot({
          path: path.join(directory, `${name}-${width}.png`),
          fullPage: true,
        });
        rows.push({ name, width, passed: true });
        console.log(`${phase}: ${name} ${width}`);
      } finally {
        await h.browser.close();
      }
    }
  fs.writeFileSync(
    path.join(__dirname, `${phase}-states.json`),
    JSON.stringify(rows, null, 2) + "\n",
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
