/** @format */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { launch } = require("../responsive/browser-harness.cjs");
require("../mobile-polish/fixtures.cjs");
const preview = require("./preview.cjs");

const baseUrl = process.argv[2];
const directory = path.resolve(process.argv[3] || ".desktop-regression/mobile-smoke/connection");
(async () => {
  fs.mkdirSync(directory, { recursive: true });
  const harness = await launch(390, { baseUrl, isMobile: true, hasTouch: true });
  await preview(harness.context, baseUrl);
  try {
    // Управляемые WebSocket события; HTTP API остаётся доступен через fixtures.
    await harness.context.addInitScript(() => {
      window.qaChatOffline = true;
      window.qaChatConnected = false;
      window.qaChatSockets = [];
      window.qaToastCount = 0;
      new MutationObserver(records => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (
              node.nodeType === 1 &&
              (node.matches(".snackbar__item") || node.querySelector(".snackbar__item"))
            ) {
              window.qaToastCount++;
            }
          }
        }
      }).observe(document, { childList: true, subtree: true });
      window.WebSocket = class {
        static OPEN = 1;
        static CONNECTING = 0;
        static CLOSING = 2;
        static CLOSED = 3;
        readyState = 0;
        constructor() {
          window.qaChatSockets.push(this);
          setTimeout(() => {
            if (this.closed) return;
            if (window.qaChatOffline) {
              this.readyState = 3;
              this.onerror?.(new Event("error"));
            } else {
              this.readyState = 1;
              window.qaChatConnected = true;
              this.onopen?.(new Event("open"));
            }
          }, 20);
        }
        send() {}
        close() {
          this.closed = true;
          this.readyState = 3;
        }
      };
    });
    const page = harness.page;
    await page.goto(baseUrl + "/office/feed");
    await page.locator("app-open-vacancy").first().waitFor({ state: "attached" });
    const toast = page.locator(".snackbar__item");
    // Проходим порог быстрых retry и ещё две попытки; фон продолжает работать без toast.
    await page.waitForFunction(() => window.qaChatSockets.length >= 7, null, { timeout: 20000 });
    assert.equal(
      await toast.count(),
      0,
      "Hidden chat outage must not create a global notification",
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(directory, "background-outage-390.png"),
      fullPage: true,
    });
    await page.evaluate(() => {
      window.qaChatOffline = false;
    });
    await page.waitForFunction(() => window.qaChatConnected, null, { timeout: 10000 });
    assert.equal(await toast.count(), 0);

    await page.evaluate(() => {
      history.pushState({}, "", "/office/profile/1");
      dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.locator("app-profile-left-side").waitFor({ state: "attached" });
    const onlineBadge = page.locator(".info__avatar .avatar__online");
    assert.equal(await onlineBadge.count(), 0);
    const emitStatus = type =>
      page.evaluate(type => {
        window.qaChatSockets.at(-1).onmessage(
          new MessageEvent("message", {
            data: JSON.stringify({ type, content: { user_id: 1 } }),
          }),
        );
      }, type);
    await emitStatus("set_online");
    await onlineBadge.waitFor({ state: "visible" });
    await emitStatus("set_offline");
    await onlineBadge.waitFor({ state: "hidden" });

    const attempts = await page.evaluate(() => window.qaChatSockets.length);
    await page.evaluate(() => {
      window.qaChatOffline = true;
      window.qaChatConnected = false;
      window.qaChatSockets.at(-1).onerror(new Event("error"));
    });
    await page.waitForFunction(attempts => window.qaChatSockets.length >= attempts + 6, attempts, {
      timeout: 20000,
    });
    assert.equal(await toast.count(), 0, "Second outage must also stay silent");
    await page.evaluate(() => {
      window.qaChatOffline = false;
    });
    await page.waitForFunction(() => window.qaChatConnected, null, { timeout: 10000 });
    await emitStatus("set_online");
    await onlineBadge.waitFor({ state: "visible" });
    assert.equal(await toast.count(), 0);
    assert.equal(
      await page.evaluate(() => window.qaToastCount),
      0,
      "No transient toast during any outage",
    );
    assert.deepEqual(harness.errors, []);
    fs.writeFileSync(
      path.join(directory, "result.json"),
      JSON.stringify(
        {
          width: 390,
          syntheticWebSocket: true,
          httpAvailable: true,
          noGlobalNotification: true,
          automaticReconnect: true,
          secondOutageSilent: true,
          onlineStatusesAfterReconnect: true,
          passed: true,
        },
        null,
        2,
      ) + "\n",
    );
    console.log("Connection smoke: all scenarios passed");
  } finally {
    await harness.browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
