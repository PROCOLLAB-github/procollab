/** @format */

const page = await figma.getNodeByIdAsync("0:1");
await figma.setCurrentPageAsync(page);
await Promise.all(
  ["Regular", "Semi Bold", "Bold"].map(style => figma.loadFontAsync({ family: "Inter", style })),
);
const vars = Object.fromEntries(
  (await figma.variables.getLocalVariablesAsync()).map(v => [v.name, v]),
);
const styles = await figma.getLocalTextStylesAsync();
const made = [];
const mark = n => (made.push(n.id), n);
const paint = name =>
  figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    "color",
    vars[name],
  );
function bind(n, fields) {
  for (const [field, name] of Object.entries(fields)) n.setBoundVariable(field, vars[name]);
}
function frame(parent, name, width, mode = "VERTICAL", gap = 16) {
  const n = mark(figma.createAutoLayout(mode));
  parent.appendChild(n);
  n.name = name;
  n.resize(width, 1);
  n.layoutSizingVertical = "HUG";
  n.fills = [];
  n.itemSpacing = gap;
  if (vars["space/" + gap]) bind(n, { itemSpacing: "space/" + gap });
  return n;
}
function fill(n) {
  n.layoutSizingHorizontal = "FILL";
  return n;
}
function text(
  parent,
  name,
  value,
  role = "Body / Small",
  width = 300,
  color = "color/text/primary",
) {
  const n = mark(figma.createText());
  parent.appendChild(n);
  n.name = name;
  const style = styles.find(s => s.name.endsWith("/ " + role));
  if (!style) throw Error("No style " + role);
  n.textStyleId = style.id;
  n.characters = value;
  n.fills = [paint(color)];
  n.resize(width, 20);
  n.textAutoResize = "HEIGHT";
  return n;
}
const ids = [
  "53:1751",
  "53:1763",
  "53:1778",
  "53:1781",
  "53:1784",
  "53:1791",
  "53:1794",
  "53:1797",
  "53:1800",
  "53:1803",
  "53:1807",
  "5:233",
  "5:265",
  "5:85",
  "5:423",
  "11:289",
  "8:538",
  "6:825",
  "6:568",
  "6:589",
  "6:75",
  "6:313",
  "6:384",
  "6:456",
  "6:507",
  "9:365",
  "9:375",
  "3:457",
];
const sources = Object.fromEntries(
  await Promise.all(ids.map(async id => [id, await figma.getNodeByIdAsync(id)])),
);
function inst(parent, id, name, w) {
  const n = mark(sources[id].createInstance());
  parent.appendChild(n);
  n.name = name;
  if (w !== undefined) n.resize(w, n.height);
  return n;
}
function prop(n, start, value) {
  const key = Object.keys(n.componentProperties).find(
    k => k === start || k.startsWith(start + "#"),
  );
  if (!key) throw Error("No prop " + start + " on " + n.name);
  n.setProperties({ [key]: value });
}
function button(parent, label, variant = "primary", width = 180) {
  const id = variant === "danger" ? "53:1807" : variant === "outline" ? "5:265" : "5:233";
  const n = inst(parent, id, "Button / " + variant + " / " + label, width);
  prop(n, "Label", label);
  n.resize(width, 36);
  n.layoutSizingVertical = "FIXED";
  n.minHeight = 36;
  return n;
}
function status(parent, kind, label) {
  const id = {
    active: "53:1791",
    closed: "53:1794",
    pending: "53:1797",
    accepted: "53:1800",
    rejected: "53:1803",
  }[kind];
  const value =
    label ||
    {
      active: "Активна",
      closed: "Закрыта",
      pending: "Ожидает решения",
      accepted: "Принят",
      rejected: "Отклонён",
    }[kind];
  const n = inst(parent, id, "Status / " + kind, Math.max(70, value.length * 6.5 + 24));
  prop(n, "Label", value);
  n.layoutSizingVertical = "HUG";
  return n;
}
const skillNames = [
  "TypeScript",
  "Angular",
  "Проектирование пользовательских интерфейсов",
  "SCSS",
  "JavaScript",
  "Figma",
  "Git",
  "CSS",
  "HTML",
  "Командная работа",
  "Аналитика",
];
function skills(parent, width, limit = 3, empty = false, expanded = false) {
  if (empty)
    return fill(
      text(parent, "Empty skills", "Навыки не указаны", "Caption", width, "color/text/secondary"),
    );
  const row = fill(frame(parent, "Навыки / перенос строк", width, "HORIZONTAL", 8));
  row.layoutWrap = "WRAP";
  row.counterAxisSpacing = 8;
  bind(row, { counterAxisSpacing: "space/8" });
  const list = expanded ? skillNames : skillNames.slice(0, limit);
  for (const s of list) {
    const b = inst(
      row,
      s === "Командная работа" ? "53:1781" : "53:1778",
      "Badge / " + s,
      Math.min(width, Math.max(62, s.length * 7 + 22)),
    );
    prop(b, "Label", s);
    b.layoutSizingVertical = "HUG";
  }
  if (!expanded && limit < skillNames.length) {
    const n = inst(row, "53:1781", "Skills toggle / hidden count", 82);
    prop(n, "Label", "Ещё +" + (skillNames.length - limit));
  }
  return row;
}
function avatar(parent) {
  const a = inst(parent, "5:85", "Avatar / project image", 40);
  a.resize(40, 40);
  a.fills = [
    { type: "IMAGE", imageHash: "9730e776be6dc1bbfa02b19380b7d1cc6f4b5e0c", scaleMode: "FILL" },
  ];
  for (const n of a.children) n.visible = false;
  return a;
}
function identity(parent, width, candidate = false) {
  const r = fill(frame(parent, "Identity / Avatar + name", width, "HORIZONTAL", 12));
  r.counterAxisAlignItems = "CENTER";
  avatar(r);
  const c = fill(frame(r, "Identity text", width - 52, "VERTICAL", 4));
  fill(
    text(
      c,
      "Name",
      candidate ? "Анна Смирнова" : "Проект: PROCOLLAB — платформа для совместных проектов",
      candidate ? "Heading / Small" : "Caption",
      width - 52,
    ),
  );
  if (candidate)
    fill(
      text(c, "Position", "Frontend-разработчик", "Caption", width - 52, "color/text/secondary"),
    );
  return r;
}
function rule(parent, width) {
  const n = mark(figma.createRectangle());
  parent.appendChild(n);
  n.name = "Divider / border default";
  n.resize(width, 1);
  n.fills = [paint("color/border/default")];
  n.layoutSizingHorizontal = "FILL";
  return n;
}
function cardBody(parent, width) {
  const card = inst(parent, "53:1751", "Card / Vacancy content", width);
  card.layoutSizingHorizontal = "FILL";
  card.layoutSizingVertical = "HUG";
  const slot = card.findOne(n => n.type === "SLOT");
  const f = frame(page, "Content", width - 42, "VERTICAL", 16);
  slot.appendChild(f);
  const content = slot.children[slot.children.length - 1];
  content.layoutSizingHorizontal = "FILL";
  content.layoutSizingVertical = "HUG";
  return { card, content, width: width - 42 };
}
const longTitle = "Frontend-разработчик для развития образовательной платформы PROCOLLAB";
const description =
  "Развиваем платформу, которая помогает находить команду и запускать проекты. Ищем разработчика, которому интересно делать сложные сценарии простыми.";
const letter =
  "Хочу участвовать в развитии PROCOLLAB. Два года работаю с Angular и TypeScript, проектирую доступные интерфейсы и пишу тесты. Готов обсудить задачи и показать примеры своих работ.";
function allIds(n) {
  return [n.id, ...("children" in n ? n.children.flatMap(allIds) : [])];
}
