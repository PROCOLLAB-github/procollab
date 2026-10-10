/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch, measure, assertViewport } = require("./browser-harness.cjs");
const fixtures = require("./mobile-fixtures.cjs");
const preview = require("./preview.cjs");

// Только синтетические данные: harness не отправляет запросы в live API.
const originalResponse = fixtures.response;
fixtures.overview.attention.participantsWithoutTeam = 6;
fixtures.overview.attention.projectsNotSubmitted.total = 1;
fixtures.response = (endpoint, method, query, state) => {
  if (/\/invites\/$/.test(endpoint) && method === "GET" && !query.has("project")) {
    return [
      {
        id: 1,
        user: fixtures.user,
        project: fixtures.project,
        role: "Разработчик",
        isAccepted: null,
        datetimeCreated: "2026-10-01",
      },
    ];
  }
  return originalResponse(endpoint, method, query, state);
};

const [phase, baseUrl, widthsArgument = "320,390,768,1440,1920", directoryArgument] =
  process.argv.slice(2);
const output = path.resolve(directoryArgument || ".desktop-regression/mobile-smoke/screenshots");
const widths = widthsArgument.split(",").map(Number);
const details = process.argv[6] === "details";
const selectedScreens = process.env.QA_SCREENS?.split(",");
const checkMobile = phase !== "baseline";
const screens = [
  ["feed", "/office/feed", "app-open-vacancy"],
  ["projects", "/office/projects/dashboard", "app-info-card"],
  ["members", "/office/members", "app-member-card"],
  ["programs", "/office/program/all", "app-program-card"],
  ["program", "/office/program/1", "app-main"],
  ["profile", "/office/profile/1", "app-profile-left-side"],
  ["project", "/office/projects/1", "app-projects-left-side"],
  ["vacancies", "/office/vacancies/all", "app-project-vacancy-card"],
  ["vacancy", "/office/vacancies/1", "app-vacancies-detail"],
  ["courses", "/office/courses/all", "app-course"],
  ["course", "/office/courses/1", "app-course-detail"],
  ["profile-edit", "/office/profile/edit?editingStep=main", "app-profile-main-step"],
  [
    "project-edit",
    "/office/projects/1/edit?editingStep=main&programLinkId=1",
    "app-project-main-step",
  ],
  [
    "partners",
    "/office/projects/1/edit?editingStep=contacts&programLinkId=1",
    "app-project-partner-resources-step",
  ],
  ["analytics", "/office/program/1/analytics", ".attention__list"],
  [
    "team-invite",
    "/office/projects/1/edit?editingStep=team&programLinkId=1",
    "app-project-team-step",
  ],
];

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    for (const image of document.images) image.loading = "eager";
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.fonts].map(font => font.load().catch(() => {})));
    await document.fonts.ready;
  });
  await page.waitForFunction(() => [...document.images].every(image => image.complete));
  await page.evaluate(() =>
    Promise.all([...document.images].map(image => image.decode().catch(() => {}))),
  );
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;}",
  });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    for (const element of document.querySelectorAll("*")) {
      if (["auto", "scroll"].includes(getComputedStyle(element).overflowY)) element.scrollTop = 0;
    }
  });
  await page.evaluate(async () => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function inspect(page, name) {
  return page.evaluate(name => {
    const box = element => {
      const r = element.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width };
    };
    const buttons = selector => [...document.querySelectorAll(selector)].map(box);
    if (name === "projects") {
      const list = document.querySelector(".page__invites--list");
      const card = list?.querySelector("app-info-card");
      return { list: list && box(list), card: card && box(card) };
    }
    if (name === "project-edit") {
      const region = document.querySelector(".region-select__control input");
      const industry = document.querySelector("#industry .field__input");
      const date = document.querySelector("#implementationDeadline .field__input");
      const hint = document.querySelector("#implementationDeadline .field__tooltip-wrapper");
      const avatar = document.querySelector(".project__image .control");
      const avatarHint = document.querySelector(".project__image .control__tooltip-wrapper");
      return {
        actions: buttons(".project__save button"),
        regionFont: getComputedStyle(region).fontSize,
        industryFont: getComputedStyle(industry).fontSize,
        date: box(date),
        dateHint: box(hint),
        datePadding: parseFloat(getComputedStyle(date).paddingRight),
        avatar: box(avatar),
        avatarHint: box(avatarHint),
        goals: buttons(
          ".project__options > app-button button, .project__link-options > app-button button",
        ),
      };
    }
    if (name === "partners")
      return { actions: buttons("app-project-partner-resources-step app-button button") };
    if (name === "program")
      return {
        emptyContacts: document.querySelectorAll(".info__contacts:has(button:disabled)").length,
      };
    if (name === "analytics")
      return {
        backgrounds: [...document.querySelectorAll(".attention__action")].map(
          button => getComputedStyle(button).backgroundColor,
        ),
      };
    if (name === "team-invite") {
      const field = document.querySelector(".invite-search input");
      const footer = document.querySelector(".invite-actions");
      return {
        inputBorder: getComputedStyle(field).borderTopWidth,
        inputShadow: getComputedStyle(field).boxShadow,
        inputOutline: getComputedStyle(field).outlineStyle,
        actions: buttons(".invite-actions button"),
        footer: box(footer),
      };
    }
    return {};
  }, name);
}

async function verifyMobileComposition(page, name) {
  const failures = await page.evaluate(name => {
    const failures = [];
    const check = (condition, message) => {
      if (!condition) failures.push(message);
    };
    const rect = el => el.getBoundingClientRect();
    if (name === "programs") {
      for (const card of document.querySelectorAll("app-program-card .card")) {
        const info = card.querySelector(".card__info");
        const avatar = rect(card.querySelector(".card__photo"));
        const title = rect(card.querySelector(".card__name"));
        check(getComputedStyle(info).borderTopWidth === "0px", "Program card has a second border");
        check(title.left >= avatar.right + 8, "Program avatar overlaps title");
      }
    }
    if (["program", "profile", "project"].includes(name)) {
      const cover = rect(document.querySelector(".info__cover"));
      const avatar = rect(document.querySelector(".info__avatar"));
      check(
        Math.abs(avatar.left + avatar.right - cover.left - cover.right) < 2,
        "Detail avatar is not centered",
      );
    }
    if (["profile", "project"].includes(name)) {
      const prefix = name === "profile" ? "profile" : "project";
      const overview = document.querySelector(`.${prefix}__about`);
      const context = document.querySelector(`.${prefix}__context`);
      const news = document.querySelector(`.${prefix}__context ~ .news__form`);
      check(
        overview && context && rect(overview).bottom <= rect(context).top,
        "Main description must precede secondary blocks",
      );
      if (news) check(rect(context).bottom <= rect(news).top, "News must follow context");
    }
    if (name === "feed") {
      for (const option of document.querySelectorAll(".filter__option")) {
        const icon = option.querySelector(".filter__option--icon");
        const r = rect(icon);
        const parent = rect(option);
        check(getComputedStyle(icon).transform === "none", "Feed icon retains desktop transform");
        check(
          r.left >= parent.left + 8 && r.right <= parent.right - 8,
          "Feed icon escapes card padding",
        );
        check(icon.querySelector("use").getBBox().width > 0, "Feed icon is missing");
      }
    }
    if (name === "vacancies") {
      const filter = document.querySelector("app-vacancy-filter");
      const card = document.querySelector("app-project-vacancy-card");
      check(rect(filter).bottom <= rect(card).top, "Vacancy filters must precede results");
      check(
        Boolean(filter.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING),
        "Filter DOM order must precede results",
      );
      for (const badge of document.querySelectorAll("app-vacancy-status app-badge"))
        check(
          getComputedStyle(badge).borderTopWidth === "0px",
          "Vacancy badge has an outer border",
        );
    }
    if (name === "profile-edit") {
      const header =
        document.querySelector("app-profile-edit .profile__top") ||
        document.querySelector(".profile__top");
      const action = header.querySelector("button.button");
      const heading = header.querySelector(".page-header__actions");
      check(
        Math.abs(rect(action).width - rect(heading).width) < 2,
        "Profile save does not fill action row",
      );
      const row = document.querySelector(".profile__wrapper--main > .profile__row");
      const avatar = row.querySelector("app-avatar-control");
      check(
        Math.abs(rect(avatar).left + rect(avatar).right - rect(row).left - rect(row).right) < 2,
        "Profile editor avatar is not centered",
      );
    }
    return failures;
  }, name);
  assert.deepEqual(failures, [], `${name}: mobile composition`);
}

function verify(name, layout) {
  const gap = actions => {
    for (let i = 1; i < actions.length; i++)
      assert.ok(
        actions[i].top - actions[i - 1].bottom >= 7,
        `${name}: missing vertical button gap`,
      );
  };
  if (name === "projects")
    assert.ok(
      Math.abs(layout.list.left + layout.list.right - (layout.card.left + layout.card.right)) < 2,
      "Invitation card must be centered",
    );
  if (name === "project-edit") {
    gap(layout.actions);
    gap(layout.goals);
    assert.equal(layout.regionFont, layout.industryFont, "Region and select typography must match");
    assert.ok(layout.date.width > 150, "Date must fit full value");
    assert.ok(
      layout.dateHint.left >= layout.date.right - layout.datePadding,
      "Date hint overlaps text",
    );
    assert.ok(layout.avatarHint.left > layout.avatar.right, "Avatar hint must be outside logo");
  }
  if (name === "partners") gap(layout.actions);
  if (name === "program") assert.equal(layout.emptyContacts, 0, "Empty contacts must be hidden");
  if (name === "analytics")
    assert.ok(
      layout.backgrounds.every(color => color === "rgba(0, 0, 0, 0)"),
      "Attention rows must not resemble progress bars",
    );
  if (name === "team-invite") {
    assert.equal(layout.inputBorder, "0px", "Search must have one outer border");
    assert.equal(layout.inputShadow, "none");
    assert.equal(layout.inputOutline, "none", "Focus belongs to outer search field");
    gap(layout.actions);
    for (const button of layout.actions)
      assert.ok(
        Math.abs(button.width - layout.footer.width) < 2,
        "Dialog buttons must fill footer",
      );
  }
}

(async () => {
  fs.mkdirSync(path.join(output, phase), { recursive: true });
  if (phase === "contacts") {
    fixtures.program.links = ["https://t.me/procollab_fixture"];
    const harness = await launch(390, { baseUrl, isMobile: true, hasTouch: true });
    await preview(harness.context, baseUrl);
    try {
      const page = harness.page;
      await page.goto(baseUrl + "/office/program/1");
      const contacts = page.locator(".info__contacts button");
      await contacts.waitFor({ state: "visible" });
      assert.equal(await contacts.isEnabled(), true);
      await contacts.click();
      await page
        .locator('.modal a[href="https://t.me/procollab_fixture"]')
        .waitFor({ state: "visible" });
      await assertViewport(page);
      assert.deepEqual(harness.errors, []);
      console.log("Program contacts: existing link opens in mobile modal");
    } finally {
      await harness.browser.close();
    }
    return;
  }
  const rows = [];
  const repeatedShots = new Map();
  for (const width of widths) {
    const harness = await launch(width, { baseUrl, isMobile: width < 750, hasTouch: width < 750 });
    await preview(harness.context, baseUrl);
    const page = harness.page;
    const fixClock = () => {
      const NativeDate = Date;
      window.Date = class extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : [1791288000000]));
        }
        static now() {
          return 1791288000000;
        }
      };
    };
    try {
      await page.goto(baseUrl + "/office/feed");
      await page
        .locator("app-open-vacancy")
        .first()
        .waitFor({ state: "attached" })
        .catch(async error => {
          console.error(
            JSON.stringify(
              {
                phase,
                baseUrl,
                width,
                details,
                url: page.url(),
                errors: harness.errors,
                requests: harness.requests,
                html: (await page.content()).slice(-1600),
              },
              null,
              2,
            ),
          );
          throw error;
        });
      await page.evaluate(fixClock);
      await settle(page);
      for (const [name, route, selector] of screens) {
        if (selectedScreens && !selectedScreens.includes(name)) continue;
        if (details && !["projects", "project-edit", "analytics", "team-invite"].includes(name))
          continue;
        harness.errors.length = 0;
        if (name !== "feed")
          await page.evaluate(route => {
            history.pushState({}, "", route);
            dispatchEvent(new PopStateEvent("popstate"));
          }, route);
        await page
          .locator(selector)
          .first()
          .waitFor({ state: "attached" })
          .catch(async error => {
            console.error(
              JSON.stringify(
                {
                  name,
                  width,
                  text: await page.locator("body").innerText(),
                  errors: harness.errors,
                  requests: harness.requests.slice(-15),
                },
                null,
                2,
              ),
            );
            throw error;
          });
        if (name === "program" && width > 1000)
          await page.locator("app-program-role-widget").waitFor({ state: "attached" });
        if (["program", "profile", "project"].includes(name))
          await page.locator(".info__avatar").waitFor({ state: "visible" });
        await settle(page);
        if (name === "team-invite") {
          await page.locator(".invite__submit button").click();
          await page.locator(".project-invite[role=dialog]").waitFor({ state: "visible" });
          await settle(page);
        }
        const viewport =
          checkMobile && width < 1000 ? await assertViewport(page) : await measure(page);
        const layout = await inspect(page, name);
        if (checkMobile && width < 1000) {
          try {
            verify(name, layout);
            await verifyMobileComposition(page, name);
          } catch (error) {
            console.error(JSON.stringify({ name, width, layout }));
            await page.screenshot({
              path: path.join(output, phase, `failure-${name}-${width}.png`),
              fullPage: true,
            });
            fs.writeFileSync(
              path.join(output, phase, `failure-${name}-${width}.html`),
              await page.content(),
            );
            throw error;
          }
        }
        assert.deepEqual(harness.errors, [], `${name} ${width} console errors`);
        const pixels = await page.screenshot({
          path: path.join(output, phase, `${name}-${width}.png`),
          fullPage: true,
        });
        const shotKey = `${name}-${width}`;
        if (repeatedShots.has(shotKey))
          assert.deepEqual(
            pixels,
            repeatedShots.get(shotKey),
            `${shotKey}: unstable repeated screenshot`,
          );
        repeatedShots.set(shotKey, pixels);
        rows.push({ name, width, layout, viewport, passed: true });
        console.log(`${phase}: ${name} ${width}`);
        if (details) {
          const screenshot = async (suffix, selector) => {
            await page
              .locator(selector)
              .first()
              .evaluate(element => element.scrollIntoView({ block: "center" }));
            await page.screenshot({
              path: path.join(output, phase, `${suffix}-${width}.png`),
              fullPage: true,
            });
            console.log(`${phase}: ${suffix} ${width}`);
          };
          if (name === "projects") await screenshot("projects-invites", ".page__invites--list");
          if (name === "project-edit") {
            await screenshot("project-edit-fields", "#implementationDeadline");
            await screenshot("project-edit-goals", ".project__options");
            await page.locator(".project__options > app-button button").click();
            await screenshot("project-edit-new-goal", ".project__links--wrapper");
            if (checkMobile && width < 1000) {
              await assertViewport(page);
              const date = page.locator(".project__links input").nth(1);
              const box = await date.boundingBox();
              assert.ok(box.width > 150, "New goal date must fit its value");
            }
          }
          if (name === "analytics") await screenshot("analytics-attention", ".attention__list");
          if (name === "team-invite") {
            await page.locator("#team-invite-search").fill("Кандидат");
            await page.locator(".invite-row[role=radio]").first().click();
            await page.locator(".invite-role input").fill("Разработчик");
            assert.equal(
              await page
                .getByRole("button", { name: "Отправить приглашение", exact: true })
                .isEnabled(),
              true,
            );
            await page.screenshot({
              path: path.join(output, phase, `team-invite-selected-${width}.png`),
              fullPage: true,
            });
            console.log(`${phase}: team-invite-selected ${width}`);
          }
        }
        if (name === "team-invite") await page.getByLabel("Закрыть приглашение").click();
      }
    } finally {
      await harness.browser.close();
    }
  }
  fs.writeFileSync(
    path.join(
      output,
      `${phase}${selectedScreens ? "-" + selectedScreens.join("-") : ""}${details ? "-details" : ""}.json`,
    ),
    JSON.stringify(rows, null, 2) + "\n",
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
