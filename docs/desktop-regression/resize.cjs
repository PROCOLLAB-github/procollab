/** @format */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const { launch, assertViewport } = require("../responsive/browser-harness.cjs");
require("../mobile-polish/fixtures.cjs");
(async () => {
  const h = await launch(390);
  const rows = [];
  try {
    await h.page.goto(h.base + "/office/feed");
    await h.page.waitForLoadState("networkidle");
    await h.page.getByRole("button", { name: /свежие вакансии/ }).click();
    await h.page.waitForLoadState("networkidle");
    await h.page.evaluate(() => {
      window.qaFeedRoot = document.querySelector("app-feed .page");
      if (!window.qaFeedRoot) throw new Error("Feed root missing");
    });
    const query = new URL(h.page.url()).search;
    for (const width of [1000, 768, 390]) {
      await h.page.setViewportSize({ width, height: 844 });
      await h.page.waitForFunction(width => innerWidth === width, width);
      await h.page.waitForFunction(
        width => !!document.querySelector("button.control-panel__action") === width < 1000,
        width,
      );
      await assertViewport(h.page);
      assert.equal(new URL(h.page.url()).search, query);
      assert.equal(
        await h.page.evaluate(() => window.qaFeedRoot === document.querySelector("app-feed .page")),
        true,
      );
      rows.push({ screen: "feed", width, preserved: true });
    }
    await h.page.evaluate(() => {
      history.pushState({}, "", "/office/projects/dashboard");
      dispatchEvent(new PopStateEvent("popstate"));
    });
    await h.page.locator("app-dashboard-item").first().waitFor();
    const input = h.page.locator("app-projects app-search input");
    await h.page.locator("app-projects app-search .search").click();
    await input.fill("город");
    await h.page.waitForTimeout(500); // Existing search debounce.
    await h.page.evaluate(() => {
      window.qaDashboard = document.querySelector("app-dashboard-item").parentElement;
    });
    const route = h.page.url();
    for (const width of [1000, 768, 390]) {
      await h.page.setViewportSize({ width, height: 844 });
      await h.page.waitForFunction(
        width => !!document.querySelector("app-projects app-page-header") === width < 1000,
        width,
      );
      await assertViewport(h.page);
      assert.equal(await input.inputValue(), "город");
      assert.equal(h.page.url(), route);
      assert.equal(
        await h.page.evaluate(
          () => window.qaDashboard === document.querySelector("app-dashboard-item").parentElement,
        ),
        true,
      );
      rows.push({ screen: "projects", width, preserved: true });
    }
    assert.deepEqual(h.errors, []);
    fs.writeFileSync(__dirname + "/resize.json", JSON.stringify(rows, null, 2) + "\n");
    console.log("6 resize checks passed; routed hosts, search and filters preserved");
  } finally {
    await h.browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
