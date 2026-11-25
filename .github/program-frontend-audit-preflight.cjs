/** @format */

const assert = require("node:assert/strict");
const { mkdir } = require("node:fs/promises");
const { launch } = require("../docs/responsive/browser-harness.cjs");
const { program } = require("../docs/responsive/fixtures.cjs");

const root = "/programs/1/management/";
const participants = Array.from({ length: 16 }, (_, index) => ({
  id: index + 1,
  userId: index + 1,
  name: "Участник " + (index + 1),
  email: "qa" + index + "@example.test",
  city: "Москва",
  region: "Москва",
  registeredAt: "2026-10-01T13:00:00Z",
  lastActivity: null,
}));
const criteria = {
  updatedAt: "2026-10-01T13:00:00Z",
  revision: "1",
  locked: false,
  supportedTypes: ["int", "bool", "str"],
  criteria: [
    {
      id: 1,
      name: "Реализуемость",
      description: "Опишите оценку",
      type: "int",
      minValue: 0,
      maxValue: 10,
    },
  ],
};
const output = process.env.REVIEW_OUTPUT;

async function verify(width, colorScheme) {
  const { browser, page, base, context } = await launch(width, { colorScheme });
  await page.addInitScript(scheme => localStorage.setItem("procollab-theme", scheme), colorScheme);
  page.setDefaultTimeout(12000);
  const mock = (path, json) =>
    context.route(
      url => url.pathname === path,
      route => route.fulfill({ headers: { "Access-Control-Allow-Origin": "*" }, json }),
    );
  const button = name => page.getByRole("button", { name, exact: true });
  const height = async locator => (await locator.boundingBox()).height;
  const shot = label => page.screenshot({ path: output + "/" + label + "-" + width + ".png" });
  const close = () =>
    page
      .getByRole("dialog")
      .getByRole("button", { name: /^Закрыть/ })
      .click();

  try {
    await mock(root, {
      ...program,
      name: "Проверочная программа",
      draft: false,
      isCompetitive: true,
      isDistributedEvaluation: true,
      solutionStorageMode: "legacy_project",
      programFormat: "case_championship",
    });
    await mock(root + "participants/", {
      count: participants.length,
      totalCount: participants.length,
      next: null,
      previous: null,
      results: participants,
      regionOptions: ["Москва"],
    });
    await mock(root + "criteria/", criteria);
    await mock("/solution-invitations/", { count: 0, results: [] });
    await mock("/programs/1/solution-evaluation/", {
      count: 0,
      next: null,
      previous: null,
      results: [],
      evaluationCounts: { pending: 0, completed: 0 },
      caseOptions: ["Сложная задача с длинным названием"],
    });

    await page.goto(base + "/office/program/1/solutions-rating");
    await button("Фильтры").click();
    let dialog = page.getByRole("dialog", { name: "Фильтры", exact: true });
    const heading = await dialog.getByRole("heading").boundingBox();
    const cross = await dialog.getByRole("button", { name: "Закрыть", exact: true }).boundingBox();
    const controlSize = width < 1000 ? 44 : 32;
    assert.equal(cross.height, controlSize);
    assert.equal(cross.width, controlSize);
    assert.ok(cross.x > heading.x + heading.width);
    assert.ok(Math.abs(cross.y + cross.height / 2 - heading.y - heading.height / 2) <= 1);
    assert.ok((await height(dialog.getByRole("combobox", { name: "Кейс или задача" }))) >= 44);
    assert.ok((await height(dialog.getByRole("button", { name: "Применить" }))) >= controlSize);
    await shot("solution-filters");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });

    await page.goto(base + "/office/evaluation");
    const tabs = page.getByRole("navigation", { name: "Работы эксперта" });
    await tabs.waitFor();
    const label =
      width < 1000
        ? page.locator(".cabinet .page-header__title")
        : page.locator(".cabinet app-back .back");
    const y = await label.boundingBox();
    const gap = (await tabs.boundingBox()).y - (y.y + y.height);
    assert.ok(gap >= 0 && gap <= 32, "Expert tabs gap: " + gap);
    await shot("expert-cabinet");

    await page.goto(base + "/office/program/1/management/participants");
    await page.getByRole("heading", { name: "Участники · 16" }).waitFor();
    assert.equal(await page.getByRole("searchbox").getAttribute("placeholder"), "Имя или почта");
    if (width < 1000) {
      const [outer, inner] = await page.evaluate(() => {
        const scroll = document.scrollingElement;
        const office = document.querySelector(".office__body");
        return [
          scroll.scrollHeight - scroll.clientHeight,
          office.scrollHeight - office.clientHeight,
        ];
      });
      assert.ok(outer <= 1, "Outer page scroll: " + outer);
      assert.ok(inner > 0, "Missing office scroll");
    }
    await button("Фильтры").click();
    dialog = page.getByRole("dialog", { name: "Фильтры участников" });
    assert.equal(
      await dialog.getByRole("heading").evaluate(el => getComputedStyle(el).fontSize),
      "18px",
    );
    await shot("participant-filters");
    await close();

    await page.goto(base + "/office/program/1/management/settings?tab=criteria");
    await button("Добавить критерий").click();
    dialog = page.getByRole("dialog", { name: "Добавить критерий" });
    const header = await dialog.locator("app-dialog-header header").boundingBox();
    const firstField = await dialog.locator("label").first().boundingBox();
    assert.ok(firstField.y - header.y - header.height <= 21);
    await shot("criteria-editor");
    await close();
    console.log(
      "Verified responsive program and evaluation layout at " + width + "px (" + colorScheme + ").",
    );
  } finally {
    await browser.close();
  }
}

(async () => {
  await mkdir(output, { recursive: true });
  await verify(1440, "light");
  await verify(320, "dark");
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
