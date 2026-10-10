/** @format */

// Production-layout regressions use synthetic API data; no live mutations are sent.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const fixtures = require("./mobile-fixtures.cjs");
const { launch, assertViewport } = require("./browser-harness.cjs");
const preview = require("./preview.cjs");
const [phase = "verified", widthsText = "320,390,768", outputText] = process.argv.slice(2);
const output = path.resolve(outputText || ".release-mobile/layout-regression");
const baseUrl = "http://127.0.0.1:4473";
const original = fixtures.response;
let role = "organizer";
let notificationMode = "empty";
let read = false;
const notification = {
  id: 1,
  type: "project_invite_created",
  category: "project",
  title: "Приглашение в проект",
  message: "Команда приглашает вас присоединиться",
  actor: null,
  imageUrl: null,
  actionUrl: "/office/projects/dashboard",
  readAt: null,
  createdAt: "2026-10-01T12:00:00Z",
};
fixtures.response = (endpoint, method, query, state) => {
  if (/\/notifications\/unread-count\/$/.test(endpoint))
    return { unreadCount: notificationMode === "loaded" && !read ? 1 : 0 };
  if (/\/notifications\/read-all\/$/.test(endpoint)) {
    read = true;
    return { updated: 1, unreadCount: 0 };
  }
  if (/\/notifications\/$/.test(endpoint))
    return {
      count: notificationMode === "loaded" ? 1 : 0,
      unreadCount: notificationMode === "loaded" && !read ? 1 : 0,
      next: null,
      previous: null,
      results: notificationMode === "loaded" ? [notification] : [],
    };
  if (/\/programs\/1\/analytics-widget\/$/.test(endpoint) && role === "participant")
    return {
      programId: 1,
      isCompetitive: true,
      role,
      participant: {
        participantProject: null,
        caseProvided: true,
        caseName: null,
        stage: "not_submitted",
        submissionOpen: false,
      },
    };
  return original(endpoint, method, query, state);
};

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await document.fonts.ready;
    await Promise.all([...document.fonts].map(font => font.load().catch(() => {})));
  });
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}",
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(async () => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function go(page, route, selector) {
  await page.evaluate(route => {
    history.pushState({}, "", route);
    dispatchEvent(new PopStateEvent("popstate"));
  }, route);
  await page.locator(selector).first().waitFor({ state: "visible" });
  await settle(page);
}
async function geometry(page) {
  return page.evaluate(() => {
    const box = el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    return [...document.querySelectorAll("button .button__label")].flatMap(label => {
      const icon = label.querySelector("i[appIcon]");
      if (!icon) return [];
      const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
      let text;
      while (walker.nextNode())
        if (walker.currentNode.textContent.trim()) {
          text = walker.currentNode;
          break;
        }
      if (!text) return [];
      const range = document.createRange();
      range.selectNodeContents(text);
      return [
        {
          text: text.textContent.trim(),
          icon: box(icon),
          label: box(label),
          textBox: box(range),
          drawn: icon.querySelector("use").getBBox().width,
        },
      ];
    });
  });
}

(async () => {
  fs.mkdirSync(path.join(output, phase), { recursive: true });
  const rows = [];
  const repeated = new Map();
  for (const width of widthsText.split(",").map(Number)) {
    const mobile = width < 1000;
    for (const variant of process.env.QA_LAYOUT_VARIANTS?.split(",") || [
      "organizer",
      "participant",
      "controls",
      "notifications-empty",
      "notifications-loaded",
    ]) {
      role = variant === "participant" ? "participant" : "organizer";
      fixtures.program.isUserManager = role === "organizer";
      fixtures.program.isUserMember = role === "participant";
      fixtures.program.isUserExpert = false;
      // Role/action scenarios have a short description; the core visual gate
      // separately covers long descriptions and the legacy read-more state.
      fixtures.program.description =
        "Программа для студенческих команд и совместной работы над проектами.";
      fixtures.program.datetimeRegistrationEnds = "2025-01-01";
      fixtures.program.datetimeProjectSubmissionEnds = "2025-01-01";
      fixtures.program.presentationAddress = "/assets/images/profile/main.svg";
      fixtures.program.links = ["https://example.test/contacts"];
      fixtures.program.materials = ["https://example.test/materials"];
      fixtures.project.shortDescription =
        "Платформа для инновационной молодежи, студенческих команд и совместной работы над технологическими проектами";
      notificationMode = variant === "notifications-loaded" ? "loaded" : "empty";
      read = false;
      const harness = await launch(width, { baseUrl });
      const { page, context, browser } = harness;
      try {
        await preview(context, baseUrl);
        await page.goto(baseUrl + "/office/feed");
        await page.locator("app-open-vacancy").waitFor();
        await settle(page);
        if (variant.startsWith("notifications")) {
          await page.locator("button.control-panel__bell").click();
          const dialog = page.locator("#notification-center-popup");
          await dialog.waitFor({ state: "attached" });
          await settle(page);
          if (phase !== "baseline") {
            const r = await dialog.boundingBox();
            assert.ok(
              r.y >= 0 && r.y < 100 && r.x >= 0 && r.x + r.width <= width,
              "Bell popup must be within viewport below header",
            );
            if (notificationMode === "loaded") {
              await page.getByRole("button", { name: "Прочитать все" }).waitFor();
              assert.equal(await dialog.locator(".notification-item").count(), 1);
            } else await page.getByText("Пока нет уведомлений", { exact: true }).waitFor();
          }
        } else if (variant === "controls") {
          await go(page, "/office/projects/dashboard", "app-info-card");
          if (phase !== "baseline" && mobile) {
            const description = await page
              .locator(".card__description p")
              .first()
              .evaluate(el => ({
                height: el.getBoundingClientRect().height,
                parent: el.parentElement.getBoundingClientRect().height,
                line: parseFloat(getComputedStyle(el).lineHeight),
              }));
            assert.ok(
              description.height >= description.line * 2 &&
                description.parent >= description.height - 1,
              "Project description clipped by parent",
            );
          }
          const createIcons = await geometry(page);
          if (phase !== "baseline" && mobile) {
            const create = createIcons.find(item => item.text.includes("создать проект"));
            assert.ok(create && create.drawn > 0, "Create project icon must be visible");
            assert.ok(
              create.icon.y < create.textBox.bottom && create.icon.bottom > create.textBox.y,
              "Create project plus wraps under text",
            );
          }
          await page.screenshot({
            path: path.join(output, phase, `create-project-${width}.png`),
            fullPage: true,
          });
          rows.push({ width, variant: "create-project", icons: createIcons });
          for (const step of ["contacts", "achievements"]) {
            await go(
              page,
              `/office/projects/1/edit?editingStep=${step}&programLinkId=1`,
              step === "contacts"
                ? "app-project-partner-resources-step"
                : "app-project-achievement-step",
            );
            const icons = await geometry(page);
            if (phase !== "baseline" && mobile)
              for (const item of icons) {
                assert.ok(item.drawn > 0, `Missing icon: ${item.text}`);
                assert.ok(
                  item.icon.y < item.textBox.bottom && item.icon.bottom > item.textBox.y,
                  `Icon wraps under text: ${item.text}`,
                );
                assert.ok(
                  item.icon.x >= item.label.x - 1 && item.icon.right <= item.label.right + 1,
                  `Icon outside button: ${item.text}`,
                );
              }
            await page.screenshot({
              path: path.join(output, phase, `${step}-${width}.png`),
              fullPage: true,
            });
          }
        } else {
          await go(page, "/office/program/1", "app-program-role-widget");
          const icons = await geometry(page);
          if (phase !== "baseline" && mobile)
            for (const item of icons) {
              assert.ok(item.drawn > 0, `Missing program icon: ${item.text}`);
              assert.ok(
                item.icon.y < item.textBox.bottom && item.icon.bottom > item.textBox.y,
                `Program icon wraps: ${item.text}`,
              );
            }
          if (phase !== "baseline")
            assert.equal(
              await page.locator(".widget__badge").textContent(),
              role === "participant" ? "участник" : "организатор",
            );
        }
        if (phase !== "baseline" && mobile) await assertViewport(page);
        assert.deepEqual(harness.errors, [], variant + " console errors");
        const pixels = await page.screenshot({
          path: path.join(output, phase, `${variant}-${width}.png`),
          fullPage: true,
        });
        const key = `${variant}-${width}`;
        if (repeated.has(key))
          assert.deepEqual(pixels, repeated.get(key), `${key}: unstable repeated screenshot`);
        repeated.set(key, pixels);
        if (variant.startsWith("notifications") && phase !== "baseline") {
          if (notificationMode === "loaded") {
            await page.getByRole("button", { name: "Прочитать все" }).click();
            await page.waitForFunction(() => !document.querySelector(".control-panel__attention"));
          }
          await page.keyboard.press("Escape");
          await page.locator("#notification-center-popup").waitFor({ state: "detached" });
          await page.locator("button.control-panel__bell").click();
          await page.locator("#notification-center-popup").waitFor({ state: "attached" });
          await page.mouse.click(2, 840);
          await page.locator("#notification-center-popup").waitFor({ state: "detached" });
        }
        rows.push({ width, variant, passed: true });
        console.log(`${phase}: ${variant} ${width}`);
      } finally {
        await browser.close();
      }
    }
  }
  fs.writeFileSync(
    path.join(output, `${phase}-layout${process.env.QA_LAYOUT_VARIANTS ? "-stability" : ""}.json`),
    JSON.stringify(rows, null, 2) + "\n",
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
