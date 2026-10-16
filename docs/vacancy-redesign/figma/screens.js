/** @format */

const domainIds = {
  "Project · active": "55:1756",
  "Project · empty skills": "55:1796",
  "Project · closed": "55:1822",
  "Project · one skill": "55:1862",
  "Catalog · active": "55:1893",
  "Catalog · empty": "55:1955",
  "Catalog · closed": "55:2001",
  "Catalog · one skill": "55:2053",
  "Response · pending": "55:2105",
  "Response · accepted": "55:2178",
  "Response · rejected": "55:2235",
  "My response · pending": "55:2294",
  "My response · accepted": "55:2319",
  "My response · rejected": "55:2342",
  "Detail · header": "55:2373",
  "Detail · description and skills": "55:2403",
  "Detail · conditions": "55:2446",
};
for (const [name, id] of Object.entries(domainIds)) sources[id] = await figma.getNodeByIdAsync(id);
const wrapper = await figma.getNodeByIdAsync("51:1753");
const section = await figma.getNodeByIdAsync("51:1751");
const rows = {},
  screens = {};
const intro = fill(frame(wrapper, "00 / Design review status", 2010, "VERTICAL", 16));
fill(text(intro, "Title", "Feature Design / Vacancies", "Heading / Large", 2010));
fill(
  text(
    intro,
    "Approval gate",
    "ДИЗАЙН НА ПРОВЕРКЕ · feat/dev-vacancy-interface-redesign · 29.09.2026",
    "Heading / Small",
    2010,
    "color/action/link",
  ),
);
fill(
  text(
    intro,
    "Scope",
    "Текущий Angular-кандидат сохранён. Ниже — редактируемые desktop 1440 и mobile 390 с реальными экземплярами UI KIT. Primary: #8A63E6. Новые композиции и расширения находятся справа, помечены PROPOSED. Mont — канонический шрифт; Inter здесь только временный preview.",
    "Body / Small",
    2010,
  ),
);
fill(
  text(
    intro,
    "Behavior",
    "Роли и права, маршруты, подтверждение удаления и серверные статусы сохраняются. В Figma показаны состояния, а не выполнение API. Исследование гонок поиска навыков и финальные Angular-проверки — после согласования.",
    "Body / Small",
    2010,
  ),
);
function pair(key, title, note) {
  const box = fill(frame(wrapper, key + " / " + title, 2010, "VERTICAL", 24));
  fill(text(box, "Section title", title, "Heading / Large", 2010));
  fill(text(box, "Review note", note, "Body / Small", 2010, "color/text/secondary"));
  const row = fill(frame(box, "Desktop 1440 + Mobile 390", 2010, "HORIZONTAL", 40));
  row.counterAxisAlignItems = "MIN";
  rows[key] = box.id;
  return row;
}
function screen(parent, key, title, mobile = false) {
  const width = mobile ? 390 : 1440;
  const root = frame(
    parent,
    key + " / " + (mobile ? "Mobile 390" : "Desktop 1440"),
    width,
    "VERTICAL",
    0,
  );
  root.fills = [paint("color/background/subtle")];
  root.minHeight = mobile ? 844 : 960;
  root.clipsContent = false;
  const bar = fill(frame(root, "App shell / local preview header", width, "HORIZONTAL", 16));
  bar.resize(width, 64);
  bar.layoutSizingVertical = "FIXED";
  bar.counterAxisAlignItems = "CENTER";
  bind(bar, {
    paddingLeft: mobile ? "space/16" : "space/40",
    paddingRight: mobile ? "space/16" : "space/40",
  });
  bar.fills = [paint("color/background/primary")];
  text(bar, "Brand", "PROCOLLAB", "Heading / Small", mobile ? 180 : 1040, "color/action/link");
  const avatarInst = inst(bar, "5:85", "Profile / Avatar", 32);
  avatarInst.resize(32, 32);
  const body = fill(
    frame(root, "Workspace", width, mobile ? "VERTICAL" : "HORIZONTAL", mobile ? 24 : 40),
  );
  bind(body, {
    paddingLeft: mobile ? "space/16" : "space/40",
    paddingRight: mobile ? "space/16" : "space/40",
    paddingTop: "space/24",
    paddingBottom: "space/40",
  });
  const nav = frame(
    body,
    "Navigation / local preview",
    mobile ? 358 : 180,
    mobile ? "HORIZONTAL" : "VERTICAL",
    16,
  );
  for (const [label, w] of [
    ["Проект", mobile ? 76 : 180],
    ["Вакансии", mobile ? 86 : 180],
    ["Мои отклики", mobile ? 122 : 180],
  ])
    text(nav, label, label, "Caption", w, "color/action/link");
  const main = fill(frame(body, "Main / " + title, mobile ? 358 : 1140, "VERTICAL", 24));
  const header = inst(main, "11:289", "Pattern / PageHeader", mobile ? 358 : 1140);
  fill(header);
  prop(header, "Title", title);
  prop(
    header,
    "Back label",
    key === "project" ? "← Проект" : key === "detail" ? "← Вакансии" : "← Назад",
  );
  prop(header, "Show action", false);
  if (mobile) {
    const h = header.findOne(n => n.type === "TEXT" && n.characters === title);
    if (h) h.fontSize = 22;
  }
  screens[key + (mobile ? "Mobile" : "Desktop")] = root.id;
  return { root, main, width: mobile ? 358 : 1140, mobile };
}
function feature(parent, key, width, mobile = false) {
  const n = inst(parent, domainIds[key], key, width);
  n.layoutSizingVertical = "HUG";
  fill(n);
  if (mobile) {
    for (const row of n.findAll(
      n =>
        n.type === "FRAME" &&
        [
          "Role + status",
          "Vacancy + response state",
          "Candidate + response state",
          "Full role + state",
        ].includes(n.name),
    )) {
      row.layoutMode = "VERTICAL";
      for (const ch of row.children) {
        if (ch.type === "TEXT" || ch.type === "FRAME") ch.layoutSizingHorizontal = "FILL";
      }
    }
    for (const row of n.findAll(n => n.type === "FRAME" && n.name === "Actions")) {
      row.layoutMode = "VERTICAL";
      for (const ch of row.children) ch.layoutSizingHorizontal = "FILL";
    }
    for (const chip of n.findAll(n => n.type === "INSTANCE" && n.name.startsWith("Badge /"))) {
      const max = width - 42;
      if (chip.width > max) chip.resize(max, chip.height);
      chip.layoutSizingVertical = "HUG";
    }
  }
  return n;
}
function cardsGrid(parent, keys, width, mobile) {
  const grid = fill(frame(parent, "Cards / responsive grid", width, "VERTICAL", 20));
  if (mobile) {
    keys.forEach(k => feature(grid, k, width, true));
    return grid;
  }
  for (let i = 0; i < keys.length; i += 2) {
    const row = fill(frame(grid, "Card row", width, "HORIZONTAL", 20));
    for (const k of keys.slice(i, i + 2)) feature(row, k, (width - 20) / 2);
    const height = Math.max(...row.children.map(n => n.height));
    for (const c of row.children) {
      c.resize(c.width, height);
      c.layoutSizingVertical = "FIXED";
      const card = c.children[0];
      card.resize(card.width, height);
      card.layoutSizingVertical = "FIXED";
      const slot = card.findOne(n => n.type === "SLOT");
      slot.layoutSizingVertical = "FILL";
      const content = slot.children[0];
      content.layoutSizingVertical = "FILL";
      content.primaryAxisAlignItems = "SPACE_BETWEEN";
    }
  }
  return grid;
}
const projectKeys = [
  "Project · active",
  "Project · empty skills",
  "Project · closed",
  "Project · one skill",
];
const catalogKeys = [
  "Catalog · active",
  "Catalog · empty",
  "Catalog · closed",
  "Catalog · one skill",
];
{
  const row = pair(
    "01-project",
    "01 · Вакансии проекта",
    "ListPage: 4 карточки · длинное название · 0/1/11 навыков · активна/закрыта · подписанные действия. На mobile действия идут друг под другом.",
  );
  for (const mobile of [false, true]) {
    const s = screen(row, "project", "Вакансии проекта", mobile);
    button(s.main, "Создать вакансию +", "outline", mobile ? s.width : 280);
    cardsGrid(s.main, projectKeys, s.width, mobile);
  }
}
{
  const row = pair(
    "02-catalog",
    "02 · Общий список вакансий",
    "ListPage: роль — главный заголовок, проект отдельно. «Подробнее» и контекстное основное действие. Закрытая вакансия доступна для чтения.",
  );
  for (const mobile of [false, true]) {
    const s = screen(row, "catalog", "Вакансии", mobile);
    const search = inst(s.main, "6:825", "Search / Toolbar", s.width);
    fill(search);
    prop(search, "Query", "Поиск");
    prop(search, "Show clear", false);
    const columns = fill(
      frame(s.main, "Catalog + filters", s.width, mobile ? "VERTICAL" : "HORIZONTAL", 24),
    );
    if (mobile) {
      button(columns, "Фильтры · Все вакансии", "outline", s.width);
      cardsGrid(columns, catalogKeys, s.width, true);
    } else {
      const gridW = s.width - 244;
      const list = frame(columns, "Catalog", gridW, "VERTICAL", 20);
      cardsGrid(list, catalogKeys, gridW, false);
      const filters = frame(
        columns,
        "Filters / existing list-page composition",
        220,
        "VERTICAL",
        16,
      );
      text(filters, "Filters title", "Фильтры", "Heading / Small", 220);
      button(filters, "Все вакансии", "primary", 220);
      for (const [group, options] of [
        ["Опыт", ["Без опыта", "До 1 года", "От 1 года до 3 лет"]],
        ["График", ["Полный рабочий день", "Гибкий график"]],
        ["Формат работы", ["Удалённая работа", "Работа в офисе"]],
      ]) {
        text(filters, group, group, "Caption", 220, "color/text/secondary");
        for (const label of options) {
          const c = inst(filters, "6:568", "Checkbox / " + label, 220);
          prop(c, "Label", label);
          fill(c);
        }
      }
    }
  }
}
{
  const row = pair(
    "03-detail",
    "03 · Страница вакансии",
    "DetailPage: полный заголовок; сведения и навыки слева, условия и действие справа. На mobile блок условий следует за описанием.",
  );
  for (const mobile of [false, true]) {
    const s = screen(row, "detail", "Вакансия", mobile);
    feature(s.main, "Detail · header", s.width, mobile);
    const columns = fill(
      frame(s.main, "Main + secondary", s.width, mobile ? "VERTICAL" : "HORIZONTAL", 24),
    );
    if (mobile) {
      feature(columns, "Detail · description and skills", s.width, true);
      feature(columns, "Detail · conditions", s.width, true);
    } else {
      const left = frame(columns, "Description column", s.width - 344, "VERTICAL", 20);
      feature(left, "Detail · description and skills", s.width - 344);
      const right = frame(columns, "Conditions column", 320, "VERTICAL", 20);
      feature(right, "Detail · conditions", 320);
    }
  }
}
function overlay(parent, key, title, mobile, w) {
  const width = mobile ? 390 : 1440;
  const root = frame(
    parent,
    key + " / " + (mobile ? "Mobile 390" : "Desktop 1440"),
    width,
    "VERTICAL",
    24,
  );
  root.fills = [{ type: "SOLID", color: { r: 0.58, g: 0.57, b: 0.58 } }];
  bind(root, {
    paddingLeft: mobile ? "space/16" : "space/40",
    paddingRight: mobile ? "space/16" : "space/40",
    paddingTop: mobile ? "space/24" : "space/48",
    paddingBottom: mobile ? "space/24" : "space/48",
  });
  root.counterAxisAlignItems = "CENTER";
  root.minHeight = mobile ? 844 : 960;
  screens[key + (mobile ? "Mobile" : "Desktop")] = root.id;
  return root;
}
{
  const row = pair(
    "04-created",
    "04 · После создания вакансии",
    "Только после успешного ответа сервера. Existing Modal / Confirmation: Escape, закрытие, возврат фокуса. Primary ведёт на созданную вакансию; secondary оставляет в проекте.",
  );
  for (const mobile of [false, true]) {
    const root = overlay(row, "created", "Вакансия создана", mobile);
    root.primaryAxisAlignItems = "CENTER";
    const modal = inst(root, "8:538", "Modal / Confirmation / success", mobile ? 358 : 520);
    modal.layoutSizingVertical = "HUG";
    prop(modal, "Title", "Вакансия создана");
    prop(
      modal,
      "Content",
      "Теперь управлять вакансией и работать с откликами можно во вкладке „Вакансии“.",
    );
    for (const ch of modal.children) ch.layoutSizingHorizontal = "FILL";
    const actions = modal.children.find(n => n.name === "Actions");
    actions.layoutMode = "VERTICAL";
    bind(actions, { itemSpacing: "space/8" });
    const bs = actions.children.filter(n => n.type === "INSTANCE");
    prop(bs[0], "Label", "Перейти к вакансиям");
    bs[0].swapComponent(sources["5:233"]);
    prop(bs[0], "Label", "Перейти к вакансиям");
    bs[1].swapComponent(sources["5:265"]);
    prop(bs[1], "Label", "Остаться в проекте");
    for (const b of bs) {
      b.resize(modal.width - 48, 40);
      b.layoutSizingHorizontal = "FILL";
      b.layoutSizingVertical = "FIXED";
    }
  }
}
{
  const row = pair(
    "05-responses",
    "05 · Просмотр откликов",
    "Modal / Wide → proposed content slot: три статуса, письмо и файл. Только «Ожидает решения» имеет действия. Контент показан полностью для ревью; в продукте окно ограничено viewport и прокручивается.",
  );
  for (const mobile of [false, true]) {
    const root = overlay(row, "responses", "Отклики на вакансию", mobile);
    const width = mobile ? 358 : 800;
    const modal = inst(root, "53:1763", "Modal / Vacancy responses", width);
    modal.layoutSizingVertical = "HUG";
    if (mobile)
      bind(modal, {
        paddingLeft: "space/16",
        paddingRight: "space/16",
        paddingTop: "space/16",
        paddingBottom: "space/16",
      });
    const slot = modal.findOne(n => n.type === "SLOT");
    const f = frame(page, "Response list", width - (mobile ? 32 : 48), "VERTICAL", 16);
    slot.appendChild(f);
    const content = slot.children[slot.children.length - 1];
    fill(content);
    for (const kind of ["pending", "accepted", "rejected"])
      feature(content, "Response · " + kind, width - (mobile ? 32 : 48), mobile);
  }
}
{
  const row = pair(
    "06-my",
    "06 · Мои отклики",
    "ListPage: вакансия, проект, дата, статус и письмо объединены одной карточкой. Три статуса; отсутствие письма/файла; длинное письмо раскрывается.",
  );
  for (const mobile of [false, true]) {
    const s = screen(row, "my", "Мои отклики", mobile);
    for (const kind of ["pending", "accepted", "rejected"])
      feature(s.main, "My response · " + kind, s.width, mobile);
  }
}
section.resizeWithoutConstraints(2130, wrapper.height + 180);
return {
  createdNodeIds: wrapper.children.flatMap(allIds),
  rows,
  screens,
  sectionId: section.id,
  sectionBounds: { width: section.width, height: section.height },
  mastersMutated: [],
};
