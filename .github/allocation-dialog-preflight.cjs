/** @format */
const assert = require("node:assert/strict");
const { mkdir } = require("node:fs/promises");
const { launch } = require("../docs/responsive/browser-harness.cjs");
const { program } = require("../docs/responsive/fixtures.cjs");
const headers = { "Access-Control-Allow-Origin": "*" };
const output = process.env.REVIEW_OUTPUT;
const root = "/programs/1/management/";
const manager = {
  ...program,
  name: "Кейс-чемпионат «Город будущего»",
  draft: false,
  isCompetitive: true,
  isDistributedEvaluation: true,
  solutionStorageMode: "legacy_project",
  programFormat: "case_championship",
};
const project = {
  id: 301,
  name: "Проект команды — городской транспорт",
  caseName: "Пилот",
  leaderId: 201,
  teamUserIds: [],
  experts: [{ expertId: 11, name: "Мария Иванова", completed: false, protected: false }],
};
const candidates = ["Мария Иванова", "Алексей Петров", "Светлана Орлова"].map((name, index) => ({
  id: 11 + index,
  userId: 101 + index,
  name,
  email: "expert-" + index + "@example.test",
  status: "joined",
  assigned: index === 0 ? 1 : 0,
  completed: 0,
  remaining: index === 0 ? 1 : 0,
  allCases: true,
}));
const workspace = {
  revision: "r1",
  requiredEvaluators: 3,
  managedEvaluation: true,
  submittedProjects: 1,
  missingAssignments: 2,
  readyProjects: 0,
  cases: ["Пилот"],
  experts: candidates,
  projects: [project],
};
const plan = {
  revision: "r1",
  planToken: "test-plan",
  canReroll: true,
  shortages: [],
  load: candidates.map(expert => ({
    expertId: expert.id,
    name: expert.name,
    before: expert.assigned,
    after: 1,
    assignedBefore: expert.assigned,
    assignedAfter: 1,
  })),
  assignments: candidates.slice(1).map(expert => ({
    projectId: project.id,
    projectName: project.name,
    expertId: expert.id,
    expertName: expert.name,
  })),
};
const projectForm = {
  updatedAt: "2026-11-24T00:00:00Z",
  revision: "r1",
  cases: [{ name: "Пилот", projectsCount: 1 }],
  fields: [],
  supportedTypes: ["text", "textarea", "select"],
};

async function assertGap(modal, first, largestGap) {
  const measured = await modal.evaluate((container, selector) => {
    const header = container.querySelector(".dialog-header").getBoundingClientRect();
    const child = container.querySelector(selector).getBoundingClientRect();
    const bounds = container.getBoundingClientRect();
    return {
      gap: Math.round(child.top - header.bottom),
      fits: bounds.left >= 0 && bounds.right <= innerWidth && bounds.height <= innerHeight,
    };
  }, first);
  assert.ok(measured.gap >= 0 && measured.gap <= largestGap, JSON.stringify(measured));
  assert.equal(measured.fits, true);
}

async function check(width) {
  const { browser, context, page, base, errors } = await launch(width);
  page.setDefaultTimeout(15000);
  const route = (path, handler) => context.route(url => url.pathname === path, handler);
  const mock = (path, json) => route(path, request => request.fulfill({ headers, json }));
  const open = section => page.goto(base + "/office/program/1/management/" + section);
  const screen = label => page.screenshot({ path: output + "/" + label + "-" + width + ".png" });
  const button = (name, within = page) => within.getByRole("button", { name, exact: true });
  const dialog = name => page.getByRole("dialog", { name, exact: true });
  const escape = async modal => {
    await page.keyboard.press("Escape");
    await modal.waitFor({ state: "hidden" });
  };

  try {
    await mock("/solution-invitations/", { count: 0, next: null, previous: null, results: [] });
    await mock(root, manager);
    let invites = 0;
    let reloads = 0;
    await route(root + "experts/", request => {
      if (request.request().method() === "POST") {
        invites++;
        const payload = request.request().postDataJSON();
        assert.deepEqual(payload.case_names ?? payload.caseNames, ["Пилот"]);
        return request.fulfill({
          headers,
          status: 409,
          json: { detail: "Список кейсов изменился." },
        });
      }
      reloads++;
      return request.fulfill({ headers, json: workspace });
    });
    await mock(root + "expert-allocation/", plan);
    await open("projects?tab=allocation");
    await button("Распределить").click();
    const method = dialog("Распределить проекты");
    await method.waitFor();
    assert.deepEqual(
      await method
        .locator(".experts__method h3")
        .evaluateAll(headings => headings.map(heading => getComputedStyle(heading).fontSize)),
      ["14px", "14px"],
    );
    await assertGap(method, "app-expert-quota", 12);
    await screen("allocation-method");
    await button("Распределить автоматически", method).click();
    const preview = dialog("Предпросмотр распределения");
    await preview.waitFor();
    await assertGap(preview, ".experts__allocation-options", 8);
    assert.equal(await preview.getByText("Добавится", { exact: true }).count(), 2);
    await preview.getByText("Нагрузка после распределения", { exact: true }).click();
    await preview.getByRole("article", { name: "Нагрузка эксперта Мария Иванова" }).waitFor();
    await preview.getByText("Нагрузка после распределения", { exact: true }).click();
    assert.ok(await button("Подтвердить", preview).isEnabled());
    await screen("allocation-preview");
    await escape(preview);

    await open("experts");
    await button("Пригласить эксперта").click();
    const invite = dialog("Пригласить эксперта");
    await invite.locator('input[type="email"]').fill("new-expert@example.test");
    await button("Отправить приглашение", invite).click();
    const validation = invite.getByText("Выберите хотя бы один кейс или отметьте «Все кейсы».");
    await validation.waitFor();
    assert.equal(await button("Обновить данные", invite).count(), 0);
    assert.equal(invites, 0);
    await screen("invite-validation");
    await invite.getByRole("checkbox", { name: "Пилот", exact: true }).check();
    await validation.waitFor({ state: "hidden" });
    await button("Отправить приглашение", invite).click();
    const refresh = button("Обновить данные", invite);
    await refresh.waitFor();
    assert.equal(invites, 1);
    const before = reloads;
    await refresh.click();
    await refresh.waitFor({ state: "hidden" });
    assert.equal(reloads, before + 1);
    assert.ok(await invite.getByRole("checkbox", { name: "Пилот", exact: true }).isChecked());

    const hasProjects = width !== 320;
    let formWrites = 0;
    await route(root + "project-form/", request => {
      if (request.request().method() !== "GET") formWrites++;
      return request.fulfill({
        headers,
        json: {
          ...projectForm,
          hasProjects,
          fields: hasProjects
            ? [
                {
                  id: 6,
                  name: "track",
                  label: "Направление",
                  fieldType: "select",
                  options: ["Транспорт"],
                  isRequired: false,
                  helpText: "",
                  answersCount: 1,
                  editableType: false,
                  isVisible: true,
                },
              ]
            : [],
        },
      });
    });
    await open("settings?tab=project-form");
    await button("Добавить поле").click();
    const field = dialog("Добавить поле");
    await field.waitFor();
    await assertGap(field, 'label[for="field-label"]', 12);
    assert.equal(
      await field.getByText(/Изменения требований|После добавления поля|Черновик/).count(),
      0,
    );
    await screen("project-field");
    await field.locator("#field-type").selectOption("select");
    await field.getByText("Варианты ответа *", { exact: true }).waitFor();
    assert.equal(await field.getByText(/Использованные командами варианты/).count(), 0);
    await field.locator("#field-type").selectOption("text");
    await field.locator("#field-label").fill("Ссылка на прототип");
    await field.getByRole("checkbox", { name: "Обязательно перед сдачей решения" }).check();
    await button("Закрыть настройку поля", field).click();
    const confirm = dialog("Есть несохраненные изменения");
    await button("Остаться", confirm).click();
    assert.equal(await field.locator("#field-label").inputValue(), "Ссылка на прототип");
    await button("Добавить поле", field).click();
    await field.waitFor({ state: "hidden" });
    assert.equal(formWrites, 0);
    assert.ok(await button("Сохранить изменения").isEnabled());
    if (hasProjects) {
      await button("Действия с полем «Направление»").click();
      await page.getByRole("menuitem", { name: "Изменить", exact: true }).click();
      const edit = dialog("Настройка поля");
      await edit
        .getByText("Использованные командами варианты нельзя удалить или переименовать.")
        .waitFor();
      await escape(edit);
    }
    console.log(
      width + "px: compact allocation, invite validation and recovery, and field editor verified",
    );
  } catch (error) {
    console.error({ width, url: page.url(), errors: errors.slice(-4) });
    console.error((await page.locator("body").innerText()).slice(0, 1700));
    await screen("failed");
    throw error;
  } finally {
    await browser.close();
  }
}

(async () => {
  await mkdir(output, { recursive: true });
  for (const width of [390, 1440, 320]) await check(width);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
