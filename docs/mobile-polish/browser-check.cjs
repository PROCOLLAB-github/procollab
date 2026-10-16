/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch, measure } = require("../responsive/browser-harness.cjs");
const fixtures = require("./fixtures.cjs");
const phase = process.argv[2] || "after";
const widths = [320, 360, 390, 430, 768, 1440];
const screens = [
  ["feed", "/office/feed", "app-open-vacancy"],
  ["projects", "/office/projects/dashboard", "app-info-card"],
  ["my-projects", "/office/projects/my", "app-info-card"],
  ["members", "/office/members", "app-member-card"],
  ["programs", "/office/program/all", "app-program-card"],
  ["program", "/office/program/1", "app-detail"],
  ["profile", "/office/profile/1", "app-detail"],
  ["project", "/office/projects/1", "app-detail"],
];
const directory = path.join(__dirname, "screenshots", phase);
fs.mkdirSync(directory, { recursive: true });
(async () => {
  const rows = [];
  for (const width of widths) {
    const h = await launch(width, { isMobile: width < 750, hasTouch: width < 750 });
    try {
      for (const [name, route, selector] of screens) {
        h.errors.length = 0;
        await h.page.goto(h.base + route);
        await h.page.waitForLoadState("networkidle");
        await h.page.locator(selector).first().waitFor({ state: "visible", timeout: 10000 });
        const measurement = await measure(h.page);
        await h.page.screenshot({
          path: path.join(directory, `${name}-${width}.png`),
          fullPage: true,
        });
        if (phase === "after") {
          assert.equal(measurement.pageWidth <= width + 1, true, `${name} ${width} page overflow`);
          assert.deepEqual(measurement.overflows, [], `${name} ${width}`);
          assert.deepEqual(h.errors, [], `${name} ${width}`);
        }
        rows.push({ name, width, ...measurement, errors: [...h.errors] });
        console.log(`${phase}: ${name} ${width}`);
      }
    } finally {
      await h.browser.close();
    }
  }
  fs.writeFileSync(path.join(__dirname, `${phase}.json`), JSON.stringify(rows, null, 2) + "\n");
  console.log(`${rows.length} ${phase} captures completed`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
