/** @format */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch, open, base } = require("./browser-check.cjs");
const fixtures = require("./fixtures.cjs");
const { measure } = require("../responsive/browser-harness.cjs");
const destination = path.join(__dirname, "screenshots", "after", "states");
fs.mkdirSync(destination, { recursive: true });
const results = [];
async function record(name, width, action) {
  const { browser, context, page, errors } = await launch(width);
  page.setDefaultTimeout(7000);
  try {
    await action({ context, page });
    await page.waitForTimeout(100);
    const metrics = await measure(page);
    assert.equal(metrics.overflows.length, 0, JSON.stringify(metrics.overflows));
    assert.ok(metrics.pageWidth <= width + 1);
    const runtimeErrors = errors.filter(
      e => !e.startsWith("Failed to load resource:") && !/\[ERROR\] \[HTTP\].* (403|503) /.test(e),
    );
    assert.deepEqual(runtimeErrors, []);
    const file = `${name}-${width}.png`;
    await page.screenshot({ path: path.join(destination, file), fullPage: true });
    results.push({ name, width, file, passed: true, metrics });
    console.log(`${name} ${width}: PASS`);
  } catch (error) {
    results.push({ name, width, passed: false, error: error.message });
    console.log(`${name} ${width}: FAIL ${error.message.split("\n")[0]}`);
  } finally {
    await browser.close();
  }
}
async function run() {
  for (const width of [320, 390, 768, 1440, 1920]) {
    await record("experts-empty", width, async ({ context, page }) => {
      await context.route("**/programs/12/management/experts/", r =>
        r.fulfill({ json: { ...fixtures.roster(), experts: [] } }),
      );
      await open(page, "v2", "experts", "experts");
      await page
        .getByText("Экспертов пока нет. Пригласите первого эксперта по email.", { exact: true })
        .waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Выгрузить экспертов в Excel" }).isDisabled(),
        true,
      );
    });
    await record("experts-error-retry", width, async ({ context, page }) => {
      let calls = 0,
        recover = false;
      await context.route("**/programs/12/management/experts/", r => {
        calls++;
        return r.fulfill(
          !recover
            ? { status: 503, json: { detail: "Временная ошибка" } }
            : { json: fixtures.roster() },
        );
      });
      await open(page, "v2", "experts", "experts");
      await page
        .getByRole("alert")
        .filter({ hasText: "Не удалось загрузить экспертов" })
        .waitFor({ timeout: 20000 });
      await page.screenshot({
        path: path.join(destination, `experts-error-${width}.png`),
        fullPage: true,
      });
      recover = true;
      await page.getByRole("button", { name: "Повторить", exact: true }).click();
      await page.waitForFunction(
        () => document.querySelectorAll(".experts__table tr[data-expert-id]").length === 5,
      );
      assert.ok(calls >= 2);
    });
    await record("experts-loading", width, async ({ context, page }) => {
      let release;
      const pending = new Promise(resolve => {
        release = resolve;
      });
      await context.route("**/programs/12/management/experts/", async r => {
        await pending;
        await r.fulfill({ json: fixtures.roster() });
      });
      await page.goto(`${base}/office/program/12/management/experts`);
      await page.getByText("Загружаем экспертов и решения…", { exact: true }).waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Пригласить эксперта" }).isDisabled(),
        true,
      );
      await page.screenshot({
        path: path.join(destination, `experts-pending-${width}.png`),
        fullPage: true,
      });
      release();
      await page.waitForFunction(
        () => document.querySelectorAll(".experts__table tr[data-expert-id]").length === 5,
      );
    });
    await record("analytics-loading", width, async ({ context, page }) => {
      let release;
      const pending = new Promise(resolve => {
        release = resolve;
      });
      await context.route("**/programs/12/management/solution-analytics/", async r => {
        await pending;
        await r.fulfill({ json: fixtures.scenario("manager_solution_analytics_distributed") });
      });
      await page.goto(`${base}/office/program/12/management/analytics`);
      await page.locator("app-solution-analytics .summary--loading").waitFor();
      await page.screenshot({
        path: path.join(destination, `analytics-pending-${width}.png`),
        fullPage: true,
      });
      release();
      await page.locator("app-solution-analytics .summary-card__value").first().waitFor();
    });
    await record("no-access", width, async ({ context, page }) => {
      await context.route("**/programs/12/management/", r =>
        r.fulfill({
          status: 403,
          json: { detail: "Недостаточно прав для управления программой." },
        }),
      );
      await page.goto(`${base}/office/program/12/management/settings?tab=basic`);
      await page.locator(".management__card.ui-alert--error").waitFor();
      assert.equal(await page.locator("#program-name").count(), 0);
    });
    await record("noncompetitive-solutions", width, async ({ context, page }) => {
      await context.route("**/programs/12/management/", r =>
        r.fulfill({
          json: {
            ...fixtures.response(new URL(r.request().url()), "GET"),
            isCompetitive: false,
            programFormat: "noncompetitive",
          },
        }),
      );
      await open(page, "v2", "projects", "projects");
      await page.locator(".management__table tbody input[type=checkbox]").first().check();
      assert.equal(
        await page.getByRole("button", { name: "Сдать решения", exact: true }).isDisabled(),
        true,
      );
      assert.equal(
        await page.getByRole("button", { name: "Назначить экспертов", exact: true }).isDisabled(),
        true,
      );
      await page.getByText("Не применяется", { exact: true }).first().waitFor();
    });
    for (const version of ["v1", "v2"])
      await record(`${version}-filters-keyboard`, width, async ({ page }) => {
        await open(page, version, "experts", "experts");
        const trigger = page.locator(".experts__filter-trigger");
        await trigger.focus();
        await page.keyboard.press("Enter");
        await page.getByRole("dialog").waitFor();
        await page.waitForFunction(() => !!document.activeElement?.closest('[role="dialog"]'));
        for (let i = 0; i < 7; i++) {
          await page.keyboard.press("Tab");
          assert.equal(
            await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')),
            true,
          );
        }
        await page.keyboard.press("Escape");
        await page.getByRole("dialog").waitFor({ state: "hidden" });
        await page.waitForFunction(
          () => document.activeElement === document.querySelector(".experts__filter-trigger"),
        );
        assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
      });
  }
  fs.writeFileSync(path.join(__dirname, "state-results.json"), JSON.stringify(results, null, 2));
  if (results.some(r => !r.passed)) process.exitCode = 1;
}
run().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
