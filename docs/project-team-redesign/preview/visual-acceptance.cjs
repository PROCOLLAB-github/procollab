/** @format */

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("fs");
const assert = require("assert/strict");
const out = "docs/project-team-redesign/screenshots";
fs.mkdirSync(out, { recursive: true });
let checks = 0;
const measurements = [];
const errors = [];
function check(value, message) {
  assert.ok(value, message);
  checks++;
}
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", e => errors.push(e.message));
  await page.route("https://hwchamber.co.uk/**", r =>
    r.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" rx="30" fill="#eee7fb"/><circle cx="30" cy="23" r="10" fill="#9b83c9"/><path d="M10 57v-6a20 18 0 0 1 40 0v6" fill="#9b83c9"/></svg>',
    }),
  );
  const settle = () => page.evaluate(() => window.__invitePreview.fixture.whenStable());
  async function go(mode, extra = "") {
    await page.goto(
      "http://127.0.0.1:4346/office/" +
        (mode === "team" ? "projects/5/edit" : "profile/10") +
        "?mode=" +
        mode +
        extra,
    );
    await page.waitForFunction(() => !!window.__invitePreview);
    await settle();
    await page.evaluate(() => document.fonts.ready);
  }
  async function geometry(state, width) {
    const info = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".member-row")];
      const box = e => {
        const r = e.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          right: r.right,
          bottom: r.bottom,
        };
      };
      return {
        viewport: document.documentElement.clientWidth,
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        main: document.querySelector(".team__main")
          ? box(document.querySelector(".team__main"))
          : null,
        sidebar: document.querySelector(".team__sidebar")
          ? box(document.querySelector(".team__sidebar"))
          : null,
        rows: rows.map(e => ({
          box: box(e),
          identity: box(e.querySelector(".member-row__identity")),
          actions: box(e.querySelector(".member-row__actions")),
        })),
        dialog: document.querySelector(".project-invite")
          ? box(document.querySelector(".project-invite"))
          : null,
      };
    });
    check(info.overflow === 0, state + ": horizontal overflow");
    for (const row of info.rows) {
      check(row.identity.right <= row.actions.x + 1, state + ": actions overlap");
      check(row.box.right <= width + 1, state + ": row overflow");
    }
    if (width <= 600 && info.sidebar)
      check(info.sidebar.y >= info.main.bottom - 1, state + ": sidebar follows main");
    if (info.dialog) {
      check(
        info.dialog.x >= 0 && info.dialog.right <= info.viewport,
        state + ": modal horizontal bounds",
      );
      check(info.dialog.y >= 0, state + ": modal top");
    }
    measurements.push({ state, width, ...info });
  }
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await go("team");
    check((await page.locator("app-collaborator-card").count()) === 4, "4 active members");
    check(
      (await page.locator(".invite__submit button").boundingBox()).height >= 44,
      "large invite CTA",
    );
    check((await page.locator("app-invite-card").count()) === 2, "2 pending invites");
    check(
      (await page.locator('[data-team-count="members"]').innerText()) === "4",
      "members metric",
    );
    check(
      (await page.locator('[data-team-count="pending"]').innerText()) === "2",
      "pending metric",
    );
    check((await page.locator(".member-row__you").innerText()) === "Вы", "current member");
    await geometry("team", width);
    await page.screenshot({ path: `${out}/team-${width}.png`, fullPage: true });
    await page.locator(".invite__submit button").click();
    await page.locator(".project-invite").waitFor();
    await page.getByRole("searchbox").fill("Иван");
    await page.locator('[role="radio"]').last().waitFor();
    const recipient = page.locator('[role="radio"]:not([disabled])').last();
    await recipient.click();
    await page.getByRole("combobox").fill("Бизнес-аналитик");
    await page.getByRole("combobox").press("Tab");
    await geometry("team-invite-selected", width);
    await page.screenshot({ path: `${out}/team-invite-${width}.png` });
    await page.getByRole("button", { name: "Отправить приглашение", exact: true }).click();
    await page.evaluate(() => window.__invitePreview.success());
    await settle();
    await page.locator(".project-invite").waitFor({ state: "detached" });
    check(
      (await page.locator('[data-team-count="pending"]').innerText()) === "3",
      "success creates pending",
    );
    check(
      (await page.locator('[data-team-count="members"]').innerText()) === "4",
      "success does not prematurely accept",
    );
    await page
      .getByRole("button", { name: "Изменить роль в приглашении: Екатерина Иванова", exact: true })
      .click();
    await page.locator(".project-invite").waitFor();
    await page.getByRole("combobox").fill("  Продуктовый   аналитик  ");
    await page.getByRole("combobox").press("Tab");
    await page.getByRole("button", { name: "Сохранить", exact: true }).click();
    await settle();
    check(
      (await page.locator("app-invite-card").first().innerText()).includes("Продуктовый аналитик"),
      "pending role updated",
    );
    const edit = await page.evaluate(() =>
      window.__invitePreview.calls.find(c => c[0] === "update"),
    );
    check(
      JSON.stringify(edit) === JSON.stringify(["update", 80, "Продуктовый аналитик", "legacy"]),
      "legacy update payload",
    );
    await page
      .getByRole("button", { name: "Отозвать приглашение: Екатерина Иванова", exact: true })
      .click();
    await page.locator(".project-invite").waitFor();
    await page.getByRole("button", { name: "Отмена", exact: true }).click();
    await settle();
    check((await page.locator('[data-team-count="pending"]').innerText()) === "3", "cancel revoke");
    await page
      .getByRole("button", { name: "Отозвать приглашение: Екатерина Иванова", exact: true })
      .click();
    await page.locator(".project-invite").waitFor();
    await page.getByRole("button", { name: "Отозвать", exact: true }).click();
    await settle();
    check(
      (await page.locator('[data-team-count="pending"]').innerText()) === "2",
      "revoke updates count",
    );
    page.once("dialog", dialog => dialog.accept());
    await page
      .getByRole("button", { name: "Исключить участника: Мария Иванова", exact: true })
      .click();
    await settle();
    check((await page.locator('[data-team-count="members"]').innerText()) === "3", "remove member");
    check(
      !(await page.locator(".team-roles").innerText()).includes("Дизайнер"),
      "removed role disappears",
    );
    await go("team", "&empty=1");
    await geometry("empty-team", width);
    check(
      (await page.locator(".team-empty").innerText()).includes("Здесь будут участники"),
      "empty state",
    );
    await page.screenshot({ path: `${out}/team-empty-${width}.png`, fullPage: true });
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await go("profile");
    await page.getByRole("button", { name: "пригласить", exact: true }).click();
    await page.locator(".project-invite").waitFor();
    const search = page.getByRole("searchbox");
    for (const [state, query, count] of [
      ["all", "", 7],
      ["bez", "без", 4],
      ["nazvaniya", "названия", 4],
      ["real", "чемпионат", 1],
      ["empty", "абракадабра", 0],
    ]) {
      await search.fill(query);
      await settle();
      check(
        (await page.locator('[role="radio"]').count()) === count,
        "profile " + state + " count",
      );
      if (query === "без" || query === "названия")
        check(
          (await page.locator(".invite-copy strong").allTextContents()).every(
            n => n === "Проект без названия",
          ),
          "display-name fallback",
        );
      await geometry("profile-" + state, width);
      await page.screenshot({ path: `${out}/profile-${state}-${width}.png` });
    }
    await search.fill("чемпионат");
    await page.locator('[role="radio"]').click();
    await search.fill("БЕЗ    НАЗВАНИЯ");
    await settle();
    check((await page.locator('[role="radio"]').count()) === 4, "case and whitespace");
    await search.fill("");
    await settle();
    check(
      (await page.locator('[role="radio"][aria-checked="true"]').count()) === 1,
      "selected restored",
    );
    check(
      (await page.locator('[aria-checked="true"]').innerText()).includes("PROCOLLAB"),
      "same selected project",
    );
    await page.getByRole("button", { name: "Отмена", exact: true }).click();
    await page.getByRole("button", { name: "пригласить", exact: true }).click();
    await page.locator(".project-invite").waitFor();
    check((await search.inputValue()) === "", "reopen clears query");
    check((await page.locator('[aria-checked="true"]').count()) === 0, "reopen clears selection");
  }
  check(errors.length === 0, "no page errors: " + errors.join("; "));
  fs.writeFileSync(
    "docs/project-team-redesign/visual-results.json",
    JSON.stringify({ checks, errors, measurements }, null, 2),
  );
  console.log(JSON.stringify({ checks, errors, states: measurements.length }));
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
