/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch, measure } = require("../responsive/browser-harness.cjs");
require("../mobile-polish/fixtures.cjs");
const phase = process.argv[2];
const baseUrl = process.argv[3];
const widths = (process.argv[4] || "1440,1920").split(",").map(Number);
const editing = process.argv[5] === "edit";
const screens = editing
  ? [
      ["profile-edit", "/office/profile/edit?editingStep=main", "app-profile-main-step"],
      [
        "project-edit",
        "/office/projects/1/edit?editingStep=main&programLinkId=1",
        "app-project-main-step",
      ],
    ]
  : [
      ["feed", "/office/feed", "app-open-vacancy"],
      ["projects", "/office/projects/dashboard", "app-info-card"],
      ["my-projects", "/office/projects/my", "app-info-card"],
      ["members", "/office/members", "app-member-card"],
      ["programs", "/office/program/all", "app-program-card"],
      ["program", "/office/program/1", "app-program-role-widget"],
      ["profile", "/office/profile/1", "app-profile-left-side"],
      ["project", "/office/projects/1", "app-projects-left-side"],
      ["vacancies", "/office/vacancies/all", "app-project-vacancy-card"],
      ["vacancy", "/office/vacancies/1", "app-vacancies-detail"],
      ["courses", "/office/courses/all", "app-course"],
      ["course", "/office/courses/1", "app-course-detail"],
    ];
(async () => {
  const directory = path.join(__dirname, "screenshots", phase);
  fs.mkdirSync(directory, { recursive: true });
  const rows = [];
  for (const width of widths) {
    const h = await launch(width, { baseUrl, isMobile: width < 750, hasTouch: width < 750 });
    try {
      // Fixed clock, no animations, no screenshot masks or omitted page sections.
      await h.context.addInitScript(() => {
        const NativeDate = Date;
        class FixedDate extends NativeDate {
          constructor(...args) {
            super(...(args.length ? args : [1791288000000]));
          }
          static now() {
            return 1791288000000;
          }
        }
        window.Date = FixedDate;
      });
      await h.page.goto(baseUrl + "/office/feed");
      await h.page.waitForLoadState("networkidle");
      for (const [name, route, selector] of screens) {
        h.errors.length = 0;
        if (name === "feed") await h.page.goto(baseUrl + route);
        else
          await h.page.evaluate(route => {
            history.pushState({}, "", route);
            dispatchEvent(new PopStateEvent("popstate"));
          }, route);
        await h.page.waitForURL(baseUrl + route);
        await h.page.waitForLoadState("networkidle");
        await h.page
          .locator(selector)
          .first()
          .waitFor({ state: "attached" })
          .catch(async error => {
            console.error(
              JSON.stringify(
                {
                  url: h.page.url(),
                  text: await h.page.locator("body").innerText(),
                  errors: h.errors,
                  requests: h.requests,
                },
                null,
                2,
              ),
            );
            throw error;
          });
        await h.page.evaluate(() => {
          for (const img of document.images) img.loading = "eager";
        });
        await h.page.waitForLoadState("networkidle");
        await h.page.evaluate(() => document.fonts.ready);
        await h.page.waitForFunction(() => [...document.images].every(img => img.complete));
        await h.page.addStyleTag({
          content:
            "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }",
        });
        const measurement = await measure(h.page);
        assert.deepEqual(h.errors, [], `${phase} ${name} ${width}`);
        await h.page.screenshot({
          path: path.join(directory, `${name}-${width}.png`),
          fullPage: true,
        });
        rows.push({ name, width, ...measurement });
        console.log(`${phase}: ${name} ${width}`);
      }
    } finally {
      await h.browser.close();
    }
  }
  fs.writeFileSync(
    path.join(__dirname, `${phase}${editing ? "-edit" : ""}.json`),
    JSON.stringify(rows, null, 2) + "\n",
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
