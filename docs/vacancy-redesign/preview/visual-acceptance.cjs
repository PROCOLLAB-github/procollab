/** @format */

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("fs");
const assert = require("assert/strict");
const contrast = require("./contrast.cjs");
const out = "docs/vacancy-redesign/screenshots";
fs.mkdirSync(out, { recursive: true });
let checks = 0;
const measurements = [];
const contrastResults = [];
const errors = [];
const check = (value, message) => {
  assert.ok(value, message);
  checks++;
};
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/assets/vacancy-fixture.pdf", route =>
    route.fulfill({
      contentType: "application/pdf",
      body: "%PDF-1.4\n%%EOF",
      headers: { "Content-Disposition": "attachment; filename=resume.pdf" },
    }),
  );
  const settle = async () => {
    await page.evaluate(async () => {
      await window.__vacancyPreview.fixture.whenStable();
      await document.fonts.ready;
    });
  };
  const go = async path => {
    await page.goto("http://127.0.0.1:4358" + path);
    await page.waitForFunction(() => !!window.__vacancyPreview);
    await settle();
    check(
      await page.evaluate(
        () =>
          document.fonts.check("400 14px Mont") &&
          [...document.fonts].some(font => font.family === "Mont" && font.status === "loaded") &&
          getComputedStyle(document.body).fontFamily.includes("Mont"),
      ),
      "real Mont loaded",
    );
  };
  async function geometry(state, width) {
    const result = await page.evaluate(() => {
      const box = el => {
        const r = el.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          right: r.right,
          bottom: r.bottom,
          height: r.height,
          width: r.width,
        };
      };
      return {
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        cards: [...document.querySelectorAll("article")].map(box),
        dialog: document.querySelector("[role=dialog]")
          ? box(document.querySelector("[role=dialog]"))
          : null,
        left: document.querySelector("app-vacancies-left-side")
          ? box(document.querySelector("app-vacancies-left-side"))
          : null,
        right: document.querySelector("app-vacancies-right-side")
          ? box(document.querySelector("app-vacancies-right-side"))
          : null,
      };
    });
    check(result.overflow === 0, state + " horizontal overflow: " + result.overflow);
    result.cards.forEach(card =>
      check(card.x >= -1 && card.right <= width + 1, state + " card bounds"),
    );
    if (result.dialog)
      check(
        result.dialog.x >= 0 && result.dialog.right <= width && result.dialog.y >= 0,
        state + " dialog bounds",
      );
    if (width <= 800 && result.left && result.right)
      check(result.right.y >= result.left.bottom - 1, state + " mobile reading order");
    measurements.push({ state, width, ...result });
    if (width === 1440 && !state.endsWith("-stress")) {
      const samples = await contrast(page);
      contrastResults.push({ state, samples });
    }
  }
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await go("/office/projects/5/edit");
    check((await page.locator("app-vacancy-card").count()) === 4, "project vacancy count");
    check(
      (await page.getByText("Навыки не указаны", { exact: true }).count()) === 1,
      "empty skills",
    );
    await geometry("project", width);
    if (width !== 320)
      await page.screenshot({ path: out + "/project-" + width + ".png", fullPage: true });
    await page
      .locator("app-vacancy-card")
      .first()
      .getByRole("button", { name: "Ещё +8", exact: true })
      .click();
    await settle();
    check(
      (await page.locator("app-vacancy-card").first().locator("app-tag").count()) === 11,
      "expand all skills",
    );
    await page
      .locator("app-vacancy-card")
      .first()
      .getByRole("button", { name: "Свернуть" })
      .click();
    await settle();
    // Existing delete confirmation: both cancellation and confirmation.
    page.once("dialog", dialog => dialog.dismiss());
    await page.locator("app-vacancy-card").last().getByRole("button", { name: "Удалить" }).click();
    await settle();
    check((await page.locator("app-vacancy-card").count()) === 4, "cancel deletion");
    page.once("dialog", dialog => dialog.accept());
    await page.locator("app-vacancy-card").last().getByRole("button", { name: "Удалить" }).click();
    await settle();
    check((await page.locator("app-vacancy-card").count()) === 3, "confirmed deletion");

    await go("/office/vacancies/all");
    check((await page.locator("app-project-vacancy-card").count()) === 4, "catalog count");
    await geometry("catalog", width);
    if (width !== 320)
      await page.screenshot({ path: out + "/catalog-" + width + ".png", fullPage: true });
    if (width === 1440) {
      const rows = await page
        .locator("app-project-vacancy-card .vacancy__actions")
        .evaluateAll(elements => elements.map(el => el.getBoundingClientRect().bottom));
      check(Math.abs(rows[0] - rows[1]) < 1, "catalog actions align in first row");
      check(Math.abs(rows[2] - rows[3]) < 1, "catalog actions align in second row");
    }
    check(
      (await page.locator("app-project-vacancy-card").nth(2).getByRole("button").count()) === 1,
      "closed catalog has details only",
    );

    await go("/office/vacancies/all?empty");
    check(
      (await page.locator("app-project-vacancy-card").count()) === 0,
      "empty catalog has no cards",
    );
    check(
      await page.getByText("Вакансии не найдены", { exact: true }).isVisible(),
      "empty catalog message",
    );
    check(
      await page.getByRole("button", { name: "Сбросить фильтры", exact: true }).isVisible(),
      "empty catalog reset action",
    );
    await geometry("catalog-empty", width);

    await go("/office/vacancies/10");
    check(
      await page.locator("app-back span").isVisible(),
      "detail back label visible on every width",
    );
    await geometry("detail", width);
    if (width !== 320)
      await page.screenshot({ path: out + "/detail-" + width + ".png", fullPage: true });
    await page.getByRole("button", { name: "посмотреть отклики", exact: true }).click();
    await settle();
    await page.getByRole("dialog").waitFor();
    await settle();
    await geometry("responses", width);
    check(
      (await page.locator(".response__candidate .status").count()) === 3,
      "response statuses in headers",
    );
    check(
      (await page.locator(".response__actions").count()) === 1,
      "actions only on pending response",
    );
    if (width !== 320) await page.screenshot({ path: out + "/responses-" + width + ".png" });
    await page.getByRole("button", { name: "отклонить", exact: true }).click();
    await settle();
    await settle();
    check(
      (await page.locator(".response__candidate .status").first().innerText()) === "Отклонён",
      "rejection updates status",
    );
    check((await page.locator(".response__actions").count()) === 0, "rejection removes actions");
    await page.keyboard.press("Escape");
    await settle();
    await page.getByRole("dialog").waitFor({ state: "detached" });
    await page.getByRole("dialog").waitFor({ state: "detached" });
    check((await page.getByRole("dialog").count()) === 0, "responses Escape");
    await page.evaluate(() => window.__vacancyPreview.emptyDetail());
    await settle();
    check(
      (await page.getByText("Описание пока не добавлено", { exact: true }).count()) === 1,
      "empty description",
    );
    await geometry("detail-empty", width);

    await go("/office/vacancies/my");
    await geometry("my", width);
    check((await page.locator("app-response-card").count()) === 3, "multiple personal responses");
    if (width !== 320)
      await page.screenshot({ path: out + "/my-" + width + ".png", fullPage: true });
    const last = page.locator("app-response-card").last();
    await last.getByRole("button", { name: "Показать полностью" }).click();
    await settle();
    check(
      (await last.getByRole("button", { name: "Свернуть" }).getAttribute("aria-expanded")) ===
        "true",
      "letter expanded",
    );
    const downloadPromise = page.waitForEvent("download");
    await page.locator("app-response-card").first().locator("a[download]").click();
    await settle();
    const download = await downloadPromise;
    check(download.suggestedFilename().endsWith(".pdf"), "attached file download");
    await go("/office/vacancies/my?empty");
    check(
      (await page.getByRole("heading", { name: "У вас пока нет откликов" }).count()) === 1,
      "personal responses empty state",
    );
    await geometry("my-empty", width);

    await go("/office/projects/5/edit");
    await page.evaluate(() => window.__vacancyPreview.fill());
    await settle();
    const submit = page.locator(".vacancy__submit button");
    await submit.click();
    await settle();
    await page.evaluate(() => window.__vacancyPreview.submit());
    check(
      (await page.evaluate(() => window.__vacancyPreview.calls)) === 1,
      "double submit blocked",
    );
    check(await submit.isDisabled(), "submit disabled during request");
    check((await page.getByRole("dialog").count()) === 0, "no confirmation before server success");
    await page.evaluate(() => window.__vacancyPreview.fail());
    await settle();
    check((await page.getByRole("dialog").count()) === 0, "no confirmation after error");
    check((await page.getByRole("alert").count()) === 1, "creation error visible");
    await submit.click();
    await settle();
    await page.evaluate(() => window.__vacancyPreview.succeed());
    await page.getByRole("dialog").waitFor();
    await settle();
    await geometry("created", width);
    check(
      (await page.locator("app-vacancy-card").count()) === 5,
      "created vacancy immediately in project",
    );
    if (width !== 320) await page.screenshot({ path: out + "/created-" + width + ".png" });
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      check(
        await page.evaluate(() => !!document.activeElement.closest("[role=dialog]")),
        "creation dialog focus contained",
      );
    }
    await page.keyboard.press("Escape");
    await settle();
    await page.getByRole("dialog").waitFor({ state: "detached" });
    check((await page.getByRole("dialog").count()) === 0, "creation dialog Escape");
    check(await submit.evaluate(el => document.activeElement === el), "creation restores focus");

    for (const [state, path] of [
      ["project", "/office/projects/5/edit"],
      ["catalog", "/office/vacancies/all"],
      ["detail", "/office/vacancies/10"],
      ["my", "/office/vacancies/my"],
    ]) {
      await go(path + "?stress");
      await geometry(state + "-stress", width);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go("/office/vacancies/all");
  const primary = page.locator("app-project-vacancy-card").first().locator(".button--inline");
  check(
    await primary.evaluate(el => getComputedStyle(el).backgroundColor === "rgb(138, 99, 230)"),
    "canonical CTA #8A63E6",
  );
  await primary.hover();
  await page.waitForTimeout(250);
  contrastResults.push({ state: "primary-hover", samples: await contrast(page) });
  check(
    await primary.evaluate(el => getComputedStyle(el).backgroundColor === "rgb(151, 100, 186)"),
    "canonical Button hover",
  );
  await page.keyboard.press("Tab");
  await primary.focus();
  await page.waitForTimeout(250);
  check(
    await primary.evaluate(el => {
      const style = getComputedStyle(el);
      return style.outlineStyle === "solid" && parseFloat(style.outlineWidth) >= 2;
    }),
    "visible keyboard focus",
  );
  const skillsToggle = page.locator("app-project-vacancy-card").first().locator(".skills__toggle");
  await skillsToggle.hover();
  contrastResults.push({ state: "skills-hover", samples: await contrast(page) });
  await go("/office/projects/5/edit");
  await page.evaluate(() => window.__vacancyPreview.fill());
  await settle();
  await page.locator(".vacancy__submit button").click();
  await settle();
  await page.evaluate(() => window.__vacancyPreview.succeed());
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Остаться в проекте", exact: true }).click();
  await settle();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  check((await page.locator("app-vacancy-card").count()) === 5, "stay retains created vacancy");
  check(
    (await page.evaluate(() => window.__vacancyPreview.router.url)) === "/office/projects/5/edit",
    "stay retains project route",
  );
  await go("/office/projects/5/edit");
  await page.evaluate(() => window.__vacancyPreview.fill());
  await settle();
  await page.locator(".vacancy__submit button").click();
  await settle();
  await page.evaluate(() => window.__vacancyPreview.succeed());
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Перейти к вакансиям", exact: true }).click();
  await settle();
  check(
    (await page.evaluate(() => window.__vacancyPreview.router.url)) === "/office/vacancies/99",
    "confirmation uses existing vacancy detail route",
  );

  await go("/office/vacancies/10");
  await page.getByRole("button", { name: "посмотреть отклики", exact: true }).click();
  await settle();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "принять", exact: true }).click();
  await settle();
  await settle();
  check(
    (await page.locator(".response__candidate .status").first().innerText()) === "Принят",
    "accept updates candidate",
  );
  await page.keyboard.press("Escape");
  await settle();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  check(
    (await page.locator(".detail__heading .status").innerText()) === "Закрыта",
    "accept closes vacancy",
  );

  check(errors.length === 0, "browser errors: " + errors.join("\n"));
  fs.writeFileSync(
    "docs/vacancy-redesign/visual-results.json",
    JSON.stringify(
      {
        checks,
        errors,
        measurements,
        contrastResults,
        contrastPassed: false,
        contrastLimitations: contrastResults.flatMap(({ state, samples }) =>
          samples.filter(sample => sample.ratio < 4.5).map(sample => ({ state, ...sample })),
        ),
        note: "Глобальные токены сохранены. Контраст измерен, полного WCAG AA PASS нет: основной CTA, outline и вторичный текст имеют ограничения.",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks, errors, states: measurements.length }));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
