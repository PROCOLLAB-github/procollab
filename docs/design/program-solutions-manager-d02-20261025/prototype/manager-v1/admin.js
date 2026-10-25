/**
 * D02 administrative flows. All records below are synthetic and live only in this tab.
 *
 * @format
 */

window.managerAdmin = (() => {
  let initialized = false,
    listScope = "active",
    selected = new Set(),
    registrations = [],
    events = [],
    audits = [],
    ratings = [];
  let sequence = 0;
  let archiveFilter = null;
  const response = () => document.querySelector("#action-response")?.value || "ready";
  const memberNames = [
    ["Мария Климова", "Анна Петрова"],
    ["Андрей Сергеев"],
    ["Ольга Смирнова"],
    [],
  ];
  function init() {
    if (initialized) return;
    initialized = true;
    let id = 1;
    registrations = works.flatMap((work, index) => {
      work.archived = false;
      work.caseName = [
        "Образование",
        "Городская среда",
        "Образование",
        scenario === "ready-draft" ? "Образование" : null,
      ][index];
      work.submitted = index < 3;
      work.submittedAt = null;
      work.members = [work.captain, ...memberNames[index]].map((name, n) => ({
        id: id++,
        name,
        captain: n === 0,
        role: n === 0 ? "Капитан" : n === 1 ? "Разработчик" : "Дизайнер",
      }));
      work.pending = [];
      work.teamSize = work.members.length;
      return work.members.map(person => ({ ...person, workId: work.id, pending: false }));
    });
    const pending = { id: id++, name: "Константин Шперлингш", captain: false, role: "Разработчик" };
    works[0].pending.push(pending);
    registrations.push(
      { ...pending, workId: 301, pending: true },
      ...["Виктория Орлова", "Наталья Волкова", "Артем Семенов"].map(name => ({
        id: id++,
        name,
        workId: null,
        captain: false,
        pending: false,
      })),
    );
    ratings = originalAssignments.filter(row => row.completed).map(row => ({ ...row }));
  }
  const scores = work => (competitive() ? ratings.filter(row => row.workId === work.id) : []);
  const scoreCount = work => scores(work).length * 3;
  const assigned = work =>
    competitive() && distributed() ? assignments.filter(row => row.workId === work.id) : [];
  const registrationCount = () => {
    init();
    return scenario === "empty" ? 0 : registrations.length;
  };
  const snapshot = work => ({
    name: workName(work),
    caseName: work.caseName,
    members: structuredClone(work.members),
    answers: fields()
      .filter(field => applicable(work, field))
      .map(field => ({ label: field.label, value: answer(work, field.id) })),
    archived: work.archived,
    submitted: competitive() && work.submitted,
  });
  const btn = (action, label, attrs = "", style = "secondary") =>
    `<button class="${style}" data-action="${action}" ${attrs}>${label}</button>`;
  const workBy = id => works.find(work => work.id === Number(id));
  function isArchived(id) {
    init();
    return !!workBy(id)?.archived;
  }
  function listWorks() {
    init();
    return scenario === "empty"
      ? []
      : works.filter(work => work.archived === (listScope === "archived"));
  }
  function listToolbar() {
    return `<div class="admin-list-toolbar"><div class="modal-tabs" role="group" aria-label="Состояние решений">${[
      ["active", "Активные"],
      ["archived", "Архив"],
    ]
      .map(([key, label]) =>
        btn(
          "admin-scope",
          label,
          `data-scope="${key}" aria-pressed="${listScope === key}"`,
          "link",
        ),
      )
      .join(
        "",
      )}</div><div class="actions">${btn("admin-people", "Участники программы")}${btn("admin-audits", "История удаления регистраций", "", "link")}</div></div>`;
  }
  function effectRows(items) {
    return `<dl class="admin-effects">${items.map(([label, value]) => `<dt>${label}</dt><dd>${esc(value)}</dd>`).join("")}</dl>`;
  }
  function team(work) {
    return `<p class="muted">Принятые участники: ${work.members.length}</p>${work.members
      .map(
        person =>
          `<div class="team-row admin-team-row"><span class="avatar" aria-hidden="true">${person.name
            .split(" ")
            .map(part => part[0])
            .join(
              "",
            )}</span><span>${esc(person.name)}<span class="subtext">${person.role}</span></span>${work.archived ? "" : person.captain ? '<span class="muted">Капитана нельзя исключить из состава</span>' : btn("admin-remove-member", "Исключить", `data-id="${work.id}" data-person="${person.id}"`, "link")}</div>`,
      )
      .join(
        "",
      )}${work.pending.length ? `<section class="admin-section"><h3>Ожидают подтверждения · ${work.pending.length}</h3><p class="muted">Приглашенные появятся в составе после принятия приглашения.</p>${work.pending.map(person => `<div class="team-row"><span class="avatar" aria-hidden="true">КШ</span><span>${esc(person.name)}<span class="subtext">${person.role}</span></span><span class="muted">Приглашение отправлено</span></div>`).join("")}</section>` : ""}`;
  }
  function solution(work) {
    const archived = work.archived;
    const title = workName(work);
    const subtitle = archived
      ? "Архив. Доступно только чтение."
      : competitive() && work.submitted
        ? `Сдано ${work.submittedAt || "24 октября 2026, 17:30"}. Административные исключения фиксируются в истории.`
        : competitive()
          ? "Черновик. Команда еще работает над решением."
          : "Сохраненные материалы. Отдельная сдача не предусмотрена.";
    const tabs = `<div class="modal-tabs" role="tablist" aria-label="Заявка команды">${[
      ["solution", "Решение"],
      ["team", "Команда"],
    ]
      .map(
        ([key, label]) =>
          `<button id="${key}-tab" role="tab" aria-controls="solution-tab-panel" tabindex="${(modal.tab || "solution") === key ? 0 : -1}" aria-selected="${(modal.tab || "solution") === key}" data-action="solution-tab" data-tab="${key}">${label}</button>`,
      )
      .join("")}</div>`;
    const content =
      modal.tab === "team"
        ? team(work)
        : `<div class="answer-list"><div class="answer"><h3>Кейс</h3><div class="heading-row"><p>${esc(work.caseName || "Не выбран")}</p>${archived ? "" : btn("admin-case", "Сменить кейс", `data-id="${work.id}"`, "link")}</div></div>${fields()
            .filter(field => applicable(work, field))
            .map(field => {
              const value = answer(work, field.id);
              return `<div class="answer"><h3>${esc(field.label)}</h3><p>${!filled(value) ? "Не заполнено" : ["file", "url"].includes(field.type) ? btn("material", esc(value), "", "link") : field.type === "checkbox" ? (value ? "Да" : "Нет") : esc(value)}</p></div>`;
            })
            .join("")}</div>`;
    const body = `${archived ? '<p class="inline-note admin-preservation">Материалы и состав на момент снятия доступны для чтения. Оценки сохранены; новые оценки недоступны. Решение исключено из активных списков и оценивания.</p>' : ""}${tabs}<div id="solution-tab-panel" role="tabpanel" aria-labelledby="${modal.tab === "team" ? "team" : "solution"}-tab">${content}</div><footer class="admin-footer"><div class="actions">${btn("admin-history", "История изменений", `data-id="${work.id}"`, "link")}${!archived && scores(work).length ? btn("work-scores", "Сохраненные оценки", `data-id="${work.id}"`, "link") : ""}</div>${!archived && competitive() && !work.submitted ? btn("admin-submit", "Сдать за команду", `data-id="${work.id}"`, "primary") : ""}${archived ? "" : btn("admin-archive", competitive() ? "Снять с участия" : "Переместить в архив", `data-id="${work.id}"`, "quiet")}</footer>`;
    return { title, subtitle, body };
  }
  function peopleView() {
    const rows =
      scenario === "empty"
        ? []
        : registrations.filter(person =>
            modal.kind === "without-visit"
              ? person.id >= 9
              : modal.kind === "without-team"
                ? !works.some(
                    work => !work.archived && work.members.some(member => member.id === person.id),
                  )
                : true,
          );
    return {
      title:
        modal.kind === "without-team"
          ? "Участники без команды"
          : modal.kind === "without-visit"
            ? "Участники еще не заходили на платформу"
            : "Участники программы",
      subtitle: "Регистрация относится к этой программе. Учетная запись участника сохраняется.",
      body: `<p class="inline-note">Выберите регистрации для просмотра последствий удаления. Ожидающее приглашение не означает участие в команде.</p><table class="data-table admin-registrations"><thead><tr><th>Участник</th><th>Заявка</th><th>Статус</th></tr></thead><tbody>${rows
        .map(person => {
          const linked = workBy(person.workId),
            work =
              linked &&
              (linked.members.some(member => member.id === person.id) ||
                linked.pending.some(member => member.id === person.id))
                ? linked
                : null;
          return `<tr><td class="name-cell"><label class="admin-selection"><input type="checkbox" name="registration" value="${person.id}" ${selected.has(person.id) ? "checked" : ""}><span>${esc(person.name)}</span></label></td><td data-label="Заявка">${work ? btn("solution", esc(workName(work)), `data-id="${work.id}" data-focus="person-${person.id}"`, "link") : "Нет решения"}</td><td data-label="Статус">${work?.archived ? "Решение в архиве" : work?.pending.some(item => item.id === person.id) ? "Ожидает приглашение" : person.captain ? "Капитан" : work ? "В команде" : "Без команды"}</td></tr>`;
        })
        .join(
          "",
        )}</tbody></table>${rows.length ? "" : '<p class="muted">Регистраций нет.</p>'}<div class="admin-footer"><div class="actions">${btn("admin-registration-preview", `Удалить регистрации (${selected.size})`, selected.size ? "" : "disabled", "quiet")}${modal.kind !== "all" && rows.length ? btn("reminder-preview", "Напомнить участникам") : ""}</div>${btn("admin-audits", "История удаления регистраций", "", "link")}</div>`,
    };
  }
  function removalEffects(ids) {
    const picked = registrations.filter(person => ids.includes(person.id));
    const changes = works
      .filter(work => !work.archived)
      .map(work => {
        const captain = picked.some(person => person.id === work.members[0]?.id);
        const members = captain ? [] : work.members.filter(person => ids.includes(person.id));
        const pending = work.pending.filter(person => captain || ids.includes(person.id));
        return { work, captain, members, pending };
      })
      .filter(item => item.captain || item.members.length || item.pending.length);
    return { picked, changes };
  }
  function previewBody() {
    const work = workBy(modal.id);
    let rows = [],
      explanation = "",
      label = "",
      title = "";
    if (modal.operation === "submit") {
      title = "Сдать решение за команду";
      label = "Подтвердить сдачу";
      const missing = submissionIssues(work);
      rows = [
        ["Готовность решения", missing.length ? "Есть незаполненные поля" : "Готово к сдаче"],
        ["Принятых участников", work.members.length],
        ["Ожидающих приглашений, не входят в состав", work.pending.length],
      ];
      return {
        title,
        label,
        blocked: !!missing.length,
        body: `<p>${esc(workName(work))}</p>${effectRows(rows)}${missing.length ? `<div class="admin-error" role="alert"><h3>Сдача пока недоступна</h3><p>Команде нужно заполнить: ${missing.map(esc).join(", ")}.</p></div>` : '<p class="inline-note">После подтверждения материалы и принятый состав будут зафиксированы. Повторная сдача не изменит уже сданное решение.</p>'}`,
      };
    } else if (modal.operation === "case") {
      title = "Сменить кейс";
      label = "Подтвердить смену кейса";
      rows = [
        ["Текущий кейс", work.caseName || "Не выбран"],
        ["Новый кейс", modal.caseName],
        ["Назначений будет удалено", caseRemovedAssignments(work, modal.caseName).length],
        ["Значений по критериям сохраняется", scoreCount(work)],
      ];
      explanation =
        "Материалы и команда сохраняются. Изменение кейса и снимка сдачи попадет в историю. Удаляются только назначения без оценок, не подходящие для нового кейса.";
    } else if (modal.operation === "member") {
      title = "Исключить участника из команды";
      label = "Исключить участника";
      const person = work.members.find(item => item.id === modal.person);
      rows = [
        ["Участник", person?.name],
        ["Останется в команде", work.members.length - 1],
        ["Значений по критериям сохраняется", scoreCount(work)],
        ["Назначений будет удалено", 0],
      ];
      explanation =
        "Состав и снимок сдачи будут обновлены. Прежний состав останется в истории. Регистрация в программе, материалы и оценки сохраняются.";
    } else if (modal.operation === "archive") {
      title = competitive() ? "Снять решение с участия" : "Переместить решение в архив";
      label = competitive() ? "Снять с участия" : "Переместить в архив";
      rows = [
        ["Решение", workName(work)],
        ["Назначений будет удалено", assigned(work).length],
        ["Ожидающих приглашений будет отозвано", work.pending.length],
        ["Значений по критериям сохраняется", scoreCount(work)],
      ];
      explanation =
        "Материалы, состав и оценки сохраняются в архиве. Решение исчезнет из активных списков, оценивания и публичной выдачи. Возврат из архива не предусмотрен.";
    } else {
      title = "Удалить регистрации из программы";
      label = "Удалить регистрации";
      const { picked, changes } = removalEffects(modal.ids);
      rows = [
        ["Регистраций будет удалено", picked.length],
        ["Решений перейдет в архив", changes.filter(item => item.captain).length],
        [
          "Участников будет исключено из состава",
          changes.reduce((n, item) => n + item.members.length, 0),
        ],
        ["Приглашений будет отозвано", changes.reduce((n, item) => n + item.pending.length, 0)],
        [
          "Назначений будет удалено",
          changes.reduce((n, item) => n + (item.captain ? assigned(item.work).length : 0), 0),
        ],
      ];
      explanation =
        "Учетные записи и участие в других программах сохраняются. Если выбран капитан, его решение перейдет в архив. Уже архивные материалы, состав и история остаются без изменений.";
      return {
        title,
        label,
        body: `<p>${picked.map(person => esc(person.name)).join(", ")}</p>${effectRows(rows)}<p class="inline-note">${explanation}</p><section class="admin-section"><h3>Последствия для решений</h3>${changes.length ? changes.map(item => `<p class="admin-effect-item"><strong>${esc(workName(item.work))}</strong><span>${item.captain ? "Архивирование с сохранением материалов, состава и оценок" : item.members.length ? "Исключение: " + item.members.map(person => esc(person.name)).join(", ") + ". Материалы, оценки и назначения сохраняются." : "Отзыв ожидающего приглашения. Принятый состав сохраняется."}</span></p>`).join("") : '<p class="muted">Активные решения не затронуты. Операция будет записана в общую историю регистраций.</p>'}</section>`,
      };
    }
    return {
      title,
      label,
      body: `${work ? `<p class="muted">${esc(workName(work))}${competitive() && work.submitted ? " · Сданное решение" : ""}</p>` : ""}${effectRows(rows)}<p class="inline-note">${explanation}</p>`,
    };
  }
  function previewView() {
    const data = previewBody(),
      mode = modal.forceReady ? "ready" : response();
    const loading = mode === "loading";
    const legacy = mode === "legacy" && modal.operation === "registrations";
    let error = "";
    if (legacy)
      error =
        '<div class="admin-error" role="alert"><h3>Есть заявка, связанная с проектом</h3><p>Вся операция остановлена. Ни одна регистрация не удалена. Проверьте выбранные заявки через существующее управление проектами.</p></div>';
    if (modal.failure) {
      const copy = {
        stale: [
          "Данные изменились",
          "Последствия могли измениться. Загрузите новый предпросмотр и подтвердите действие еще раз.",
        ],
        error: [
          "Не удалось подтвердить действие",
          "Результат операции пока неизвестен. Обновите данные перед повторным подтверждением.",
        ],
        "no-access": [
          "Нет доступа к действию",
          "Ваши права изменились. Обновите данные программы.",
        ],
      }[modal.failure];
      error = `<div class="admin-error" role="alert"><h3>${copy[0]}</h3><p>${copy[1]}</p>${btn("admin-refresh-preview", modal.failure === "no-access" ? "Обновить программу" : "Обновить предпросмотр")}</div>`;
    }
    return {
      title: data.title,
      subtitle: "Проверьте последствия перед подтверждением.",
      body: loading
        ? '<section aria-busy="true" aria-label="Загрузка предпросмотра"><p class="muted">Загружаем последствия действия…</p><div class="skeleton skeleton--large"></div></section>'
        : `${data.body}${error}<div class="actions"><button class="secondary" data-action="back" ${modal.busy ? "disabled" : ""}>Отмена</button>${btn("admin-apply", modal.busy ? "Подтверждаем…" : data.label, `${data.blocked || legacy || modal.failure || modal.busy ? "disabled" : ""} aria-busy="${!!modal.busy}"`, "primary")}</div><p class="muted">В макете меняются только вымышленные данные текущей вкладки.</p>`,
    };
  }
  function historyView() {
    const work = workBy(modal.id),
      rows = events.filter(event => event.workId === work.id).toReversed();
    return {
      title: "История изменений",
      subtitle: workName(work),
      body: rows.length
        ? `<ol class="admin-history">${rows.map(event => `<li><h3>${esc(event.title)}</h3><p class="muted">${event.time} · Организатор программы</p><p>${esc(event.description)}</p>${btn("admin-event", "Посмотреть до и после", `data-event="${event.id}" data-focus="event-${event.id}"`, "link")}</li>`).join("")}</ol>`
        : '<div class="empty-state"><h3>Административных изменений еще нет</h3><p class="muted">Здесь появятся смена кейса, исключение участников и архивирование.</p></div>',
    };
  }
  function snapshotHtml(data) {
    return `<div class="answer-list"><div class="answer"><h3>Кейс</h3><p>${esc(data.caseName || "Не выбран")}</p></div><div class="answer"><h3>Состав · ${data.members.length}</h3><p>${data.members.map(person => esc(person.name)).join(", ")}</p></div><div class="answer"><h3>Состояние</h3><p>${data.archived ? "Архив" : data.submitted ? "Сдано" : "Сохранено"}</p></div>${data.answers.map(answer => `<div class="answer"><h3>${esc(answer.label)}</h3><p>${answer.value === false ? "Нет" : answer.value === true ? "Да" : esc(answer.value ?? "Не заполнено")}</p></div>`).join("")}</div>`;
  }
  function eventView() {
    const event = events.find(item => item.id === modal.event),
      tab = modal.version || "before";
    return {
      title: event.title,
      subtitle: "Материалы и состав в момент административного изменения.",
      body: `<div class="modal-tabs" role="tablist" aria-label="Снимки изменения">${[
        ["before", "До изменения"],
        ["after", "После изменения"],
      ]
        .map(
          ([key, label]) =>
            `<button role="tab" id="${key}-tab" aria-controls="event-panel" aria-selected="${tab === key}" tabindex="${tab === key ? 0 : -1}" data-action="admin-version" data-version="${key}">${label}</button>`,
        )
        .join(
          "",
        )}</div><div id="event-panel" role="tabpanel" aria-labelledby="${tab}-tab">${snapshotHtml(event[tab])}</div>${event.audit ? btn("admin-audit", "Открыть удаление регистраций", `data-audit="${event.audit}"`, "link") : ""}`,
    };
  }
  function auditView() {
    if (modal.view === "admin-audits")
      return {
        title: "История удаления регистраций",
        subtitle: "Общая история программы включает участников без решения.",
        body: audits.length
          ? `<ol class="admin-history">${audits
              .toReversed()
              .map(
                audit =>
                  `<li><h3>Удалено регистраций: ${audit.people.length}</h3><p class="muted">${audit.time} · Организатор программы</p><p>${audit.people.map(person => esc(person.name)).join(", ")}</p>${btn("admin-audit", "Посмотреть последствия", `data-audit="${audit.id}" data-focus="audit-${audit.id}"`, "link")}</li>`,
              )
              .join("")}</ol>`
          : '<div class="empty-state"><h3>Удалений регистраций еще нет</h3><p class="muted">История появится после подтвержденного действия.</p></div>',
      };
    const audit = audits.find(item => item.id === modal.audit);
    return {
      title: "Удаление регистраций",
      subtitle: `${audit.time} · Организатор программы`,
      body: `<p>${audit.people.map(person => esc(person.name)).join(", ")}</p><p class="inline-note">Учетные записи участников сохранены. Персональные ответы анкеты в этой истории не дублируются.</p>${
        audit.events.length
          ? audit.events
              .map(id => {
                const event = events.find(item => item.id === id);
                return `<section class="admin-section"><h3>${esc(event.before.name)}</h3><p>${esc(event.description)}</p>${btn("admin-event", "Посмотреть до и после", `data-event="${event.id}"`, "link")}</section>`;
              })
              .join("")
          : "<p>Активные решения не затронуты. Архивные решения сохраняют прежний состав и историю.</p>"
      }`,
    };
  }
  function renderModal() {
    init();
    if (modal.view === "solution") return solution(workBy(modal.id));
    if (modal.view === "people" || modal.view === "admin-people") return peopleView();
    if (modal.view === "admin-preview") return previewView();
    if (modal.view === "admin-history") return historyView();
    if (modal.view === "admin-event") return eventView();
    if (["admin-audits", "admin-audit"].includes(modal.view)) return auditView();
    if (modal.view === "admin-case") {
      const work = workBy(modal.id);
      return {
        title: "Сменить кейс",
        subtitle: workName(work),
        body: `<p class="inline-note">Выберите актуальный кейс программы. Затем проверьте последствия изменения.</p><label class="field">Новый кейс<select name="admin-case"><option value="">Выберите кейс</option>${[
          "Образование",
          "Городская среда",
        ]
          .filter(name => name !== work.caseName)
          .map(name => `<option ${modal.caseName === name ? "selected" : ""}>${name}</option>`)
          .join(
            "",
          )}</select></label><div class="actions">${btn("back", "Отмена")}${btn("admin-case-preview", "Посмотреть последствия", modal.caseName ? "" : "disabled", "primary")}</div>`,
      };
    }
    return null;
  }
  function submissionIssues(work) {
    return [
      ...(work.caseName ? [] : ["Кейс"]),
      ...fields()
        .filter(
          field => field.required && applicable(work, field) && !filled(answer(work, field.id)),
        )
        .map(field => field.label),
    ];
  }
  function caseRemovedAssignments(work, caseName) {
    // Вымышленное ограничение эксперта Марии: только кейс «Образование».
    return assigned(work).filter(
      row =>
        !ratings.some(score => score.workId === row.workId && score.expert === row.expert) &&
        row.expert === 1 &&
        caseName !== "Образование",
    );
  }
  function addEvent(work, before, title, description, audit = null) {
    const event = {
      id: ++sequence,
      workId: work.id,
      time: new Date().toLocaleString("ru-RU"),
      title,
      description,
      before,
      after: snapshot(work),
      audit,
    };
    events.push(event);
    return event;
  }
  function archiveWork(work, audit = null) {
    const before = snapshot(work);
    work.archived = true;
    work.pending = [];
    assignments = assignments.filter(row => row.workId !== work.id);
    return addEvent(
      work,
      before,
      "Решение перемещено в архив",
      "Материалы, состав и оценки сохранены. Назначения удалены, ожидающие приглашения отозваны.",
      audit,
    );
  }
  function applyChanges() {
    const work = workBy(modal.id);
    if (modal.operation === "submit") {
      work.submitted = true;
      work.submittedAt = new Date().toLocaleString("ru-RU");
    } else if (modal.operation === "case") {
      const before = snapshot(work),
        removed = new Set(caseRemovedAssignments(work, modal.caseName).map(row => row.id));
      work.caseName = modal.caseName;
      assignments = assignments.filter(row => !removed.has(row.id));
      addEvent(
        work,
        before,
        "Кейс изменен",
        `${before.caseName || "Кейс не выбран"} → ${work.caseName}. Материалы, состав и оценки сохранены.`,
      );
    } else if (modal.operation === "member") {
      const before = snapshot(work),
        person = work.members.find(item => item.id === modal.person);
      work.members = work.members.filter(item => item.id !== modal.person);
      work.teamSize = work.members.length;
      work.pending = work.pending.filter(item => item.id !== modal.person);
      addEvent(
        work,
        before,
        "Участник исключен из команды",
        `${person.name}. Регистрация, материалы, оценки и назначения сохранены.`,
      );
    } else if (modal.operation === "archive") archiveWork(work);
    else {
      const { picked, changes } = removalEffects(modal.ids),
        audit = {
          id: audits.length + 1,
          time: new Date().toLocaleString("ru-RU"),
          people: structuredClone(picked.map(({ id, name }) => ({ id, name }))),
          events: [],
        };
      for (const item of changes) {
        if (item.captain) audit.events.push(archiveWork(item.work, audit.id).id);
        else {
          const before = snapshot(item.work);
          item.work.members = item.work.members.filter(person => !modal.ids.includes(person.id));
          item.work.teamSize = item.work.members.length;
          item.work.pending = item.work.pending.filter(person => !modal.ids.includes(person.id));
          audit.events.push(
            addEvent(
              item.work,
              before,
              "Регистрации удалены",
              item.members.length
                ? `Исключены из состава: ${item.members.map(person => person.name).join(", ")}. Материалы, оценки и назначения сохранены.`
                : "Ожидающие приглашения отозваны. Принятый состав сохранен.",
              audit.id,
            ).id,
          );
        }
      }
      registrations = registrations.filter(person => !modal.ids.includes(person.id));
      selected.clear();
      audits.push(audit);
      return { view: "admin-audit", audit: audit.id };
    }
    return {
      view: "solution",
      id: work.id,
      tab: modal.operation === "member" ? "team" : "solution",
    };
  }
  function navigate(next) {
    modal ? openInner(next) : openModal(next);
  }
  function handleClick(target) {
    const action = target.dataset.action;
    if (action === "people") selected.clear();
    if (!action?.startsWith("admin-")) return false;
    init();
    const id = Number(target.dataset.id);
    if (action === "admin-scope") {
      listScope = target.dataset.scope;
      renderPage();
      document.querySelector(`[data-action="admin-scope"][data-scope="${listScope}"]`)?.focus();
    }
    if (action === "admin-people") {
      selected.clear();
      navigate({ view: "admin-people", kind: "all" });
    }
    if (action === "admin-case") navigate({ view: "admin-case", id });
    if (action === "admin-case-preview")
      navigate({
        view: "admin-preview",
        operation: "case",
        id: modal.id,
        caseName: modal.caseName,
      });
    if (action === "admin-remove-member")
      navigate({
        view: "admin-preview",
        operation: "member",
        id,
        person: Number(target.dataset.person),
      });
    if (action === "admin-submit") navigate({ view: "admin-preview", operation: "submit", id });
    if (action === "admin-archive") navigate({ view: "admin-preview", operation: "archive", id });
    if (action === "admin-registration-preview" && selected.size)
      navigate({ view: "admin-preview", operation: "registrations", ids: [...selected] });
    if (action === "admin-history") navigate({ view: "admin-history", id });
    if (action === "admin-event")
      navigate({ view: "admin-event", event: Number(target.dataset.event) });
    if (action === "admin-version") {
      modal.version = target.dataset.version;
      renderModalOuter();
      dialog.querySelector(`[data-version="${modal.version}"]`).focus();
    }
    if (action === "admin-audits") navigate({ view: "admin-audits" });
    if (action === "admin-audit")
      navigate({ view: "admin-audit", audit: Number(target.dataset.audit) });
    if (action === "admin-refresh-preview") {
      if (modal.failure === "no-access") {
        closeModal();
        renderPage();
        showNotice("Данные программы обновлены в макете.");
      } else {
        modal.failure = null;
        modal.forceReady = true;
        renderModalOuter();
        $("#dialog-title").focus();
      }
    }
    if (action === "admin-apply" && !modal.busy && !modal.failure) {
      if (previewBody().blocked) return true;
      const mode = modal.forceReady ? "ready" : response();
      if (["stale", "error", "no-access"].includes(mode)) {
        modal.failure = mode;
        renderModalOuter();
        $("#dialog-title").focus();
        return true;
      }
      if ((mode === "legacy" && modal.operation === "registrations") || mode === "loading")
        return true;
      const current = modal;
      modal.busy = true;
      renderModalOuter();
      $("#dialog-title").focus();
      setTimeout(() => {
        if (modal !== current) return;
        const next = applyChanges();
        modal = next;
        renderPage();
        renderModalOuter();
        $("#dialog-title").focus();
        showNotice(
          current.operation === "submit"
            ? "Решение сдано в макете. Материалы и принятый состав зафиксированы."
            : "Действие выполнено в макете. Изменения доступны в истории.",
        );
      }, 250);
    }
    return true;
  }
  // Имя внешнего renderer не совпадает с локальным renderModal этого дополнения.
  const renderModalOuter = () => window.renderModal();
  document.addEventListener("change", event => {
    if (event.target.name === "registration") {
      event.target.checked
        ? selected.add(Number(event.target.value))
        : selected.delete(Number(event.target.value));
      renderModalOuter();
      dialog.querySelector(`[name="registration"][value="${event.target.value}"]`)?.focus();
    }
    if (event.target.name === "admin-case") {
      modal.caseName = event.target.value;
      renderModalOuter();
      dialog.querySelector('[name="admin-case"]')?.focus();
    }
  });
  const teamCount = () => {
    init();
    return scenario === "empty"
      ? 0
      : works.filter(work => !work.archived).reduce((sum, work) => sum + work.members.length, 0);
  };
  const withoutVisit = () => {
    init();
    return scenario === "empty" ? 0 : registrations.filter(person => person.id >= 9).length;
  };
  return {
    init,
    isArchived,
    teamCount,
    withoutVisit,
    regionCount: index => {
      init();
      return scenario === "empty"
        ? 0
        : registrations.filter(person =>
            index === 0
              ? person.id <= 6
              : index === 1
                ? person.id > 6 && person.id <= 10
                : person.id > 10,
          ).length;
    },
    listWorks,
    listToolbar,
    isArchiveScope: () => listScope === "archived",
    listFilter: () =>
      listScope === "archived" ? (archiveFilter ??= newFilter()) : filterState.solutions,
    archiveFilters: filter =>
      `<form class="search-form" data-form="search"><input type="search" name="search" aria-label="Поиск по названию решения" placeholder="Поиск по названию решения" value="${esc(filter.draft)}" maxlength="200"><button class="secondary" type="submit">Найти</button></form>`,
    emptyArchive: () => listScope === "archived" && !listWorks().length,
    registrationCount,
    renderModal,
    handleClick,
    savedRating: id => {
      init();
      return ratings.find(row => row.id === id);
    },
    reset: () => {
      initialized = false;
      listScope = "active";
      archiveFilter = null;
      selected.clear();
      events = [];
      audits = [];
      sequence = 0;
      init();
    },
  };
})();
