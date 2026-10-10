<!-- @format -->

# Мобильный frontend-релиз без изменения desktop

Следующий production fix: [мобильные дефекты после #407](./fixes-20261010/README.md).
Ниже сохранён исторический отчёт первоначального релиза #407.

Дата проверки: 10.10.2026. Target: `master`, ветка `release/prod-mobile-responsive-20261010`.

## Границы релиза

База — текущий production `11bec95e8dc3bc48d9d4fe491c9b6a0c18968850`.
Его успешный [Deploy to server](https://github.com/PROCOLLAB-github/procollab/actions/runs/37224199351)
проверен перед подготовкой релиза. Адаптив и его исправления перенесены из dev до
`f3df1c8808c8f2fe352eaac70f28c34da0eae828` (PR #401, #403, #405, #406).
Другие dev-функции не включены: это отдельная ветка от production, а не merge всего dev.

Desktop сохраняет **текущую production-композицию**, включая production-центр backend-уведомлений.
Это отличается от восстановления прежнего dev в #403: production и dev уже содержали разные изменения.
Для `>=1000px` сохранены исходные шаблоны master; адаптивные шаблоны включаются через
`DesktopLayoutService`. Новые геометрия, типографика и tokens ограничены `max-width: 999px`.
У компонентов с `ng-content` сохранён единственный projection slot; CSS-классы мобильного поля даты
действуют только ниже 1000px. Shared Button сохраняет desktop-геометрию и прежнее поведение loading.
На основной странице программы оставлен единый исходный шаблон: это сохраняет timing view queries
и расчёт раскрытия описания; role widget добавляется только для мобильного режима.
Состояние проекта на desktop по-прежнему называется «В программе».

В релиз входят Office/navigation, Feed/FeedFilter, проекты/InfoCard, участники, программы,
детали проекта/профиля/программы, вакансии, курсы, редакторы, onboarding и shared UI.
Мобильная шапка светлая, название раздела по центру. Сохранены исправления приглашений, кнопок,
подсказок, длинных навыков, полей даты и строк аналитики из mobile smoke-test.

## API, права и поведение

Endpoints, payload обязательных полей, роли, permissions, роуты и доменные правила не меняются.
Добавлено только необязательное имя связанной программы в модели/DTO. Production notification center
сохранён, его запросы и обработка не заменены старой реализацией из dev.

Изменения frontend-поведения явно включены: ожидание загрузки профиля при прямом переходе в проекты
и onboarding, защита от цикла обновления формы, продолжение WS reconnect и его teardown.
WS-сбой скрытых чатов не показывает два глобальных сообщения о потере интернета; HTTP-ошибки
отдельных операций сохраняют прежнюю обработку. Эти исправления не меняют бизнес-правила.

## Выполненные проверки

- `npm run build:prod`: exit 0, исходные CSS budgets не повышались.
- `npm run test:ci`: 413 файлов, **2099 тестов**, exit 0.
- После последней правки mobile-классов поля даты: InputComponent, **20 тестов**, exit 0.
- После сохранения единого шаблона программы: MainComponent, **2 теста**, exit 0.
- `npm run lint:ts`: exit 0, 0 errors; 6 прежних warnings об unused eslint-disable.
- Stylelint для 135 изменённых SCSS: exit 0, без отключения правил в конфигурации.
- `npm run format:check`: проверка полного Git index с LF, как на Linux CI.
- Desktop pixel regression: **66/66**, 0 отличающихся RGB-пикселей, включая **1000/1440/1920px**.
  Машинный отчёт: [desktop-comparison.json](./desktop-comparison.json).
- Mobile: **320/390/768px**, 16 страниц и 6 дополнительных состояний на каждой ширине;
  проверены viewport overflow, центрирование приглашений, интервалы между кнопками, ширина даты,
  неперекрывающиеся подсказки, одинаковая типографика полей, единственная рамка поиска,
  footer диалога, скрытие пустых контактов и фон строк «Требует внимания».
- WS: два последовательных сбоя и восстановление, HTTP доступен; глобальных WS-toast нет,
  reconnect продолжается, онлайн-статусы возвращаются. Проверка с production retry interval 5000ms.

Desktop gate сравнивает 22 состояния: Feed; проекты; Members; Programs; программа; профиль;
проект; Vacancies; вакансия; Courses; курс; редакторы профиля и проекта; partners/resources;
analytics; диалог приглашения; список приглашений; поля, цели и добавленная цель проекта;
строки attention; выбранный участник приглашения.

Сравнение сделано в одном Chrome/Windows на одинаковых синтетических данных, времени и viewport.
Сборки доставляются **без изменения CSS/JS**. Нет screenshot masks, tolerance или исключённых областей.
Перед снимками ожидаются загрузка шрифтов/изображений, данные страницы и два rendering frames.
Описание программы заведомо длинное: проверяется раскрытие длинного текста без пограничного
сравнения высоты строки при загрузке шрифта. Проверка программы на 1000px повторена три раза для каждой сборки с проверкой идентичности повторных PNG. Некорректный внешний
avatar-placeholder исключён корректным локальным изображением в обоих fixture-наборах;
runtime-код по этому поводу не изменён. Animations/caret отключены одинаково в обеих сборках.

## Примеры снимков

[Feed, 390px](./screenshots/feed-390.png) · [Приглашения](./screenshots/projects-invites-390.png) ·
[Поля редактора](./screenshots/project-edit-fields-390.png) · [Диалог](./screenshots/team-invite-selected-390.png) ·
[Программа](./screenshots/program-390.png) · [Attention](./screenshots/analytics-attention-390.png).

Программа на desktop 1440px: [production baseline](./screenshots/program-1440-baseline.png) и
[release](./screenshots/program-1440-verified.png), 0 изменённых пикселей.

## Воспроизведение browser gate

Нужны Chrome, Playwright и Python с Pillow/NumPy. API и WebSocket перехватываются harness;
реальные запросы и отправка приглашений не выполняются. `QA_BUILD_ROOT` указывает на production build.
`QA_SCREENS=program` позволяет отдельно повторить одну страницу, но полный gate требует все 22 состояния.

Сначала соберите baseline из указанного master SHA в отдельном checkout через `npm ci` и
`npm run build:prod`, затем текущую ветку. Скопируйте baseline dist вне текущего dist.
Пример PowerShell (пути к Playwright/Chrome/Python задаются локально):

```powershell
$env:PLAYWRIGHT_MODULE = 'C:/path/to/node_modules/playwright'
$env:CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:QA_BUILD_ROOT = 'C:/path/to/baseline-dist'
node docs/mobile-production/visual.cjs baseline http://127.0.0.1:4461 '1000,1440,1920' .qa-mobile/screenshots
node docs/mobile-production/visual.cjs baseline http://127.0.0.1:4461 '1000,1440,1920' .qa-mobile/screenshots details

$env:QA_BUILD_ROOT = 'dist/social_platform'
node docs/mobile-production/visual.cjs verified http://127.0.0.1:4462 '320,390,768,1000,1440,1920' .qa-mobile/screenshots
node docs/mobile-production/visual.cjs verified http://127.0.0.1:4462 '320,390,768,1000,1440,1920' .qa-mobile/screenshots details
python docs/mobile-production/compare.py .qa-mobile/screenshots/baseline .qa-mobile/screenshots/verified docs/mobile-production/desktop-comparison.json
node docs/mobile-production/connection.cjs http://127.0.0.1:4462 .qa-mobile/connection
```

HTTP-сервер для этих команд не требуется: `preview.cjs` читает build bytes напрямую.
Сохраняйте exit status каждой команды. Недостающий PNG или хотя бы один изменённый пиксель завершает
`compare.py` с ошибкой. Не используйте baseline из dev вместо указанного production SHA.

## Acceptance criteria

- [x] Релиз изолирован от прочих изменений dev и основан на текущем prod.
- [x] Desktop >=1000px сохраняет внешний вид: 66 точных pixel comparisons.
- [x] Mobile/tablet 320/390/768px сохраняет адаптив и исправления из smoke-test.
- [x] Production notification center, API contracts и permissions сохранены.
- [x] Tests, lint, stylelint, format и production build проходят.

## Ограничения и проверка после выкладки

Это browser regression на synthetic fixtures, не проверка физических устройств или live API.
Реальные iOS/Android, Safari/WebKit, клавиатура устройства, camera/file upload и live-данные
в этой сессии не проверялись. Auth/onboarding охвачены source review/tests/build, но не входят
в 66 desktop-снимков. Варианты всех ролей и hover/focus на всех страницах не охвачены pixel gate.

После выкладки на реальных iOS/Android: открыть проекты/приглашения, редактор проекта
(дата, подсказки, кнопки, добавление цели), приглашение участника с клавиатурой, программу и analytics;
проверить навигацию, поля, загрузку файла и возврат после временной потери сети.
На desktop: проверить реальные проекты/профиль/программу и уведомления на 1440/1920px.

Frontend deploy запускает существующий workflow при merge в master. Backend deploy и data migration
не требуются. Откат — revert release commit отдельным PR в master с повторным frontend deploy.
Не откатывать последующие независимые изменения whole-branch reset.
