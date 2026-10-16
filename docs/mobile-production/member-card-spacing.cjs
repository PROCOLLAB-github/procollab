/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const fixtures = require("./mobile-fixtures.cjs");
const { launch, assertViewport } = require("./browser-harness.cjs");
const preview = require("./preview.cjs");
const [phase, widthsText = "320,360,390,480,580,640,749,750,768,999,1000,1440,1920", outputText] =
  process.argv.slice(2);
const output = path.resolve(outputText || ".release-mobile/member-spacing-20261016/screenshots");
const baseUrl = "http://127.0.0.1:4486";
const original = fixtures.response;
const skill = { id: 1, name: "Apache Kafka", category: { id: 1, name: "Back-end" }, approves: [] };
const variants = [
  {
    firstName: "Сергей",
    lastName: "Яксанов",
    speciality: "Fullstack SWE",
    count: 20,
    name: "Apache Kafka",
  },
  {
    firstName: "Михаил",
    lastName: "Хромов",
    speciality: "Django developer",
    count: 4,
    name: "Python",
  },
  {
    firstName: "ОченьДлинноеИмяУчастника",
    lastName: "ОченьДлиннаяФамилия",
    speciality: "Проектирование распределённых систем и сервисов",
    count: 1,
    name: "ДлинныйНавыкБезПробеловДляПроверкиСжатияКарточки",
  },
  { firstName: "Анна", lastName: "Иванова", speciality: "", count: 0 },
];
fixtures.response = (endpoint, method, query, state) => {
  if (/\/auth\/public-users\/$/.test(endpoint))
    return {
      count: variants.length,
      next: null,
      previous: null,
      results: variants.map((v, i) => ({
        ...fixtures.user,
        id: i + 10,
        firstName: v.firstName,
        lastName: v.lastName,
        avatar: "/assets/images/profile/main.svg",
        speciality: v.speciality,
        skills: Array.from({ length: v.count }, (_, index) => ({
          ...skill,
          id: index + 1,
          name: index ? "Навык " + index : v.name,
        })),
      })),
    };
  return original(endpoint, method, query, state);
};

(async () => {
  fs.mkdirSync(path.join(output, phase), { recursive: true });
  const rows = [];
  for (const width of widthsText.split(",").map(Number)) {
    const h = await launch(width, { baseUrl, hasTouch: width < 1000, isMobile: width < 750 });
    await preview(h.context, baseUrl);
    try {
      const p = h.page;
      await p.goto(baseUrl + "/office/members");
      await p.locator("app-member-card").nth(3).waitFor({ state: "visible" });
      await p.waitForLoadState("networkidle");
      await p.evaluate(async () => {
        for (const image of document.images) image.loading = "eager";
        await document.fonts.ready;
        await Promise.all([...document.fonts].map(font => font.load().catch(() => {})));
        await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      await p.addStyleTag({
        content:
          "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
      });
      const cards = await p.locator(".member-card").evaluateAll(elements =>
        elements.map(el => {
          const box = node => {
            const r = node.getBoundingClientRect();
            return {
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
              right: r.right,
              bottom: r.bottom,
            };
          };
          const action = el.querySelector(".member-card__action"),
            skills = el.querySelector(".member-card__skills-area");
          return {
            card: box(el),
            action: box(action),
            skills: box(skills),
            gap: box(action).y - box(skills).bottom,
            more: el.querySelector(".member-card__more")?.textContent.trim() || "",
            url: el.getAttribute("href"),
          };
        }),
      );
      assert.equal(cards.length, 4);
      assert.equal(cards[0].more, "+19");
      assert.equal(cards[1].more, "+3");
      if (phase !== "baseline" && width < 1000) {
        await assertViewport(p);
        assert.equal(cards[0].card.y, cards[1].card.y);
        for (const [i, c] of cards.entries()) {
          assert.ok(c.gap >= 7.99, `${width} card ${i}: gap ${c.gap}`);
          assert.ok(c.action.height >= 44);
          assert.ok(c.action.bottom <= c.card.bottom - 12);
          assert.ok(c.action.x >= c.card.x && c.action.right <= c.card.right);
          assert.equal(c.url, "/office/profile/" + (i + 10));
        }
      }
      assert.deepEqual(h.errors, []);
      await p.screenshot({
        path: path.join(output, phase, `members-spacing-${width}.png`),
        fullPage: true,
      });
      rows.push({ width, cards, passed: true });
      console.log(`${phase}: ${width}, gaps ${cards.map(c => c.gap).join(", ")}`);
    } finally {
      await h.browser.close();
    }
  }
  fs.writeFileSync(path.join(output, `${phase}.json`), JSON.stringify(rows, null, 2) + "\n");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
