/** @format */
const assert = require("node:assert/strict");
const { mkdir } = require("node:fs/promises");
const { launch } = require("../docs/responsive/browser-harness.cjs");
const { program } = require("../docs/responsive/fixtures.cjs");

const root = "/programs/1/management/";
const certificateRoot = root + "certificates/";
const settings = {
  revision: 1,
  draft: {
    layout: Object.fromEntries(
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
      ].map(key => [key, { x: 12, y: 48, width: 76, height: 8, fontSize: 36 }]),
    ),
    showText: true,
    hiddenElements: [],
    orientation: "landscape",
    backgroundId: null,
    signatureId: null,
    director: "",
    position: "",
    audience: "all",
    timing: "manual",
    scheduledAt: null,
    sendEmail: false,
    subject: "Сертификат",
    message: "",
  },
  assets: { background: null, signature: null },
  eligibleCounts: { all: 5, submitted: 2 },
  batch: null,
};
const rows = [
  {
    id: "1",
    name: "Ирина Петрова",
    email: "irina@example.test",
    pdfReady: true,
    status: "ready",
    pdfStatus: "ready",
    emailStatus: "not_planned",
    sentAt: null,
    error: "",
  },
  {
    id: "2",
    name: "Денис Корнев",
    email: "denis@example.test",
    pdfReady: false,
    status: "failed",
    pdfStatus: "failed",
    emailStatus: "pending",
    sentAt: null,
    error: "Не удалось создать PDF.",
  },
  {
    id: "3",
    name: "Надежда Воронова",
    email: "nadiya@example.test",
    pdfReady: true,
    status: "failed",
    pdfStatus: "ready",
    emailStatus: "failed",
    sentAt: null,
    error: "Отправка прервана.",
  },
  {
    id: "4",
    name: "Виктор Сысоев",
    email: "viktor@example.test",
    pdfReady: true,
    status: "failed",
    pdfStatus: "failed",
    emailStatus: "sent",
    sentAt: "2026-11-24T09:00:00Z",
    error: "Не удалось обновить PDF.",
  },
  {
    id: "5",
    name: "Лидия Миронова",
    email: "lidia@example.test",
    pdfReady: true,
    status: "pending",
    pdfStatus: "ready",
    emailStatus: "pending",
    sentAt: null,
    error: "",
  },
];
const matches = {
  attention: row => row.status === "failed",
  pdf_failed: row => row.pdfStatus === "failed",
  email_failed: row => row.emailStatus === "failed",
  unsent: row => row.emailStatus === "pending" || row.emailStatus === "failed",
};
const summary = { total: 5, ready: 4, sent: 1, failed: 3, pdfFailed: 2, emailFailed: 1, unsent: 3 };

async function verify(width, colorScheme) {
  const { browser, page, base, context, errors } = await launch(width, { colorScheme });
  await page.addInitScript(scheme => localStorage.setItem("procollab-theme", scheme), colorScheme);
  page.setDefaultTimeout(12000);
  const headers = { "Access-Control-Allow-Origin": "*" };
  const mock = (path, json) =>
    context.route(
      url => url.pathname === path,
      route => route.fulfill({ headers, json }),
    );
  const row = name => page.locator("tbody tr").filter({ hasText: name });
  const cell = (name, column) => row(name).locator('td[data-label="' + column + '"]');
  const button = name => page.getByRole("button", { name, exact: true });
  const shot = name =>
    page.screenshot({
      path: process.env.REVIEW_OUTPUT + "/" + name + "-" + width + ".png",
      fullPage: true,
    });
  const rowCount = count =>
    page.waitForFunction(
      count => document.querySelectorAll(".certificates__table tbody tr").length === count,
      count,
    );
  try {
    await mock(root, {
      ...program,
      name: "Город будущего",
      draft: false,
      isCompetitive: true,
      solutionStorageMode: "legacy_project",
      programFormat: "case_championship",
    });
    await mock("/solution-invitations/", { count: 0, results: [] });
    await mock(certificateRoot, settings);
    await context.route(
      url => url.pathname === certificateRoot + "deliveries/",
      route => {
        const params = new URL(route.request().url()).searchParams;
        const results = rows.filter(matches[params.get("status")] ?? (() => true));
        return route.fulfill({ headers, json: { count: results.length, results, summary } });
      },
    );
    let retry;
    await context.route(
      url => url.pathname === certificateRoot + "selection/",
      route => {
        retry = route.request().postDataJSON();
        return route.fulfill({ headers, json: { count: 1, skipped: 0 } });
      },
    );
    await page.goto(base + "/office/program/1/management/certificates");
    assert.equal(await page.locator("html").getAttribute("data-theme"), colorScheme);
    await button("Журнал").click();
    await rowCount(5);
    assert.match(await cell("Ирина Петрова", "Письмо").innerText(), /Не запланировано/);
    assert.match(await cell("Денис Корнев", "Сертификат").innerText(), /Ошибка создания PDF/);
    assert.match(await cell("Денис Корнев", "Письмо").innerText(), /Ожидает PDF/);
    assert.match(await cell("Надежда Воронова", "Письмо").innerText(), /Ошибка отправки/);
    assert.match(await cell("Надежда Воронова", "Сертификат").innerText(), /PDF готов/);
    assert.match(await cell("Виктор Сысоев", "Письмо").innerText(), /Отправлено/);
    assert.match(await cell("Виктор Сысоев", "Сертификат").innerText(), /Ошибка обновления PDF/);
    await shot("journal");

    await button("Требуют внимания").click();
    await rowCount(3);
    await shot("attention");
    await button("Ошибки PDF").click();
    await rowCount(2);
    assert.equal(await row("Надежда Воронова").count(), 0);
    await button("Ошибки писем").click();
    await rowCount(1);
    await row("Надежда Воронова").waitFor();
    await button("Повторить ошибки (1)").click();
    const dialog = page.getByRole("dialog", { name: "Повторить обработку сертификатов?" });
    await dialog.getByRole("button", { name: "Повторить", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(retry.action, "retry");
    assert.equal(retry.status, "email_failed");
    assert.equal(retry.all_matching ?? retry.allMatching, true);
    await button("Не отправлено").click();
    await rowCount(3);
    assert.equal(await row("Ирина Петрова").count(), 0);
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
  await verify(1440, "light");
  await verify(320, "dark");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
