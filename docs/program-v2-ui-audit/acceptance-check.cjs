/** @format */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch, open } = require("./browser-check.cjs");
const { measure } = require("../responsive/browser-harness.cjs");
const fixture = require("./fixtures.cjs");
const phase = process.argv[2] || "acceptance-final";
const widths = (process.env.WIDTHS || "320,390,768,1440,1920").split(",").map(Number);
const destination = path.join(__dirname, "screenshots", phase, "conformance");
fs.mkdirSync(destination, { recursive: true });
const results = [],
  probes = [];
const baselineCapture = process.env.PROGRAM_UI_BASELINE === "1";
const button = (page, name) => page.getByRole("button", { name, exact: true });

async function checkDialog(page, width, preset, className = "experts-modal") {
  const selector = baselineCapture ? ".modal__body" : `.modal__body.${className}`;
  const body = page.locator(selector);
  await body.waitFor();
  const expected = Math.min(preset, width - (className === "experts-modal" ? 40 : 32));
  if (!baselineCapture)
    await page.waitForFunction(
      ({ selector, expected }) =>
        Math.abs(document.querySelector(selector).getBoundingClientRect().width - expected) < 1,
      { selector, expected },
    );
  const actual = await body.evaluate(e => ({
    width: e.getBoundingClientRect().width,
    padding: getComputedStyle(e).padding,
  }));
  if (!baselineCapture) assert.ok(Math.abs(actual.width - expected) < 1);
  return { preset, expected, ...actual, matchesReference: Math.abs(actual.width - expected) < 1 };
}

async function run() {
  for (const width of widths)
    for (const version of ["v1", "v2"]) {
      const { browser, context, page, requests, errors } = await launch(width);
      page.setDefaultTimeout(8000);
      async function record(name, action) {
        if (process.env.ACCEPTANCE_CASES && !process.env.ACCEPTANCE_CASES.split(",").includes(name))
          return;
        const errorStart = errors.length;
        try {
          const details = await action();
          const metrics = await measure(page);
          assert.equal(metrics.overflows.length, 0, JSON.stringify(metrics.overflows));
          assert.ok(metrics.pageWidth <= width + 1);
          assert.deepEqual(errors.slice(errorStart), []);
          const file = `${version}-${name}-${width}.png`;
          await page.screenshot({ path: path.join(destination, file), fullPage: true });
          results.push({
            version,
            name,
            width,
            file,
            passed: true,
            referenceOnly: baselineCapture,
            details,
            metrics,
          });
          console.log(
            `${version} ${name} ${width}: ${baselineCapture ? "CAPTURED BASELINE" : "PASS"}`,
          );
        } catch (error) {
          results.push({ version, name, width, passed: false, error: error.message });
          console.log(`${version} ${name} ${width}: FAIL ${error.message.split("\n")[0]}`);
        }
      }
      try {
        await open(page, version, "analytics", "analytics");
        const probe = await page.evaluate(() => {
          const out = {};
          for (const [tag, cls] of [
            ["input", "ui-field"],
            ["button", "ui-button"],
            ["input", "ui-choice"],
          ]) {
            const e = document.createElement(tag);
            e.className = cls;
            if (cls === "ui-choice") e.type = "checkbox";
            document.body.append(e);
            const css = getComputedStyle(e);
            out[cls] = Object.fromEntries(
              [
                "fontSize",
                "lineHeight",
                "padding",
                "borderRadius",
                "backgroundColor",
                "minHeight",
              ].map(k => [k, css[k]]),
            );
            e.remove();
          }
          return out;
        });
        probes.push({ version, width, styles: probe });
        if (process.env.PROBE_ONLY === "1") continue;

        await record("figma-expert-scope", async () => {
          await open(page, version, "experts", "experts");
          await page
            .locator(".experts__table")
            .getByRole("button", { name: /^Действия эксперта:/ })
            .first()
            .click();
          await page.getByRole("menuitem", { name: "Изменить кейсы", exact: true }).click();
          return checkDialog(page, width, 600);
        });
        await record("figma-expert-quota", async () => {
          await open(page, version, "experts", "distribution");
          await page
            .locator(".experts__quota")
            .getByRole("button", { name: "Изменить", exact: true })
            .click();
          return checkDialog(page, width, 560);
        });
        await record("distribution-no-results", async () => {
          await open(page, version, "experts", "distribution");
          await page
            .locator('.experts__toolbar input[type="search"]')
            .fill("Несуществующее решение");
          await page
            .getByText(/Проекты не найдены|Сданных решений для распределения не найдено/)
            .waitFor();
          const cell = page.locator(".experts__table--projects td[colspan]");
          const geometry = await cell.evaluate(e => ({
            cellWidth: e.getBoundingClientRect().width,
            tableWidth: e.closest("table").getBoundingClientRect().width,
          }));
          if (!baselineCapture)
            assert.ok(
              geometry.cellWidth >= geometry.tableWidth * 0.8,
              "Пустое состояние должно занимать ширину таблицы",
            );
          return geometry;
        });
        await record("figma-expert-assignments", async () => {
          await open(page, version, "experts", version === "v1" ? "distribution" : "experts");
          if (version === "v1") {
            await page
              .locator(".experts__table")
              .getByRole("button", { name: /^Действия проекта:/ })
              .first()
              .click();
            await page.getByRole("menuitem", { name: "Изменить экспертов", exact: true }).click();
          } else {
            await page
              .locator(".experts__table")
              .getByRole("button", { name: /^Действия эксперта:/ })
              .first()
              .click();
            await page.getByRole("menuitem", { name: "Назначить решения", exact: true }).click();
          }
          return checkDialog(page, width, 680);
        });
        await record("analytics-assignment-layout", async () => {
          await open(page, version, "analytics", "analytics");
          const trigger = button(page, "Открыть назначения");
          await trigger.click();
          const geometry = await checkDialog(
            page,
            width,
            980,
            "analytics-drilldown-body--assignments",
          );
          const table = page.locator(
            baselineCapture && version === "v2"
              ? ".solution-analytics__table table"
              : ".analytics-drilldown__table--assignments",
          );
          await table.waitFor();
          if (!baselineCapture)
            assert.equal(
              await table.locator("tbody").evaluate(e => getComputedStyle(e).display),
              width < 1000 ? "grid" : "table-row-group",
            );
          await page.waitForFunction(() => !!document.activeElement?.closest('[role="dialog"]'));
          for (let i = 0; i < 6; i++) {
            await page.keyboard.press("Tab");
            assert.ok(
              await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')),
            );
          }
          return geometry;
        });
        if (version === "v2")
          await record("analytics-zero-false-comment", async () => {
            await open(page, version, "analytics", "analytics");
            await button(page, "Открыть назначения").click();
            await button(page, "Посмотреть оценку").first().click();
            await page.getByRole("dialog").getByText("0", { exact: true }).waitFor();
            await page.getByRole("dialog").getByText("Нет", { exact: true }).waitFor();
            assert.ok(requests.some(r => /\/solution-analytics\/assignments\/801\/$/.test(r.path)));
            assert.ok(!requests.some(r => /\/manager-overview\/assignments/.test(r.path)));
            return { solutionAssignmentId: 801, zeroAndFalseRendered: true };
          });
        await record("figma-invite-filled", async () => {
          await open(page, version, "experts", "experts");
          await button(page, "Пригласить эксперта").click();
          const geometry = await checkDialog(page, width, 560);
          const email = page.getByRole("dialog").locator('input[type="email"]');
          await email.fill("invalid-email");
          await email.blur();
          const invitationWrites = () =>
            requests.filter(
              request => request.method === "POST" && request.path.includes("/management/experts"),
            ).length;
          const writesBefore = invitationWrites();
          await button(page, "Отправить приглашение").click();
          if (!baselineCapture)
            await page.waitForFunction(
              () =>
                document
                  .querySelector('.modal__body input[type="email"]')
                  .getAttribute("aria-invalid") === "true",
            );
          if (!baselineCapture)
            await page
              .getByRole("dialog")
              .getByRole("alert")
              .filter({ hasText: "Введите корректный email эксперта." })
              .waitFor();
          await page.waitForTimeout(250);
          assert.equal(
            invitationWrites(),
            writesBefore,
            "Невалидный email не должен отправляться в API",
          );
          await page.screenshot({
            path: path.join(destination, `${version}-invite-invalid-${width}.png`),
            fullPage: true,
          });
          await email.fill("review-expert@example.test");
          if (!baselineCapture)
            await page.waitForFunction(
              () =>
                document
                  .querySelector('.modal__body input[type="email"]')
                  .getAttribute("aria-invalid") === "false",
            );
          await page.waitForFunction(() =>
            [...document.querySelectorAll(".modal__body button")].some(
              button => button.textContent.trim() === "Отправить приглашение" && !button.disabled,
            ),
          );
          await page.waitForTimeout(250);
          assert.equal(await button(page, "Отправить приглашение").isDisabled(), false);
          return { ...geometry, invalidEmailBlocked: true };
        });
        await record("populated-expert-pagination", async () => {
          await context.route("**/programs/*/management/experts/", route => {
            const data = fixture.roster();
            data.experts = Array.from({ length: 25 }, (_, i) => ({
              ...data.experts[i % 5],
              id: 200 + i,
              userId: 200 + i,
              name: `Эксперт программы ${i + 1}`,
              email: `review${i + 1}@example.test`,
              status: ["joined", "pending", "expired", "revoked"][i % 4],
              invitationId: 200 + i,
            }));
            return route.fulfill({ json: data });
          });
          await open(page, version, "experts", "experts");
          await page.waitForFunction(
            () => document.querySelectorAll(".experts__table tr[data-expert-id]").length === 20,
          );
          await page
            .getByRole("checkbox", { name: "Выбрать всех экспертов по фильтрам", exact: true })
            .check();
          await button(page, "Далее").click();
          await page.waitForFunction(
            () => document.querySelectorAll(".experts__table tr[data-expert-id]").length === 5,
          );
          const selected = await page
            .locator('.experts__table tr[data-expert-id] input[type="checkbox"]')
            .evaluateAll(inputs => inputs.every(input => input.checked));
          assert.equal(selected, true);
          return { totalExperts: 25, firstPage: 20, secondPage: 5, selectionPreserved: true };
        });
      } finally {
        await browser.close();
      }
    }
  fs.writeFileSync(
    path.join(__dirname, `${phase}-scope-probes.json`),
    JSON.stringify(probes, null, 2),
  );
  fs.writeFileSync(
    path.join(__dirname, `${phase}-conformance-results.json`),
    JSON.stringify(results, null, 2),
  );
  if (results.some(r => !r.passed)) process.exitCode = 1;
}
run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
