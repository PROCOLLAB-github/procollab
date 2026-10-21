/** @format */

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const output = process.env.QA_OUTPUT || "tmp/vacancy-archive-qa";
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const page = await browser.newPage({ hasTouch: true });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  let checks = 0;
  const check = (value, message) => {
    assert.ok(value, message);
    checks++;
  };
  const root = "http://127.0.0.1:4371/office/projects/5/edit?archive";
  const open = async (width = 1440, stress = false) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(root + (stress ? "&stress" : ""));
    await page.waitForSelector("app-vacancy-card");
    await page.evaluate(() => document.fonts.ready);
  };
  const confirm = () => page.getByRole("dialog");
  const calls = () => page.evaluate(() => window.__vacancyPreview.lifecycle.calls);
  const succeed = () => page.evaluate(() => window.__vacancyPreview.lifecycle.succeed());
  const fail = (status, code) =>
    page.evaluate(([s, c]) => window.__vacancyPreview.lifecycle.fail(s, c), [status, code]);
  for (const width of [1440, 768, 390, 320]) {
    await open(width, width === 320);
    const geometry = await page.getByRole("tab").evaluateAll(nodes =>
      nodes.map(n => ({
        height: n.getBoundingClientRect().height,
        right: n.getBoundingClientRect().right,
        width: n.getBoundingClientRect().width,
      })),
    );
    check(
      geometry.every(r => r.height === 27),
      `tabs are 27px at ${width}`,
    );
    check(
      geometry.every(r => r.right <= width + 1),
      `tabs within viewport ${width}`,
    );
    check(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `no horizontal overflow ${width}`,
    );
    check(
      await page.evaluate(() =>
        [...document.fonts].some(f => /Mont/.test(f.family) && f.status === "loaded"),
      ),
      "Mont is loaded",
    );
    check((await page.getByRole("tab", { name: "Активные · 2" }).count()) === 1, "active count");
    check((await page.getByRole("tab", { name: "Архивные · 2" }).count()) === 1, "archived count");
    const active = page.getByRole("tab", { name: "Активные · 2" });
    await active.focus();
    if (width <= 390) {
      const bounds = await page.locator("#vacancy-tab-archived").boundingBox();
      await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height + 4);
      await page.locator('#vacancy-tab-archived[aria-selected="true"]').waitFor();
      check(true, "touch target extends beyond the 27px surface");
      await page.locator("#vacancy-tab-archived").press("Home");
      await page.locator('#vacancy-tab-active[aria-selected="true"]').waitFor();
    }
    await active.press("ArrowRight");
    await page.locator('#vacancy-tab-archived[aria-selected="true"]').waitFor();
    check(
      (await page.getByRole("tab", { name: "Архивные · 2" }).getAttribute("aria-selected")) ===
        "true",
      "keyboard selection",
    );
    check(
      (await page.getByText("Вернуть в активные", { exact: true }).count()) === 2,
      "restore actions",
    );
    await page.getByRole("tab", { name: "Архивные · 2" }).press("Home");
    await page.locator('#vacancy-tab-active[aria-selected="true"]').waitFor();
    const card = page.locator("app-vacancy-card").first();
    await card.getByRole("button", { name: "Удалить", exact: true }).click();
    await confirm().waitFor();
    check(
      await confirm()
        .innerText()
        .then(t => t.includes("нельзя удалить") && t.includes("Ожидающие решения")),
      "delete restriction and consequences",
    );
    check(
      await confirm().evaluate(n => {
        const r = n.getBoundingClientRect();
        return r.x >= 0 && r.right <= innerWidth + 1;
      }),
      `modal fits ${width}`,
    );
    await page.screenshot({ path: `${output}/archive-modal-${width}.png`, fullPage: true });
    await page.keyboard.press("Escape");
    await confirm().waitFor({ state: "detached" });
    check((await calls()) === 0, "cancel never calls API");
  }
  await open();
  await page
    .locator("app-vacancy-card")
    .first()
    .getByRole("button", { name: "В архив", exact: true })
    .click();
  await confirm().getByRole("button", { name: "Перенести в архив", exact: true }).click();
  check((await calls()) === 1, "archive calls API once");
  check(
    (await page.getByRole("tab", { name: "Активные · 2" }).count()) === 1,
    "count waits for API",
  );
  await fail(500);
  await confirm().getByRole("alert").waitFor();
  check(
    (await page.getByRole("tab", { name: "Архивные · 2" }).count()) === 1,
    "failure preserves lists",
  );
  await confirm().getByRole("button", { name: "Перенести в архив", exact: true }).click();
  await succeed();
  await confirm().waitFor({ state: "detached" });
  await page.getByRole("tab", { name: "Активные · 1" }).waitFor();
  check(
    (await page.getByRole("tab", { name: "Архивные · 3" }).count()) === 1,
    "archive counts after success",
  );
  check(
    await page.locator("#vacancy-tab-active").evaluate(n => document.activeElement === n),
    "focus returns to surviving tab",
  );
  await page.getByRole("tab", { name: "Архивные · 3" }).click();
  const restored = page.locator("app-vacancy-card").first();
  await restored.getByRole("button", { name: "Вернуть в активные", exact: true }).click();
  check(
    await confirm()
      .innerText()
      .then(t => t.includes("Отклоненные отклики не вернутся")),
    "restore preserves past decisions",
  );
  await confirm().getByRole("button", { name: "Вернуть в активные", exact: true }).click();
  await succeed();
  await confirm().waitFor({ state: "detached" });
  check(
    (await page.getByRole("tab", { name: "Активные · 2" }).count()) === 1,
    "restore active count",
  );
  await page.getByRole("tab", { name: "Активные · 2" }).click();
  await page
    .locator("app-vacancy-card")
    .filter({ has: page.getByRole("heading", { name: "QA", exact: true }) })
    .getByRole("button", { name: "Удалить", exact: true })
    .click();
  await confirm().getByRole("button", { name: "Удалить вакансию", exact: true }).click();
  await fail(400, "vacancy_has_responses");
  await confirm().getByRole("heading", { name: "Вакансию нельзя удалить", exact: true }).waitFor();
  check(
    (await confirm()
      .getByRole("heading", { name: "Вакансию нельзя удалить", exact: true })
      .count()) === 1,
    "new response race is visible",
  );
  await confirm().getByRole("button", { name: "Отмена", exact: true }).click();
  await confirm().waitFor({ state: "detached" });
  await page
    .locator("app-vacancy-card")
    .filter({ has: page.getByRole("heading", { name: "QA", exact: true }) })
    .getByRole("button", { name: "Удалить", exact: true })
    .click();
  await confirm().getByRole("button", { name: "Удалить вакансию", exact: true }).click();
  await succeed();
  await confirm().waitFor({ state: "detached" });
  check((await page.getByRole("tab", { name: "Активные · 1" }).count()) === 1, "deletion count");
  await page.evaluate(() => window.__vacancyPreview.projectUi.applySetVacancies([]));
  await page.getByText("Нет активных вакансий", { exact: true }).waitFor();
  await page.getByRole("tab", { name: "Архивные · 0" }).click();
  await page.getByText("В архиве пока пусто", { exact: true }).waitFor();
  checks += 2;
  check(errors.length === 0, `no browser errors: ${errors.join("; ")}`);
  fs.writeFileSync(
    `${output}/browser-results.json`,
    JSON.stringify(
      {
        checks,
        errors,
        widths: [1440, 768, 390, 320],
        scope: "local Angular browser fixtures; no live API mutations",
      },
      null,
      2,
    ),
  );
  await browser.close();
  console.log(JSON.stringify({ checks, errors }));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
