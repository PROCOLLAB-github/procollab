/** @format */
// Только реальные публичные GET и anonymous denial. Не выполняет login или запись данных.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { chromium } = require("playwright");
const expected = process.argv[2];
assert.match(expected ?? "", /^[0-9a-f]{40}$/, "Нужен полный SHA проверяемого приложения");
const git = args => execFileSync("git", args, { encoding: "utf8" }).trim();
const commit = git(["rev-parse", "HEAD"]);
assert.equal(commit, expected);
assert.equal(git(["diff", "--name-only", "HEAD", "--", "projects"]), "");
assert.equal(git(["ls-files", "--others", "--exclude-standard", "--", "projects"]), "");
const base = "http://127.0.0.1:4317";
const api = "https://dev.procollab.ru";
const sourcePath =
  "projects/social_platform/src/app/ui/pages/program/management/experts/solution-experts.component.ts";
(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const blocked = new Set();
    const methods = [];
    await context.route("**/*", route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === api && !["GET", "HEAD", "OPTIONS"].includes(request.method())) {
        throw new Error("Readiness не разрешает изменяющие запросы");
      }
      if ([base, api, "https://skills.dev.procollab.ru"].includes(url.origin)) {
        if (url.origin === api) methods.push(request.method());
        return route.continue();
      }
      blocked.add(url.origin);
      return route.abort();
    });
    const page = await context.newPage();
    await page.goto(`${base}/auth/login`);
    await page.locator('input[type="email"]').waitFor();
    await page.locator('input[type="password"]').waitFor();
    const reads = await page.evaluate(async () => {
      const result = [];
      for (const path of [
        "/programs/39/",
        "/programs/49/",
        "/programs/39/management/experts/",
        "/programs/49/management/experts/",
      ]) {
        const response = await fetch("https://dev.procollab.ru" + path, {
          credentials: "omit",
        });
        const body = await response.json();
        result.push({
          path,
          status: response.status,
          mode: body.solution_storage_mode ?? null,
          detail: body.detail ?? null,
        });
      }
      return result;
    });
    assert.deepEqual(
      reads.map(row => row.status),
      [200, 200, 401, 401],
    );
    assert.equal(reads[0].mode, "legacy_project");
    assert.equal(reads[1].mode, "solution");
    const redirects = [];
    for (const id of [39, 49]) {
      await page.goto(`${base}/office/program/${id}/management/experts`);
      await page.waitForURL("**/auth/login**");
      redirects.push({ programId: id, login: true });
    }
    assert.ok(methods.every(method => ["GET", "HEAD", "OPTIONS"].includes(method)));
    process.stdout.write(
      JSON.stringify(
        {
          commit,
          sourceSha256: createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex"),
          appSourceClean: true,
          normalLoginRendered: true,
          origin: base,
          api,
          reads,
          anonymousRedirects: redirects,
          blockedThirdPartyOrigins: [...blocked],
          apiMocked: false,
          authorizationAttempted: false,
          credentialsRecorded: false,
          writes: 0,
        },
        null,
        2,
      ) + "\n",
    );
  } finally {
    await browser.close();
  }
})().catch(() => {
  process.stderr.write("Anonymous readiness не завершена; секретные данные не записывались.\n");
  process.exitCode = 1;
});
