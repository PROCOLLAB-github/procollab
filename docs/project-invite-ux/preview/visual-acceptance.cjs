/** @format */

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("fs");
const assert = require("assert/strict");
const output = "docs/project-invite-ux/screenshots";
const findings = [];
let checks = 0;
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
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
    hasTouch: true,
  });
  const settle = () => page.evaluate(() => window.__invitePreview?.fixture.whenStable());
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.route("https://hwchamber.co.uk/**", r =>
    r.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#eee"/></svg>',
    }),
  );
  async function shot(name) {
    await page.screenshot({ path: output + "/" + name + ".png" });
  }
  async function go(mode = "profile", projects = 12, port = 4337, extra = "") {
    await page.goto(
      "http://127.0.0.1:" +
        port +
        "/office/" +
        (mode === "team" ? "projects/5/edit" : "profile/10") +
        "?mode=" +
        mode +
        "&projects=" +
        projects +
        extra,
    );
    await page.waitForFunction(() => !!window.__invitePreview);
    if (mode === "team") {
      await page.locator(".invite__submit button").click();
    } else {
      await page.getByRole("button", { name: "пригласить", exact: true }).click();
    }
    await settle();
    await page
      .locator(
        port === 4337 ? ".project-invite" : mode === "team" ? "#invite_link" : ".project__invites",
      )
      .waitFor();
  }
  async function geometry(scenario, width) {
    const info = await page.evaluate(() => {
      const dialog = document.querySelector(".project-invite"),
        footer = dialog.querySelector("footer"),
        header = dialog.querySelector("header"),
        list = dialog.querySelector(".project-invite__list");
      const box = dialog.getBoundingClientRect(),
        f = footer.getBoundingClientRect(),
        h = header.getBoundingClientRect(),
        l = list.getBoundingClientRect();
      return {
        width: innerWidth,
        height: innerHeight,
        dialog: { x: box.x, y: box.y, width: box.width, height: box.height },
        footer: { top: f.top, bottom: f.bottom },
        list: { height: l.height, client: list.clientHeight, scroll: list.scrollHeight },
        headerTop: h.top,
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        dialogOverflow: Math.max(0, dialog.scrollWidth - dialog.clientWidth),
        outsideList:
          !list.contains(footer) &&
          !list.contains(dialog.querySelector("app-project-invite-role-input")),
        buttons: [...footer.querySelectorAll("button")].map(b => ({
          height: b.getBoundingClientRect().height,
          width: b.getBoundingClientRect().width,
        })),
        radios: [...dialog.querySelectorAll(".invite-radio")].map(r => ({
          width: r.getBoundingClientRect().width,
          height: r.getBoundingClientRect().height,
        })),
        font: getComputedStyle(dialog).fontFamily,
      };
    });
    check(info.overflow === 0, scenario + " document overflow");
    check(info.dialogOverflow === 0, scenario + " dialog overflow");
    check(
      info.footer.bottom <= info.height - 10 && info.headerTop >= 10,
      scenario + " header/footer visible",
    );
    check(info.outsideList, scenario + " fixed role/footer");
    check(
      info.buttons.every(b => b.height >= 44),
      scenario + " touch buttons",
    );
    check(
      info.radios.every(r => r.width >= 20 && r.height >= 20),
      scenario + " radio 20px",
    );
    check(info.dialog.width <= Math.min(560, width - 24) + 1, scenario + " width");
    check(info.dialog.x >= 11, scenario + " horizontal margin");
    findings.push({ scenario, ...info });
  }
  async function search(value) {
    await page.getByRole("searchbox").fill(value);
    await settle();
    await page.waitForFunction(() => {
      const node = document.querySelector("app-participant-picker");
      return node && !node.textContent.includes("Ищем участников");
    });
  }
  // Исходные компоненты PROD base 01d59ad59578d26777625b0a32658acbf52ec6fc, те же fixtures.
  await go("profile", 12, 4338);
  await shot("01-before-profile");
  await go("team", 12, 4338);
  await shot("05-before-team-url");
  for (const width of [1440, 1280, 1024, 768, 414, 390, 375]) {
    await page.setViewportSize({ width, height: width <= 414 ? 812 : 900 });
    await go("profile", 2);
    check(
      await page.getByRole("searchbox").evaluate(e => e === document.activeElement),
      "profile first focus",
    );
    check(
      await page.locator(".invite-button--primary").isDisabled(),
      "disabled without project/role",
    );
    await geometry("profile-2", width);
    if (width === 1440) await shot("02-after-profile");
    await go("profile", 12);
    await geometry("profile-12", width);
    if (width === 1440) await shot("03-profile-long-list");
    await page.getByRole("radio").first().click();
    await settle();
    check(
      (await page.getByRole("radio").first().getAttribute("aria-checked")) === "true",
      "first selected",
    );
    const firstScroll = await page.locator(".project-invite__list").evaluate(e => e.scrollTop);
    check(firstScroll === 0, "selection does not jump down");
    await page.getByRole("radio").last().click();
    await settle();
    check(
      (await page.getByRole("radio").last().getAttribute("aria-checked")) === "true",
      "last selected",
    );
    await page.getByRole("combobox").fill("Эксперт по работе с промышленными партнёрами");
    await settle();
    await page.getByRole("combobox").press("Tab");
    await settle();
    check(await page.locator(".invite-button--primary").isEnabled(), "valid free role");
    await geometry("profile-last-selected", width);
    if (width === 1440) await shot("04-profile-selected-footer");
    if (width === 375) await shot("10-mobile-profile");
    // Поиск локальный: нормализация без запросов участников.
    await page.getByRole("searchbox").fill("  ДОЛГОСРОЧНОЕ   исследование ");
    await settle();
    check((await page.getByRole("radio").count()) === 1, "local project search");
    check(
      (await page.evaluate(() => window.__searchCalls)).length === 0,
      "no member request in profile",
    );
    await page.getByRole("button", { name: "Отмена", exact: true }).click();
    await settle();
    await page.getByRole("dialog").waitFor({ state: "detached" });
    check(
      await page
        .getByRole("button", { name: "пригласить", exact: true })
        .evaluate(e => e === document.activeElement),
      "profile focus restored",
    );

    await go("team");
    check(
      await page.getByRole("searchbox").evaluate(e => e === document.activeElement),
      "team first focus",
    );
    await geometry("team-empty", width);
    if (width === 1440) await shot("06-participant-search");
    await page.getByRole("searchbox").fill("Медленно");
    await settle();
    await page.getByRole("status").filter({ hasText: "Ищем участников" }).waitFor();
    await geometry("team-loading", width);
    if (width === 1440) await shot("12-search-loading");
    await search("Иван");
    await page.getByRole("radio").last().waitFor();
    check((await page.getByRole("radio").count()) === 8, "8 results");
    check(
      (await page.evaluate(() => window.__searchCalls)).some(
        c => c.query.partner_program === 27 && c.query.fullname === "Иван",
      ),
      "authoritative program filter",
    );
    for (let i = 0; i < 3; i++)
      check(await page.getByRole("radio").nth(i).isDisabled(), "known ineligible candidate");
    await geometry("team-8-results", width);
    if (width === 1440) await shot("07-search-results");
    await search("Мария");
    check((await page.getByRole("radio").count()) === 1, "1 result");
    await geometry("team-1-result", width);
    await search("Иван");
    await page.getByRole("radio").nth(3).click();
    await settle();
    check(
      await page.getByText("Выбранный участник", { exact: true }).isVisible(),
      "selected summary",
    );
    await page.getByRole("combobox").fill("анал");
    await settle();
    check((await page.getByRole("option").count()) === 3, "role suggestions");
    await page.getByRole("combobox").press("ArrowDown");
    await settle();
    await page.getByRole("combobox").press("ArrowDown");
    await settle();
    await page.getByRole("combobox").press("Enter");
    await settle();
    check(
      (await page.getByRole("combobox").inputValue()) === "Аналитик",
      "keyboard chooses suggestion",
    );
    if (width === 1440) {
      await shot("08-selected-participant");
      await page.getByRole("combobox").fill("анал");
      await settle();
      await shot("09-role-autocomplete");
    }
    await page.getByRole("combobox").fill("Эксперт по работе с промышленными партнёрами");
    await settle();
    await page.getByRole("combobox").press("Tab");
    await settle();
    await geometry("team-custom-role", width);
    await page.getByRole("button", { name: "Отправить приглашение", exact: true }).click();
    await settle();
    check(await page.locator(".invite-button--primary").isDisabled(), "loading double guard");
    await page.evaluate(() => window.__invitePreview.fail());
    await page.getByRole("alert").waitFor();
    check(
      (await page.getByRole("combobox").inputValue()) ===
        "Эксперт по работе с промышленными партнёрами",
      "role kept on error",
    );
    check(
      await page.getByText("Выбранный участник", { exact: true }).isVisible(),
      "recipient kept on error",
    );
    await geometry("team-error", width);
    if (width === 1440) await shot("13-inline-error");
    if (width === 375) await shot("11-mobile-team");
    // Сначала Escape закрывает подсказки, затем окно. Фокус не уходит на фон по Tab.
    await page.getByRole("combobox").fill("анал");
    await settle();
    await page.getByRole("combobox").press("Escape");
    await settle();
    check(await page.getByRole("dialog").isVisible(), "Escape first closes options");
    check((await page.getByRole("option").count()) === 0, "options closed");
    await page.getByRole("button", { name: "Отправить приглашение", exact: true }).focus();
    await page.keyboard.press("Tab");
    await settle();
    check(
      await page.getByRole("dialog").evaluate(e => e.contains(document.activeElement)),
      "focus trap",
    );
    await page.keyboard.press("Escape");
    await settle();
    await page.getByRole("dialog").waitFor({ state: "detached" });
    check(
      await page.locator(".invite__submit button").evaluate(e => e === document.activeElement),
      "team focus restored",
    );
    console.log("PASS viewport", width);
  }
  // Успех через реальные entry points и use case, без HTTP на production.
  await page.setViewportSize({ width: 1440, height: 900 });
  await go("profile", 2);
  await page.getByRole("radio").first().click();
  await settle();
  await page.getByRole("combobox").fill("  Эксперт   по Партнёрам ");
  await settle();
  await page.getByRole("button", { name: "Отправить приглашение", exact: true }).click();
  await settle();
  const profileCalls = await page.evaluate(() => window.__invitePreview.calls);
  check(
    JSON.stringify(profileCalls[0].slice(0, 3)) === JSON.stringify([10, 1, "Эксперт по Партнёрам"]),
    "profile payload",
  );
  await page.evaluate(() => window.__invitePreview.success());
  await page.getByRole("dialog").waitFor({ state: "detached" });
  check(page.url().includes("/office/profile/10"), "stay on profile");
  check(await page.getByText("Приглашение отправлено", { exact: true }).isVisible(), "snackbar");
  await go("team", 12, 4337, "&global=1");
  await search("Иван");
  check(
    (await page.evaluate(() => window.__searchCalls)).every(
      c => !Object.hasOwn(c.query, "partner_program"),
    ),
    "global fallback",
  );
  await page.getByRole("radio").nth(3).click();
  await settle();
  await page.getByRole("button", { name: "Очистить выбранного участника" }).click();
  await settle();
  check(
    await page.getByRole("searchbox").evaluate(e => e === document.activeElement),
    "clear returns focus",
  );
  await page.getByRole("radio").nth(3).click();
  await settle();
  await page.getByRole("combobox").fill("Backend-разработчик");
  await settle();
  await page.getByRole("combobox").press("Escape");
  await settle();
  await page.getByRole("button", { name: "Отправить приглашение", exact: true }).click();
  await settle();
  await page.evaluate(() => window.__invitePreview.success());
  await page.getByRole("dialog").waitFor({ state: "detached" });
  check(
    (await page.evaluate(() => window.__invitePreview.teamUI.invites().length)) === 2,
    "pending appended",
  );
  await page.locator(".invite__submit button").click();
  await settle();
  await page.getByRole("dialog").waitFor();
  check((await page.getByRole("searchbox").inputValue()) === "", "query reset");
  check((await page.getByRole("combobox").inputValue()) === "", "role reset");
  await go("profile", 0);
  check(await page.getByRole("button", { name: "Перейти в проекты" }).isVisible(), "no projects");
  await geometry("profile-no-projects", 1440);
  await shot("14-no-projects");
  await page.setViewportSize({ width: 375, height: 812 });
  await go("profile", 2);
  await page.getByRole("radio").first().tap();
  await settle();
  await page.getByRole("combobox").fill("анал");
  await settle();
  await page.getByRole("option", { name: "Data Analyst", exact: true }).tap();
  await settle();
  check(
    (await page.getByRole("combobox").inputValue()) === "Data Analyst",
    "touch suggestion selection",
  );
  check(await page.locator(".invite-button--primary").isEnabled(), "touch row selection");
  await page.getByRole("combobox").fill("");
  await settle();
  await page.getByRole("combobox").press("Escape");
  await page.getByRole("combobox").press("ArrowUp");
  await settle();
  const lastOption = page.getByRole("option").last();
  check(
    (await lastOption.getAttribute("aria-selected")) === "true",
    "ArrowUp opens at last option",
  );
  check(
    await lastOption.evaluate(element => {
      const option = element.getBoundingClientRect();
      const list = element.parentElement.getBoundingClientRect();
      return option.top >= list.top && option.bottom <= list.bottom;
    }),
    "keyboard option scrolled into view",
  );
  await page.getByRole("combobox").press("Enter");
  await settle();
  check(
    (await page.getByRole("combobox").inputValue()) === "ML-разработчик",
    "last option selected",
  );
  check(errors.length === 0, "browser runtime errors: " + JSON.stringify(errors));
  fs.writeFileSync(
    "docs/project-invite-ux/visual-results.json",
    JSON.stringify(
      {
        base: "01d59ad59578d26777625b0a32658acbf52ec6fc",
        source: "4325cbbf5fcfd5b8c48fa2a6dd5d9c0122602940",
        checkedAt: new Date().toISOString(),
        browser: await browser.version(),
        checks,
        viewports: [1440, 1280, 1024, 768, 414, 390, 375],
        errors,
        findings,
      },
      null,
      2,
    ),
  );
  console.log("PASS", checks, "checks;", findings.length, "geometry states; errors", errors);
  await browser.close();
})().catch(e => {
  console.error(e);
  process.exit(1);
});
