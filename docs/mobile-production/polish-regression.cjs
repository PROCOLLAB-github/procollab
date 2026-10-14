/** @format */

// Synthetic API only. Real Angular routes/components and unmodified production build bytes.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch, assertViewport } = require("./browser-harness.cjs");
const preview = require("./preview.cjs");
const fixtures = require("./mobile-fixtures.cjs");
const [phase, widthsArgument = "320,390,768,1000,1440,1920", directoryArgument] =
  process.argv.slice(2);
const output = path.resolve(directoryArgument || ".release-mobile/fixes-20261015/polish");
const widths = widthsArgument.split(",").map(Number);
const selected = process.env.QA_POLISH_SCREENS?.split(",");
const baseUrl = "http://127.0.0.1:4475";
const check = phase !== "baseline";
const pageOf = results => ({ count: results.length, next: null, previous: null, results });
const original = fixtures.response;
const skill = { id: 1, name: "Apache Kafka", category: { id: 1, name: "Back-end" }, approves: [] };
fixtures.user.skills = [
  skill,
  {
    ...skill,
    id: 2,
    name: "Проектирование распределённых систем",
    category: { id: 2, name: "Разработка программного обеспечения" },
  },
];
fixtures.user.avatar = "/assets/images/profile/main.svg";
fixtures.lesson.tasks = Array.from({ length: 12 }, (_, i) => ({
  ...fixtures.lesson.tasks[0],
  id: i + 1,
  order: i + 1,
}));
const news = {
  id: 1,
  name: "Алексей Куделько",
  imageAddress: fixtures.user.avatar,
  text: "Новости нашей команды",
  datetimeCreated: "2026-10-01",
  author: 1,
  contentObject: { id: 1, email: "fixture@example.test" },
  files: [
    {
      link: "/assets/images/profile/main.svg",
      name: "Image",
      mimeType: "image/svg+xml",
      size: 0,
      datetimeUploaded: "2026-10-01",
      user: 1,
      extension: "svg",
    },
  ],
  likesCount: 3,
  viewsCount: 75,
  isUserLiked: false,
};
let noPrograms = false;
let filterMode = "configured";
fixtures.response = (endpoint, method, query, state) => {
  if (/\/feed\/$/.test(endpoint))
    return {
      ...pageOf([{ typeModel: "news", content: news, publishedAt: "2026-10-01" }]),
      counts: { all: 1, news: 1, project: 0, vacancy: 0, partnerprogram: 0, education: 0 },
    };
  if (/\/programs\/1\/filters\/$/.test(endpoint))
    return filterMode === "empty"
      ? []
      : [
          {
            id: 1,
            name: "case",
            label: "Кейс",
            helpText: "Выберите кейс",
            fieldType: "select",
            isRequired: false,
            options: ["Разработка", "Дизайн"],
          },
        ];
  if (/\/rate-project\/1\/?$/.test(endpoint)) {
    if (method === "POST" || Number(query.get("offset")) > 0) return pageOf([]);
    const rating = original(endpoint, method, query, state).results[0];
    return pageOf([
      {
        ...rating,
        criterias: [
          "Новизна и оригинальность решения",
          "Потенциал масштабирования",
          "Глубина проработки",
          "Качество материалов",
        ].map((name, i) => ({
          id: i + 1,
          name,
          description: "",
          type: "int",
          minValue: 0,
          maxValue: 10,
          value: null,
          expertId: null,
        })),
      },
    ]);
  }
  if (/\/projects\/1\/$/.test(endpoint) && noPrograms)
    return { ...fixtures.project, partnerProgram: null, partnerPrograms: [] };
  const result = original(endpoint, method, query, state);
  if (/\/auth\/public-users\/$/.test(endpoint))
    for (const member of result.results || []) {
      member.avatar = fixtures.user.avatar;
      if (member.personal) member.personal.avatar = fixtures.user.avatar;
    }
  if (
    /\/auth\/public-users\/$/.test(endpoint) ||
    /\/(projects|auth\/users\/projects)\/$/.test(endpoint)
  ) {
    if (result.results?.length) return pageOf([result.results[0], { ...result.results[0], id: 2 }]);
  }
  return result;
};

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await document.fonts.ready;
    await Promise.all([...document.fonts].map(font => font.load().catch(() => {})));
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
  });
}

async function rect(locator) {
  return locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
  });
}

(async () => {
  fs.mkdirSync(path.join(output, phase), { recursive: true });
  const rows = [];
  for (const width of widths) {
    const h = await launch(width, { baseUrl, isMobile: width < 750, hasTouch: width < 750 });
    await preview(h.context, baseUrl);
    const p = h.page;
    const mobile = check && width < 1000;
    const shot = async (name, metrics = {}) => {
      if (mobile) await assertViewport(p);
      assert.deepEqual(h.errors, [], `${name}: console errors`);
      await p.screenshot({
        path: path.join(output, phase, `${name}-${width}.png`),
        fullPage: true,
      });
      rows.push({ name, width, ...metrics, passed: true });
      console.log(`${phase}: ${name} ${width}`);
    };
    const open = async (route, selector) => {
      h.errors.length = 0;
      await p.goto(baseUrl + route);
      await p.locator(selector).first().waitFor({ state: "visible" });
      await settle(p);
    };
    const run = name => !selected || selected.includes(name);
    try {
      await h.context.addInitScript(() => {
        const NativeDate = Date;
        window.Date = class extends NativeDate {
          constructor(...args) {
            super(...(args.length ? args : [1791288000000]));
          }
          static now() {
            return NativeDate.now();
          }
        };
      });
      if (run("composer")) {
        await open("/office/projects/1", "app-news-form textarea");
        await p.locator("app-news-form textarea").fill("Сегодня был хороший день");
        await p.locator("app-news-form").scrollIntoViewIfNeeded();
        const send = p.locator("app-news-form .form__send");
        const button = await rect(send);
        const footer = await rect(p.locator("app-news-form .footer"));
        if (mobile) {
          assert.equal(await send.getAttribute("type"), "submit");
          assert.ok(button.y >= footer.y && button.bottom <= footer.bottom + 1);
          assert.ok(Math.abs(button.width - 44) < 1 && Math.abs(button.height - 44) < 1);
          assert.equal(await send.isEnabled(), true);
        }
        await shot("composer", { button, footer });
      }
      if (run("skills")) {
        await open("/office/profile/1", "app-project-direction-card");
        await p
          .locator("app-project-direction-card")
          .filter({ hasText: "навыки" })
          .locator(".direction-card")
          .click();
        await p.locator(".modal .skills__info").first().waitFor({ state: "visible" });
        await settle(p);
        const tags = await p.locator(".modal .skills__category .tag").evaluateAll(els =>
          els.map(el => ({
            text: el.innerText,
            w: el.clientWidth,
            sw: el.scrollWidth,
            h: el.clientHeight,
          })),
        );
        if (mobile)
          for (const tag of tags) {
            assert.ok(tag.h < 80, JSON.stringify(tag));
            assert.ok(tag.sw <= tag.w + 1, JSON.stringify(tag));
          }
        await shot("skills", { tags });
      }
      if (run("rating")) {
        await open("/office/program/1/projects-rating", "app-range-criterion-input input");
        await p.locator("app-project-rating").first().scrollIntoViewIfNeeded();
        const input = p.locator("app-range-criterion-input input").first();
        const score = await rect(input);
        const ratingCard = await rect(p.locator("app-rating-card .card").first());
        if (mobile)
          assert.ok(ratingCard.x >= 0 && ratingCard.right <= width, JSON.stringify(ratingCard));
        if (mobile) {
          assert.ok(score.width <= 52 && score.height === 44, JSON.stringify(score));
          const fields = await p.locator(".rating__field").evaluateAll(els =>
            els.map(el => {
              const r = el.getBoundingClientRect();
              return { top: r.top, bottom: r.bottom };
            }),
          );
          assert.ok(fields[1].top - fields[0].bottom >= 7);
          await input.fill("8");
          await input.blur();
          assert.equal(await input.inputValue(), "8");
        }
        await shot("rating", { score });
      }
      if (run("filters") && width < 1000 && check) {
        await open("/office/program/1/projects-rating", "app-rating-card");
        const trigger = p
          .locator(".page__mobile-controls .page__mobile-filter-row app-button button")
          .first();
        await trigger.click();
        await p.locator(".modal app-program-projects-filter").waitFor({ state: "visible" });
        await p.locator(".modal app-select").click();
        await p.getByText("Разработка", { exact: true }).last().click();
        await p.waitForURL(/case=/);
        await p.waitForFunction(() => !document.querySelector("app-rating-card"));
        assert.ok(
          h.requests.some(
            r =>
              r.method === "POST" &&
              /\/rate-project\/1/.test(r.path) &&
              JSON.parse(r.body).filters.case[0] === "Разработка",
          ),
        );
        await p.getByRole("button", { name: "применить фильтр", exact: true }).click();
        await p.locator(".modal app-program-projects-filter").waitFor({ state: "hidden" });
        await trigger.click();
        assert.equal(
          await p
            .locator(".modal app-select")
            .innerText()
            .then(x => x.includes("Разработка")),
          true,
        );
        await shot("filters-selected");
        await p.getByRole("button", { name: "применить фильтр", exact: true }).click();
        await p.locator(".page__clear").click();
        await p.waitForURL(/projects-rating$/);
        await p.locator("app-rating-card").waitFor({ state: "visible" });
        await trigger.click();
        await p.getByRole("button", { name: "применить фильтр", exact: true }).focus();
        await p.keyboard.press("Escape");
        await p.locator(".modal app-program-projects-filter").waitFor({ state: "hidden" });
        filterMode = "empty";
        await open("/office/program/1/projects-rating", "app-rating-card");
        await p.locator(".page__mobile-controls app-button button").first().click();
        await p.locator(".modal .filter__tags").waitFor({ state: "visible" });
        await p.locator(".modal .filter__tags").click();
        await p.waitForURL(/is_rated_by_expert=true/);
        await shot("filters-no-custom-fields");
        filterMode = "configured";
      }
      if (run("course")) {
        await open("/office/courses/1", ".info__actions");
        const button = p
          .locator(".info__actions app-button")
          .filter({ hasText: "аналитика" })
          .locator("button");
        const analytics = (await button.count()) ? await rect(button) : null;
        if (mobile) {
          assert.ok(analytics.height <= 46);
          assert.equal(await button.evaluate(el => getComputedStyle(el).whiteSpace), "nowrap");
        }
        await shot("course", { analytics });
      }
      if (run("lesson")) {
        await open("/office/courses/1/lesson/1", ".progress__task");
        const alignment = await p.locator(".progress__task").evaluateAll(els =>
          els.map(el => {
            const a = el.getBoundingClientRect(),
              b = el.querySelector("p").getBoundingClientRect();
            return {
              x: Math.abs(a.x + a.width / 2 - b.x - b.width / 2),
              y: Math.abs(a.y + a.height / 2 - b.y - b.height / 2),
            };
          }),
        );
        if (mobile) for (const a of alignment) assert.ok(a.x < 1 && a.y < 1, JSON.stringify(a));
        await shot("lesson", { alignment });
      }
      for (const name of ["projects-grid", "members-grid"])
        if (run(name)) {
          const projects = name === "projects-grid";
          await open(
            projects ? "/office/projects/dashboard" : "/office/members",
            projects ? "app-info-card" : "app-member-card",
          );
          const cards = p.locator(
            projects
              ? "app-dashboard-item:first-child .dashboard__list app-info-card"
              : ".page__list app-member-card",
          );
          await cards.nth(1).waitFor({ state: "visible" });
          const boxes = [await rect(cards.nth(0)), await rect(cards.nth(1))];
          if (mobile) {
            assert.ok(Math.abs(boxes[0].y - boxes[1].y) < 1, JSON.stringify(boxes));
            assert.ok(boxes[1].x - boxes[0].right >= 7);
            assert.ok(boxes[0].width >= 130);
            if (projects) {
              const create = await rect(p.locator("app-page-header .bar__add-project button"));
              assert.equal(create.height, 44);
            }
          }
          await shot(name, { boxes });
        }
      if (run("news-modal")) {
        await open("/office/feed", "app-feed-news-preview");
        await p.locator(".feed-preview").first().click();
        await p.locator(".feed-news-modal__actions").waitFor({ state: "visible" });
        await settle(p);
        const actions = p.locator(".feed-news-modal__actions");
        await actions.scrollIntoViewIfNeeded();
        const padding = await p
          .locator(mobile ? ".feed-news-modal__bottom" : ".feed-news-modal__scroll")
          .evaluate(el => getComputedStyle(el).paddingBottom);
        if (mobile) {
          const viewport = await rect(p.locator(".feed-news-modal__shell"));
          const buttons = await rect(actions.locator("button").first());
          assert.ok(viewport.bottom - buttons.bottom >= 16, JSON.stringify({ viewport, buttons }));
          assert.ok(parseFloat(padding) >= 24);
        }
        await shot("news-modal", { padding });
      }
      if (run("competition-empty")) {
        noPrograms = true;
        await open("/office/projects/1/edit?editingStep=additional", "app-project-additional-step");
        await p
          .getByText("Пока вы не участвуете ни в одной программе", { exact: true })
          .waitFor({ state: "visible" });
        await p.locator(".project__additional--no-items").scrollIntoViewIfNeeded();
        if (mobile) {
          assert.equal(
            await p.locator(".project__additional--no-items .project__no-items").count(),
            0,
          );
          const tooltip = await rect(p.locator(".project__additional--no-items app-tooltip"));
          const button = await rect(p.locator(".project__additional--no-items button"));
          assert.ok(tooltip.x >= button.right + 7, JSON.stringify({ tooltip, button }));
          const hint = p.locator(".project__additional--no-items app-tooltip");
          if (width < 750) await hint.click();
          else await hint.hover();
          await p
            .getByText("Перейдите по ссылке и ознакомьтесь с тем, где можно сейчас поучаствовать", {
              exact: true,
            })
            .waitFor({ state: "visible" });
        }
        await shot("competition-empty");
        noPrograms = false;
      }
    } catch (error) {
      await p.screenshot({
        path: path.join(output, phase, `failure-${width}.png`),
        fullPage: true,
      });
      fs.writeFileSync(
        path.join(output, phase, `failure-${width}.json`),
        JSON.stringify(
          {
            url: p.url(),
            errors: h.errors,
            requests: h.requests.slice(-10),
            text: await p.locator("body").innerText(),
          },
          null,
          2,
        ),
      );
      throw error;
    } finally {
      await h.browser.close();
    }
  }
  fs.writeFileSync(
    path.join(output, `${phase}${selected ? "-" + selected.join("-") : ""}.json`),
    JSON.stringify(rows, null, 2),
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
