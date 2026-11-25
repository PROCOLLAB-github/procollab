/** @format */
const assert = require("node:assert/strict");
const { mkdir } = require("node:fs/promises");
const { launch } = require("../docs/responsive/browser-harness.cjs");
const { program } = require("../docs/responsive/fixtures.cjs");

const root = "/programs/1/management/";
const settings = {
  revision: 1,
  draft: {
    layout: Object.fromEntries(
      [
        "title",
        "subtitle",
        "name",
        "program",
        "date",
        "number",
        "director",
        "position",
        "signature",
      ].map(key => [key, { x: 12, y: 48, width: 76, height: 8, fontSize: 36 }]),
    ),
    showText: true,
    hiddenElements: [],
    audience: "all",
    timing: "manual",
    sendEmail: false,
  },
  assets: { background: null, signature: null },
  eligibleCounts: { all: 5, submitted: 2 },
  batch: null,
};
const journal = { count: 0, results: [], summary: { total: 0, ready: 0, sent: 0, failed: 0 } };

async function verify(width, colorScheme) {
  const { browser, page, base, context } = await launch(width, { colorScheme });
  page.setDefaultTimeout(12000);
  const headers = { "Access-Control-Allow-Origin": "*" };
  const mock = (pathname, json) =>
    context.route(
      url => url.pathname === pathname,
      route => route.fulfill({ headers, json }),
    );
  try {
    await mock(root, program);
    await mock("/solution-invitations/", { count: 0, results: [] });
    await mock(root + "certificates/", settings);
    await mock(root + "certificates/deliveries/", journal);
    await page.goto(base + "/office/program/1/management/certificates");
    await page.getByRole("button", { name: "Журнал", exact: true }).click();
    const search = page.getByRole("searchbox", { name: "Поиск по имени или почте" });
    await page.keyboard.press("Tab");
    assert.equal(await search.evaluate(input => input === document.activeElement), true);
    await page.waitForFunction(() => getComputedStyle(document.activeElement).boxShadow !== "none");
    const geometry = await search.evaluate(input => {
      const bounds = input.getBoundingClientRect();
      const icon = input.parentElement.querySelector("i").getBoundingClientRect();
      return {
        height: bounds.height,
        round: parseFloat(getComputedStyle(input).borderRadius) >= bounds.height / 2,
        inside: icon.left >= bounds.left && icon.right <= bounds.right,
        centered: Math.abs((icon.top + icon.bottom - bounds.top - bounds.bottom) / 2) <= 1,
        fit: bounds.left >= 0 && bounds.right <= innerWidth,
      };
    });
    assert.ok(
      geometry.height >= 44 &&
        geometry.round &&
        geometry.inside &&
        geometry.centered &&
        geometry.fit,
      JSON.stringify(geometry),
    );
    const request = page.waitForRequest(req => {
      const url = new URL(req.url());
      return (
        url.pathname === root + "certificates/deliveries/" &&
        url.searchParams.get("search") === "Анна"
      );
    });
    await search.fill("Анна");
    await request;
    await page.screenshot({
      path: process.env.REVIEW_OUTPUT + "/journal-search-" + width + ".png",
    });
  } finally {
    await browser.close();
  }
}

(async () => {
  await mkdir(process.env.REVIEW_OUTPUT, { recursive: true });
  await verify(1440, "light");
  await verify(320, "dark");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
