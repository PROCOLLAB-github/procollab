/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch, assertViewport } = require("../responsive/browser-harness.cjs");
const fixtures = require("../responsive/fixtures.cjs");

const directory = path.join(__dirname, "screenshots", "final");
fs.mkdirSync(directory, { recursive: true });
const rows = [];
const widths = [320, 390, 768, 1440];
const sections = [
  ["projects", "/office/projects/all", "app-info-card"],
  ["vacancies", "/office/vacancies/all", "app-project-vacancy-card"],
  ["programs", "/office/program/all", "app-program-card"],
  ["courses", "/office/courses/all", "app-course"],
  ["profile", "/office/profile/1", "app-detail"],
  ["profile-edit", "/office/profile/edit?editingStep=main", "app-page-header"],
  [
    "onboarding-0",
    "/office/onboarding/stage-0",
    "app-stage-zero .page__form input:not([type=file])",
  ],
  ["onboarding-1", "/office/onboarding/stage-1", "app-stage-one app-autocomplete-input"],
];

async function goto(page, route, settled = true) {
  await page.goto("http://127.0.0.1:4360" + route);
  if (settled) await page.waitForLoadState("networkidle");
}

async function capture(harness, name, width, extra = {}) {
  const measurement = await assertViewport(harness.page);
  const expectedErrors = extra.injectedHttp500
    ? harness.errors.filter(
        message =>
          /Failed to load resource.*500/.test(message) ||
          /\[ERROR\] \[HTTP\] GET https:\/\/(?:api|dev)\.procollab\.ru\/programs\/1\/manager-overview\/ 500 /.test(
            message,
          ),
      )
    : [];
  assert.deepEqual(
    harness.errors.filter(message => !expectedErrors.includes(message)),
    [],
  );
  const screenshot = `screenshots/final/${name}-${width}.png`;
  await harness.page.screenshot({ path: path.join(__dirname, screenshot), fullPage: true });
  rows.push({ name, width, passed: true, ...measurement, screenshot, expectedErrors, ...extra });
  console.log(JSON.stringify({ name, width, passed: true }));
}

async function state(width, name, action) {
  const harness = await launch(width, { isMobile: width < 750, hasTouch: width < 750 });
  harness.page.setDefaultTimeout(8000);
  try {
    await action(harness);
  } finally {
    await harness.browser.close();
  }
}

(async () => {
  for (const width of widths) {
    const harness = await launch(width, { isMobile: width < 750, hasTouch: width < 750 });
    try {
      for (const [name, route, content] of sections) {
        harness.errors.length = 0;
        await goto(harness.page, route);
        await harness.page.locator(content).first().waitFor({ state: "visible" });
        await capture(harness, name, width, { category: "section" });
      }
    } finally {
      await harness.browser.close();
    }

    await state(width, "loading-page", async h => {
      let release;
      const pending = new Promise(resolve => {
        release = resolve;
      });
      await h.context.route("**/programs/1/manager-overview/**", async route => {
        await pending;
        const url = new URL(route.request().url());
        await route.fulfill({ json: fixtures.response(url.pathname, "GET", url.searchParams) });
      });
      try {
        await goto(h.page, "/office/program/1/analytics", false);
        await h.page.getByTestId("analytics-loading").waitFor();
        await capture(h, "loading-page", width, { category: "loading" });
      } finally {
        release();
      }
      await h.page.getByTestId("analytics-loading").waitFor({ state: "hidden" });
    });

    await state(width, "loading-action", async h => {
      await goto(h.page, "/office/courses/1/lesson/1");
      await h.page.locator("app-write-task textarea").fill("Ответ для финальной проверки UI Kit");
      let release;
      const pending = new Promise(resolve => {
        release = resolve;
      });
      let submissions = 0;
      await h.context.route("**/courses/tasks/1/answer/", async route => {
        submissions++;
        await pending;
        const url = new URL(route.request().url());
        await route.fulfill({ json: fixtures.response(url.pathname, "POST", url.searchParams) });
      });
      try {
        const button = h.page.getByRole("button", { name: "завершить урок", exact: true });
        await button.click();
        await h.page.locator("app-button app-loader").waitFor();
        assert.equal(await button.isDisabled(), true);
        assert.equal(await button.getAttribute("aria-busy"), "true");
        await button.evaluate(element => element.click());
        assert.equal(submissions, 1, "Loading must prevent duplicate submission");
        await capture(h, "loading-action", width, { category: "loading", submissions });
      } finally {
        release();
      }
      await h.page.locator("app-complete").waitFor();
    });

    await state(width, "empty", async h => {
      await h.context.route(
        url => /\/vacancies\/$/.test(url.pathname),
        route => route.fulfill({ json: { count: 0, results: [], next: null, previous: null } }),
      );
      await goto(h.page, "/office/vacancies/all");
      await h.page.locator("app-state").getByText("Вакансии не найдены", { exact: true }).waitFor();
      await capture(h, "empty", width, { category: "empty" });
    });

    await state(width, "error", async h => {
      let failing = true;
      let attempts = 0;
      await h.context.route("**/programs/1/manager-overview/**", async route => {
        attempts++;
        if (failing) return route.fulfill({ status: 500, json: { detail: "Injected QA failure" } });
        const url = new URL(route.request().url());
        return route.fulfill({ json: fixtures.response(url.pathname, "GET", url.searchParams) });
      });
      await goto(h.page, "/office/program/1/analytics");
      await h.page.getByTestId("analytics-error").waitFor({ timeout: 60000 });
      assert.equal(await h.page.getByTestId("analytics-error").getAttribute("role"), "alert");
      await capture(h, "error", width, { category: "error", injectedHttp500: true });
      failing = false;
      await h.page.getByRole("button", { name: "Повторить", exact: true }).click();
      await h.page.getByTestId("analytics-error").waitFor({ state: "hidden" });
      await h.page.locator(".summary-card").first().waitFor();
      assert.ok(attempts >= 2, "Error retry must reload data");
      await assertViewport(h.page);
      rows.at(-1).retryPassed = true;
    });

    await state(width, "disabled-action", async h => {
      await goto(h.page, "/office/courses/1/lesson/1");
      const button = h.page.getByRole("button", { name: "завершить урок", exact: true });
      assert.equal(await button.isDisabled(), true);
      const before = h.requests.filter(request => request.method !== "GET").length;
      await button.evaluate(element => element.click());
      assert.equal(h.requests.filter(request => request.method !== "GET").length, before);
      assert.equal(
        await button.evaluate(element => {
          element.focus();
          return document.activeElement !== element;
        }),
        true,
      );
      await capture(h, "disabled-action", width, { category: "disabled" });
    });

    await state(width, "disabled-filter", async h => {
      await goto(h.page, "/office/feed");
      const button = h.page.getByRole("button", { name: /образование/ });
      assert.equal(await button.isDisabled(), true);
      const before = h.page.url();
      await button.evaluate(element => element.click());
      assert.equal(h.page.url(), before);
      await capture(h, "disabled-filter", width, { category: "disabled" });
    });

    await state(width, "validation-register", async h => {
      await goto(h.page, "/auth/register");
      if (width >= 1000) {
        const register = await h.page.locator(".register").boundingBox();
        assert.ok(register.x >= 199, "Registration must retain the desktop auth gutter");
      }
      for (const checkbox of await h.page.locator("app-checkbox .field").all())
        await checkbox.click();
      await h.page.getByRole("button", { name: "зарегистрироваться", exact: true }).click();
      await h.page.locator(".error").first().waitFor();
      assert.equal(
        h.requests.some(
          request => request.method === "POST" && /\/auth\/users\/$/.test(request.path),
        ),
        false,
      );
      await capture(h, "validation-register", width, { category: "validation" });
    });

    const avatar = fixtures.user.avatar;
    fixtures.user.avatar = null;
    try {
      await state(width, "validation-onboarding", async h => {
        await goto(h.page, "/office/onboarding/stage-0");
        await h.page.getByRole("button", { name: "продолжить", exact: true }).click();
        await h.page.locator(".error").first().waitFor();
        assert.equal(h.page.url().includes("stage-0"), true);
        assert.equal(
          h.requests.some(request => request.method === "PATCH"),
          false,
        );
        await capture(h, "validation-onboarding", width, { category: "validation" });
      });
    } finally {
      fixtures.user.avatar = avatar;
    }
  }
  assert.equal(rows.length, 64);
  fs.writeFileSync(
    path.join(__dirname, "final-results.json"),
    JSON.stringify({ widths, rows }, null, 2) + "\n",
  );
  console.log(`${rows.length} final UI checks passed`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
