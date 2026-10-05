/** @format */

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fixtures = require("./fixtures.cjs");
const defaultBase = "http://127.0.0.1:4360";

async function launch(width = 390, options = {}) {
  const { baseUrl: base = defaultBase, ...contextOptions } = options;
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    reducedMotion: "reduce",
    ...contextOptions,
  });
  await context.addCookies(
    ["accessToken", "refreshToken", "devAccessToken", "devRefreshToken"].map(name => ({
      name,
      value: "responsive-fixture",
      url: base,
    })),
  );
  await context.addInitScript(() => localStorage.setItem("cookieConsent", "declined"));
  const requests = [];
  await context.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === base) return route.continue();
    if (["dev.procollab.ru", "api.procollab.ru"].includes(url.hostname)) {
      requests.push({
        method: request.method(),
        path: url.pathname,
        query: url.search,
        body: request.postData(),
      });
      return route.fulfill({
        json: fixtures.response(url.pathname, request.method(), url.searchParams, {
          completedLesson: request.frame().url().includes("/results"),
        }),
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
    return route.fulfill({ body: "", status: 200 });
  });
  await context.routeWebSocket("**", socket => socket.onMessage(() => {}));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  return { browser, context, page, requests, errors, base };
}

async function measure(page) {
  return page.evaluate(() => {
    const visible = el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const overflows = [...document.querySelectorAll("body *")]
      .filter(el => {
        if (!visible(el)) return false;
        const r = el.getBoundingClientRect();
        if (r.left >= -1 && r.right <= innerWidth + 1) return false;
        for (
          let parent = el.parentElement;
          parent && parent !== document.body;
          parent = parent.parentElement
        ) {
          if (["auto", "scroll", "hidden", "clip"].includes(getComputedStyle(parent).overflowX))
            return false;
        }
        return true;
      })
      .slice(0, 12)
      .map(el => ({
        element: el.tagName.toLowerCase(),
        class: el.className,
        left: el.getBoundingClientRect().left,
        right: el.getBoundingClientRect().right,
      }));
    const visibleApps = [...document.querySelectorAll("body *")]
      .filter(el => el.tagName.startsWith("APP-") && visible(el))
      .map(el => el.tagName.toLowerCase());
    return {
      actualPath: location.pathname,
      actualQuery: location.search,
      viewport: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      overflows,
      // Routed hosts can have no box when their content is plain text or a portal.
      rendered: [
        ...new Set(
          [...document.querySelectorAll("body *")]
            .filter(el => el.tagName.startsWith("APP-"))
            .map(el => el.tagName.toLowerCase()),
        ),
      ],
      visibleApps: [...new Set(visibleApps)],
      text: document.body.innerText.slice(0, 300),
    };
  });
}

async function assertViewport(page) {
  const result = await measure(page);
  assert.equal(result.overflows.length, 0, JSON.stringify(result.overflows));
  assert.ok(
    result.pageWidth <= result.viewport + 1,
    `Page ${result.pageWidth} > ${result.viewport}`,
  );
  return result;
}

module.exports = { launch, measure, assertViewport, base: defaultBase };
