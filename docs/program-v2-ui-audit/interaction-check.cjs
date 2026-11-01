/** @format */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch, open } = require("./browser-check.cjs");
const { measure } = require("../responsive/browser-harness.cjs");
const fixtures = require("./fixtures.cjs");
const phase = process.argv[2] || "after";
const widths = (process.env.WIDTHS || "320,390,768,1440,1920").split(",").map(Number);
const destination = path.join(__dirname, "screenshots", phase, "details");
fs.mkdirSync(destination, { recursive: true });
const results = [];
const button = (page, name) => page.getByRole("button", { name, exact: true });
const dialog = page => page.getByRole("dialog");
const menu = async (page, container) => {
  const root =
    container === ".experts__table" && !(await page.locator(container).count())
      ? ".solution-analytics__table"
      : container;
  await page
    .locator(root)
    .getByRole("button", { name: /Действия|Назначения/ })
    .first()
    .click();
  await page.getByRole("menu").waitFor();
};
const scenarios = [
  ["participants-filters", "participants", p => p.locator(".management__filter-trigger").click()],
  ["participants-sort", "participants", p => p.locator(".management__sort-trigger").click()],
  [
    "participant-answers",
    "participants",
    async p => {
      await menu(p, ".management__table");
      await p.getByRole("menuitem", { name: "Посмотреть анкету" }).click();
    },
  ],
  ["projects-filters", "projects", p => p.locator(".management__filter-trigger").click()],
  ["projects-menu", "projects", p => menu(p, ".management__table")],
  [
    "legacy-evaluation",
    "projects/31/evaluation",
    async p => {
      await p.locator("app-result-project-scores").waitFor();
      await p.getByRole("link", { name: "Открыть проект", exact: true }).waitFor();
      assert.equal(await p.getByRole("link", { name: "Открыть решение", exact: true }).count(), 0);
    },
    "v1",
  ],
  [
    "solution-detail",
    "projects",
    async p => {
      await p.locator(".management__solution-link").first().click();
      await p.locator("app-solution-fields").waitFor();
    },
    "v2",
  ],
  [
    "solution-team",
    "projects",
    async p => {
      await p.locator(".management__solution-link").first().click();
      await button(p, "Команда").click();
    },
    "v2",
  ],
  [
    "solution-history",
    "projects",
    async p => {
      await p.locator(".management__solution-link").first().click();
      await button(p, "История изменений").click();
    },
    "v2",
  ],
  [
    "solution-case-change",
    "projects",
    async p => {
      await menu(p, ".management__table");
      await p.getByRole("menuitem", { name: "Сменить кейс", exact: true }).click();
      await dialog(p).locator("select").selectOption("Операционная эффективность");
    },
    "v2",
  ],
  [
    "solution-archive-preview",
    "projects",
    async p => {
      await menu(p, ".management__table");
      await p.getByRole("menuitem", { name: "Открепить от программы", exact: true }).click();
      await p.getByRole("heading", { name: "Открепить от программы", exact: true }).waitFor();
    },
    "v2",
  ],
  [
    "solution-submit-preview",
    "projects",
    async p => {
      await p.context().route("**/programs/12/management/solution-analytics/solutions/**", r => {
        const data = fixtures.response(new URL(r.request().url()), "GET");
        data.results[0] = {
          ...data.results[0],
          submissionStatus: "draft",
          evaluationStatus: "not_submitted",
          assignmentsTotal: 0,
          assignmentsCompleted: 0,
        };
        return r.fulfill({ json: data });
      });
      await p.reload();
      await p.locator(".management__table tbody input[type=checkbox]").first().check();
      await button(p, "Сдать решения").click();
      await p.getByRole("heading", { name: "Сдать решение за команду", exact: true }).waitFor();
    },
    "v2",
  ],
  [
    "solution-member-preview",
    "projects",
    async p => {
      await p.locator(".management__solution-link").first().click();
      await button(p, "Команда").click();
      await button(p, "Исключить участника").click();
      await p.getByRole("heading", { name: "Исключить участника", exact: true }).waitFor();
    },
    "v2",
  ],
  [
    "registration-removal-preview",
    "participants",
    async p => {
      await menu(p, ".management__table");
      await p.getByRole("menuitem", { name: "Удалить из программы", exact: true }).click();
      await p
        .getByRole("heading", { name: "Удалить участников из программы?", exact: true })
        .waitFor();
    },
    "v2",
  ],
  ["experts-invite", "experts", p => button(p, "Пригласить эксперта").click()],
  [
    "experts-filter-dialog",
    "experts",
    async p => {
      await p.locator(".experts__filter-trigger").click();
      await dialog(p).waitFor();
    },
  ],
  ["experts-menu", "experts", p => menu(p, ".experts__table")],
  [
    "experts-scope",
    "experts",
    async p => {
      await menu(p, ".experts__table");
      await p.getByRole("menuitem", { name: "Изменить кейсы" }).click();
    },
  ],
  [
    "experts-bulk",
    "experts",
    async p => {
      await p.locator(".experts__table tbody input[type=checkbox]").first().check();
      await p.getByRole("region", { name: /Действия/ }).count();
    },
  ],
  [
    "experts-filters",
    "experts",
    async (p, v) => {
      if (phase.startsWith("before") && v === "v2") {
        await p.locator('select[aria-label="Статус эксперта"]').selectOption("expired");
        return;
      }
      const trigger = p.locator(".experts__filter-trigger");
      await trigger.click();
      await dialog(p).waitFor();
      await dialog(p).locator("select").first().selectOption("expired");
      await button(p, "Применить").click();
      await p.waitForFunction(
        () => document.querySelectorAll(".experts__table tbody tr[data-expert-id]").length === 1,
      );
      assert.equal(await p.locator(".experts__table tbody tr[data-expert-id]").count(), 1);
      await trigger.click();
      await button(p, "Сбросить").click();
      await button(p, "Применить").click();
      await p.waitForFunction(
        () => document.querySelectorAll(".experts__table tbody tr[data-expert-id]").length === 5,
      );
      assert.equal(await p.locator(".experts__table tbody tr[data-expert-id]").count(), 5);
    },
  ],
  [
    "experts-no-results",
    "experts",
    async p => {
      await p.locator(".experts__toolbar input[type=search]").fill("Несуществующий эксперт");
      await p.getByText(/Эксперты не найдены|Экспертов не найдено/).waitFor();
    },
  ],
  [
    "expert-solution-assignments",
    "experts",
    async p => {
      await menu(p, ".experts__table");
      await p.getByRole("menuitem", { name: "Назначить решения" }).click();
    },
    "v2",
  ],
  [
    "distribution-quota",
    "experts",
    async (p, v) => {
      await button(p, "Распределение экспертов").click();
      if (phase.startsWith("before") && v === "v2")
        await p.getByRole("button", { name: /^Оценщиков:/ }).click();
      else await p.locator(".experts__quota").getByRole("button", { name: "Изменить" }).click();
    },
  ],
  [
    "distribution-row-menu",
    "experts",
    async p => {
      await button(p, "Распределение экспертов").click();
      await p.locator(".experts__table--solutions").waitFor();
      const rows = p.locator(".experts__table--solutions tbody tr");
      for (const row of await rows.all()) {
        const trigger = row.getByRole("button", { name: /^Назначения решения:/ });
        const parent = await row.boundingBox(),
          control = await trigger.boundingBox();
        assert.ok(
          parent &&
            control &&
            control.x >= parent.x &&
            control.x + control.width <= parent.x + parent.width + 1,
          "Меню должно помещаться по ширине строки решения",
        );
        assert.ok(
          control.y >= parent.y && control.y + control.height <= parent.y + parent.height + 1,
          "Меню должно принадлежать своей строке решения",
        );
      }
      await rows
        .first()
        .getByRole("button", { name: /^Назначения решения:/ })
        .click();
      await p.getByRole("menuitem", { name: "Назначить экспертов", exact: true }).waitFor();
    },
    "v2",
  ],
  [
    "distribution-allocation",
    "experts",
    async p => {
      await button(p, "Распределение экспертов").click();
      await p.getByRole("button", { name: /^Распределить/ }).click();
    },
  ],
  ["results-filters", "results", p => p.getByRole("button", { name: /^Фильтры/ }).click()],
  ["results-formula", "results", p => button(p, "Как считается балл").click()],
  ["results-export", "results", p => button(p, "Выгрузить результаты в Excel").click()],
  ["results-scores", "results", p => p.locator(".results__row").first().click()],
  [
    "settings-basic-save",
    "settings?tab=basic",
    async (p, v, requests) => {
      await p.locator("#program-name").fill("Кейс-чемпионат — проверка сохранения");
      await button(p, "Сохранить изменения").click();
      await p.getByText("Изменения сохранены.", { exact: true }).waitFor();
      assert.ok(
        requests.some(
          r =>
            r.method === "PATCH" &&
            r.path === `/programs/${v === "v1" ? 1 : 12}/management/settings/basic/`,
        ),
      );
    },
  ],
  ["settings-material", "settings?tab=materials", p => button(p, "Добавить материал").click()],
  ["settings-field-editor", "settings?tab=project-form", p => button(p, "Добавить поле").click()],
  [
    "settings-field-preview",
    "settings?tab=project-form",
    p => p.getByRole("button", { name: /^Предпросмотр формы/ }).click(),
  ],
  ["criteria-editor", "settings?tab=criteria", p => button(p, "Добавить критерий").click()],
  [
    "criteria-preview",
    "settings?tab=criteria",
    p => p.getByRole("button", { name: /^Предпросмотр/ }).click(),
  ],
  [
    "organizers-invite",
    "settings?tab=organizers",
    p => p.locator(".organizers__heading > button").click(),
  ],
  ["registration-editor", "settings?tab=registration", p => button(p, "Добавить поле").click()],
  ["registration-preview", "settings?tab=registration", p => button(p, "Предпросмотр").click()],
  ["certificate-issue", "certificates", p => button(p, "2. Выдача").click()],
  ["certificate-journal", "certificates", p => button(p, "3. Отправление").click()],
  [
    "certificate-editor",
    "certificates",
    p => p.getByRole("button", { name: /Открыть редактор|Развернуть редактор/ }).click(),
  ],
  ["analytics-export", "analytics", p => button(p, "Выгрузить данные программы").click()],
  [
    "analytics-lower",
    "analytics",
    async p => {
      await p
        .getByRole("heading", { name: "Динамика активности", exact: true })
        .scrollIntoViewIfNeeded();
    },
  ],
  [
    "analytics-progress",
    "analytics",
    async p => {
      await p
        .getByRole("heading", { name: "Ход оценивания", exact: true })
        .scrollIntoViewIfNeeded();
    },
  ],
  [
    "analytics-assignments",
    "analytics",
    async (p, v) => {
      if (phase.startsWith("before") && v === "v2")
        await p.getByRole("button", { name: /^Все назначения/ }).click();
      else await button(p, "Открыть назначения").click();
      await dialog(p).waitFor();
    },
  ],
];
async function run() {
  for (const width of widths) {
    const { browser, page, requests, errors } = await launch(width);
    page.setDefaultTimeout(6000);
    for (const version of ["v1", "v2"])
      for (const [name, route, action, only] of scenarios) {
        if (only && only !== version) continue;
        if (process.env.CASES && !process.env.CASES.split(",").includes(name)) continue;
        const errorStart = errors.length;
        try {
          await open(page, version, route, name);
          await action(page, version, requests);
          await page.waitForTimeout(100);
          const metrics = await measure(page);
          const file = `${version}-${name}-${width}.png`;
          await page.screenshot({ path: path.join(destination, file), fullPage: true });
          assert.equal(metrics.overflows.length, 0, JSON.stringify(metrics.overflows));
          assert.ok(metrics.pageWidth <= width + 1, `width ${metrics.pageWidth} > ${width}`);
          assert.equal(errors.length - errorStart, 0, errors.slice(errorStart).join("\n"));
          results.push({ version, scenario: name, width, file, metrics, passed: true });
          console.log(`${version} ${name} ${width}: PASS`);
        } catch (error) {
          results.push({
            version,
            scenario: name,
            width,
            passed: false,
            error: error.message.split("\n").slice(0, 5).join("\n"),
          });
          console.log(`${version} ${name} ${width}: FAIL ${error.message.split("\n")[0]}`);
        }
      }
    fs.writeFileSync(
      path.join(__dirname, `${phase}-interaction-requests-${width}.json`),
      JSON.stringify(requests, null, 2),
    );
    await browser.close();
  }
  fs.writeFileSync(
    path.join(__dirname, `${phase}-interaction-results.json`),
    JSON.stringify(results, null, 2),
  );
  if (results.some(r => !r.passed)) process.exitCode = 1;
}
run().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
