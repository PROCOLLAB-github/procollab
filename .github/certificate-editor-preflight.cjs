/** @format */
const assert = require("node:assert/strict");
const { mkdir } = require("node:fs/promises");
const { launch } = require("../docs/responsive/browser-harness.cjs");
const { program } = require("../docs/responsive/fixtures.cjs");
const root = "/programs/1/management/";
const longName = "[ТЕСТ] Кейс-чемпионат «Город будущего» — международная программа для 60 проектов";
const manager = {
  ...program,
  draft: false,
  isCompetitive: true,
  solutionStorageMode: "legacy_project",
  programFormat: "case_championship",
};
const layout = Object.fromEntries(
  [
    "title",
    "subtitle",
    "name",
    "program",
    "date",
    "number",
    "director",
    "position",
    "signature",
  ].map(key => [key, { x: 12, y: key === "title" ? 20 : 48, width: 76, height: 8, fontSize: 36 }]),
);
const certificate = {
  revision: 1,
  draft: {
    orientation: "landscape",
    layout,
    showText: true,
    hiddenElements: ["subtitle", "program", "date", "number", "director", "position", "signature"],
    audience: "all",
    timing: "manual",
    sendEmail: false,
    scheduledAt: null,
    subject: "Сертификат",
    message: "",
    director: "",
    position: "",
  },
  assets: { background: null, signature: null },
  eligibleCounts: { all: 5, submitted: 2 },
  batch: null,
};
const projectForm = {
  revision: "fixture",
  updatedAt: "2026-11-25T00:00:00Z",
  cases: [{ name: "Пилот", projectsCount: 1 }],
  caseRequired: true,
  caseLabel: "Кейс",
  teamMinSize: null,
  teamMaxSize: null,
  supportedTypes: ["text", "textarea"],
  sections: { partners: false, achievements: false, vacancies: false, programData: true },
  fields: ["Описание проекта", "Описание решения"].map((label, index) => ({
    id: index + 1,
    name: index ? "solution_description" : "project_description",
    fieldType: "textarea",
    label,
    isVisible: true,
    isRequired: !!index,
    helpText: "",
    options: [],
    answersCount: 0,
  })),
};

async function verify(width, colorScheme) {
  const { page, browser, base, context, errors } = await launch(width, { colorScheme });
  page.setDefaultTimeout(12000);
  const headers = { "Access-Control-Allow-Origin": "*" };
  const mock = (path, json) =>
    context.route(
      url => url.pathname === path,
      route => route.fulfill({ headers, json }),
    );
  const open = section => page.goto(base + "/office/program/1/management/" + section);
  const shot = label =>
    page.screenshot({ path: process.env.REVIEW_OUTPUT + "/" + label + "-" + width + ".png" });
  try {
    await mock(root, manager);
    await mock("/solution-invitations/", { count: 0, results: [] });
    let savedCertificate;
    await context.route(
      url => url.pathname === root + "certificates/",
      route => {
        if (route.request().method() === "PUT") {
          const { draft } = route.request().postDataJSON();
          savedCertificate = {
            ...certificate,
            revision: 2,
            draft: { ...certificate.draft, ...draft },
          };
        }
        return route.fulfill({ headers, json: savedCertificate ?? certificate });
      },
    );
    await open("certificates");
    await page.getByRole("button", { name: "Выбрать: Заголовок" }).click();
    await page.getByLabel("Текст заголовка").fill("Диплом финалиста");
    const rotation = page.getByLabel("Угол поворота, градусы");
    await rotation.fill("-35");
    await rotation.press("Tab");
    const selected = page.locator(".canvas__element--selected");
    assert.equal(await selected.evaluate(element => element.style.transform), "rotate(-35deg)");
    assert.match(await selected.innerText(), /Диплом финалиста/);
    await page.getByRole("button", { name: "Отменить действие" }).click();
    await page.waitForFunction(() => document.querySelector(".canvas__angle input")?.value === "0");
    assert.equal(await rotation.inputValue(), "0");
    await page.getByRole("button", { name: "Повторить действие" }).click();
    await page.waitForFunction(
      () => document.querySelector(".canvas__angle input")?.value === "-35",
    );
    assert.equal(await rotation.inputValue(), "-35");
    await page.locator(".certificates__element-help summary").click();
    await page.getByText("Выберите элемент в списке выше", { exact: false }).waitFor();
    await page.locator(".certificates__element-help summary").click();
    await page.locator(".certificates__canvas-heading").scrollIntoViewIfNeeded();
    await shot("certificate-editor");
    await page.getByRole("button", { name: "Сохранить шаблон" }).click();
    await page.getByText("Изменения сохранены", { exact: true }).waitFor();
    assert.equal(savedCertificate.draft.title, "Диплом финалиста");
    assert.equal(savedCertificate.draft.layout.title.rotation, -35);
    await page.getByRole("button", { name: "Выдача", exact: true }).click();
    await page.getByText("По кнопке «Выдать сертификаты»", { exact: false }).waitFor();
    await page.getByText("Участник скачает PDF в блоке", { exact: false }).waitFor();
    await shot("certificate-delivery");

    await mock(root + "project-form/", projectForm);
    await open("settings?tab=project-form");
    await page.getByRole("button", { name: "Вид участника", exact: true }).click();
    const preview = page.getByRole("dialog", { name: "Предпросмотр формы команды", exact: true });
    const textarea = preview.locator("textarea").first();
    await textarea.waitFor();
    assert.ok(
      await textarea.evaluate(element => parseFloat(getComputedStyle(element).borderRadius) <= 16),
    );
    await shot("participant-preview");
    await preview.getByRole("button", { name: "Закрыть" }).click();
    await page.getByRole("button", { name: "Настроить кейсы" }).click();
    const materials = page.getByRole("link", { name: "материалах программы" });
    assert.match(await materials.getAttribute("href"), /tab=materials$/);
    assert.equal(
      await materials.evaluate(element => getComputedStyle(element).backgroundColor),
      "rgba(0, 0, 0, 0)",
    );
    await materials.click();
    await page.getByRole("button", { name: "Добавить материал", exact: true }).click();
    const material = page.getByRole("dialog", { name: "Добавить материал", exact: true });
    await material.waitFor();
    await shot("material-dialog");
    await material.getByRole("radio", { name: "Файл", exact: true }).check();
    let completeUpload;
    const uploadGate = new Promise(resolve => (completeUpload = resolve));
    await context.route(
      url => url.pathname === "/files/",
      async request => {
        await uploadGate;
        return request.fulfill({ headers, json: { url: "https://example.test/guide.pdf" } });
      },
    );
    await material.locator("input[type=file]").setInputFiles({
      name: "Материалы проекта.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF"),
    });
    await material.locator("progress").waitFor();
    assert.equal(await material.locator(".ui-alert--warning").count(), 0);
    completeUpload();
    await material.getByRole("button", { name: "Заменить файл", exact: true }).waitFor();
    assert.equal(await material.locator(".ui-alert--success").count(), 0);
    await shot("material-upload");
    await material.getByRole("button", { name: "Отмена", exact: true }).click();
    await page.getByRole("button", { name: "Закрыть без сохранения", exact: true }).click();
    await material.waitFor({ state: "hidden" });

    await mock(root + "organizers/", {
      revision: "fixture",
      organizers: [],
      organizerCount: 2,
      activeOrganizerCount: 2,
      invitationCount: 1,
    });
    await open("settings?tab=organizers");
    const organizers = page.locator("app-management-organizers app-section-header");
    await organizers.getByRole("button", { name: "Пригласить", exact: true }).waitFor();
    assert.equal(await page.getByText("Приглашений: 1", { exact: true }).count(), 0);
    await shot("organizers");

    await mock(root + "registration/", {
      draft: { mode: "native", fields: [] },
      published: null,
      revision: 1,
      publishedVersion: 0,
      publishedAt: null,
      link: null,
      externalStatus: "not_connected",
      externalUrl: "",
      connectionComment: "",
      connectionWebsiteUrl: "",
      connectionContact: "",
      answeredFieldIds: [],
    });
    await open("settings?tab=registration");
    await page
      .locator("app-section-header")
      .getByRole("heading", { name: "Способ регистрации", exact: true })
      .waitFor();
    await shot("registration");

    await mock("/evaluation/programs/", {
      hasAccess: true,
      results: [
        {
          id: 1,
          name: longName,
          status: "joined",
          imageAddress: null,
          datetimeEvaluationEnds: null,
        },
      ],
    });
    await mock("/evaluation/applications/", {
      count: 0,
      results: [],
      pending: 0,
      completed: 0,
      unavailable: 0,
    });
    await page.goto(base + "/office/evaluation?program=1");
    const selectedLabel = page.locator(".cabinet__program .field__label-truncated");
    await selectedLabel.waitFor();
    await page.waitForFunction(
      name => document.querySelector(".cabinet__program .field__label-truncated")?.title === name,
      longName,
    );
    assert.equal(await selectedLabel.getAttribute("title"), longName);
    assert.equal(
      await selectedLabel.evaluate(element => getComputedStyle(element).whiteSpace),
      "nowrap",
    );
    const iconCenter = await page.locator(".cabinet__search").evaluate(element => {
      const icon = element.querySelector("i").getBoundingClientRect();
      const field = element.querySelector("input").getBoundingClientRect();
      return Math.abs(icon.top + icon.height / 2 - field.top - field.height / 2);
    });
    assert.ok(iconCenter <= 1, "Search icon stays centered on the input");
    await shot("expert-search");
  } catch (error) {
    console.error({ url: page.url(), errors });
    await shot("failure");
    throw error;
  } finally {
    await browser.close();
  }
}

(async () => {
  await mkdir(process.env.REVIEW_OUTPUT, { recursive: true });
  for (const [width, colorScheme] of [
    [1440, "light"],
    [390, "dark"],
    [320, "light"],
  ]) {
    await verify(width, colorScheme);
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
