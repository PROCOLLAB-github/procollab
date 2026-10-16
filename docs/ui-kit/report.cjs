/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const directory = __dirname;
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const audit = read("audit.json");
const batches = ["mobile", "tablet", "desktop", "projects", "main"].map(name =>
  read(`browser-${name}.json`),
);
const measurements = new Map();
for (const batch of batches) {
  assert.deepEqual(batch.errors, [], "Browser batch must have no errors");
  for (const row of batch.rows) measurements.set(`${row.width}:${row.route}`, row);
}
const rows = [...measurements.values()].sort(
  (a, b) => a.width - b.width || a.route.localeCompare(b.route),
);
const widths = [...new Set(rows.map(row => row.width))];
const routes = [...new Set(rows.map(row => row.route))];
assert.equal(rows.length, widths.length * routes.length, "The viewport matrix must be complete");
for (const row of rows) {
  assert.deepEqual(row.errors, []);
  assert.deepEqual(row.overflows, []);
  assert.ok(row.pageWidth <= row.width + 1 && row.text.trim());
}
const flowMeasurements = new Map();
for (const name of ["flows.json", "flows-layout.json"]) {
  for (const row of read(name)) flowMeasurements.set(`${row.width}:${row.name}`, row);
}
const flows = [...flowMeasurements.values()];
assert.ok(flows.every(row => row.passed));
fs.writeFileSync(path.join(directory, "flows-results.json"), JSON.stringify(flows, null, 2) + "\n");
const geometry = read("ui-check.json");
assert.ok(geometry.every(row => row.passed));
const before = read("before.json"),
  after = read("after.json");
assert.equal(before.length, after.length);
assert.ok(after.every(row => !row.errors.length));
for (const row of before) {
  assert.ok(
    after.some(
      item => item.name === row.name && item.width === row.width && item.route === row.route,
    ),
  );
  for (const phase of ["before", "after"]) {
    assert.ok(
      fs.existsSync(path.join(directory, "screenshots", phase, `${row.name}-${row.width}.png`)),
    );
  }
}
const unitLog = fs.readFileSync(path.join(directory, "unit-tests.log"), "utf8");
const testFiles = unitLog.match(/Test Files\s+(\d+) passed/)[1];
const tests = unitLog.match(/Tests\s+(\d+) passed/)[1];
const targetedTests = ["targeted-tests.log", "targeted-layout-tests.log"].reduce((total, file) => {
  const log = fs.readFileSync(path.join(directory, file), "utf8");
  return total + Number(log.match(/Tests\s+(\d+) passed/)[1]);
}, 0);
const summary = {
  baseline: "bc4940c57eab9eff59219593cfc8ed08f1a416bb",
  sourceFiles: audit.changedFiles.length,
  changedTemplates: audit.componentTemplates.length,
  migratedTemplates: audit.componentTemplates.filter(file => fs.existsSync(file)).length,
  removedDuplicateTemplates: audit.componentTemplates.filter(file => !fs.existsSync(file)).length,
  canonicalComponents: Object.keys(audit.implementations).length,
  testFiles: Number(testFiles),
  tests: Number(tests),
  targetedTests,
  browserMeasurements: rows.length,
  widths,
  routes: routes.length,
  flows: flows.length,
  geometryChecks: geometry.length,
  screenshotPairs: before.length,
};
fs.writeFileSync(
  path.join(directory, "browser-results.json"),
  JSON.stringify({ summary, rows }, null, 2) + "\n",
);
fs.writeFileSync(path.join(directory, "summary.json"), JSON.stringify(summary, null, 2) + "\n");

const screenshots = [
  ["Лента", "feed"],
  ["Проекты", "projects"],
  ["Вакансии", "vacancies"],
  ["Программы", "programs"],
  ["Курсы", "courses"],
  ["Участники", "members"],
  ["Профиль", "profile"],
  ["Редактирование профиля", "profile-edit"],
];
const screenshotRows = screenshots
  .map(([title, name]) => {
    const pair = width =>
      `[до](screenshots/before/${name}-${width}.png) / [после](screenshots/after/${name}-${width}.png)`;
    return `| ${title} | ${pair(320)} | ${pair(390)} | ${pair(1440)} |`;
  })
  .join("\n");
const sourceLink = file => `[${file}](../../${file})`;
const migratedTemplates = audit.componentTemplates.filter(file => fs.existsSync(file));
const templateList = migratedTemplates.map(file => `- ${sourceLink(file)}`).join("\n");
const removed = audit.componentTemplates.filter(file => !fs.existsSync(file));
const componentList = Object.entries(audit.implementations)
  .map(([selector, files]) => `- \`${selector}\`: ${files.map(sourceLink).join(", ")}`)
  .join("\n");
const report = `# Унификация UI Kit PROCOLLAB

Существующий интерфейс переведён на общие компоненты и foundation styles: единые кнопки и поля от 44 px, состояния focus/error/disabled/loading, поверхность карточек, типографика, вкладки, диалоги, заголовки и сообщения. Палитра использует семантические aliases существующих tokens; структура данных и назначение разделов сохранены.

UI Kit изменяет ${summary.sourceFiles} исходных файлов относительно responsive-коммита \`bc4940c5\`: ${summary.migratedTemplates} существующих HTML-шаблонов переведены на общую основу, ${summary.removedDuplicateTemplates} дублирующих шаблонов удалены. Новые компоненты с inline template также включены в [полный аудит](audit.json). API, facades, router declarations и permissions в этом этапе не менялись.

Работа выполнена в локальной \`dev\`. Ветка PR \`feat/dev-ui-kit-unification\` содержит responsive-коммит \`bc4940c5\` и последующий UI Kit, поскольку удалённая \`dev\` пока заканчивается на \`9acb7ce2\`. Изменения предыдущего этапа описаны в [responsive README](../responsive/README.md). Удалённая \`dev\` не изменялась.

## Компоненты и правила

[UI-KIT.md](UI-KIT.md) описывает источники, совместимость и использование всех семейств из ТЗ: Button; Input/Select/Dropdown; Checkbox/Radio; Tabs; Modal/Dialog/Drawer; Card; Badge/Tag; Table/Pagination; Filters; Empty/Loading/Error; Alerts; Page Header; Form layouts.

Канонические реализации, проверяемые аудитом:

${componentList}

Дополнительно унифицированы Back, DialogHeader, native ButtonDirective, Card/Field/Choice/Table/FormLayout/Filters/DialogBody/DialogFooter/Alert/Drawer adapters, Input/Textarea/Autocomplete/Search/Select/Dropdown/Checkbox/Modal/Tag и Snackbar. Старые импорты Button/Avatar/Icon/Loader/Badge реэкспортируют тот же класс. Bar/BarNew, VacancyStatus и project/profile navigation делегируют общему компоненту. Список всех изменений — [audit.json](audit.json).

## Страницы

| Раздел | Переведённые элементы |
| --- | --- |
| Office feed | Фильтры, новостные карточки и диалог, формы, состояния |
| Projects | Общий PageHeader с CTA; dashboard/my/subscriptions/invites/all; карточки; формы создания/редактирования и их шаги; приглашения; вакансии проекта |
| Vacancies | PageHeader и Tabs, списки, карточки, фильтры, формы и диалог отклика, статусы |
| Programs | PageHeader, список и карточки, заявка, команда, оценка эксперта, таблицы и пагинация аналитики |
| Courses | PageHeader, карточки и availability Badge, задания с radio/checkbox/файлами, загрузка/ошибки/результаты |
| Members | PageHeader, фильтры и их диалог, карточки, состояния |
| Profile | PageHeader с длинным ФИО, вкладки редактирования, формы, приглашения |
| Auth/Onboarding/Office shell | Общие поля, действия, состояния, drawer; сохранены формы и переходы |
| Дополнительные widgets | Чат, новости, загрузка файлов, region/skills selectors; канбан адаптеры сохранены для совместимости |

## Проверки

| Проверка | Результат | Данные |
| --- | --- | --- |
| Production build | Успешно | [build-prod.log](build-prod.log) |
| Полный Vitest | ${tests} тестов, ${testFiles} файлов — успешно | [unit-tests.log](unit-tests.log) |
| Финальные изменения layouts | ${targetedTests} тестов затронутых компонентов — успешно | [filters/cards](targeted-tests.log), [profile/members/region](targeted-layout-tests.log) |
| ESLint | 0 ошибок, 6 прежних warnings | [eslint.log](eslint.log) |
| Stylelint | 0 ошибок | [stylelint.log](stylelint.log) |
| Аудит источников | ${summary.canonicalComponents} канонических компонентов; нет дублей и hex/rgb/hsl цветов в component SCSS | [audit.json](audit.json) |
| Browser matrix | ${rows.length} измерений: ${routes.length} URL/состояний форм × ${widths.length} ширин; нет overflow/pageerror/console.error | [browser-results.json](browser-results.json) |
| Пользовательские сценарии | ${flows.length} запусков: 12 сценариев × 320/390 px — успешно | [flows-results.json](flows-results.json) |
| Геометрия действий | ${geometry.length} проверок: 12 экранов × 320/390/1440 px; цели ≥44 px, CTA не обрезаны, menu icon не сжат | [ui-check.json](ui-check.json) |
| Скриншоты | ${before.length} пар до/после, ${before.length + after.length} файлов | Таблица ниже |

Ширины матрицы: ${widths.join(", ")} px. После финальной визуальной проверки дополнительно перепроверены 12 основных экранов на всех 16 ширинах, геометрия действий и сценарий редактирования профиля; итоговые данные хранят последние результаты без двойного подсчёта.

Функциональные сценарии: регистрация, вход/drawer, профиль/select/datepicker/autocomplete/сохранение, заявка/команда/подтверждение, экспертная оценка, отклик с файлом, создание проекта/принятие отклика, прохождение курса, onboarding, альтернативные виды заданий, длинный контент/валидация/загрузка/ошибки и аналитика/подсказки. Запросы перехватываются синтетическими fixtures.

Дополнительные [скриншоты форм и диалогов](screenshots/flows/) сняты в проверках UI Kit. Визуальная проверка основных экранов выполнена на 320/390/1440 px. Скриншоты до — responsive baseline \`bc4940c5\`, после — финальный UI Kit; данные и размеры совпадают.

| Экран | 320 px | 390 px | 1440 px |
| --- | --- | --- | --- |
${screenshotRows}

## Известные ограничения

- Chrome automation использует синтетический backend. Доставка писем, сохранение в реальной базе, реальные WebSocket и права конкретного аккаунта не проверялись.
- Физические Safari iOS и Chrome Android, системные file/date pickers и экранная клавиатура требуют проверки на устройствах. Viewport/touch эмуляция их не заменяет.
- Некоторые внешние изображения fixtures недоступны; это видно и на baseline, и после изменений. Layout проверен с теми же данными.
- В production build остаются прежние предупреждения Sass \`@import\`, CommonJS и budgets. ESLint сообщает шесть прежних unused-disable warnings.
- Доменный контент карточек, графики, учебные задания и специальные блоки диалогов сохраняют свои layouts поверх общих tokens/foundation. Канбан остаётся отключён существующими маршрутами; его адаптеры проверены сборкой и unit suite, без изменения доступности раздела.

## Воспроизведение

Команды build/unit/lint и настройка Playwright описаны в [UI-KIT.md](UI-KIT.md). Запустить production preview через \`node docs/responsive/serve.cjs\`, затем batch проверки \`browser-check.cjs\`: mobile (320/360/375/390/430/749/750), tablet (768/820/999/1000/1024/1280), desktop (1001/1440/1920) без \`RESPONSIVE_ROUTES\`. Дополнительные projects/main batches используют все 16 ширин и пять/двенадцать маршрутов из соответствующих JSON. \`RESPONSIVE_OUTPUT\` задаётся как \`../ui-kit/browser-{batch}.json\`, \`RESPONSIVE_SCREENSHOTS='../ui-kit/screenshots/matrix'\`; пути относятся к \`docs/responsive\`.

Для полного flow-check используются \`RESPONSIVE_FLOW_OUTPUT='../ui-kit/flows.json'\`, \`RESPONSIVE_SCREENSHOTS='../ui-kit/screenshots/flows'\`, без \`RESPONSIVE_FLOWS\`. Повторная проверка редактора: \`RESPONSIVE_FLOWS='profile-controls'\` и \`RESPONSIVE_FLOW_OUTPUT='../ui-kit/flows-layout.json'\`.

После browser-проверок: \`node docs/ui-kit/ui-check.cjs\`, \`node docs/ui-kit/screenshots.cjs after\`, \`node docs/ui-kit/audit.cjs\`, \`node docs/ui-kit/report.cjs\`. Report проверяет полноту матрицы, успех сценариев и соответствие пар скриншотов.

## Изменённые HTML-шаблоны

${templateList}

Удалены дублирующие HTML/SCSS для: ${removed.map(file => `\`${file}\``).join(", ")}. TypeScript импорты совместимы через реэкспорт/адаптер.
`;
fs.writeFileSync(path.join(directory, "REPORT.md"), report);
console.log(JSON.stringify(summary, null, 2));
