/** @format */
// Browser regression on real Angular components with local fixture data, not DEV API.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
let assertions = 0;
const check = (value, message) => {
  assert.ok(value, message);
  assertions++;
};
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const results = [],
    errors = [];
  try {
    for (const width of [390, 320]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        hasTouch: true,
      });
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("http://127.0.0.1:4358/office/projects/5/edit?stress=1");
      await page.waitForFunction(() => !!window.__vacancyPreview);
      await page.evaluate(async () => {
        window.__vacancyPreview.fill();
        await window.__vacancyPreview.fixture.whenStable();
        await document.fonts.ready;
      });
      const chips = page.locator(".basket__skill");
      const longChip = chips.filter({ hasText: "ОченьДлинныйНавыкБезПробелов" });
      const button = longChip.getByRole("button");
      await button.scrollIntoViewIfNeeded();
      const geometry = await longChip.evaluate(el => {
        const action = el.querySelector("button"),
          basket = el.closest(".basket"),
          text = el.querySelector("span");
        return {
          button: action.getBoundingClientRect().toJSON(),
          basket: basket.getBoundingClientRect().toJSON(),
          chip: el.getBoundingClientRect().toJSON(),
          textWidth: text.scrollWidth,
          textBox: text.clientWidth,
          viewport: innerWidth,
          document: document.documentElement.scrollWidth,
          font: getComputedStyle(text).fontFamily,
          fontLoaded: document.fonts.check("12px Mont"),
        };
      });
      check(
        geometry.button.width >= 44 && geometry.button.height >= 44,
        "touch target remains 44px",
      );
      check(
        geometry.button.right <= geometry.basket.right &&
          geometry.button.left >= geometry.basket.left,
        "action is inside basket",
      );
      check(geometry.chip.right <= width && geometry.chip.left >= 0, "chip stays in viewport");
      check(
        geometry.textWidth <= geometry.textBox + 1,
        "unbroken skill wraps without text overflow",
      );
      check(geometry.document <= geometry.viewport, "page has no horizontal overflow");
      check(geometry.font.includes("Mont") && geometry.fontLoaded, "real Mont loaded");
      check(
        (await button.getAttribute("aria-label")).startsWith("Удалить навык ОченьДлинный"),
        "accessible name contains the full skill",
      );
      await page.screenshot({
        path: `docs/vacancy-redesign/screenshots/autocomplete-followup/vacancy-stress-${width}.png`,
      });
      await button.tap();
      await page.evaluate(() => window.__vacancyPreview.fixture.whenStable());
      check((await chips.count()) === 2, "touch removes only the selected skill");
      await chips.filter({ hasText: "TypeScript" }).getByRole("button").press("Space");
      await page.evaluate(() => window.__vacancyPreview.fixture.whenStable());
      check((await chips.count()) === 1, "Space removes selected skill without submitting form");
      await chips.getByRole("button").press("Enter");
      await page.evaluate(() => window.__vacancyPreview.fixture.whenStable());
      check((await chips.count()) === 0, "Enter removes final skill");
      check(
        await page.getByText("Выберите навыки", { exact: true }).isVisible(),
        "empty basket appears",
      );
      check((await page.getByRole("dialog").count()) === 0, "delete does not submit vacancy");
      results.push({ width, geometry, touch: true, space: true, enter: true });
      await context.close();
    }
    check(errors.length === 0, "no browser exceptions");
    fs.writeFileSync(
      "docs/vacancy-redesign/basket-layout-results.json",
      JSON.stringify(
        { environment: "local Angular fixture; no DEV requests", assertions, results, errors },
        null,
        2,
      ) + "\n",
    );
    console.log(JSON.stringify({ assertions, errors }));
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
