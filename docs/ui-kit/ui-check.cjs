/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch, assertViewport } = require("../responsive/browser-harness.cjs");
const routes = [
  "/office/feed",
  "/office/projects/all",
  "/office/projects/my",
  "/office/projects/subscriptions",
  "/office/projects/invites",
  "/office/projects/dashboard",
  "/office/vacancies/all",
  "/office/program/all",
  "/office/courses/all",
  "/office/members",
  "/office/profile/1",
  "/office/profile/edit?editingStep=main",
];
(async () => {
  const rows = [];
  for (const width of [320, 390, 1440]) {
    const { browser, page, base, errors } = await launch(width);
    try {
      for (const route of routes) {
        errors.length = 0;
        await page.goto(base + route);
        await page.waitForLoadState("networkidle");
        await assertViewport(page);
        const metrics = await page.evaluate(() => {
          const visible = e => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          };
          const smallActions = [
            ...document.querySelectorAll(
              "button.ui-button, app-button button, .card__project-action, .member-card__action",
            ),
          ]
            .filter(visible)
            .filter(e => e.getBoundingClientRect().height < 43)
            .map(e => ({
              class: e.className,
              text: e.textContent.trim(),
              height: e.getBoundingClientRect().height,
            }));
          const outsideCards = [
            ...document.querySelectorAll(".card__project-action, .member-card__action"),
          ]
            .filter(visible)
            .filter(e => {
              const action = e.getBoundingClientRect();
              for (
                let parent = e.parentElement;
                parent && parent !== document.body;
                parent = parent.parentElement
              ) {
                const r = parent.getBoundingClientRect(),
                  s = getComputedStyle(parent);
                if (
                  parent.matches(".card__body, .member-card") ||
                  ["hidden", "clip"].includes(s.overflowY)
                ) {
                  if (action.bottom > r.bottom + 1 || action.top < r.top - 1) return true;
                }
              }
              return false;
            })
            .map(e => e.textContent.trim());
          const menu = document.querySelector(".nav-bar__toggle svg");
          const wrappedLabels = [
            ...document.querySelectorAll(
              "button, .card__project-action, .member-card__action, .ui-filters__header > p",
            ),
          ]
            .filter(visible)
            .filter(element => {
              const label = element.textContent.trim();
              if (!/^(?:[cс]охранить|сбросить|Открыть|Профиль|фильтры)$/.test(label)) return false;
              const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
              while (walker.nextNode()) {
                if (walker.currentNode.textContent.trim() !== label) continue;
                const range = document.createRange();
                range.selectNodeContents(walker.currentNode);
                const lines = new Set(
                  [...range.getClientRects()]
                    .filter(rect => rect.width > 0)
                    .map(rect => Math.round(rect.top)),
                );
                if (lines.size > 1) return true;
              }
              return false;
            })
            .map(element => element.textContent.trim());
          return {
            smallActions,
            outsideCards,
            wrappedLabels,
            menuIcon: menu && visible(menu) ? menu.getBoundingClientRect().width : null,
          };
        });
        assert.deepEqual(metrics.smallActions, [], JSON.stringify(metrics.smallActions));
        assert.deepEqual(
          metrics.wrappedLabels,
          [],
          "Short action labels must fit on one line: " + route + " " + width,
        );
        assert.deepEqual(
          metrics.outsideCards,
          [],
          "CTA extends outside its card: " + route + " " + width,
        );
        if (metrics.menuIcon !== null)
          assert.ok(metrics.menuIcon >= 16, "Menu icon was compressed");
        assert.equal(errors.length, 0, errors.join("\n"));
        rows.push({ width, route, metrics, passed: true });
      }
    } finally {
      await browser.close();
    }
  }
  fs.writeFileSync(path.join(__dirname, "ui-check.json"), JSON.stringify(rows, null, 2) + "\n");
  console.log(`${rows.length} UI geometry checks passed`);
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
