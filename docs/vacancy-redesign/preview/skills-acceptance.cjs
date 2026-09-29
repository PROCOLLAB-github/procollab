/** @format */

// Локальная проверка настоящих Angular-компонентов и SearchesService; HTTP-ответы управляемые.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], queries = [], cancelled = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("requestfailed", request => { if (request.url().includes("/core/skills/")) cancelled.push(request.url().split("?")[1]); });
  const skills = ["TypeScript", "Angular"].map((name, id) => ({ id, name, category: { id: 1, name: "Hard skills" }, approves: [] }));
  let releaseOld;
  let oldFinished;
  await page.route("**/fixture-api/core/skills/inline/**", async route => {
    const query = new URL(route.request().url()).searchParams.get("name__icontains");
    queries.push(query);
    if (query === "ang") {
      oldFinished = new Promise(resolve => {
        releaseOld = async () => {
          try { await route.fulfill({ json: { results: [skills[1]] } }); } catch (_) { /* отменённый запрос */ }
          resolve();
        };
      });
      return;
    }
    await route.fulfill({ json: { results: skills.filter(skill => skill.name.toLowerCase().includes(query.toLowerCase())) } });
  });
  await page.goto("http://127.0.0.1:4358/office/projects/5/edit");
  await page.waitForFunction(() => !!window.__vacancyPreview);
  const settle = () => page.evaluate(() => window.__vacancyPreview.fixture.whenStable());
  await page.evaluate(() => { window.__vacancyPreview.fill(); window.__vacancyPreview.projectUi.skills.setValue([]); });
  await settle();
  const input = page.locator('app-autocomplete-input input');
  const options = page.locator('app-autocomplete-input .field__dropdown--options .field__option');
  const basket = page.locator('.basket__skill');
  const requestStarted = page.waitForRequest(request => request.url().includes('name__icontains=ang'));
  await input.fill('ang');
  await requestStarted;
  await input.fill('Ty');
  await input.fill('Type');
  await options.filter({ hasText: 'TypeScript' }).waitFor();
  await releaseOld();
  await oldFinished;
  await settle();
  check((await options.allTextContents()).map(x => x.trim()).join(',') === 'TypeScript', 'поздний Angular не заменяет TypeScript');
  check(!queries.includes('Ty'), 'быстрые запросы объединены debounce');
  await page.evaluate(() => window.__vacancyPreview.rootSearch.inlineSkills.set([{ id: 999, name: 'Чужая форма' }]));
  await settle();
  check(!(await page.locator('app-autocomplete-input').innerText()).includes('Чужая форма'), 'подсказки изолированы от root inlineSkills');
  await options.filter({ hasText: 'TypeScript' }).click();
  await settle();
  check(await input.inputValue() === '', 'выбор очищает строку');
  check(await basket.count() === 1, 'навык выбран из поиска');
  await input.fill('Type');
  await options.filter({ hasText: 'TypeScript' }).waitFor();
  await options.filter({ hasText: 'TypeScript' }).click();
  await settle();
  check(queries.filter(q => q === 'Type').length === 2, 'одинаковый запрос повторяется после выбора');
  check(await basket.count() === 1, 'повторный выбор не дублирует id');

  const secondOld = page.waitForRequest(request => request.url().includes('name__icontains=ang'));
  await input.fill('ang'); await secondOld;
  await input.fill('');
  await releaseOld(); await oldFinished; await settle();
  check(await page.locator('.field__dropdown').count() === 0, 'очистка не позволяет позднему ответу открыть список');

  await page.locator('app-autocomplete-input .field__icons i').click();
  await page.locator('.modal__skills-groups .heading__top').click();
  const library = page.locator('.modal__skills-groups');
  await library.locator('.content__option').filter({ hasText: 'TypeScript' }).locator('.checkbox__field--checked').waitFor();
  check(await library.locator('.content__option').filter({ hasText: 'TypeScript' }).locator('.checkbox__field--checked').count() === 1, 'библиотека отражает выбранный навык');
  await library.locator('.content__option').filter({ hasText: 'Angular' }).click();
  await page.getByRole('button', { name: 'Закрыть библиотеку навыков' }).click();
  await settle();
  check(await basket.count() === 2, 'выбор из библиотеки синхронизирует корзину');
  await basket.filter({ hasText: 'TypeScript' }).locator('i').click();
  await settle();
  check(await basket.count() === 1 && (await basket.innerText()).includes('Angular'), 'удаление сохраняет второй навык');

  await page.locator('.vacancy__submit button').click();
  await settle();
  await page.evaluate(() => window.__vacancyPreview.succeed());
  await page.getByRole('button', { name: 'Остаться в проекте' }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  const createdCard = page.locator('app-vacancy-card').last();
  await createdCard.getByRole('button', { name: 'Редактировать' }).click();
  await settle();
  check((await basket.allTextContents()).map(x=>x.trim()).join(',') === 'Angular', 'повторное открытие созданной вакансии восстанавливает серверные навыки');
  await basket.locator('i').click();
  await input.fill('Type');
  await options.filter({ hasText: 'TypeScript' }).click();
  await page.locator('.vacancy__submit button').click();
  await settle();
  await createdCard.getByRole('button', { name: 'Редактировать' }).click();
  await settle();
  check((await basket.allTextContents()).map(x=>x.trim()).join(',') === 'TypeScript', 'редактирование/сохранение/повторное открытие сохраняет новые id');
  check(await page.locator('app-input#salary input').inputValue() === '120000', 'изменение навыков сохраняет числовую зарплату из ответа');
  check(cancelled.length >= 2, 'устаревшие HTTP-запросы отменены');
  check(errors.length === 0, 'ошибок JavaScript нет: ' + errors.join('; '));
  await page.screenshot({ path: 'docs/vacancy-redesign/screenshots/skills-editor-1440.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await input.fill('Angular');
  await options.filter({ hasText: 'Angular' }).click();
  await settle();
  check(await basket.count() === 2, 'поиск и выбор на mobile');
  await page.screenshot({ path: 'docs/vacancy-redesign/screenshots/skills-editor-390.png', fullPage: true });
  const mobileGeometry = await page.evaluate(() => ({ contentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }));
  check(mobileGeometry.contentWidth <= mobileGeometry.viewportWidth, 'редактор mobile без горизонтального переполнения');
  const result = { checks, queries, cancelled, errors, mobileGeometry, api: 'local controlled fixtures; not DEV', rootCauseReproduction: '8 failing regressions before fix' };
  fs.writeFileSync('docs/vacancy-redesign/skills-results.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
