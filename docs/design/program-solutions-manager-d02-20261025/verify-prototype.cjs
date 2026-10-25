/** @format */

const fs = require("fs");
const assert = require("assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const root =
  process.env.D02_OUTPUT_DIR || require("path").join(__dirname, "prototype", "manager-v1");
const baseUrl = process.env.D02_BASE_URL || "http://127.0.0.1:8769/manager-v1/";
const allowedOrigin = new URL(baseUrl).origin + "/";
const evidence = {
  kind: "Synthetic HTML prototype only; no backend or Angular verification",
  started: new Date().toISOString(),
  checks: [],
  screenshots: [],
  pageErrors: [],
  failedRequests: [],
  nonStaticRequests: [],
  externalBlocked: {},
};
let browser, page;
const check = (name, details = {}) => evidence.checks.push({ name, status: "PASS", ...details });
const click = action => page.locator(`[data-action="${action}"]`).first().click();
const text = () => page.locator(".modal-body").innerText();
const title = () => page.locator("#dialog-title").innerText();
async function go(format = "kch", width = 1440, screen = "solutions", state = "ready") {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(`${baseUrl}?format=${format}&screen=${screen}&state=${state}`);
  await page.evaluate(() => document.fonts.ready);
}
async function bounds(name) {
  const result = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth <= innerWidth,
    dialog:
      !document.querySelector("dialog").open ||
      document.querySelector("dialog").scrollWidth <=
        document.querySelector("dialog").clientWidth + 1,
    font: getComputedStyle(document.body).fontFamily,
  }));
  assert(result.page && result.dialog, `${name}: overflow ${JSON.stringify(result)}`);
  assert(result.font.includes("Mont"));
}
async function shot(name) {
  await page.screenshot({ path: `${root}/${name}.png`, fullPage: true });
  evidence.screenshots.push(`${name}.png`);
}
async function work(id = 301) {
  const scope = (await page.locator("dialog").evaluate(el => el.open)) ? "dialog" : "#manager-main";
  await page.locator(`${scope} [data-action="solution"][data-id="${id}"]`).first().click();
}
async function apply() {
  await click("admin-apply");
  await page.waitForFunction(() => document.querySelector('[data-action="admin-apply"]') === null);
}
async function pick(ids) {
  for (const id of ids) await page.locator(`[name="registration"][value="${id}"]`).check();
}
async function previewArchive() {
  await work();
  await click("admin-archive");
}
async function casePreview() {
  await work();
  await click("admin-case");
  await page.locator('[name="admin-case"]').selectOption({ label: "Городская среда" });
  await click("admin-case-preview");
}
async function main() {
  browser = await chromium.launch({ headless: true, channel: "chrome" });
  page = await browser.newPage();
  await page.route("**/*", route => {
    const url = route.request().url();
    if (url.startsWith(allowedOrigin)) return route.continue();
    const key = new URL(url).hostname + ":" + route.request().method();
    evidence.externalBlocked[key] = (evidence.externalBlocked[key] || 0) + 1;
    return route.abort();
  });
  page.on("pageerror", e => evidence.pageErrors.push(e.message));
  page.on("requestfailed", r => {
    if (r.url().startsWith(allowedOrigin))
      evidence.failedRequests.push({ url: r.url(), error: r.failure()?.errorText });
  });
  page.on("request", r => {
    if (r.url().startsWith(allowedOrigin) && r.method() !== "GET")
      evidence.nonStaticRequests.push({ url: r.url(), method: r.method() });
  });
  for (const format of ["kch", "hack", "noncompetitive"])
    for (const screen of ["solutions", "evaluation", "results", "analytics"])
      for (const width of [320, 390, 768, 1440]) {
        await go(format, width, screen);
        await bounds(`${format}/${screen}/${width}`);
        assert.equal(await page.locator("[data-screen]").count(), 4);
        check("Existing four-section layout", { format, screen, width });
      }
  for (const state of [
    "ready-draft",
    "loading",
    "empty",
    "no-results",
    "error",
    "no-access",
    "long",
    "open-mode",
  ])
    for (const width of [320, 390, 768, 1440]) {
      await go("kch", width, "analytics", state);
      await bounds(`${state}/${width}`);
      check("Existing page state", { state, width });
    }
  console.log("Matrix PASS: 48 layouts + 32 page states");
  for (const format of ["kch", "hack", "noncompetitive"])
    for (const width of [390, 1440]) {
      await go(format, width);
      await casePreview();
      assert((await text()).includes("Городская среда"));
      await bounds("case preview");
      if (format === "kch") await shot(`admin-case-preview-${width}`);
      await apply();
      assert((await text()).includes("Городская среда"));
      await click("admin-history");
      await click("admin-event");
      assert((await text()).includes("Образование"));
      assert((await text()).includes("Нет"));
      await page.getByRole("tab", { name: "После изменения" }).click();
      assert((await text()).includes("Городская среда"));
      assert((await text()).includes("Нет"));
      if (format === "kch" && width === 1440) await shot("admin-case-history-desktop");
      check("Case change preserves materials/zero/false; before and after", { format, width });
      await go(format, width);
      await work();
      await page.getByRole("tab", { name: "Команда", exact: true }).click();
      assert.equal(await page.getByRole("tab").count(), 2);
      assert((await text()).includes("Ожидают подтверждения · 1"));
      await page.locator('[data-action="admin-remove-member"][data-person="2"]').click();
      await bounds("member preview");
      await apply();
      assert((await text()).includes("Принятые участники: 2"));
      assert(!(await page.locator('[role="tabpanel"]').innerText()).includes("Мария Климова"));
      await click("admin-history");
      await click("admin-event");
      assert((await text()).includes("Мария Климова"));
      await page.getByRole("tab", { name: "После изменения" }).click();
      assert(!(await text()).includes("Мария Климова"));
      check("Accepted member removal; captain protected; original roster retained", {
        format,
        width,
      });
      await go(format, width);
      await previewArchive();
      await bounds("archive preview");
      if (format === "kch") await shot(`admin-archive-preview-${width}`);
      await apply();
      assert((await title()).includes("Сервис"));
      assert((await page.locator(".modal-header").innerText()).includes("Архив"));
      assert.equal(
        await page
          .locator(
            '[data-action="admin-case"],[data-action="admin-archive"],[data-action="admin-remove-member"]',
          )
          .count(),
        0,
      );
      await page.getByRole("tab", { name: "Команда", exact: true }).click();
      assert((await text()).includes("Принятые участники: 3"));
      assert(!(await text()).includes("Приглашение отправлено"));
      if (format === "kch" && width === 390) await shot("admin-archived-team-mobile");
      assert.equal(await page.locator('[data-action="work-scores"]').count(), 0);
      assert((await text()).includes("Оценки сохранены"));
      await click("close");
      assert.equal(
        await page.locator('#manager-main [data-action="solution"][data-id="301"]').count(),
        0,
      );
      await page.locator('[data-action="admin-scope"][data-scope="archived"]').click();
      assert.equal(
        await page.locator('#manager-main [data-action="solution"][data-id="301"]').count(),
        2,
      );
      await bounds("archive list");
      check(
        "Archive readonly; materials/team retained, ratings preservation explained; active list excludes it",
        { format, width },
      );
      await go(format, width);
      await click("admin-people");
      await pick([1, 5, 9, 10]);
      await click("admin-registration-preview");
      assert((await text()).includes("Виктория Орлова"));
      assert((await text()).includes("Исключение: Андрей Сергеев"));
      await bounds("registration preview");
      if (format === "kch") await shot(`admin-registration-preview-${width}`);
      await apply();
      assert.equal(await title(), "Удаление регистраций");
      assert((await text()).includes("Учетные записи участников сохранены"));
      await click("close");
      await click("admin-people");
      assert.equal(await page.locator('[name="registration"]').count(), 8);
      assert.equal(
        await page
          .locator(
            '[name="registration"][value="1"],[name="registration"][value="5"],[name="registration"][value="9"],[name="registration"][value="10"]',
          )
          .count(),
        0,
      );
      check("Bulk registration removal: captain/member/pending/unaffiliated, independent audit", {
        format,
        width,
      });
    }
  console.log("Six format/viewport administrative journeys PASS");
  for (const ids of [[9], [10]]) {
    await go();
    await click("admin-people");
    await pick(ids);
    await click("admin-registration-preview");
    await apply();
    assert.equal(await title(), "Удаление регистраций");
    if (ids[0] === 10) assert((await text()).includes("Активные решения не затронуты"));
    await click("close");
    await work();
    await page.getByRole("tab", { name: "Команда", exact: true }).click();
    assert((await text()).includes("Принятые участники: 3"));
    check("Pending-only/no-solution independent audit", { ids });
  }
  await go();
  await previewArchive();
  await apply();
  await click("close");
  await click("admin-people");
  await pick([1]);
  await click("admin-registration-preview");
  await apply();
  assert((await text()).includes("Активные решения не затронуты"));
  await click("close");
  await page.locator('[data-action="admin-scope"][data-scope="archived"]').click();
  await work();
  await click("admin-history");
  assert.equal(await page.locator(".admin-history li").count(), 1);
  check("Removing registration after archive keeps its roster and earlier history");
  for (const mode of ["stale", "error", "no-access"]) {
    await go("kch", 390);
    await page.locator("#action-response").selectOption(mode);
    await previewArchive();
    await click("admin-apply");
    assert.equal(await page.locator('[role="alert"]').count(), 1);
    assert(await page.locator('[data-action="admin-apply"]').isDisabled());
    await bounds(mode);
    if (mode === "stale") await shot("admin-stale-mobile");
    await click("admin-refresh-preview");
    if (mode !== "no-access") await apply();
    else assert(!(await page.locator("dialog").evaluate(el => el.open)));
    check("Action failure is recoverable and requires fresh confirmation", { mode });
  }
  await go("kch", 390);
  await page.locator("#action-response").selectOption("legacy");
  await click("admin-people");
  await pick([1, 5]);
  await click("admin-registration-preview");
  assert((await text()).includes("Вся операция остановлена"));
  assert(await page.locator('[data-action="admin-apply"]').isDisabled());
  await bounds("legacy");
  await shot("admin-legacy-conflict-mobile");
  await click("back");
  assert.equal(await page.locator('[name="registration"]').count(), 12);
  assert.equal(await page.locator('[name="registration"]:checked').count(), 2);
  check("Mixed Project conflict blocks entire command, selection retained");
  await go("kch", 390);
  await page.locator("#action-response").selectOption("loading");
  await previewArchive();
  assert.equal(
    await page.locator('[aria-label="Загрузка предпросмотра"][aria-busy="true"]').count(),
    1,
  );
  await bounds("preview loading");
  await click("close");
  check("Preview loading can be dismissed without mutation");
  await go("kch", 390);
  await work();
  await page.getByRole("tab", { name: "Решение", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.getByRole("tab", { name: "Команда", exact: true }).getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("Home");
  assert.equal(
    await page.getByRole("tab", { name: "Решение", exact: true }).getAttribute("aria-selected"),
    "true",
  );
  await page.locator('[data-action="close"]').focus();
  await page.keyboard.press("Tab");
  assert(await page.locator("dialog").evaluate(el => el.contains(document.activeElement)));
  await page.keyboard.press("Escape");
  assert(!(await page.locator("dialog").evaluate(el => el.open)));
  assert(
    await page
      .locator('[data-action="solution"][data-id="301"]')
      .first()
      .evaluate(el => el === document.activeElement),
  );
  check("Keyboard tabs, focus containment, Escape, return focus");
  await go();
  await previewArchive();
  await click("admin-apply");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);
  assert((await page.locator(".modal-header").innerText()).includes("Архив"));
  check("Apply blocks repeat/close while busy; completed state stays visible");
  await go("kch", 390);
  await click("filters");
  await page.locator('[name="fieldId"]').selectOption("30");
  await page.locator('[name="answer"]').selectOption("present");
  assert((await page.locator("#manager-main").innerText()).includes("Сервис поддержки студентов"));
  await page.locator('[name="fieldId"]').selectOption("31");
  assert((await page.locator("#manager-main").innerText()).includes("Сервис поддержки студентов"));
  await page.locator('[name="fieldId"]').selectOption("32");
  await page.locator('[name="answer"]').selectOption("not_applicable");
  assert((await page.locator("#manager-main").innerText()).includes("Сервис поддержки студентов"));
  check("Existing field filters preserve zero, false, not-applicable");
  await go("kch", 1440, "analytics");
  await click("case");
  await work();
  await page.getByRole("tab", { name: "Команда", exact: true }).click();
  await click("back");
  assert((await title()).includes("Кейс"));
  await click("close");
  check("Existing analytics drilldown / team / back");
  await go("kch", 1440, "evaluation");
  await click("allocation");
  assert((await text()).includes("Назначений с оценками, сохраняются"));
  await click("apply-allocation");
  check("Existing allocation preview and apply");
  await go("kch", 1440, "analytics");
  await page.locator('[data-action="people"][data-kind="without-team"]').click();
  await click("reminder-preview");
  assert((await text()).includes("Создайте решение или присоединитесь к команде"));
  await click("send-reminder");
  check("Existing reminder preview");
  await go("kch", 1440, "results");
  await click("work-scores");
  await click("score-detail");
  assert((await text()).includes("Нет"));
  check("Existing completed zero/false score");
  for (const format of ["kch", "hack"])
    for (const width of [390, 1440]) {
      await go(format, width, "solutions", "ready-draft");
      await work(304);
      await click("admin-submit");
      assert(!(await page.locator('[data-action="admin-apply"]').isDisabled()));
      await bounds("first-submit");
      if (format === "kch" && width === 390) await shot("admin-submit-preview-mobile");
      await apply();
      assert.equal(await page.locator('[data-action="admin-submit"]').count(), 0);
      assert((await page.locator(".modal-header").innerText()).includes("Сдано"));
      check("Manager first submission: ready draft, no second-submit control", { format, width });
      await go(format, width);
      await work(304);
      await click("admin-submit");
      assert(await page.locator('[data-action="admin-apply"]').isDisabled());
      assert((await text()).includes("Сдача пока недоступна"));
      check("Incomplete first submission is blocked with field names", { format, width });
    }
  await go("noncompetitive", 390);
  await work(304);
  assert.equal(await page.locator('[data-action="admin-submit"]').count(), 0);
  check("Noncompetitive format has no artificial submit action");
  await go();
  await work();
  await page.getByRole("tab", { name: "Команда", exact: true }).click();
  await page.locator('[data-action="admin-remove-member"][data-person="2"]').click();
  await apply();
  await click("close");
  await page.locator("#program-format").selectOption("hack");
  await work();
  await page.getByRole("tab", { name: "Команда", exact: true }).click();
  assert((await text()).includes("Принятые участники: 3"));
  await click("close");
  await page.locator('[data-screen="analytics"]').click();
  assert((await page.locator('[data-metric="participants"]').innerText()).includes("12"));
  check("Changing review format resets local mutations and team counters");
  await go();
  await previewArchive();
  await apply();
  await click("close");
  await page.locator('[data-action="admin-scope"][data-scope="archived"]').click();
  assert.equal(
    await page.locator('[data-action="filters"],[data-action="export-found"]').count(),
    0,
  );
  await page.locator('[name="search"]').fill("поддержки");
  await page.locator(".search-form button").click();
  assert((await page.locator("#manager-main").innerText()).includes("Сервис поддержки"));
  check("Archive uses separate supported search without active-only fields/export");
  assert.deepEqual(evidence.pageErrors, []);
  assert.deepEqual(evidence.failedRequests, []);
  assert.deepEqual(evidence.nonStaticRequests, []);
  evidence.finished = new Date().toISOString();
  evidence.status = "PASS";
  evidence.count = evidence.checks.length;
}
main()
  .catch(error => {
    evidence.status = "FAIL";
    evidence.error = error.stack;
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    fs.writeFileSync(`${root}/admin-qa-evidence.json`, JSON.stringify(evidence, null, 2) + "\n");
    if (browser) await browser.close();
    console.log(
      JSON.stringify({
        status: evidence.status,
        checks: evidence.checks.length,
        pageErrors: evidence.pageErrors,
        nonStaticRequestCount: evidence.nonStaticRequests.length,
        externalBlocked: evidence.externalBlocked,
      }),
    );
  });
