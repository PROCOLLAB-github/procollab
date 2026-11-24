/** @format */

const assert = require("node:assert/strict");
const { mkdir } = require("node:fs/promises");
const { launch } = require("../docs/responsive/browser-harness.cjs");
const { program, overview } = require("../docs/responsive/fixtures.cjs");

const headers = { "Access-Control-Allow-Origin": "*" };
const output = process.env.REVIEW_OUTPUT;
const name = "Кейс-чемпионат «Город будущего»";
const manager = {
  ...program,
  name,
  draft: false,
  isCompetitive: true,
  isDistributedEvaluation: true,
  solutionStorageMode: "legacy_project",
  programFormat: "case_championship",
  datetimeRegistrationEnds: "2027-01-01T17:30:00+03:00",
  datetimeProjectSubmissionEnds: null,
  datetimeEvaluationEnds: null,
};
const rating = {
  programId: 1,
  programName: name,
  generatedAt: "2026-11-24T00:00:00Z",
  hasNumericCriteria: true,
  requiredEvaluators: 2,
  caseOptions: ["Кейс А"],
  criteria: [],
  groups: [],
  maximum: 20,
};
const criteria = {
  updatedAt: "2026-11-24T00:00:00Z",
  revision: "initial",
  locked: false,
  supportedTypes: ["int", "bool", "str"],
  criteria: [
    {
      id: 1,
      name: "Качество",
      description: "Описание критерия",
      type: "int",
      minValue: 0,
      maxValue: 10,
    },
  ],
};
const analytics = {
  ...overview,
  attention: {
    ...overview.attention,
    participantsWithoutVisit: 0,
    participantsWithoutTeam: 0,
    projectsAwaitingEvaluation: 0,
  },
  solutionFunnel: { ...overview.solutionFunnel, submissionApplicable: true },
  cases: { ...overview.cases, submissionApplicable: true },
};
const expert = {
  id: 11,
  userId: 101,
  name: "Мария Иванова",
  email: "maria@example.test",
  status: "joined",
  assigned: 1,
  completed: 0,
  remaining: 1,
  allCases: true,
};
const pendingExpert = {
  id: "invite-2",
  invitationId: 2,
  name: null,
  email: "pending@example.test",
  status: "pending",
  deliveryStatus: "sent",
  assigned: null,
  completed: null,
  remaining: null,
};
const expertAssignment = {
  expertId: expert.id,
  name: expert.name,
  email: expert.email,
  completed: false,
  protected: false,
};
const workspace = {
  revision: "r1",
  requiredEvaluators: 1,
  managedEvaluation: true,
  submittedProjects: 2,
  missingAssignments: 1,
  readyProjects: 0,
  cases: ["Пилот"],
  experts: [expert, pendingExpert],
  projects: [
    {
      id: 301,
      name: "Назначенный проект",
      caseName: "Пилот",
      leaderId: 201,
      teamUserIds: [],
      experts: [expertAssignment],
    },
    {
      id: 302,
      name: "Свободный проект",
      caseName: "Пилот",
      leaderId: 202,
      teamUserIds: [],
      experts: [],
    },
  ],
};

async function prepare(width) {
  const setup = await launch(width);
  const { context, page, base } = setup;
  page.setDefaultTimeout(10000);
  const on = (path, handler) => context.route(url => url.pathname === path, handler);
  const mock = (path, json) => on(path, route => route.fulfill({ headers, json }));
  const open = section => page.goto(base + "/office/program/1/management/" + section);
  const screen = label => page.screenshot({ path: output + "/" + label + "-" + width + ".png" });
  const button = (label, within = page) => within.getByRole("button", { name: label, exact: true });
  const dialog = title => page.getByRole("dialog", { name: title, exact: true });
  const close = async dialog => {
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
  };
  await mock("/solution-invitations/", { count: 0, next: null, previous: null, results: [] });
  await mock("/programs/1/", manager);
  await mock("/programs/1/management/", manager);
  await mock("/programs/1/management/results/", rating);
  await mock("/programs/1/manager-overview/", analytics);
  return { ...setup, on, mock, open, screen, button, dialog, close };
}

async function checkGap(dialog, selector) {
  await dialog.waitFor();
  const gap = await dialog.evaluate((element, selector) => {
    const header = element.querySelector(".dialog-header").getBoundingClientRect();
    const first = element.querySelector(selector).getBoundingClientRect();
    return Math.round(first.top - header.bottom);
  }, selector);
  assert.ok(gap >= 0 && gap <= 16, "gap after header: " + gap + " px");
  return gap;
}

async function checkBackground(setup, baseline) {
  const { page, open, screen } = setup;
  const width = page.viewportSize().width;
  await open("results");
  await page.getByRole("heading", { name: "Рейтинг проектов", exact: true }).waitFor();
  await page.waitForTimeout(600);
  await page.setViewportSize({ width, height: 650 });
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  await page.setViewportSize({ width, height: 940 });
  const bounds = await page.evaluate(() => {
    window.dispatchEvent(new Event("resize"));
    const office = document.querySelector(".office");
    const paint = (x, y) => {
      for (let el = document.elementFromPoint(x, y); el; el = el.parentElement) {
        const color = getComputedStyle(el).backgroundColor;
        if (color !== "rgba(0, 0, 0, 0)") return color;
      }
      return "canvas";
    };
    const x = window.innerWidth - 25;
    return {
      officeHeight: office.getBoundingClientRect().height,
      height: window.innerHeight,
      topColor: paint(x, 580),
      bottomColor: paint(x, window.innerHeight - 8),
    };
  });
  if (baseline) {
    assert.ok(bounds.officeHeight < bounds.height - 100, JSON.stringify(bounds));
    assert.notEqual(bounds.topColor, bounds.bottomColor, JSON.stringify(bounds));
    await screen("background-before");
  } else {
    assert.ok(bounds.officeHeight >= bounds.height, JSON.stringify(bounds));
    assert.equal(bounds.topColor, bounds.bottomColor, JSON.stringify(bounds));
    await screen("background-after");
  }
  console.log("background:", { width, baseline, ...bounds });
}

async function checkAnalytics(setup) {
  const { page, base, screen } = setup;
  await page.goto(base + "/office/program/1/analytics");
  const attention = page.getByTestId("attention-block");
  await attention.waitFor();
  assert.deepEqual(
    await attention.locator(".attention__action:disabled strong").allTextContents(),
    ["0", "0", "0"],
  );
  assert.equal(await attention.getByText("Ничего не требует внимания").count(), 0);
  const deadlines = page.getByTestId("program-deadlines");
  const end = key =>
    deadlines.locator('[data-deadline="' + key + '"] time').getAttribute("datetime");
  const registrationEnd = await end("registration");
  assert.ok(registrationEnd);
  assert.equal(await end("submission"), registrationEnd);
  assert.equal(await deadlines.getByText("По сроку регистрации").count(), 0);
  await attention.scrollIntoViewIfNeeded();
  await screen("analytics");
}

async function checkResults(setup) {
  const { open, button, dialog, close, screen } = setup;
  await open("results");
  await button("Как считается балл").click();
  const formula = dialog("Как считается балл");
  await checkGap(formula, ".results__dialog > p");
  await screen("score-explanation");
  await close(formula);
  await button("Фильтры").click();
  const filters = dialog("Фильтры результатов");
  await checkGap(filters, ".results__filter-label");
  await screen("result-filters");
  await close(filters);
}

async function checkCriteria(setup) {
  const { page, on, open, button, dialog, close, screen } = setup;
  let writes = 0;
  await on("/programs/1/management/criteria/", route => {
    if (route.request().method() !== "GET") writes++;
    return route.fulfill({ headers, json: criteria });
  });
  await open("settings?tab=criteria");
  const card = page.locator('section.criteria__card[aria-labelledby="criteria-heading"]');
  const footer = card.locator(":scope > footer");
  const save = button("Сохранить изменения", footer);
  const discard = button("Отменить изменения", footer);
  await save.waitFor();
  assert.equal(await save.isEnabled(), false);
  assert.equal(await discard.isEnabled(), false);
  assert.equal(await page.getByText("Нет несохраненных изменений", { exact: true }).count(), 0);
  await screen("criteria");

  await button("Изменить", card).click();
  await page.locator("#criterion-name").fill("Подача");
  await button("Применить изменения", dialog("Изменить критерий")).click();
  assert.ok(await save.isEnabled());
  await discard.click();
  const confirm = dialog("Есть несохраненные изменения");
  await checkGap(confirm, "#management-confirmation-description");
  assert.equal(await confirm.locator(".ui-alert").count(), 0);
  await page.waitForFunction(() => document.activeElement?.id === "management-confirmation-cancel");
  await screen("discard-criteria");
  await close(confirm);
  assert.ok(await card.getByRole("heading", { name: "Подача", exact: true }).isVisible());
  await discard.click();
  await button("Выйти без сохранения", confirm).click();
  await confirm.waitFor({ state: "hidden" });
  assert.ok(await card.getByRole("heading", { name: "Качество", exact: true }).isVisible());
  assert.equal(writes, 0);
}

async function mockSolutionDistribution(mock) {
  const rows = workspace.projects.map(project => ({
    application: {
      kind: "solution",
      programId: 1,
      solutionId: project.id,
      name: project.name,
    },
    captain: { userId: project.leaderId, fullName: "Капитан команды", avatar: null },
    caseName: project.caseName,
    submissionStatus: "submitted",
    evaluationStatus: "awaiting_evaluation",
    createdAt: "2026-11-21T00:00:00Z",
    submittedAt: "2026-11-22T00:00:00Z",
    assignmentsTotal: project.experts.length,
    assignmentsCompleted: 0,
    waitingReason: "no_completed_evaluations",
  }));
  await mock("/programs/1/management/", { ...manager, solutionStorageMode: "solution" });
  await mock("/programs/1/management/solution-analytics/solutions/", {
    count: rows.length,
    next: null,
    previous: null,
    submissionApplicable: true,
    mode: "distributed",
    results: rows,
  });
  await mock("/programs/1/management/solution-analytics/assignments/", {
    applicable: true,
    mode: "distributed",
    results: [
      {
        assignmentId: 801,
        expert: {
          expertId: expert.id,
          userId: expert.userId,
          firstName: "Мария",
          lastName: "Иванова",
          fullName: expert.name,
          avatar: null,
        },
        application: rows[0].application,
        status: "pending",
        assignedAt: "2026-11-23T00:00:00Z",
        submitted: true,
        submittedAt: rows[0].submittedAt,
        waitingSince: null,
        waitingSeconds: null,
      },
    ],
  });
}

async function checkExperts(setup, solutionMode = false) {
  const { page, mock, open, button, dialog, close, screen } = setup;
  await mock("/programs/1/management/experts/", workspace);
  if (solutionMode) await mockSolutionDistribution(mock);
  await open("experts");
  const menu = button("Действия эксперта: Мария Иванова");
  await menu.waitFor();
  const item = label => page.getByRole("menuitem", { name: label, exact: true });
  if (!solutionMode) {
    await button("Пригласить эксперта").click();
    const invite = dialog("Пригласить эксперта");
    await checkGap(invite, "label:has(input[type=email])");
    await screen("invite-expert");
    await close(invite);
    await menu.click();
    await item("Изменить кейсы").click();
    const cases = dialog("Кейсы эксперта");
    await checkGap(cases, ".experts__person");
    await screen("expert-cases");
    await close(cases);
    await page.getByRole("checkbox", { name: "Выбрать эксперта: Мария Иванова" }).check();
    const bulk = page.locator(".experts__bulk--roster");
    await bulk.waitFor();
    const alignment = await bulk.evaluate(bar => {
      const parts = [
        bar.querySelector(".experts__bulk-count"),
        ...bar.querySelectorAll("button"),
      ].map(part => part.getBoundingClientRect());
      const centers = parts.map(rect => rect.top + rect.height / 2);
      return {
        fits: parts.every(rect => rect.left >= 0 && rect.right <= innerWidth),
        difference: Math.max(...centers) - Math.min(...centers),
      };
    });
    assert.equal(alignment.fits, true);
    if (page.viewportSize().width >= 1000) assert.ok(alignment.difference <= 2);
    await screen("expert-bulk");
    await button("Снять выбор экспертов", bulk).click();
    await bulk.waitFor({ state: "hidden" });
  }
  await menu.click();
  await item("Посмотреть назначения").click();
  await page.waitForURL(
    url =>
      url.pathname.endsWith("/management/projects") &&
      url.searchParams.get("tab") === "allocation" &&
      url.searchParams.get("expert") === "11",
  );
  const active = page.locator('a[aria-current="page"]').filter({ hasText: "Распределение" });
  await active.waitFor();
  await page.getByText("Назначенный проект", { exact: true }).waitFor();
  assert.equal(await page.getByText("Свободный проект", { exact: true }).count(), 0);
  assert.equal(await page.getByText("К экспертам", { exact: true }).count(), 0);
  if (!solutionMode) await screen("expert-distribution");
  await page.getByRole("button", { name: /^Фильтры · 1$/ }).click();
  const filters = dialog("Фильтры распределения");
  await checkGap(filters, "label:has(select)");
  const select = filters.getByRole("combobox", { name: "Эксперты", exact: true });
  const unassigned = filters.getByRole("checkbox", { name: "Без экспертов" });
  assert.equal(await select.inputValue(), "expert:11");
  const filterBox = await select.boundingBox();
  const unassignedBox = await unassigned.boundingBox();
  assert.ok(unassignedBox.y > filterBox.y + filterBox.height);
  if (!solutionMode) await screen("distribution-filters");
  await unassigned.check();
  assert.equal(await select.inputValue(), "all");
  await button("Применить", filters).click();
  await page.getByText("Свободный проект", { exact: true }).waitFor();
  assert.equal(await page.getByText("Назначенный проект", { exact: true }).count(), 0);
  await page.goBack();
  await menu.waitFor();
}

async function check(width, baseline = false) {
  const setup = await prepare(width);
  try {
    if (baseline || width === 1440) await checkBackground(setup, baseline);
    if (!baseline) {
      await checkAnalytics(setup);
      await checkCriteria(setup);
      await checkResults(setup);
      await checkExperts(setup);
      if (width !== 320) await checkExperts(setup, true);
      console.log(width + "px: analytics, criteria, experts, distribution and results verified");
    }
  } catch (error) {
    const { page, screen, errors } = setup;
    console.error(width, page.url(), errors.slice(-4));
    console.error((await page.locator("body").innerText()).slice(0, 1500));
    await screen(baseline ? "baseline-failed" : "failed");
    throw error;
  } finally {
    await setup.browser.close();
  }
}

(async () => {
  await mkdir(output, { recursive: true });
  if (process.argv.includes("--baseline")) await check(1440, true);
  else for (const width of [390, 1440, 320]) await check(width);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
