/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch } = require("../responsive/browser-harness.cjs");
require("../mobile-polish/fixtures.cjs");
const phase = process.argv[2],
  baseUrl = process.argv[3];
(async () => {
  const directory = path.join(__dirname, "screenshots", phase);
  fs.mkdirSync(directory, { recursive: true });
  const rows = [];
  for (const width of [1440, 1920]) {
    const h = await launch(width, { baseUrl });
    let release;
    const pending = new Promise(resolve => {
      release = resolve;
    });
    try {
      await h.page.goto(baseUrl + "/office/feed");
      await h.page.waitForLoadState("networkidle");
      await h.page.evaluate(() => {
        history.pushState({}, "", "/office/courses/1/lesson/1");
        dispatchEvent(new PopStateEvent("popstate"));
      });
      await h.page.locator("app-write-task textarea").fill("Ответ для финальной проверки UI Kit");
      await h.page.waitForLoadState("networkidle");
      await h.page.evaluate(() => {
        for (const img of document.images) img.loading = "eager";
      });
      await h.page.waitForLoadState("networkidle");
      await h.page.evaluate(() => document.fonts.ready);
      await h.page.waitForFunction(() => [...document.images].every(img => img.complete));
      await h.page.addStyleTag({
        content:
          "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}",
      });
      await h.context.route("**/courses/tasks/1/answer/", async route => {
        await pending;
        await route.fulfill({ json: {} });
      });
      await h.page.getByRole("button", { name: "завершить урок", exact: true }).click();
      await h.page.locator("app-button app-loader").waitFor();
      if (phase === "desktop-after") {
        const action = h.page.getByRole("button", { name: "завершить урок", exact: true });
        assert.equal(await action.isDisabled(), true);
        assert.equal(await action.getAttribute("aria-busy"), "true");
      }
      // Avoid incidental hover; compare the loading presentation itself.
      await h.page.mouse.move(0, 0);
      assert.deepEqual(h.errors, []);
      await h.page.screenshot({
        path: path.join(directory, `loading-action-${width}.png`),
        fullPage: true,
      });
      rows.push({ name: "loading-action", width, passed: true });
      console.log(`${phase}: loading-action ${width}`);
    } finally {
      release();
      await h.browser.close();
    }
  }
  fs.writeFileSync(
    path.join(__dirname, phase + "-loading.json"),
    JSON.stringify(rows, null, 2) + "\n",
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
