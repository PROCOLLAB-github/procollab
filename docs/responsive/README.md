<!-- @format -->

# Responsive PROCOLLAB

Работа выполнена в `feat/dev-platform-responsive` от `origin/dev` (`9acb7ce2`). Основное приложение — Angular `social_platform`; API не изменён. Существующие URL, роли, ограничения редактирования и отправки сохранены.

## Общая система

- `styles/_responsive.scss`: прежние границы tablet 750 / desktop 1000, общие mixins `single-column`, `scroll-tabs`, `mobile-actions`, `apply-mobile`, `apply-below-desktop`.
- `styles/_profile-form.scss` и `styles/_course-task.scss`: общая адаптация шагов профиля и разных видов заданий курса, без копирования одинаковых overrides по экранам.
- `styles/_platform-responsive.scss`: intrinsic sizing, перенос контента, mobile typography, локальный скролл таблиц, sticky header/actions для новых диалогов, правильный слой CDK popup внутри modal.
- Общие Button/Input/Select/Textarea/Autocomplete/Dropdown/Modal/Tooltip/File/Checkbox/Switch: поля и touch-зоны, перенос текста, ограничения viewport. Autocomplete использует CDK connected overlay; подсказка открывается нажатием и клавиатурой.
- AppComponent обновляет CSS-переменные visualViewport; используется `dvh` с fallback. Диалоги учитывают изменение видимой высоты, safe area и прокрутку содержимого.
- Drawer закрывается при переходе, Escape, нажатии на фон и смене ширины на desktop; возвращает фокус и освобождает скролл фона.
- Формы проекта/профиля и onboarding перестраиваются в одну колонку; tabs прокручиваются локально; карточки и команда занимают доступную ширину. Виджет роли мероприятия доступен на mobile.

Аудит также обнаружил существующие препятствия пользовательским сценариям: dashboard при прямом входе читал отсутствующий профиль, подтверждение сброса пароля не имело провайдера формы, stage-0 onboarding не загружал профиль, stage-1 повторно публиковал восстановленный черновик. Исправления ограничены загрузкой/инициализацией UI; предусмотрены regression tests. В Windows исправлено экранирование glob генератора SVG sprite: иконки теперь включаются в production build.

## Проверки

[Checklist](CHECKLIST.md) содержит все декларации router и результаты Desktop → Tablet → 390 → 320. [browser-results.json](browser-results.json) хранит измерения и фактически отрисованные компоненты; [flow-results.json](flow-results.json) — действия и перехваченные тестовые запросы. [screenshots](screenshots/) содержит mobile/desktop примеры и диалоги.

Ширины: 320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1440, 1920. Проверяются длинные строки без пробелов, ФИО/email/навыки/названия файлов, локальный скролл и размер страницы. Проверяются `pageerror` и `console.error`. Начальная структурная инвентаризация сохранена в `routes.json`.

Функциональные проверки в Chrome с touch/mobile viewport 320 и 390: регистрация, вход/drawer, поля профиля/select/datepicker/autocomplete/сохранение, мероприятие → заявка → команда/приглашение → заполнение → подтверждение отправки, эксперт → оценка → подтверждение, поиск вакансии → отклик с файлом → мои отклики, создание проекта/черновик менеджером → принятие отклика, onboarding с образованием/достижением → следующий шаг, ответ в курсе → результаты → курс, single/multiple choice и ответы с файлами, таблицы аналитики/кейсы/подсказки. Проверены 12 длинных навыков, длинный email, пустой поиск, ошибки регистрации, загрузка и неверный ответ курса. Для диалогов приглашения и отклика дополнительно проверена высота viewport 480 px.

Production build успешен. Полный Vitest: 405 файлов, 1997 тестов. ESLint изменённых TypeScript и Stylelint изменённых SCSS проходят. В build остаются существующие предупреждения CommonJS и CSS budget; тесты могут печатать существующий NG0912 двух IconComponent. Матрица содержит 627 измерений на всех 11 ширинах и 30 дополнительных на 749/750/999/1000/1001 px; функциональные проверки — 24 запуска на 320/390 px.

После финальной обработки resize в drawer повторно прошли 3 теста office и оба сценария навигации. Логи сборки и тестов сохранены в `verification/`.

## Воспроизведение

Требуется установленный Playwright и Chrome. Можно использовать модуль Playwright из bundled Codex runtime, задав `PLAYWRIGHT_MODULE` абсолютным путём; `CHROME_PATH` указывает на Chrome. Новая зависимость в package.json не добавлялась.

```powershell
npm ci
npm run build:social:prod
node docs/responsive/serve.cjs
# В другом терминале:
$env:PLAYWRIGHT_MODULE = 'абсолютный путь к модулю playwright'
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
node docs/responsive/browser-check.cjs
node docs/responsive/flow-check.cjs
node docs/responsive/report.cjs
```

Все внешние запросы перехватываются. API-фикстуры полностью синтетические; регистрация, приглашения, отправка проекта и оценки не затрагивают живую базу. Число rows сверяется, а процесс завершается с ошибкой при переполнениях или ошибках браузера.

## Границы проверки

Chrome automation проверяет layout и работу UI с API-контрактами. Доставка писем, сохранение на настоящем backend, ограничения конкретного аккаунта, настоящий WebSocket и внешний admin не проверялись. Не созданы отсутствующие интерфейсы администратора или редактирования мероприятий.

Перед выпуском остаётся проверка на физических Safari iOS и Chrome Android: экранная клавиатура в длинных формах/диалогах, browser toolbar, safe area в portrait/landscape, native picker файлов и даты. Изменение viewport в headless Chrome проверено, но не заменяет эту проверку устройств.
