/** @format */

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("assert/strict");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const page = await browser.newPage();
  const errors = [];
  const findings = [];
  page.on("pageerror", error => errors.push(error.message));
  const settle = () => page.evaluate(() => window.__invitePreview.fixture.whenStable());
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await page.goto("http://127.0.0.1:4337/office/profile/10?mode=profile&projects=12");
    await page.waitForFunction(() => !!window.__invitePreview);
    await page.getByRole("button", { name: "пригласить", exact: true }).click();
    await settle();
    await page.getByRole("dialog").waitFor();
    for (const [index, key] of [
      [0, "Enter"],
      [11, "Space"],
    ]) {
      const row = page.getByRole("radio").nth(index);
      await row.focus();
      await row.press(key);
      await settle();
      assert.equal(await row.getAttribute("aria-checked"), "true");
      findings.push({ width, flow: "profile", key, selectedProjectId: index + 1 });
    }
    await page.goto("http://127.0.0.1:4337/office/projects/5/edit?mode=team");
    await page.waitForFunction(() => !!window.__invitePreview);
    await page.locator(".invite__submit button").click();
    await settle();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("searchbox").fill("Иван");
    await settle();
    await page.getByRole("radio").last().waitFor();
    for (const [index, key] of [
      [3, "Enter"],
      [4, "Space"],
    ]) {
      const row = page.getByRole("radio").nth(index);
      await row.focus();
      await row.press(key);
      await settle();
      const selected = await page.evaluate(
        () => window.__invitePreview.teamUI.selectedRecipient()?.id,
      );
      assert.equal(selected, index + 10);
      findings.push({ width, flow: "team", key, selectedRecipientId: selected });
      await page.getByRole("button", { name: "Очистить выбранного участника" }).click();
      await settle();
    }
  }
  assert.equal(errors.length, 0);
  fs.writeFileSync(
    "docs/project-invite-ux/keyboard-results.json",
    JSON.stringify(
      {
        base: "01d59ad59578d26777625b0a32658acbf52ec6fc",
        browser: await browser.version(),
        assertions: findings.length + 1,
        errors,
        findings,
      },
      null,
      2,
    ),
  );
  console.log("PASS", findings.length + 1, "assertions; errors", errors);
  await browser.close();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
