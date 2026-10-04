/** @format */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const directory = __dirname;
const summary = JSON.parse(fs.readFileSync(path.join(directory, "summary.json"), "utf8"));
const audit = JSON.parse(fs.readFileSync(path.join(directory, "audit.json"), "utf8"));
const repository = path.resolve(directory, "../..");
const templates = audit.componentTemplates.filter(file =>
  fs.existsSync(path.join(repository, file)),
);
assert.equal(templates.length, 80);
const templateList = templates.map((file, index) => `${index + 1}. \`${file}\``).join("\n");
const sharedSources = [
  ...new Set(
    audit.changedFiles
      .filter(file =>
        /^(?:projects\/ui\/src\/lib\/components\/|projects\/social_platform\/src\/app\/ui\/(?:primitives|widgets)\/)/.test(
          file,
        ),
      )
      .filter(file => /\.component\.(?:ts|html|scss)$|\.directive\.ts$/.test(file))
      .map(file => file.replace(/\.component\.(?:html|scss)$/, ".component.ts"))
      .filter(file => fs.existsSync(path.join(repository, file))),
  ),
].sort();
const sharedList = sharedSources.map(file => `- \`${file}\``).join("\n");
const branch = "feat/dev-ui-kit-unification";
const blob = `https://github.com/PROCOLLAB-github/procollab/blob/${branch}/docs/ui-kit`;
const raw = `https://raw.githubusercontent.com/PROCOLLAB-github/procollab/${branch}/docs/ui-kit/screenshots`;
const screens = [
  ["Лента", "feed"],
  ["Проекты", "projects"],
  ["Вакансии", "vacancies"],
  ["Программы", "programs"],
  ["Курсы", "courses"],
  ["Участники", "members"],
  ["Профиль", "profile"],
  ["Редактирование профиля", "profile-edit"],
];
const comparisons = screens
  .map(
    ([title, name]) => `<details>
<summary>${title}: до/после</summary>

| Viewport | До (responsive baseline) | После (UI Kit) |
| --- | --- | --- |
| 390 px | <img width="270" alt="${title} до, 390 px" src="${raw}/before/${name}-390.png"> | <img width="270" alt="${title} после, 390 px" src="${raw}/after/${name}-390.png"> |
| 1440 px | <img width="540" alt="${title} до, 1440 px" src="${raw}/before/${name}-1440.png"> | <img width="540" alt="${title} после, 1440 px" src="${raw}/after/${name}-1440.png"> |

</details>`,
  )
  .join("\n\n");
const body = `После responsive-адаптации одинаковые элементы платформы использовали отдельные реализации и локальные цвета, размеры и состояния. Общий UI Kit теперь задаёт кнопки и поля от 44 px, типографику, карточки, вкладки, диалоги, сообщения и заголовки страниц. Например, loading сохраняет название действия и блокирует повторную отправку; короткие подписи и CTA в карточках помещаются на mobile и desktop.

**База PR:** \`dev\` на момент создания PR — \`9acb7ce2\`. Включены предыдущий responsive-коммит \`bc4940c5\`, UI Kit \`74a94c9b\` и финальные проверки. Скриншоты «до» показывают responsive baseline, «после» — UI Kit. Предыдущий этап описан в [responsive README](https://github.com/PROCOLLAB-github/procollab/blob/${branch}/docs/responsive/README.md).

### Компоненты

| Семейства | Общий источник и миграция |
| --- | --- |
| Button, Icon, Avatar, Loader | Одна реализация в \`@uilib\`; старые импорты реэкспортируют тот же класс. Native ButtonDirective использует тот же foundation, сохраняя form/ARIA/HTMLElement refs. |
| Input, Textarea, Select, Dropdown, Search, Autocomplete | Общие control tokens, focus/error/disabled; сохранены CVA/валидация/overlay. Select поддерживает клавиатурное открытие и disabled. |
| Checkbox, Radio | Общие состояния; семантический Checkbox с клавиатурой и native/rich radio adapters. |
| Tabs, Page Header, Back | Общие Tabs с active/disabled/mobile scroll; Bar/BarNew и navigation adapters. PageHeader поддерживает title/description/breadcrumbs/actions. |
| Modal/Dialog, Drawer, Card | Общие sizes/surface/padding/scroll/focus; DialogHeader/Body/Footer и Card/Drawer adapters, сохранены доменные layouts и правила закрытия. |
| Badge/Tag, Table, Pagination | VacancyStatus и старый kanban Badge — адаптеры; доступность курса — Badge; таблицы и пагинация аналитики используют общие стили. |
| Filters, Form layouts, Empty/Loading/Error, Alerts/Notifications | Общие adapters, StateComponent и семантические tokens; существующий Snackbar. |

Переведены ${summary.migratedTemplates} HTML-шаблонов; удалены ${summary.removedDuplicateTemplates} дублирующих HTML/SCSS. Аудит подтверждает ${summary.canonicalComponents} канонических компонентов и отсутствие локальных hex/rgb/hsl цветов в component SCSS. Полные списки и правила: [UI-KIT.md](${blob}/UI-KIT.md), [audit.json](${blob}/audit.json), [REPORT.md](${blob}/REPORT.md).

<details>
<summary>Все 80 переведённых HTML-шаблонов</summary>

${templateList}

</details>

<details>
<summary>Изменённые shared-компоненты и адаптеры: ${sharedSources.length} исходников</summary>

Список включает канонические компоненты, compatibility reexports, общие form controls и переиспользуемые widgets. Для компонентов, изменённых только в HTML/SCSS, указан соответствующий TS-источник. В \`ui-adapters.directive.ts\` находятся Card, Field, Choice, Table, FormLayout, Filters, DialogBody, DialogFooter, Drawer и Alert. Foundations: \`_ui-tokens.scss\`, \`_ui-foundation.scss\`, \`_ui-system.scss\`, \`_typography.scss\`.

${sharedList}

</details>

### Граница бизнес-логики

**Унификация UI Kit сохраняет бизнес-правила:** не меняет API/DTO, доменные use cases, permissions, router declarations и обработчики отправки форм. Сравнение \`bc4940c5..74a94c9b\`: 284 UI-файла, 0 изменений защищённых слоёв. Сравнение AST существующих методов выявило 7 UI-классов; изменения вручную проверены как keyboard/disabled guards, делегирование прежних events и удаление дублирующих presentation-классов. Данные проверки: [business-boundary.json](${blob}/business-boundary.json). Финальный CSS-fix auth влияет только на desktop-отступ регистрации.

Весь PR также содержит предыдущий responsive-коммит с **двумя явно раскрытыми правками инициализации onboarding**: \`onboarding-stage-zero-info.service.ts\` загружает профиль перед инициализацией, сохраняя draft; \`onboarding-stage-one-ui-info.service.ts\` использует \`emitEvent: false\` при заполнении формы. Это исполняемая логика инициализации, поэтому утверждение «во всём PR нет изменений вне presentation» было бы неточным. Контракты, правила валидации, права и бизнес-действия сохранены; обе правки покрыты regression tests.

### Страницы

- Office feed: фильтры, новости/диалог, формы, состояния и drawer.
- Projects: PageHeader/CTA, dashboard/my/subscriptions/invites/all, карточки, шаги создания/редактирования, команда и приглашения.
- Vacancies: PageHeader/Tabs, карточки, фильтры, отклики/диалог и статусы.
- Programs: список/карточки, заявка и команда, экспертная оценка, аналитика и пагинация.
- Courses: заголовок, карточки/Badge, варианты заданий и результаты.
- Members: заголовок, фильтры/диалог, карточки и состояния.
- Profile: длинное ФИО в PageHeader, вкладки/формы редактирования, общие действия.
- Auth/Onboarding и общие widgets: поля, формы, состояния, чат, новости, файлы и region/skills selectors.

### Проверки

- Финальная проверка шести запрошенных разделов и состояний — **64/64 passed** на 320/390/768/1440 px: 32 проверки проектов, вакансий, программ, курсов, профиля/редактора и onboarding 0/1 + 32 проверки loading/empty/error/disabled/validation. HTTP 500 и успешный retry проверены отдельно. Визуальный просмотр подтверждён скриншотами. Найденный desktop-отступ регистрации исправлен до merge и повторно проверен. [FINAL-CHECKS.md](${blob}/FINAL-CHECKS.md).
- Production build и development build (\`build:pr\`) после финального CSS-fix — успешно. CI-equivalent Prettier — 0 нарушений; на Windows учтены checkout CRLF и локальный ignored dist.
- Полный Vitest — **${summary.tests} тестов / ${summary.testFiles} файлов**, затем **${summary.targetedTests} тестов** затронутых финальными layout-правками компонентов.
- ESLint — 0 ошибок (6 прежних warnings); Stylelint — 0 ошибок.
- **${summary.browserMeasurements} измерений**: ${summary.routes} URL/состояний форм × ${summary.widths.length} ширин (${summary.widths.join(", ")} px); без overflow/pageerror/console.error. Последние изменения дополнительно проверены на 12 основных экранах.
- **${summary.flows} функциональных запусков** (12 сценариев × 320/390 px), включая формы, отправку, загрузку файлов, select/datepicker, задания курсов и таблицы. Редактор профиля повторно проверен после финальной компоновки заголовка.
- **${summary.geometryChecks} проверок геометрии**: цели ≥44 px, CTA внутри карточек, иконка меню не сжата, короткие подписи не переносятся.
- **${summary.screenshotPairs} пар скриншотов** до/после на 320/390/1440 px. Логи, JSON и все пары — в [REPORT.md](${blob}/REPORT.md).

### Проверка после merge

По запросу пользователя после merge #401 в dev требуется smoke-test на **реальных iOS Safari и Android Chrome** на dev-стенде, перед prod. Сейчас этот пункт **не выполнен**: доступ к устройствам/облачному сервису, точный frontend URL и тестовый аккаунт не предоставлены. [Чек-лист и форма результата](${blob}/IOS-ANDROID-SMOKE.md). Найденные после merge проблемы исправляются отдельными PR в dev. До успешного физического smoke-test унификация не считается полностью закрытой.

### Скриншоты

${comparisons}

### Известные ограничения

Browser QA выполнена в Chrome с синтетическими API fixtures: записи в реальный backend, письма, WebSocket и права конкретного аккаунта не проверялись. Физические Safari iOS/Chrome Android, клавиатура и системные pickers требуют проверки на устройствах. Некоторые внешние изображения fixtures недоступны на обеих версиях. В build остаются прежние Sass/CommonJS/budget warnings. Канбан остаётся отключён существующими маршрутами; адаптеры проверены сборкой/unit suite. Специальный контент карточек, графиков и заданий сохраняет доменные layouts поверх общего UI Kit.
`;
fs.writeFileSync(path.join(directory, "PR.md"), body);
console.log(`PR body written (${body.length} characters)`);
