/** @format */

const page = await figma.getNodeByIdAsync("0:1");
await figma.setCurrentPageAsync(page);
const area = await figma.getNodeByIdAsync("51:1752");
if (area.children.some(n => n.name === "Proposed / Card / Vacancy content"))
  return { alreadyCreated: area.children.map(n => ({ id: n.id, name: n.name })) };
const variables = await figma.variables.getLocalVariablesAsync();
const vars = Object.fromEntries(variables.map(v => [v.name, v]));
const styles = await figma.getLocalTextStylesAsync();
await Promise.all(
  ["Regular", "Semi Bold", "Bold"].map(style => figma.loadFontAsync({ family: "Inter", style })),
);
const created = [];
const paint = name =>
  figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    "color",
    vars[name],
  );
const remember = n => (created.push(n.id), n);
function bind(n, fields) {
  for (const [key, name] of Object.entries(fields)) n.setBoundVariable(key, vars[name]);
}
function type(n, role) {
  const s = styles.find(s => s.name.endsWith("/ " + role));
  n.textStyleId = s.id;
}
function text(parent, name, value, role, width, color = "color/text/primary") {
  const n = remember(figma.createText());
  parent.appendChild(n);
  n.name = name;
  type(n, role);
  n.characters = value;
  n.fills = [paint(color)];
  n.resize(width, 20);
  n.textAutoResize = "HEIGHT";
  return n;
}
async function cloneBase(id, name) {
  const source = await figma.getNodeByIdAsync(id);
  const n = remember(source.clone());
  area.appendChild(n);
  n.name = name;
  for (const child of [...n.children]) child.remove();
  for (const key of Object.keys(n.componentPropertyDefinitions)) n.deleteComponentProperty(key);
  n.description =
    "PROPOSED — требует проверки. Производное локального компонента " +
    id +
    ". Исходник и глобальные токены не изменены. Canonical font Mont; Inter только технический preview.";
  return n;
}
function componentText(n, value, width, role = "Caption") {
  const t = text(n, "Label", value, role, width);
  const key = n.addComponentProperty("Label", "TEXT", value);
  t.componentPropertyReferences = { characters: key };
  t.layoutSizingHorizontal = "FILL";
  return t;
}
function arrangeSet(name, components, x, y, width, height) {
  const set = remember(figma.combineAsVariants(components, area));
  set.name = name;
  set.description =
    "PROPOSED для вакансий. Связь с Angular и причины — в Feature Design / Vacancies. Mont canonical, Inter preview.";
  components.forEach((n, i) => {
    n.x = 24 + (i % 3) * (width + 24);
    n.y = 48 + Math.floor(i / 3) * (height + 36);
  });
  set.resizeWithoutConstraints(
    Math.min(3, components.length) * (width + 24) + 24,
    Math.ceil(components.length / 3) * (height + 36) + 60,
  );
  set.x = x;
  set.y = y;
  return set;
}
const card = await cloneBase("9:470", "Proposed / Card / Vacancy content");
card.x = 40;
card.y = 360;
card.resize(480, 80);
card.layoutSizingVertical = "HUG";
card.layoutMode = "VERTICAL";
bind(card, {
  paddingLeft: "space/20",
  paddingRight: "space/20",
  paddingTop: "space/20",
  paddingBottom: "space/20",
  itemSpacing: "space/0",
  cornerRadius: "radius/medium",
});
card.strokes = [paint("color/border/default")];
card.strokeWeight = 1;
const cardSlot = remember(card.createSlot());
cardSlot.name = "Content";
cardSlot.layoutMode = "VERTICAL";
cardSlot.resize(440, 1);
cardSlot.layoutSizingHorizontal = "FILL";
cardSlot.layoutSizingVertical = "HUG";
cardSlot.fills = [];
card.description +=
  " Card/Feed shell → content slot: нужен разный состав ProjectVacancyCard, VacancyCard, ResponseCard и detail без detach. Radius medium сохраняет 8px кандидата. Angular: _vacancy-ui.scss surface.";
const modal = await cloneBase("8:515", "Proposed / Modal / Vacancy responses");
modal.x = 600;
modal.y = 360;
modal.resize(800, 120);
modal.layoutSizingVertical = "HUG";
const header = remember(figma.createAutoLayout("HORIZONTAL"));
modal.appendChild(header);
header.name = "Header";
header.resize(752, 36);
header.layoutSizingHorizontal = "FILL";
header.layoutSizingVertical = "HUG";
header.fills = [];
bind(header, { itemSpacing: "space/12" });
const title = text(header, "Title", "Отклики на вакансию", "Heading / Medium", 704);
title.layoutSizingHorizontal = "FILL";
const titleKey = modal.addComponentProperty("Title", "TEXT", title.characters);
title.componentPropertyReferences = { characters: titleKey };
const closeSource = await figma.getNodeByIdAsync("5:423");
const close = remember(closeSource.createInstance());
header.appendChild(close);
close.name = "Close / IconButton";
const modalSlot = remember(modal.createSlot());
modalSlot.name = "Content";
modalSlot.layoutMode = "VERTICAL";
modalSlot.resize(752, 1);
modalSlot.layoutSizingHorizontal = "FILL";
modalSlot.layoutSizingVertical = "HUG";
modalSlot.fills = [];
bind(modalSlot, { itemSpacing: "space/16" });
modal.description +=
  " Modal/Wide: вместо одного текстового поля нужен slot списка откликов. Angular: ModalComponent + VacancyResponsesComponent. Escape, focus trap/return; max-height и внутренний scroll.";
const badgeComponents = [];
for (const [name, bg, fg] of [
  ["Hard", "color/status/successSurface", "color/primitive/green/700"],
  ["Soft", "color/action/secondary", "color/text/primary"],
  ["Removable", "color/action/secondary", "color/text/primary"],
]) {
  const b = await cloneBase("5:133", "Kind=" + name);
  b.resize(160, 28);
  b.layoutSizingVertical = "HUG";
  b.minHeight = 28;
  b.fills = [paint(bg)];
  bind(b, {
    paddingLeft: "space/10",
    paddingRight: "space/10",
    paddingTop: "space/4",
    paddingBottom: "space/4",
    itemSpacing: "space/6",
    cornerRadius: "radius/pill",
  });
  const label = componentText(b, name === "Soft" ? "Командная работа" : "TypeScript", 140);
  label.fontSize = 13;
  label.lineHeight = { unit: "PIXELS", value: 18 };
  label.fills = [paint(fg)];
  if (name === "Removable") {
    const source = await figma.getNodeByIdAsync("3:457");
    const icon = remember(source.createInstance());
    b.appendChild(icon);
    icon.name = "Удалить навык";
    icon.resize(12, 12);
  }
  b.description +=
    " Badge/Category: перенос длинного навыка, 13px, min-height 28px; Angular TagComponent внутри VacancySkillsComponent/SkillsBasket. Не доменный статус.";
  badgeComponents.push(b);
}
const badgeSet = arrangeSet("Proposed / Badge / Vacancy skill", badgeComponents, 40, 660, 220, 60);
const statusComponents = [];
for (const [domain, label, bg, fg, stroke] of [
  [
    "vacancy.active",
    "Активна",
    "color/status/successSurface",
    "color/primitive/green/700",
    "color/status/success",
  ],
  [
    "vacancy.closed",
    "Закрыта",
    "color/background/subtle",
    "color/text/primary",
    "color/border/strong",
  ],
  [
    "response.pending",
    "Ожидает решения",
    "color/action/secondary",
    "color/text/primary",
    "color/action/secondary",
  ],
  [
    "response.accepted",
    "Принят",
    "color/status/successSurface",
    "color/primitive/green/700",
    "color/status/success",
  ],
  [
    "response.rejected",
    "Отклонён",
    "color/status/errorSurface",
    "color/text/primary",
    "color/status/errorSurface",
  ],
]) {
  const s = await cloneBase("5:181", "Domain key=" + domain);
  s.resize(180, 26);
  s.layoutSizingVertical = "HUG";
  s.minHeight = 26;
  bind(s, {
    paddingLeft: "space/10",
    paddingRight: "space/10",
    paddingTop: "space/4",
    paddingBottom: "space/4",
    cornerRadius: "radius/pill",
  });
  s.fills = [paint(bg)];
  s.strokes = [paint(stroke)];
  s.strokeWeight = 1;
  const t = componentText(s, label, 158);
  t.fills = [paint(fg)];
  s.description +=
    " Status/D03: только существующая семантика вакансий. pending: Ожидает решения у владельца, На рассмотрении у кандидата. Angular VacancyStatusComponent; isActive/isApproved/responseStatus без новых переходов.";
  statusComponents.push(s);
}
const statusSet = arrangeSet(
  "Proposed / Status / Vacancy domain mapping",
  statusComponents,
  40,
  900,
  220,
  40,
);
const destructive = await cloneBase("5:265", "Proposed / Button / Destructive outline");
destructive.x = 40;
destructive.y = 1220;
destructive.resize(220, 36);
destructive.fills = [];
destructive.strokes = [paint("color/status/error")];
const dl = componentText(destructive, "Удалить", 196, "Button / Compact");
dl.fills = [paint("color/text/primary")];
dl.textAlignHorizontal = "CENTER";
bind(destructive, {
  paddingLeft: "space/12",
  paddingRight: "space/12",
  paddingTop: "space/8",
  paddingBottom: "space/8",
});
destructive.description +=
  " Button/Outline: вторичное опасное действие текущего кандидата. Red border, readable text. Confirmation сохраняется; hover/error-border остаются из существующего red Button. Angular app-button appearance=outline color=red.";
const intro = remember(figma.createAutoLayout("VERTICAL"));
area.appendChild(intro);
intro.name = "Предложения — причины и связь с Angular";
intro.x = 40;
intro.y = 60;
intro.resize(2400, 100);
intro.layoutSizingVertical = "HUG";
intro.fills = [];
bind(intro, { itemSpacing: "space/12" });
text(intro, "Heading", "Предлагаемые расширения · Вакансии", "Heading / Large", 2300);
text(
  intro,
  "Scope",
  "Все объекты ниже — PROPOSED. Существующие masters и глобальные токены не менялись. Card/Feed и Modal/Wide дают основу; slot сохраняет редактируемое содержимое. Badge расширяет читаемость навыков; Status добавляет реальные доменные ключи. Primary всегда существующий Button → color/action/primary #8A63E6.",
  "Body / Small",
  2300,
);
text(
  intro,
  "Font",
  "Канонический шрифт — Mont. Коннектор не предоставляет Mont: Inter используется только как временный Figma-preview. После доступности Mont повторно проверить переносы.",
  "Body / Small",
  2300,
);
return {
  createdNodeIds: [...new Set(created)],
  components: {
    card: card.id,
    modal: modal.id,
    badge: badgeSet.id,
    status: statusSet.id,
    destructive: destructive.id,
  },
  variants: {
    badges: badgeComponents.map(n => ({ id: n.id, name: n.name })),
    statuses: statusComponents.map(n => ({ id: n.id, name: n.name })),
  },
  globalTokensMutated: [],
  existingMastersMutated: [],
  bounds: { card: [card.width, card.height], modal: [modal.width, modal.height] },
};
