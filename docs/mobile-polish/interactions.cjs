/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { launch, assertViewport } = require("../responsive/browser-harness.cjs");
const fixtures = require("./fixtures.cjs");
const rows = [];
const directory = path.join(__dirname, "screenshots", "interactions");
fs.mkdirSync(directory, { recursive: true });

async function goto(h, route, selector) {
  h.errors.length = 0;
  await h.page.goto(h.base + route);
  await h.page.waitForLoadState("networkidle");
  await h.page.locator(selector).first().waitFor();
}

async function check(h, name, width, details = {}) {
  const measurement = await assertViewport(h.page);
  assert.deepEqual(h.errors, []);
  const screenshot = `screenshots/interactions/${name}-${width}.png`;
  await h.page.screenshot({ path: path.join(__dirname, screenshot), fullPage: true });
  rows.push({ name, width, passed: true, ...details, ...measurement, screenshot });
  console.log(`${name} ${width}: passed`);
}

(async () => {
  for (const width of [320, 390, 768]) {
    const h = await launch(width, { isMobile: width < 750, hasTouch: width < 750 });
    h.page.setDefaultTimeout(10000);
    try {
      await goto(h, "/office/program/all", "app-program-card");
      const region = h.page.locator(".card__region").first();
      assert.equal((await region.textContent()).trim(), "для всей России");
      assert.ok(await region.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      await h.page.getByRole("button", { name: "Открыть меню", exact: true }).click();
      assert.equal(await h.page.getByRole("button", { name: "Выйти", exact: true }).count(), 1);
      await h.page.locator("#mobile-navigation a[routerLink=feed]").click();
      await h.page.locator("app-open-vacancy").waitFor();
      await h.page.waitForLoadState("networkidle");
      assert.equal((await h.page.locator(".nav-bar__title").textContent()).trim(), "Новости");
      const title = await h.page.locator(".nav-bar__title").boundingBox();
      const header = await h.page.locator(".office__top").boundingBox();
      assert.ok(Math.abs(title.x + title.width / 2 - header.x - header.width / 2) <= 1);
      assert.equal(
        await h.page.locator(".office__top").evaluate(el => getComputedStyle(el).backgroundImage),
        "none",
      );
      for (const selector of [
        ".nav-bar__toggle",
        "button.control-panel__action",
        ".control-panel__profile .user",
      ]) {
        const box = await h.page.locator(selector).boundingBox();
        assert.ok(box.width >= 44 && box.height >= 44, selector + " target");
      }
      assert.equal(await h.page.locator("app-feed-filter .filter__option").count(), 6);
      assert.equal(await h.page.locator("app-feed-filter .select").count(), 0);
      const notifications = h.page.getByRole("button", { name: "Уведомления", exact: true });
      await notifications.focus();
      await h.page.keyboard.press("Enter");
      await h.page.locator(".control-panel__notifications").waitFor();
      assert.equal(await notifications.getAttribute("aria-expanded"), "true");
      await h.page.locator("app-open-vacancy h3").click();
      await h.page.locator(".control-panel__notifications").waitFor({ state: "detached" });
      const noOverlap = await h.page
        .locator("app-feed-filter .filter__option")
        .evaluateAll(options =>
          options.every(option => {
            const icon = option.querySelector(".filter__option--icon").getBoundingClientRect();
            const label = option.querySelector(".filter__title").getBoundingClientRect();
            const count = option.querySelector(".filter__count").getBoundingClientRect();
            return (
              icon.right <= label.left && (label.bottom <= count.top || label.right <= count.left)
            );
          }),
        );
      assert.ok(noOverlap);
      const toggle = h.page.locator("app-open-vacancy .skills__toggle");
      await toggle.click();
      await h.page.locator("app-open-vacancy app-tag").nth(3).waitFor();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true");
      assert.equal(await h.page.locator("app-open-vacancy app-tag").count(), 4);
      const skillVisible = await h.page.locator("app-open-vacancy app-tag").evaluateAll(tags =>
        tags.every(tag => {
          const el = tag.querySelector("p") || tag;
          const s = getComputedStyle(el);
          return s.textOverflow !== "ellipsis" && el.scrollWidth <= el.clientWidth + 1;
        }),
      );
      assert.ok(skillVisible);
      const category = h.page.locator(".filter__option").filter({ hasText: "свежие вакансии" });
      await category.click();
      await h.page.waitForURL(/includes=vacancy/);
      await h.page.waitForLoadState("networkidle");
      assert.equal(await category.getAttribute("aria-pressed"), "true");
      assert.ok(h.requests.some(r => /\/feed\/$/.test(r.path) && /type=vacancy/.test(r.query)));
      const disabled = h.page.getByRole("button", { name: /образование/ });
      assert.equal(await disabled.isDisabled(), true);
      const url = h.page.url();
      await disabled.evaluate(el => el.click());
      assert.equal(h.page.url(), url);
      await check(h, "navigation-feed-skills", width);

      await goto(h, "/office/projects/dashboard", "app-info-card");
      const activity = await h.page.locator("app-project-activity-card").boundingBox();
      const list = await h.page.locator(".page__outlet").boundingBox();
      const parent = await h.page.locator(".page__info").boundingBox();
      assert.ok(activity.y + activity.height <= list.y + 1);
      assert.ok(Math.abs(activity.width - parent.width) <= 1);
      assert.equal(
        await h.page
          .locator(".activity__metrics")
          .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length),
        2,
      );
      const card = await h.page.locator("app-info-card .card__body").first().boundingBox();
      assert.ok(card.width <= 261 && card.width < parent.width);
      await check(h, "projects-activity", width);

      await goto(h, "/office/members", "app-member-card");
      const member = await h.page.locator("app-member-card .member-card").first().boundingBox();
      assert.ok(member.width <= 261);
      await check(h, "members", width);

      for (const [name, route] of [
        ["profile", "/office/profile/1"],
        ["project", "/office/projects/1"],
        ["program", "/office/program/1"],
      ]) {
        await goto(h, route, ".info__actions app-button");
        const actions = await h.page.locator(".info__actions").boundingBox();
        const children = await h.page
          .locator(
            ".info__actions > a, .info__actions > app-button, .info__actions > .info__unavailable",
          )
          .all();
        for (const child of children) {
          if (!(await child.isVisible())) continue;
          const box = await child.boundingBox();
          assert.ok(Math.abs(box.width - (actions.width - 12) / 2) <= 1, `${name} action column`);
          const button = child.locator("button").first();
          const buttonBox = await button.boundingBox();
          assert.ok(
            buttonBox.height >= 44 && Math.abs(buttonBox.width - box.width) <= 1,
            `${name} button target`,
          );
        }
        assert.equal(await h.page.locator(".info__divider:visible").count(), 0);
        assert.ok((await h.page.locator(".info__page-header").textContent()).trim().length > 0);
        if (name === "project") {
          const metadata = await h.page.locator("app-projects-left-side").boundingBox();
          assert.ok(metadata.width > actions.width - 2, "project metadata full width");
        }
        if (name === "program") {
          const contacts = h.page.getByRole("button", { name: "Контакты", exact: true });
          assert.equal(await contacts.count(), 1);
          assert.equal(await contacts.isDisabled(), true);
        }
        await check(h, `${name}-actions`, width);
      }
      await h.page.getByRole("link", { name: "Мой профиль", exact: true }).click();
      await h.page.waitForURL(/\/office\/profile\/1$/);
      await h.page.waitForLoadState("networkidle");
      assert.equal((await h.page.locator(".nav-bar__title").textContent()).trim(), "Профиль");
      await h.page.getByRole("button", { name: "Открыть меню", exact: true }).click();
      await h.page.keyboard.press("Escape");
      await h.page.locator("#mobile-navigation").waitFor({ state: "detached" });
      assert.equal(await h.page.locator("#mobile-navigation").count(), 0);
      assert.equal(
        await h.page.locator(".nav-bar__toggle").evaluate(el => document.activeElement === el),
        true,
      );
    } finally {
      await h.browser.close();
    }
  }
  fs.writeFileSync(path.join(__dirname, "interactions.json"), JSON.stringify(rows, null, 2) + "\n");
  console.log(`${rows.length} interaction screens passed`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
