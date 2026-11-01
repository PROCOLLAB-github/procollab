/** @format */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch, open } = require("./browser-check.cjs");
const results = [];
(async () => {
  for (const width of [320, 390, 768, 1440, 1920]) {
    const { browser, page, requests, errors } = await launch(width);
    const versions = {};
    for (const version of ["v1", "v2"]) {
      await open(page, version, "experts", "experts");
      versions[version] = await page.evaluate(() => {
        const measure = selector => {
          const node = document.querySelector(selector),
            box = node.getBoundingClientRect(),
            style = getComputedStyle(node);
          return {
            width: box.width,
            height: box.height,
            font: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
            radius: style.borderRadius,
            color: style.color,
            background: style.backgroundColor,
          };
        };
        return {
          fontLoaded: document.fonts.check("12px Mont"),
          invite: measure(".experts__invite"),
          export: measure(".experts__export"),
          filter: measure(".experts__filter-trigger"),
          search: measure(".experts__search input"),
          table: measure(".experts__table"),
          avatar: measure(".experts__person app-avatar"),
          exportIcon: measure(".experts__export svg"),
          checkbox: measure(".experts__table tbody input"),
        };
      });
      assert.equal(versions[version].fontLoaded, true);
      assert.equal(versions[version].invite.height, 32);
      assert.equal(versions[version].export.width, 32);
      assert.equal(versions[version].exportIcon.width, 18);
      assert.equal(versions[version].exportIcon.height, 18);
      for (const control of ["invite", "export", "filter", "search", "table"])
        assert.match(versions[version][control].font, /Mont/);
      await page.locator(".experts__invite").hover();
      await page.waitForTimeout(300);
      const hover = await page
        .locator(".experts__invite")
        .evaluate(n => getComputedStyle(n).backgroundColor);
      versions[version].hover = hover;
      await page.locator(".experts__filter-trigger").focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      versions[version].focus = await page.locator(".experts__filter-trigger").evaluate(n => ({
        width: getComputedStyle(n).outlineWidth,
        style: getComputedStyle(n).outlineStyle,
      }));
      assert.equal(versions[version].focus.width, "2px");
    }
    for (const control of [
      "invite",
      "export",
      "filter",
      "search",
      "avatar",
      "exportIcon",
      "checkbox",
      "hover",
      "focus",
    ])
      assert.deepEqual(versions.v2[control], versions.v1[control], `${control} at ${width}`);
    const start = requests.length;
    await open(page, "v2", "analytics", "analytics");
    const legacyRequests = requests
      .slice(start)
      .filter(r => /manager-overview.*assignments/.test(r.path));
    assert.deepEqual(legacyRequests, []);
    assert.equal(errors.length, 0, errors.join("\n"));
    results.push({ width, versions, noLegacyAssignmentRequestsInV2: true, passed: true });
    console.log(`visual contract ${width}: PASS`);
    await browser.close();
  }
  fs.writeFileSync(
    path.join(__dirname, "visual-contract-results.json"),
    JSON.stringify(results, null, 2),
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
