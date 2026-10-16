/** @format */

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), "utf8"));
const runs = [read("browser-results.json")];
const byKey = new Map();
for (const run of runs) for (const row of run.rows) byKey.set(`${row.width}:${row.route}`, row);
const rows = [...byKey.values()].sort(
  (a, b) => a.width - b.width || a.route.localeCompare(b.route),
);
const requests = [
  ...new Map(
    runs.flatMap(run => run.requests).map(request => [JSON.stringify(request), request]),
  ).values(),
];
const failed = row =>
  row.overflows.length || row.errors.length || row.pageWidth > row.width + 1 || !row.text.trim();
fs.writeFileSync(
  path.join(__dirname, "browser-results.json"),
  JSON.stringify({ rows, requests, failures: rows.filter(failed) }, null, 2),
);
const flows = new Map(read("flow-results.json").map(row => [`${row.width}:${row.name}`, row]));
fs.writeFileSync(
  path.join(__dirname, "flow-results.json"),
  JSON.stringify([...flows.values()], null, 2),
);

const inventory = read("routes.json");
const normalize = url => url.replace(/:[^/]+/g, "1").replace(/\/$/, "") || "/";
const status = (matching, widths) => {
  const relevant = matching.filter(row => widths.includes(row.width));
  if (!relevant.length) return "—";
  return relevant.some(failed) ? "FAIL" : "OK";
};
const fix = route => {
  if (route.includes("/auth")) return "Контейнер, динамическая высота, формы, иллюстрации";
  if (route.includes("/error")) return "Убрана фиксированная ширина 580 px";
  if (route.includes("onboarding"))
    return "Одна колонка, высота, popup; устранён цикл черновика шага 1";
  if (route.includes("/edit")) return "Поля, действия, горизонтальные tabs, validation, диалоги";
  if (route.includes("/analytics"))
    return "Существующие mobile cards таблиц, viewport диалогов и tooltip";
  if (route.includes("/program")) return "Карточки, роли на mobile, фильтры, рейтинг и диалоги";
  if (route.includes("/projects")) return "Карточки, команда, popup, детали; загрузка dashboard";
  if (route.includes("/profile")) return "Детали, новости, перенос длинного контента";
  if (route.includes("/courses")) return "Детали и урок, поля, CTA, доступный контент";
  if (route.includes("/vacancies")) return "Shared controls/dialogs; существующая mobile сетка";
  if (route.includes("/feed")) return "Фильтры, news form, shared cards/dialogs";
  return "Общая оболочка, drawer, controls, safe area";
};
const lines = [
  "# Checklist маршрутов PROCOLLAB",
  "",
  `Извлечено 63 объявления компонентов/оболочек и 9 redirects. Повторяющиеся оболочки не считаются отдельными URL. Проверены ${new Set(rows.map(row => row.route)).size} конкретных URL/состояний формы на контрольных ширинах 320–1920 px. Всего ${rows.length} измерений; ошибок: ${rows.filter(failed).length}. Дополнительные размеры возле breakpoint: ${[...new Set(rows.map(row => row.width))].filter(width => [749, 750, 999, 1000, 1001].includes(width)).join(", ") || "не запускались"}.`,
  "",
  "OK: компонент присутствует в DOM подходящего URL, видимое содержимое непустое, отсутствуют внешние переполнения, расширение страницы и ошибки браузера. Для plain-text и portal страниц host может не иметь собственной геометрии. Это проверка Chrome с синтетическим API. ‘—’ означает отсутствие отдельного экрана или недостижимую декларацию; пояснения ниже. Контент со скроллом внутри tabs/списка/диалога допускается.",
  "",
  "| Route / компонент | Desktop 1280–1920 | Tablet 768–1024 | 390 px | 320 px | Проблемы / исправление |",
  "| --- | --- | --- | --- | --- | --- |",
];
for (const entry of inventory.filter(entry => entry.component)) {
  const route = normalize(entry.route);
  let selector;
  if (entry.componentSource)
    selector = fs
      .readFileSync(path.join(root, entry.componentSource), "utf8")
      .match(/selector:\s*["']([^"']+)["']/)?.[1];
  const matching = rows.filter(
    row =>
      (row.actualPath === route || row.actualPath.startsWith(route === "/" ? "/" : route + "/")) &&
      (!selector || row.rendered.includes(selector)),
  );
  const notes = matching.length ? fix(route) : "Декларация/redirect: см. пояснения";
  lines.push(
    `| \`${entry.route}\` ${entry.component} | ${status(matching, [1280, 1440, 1920])} | ${status(matching, [768, 820, 1024])} | ${status(matching, [390])} | ${status(matching, [320])} | ${notes} |`,
  );
}
lines.push(
  "",
  "## Пояснения",
  "",
  "- `/auth/verification` выполняет подтверждение и переход; отдельный устойчивый UI не предусмотрен.",
  "- Вторые декларации `/office/courses/lesson/:id` и `/office/courses/lesson/:id/results` перекрыты первым lazy-модулем `courses`. Браузер подтверждает переход в `/office/courses/all`. Рабочие адреса — `/office/courses/:courseId/lesson/:lessonId`.",
  "- Экран результатов урока проверен с завершённым уроком; также пройден переход к результатам после отправки ответа.",
  "- Root и layout проверены через дочерние экраны. Redirects проверяются как переходы, не как самостоятельные страницы.",
  "- В Angular router нет интерфейса staff/superuser/admin и CRUD мероприятий. Самостоятельные chats отключены в office.routes; route чата проекта проверен, но его CTA помечен продуктом как недоступный. Новые routes/permissions не добавлены.",
  "",
  "## Функциональные проверки 320 / 390",
  "",
  "| Сценарий | 320 | 390 |",
  "| --- | --- | --- |",
);
for (const name of [...new Set([...flows.values()].map(row => row.name))])
  lines.push(
    `| ${name} | ${flows.get("320:" + name)?.passed ? "OK" : "FAIL"} | ${flows.get("390:" + name)?.passed ? "OK" : "FAIL"} |`,
  );
fs.writeFileSync(path.join(__dirname, "CHECKLIST.md"), lines.join("\n") + "\n");
console.log(
  JSON.stringify({
    measurements: rows.length,
    browserFailures: rows.filter(failed).length,
    flows: flows.size,
    flowFailures: [...flows.values()].filter(row => !row.passed).length,
  }),
);
