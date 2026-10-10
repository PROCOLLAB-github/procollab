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
    const toast = page.locator(".snackbar__item");
    await toast.waitFor({ state: "visible", timeout: 30000 });
    assert.equal(await toast.count(), 1);
    assert.match(await toast.innerText(), /Чат временно недоступен/);
    await page.evaluate(() => document.fonts.ready);
    await toast.screenshot({ path: path.join(directory, "unavailable-390.png") });
    await page.getByLabel("Закрыть уведомление").click();
    await toast.waitFor({ state: "hidden" });
    const attempts = await page.evaluate(() => window.qaChatSockets.length);
    await page.waitForFunction(attempts => window.qaChatSockets.length > attempts, attempts, {
      timeout: 10000,
    });
    assert.equal(await toast.count(), 0, "Dismissed toast must not reappear during same outage");
    await page.evaluate(() => {
      window.qaChatOffline = false;
    });
    await page.waitForFunction(() => window.qaChatConnected, null, { timeout: 10000 });
    assert.equal(await toast.count(), 0);
    await page.evaluate(() => {
      window.qaChatOffline = true;
      window.qaChatConnected = false;
      window.qaChatSockets.at(-1).onerror(new Event("error"));
    });
    await toast.waitFor({ state: "visible", timeout: 30000 });
    assert.equal(await toast.count(), 1, "New outage must produce one new notification");
    await page.evaluate(() => {
      window.qaChatOffline = false;
    });
    await page.waitForFunction(() => window.qaChatConnected, null, { timeout: 10000 });
    await toast.waitFor({ state: "hidden" });
    assert.equal(await toast.count(), 0, "Reconnect must dismiss notification automatically");
    assert.deepEqual(harness.errors, []);
    fs.writeFileSync(
      path.join(directory, "result.json"),
      JSON.stringify(
        {
          width: 390,
          syntheticWebSocket: true,
          httpAvailable: true,
          oneNotificationPerOutage: true,
          manualDismiss: true,
          noRedisplayAfterDismiss: true,
          secondOutage: true,
          autoDismissOnReconnect: true,
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
