/** @format */

const fs = require("node:fs");
const path = require("node:path");
const { launch, assertViewport } = require("../responsive/browser-harness.cjs");
const routes = {
  feed: "/office/feed",
  projects: "/office/projects/all",
  vacancies: "/office/vacancies/all",
  programs: "/office/program/all",
  courses: "/office/courses/all",
  members: "/office/members",
  profile: "/office/profile/1",
  "profile-edit": "/office/profile/edit?editingStep=main",
};
(async () => {
  const phase = process.argv[2] || "before";
  const destination = path.join(__dirname, "screenshots", phase);
  fs.mkdirSync(destination, { recursive: true });
  const results = [];
  for (const width of [320, 390, 1440]) {
    const { browser, page, errors, base } = await launch(width);
    try {
      for (const [name, route] of Object.entries(routes)) {
        errors.length = 0;
        await page.goto(base + route);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(700);
        const measurement = await assertViewport(page);
        await page.screenshot({
          path: path.join(destination, `${name}-${width}.png`),
          fullPage: true,
        });
        results.push({ name, route, width, ...measurement, errors: [...errors] });
      }
    } finally {
      await browser.close();
    }
  }
  fs.writeFileSync(path.join(__dirname, `${phase}.json`), JSON.stringify(results, null, 2) + "\n");
  console.log(
    `${phase}: ${results.length} screenshots, ${results.filter(r => r.errors.length).length} errors`,
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
