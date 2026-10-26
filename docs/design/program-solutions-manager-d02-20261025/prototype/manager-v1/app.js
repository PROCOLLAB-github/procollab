/**
 * D02 review prototype. Synthetic data only; no authentication or API requests.
 *
 * @format
 */

const $ = selector => document.querySelector(selector);
const esc = value =>
  String(value ?? "").replace(
    /[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const icon = name =>
  `<span class="icon" aria-hidden="true">${window.prototypeIcons[name] || ""}</span>`;
const params = new URLSearchParams(location.search);
let format = params.get("format") || "kch",
  screen = params.get("screen") || "analytics",
  scenario = params.get("state") || "ready";
const names = [
  "Сервис поддержки студентов",
  "Город без барьеров",
  "Навигатор наставников",
  "Лаборатория практики",
];
const people = [
  ["Иван", "Токарев"],
  ["Мария", "Климова"],
  ["Анна", "Петрова"],
];
const works = names.map((name, i) => ({
  id: 301 + i,
  name,
  caseName: ["Образование", "Городская среда", "Образование", null][i],
  captain: ["Иван Токарев", "Дарья Соколова", "Александр Иванов", "Елена Морозова"][i],
  teamSize: [3, 2, 2, 1][i],
  submitted: i < 3,
}));
const originalAssignments = [
  { id: 801, workId: 301, expert: 0, completed: true, value: 0 },
  { id: 802, workId: 301, expert: 1, completed: false, value: null },
  { id: 803, workId: 302, expert: 0, completed: true, value: 8 },
  { id: 804, workId: 302, expert: 2, completed: true, value: 7 },
];
let assignments = originalAssignments.map(row => ({ ...row }));
const filterState = { solutions: newFilter(), results: newFilter() };
let modal = null,
  lastTrigger = null,
  noticeTimer = null;
const dialog = $("#manager-dialog");
function newFilter() {
  return { draft: "", search: "", submission: "all", fieldId: "", answer: "all", expanded: false };
}
const competitive = () => format !== "noncompetitive";
const effectiveAssignments = () => (scenario === "empty" ? [] : assignments);
const distributed = () => competitive() && scenario !== "open-mode";
const activeWorks = () =>
  scenario === "empty" ? [] : works.filter(work => !managerAdmin.isArchived(work.id));
function workName(work) {
  return scenario === "long" && work.id === 301
    ? "Сервис поддержки студентов и молодых специалистов при подготовке к профессиональным конкурсам и первому трудоустройству"
    : work.name;
}
function fields() {
  return [
    { id: 2, label: "Краткое описание", type: "textarea", required: true },
    ...(format === "kch"
      ? [{ id: 10, label: "Презентация PDF", type: "file", required: true }]
      : [{ id: 11, label: "Репозиторий", type: "url", required: true }]),
    {
      id: 12,
      label: format === "kch" ? "Видео решения" : "Демонстрация",
      type: "url",
      required: false,
    },
    { id: 30, label: "Размер пилота", type: "number", required: false },
    { id: 31, label: "Разрешение на демонстрацию", type: "checkbox", required: false },
    {
      id: 32,
      label: format === "kch" ? "План доработки" : "Инструкция запуска",
      type: "textarea",
      required: true,
    },
  ];
}
function applicable(work, field) {
  return !competitive() || field.id !== 32 || work.id >= 303;
}
function answer(work, id) {
  if (scenario === "ready-draft" && work.id === 304)
    return {
      2: "Готовые материалы решения.",
      10: "Презентация.pdf",
      11: "example.com/repository",
      12: null,
      30: 0,
      31: false,
      32: "Порядок проверки решения.",
    }[id];
  const i = work.id - 301;
  return {
    2: "Сервис помогает участникам найти материалы, экспертов и команду для решения задачи.",
    10: i < 3 ? "Презентация.pdf" : null,
    11: i < 3 ? "example.com/repository" : null,
    12: i === 1 ? "example.com/demo" : null,
    30: i === 0 ? 0 : i === 3 ? null : 120,
    31: i === 0 ? false : i === 3 ? null : true,
    32: i === 2 ? "Описаны шаги проверки и развития решения." : null,
  }[id];
}
const filled = value =>
  value !== null && value !== undefined && !(typeof value === "string" && !value.trim());
function evaluation(work) {
  if (!competitive()) return "not_applicable";
  if (!work.submitted) return "not_submitted";
  const own = effectiveAssignments().filter(row => row.workId === work.id),
    done = own.filter(row => row.completed).length;
  if (!distributed()) return done ? "evaluated" : "awaiting_evaluation";
  return done >= 2 ? "evaluated" : done ? "partially_evaluated" : "awaiting_evaluation";
}
function status(work) {
  if (managerAdmin.isArchived(work.id)) return ["Архив", "muted"];
  const state = evaluation(work);
  return {
    not_applicable: ["Сохранено", "muted"],
    not_submitted: ["Не сдано", "muted"],
    awaiting_evaluation: ["Ожидает оценки", "muted"],
    partially_evaluated: ["Частично оценено", "warning"],
    evaluated: ["Оценено", "good"],
  }[state];
}
function statusHtml(work) {
  const [label, tone] = status(work);
  return `<span class="status status--${tone}">${label}</span>`;
}
function persist() {
  history.replaceState(null, "", `?screen=${screen}&format=${format}&state=${scenario}`);
}
function updateControls() {
  if (!["kch", "hack", "noncompetitive"].includes(format)) format = "kch";
  if (!["analytics", "solutions", "evaluation", "results"].includes(screen)) screen = "analytics";
  if (!$("#scenario").querySelector(`option[value="${scenario}"]`)) scenario = "ready";
  $("#program-format").value = format;
  $("#scenario").value = scenario;
  $("#program-name").textContent = {
    kch: "Кейс-чемпионат PROCOLLAB",
    hack: "Хакатон PROCOLLAB",
    noncompetitive: "Практикум PROCOLLAB",
  }[format];
  document
    .querySelectorAll("[data-screen]")
    .forEach(button =>
      button.setAttribute("aria-current", button.dataset.screen === screen ? "page" : "false"),
    );
}
function showNotice(text) {
  clearTimeout(noticeTimer);
  $("#notice").textContent = text;
  $("#notice").hidden = false;
  noticeTimer = setTimeout(() => ($("#notice").hidden = true), 2400);
}
function exportMenu() {
  return `<details class="exports-menu"><summary class="icon-button" aria-label="Выгрузить данные программы" title="Выгрузить данные программы">${icon("download")}</summary><div class="exports-popup">${[
    ["program", "Вся программа"],
    ["solutions", "Все решения"],
    ...(competitive()
      ? [
          ["submitted", "Сданные решения"],
          ["scores", "Оценки решений"],
        ]
      : []),
  ]
    .map(([kind, label]) => `<button data-action="export" data-kind="${kind}">${label}</button>`)
    .join("")}</div></details>`;
}
function statePanel() {
  if (scenario === "loading")
    return `<section class="page-panel" aria-busy="true" aria-label="Загрузка данных"><p class="muted">Загружаем данные программы…</p><div class="skeleton"></div><div class="loading-panels"><div class="skeleton skeleton--large"></div><div class="skeleton skeleton--large"></div></div></section>`;
  if (scenario === "error")
    return `<section class="page-panel empty-state" role="alert"><h2>Не удалось загрузить данные</h2><p class="muted">Проверьте соединение и повторите попытку.</p><button class="secondary" data-action="retry">Повторить</button></section>`;
  if (scenario === "no-access")
    return `<section class="page-panel empty-state"><h2>Нет доступа к управлению программой</h2><p class="muted">Этот раздел доступен организаторам программы.</p></section>`;
  return null;
}
function metric(key, label, value, tip, ico) {
  return `<article class="summary-card" data-metric="${key}"><div class="summary-card__icon">${icon(ico)}</div><div class="summary-card__content"><h2 class="summary-card__label" title="${esc(tip)}">${key === "participants" ? `<button class="link" data-action="admin-people">${label}</button>` : label}</h2><strong class="summary-card__value">${value === null ? "—" : value}</strong></div></article>`;
}
function funnelLine(label, value, max) {
  return `<div class="funnel-line"><span>${label}</span><span class="bar-track"><span class="bar-value" style="display:block;width:${max ? (value / max) * 100 : 0}%"></span></span><strong>${value}</strong></div>`;
}
function coverageRows() {
  return fields()
    .map(field => {
      const relevant = activeWorks().filter(work => applicable(work, field)),
        answered = relevant.filter(work => filled(answer(work, field.id))).length;
      return `<tr><td class="name-cell">${esc(field.label)}<span class="subtext">${field.required ? "Обязательное поле" : "Необязательное поле"}</span></td><td data-label="Применимо">${relevant.length}</td><td data-label="Есть ответ">${answered}</td><td data-label="Нет обязательного">${field.required ? relevant.length - answered : "—"}</td></tr>`;
    })
    .join("");
}
function analyticsView() {
  const rows = activeWorks(),
    count = rows.length,
    submitted = rows.filter(row => row.submitted).length,
    done = rows.filter(row => evaluation(row) === "evaluated").length,
    total = effectiveAssignments().length,
    completed = effectiveAssignments().filter(row => row.completed).length;
  return `<div class="prototype-analytics"><section class="analytics">
  <header class="analytics__header"><div class="heading-row"><h2>Аналитика</h2>${exportMenu()}</div></header>
  <section class="summary" aria-label="Основные показатели">${metric("participants", "Участники", managerAdmin.registrationCount(), "Уникальные зарегистрированные участники программы.", "person")}${metric("solutions", "Решения", count, "Заявки команд этой программы.", "folder")}${metric("submitted", "Сдано", competitive() ? submitted : null, competitive() ? "Решения с подтвержденной сдачей." : "В этой программе сдача не предусмотрена.", "analytics-submitted")}${metric("team", "Участников / решение", count ? Math.round((managerAdmin.registrationCount() / count) * 100) / 100 : 0, "Число зарегистрированных участников, деленное на число решений программы.", "analytics-team")}</section>
  <section class="analytics-grid analytics-grid--priority"><article class="attention"><h2>Требует внимания</h2>${count ? `<ul class="attention-links"><li><button data-action="people" data-kind="without-visit"><span>Участники еще не заходили на платформу</span><strong>${managerAdmin.withoutVisit()}</strong></button></li><li><button data-action="people" data-kind="without-team"><span>Участники без команды</span><strong>${managerAdmin.registrationCount() - managerAdmin.teamCount()}</strong></button></li>${competitive() ? `<li><button data-action="waiting"><span>Решения ожидают оценивания</span><strong>${rows.filter(row => ["awaiting_evaluation", "partially_evaluated"].includes(evaluation(row))).length}</strong></button></li>` : ""}</ul>` : '<p class="inline-note">Ничего не требует внимания</p>'}</article>
  <article class="analytics-card"><h2>Сроки программы</h2><ul class="dates-list"><li><span>Регистрация</span><time>3 ноября, 18:00</time></li>${competitive() ? "<li><span>Прием решений</span><time>3 ноября, 18:00</time></li><li><span>Оценивание</span><time>9 ноября, 18:00</time></li>" : "<li><span>Завершение программы</span><time>15 ноября, 18:00</time></li>"}</ul></article></section>
  <section class="analytics-grid"><article class="analytics-card"><h2>Воронка участников</h2><div class="funnel-bars">${funnelLine("Регистрация", managerAdmin.registrationCount(), 12)}${funnelLine("Заходили на платформу", managerAdmin.registrationCount() - managerAdmin.withoutVisit(), 12)}${funnelLine("Вступили в команду", managerAdmin.teamCount(), 12)}</div></article><article class="analytics-card"><h2>${competitive() ? "Воронка решений" : "Сохраненные решения"}</h2><div class="funnel-bars">${funnelLine("Создано", count, 4)}${competitive() ? funnelLine("Сдано", submitted, 4) + funnelLine("Оценено", done, 4) : '<p class="inline-note">Участники сохраняют материалы без отдельной сдачи.</p>'}</div></article></section>
  ${competitive() ? `<section class="analytics-grid analytics-grid--evaluation"><article class="analytics-card" ${distributed() ? "" : 'style="grid-column:1/-1"'}><div class="heading-row"><div><h2>Ход оценивания</h2><p class="muted">${distributed() ? "Распределенное оценивание" : "Открытое оценивание"}</p></div>${distributed() ? '<button class="secondary" data-action="assignments">Все назначения</button>' : ""}</div>${distributed() && count ? `<div class="progress-track" role="img" aria-label="Выполнено ${completed} из ${total} назначений"><span style="width:${(completed / total) * 100}%"></span></div><div class="metric-links"><button class="link" data-action="assignments" data-scope="completed"><strong>${completed}</strong>Выполнено</button><button class="link" data-action="assignments" data-scope="pending"><strong>${total - completed}</strong>Ожидает оценки</button></div>` : `<p class="inline-note">${count ? "Назначения в открытом режиме не применяются. Эксперты выбирают сданные решения программы." : "Назначений пока нет."}</p>`}</article>${distributed() ? '<article class="analytics-card"><h2>Задержки экспертов</h2><p class="inline-note">Задержек пока нет. Контроль незавершенных назначений включается за пять дней до окончания оценивания.</p></article>' : ""}</section>` : ""}
  <section class="analytics-bottom"><article class="analytics-card"><h2>Кейсы</h2><div class="cases-list"><div class="case-heading ${competitive() ? "" : "case-data--saved"}"><span>Кейс</span><span>Решения</span>${competitive() ? "<span>Сдано</span>" : ""}<span>Участники</span></div>${[
    "Образование",
    "Городская среда",
    null,
  ]
    .map(name => {
      const group = rows.filter(row => row.caseName === name);
      return `<button class="case-data ${competitive() ? "" : "case-data--saved"}" data-action="case" data-case="${esc(name ?? "without-case")}"><span>${esc(name ?? "Без выбранного кейса")}</span><strong>${group.length}</strong>${competitive() ? `<span>${group.filter(row => row.submitted).length}</span>` : ""}<span>${group.reduce((sum, row) => sum + row.teamSize, 0)}</span></button>`;
    })
    .join(
      "",
    )}</div></article><article class="analytics-card"><h2>Активность</h2><p class="muted">За последние 30 дней</p><div class="activity-bars" role="img" aria-label="Регистрации за последние 30 дней">${[12, 24, 36, 18, 55, 30, 64, 42, 28, 60, 50, 26].map(height => `<span style="height:${count ? height : 1}px"></span>`).join("")}</div><div class="activity-labels"><span>26 сентября</span><span>25 октября</span></div><p class="inline-note" style="margin-top:12px">Регистрации${competitive() ? " и сдачи решений" : ""}</p></article></section>
  <section class="analytics-card"><div class="heading-row"><h2>Заполнение полей решения</h2><button class="secondary" data-action="solutions">Открыть решения</button></div><p class="inline-note">${competitive() ? "Для сданной работы учитывается форма на момент сдачи. Новое поле не становится пропуском в ранее сданном решении." : "Показано заполнение текущей формы. Ответы можно сохранять без отдельной сдачи."}</p><div class="table-wrap"><table class="data-table coverage-table"><thead><tr><th>Поле</th><th>Применимо</th><th>Есть ответ</th><th>Нет обязательного ответа</th></tr></thead><tbody>${coverageRows()}</tbody></table></div></section>
  <section class="analytics-card"><h2>Регионы участников</h2>${[
    ["Москва", 6],
    ["Татарстан", 4],
    ["Свердловская область", 2],
  ]
    .map(([name], index) => {
      const value = managerAdmin.regionCount(index);
      return `<div class="region-row"><span>${name}</span><span class="bar-track"><span class="bar-value" style="display:block;width:${count ? (value / 6) * 100 : 0}%"></span></span><strong>${value}</strong></div>`;
    })
    .join("")}</section>
  </section></div>`;
}
function filterHtml(filter, { results = false } = {}) {
  const filters = fields();
  return `<div class="toolbar"><form class="search-form" data-form="search"><input type="search" name="search" aria-label="Поиск по названию решения" placeholder="Поиск по названию решения" value="${esc(filter.draft)}" maxlength="200"><button class="secondary" type="submit">Найти</button></form><div class="toolbar-actions"><button class="secondary" data-action="filters" aria-expanded="${filter.expanded}">${icon("filter")}Фильтры</button><button class="secondary" data-action="export-found">${icon("download")}Выгрузить найденные</button></div></div>
  <section class="filters" ${filter.expanded ? "" : "hidden"} aria-label="Фильтры решений">
  ${competitive() ? `<label class="field">Сдача<select name="submission"><option value="all" ${filter.submission === "all" ? "selected" : ""}>Все решения</option><option value="submitted" ${filter.submission === "submitted" ? "selected" : ""}>Сдано</option>${results ? "" : `<option value="not_submitted" ${filter.submission === "not_submitted" ? "selected" : ""}>Не сдано</option>`}</select></label>` : ""}
  ${
    results
      ? ""
      : `<label class="field">Поле решения<select name="fieldId"><option value="">Без фильтра по полю</option>${filters
          .filter(field => field.id !== 2)
          .map(
            field =>
              `<option value="${field.id}" ${String(field.id) === filter.fieldId ? "selected" : ""}>${esc(field.label)}</option>`,
          )
          .join(
            "",
          )}</select></label><label class="field">Ответ на поле<select name="answer" ${filter.fieldId ? "" : "disabled"}>${[
          ["all", "Любое состояние"],
          ["present", "Есть ответ"],
          ["missing", "Нет ответа"],
          ["not_applicable", "Неприменимо"],
        ]
          .map(
            ([key, label]) =>
              `<option value="${key}" ${filter.answer === key ? "selected" : ""}>${label}</option>`,
          )
          .join(
            "",
          )}</select></label><p class="inline-note filters-note">«Неприменимо» означает, что поля не было в форме при сдаче. Ответы 0 и «Нет» считаются заполненными.</p>`
  }
  <button class="link filter-reset" data-action="reset-filters">Сбросить фильтры</button></section>`;
}
function filteredRows(filter, base = activeWorks()) {
  return base.filter(work => {
    if (filter.search && !workName(work).toLowerCase().includes(filter.search.toLowerCase()))
      return false;
    if (
      competitive() &&
      filter.submission !== "all" &&
      (filter.submission === "submitted") !== work.submitted
    )
      return false;
    if (filter.fieldId && filter.answer !== "all") {
      const field = fields().find(row => row.id === Number(filter.fieldId));
      if (field) {
        const applies = applicable(work, field),
          has = applies && filled(answer(work, field.id));
        if (filter.answer === "not_applicable") return !applies;
        if (!applies) return false;
        if (filter.answer === "present") return has;
        if (filter.answer === "missing") return !has;
      }
    }
    return true;
  });
}
function workTable(rows, { result = false } = {}) {
  return rows.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>${result ? "Место" : "Решение"}</th>${result ? "<th>Решение</th>" : ""}<th>Кейс</th><th>${result ? "Балл" : "Капитан"}</th><th>${result ? "Оценки" : "Состояние"}</th><th></th></tr></thead><tbody>${rows
        .map(work => {
          const count = effectiveAssignments().filter(
            row => row.workId === work.id && row.completed,
          ).length;
          return `<tr>${result ? `<td data-label="Место">${work.id === 302 ? "1" : "—"}</td>` : ""}<td class="name-cell"><button class="link" data-action="solution" data-id="${work.id}" data-focus="work-${work.id}">${esc(workName(work))}</button>${!result ? `<span class="subtext">${work.teamSize} ${work.teamSize === 1 ? "участник" : work.teamSize < 5 ? "участника" : "участников"}</span>` : ""}</td><td data-label="Кейс">${esc(work.caseName ?? "Не выбран")}</td><td data-label="${result ? "Балл" : "Капитан"}">${result ? (work.id === 302 ? "7,5" : work.id === 301 ? "0" : "—") : esc(work.captain)}</td><td data-label="${result ? "Оценки" : "Состояние"}">${result ? `${count} из 2` : statusHtml(work)}</td><td data-label="Действие"><button class="link" data-action="${result ? "work-scores" : "solution"}" data-id="${work.id}" data-focus="action-${work.id}">${result ? "Посмотреть оценки" : "Открыть"}</button></td></tr>`;
        })
        .join("")}</tbody></table></div>`
    : `<div class="empty-state"><h3>${scenario === "empty" ? "Решений пока нет" : "Решения не найдены"}</h3><p class="muted">${scenario === "empty" ? "Здесь появятся заявки команд этой программы." : "Измените запрос или сбросьте фильтры."}</p>${scenario === "empty" ? "" : '<button class="secondary" data-action="reset-filters">Сбросить фильтры</button>'}</div>`;
}
function solutionList() {
  const filter = managerAdmin.listFilter(),
    rows = filteredRows(filter, managerAdmin.listWorks());
  return `<section class="page-panel"><div class="heading-row"><div><h2>Решения программы</h2><p class="muted">В списке: ${managerAdmin.listWorks().length}${competitive() ? "" : ". Сохраненные материалы без отдельной сдачи."}</p></div>${managerAdmin.isArchiveScope() ? "" : exportMenu()}</div>${managerAdmin.listToolbar()}${managerAdmin.isArchiveScope() ? managerAdmin.archiveFilters(filter) : filterHtml(filter)}${managerAdmin.emptyArchive() ? '<div class="empty-state"><h3>Архив пока пуст</h3><p class="muted">Здесь появятся решения, снятые с участия или перемещенные в архив организатором.</p></div>' : workTable(rows)}<div class="pagination"><span>${rows.length ? `1–${rows.length} из ${rows.length}` : "0 из 0"}</span><div class="actions"><button class="quiet" disabled>Назад</button><button class="quiet" disabled>Далее</button></div></div></section>`;
}
function resultsView() {
  if (!competitive())
    return `<section class="page-panel empty-state"><h2>Сдача и конкурсное оценивание не предусмотрены</h2><p class="muted">Сохраненные материалы участников доступны в разделе «Решения».</p><button class="secondary" data-action="solutions">Открыть решения</button></section>`;
  const filter = filterState.results,
    rows = filteredRows(
      filter,
      activeWorks().filter(work => work.submitted),
    );
  return `<div class="prototype-results"><section class="results"><div class="heading-row"><h2>Рейтинг решений</h2><div class="actions"><button class="icon-button" aria-label="Как считается балл" data-action="formula">${icon("hint")}</button>${exportMenu()}</div></div><p class="inline-note">Место появляется после необходимого числа завершенных оценок. Фильтры не меняют места в общем рейтинге.</p>${filterHtml(filter, { results: true })}${workTable(rows, { result: true })}</section></div>`;
}
function evaluationView() {
  if (!competitive()) return resultsView();
  return `<section class="page-panel"><div class="heading-row"><div><h2>Оценивание решений</h2><p class="muted">${distributed() ? "Распределенное оценивание" : "Открытое оценивание"}</p></div>${distributed() ? `<button class="primary" data-action="allocation" ${activeWorks().some(work => work.submitted) ? "" : "disabled"}>Распределить решения</button>` : ""}</div><p class="inline-note">${distributed() ? "На решение необходимо 2 завершенные оценки. Сохраненные оценки и соответствующие назначения защищены." : "Эксперты выбирают сданные решения программы. Персональные назначения не требуются."}</p><table class="data-table"><thead><tr><th>Эксперт</th><th>Назначено</th><th>Выполнено</th><th></th></tr></thead><tbody>${people.map((person, i) => `<tr><td class="name-cell">${person.join(" ")}</td><td data-label="Назначено">${distributed() ? effectiveAssignments().filter(row => row.expert === i).length : "—"}</td><td data-label="Выполнено">${distributed() ? effectiveAssignments().filter(row => row.expert === i && row.completed).length : "—"}</td><td data-label="Действие"><button class="link" data-action="assignments" data-expert="${i}">${distributed() ? "Посмотреть назначения" : "Посмотреть оценки"}</button></td></tr>`).join("")}</tbody></table></section>`;
}
function renderPage() {
  updateControls();
  const state = statePanel();
  $("#manager-main").innerHTML =
    state ||
    (screen === "analytics"
      ? analyticsView()
      : screen === "solutions"
        ? solutionList()
        : screen === "results"
          ? resultsView()
          : evaluationView());
  persist();
}
function currentFilter() {
  return modal?.filters ?? (screen === "results" ? filterState.results : managerAdmin.listFilter());
}
function openModal(next) {
  lastTrigger = document.activeElement;
  modal = next;
  renderModal();
  dialog.showModal();
  $("#dialog-title").focus();
}
function openInner(next) {
  next.back = modal;
  next.backFocus = document.activeElement?.dataset.focus;
  modal = next;
  renderModal();
  $("#dialog-title").focus();
}
function closeModal() {
  if (modal?.busy) return;
  dialog.close();
  modal = null;
  if (lastTrigger?.isConnected) lastTrigger.focus();
  else document.querySelector('[data-screen][aria-current="page"]')?.focus();
}
function modalHeader(title, subtitle = "") {
  return `${modal?.back ? '<button class="link modal-back" data-action="back">Назад</button>' : ""}<header class="modal-header"><div><h2 id="dialog-title" tabindex="-1">${esc(title)}</h2>${subtitle ? `<p class="muted">${esc(subtitle)}</p>` : ""}</div><button class="icon-button close-button" type="button" aria-label="Закрыть окно" data-action="close">×</button></header>`;
}
function renderModal() {
  if (!modal) return;
  const adminView = managerAdmin.renderModal();
  if (adminView) {
    dialog.innerHTML =
      modalHeader(adminView.title, adminView.subtitle) +
      `<div class="modal-body">${adminView.body}</div>`;
    if (modal.busy)
      dialog
        .querySelectorAll(".close-button,.modal-back")
        .forEach(button => (button.disabled = true));
    return;
  }
  let title = "",
    subtitle = "",
    body = "";
  if (["case", "waiting", "list"].includes(modal.view)) {
    title =
      modal.view === "case"
        ? modal.caseName
          ? "Кейс: " + modal.caseName
          : "Без выбранного кейса"
        : modal.view === "waiting"
          ? "Решения ожидают оценивания"
          : "Решения программы";
    const base = activeWorks().filter(work =>
        modal.view === "case"
          ? work.caseName === modal.caseName
          : modal.view === "waiting"
            ? ["awaiting_evaluation", "partially_evaluated"].includes(evaluation(work))
            : true,
      ),
      rows = filteredRows(modal.filters, base);
    body = `<div class="metrics-row"><span>Решения<strong>${base.length}</strong></span><span>Участники<strong>${base.reduce((n, w) => n + w.teamSize, 0)}</strong></span>${competitive() ? `<span>Сдано<strong>${base.filter(w => w.submitted).length}</strong></span>` : ""}</div>${filterHtml(modal.filters)}${workTable(rows)}<p class="muted">${rows.length ? `1–${rows.length} из ${rows.length}` : "0 из 0"}</p>`;
  } else if (["assignments", "work-scores"].includes(modal.view)) {
    title = modal.view === "work-scores" ? "Оценки решения" : "Назначения экспертов";
    let rows = effectiveAssignments().filter(row =>
      modal.workId
        ? row.workId === modal.workId
        : modal.expert !== undefined
          ? row.expert === modal.expert
          : true,
    );
    if (modal.scope === "completed") rows = rows.filter(row => row.completed);
    if (modal.scope === "pending") rows = rows.filter(row => !row.completed);
    subtitle = modal.workId ? workName(works.find(row => row.id === modal.workId)) : "";
    body = `<div class="modal-tabs" role="group" aria-label="Статус назначений">${[
      ["all", "Все"],
      ["completed", "Выполнены"],
      ["pending", "Ожидают оценки"],
    ]
      .map(
        ([key, label]) =>
          `<button data-action="assignment-scope" data-scope="${key}" aria-pressed="${(modal.scope ?? "all") === key}">${label}</button>`,
      )
      .join(
        "",
      )}</div><table class="data-table"><thead><tr><th>Решение</th><th>Эксперт</th><th>Статус</th><th></th></tr></thead><tbody>${rows.map(row => `<tr><td class="name-cell">${esc(workName(works.find(work => work.id === row.workId)))}</td><td data-label="Эксперт">${people[row.expert].join(" ")}</td><td data-label="Статус">${row.completed ? "Выполнено" : "Ожидает оценки"}</td><td data-label="Действие"><button class="link" data-action="score-detail" data-id="${row.id}" data-focus="assignment-${row.id}">Посмотреть оценку</button></td></tr>`).join("")}</tbody></table>${rows.length ? "" : '<div class="empty-state"><h3>Назначения не найдены</h3><p class="muted">При выбранном статусе назначений нет.</p></div>'}`;
  } else if (modal.view === "scores") {
    const row =
      assignments.find(item => item.id === modal.id) ?? managerAdmin.savedRating(modal.id);
    title = "Оценка решения";
    subtitle =
      workName(works.find(work => work.id === row.workId)) + " / " + people[row.expert].join(" ");
    body = `<p class="inline-note">${row.completed ? "Эксперт заполнил все критерии." : "Оценка еще не сохранена."}</p><div class="score-list"><section class="score-row"><h3>Качество решения, от 0 до 10</h3><strong>${row.completed ? row.value : "—"}</strong></section><section class="score-row"><h3>Работоспособность подтверждена</h3><strong>${row.completed ? (row.value === 0 ? "Нет" : "Да") : "—"}</strong></section><section class="score-row"><h3>Комментарий эксперта</h3><p>${row.completed ? (row.value === 0 ? "Прототип требует доработки перед демонстрацией." : "Решение соответствует задаче.") : "Комментарий не добавлен."}</p></section></div>`;
  } else if (modal.view === "allocation") {
    title = "Предпросмотр распределения";
    body = `<div class="allocation-summary"><p class="inline-note">Будут распределены сданные решения. Назначения с сохраненными оценками останутся на месте.</p><dl><dt>Сданных решений</dt><dd>3</dd><dt>Назначений с оценками, сохраняются</dt><dd>3</dd><dt>Новых назначений</dt><dd>${assignments.some(row => row.workId === 303) ? 0 : 2}</dd></dl><p class="muted">Необходимо 2 завершенные оценки на решение.</p><div class="actions"><button class="secondary" data-action="close">Отмена</button><button class="primary" data-action="apply-allocation" ${assignments.some(row => row.workId === 303) ? "disabled" : ""}>Применить распределение</button></div></div>`;
  } else if (modal.view === "export") {
    title = "Выгрузить данные";
    body = `<p>${esc(modal.label ?? "Будут выгружены найденные решения с учетом поиска и фильтров.")}</p><p class="muted">Данные будут доступны в файле Excel.</p><div class="actions"><button class="secondary" data-action="close">Отмена</button><button class="primary" data-action="prepare-export">Выгрузить</button></div>`;
  } else if (modal.view === "formula") {
    title = "Как считается балл";
    body =
      '<div class="answer-list"><p>Итоговый балл использует завершенные оценки экспертов и действующие критерии программы.</p><p class="muted">Незавершенная оценка не участвует в среднем. Нулевой балл и ответ «Нет» сохраняются. Место появляется после необходимого числа оценок; фильтры не пересчитывают общий рейтинг.</p></div>';
  } else if (modal.view === "reminder") {
    title = "Отправить напоминание";
    body = `<p>Получателей: ${modal.back?.kind === "without-visit" ? managerAdmin.withoutVisit() : managerAdmin.registrationCount() - managerAdmin.teamCount()}</p><p class="inline-note">${modal.back?.kind === "without-team" ? "Вы участвуете в программе PROCOLLAB, но пока не состоите в команде. Создайте решение или присоединитесь к команде." : "Вы зарегистрированы в программе PROCOLLAB. Зайдите на платформу, чтобы продолжить участие."}</p><div class="actions"><button class="secondary" data-action="back">Назад</button><button class="primary" data-action="send-reminder">Отправить напоминание</button></div>`;
  }
  dialog.innerHTML = modalHeader(title, subtitle) + `<div class="modal-body">${body}</div>`;
}
function refreshCurrent(focusName) {
  if (modal) renderModal();
  else renderPage();
  if (focusName)
    (modal ? dialog : $("#manager-main")).querySelector(`[name="${focusName}"]`)?.focus();
}
document.addEventListener("click", event => {
  const target = event.target.closest("button,[data-action]");
  if (!target) return;
  if (target.dataset.screen) {
    if (dialog.open) closeModal();
    screen = target.dataset.screen;
    renderPage();
    return;
  }
  const action = target.dataset.action;
  if (!action) return;
  if (managerAdmin.handleClick(target)) return;
  if (action === "close") {
    closeModal();
    return;
  }
  if (action === "back") {
    const previous = modal.back,
      focus = modal.backFocus;
    if (previous) {
      modal = previous;
      renderModal();
      if (focus) dialog.querySelector(`[data-focus="${focus}"]`)?.focus();
      else $("#dialog-title").focus();
    } else closeModal();
    return;
  }
  if (action === "retry") {
    $("#scenario").value = scenario = "ready";
    renderPage();
    return;
  }
  if (action === "solutions") {
    screen = "solutions";
    if (dialog.open) closeModal();
    renderPage();
    return;
  }
  if (action === "case") {
    openModal({
      view: "case",
      caseName: target.dataset.case === "without-case" ? null : target.dataset.case,
      filters: newFilter(),
    });
    return;
  }
  if (action === "waiting") {
    openModal({ view: "waiting", filters: newFilter() });
    return;
  }
  if (action === "people") {
    openModal({ view: "people", kind: target.dataset.kind });
    return;
  }
  if (action === "solution") {
    const next = { view: "solution", id: Number(target.dataset.id), tab: "solution" };
    modal ? openInner(next) : openModal(next);
    return;
  }
  if (action === "solution-tab") {
    modal.tab = target.dataset.tab;
    renderModal();
    dialog.querySelector(`[data-tab="${modal.tab}"]`)?.focus();
    return;
  }
  if (action === "assignments") {
    openModal({
      view: "assignments",
      scope: target.dataset.scope ?? "all",
      ...(target.dataset.expert !== undefined ? { expert: Number(target.dataset.expert) } : {}),
    });
    return;
  }
  if (action === "work-scores") {
    const next = { view: "work-scores", workId: Number(target.dataset.id), scope: "all" };
    modal ? openInner(next) : openModal(next);
    return;
  }
  if (action === "assignment-scope") {
    modal.scope = target.dataset.scope;
    renderModal();
    dialog.querySelector(`[data-scope="${modal.scope}"]`)?.focus();
    return;
  }
  if (action === "score-detail") {
    openInner({ view: "scores", id: Number(target.dataset.id) });
    return;
  }
  if (action === "allocation") {
    openModal({ view: "allocation" });
    return;
  }
  if (action === "apply-allocation") {
    if (!assignments.some(row => row.workId === 303))
      assignments.push(
        { id: 805, workId: 303, expert: 1, completed: false, value: null },
        { id: 806, workId: 303, expert: 2, completed: false, value: null },
      );
    closeModal();
    renderPage();
    showNotice("Распределение применено в макете. Добавлено 2 назначения.");
    return;
  }
  if (action === "formula") {
    openModal({ view: "formula" });
    return;
  }
  if (action === "material") {
    showNotice("Пример материала в макете. В рабочем интерфейсе откроется файл или ссылка.");
    return;
  }
  if (action === "filters") {
    const filter = currentFilter();
    filter.expanded = !filter.expanded;
    refreshCurrent();
    (modal ? dialog : $("#manager-main")).querySelector('[data-action="filters"]')?.focus();
    return;
  }
  if (action === "reset-filters") {
    const filter = currentFilter();
    Object.assign(filter, newFilter());
    refreshCurrent("search");
    return;
  }
  if (action === "export" || action === "export-found") {
    const next = {
      view: "export",
      label:
        action === "export-found"
          ? "Будут выгружены все найденные решения с учетом поиска и фильтров."
          : {
              program: "Вся программа: решения, команды, поля, ответы, назначения и оценки.",
              solutions: "Все решения программы с материалами и принятым составом.",
              submitted: "Сданные решения с зафиксированными материалами.",
              scores: "Сохраненные оценки решений.",
            }[target.dataset.kind],
    };
    modal ? openInner(next) : openModal(next);
    return;
  }
  if (action === "prepare-export") {
    closeModal();
    showNotice("Пример состояния: файл Excel подготовлен. Макет не выгружает реальные данные.");
    return;
  }
  if (action === "reminder-preview") {
    openInner({ view: "reminder" });
    return;
  }
  if (action === "send-reminder") {
    closeModal();
    showNotice("Пример состояния: напоминание отправлено. Реальные письма не отправляются.");
    return;
  }
});
document.addEventListener("input", event => {
  if (event.target.name === "search") currentFilter().draft = event.target.value;
});
document.addEventListener("submit", event => {
  if (event.target.dataset.form === "search") {
    event.preventDefault();
    currentFilter().search = currentFilter().draft.trim();
    refreshCurrent("search");
  }
});
document.addEventListener("change", event => {
  const name = event.target.name;
  if (["submission", "fieldId", "answer"].includes(name)) {
    const filter = currentFilter();
    filter[name] = event.target.value;
    if (name === "fieldId" && !filter.fieldId) filter.answer = "all";
    refreshCurrent(name);
  }
});
$("#program-format").addEventListener("change", event => {
  format = event.target.value;
  assignments = originalAssignments.map(row => ({ ...row }));
  managerAdmin.reset();
  filterState.solutions = newFilter();
  filterState.results = newFilter();
  if (dialog.open) closeModal();
  renderPage();
});
$("#scenario").addEventListener("change", event => {
  scenario = event.target.value;
  assignments = originalAssignments.map(row => ({ ...row }));
  managerAdmin.reset();
  if (dialog.open) closeModal();
  if (scenario === "no-results") {
    screen = "solutions";
    filterState.solutions = {
      ...newFilter(),
      draft: "Несуществующее решение",
      search: "Несуществующее решение",
    };
  } else {
    filterState.solutions = newFilter();
    filterState.results = newFilter();
  }
  renderPage();
});
dialog.addEventListener("cancel", event => {
  event.preventDefault();
  closeModal();
});
dialog.addEventListener("keydown", event => {
  if (event.key !== "Tab") return;
  const focusable = [
    ...dialog.querySelectorAll(
      "button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]",
    ),
  ].filter(el => el.tabIndex >= 0 && el.getClientRects().length);
  if (!focusable.length) {
    event.preventDefault();
    $("#dialog-title").focus();
    return;
  }
  const first = focusable[0],
    last = focusable[focusable.length - 1],
    active = document.activeElement;
  if (event.shiftKey && (active === first || !focusable.includes(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !focusable.includes(active))) {
    event.preventDefault();
    first.focus();
  }
});
dialog.addEventListener("click", event => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      closeModal();
  }
});
renderPage();

document.addEventListener("keydown", event => {
  if (!event.target.matches('[role="tab"]') || !dialog.open) return;
  const tabs = [...dialog.querySelectorAll('[role="tab"]')],
    index = tabs.indexOf(event.target);
  let next = index;
  if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
  else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = tabs.length - 1;
  else return;
  event.preventDefault();
  tabs[next].click();
});
