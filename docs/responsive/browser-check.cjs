/** @format */
const { launch, measure } = require("./browser-harness.cjs");
const fs = require("node:fs");
const path = require("node:path");
const base = "http://127.0.0.1:4360";
const output = __dirname;
const widths = process.env.RESPONSIVE_WIDTHS?.split(",").map(Number) || [
  320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1440, 1920,
];
const inventory = require("./routes.json");
const urls = process.env.RESPONSIVE_ROUTES?.split(",") || [
  ...new Set(
    inventory
      .filter(r => r.component && !r.route.endsWith("/") && !r.route.includes("**"))
      .map(r => r.route.replace(/:[^/]+/g, "1")),
  ),
  "/office/projects/1",
  "/office/program/1",
  "/office/profile/1",
  "/office/vacancies/1",
  "/office/vacancies/my",
  "/office/courses/1",
  "/office/feed",
];
if (!process.env.RESPONSIVE_ROUTES) {
  urls.push(
    ...["main", "education", "experience", "achievements", "skills", "settings"].map(
      step => `/office/profile/edit?editingStep=${step}`,
    ),
  );
  urls.push(
    ...["main", "contacts", "achievements", "vacancies", "team", "additional"].map(
      step => `/office/projects/1/edit?editingStep=${step}&programLinkId=1`,
    ),
  );
}
const resetIndex = urls.indexOf("/auth/reset_password");
if (resetIndex >= 0) urls[resetIndex] += "?token=responsive-fixture";
(async () => {
  const { browser, page, requests, errors } = await launch();
  const rows = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width >= 750 ? 1000 : 844 });
    for (const url of urls) {
      const errorStart = errors.length;
      await page.goto(base + url);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(150);
      const result = await measure(page);
      if (
        url === "/office/onboarding/stage-0" &&
        !(await page.locator("app-stage-zero .page__form input").count())
      )
        errors.push("Stage zero form is empty");
      if (
        url.endsWith("/lesson/1/results") &&
        url.includes("/courses/1/") &&
        !(await page.locator("app-complete app-button").isVisible())
      )
        errors.push("Lesson completion CTA is missing");
      rows.push({ route: url, width, ...result, errors: errors.slice(errorStart) });
      if (
        [320, 390, 1440].includes(width) &&
        [
          "/auth/login",
          "/office/projects/my",
          "/office/program/1/analytics",
          "/office/profile/edit",
          "/office/program/1",
          "/office/onboarding/stage-0",
          "/office/courses/1/lesson/1/results",
        ].includes(url)
      ) {
        fs.mkdirSync(path.join(output, "screenshots"), { recursive: true });
        await page.screenshot({
          path: path.join(
            output,
            "screenshots",
            `${url.replaceAll("/", "-").slice(1)}-${width}.png`,
          ),
          fullPage: true,
        });
      }
      console.log(
        JSON.stringify({
          route: url,
          width,
          actualPath: result.actualPath,
          overflow: result.overflows.length,
          errors: errors.length - errorStart,
        }),
      );
    }
  }
  fs.writeFileSync(
    path.join(output, process.env.RESPONSIVE_OUTPUT || "browser-results.json"),
    JSON.stringify({ rows, requests: [...requests], errors }, null, 2),
  );
  await browser.close();
  const failures = rows.filter(
    row =>
      row.overflows.length ||
      row.errors.length ||
      row.pageWidth > row.width + 1 ||
      !row.text.trim(),
  );
  console.log(JSON.stringify({ checks: rows.length, failures: failures.length }));
  if (failures.length) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
