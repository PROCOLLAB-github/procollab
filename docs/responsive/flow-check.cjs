/** @format */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch, assertViewport } = require("./browser-harness.cjs");
const fixtures = require("./fixtures.cjs");
const rows = [];
const screenshots = path.join(__dirname, "screenshots");
fs.mkdirSync(screenshots, { recursive: true });

async function run(width, name, action) {
  if (process.env.RESPONSIVE_FLOWS && !process.env.RESPONSIVE_FLOWS.split(",").includes(name))
    return;
  const h = await launch(width, { isMobile: true, hasTouch: true });
  h.page.setDefaultTimeout(6000);
  const goto = async route => {
    await h.page.goto(h.base + route);
    await h.page.waitForLoadState("networkidle");
    await h.page.waitForTimeout(150);
  };
  try {
    await action(h, goto);
    await assertViewport(h.page);
    assert.equal(h.errors.length, 0, h.errors.join("\n"));
    rows.push({ width, name, passed: true, mutations: h.requests.filter(r => r.method !== "GET") });
  } catch (error) {
    rows.push({ width, name, passed: false, error: error.message, browserErrors: h.errors });
    await h.page.screenshot({ path: path.join(screenshots, `failure-${name}-${width}.png`) });
  } finally {
    console.log(JSON.stringify(rows.at(-1)));
    await h.browser.close();
  }
}

async function modalFits(page, selector = ".modal__body") {
  const box = await page.locator(selector).last().boundingBox();
  const viewport = page.viewportSize();
  assert.ok(box && box.x >= 0 && box.x + box.width <= viewport.width + 1, "Modal width");
  assert.ok(box.y >= -1 && box.y + box.height <= viewport.height + 1, "Modal height");
  await assertViewport(page);
}

(async () => {
  for (const width of [320, 390]) {
    await run(width, "registration", async ({ page, requests }, goto) => {
      await goto("/auth/register");
      const values = {
        firstName: "Мобильный",
        lastName: "Пользователь",
        birthday: "01012000",
        email: "register.mobile@example.test",
        password: "MobileX9!Quartz",
        repeatedPassword: "MobileX9!Quartz",
      };
      for (const [name, value] of Object.entries(values))
        await page.locator(`app-input[formcontrolname=${name}] input`).fill(value);
      for (const checkbox of await page.locator("app-checkbox .field").all())
        await checkbox.click();
      await assertViewport(page);
      await page.getByRole("button", { name: "зарегистрироваться", exact: true }).click();
      await page.waitForTimeout(700);
      assert.ok(
        requests.some(r => r.method === "POST" && r.path === "/auth/users/"),
        "Registration request",
      );
    });
    await run(width, "navigation-login", async ({ page, requests }, goto) => {
      await goto("/auth/login");
      await page.locator("app-input[formcontrolname=email] input").fill("mobile@example.test");
      await page.locator("app-input[formcontrolname=password] input").fill("MobilePassword123!");
      await page.getByRole("button", { name: "войти", exact: true }).click();
      await page.waitForURL(/\/office/);
      assert.ok(requests.some(r => r.method === "POST" && r.path.includes("token")));
      await page.getByRole("button", { name: "Открыть меню", exact: true }).click();
      await page.locator("#mobile-navigation").waitFor();
      await assertViewport(page);
      await page.keyboard.press("Escape");
      await page.locator("#mobile-navigation").waitFor({ state: "hidden" });
      assert.equal(await page.locator("#mobile-navigation").count(), 0);
      await page.getByRole("button", { name: "Открыть меню", exact: true }).click();
      await page.locator("#mobile-navigation a[href='/office/projects']").click();
      await page.waitForURL(/projects/);
      await page.locator("#mobile-navigation").waitFor({ state: "hidden" });
      assert.equal(await page.locator("#mobile-navigation").count(), 0);
      await page.getByRole("button", { name: "Открыть меню", exact: true }).click();
      await page.locator(".nav-bar__backdrop").click({ position: { x: width - 8, y: 100 } });
      await page.locator("#mobile-navigation").waitFor({ state: "hidden" });
      assert.equal(await page.locator("#mobile-navigation").count(), 0);
      await page.getByRole("button", { name: "Открыть меню", exact: true }).click();
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.locator("#mobile-navigation").waitFor({ state: "hidden" });
      assert.equal(await page.locator("html.cdk-global-scrollblock").count(), 0);
      await assertViewport(page);
      await page.setViewportSize({ width, height: 844 });
    });

    await run(width, "profile-controls", async ({ page }, goto) => {
      await goto("/office/profile/edit?editingStep=education");
      await page.getByRole("button", { name: "добавить образование", exact: true }).click();
      await page.locator("app-select").first().click();
      await page.locator(".cdk-overlay-pane .field__options").waitFor();
      await assertViewport(page);
      await page.locator(".cdk-overlay-pane .field__option").first().click();
      await page
        .locator("app-input[formcontrolname=organizationName] input")
        .fill("Очень длинное название учебного заведения".repeat(2));
      await assertViewport(page);
      await goto("/office/profile/edit?editingStep=main");
      await page.getByRole("button", { name: "Открыть календарь" }).click();
      await page.locator(".mat-datepicker-content").waitFor();
      await assertViewport(page);
      await page.keyboard.press("Escape");
      await goto("/office/profile/edit?editingStep=skills");
      const input = page.locator("app-autocomplete-input input").first();
      await input.fill("Angular");
      await page.locator(".cdk-overlay-pane .field__option").first().waitFor();
      await assertViewport(page);
      await page.locator(".cdk-overlay-pane .field__option").first().click();
      await page.getByRole("button", { name: "cохранить", exact: true }).click();
    });

    fixtures.program.isUserManager = false;
    fixtures.program.isUserExpert = false;
    await run(width, "participant-application-team", async ({ page, requests }, goto) => {
      await goto("/office/program/1");
      await page.getByRole("button", { name: "создать заявку", exact: true }).click();
      await page.waitForURL(/projects\/1\/edit/);
      await page.waitForLoadState("networkidle");
      const dismiss = page.getByRole("button", { name: "понятно", exact: true });
      if (await dismiss.count()) await dismiss.last().click();
      await goto("/office/projects/1/edit?editingStep=team&programLinkId=1");
      await page.getByRole("button", { name: "Пригласить участника", exact: true }).click();
      await page.getByRole("dialog").waitFor();
      await modalFits(page);
      await page.locator("#team-invite-search").fill("ОченьДлинноеИмя");
      await page.getByRole("radio").first().waitFor();
      await page.getByRole("radio").first().click();
      await page.getByRole("combobox", { name: "Роль в проекте" }).fill("Разработчик");
      await page.setViewportSize({ width, height: 480 });
      await page.waitForTimeout(150);
      await modalFits(page);
      await page.getByRole("button", { name: "Отправить приглашение", exact: true }).click();
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      assert.ok(requests.some(r => r.method === "POST" && r.path === "/invites/"));
      await page.setViewportSize({ width, height: 844 });
      await goto("/office/projects/1/edit?editingStep=main&programLinkId=1");
      await page.locator("app-input[formcontrolname=name] input").fill("Мобильный проект");
      await goto("/office/projects/1/edit?editingStep=additional&programLinkId=1");
      await page.getByRole("button", { name: "отправить заявку", exact: true }).click();
      await page.getByRole("button", { name: "Отправить", exact: true }).waitFor();
      await modalFits(page);
      await page.getByRole("button", { name: "Отправить", exact: true }).click();
      await page.waitForTimeout(700);
      assert.ok(
        requests.some(r => r.method === "POST" && r.path.endsWith("/submit/")),
        "Application submission request",
      );
    });

    fixtures.program.isUserExpert = true;
    await run(width, "expert-rating", async ({ page, requests }, goto) => {
      await goto("/office/program/1/projects-rating");
      await page.locator("app-rating-card").first().waitFor();
      await page.locator("app-range-criterion-input input").first().fill("8");
      await page.locator("app-boolean-criterion .container").first().click();
      await page
        .locator("app-project-rating textarea")
        .first()
        .fill("Решение соответствует требованиям");
      await page.getByRole("button", { name: "оценить проект", exact: true }).click();
      await page.getByRole("button", { name: "подтверждаю", exact: true }).waitFor();
      await modalFits(page);
      await page.getByRole("button", { name: "подтверждаю", exact: true }).click();
      await page.waitForTimeout(300);
      assert.ok(requests.some(r => r.method === "POST" && r.path.includes("/rate-project/rate/1")));
    });

    fixtures.vacancy.canManageResponses = false;
    await run(width, "vacancy-response", async ({ page, requests }, goto) => {
      await goto("/office/vacancies");
      await page.locator("app-search").click();
      await page.locator("app-search input").fill("Разработчик");
      await page.waitForTimeout(400);
      await assertViewport(page);
      await goto("/office/vacancies/1");
      await page.getByRole("button", { name: "откликнуться", exact: true }).click();
      await page
        .locator("app-textarea[formcontrolname=whyMe] textarea")
        .fill("Хочу участвовать в проекте и готов выполнить поставленные задачи");
      await modalFits(page);
      await page.locator("app-upload-file input[type=file]").setInputFiles({
        name: "ОченьДлинноеНазваниеРезюмеДляПроверки.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4\n%%EOF"),
      });
      await page.waitForTimeout(300);
      await page.setViewportSize({ width, height: 480 });
      await page.waitForTimeout(150);
      await modalFits(page);
      await page.getByRole("button", { name: "отправить отклик", exact: true }).click();
      await page.waitForTimeout(500);
      assert.ok(
        requests.some(r => r.method === "POST" && r.path.endsWith("/vacancies/1/responses/")),
      );
      await page.setViewportSize({ width, height: 844 });
      await goto("/office/vacancies/my");
      assert.ok(
        (await page.locator("body").innerText()).includes("Тестовый") ||
          (await page.locator("app-response-card").count()),
      );
    });

    fixtures.vacancy.canManageResponses = true;
    fixtures.program.isUserManager = true;
    await run(width, "manager-project-and-responses", async ({ page, requests }, goto) => {
      await goto("/office/projects/my");
      await page.getByRole("button", { name: "создать проект", exact: true }).click();
      await page.waitForURL(/projects\/1\/edit/);
      await page.getByRole("button", { name: "сохранить черновик", exact: true }).click();
      await page.waitForTimeout(400);
      assert.ok(requests.some(r => r.method === "POST" && r.path.endsWith("/projects/")));
      assert.ok(
        requests.some(r => ["PUT", "PATCH"].includes(r.method) && r.path.endsWith("/projects/1/")),
      );
      await goto("/office/vacancies/1");
      await page.getByRole("button", { name: "посмотреть отклики", exact: true }).click();
      await page.getByRole("dialog").waitFor();
      await modalFits(page);
      await page.screenshot({
        path: path.join(screenshots, `vacancy-responses-modal-${width}.png`),
      });
      await page.getByRole("button", { name: "принять", exact: true }).click();
      await page.waitForTimeout(300);
      assert.ok(requests.some(r => r.method === "POST" && r.path.endsWith("/accept/")));
    });
    await run(width, "course-lesson", async ({ page, requests }, goto) => {
      await goto("/office/courses/1");
      await assertViewport(page);
      await goto("/office/courses/1/lesson/1");
      await page.locator("app-write-task textarea").fill("Ответ участника на задание курса");
      await page.getByRole("button", { name: "завершить урок", exact: true }).click();
      await page.locator("app-complete").waitFor();
      await assertViewport(page);
      await page.getByRole("button", { name: "отлично", exact: true }).click();
      await page.waitForURL(/courses\/1$/);
      assert.ok(
        requests.some(r => r.method === "POST" && r.path.includes("courses")),
        "Lesson answer request",
      );
    });
    const savedAvatar = fixtures.user.avatar;
    fixtures.user.avatar = "/assets/images/profile/main.svg";
    await run(width, "onboarding-first-step", async ({ page, requests }, goto) => {
      await goto("/office/onboarding/stage-0");
      await page.locator("app-stage-zero .page__form").waitFor();
      const select = async (name, text) => {
        await page.locator(`app-select[formcontrolname=${name}]`).click();
        await assertViewport(page);
        const options = page.locator(".cdk-overlay-pane .field__option");
        await (text ? options.filter({ hasText: text }).first() : options.first()).click();
      };
      await select("educationLevel");
      await select("entryYear", "2020");
      await select("completionYear", "2024");
      await select("educationStatus");
      await page.locator("app-input[formcontrolname=organizationName] input").fill(fixtures.long);
      await page.locator("app-input[formcontrolname=description] input").fill(fixtures.long);
      await page.getByRole("button", { name: "Добавить образование", exact: true }).click();
      await page.getByRole("button", { name: "Добавить достижение", exact: true }).click();
      await page.locator("app-input[formcontrolname=title] input").fill(fixtures.long);
      await page.locator("app-input[formcontrolname=status] input").fill("Победитель");
      const removeAchievement = await page
        .getByRole("button", { name: "Удалить", exact: true })
        .boundingBox();
      const achievementStatus = await page
        .locator("app-input[formcontrolname=status] input")
        .boundingBox();
      assert.ok(
        achievementStatus.y >= removeAchievement.y + removeAchievement.height - 1,
        "Achievement controls overlap",
      );
      await assertViewport(page);
      await page.screenshot({
        path: path.join(screenshots, `onboarding-form-${width}.png`),
        fullPage: true,
      });
      await page.getByRole("button", { name: "продолжить", exact: true }).click();
      await page.waitForURL(/onboarding\/stage-1/);
      assert.ok(
        requests.some(r => r.method === "PATCH" && r.path.includes("/auth/users/1/")),
        "Onboarding profile save",
      );
    });
    fixtures.user.avatar = savedAvatar;

    const originalTask = { ...fixtures.lesson.tasks[0] };
    await run(width, "course-alternative-inputs", async ({ page, requests }, goto) => {
      for (const type of ["single_choice", "multiple_choice", "files", "text_and_files"]) {
        Object.assign(fixtures.lesson.tasks[0], originalTask, {
          answerType: type,
          options: [
            { id: 1, order: 1, text: fixtures.long },
            { id: 2, order: 2, text: "Второй вариант" },
          ],
        });
        await goto("/office/courses/1/lesson/1");
        if (type === "single_choice") {
          await page.locator(".radio__item input").first().click();
          assert.ok((await page.locator(".radio__item").first().boundingBox()).height >= 44);
        } else if (type === "multiple_choice") {
          await page.locator(".exclude__item").first().click();
          await page.locator(".exclude__item").nth(1).click();
        } else {
          if (type === "text_and_files")
            await page.locator("app-write-task textarea").fill(fixtures.long);
          await page.locator("app-upload-file input[type=file]").setInputFiles({
            name: fixtures.long + ".pdf",
            mimeType: "application/pdf",
            buffer: Buffer.from("%PDF-1.4\n%%EOF"),
          });
          await page.locator("app-file-item").waitFor();
        }
        await assertViewport(page);
        await page.screenshot({
          path: path.join(screenshots, `course-${type}-${width}.png`),
          fullPage: true,
        });
        await page.getByRole("button", { name: "завершить урок", exact: true }).click();
        await page.locator("app-complete").waitFor();
        await assertViewport(page);
      }
      assert.equal(
        requests.filter(r => r.method === "POST" && r.path.endsWith("/answer/")).length,
        4,
      );
    });
    Object.assign(fixtures.lesson.tasks[0], originalTask);

    const originalSkills = fixtures.user.skills;
    const originalEmail = fixtures.user.email;
    const originalVacancySkills = fixtures.vacancy.requiredSkills;
    fixtures.user.email = "very.long.email".repeat(8) + "@example.test";
    fixtures.user.skills = Array.from({ length: 12 }, (_, i) => ({
      ...originalSkills[0],
      id: i + 1,
      name: fixtures.long + i,
    }));
    fixtures.vacancy.requiredSkills = fixtures.user.skills;
    await run(width, "long-content-and-states", async ({ context, page }, goto) => {
      await goto("/office/profile/1");
      await assertViewport(page);
      await goto("/office/vacancies/1");
      await assertViewport(page);
      await context.route(
        url =>
          ["dev.procollab.ru", "api.procollab.ru"].includes(url.hostname) &&
          url.pathname.endsWith("/vacancies/"),
        async route => {
          const request = route.request();
          if (request.method() === "GET")
            return route.fulfill({ json: { count: 0, results: [], next: null, previous: null } });
          return route.fallback();
        },
      );
      await goto("/office/vacancies/all");
      await page.getByText("Вакансии не найдены", { exact: true }).waitFor();
      await assertViewport(page);
      await goto("/auth/register");
      for (const checkbox of await page.locator("app-checkbox .field").all())
        await checkbox.click();
      await page.getByRole("button", { name: "зарегистрироваться", exact: true }).click();
      await page.locator(".error").first().waitFor();
      await assertViewport(page);
      await page.screenshot({
        path: path.join(screenshots, `validation-${width}.png`),
        fullPage: true,
      });
      await goto("/office/courses/1/lesson/1");
      await page.locator("app-write-task textarea").fill(fixtures.long);
      let releaseAnswer;
      const answerPending = new Promise(resolve => {
        releaseAnswer = resolve;
      });
      await context.route("**/courses/tasks/1/answer/", async route => {
        await answerPending;
        await route.fulfill({
          json: {
            answerId: 1,
            status: "submitted",
            isCorrect: false,
            canContinue: false,
            nextTaskId: null,
            submittedAt: "2026-10-01",
          },
        });
      });
      await page.getByRole("button", { name: "завершить урок", exact: true }).click();
      await page.locator("app-button app-loader").waitFor();
      await assertViewport(page);
      releaseAnswer();
      await page.getByText("неверный ответ, попробуйте еще раз!", { exact: true }).waitFor();
      await assertViewport(page);
    });
    fixtures.user.skills = originalSkills;
    fixtures.user.email = originalEmail;
    fixtures.vacancy.requiredSkills = originalVacancySkills;

    await run(width, "analytics-tables-and-tooltip", async ({ page }, goto) => {
      await goto("/office/program/1/analytics");
      await page.locator("[data-testid=exports-tooltip] .tooltip__icon").click();
      await page.locator(".cdk-overlay-pane .tooltip__content").waitFor();
      await assertViewport(page);
      await page.locator("[data-testid=exports-tooltip] .tooltip__icon").click();
      for (const trigger of [
        ".evaluation__assignment-action:not([disabled])",
        ".attention__action:not([disabled])",
        ".case-row",
      ]) {
        await page.locator(trigger).first().click();
        await page.getByRole("dialog").waitFor();
        await page.locator(".modal tbody tr").first().waitFor();
        await modalFits(page);
        await page.screenshot({
          path: path.join(screenshots, `analytics-${trigger.split("__")[0].slice(1)}-${width}.png`),
        });
        await page.keyboard.press("Escape");
        await page.getByRole("dialog").waitFor({ state: "hidden" });
      }
    });
  }
  fs.writeFileSync(
    path.join(__dirname, process.env.RESPONSIVE_FLOW_OUTPUT || "flow-results.json"),
    JSON.stringify(rows, null, 2),
  );
  if (rows.some(row => !row.passed)) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
