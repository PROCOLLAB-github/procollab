/** @format */
const assert = require("node:assert/strict");
const { launch } = require("../docs/responsive/browser-harness.cjs");

const key = "procollab-theme";
async function checkFirstPaint() {
  const { browser, context, base } = await launch(1440, { colorScheme: "dark" });
  try {
    for (const [preference, expected] of [
      [null, "light"],
      ["invalid", "light"],
      ["storage-blocked", "light"],
      ["light", "light"],
      ["dark", "dark"],
      ["dark-special", "dark-special"],
      ["system", "dark"],
    ]) {
      const page = await context.newPage();
      await page.addInitScript(
        ({ preference, key }) => {
          if (preference === "storage-blocked") {
            Object.defineProperty(window, "localStorage", {
              get() {
                throw new DOMException("Storage is unavailable", "SecurityError");
              },
            });
          } else if (preference === null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, preference);
          }
        },
        { preference, key },
      );
      await page.route("**/*", route =>
        route.request().resourceType() === "script" ? route.abort() : route.fallback(),
      );
      await page.goto(base + "/office/feed");
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        expected,
        String(preference),
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

async function checkPreference() {
  const { browser, page, base } = await launch(1440, { colorScheme: "dark" });
  page.setDefaultTimeout(12000);
  const theme = expected =>
    page.waitForFunction(expected => document.documentElement.dataset.theme === expected, expected);
  const openMenu = () => page.getByRole("button", { name: "Меню профиля", exact: true }).click();
  const option = name => page.getByRole("menuitemradio", { name, exact: true });
  const choose = async name => {
    await openMenu();
    await option(name).click();
  };
  try {
    await page.goto(base + "/office/feed");
    await openMenu();
    assert.equal(await option("Светлая").getAttribute("aria-checked"), "true");
    assert.equal(await option("Системная").getAttribute("aria-checked"), "false");
    await theme("light");
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), null);

    await option("Системная").click();
    await theme("dark");
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), "system");
    await page.emulateMedia({ colorScheme: "light" });
    await theme("light");
    await page.reload();
    await openMenu();
    assert.equal(await option("Системная").getAttribute("aria-checked"), "true");
    await page.emulateMedia({ colorScheme: "dark" });
    await theme("dark");
    await option("Светлая").click();
    await theme("light");

    await choose("Темная специальная");
    await theme("dark-special");
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();
    await openMenu();
    assert.equal(await option("Темная специальная").getAttribute("aria-checked"), "true");
    await theme("dark-special");
    await option("Темная").click();
    await theme("dark");
    await choose("Светлая");
    await theme("light");
  } finally {
    await browser.close();
  }
}

(async () => {
  await checkFirstPaint();
  await checkPreference();
  console.log(
    "Light fallback and explicit theme preferences passed before and after Angular initialization.",
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
