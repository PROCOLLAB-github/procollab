# Редизайн вакансий PROCOLLAB

Дизайн согласован пользователем 29.09.2026: [Feature Design / Vacancies в Figma](https://www.figma.com/design/tvog0fpEgWgEtr7KUTjbyE?node-id=51-1751). Ветка `feat/dev-vacancy-interface-redesign`, база `origin/dev @ c1dddf03`. PROPOSED разрешены только для вакансий; глобальные компоненты и токены UI KIT не изменены.

**DEV round-trip подтверждён на исправленной локальной сборке:** тестовая вакансия №104 в проекте №131, POST 201 → GET 200 → PATCH 200 → новый GET 200. После изменения навыков сохранены Angular, CSS и зарплата 100 ₽. [Draft PR #393](https://github.com/PROCOLLAB-github/procollab/pull/393) открыт в dev; merge/deploy не выполнялись. [Подробный отчёт реализации](implementation-review.md).

## Исправление навыков

До исправления 8 регрессионных тестов падали: конкурирующие ответы поиска, очистка/уничтожение, повторный запрос после выбора, поздний ответ при debounce нового ввода, сброс корзины и загрузка библиотеки после выбранных значений.

- `SearchesService` отменяет старый запрос через `switchMap`, обрабатывает ошибку внутри запроса и завершает подписку при уничтожении.
- Редактор вакансии использует локальный экземпляр сервиса: чужая форма не заменяет `inlineSkills`.
- Autocomplete сразу инвалидирует запрос при вводе/очистке; новый отправляется после debounce. Программный сброс участвует в `distinctUntilChanged`, поэтому повторный поиск того же текста работает.
- Навыки остаются в форме и сравниваются по id. Checked библиотеки вычисляется из options и selected независимо от порядка загрузки; сброс CVA очищает корзину.
- Локально проверены поиск, библиотека, удаление, дедупликация, создание, редактирование, сохранение и повторное открытие с id из ответа.

На DEV обнаружена и исправлена потеря зарплаты при изменении только навыков: числовой ответ API нормализуется в строку контрола; пробелы разрядов удаляются перед отправкой, пустая сумма остаётся null. До исправления ещё 3 регрессии падали; после исправления проходят.

Сохранены все шесть областей кандидата. Длинные названия переносятся, навыки сворачиваются с точным количеством скрытых, письмо раскрывается. Подтверждение создания появляется после успеха; двойная отправка блокируется, новая вакансия сразу видна в проекте. API-контракты, маршруты и права не менялись.

## Figma и UI KIT

[Исходный аудит и полная таблица «элемент → Figma → токен → Angular»](figma/design-review.md). В Figma 12 редактируемых экранов и доска состояний; 358 instances и 1169 слоёв с boundVariables. Проверена сама страница UI KIT.

| Элемент | Figma | Токен / Angular |
|---|---|---|
| CTA / outline | Button Primary 5:233 / Outline 5:265 | action/primary → --accent #8A63E6; существующий ButtonComponent |
| Карточки | PROPOSED Card content 53:1751 от Feed 9:470 | background/primary, border/default, radius/medium; доменные карточки и surface mixin |
| Навыки | PROPOSED Badge 53:1790 Hard/Soft/Removable | successSurface / action/secondary, text/primary; TagComponent + VacancySkills / SkillsBasket |
| Статусы | PROPOSED Status 53:1806 | active/closed/pending/accepted/rejected; VacancyStatusComponent |
| Окна | PROPOSED created 62:3224 / responses 53:1763 | space/24, mobile space/16; ModalComponent + доменный контент |
| Заголовок / поиск | PageHeader 11:289 / Search Toolbar 6:825 | BackComponent / SearchComponent и локальные SCSS-адаптеры |

Относительно прежней галереи восстановлены **#8A63E6** и стандартный hover Button #9764BA; «Принять» использует Primary. Убраны локальные затемнения/смешанные цвета, уточнены отступы, навыки, заголовки, вертикальные mobile actions и ширины окон 520/800 px. Добавлено пустое состояние каталога после успешной загрузки.

Angular загружает **настоящий Mont**. В Figma явно обозначен временный Inter, поэтому идентичность метрик шрифта не заявляется. Все шесть областей сверены с Figma; глобальные шрифты, токены, Button/Back masters не изменены. Generic runtime Card/Status/PageHeader и Code Connect здесь нет: используются доменные адаптеры.

## Проверки

| Проверка | Результат |
|---|---|
| Регрессии до исправления | 4 файла: 8 failed / 5 passed |
| Полный Vitest после исправления навыков | **403 файла / 1960 тестов passed**, Node 20.20.2, heap 8 GB, 2 workers |
| Повторный Vitest после последних UI-изменений | **17 файлов / 85 тестов passed** |
| Production npm run build:prod после последних изменений | exit 0; initial 1,39 MB, transfer estimate 313,30 kB |
| Браузер: дизайн / состояния | **399 проверок / 52 состояния**, ширины 1440/768/390/320; JS errors [] |
| Браузер: навыки | **18 проверок**, два отменённых запроса, поиск/библиотека/round-trip на fixtures; JS errors [] |
| Шрифт / CTA | Загруженный FontFace Mont, computed font-family, #8A63E6 и hover подтверждены |
| ESLint / Stylelint | Изменённые TypeScript / SCSS passed |
| Impeccable detector | [] |
| DEV API | **Passed**: поиск, библиотека, удаление, create/edit/save/reopen, mobile; [evidence](dev-results.json) |

Полный Vitest выполнен после исправления поиска, до последних UI-правок и найденной на DEV ошибки преобразования зарплаты. После последних исходников прошли затронутый набор 17/85, production build, оба браузерных набора и DEV round-trip. Новый полный прогон не заявляется.

Проверены длинные строки без пробелов, 0/1/11 навыков, пустые данные, статусы, ошибка/повтор создания, guard двойной отправки, обе кнопки success dialog, вложение, accept/reject на fixtures, клавиатура/focus/Escape/возврат фокуса и отсутствие горизонтального переполнения. Это не полный аудит доступности.

Сборка имеет предупреждения Angular templates, Sass deprecations, CommonJS и warning-бюджетов CSS/initial bundle; бюджеты не повышались. Vitest сообщает существующие предупреждения NG0912.

### Контраст — ограничение, а не PASS

#FAFAFA на существующем CTA #8A63E6 — **4,02:1**, ниже WCAG AA 4,5:1 для обычного текста. Ограничения также есть у hover (≈4,15:1), outline (≈4,19:1) и вторичного серого текста (≈4,00:1). Глобальные токены сохранены по согласованию. Полное прохождение контраста не заявляется; выборки сохранены в visual-results.json.

## Скриншоты

[Галерея Angular](gallery.html). Снимки ниже обновлены после согласования, с Mont, на синтетических данных. Preview заменяет оболочку кабинета и подменяет use cases; это не DEV backend. Обзор overview.png также обновлён.

| Область | Desktop 1440 | Tablet 768 | Mobile 390 |
|---|---|---|---|
| Проект | [PNG](screenshots/project-1440.png) | [PNG](screenshots/project-768.png) | [PNG](screenshots/project-390.png) |
| Каталог | [PNG](screenshots/catalog-1440.png) | [PNG](screenshots/catalog-768.png) | [PNG](screenshots/catalog-390.png) |
| Вакансия | [PNG](screenshots/detail-1440.png) | [PNG](screenshots/detail-768.png) | [PNG](screenshots/detail-390.png) |
| Успех | [PNG](screenshots/created-1440.png) | [PNG](screenshots/created-768.png) | [PNG](screenshots/created-390.png) |
| Отклики | [PNG](screenshots/responses-1440.png) | [PNG](screenshots/responses-768.png) | [PNG](screenshots/responses-390.png) |
| Мои отклики | [PNG](screenshots/my-1440.png) | [PNG](screenshots/my-768.png) | [PNG](screenshots/my-390.png) |
| Навыки | [PNG](screenshots/skills-editor-1440.png) | — | [PNG](screenshots/skills-editor-390.png) |

## Повторение

Из корня рабочей копии, Node 20:

```powershell
$env:npm_config_script_shell='C:\Program Files\Git\bin\bash.exe'
npm run build:prod
node --max-old-space-size=8192 node_modules/vitest/vitest.mjs run --pool=forks --maxWorkers=2
npx ng build social_platform --configuration=development --browser=docs/vacancy-redesign/preview/main.ts --ts-config=docs/vacancy-redesign/preview/tsconfig.json --index=docs/vacancy-redesign/preview/index.html --output-path=tmp/vacancy-preview
```

Из tmp/vacancy-preview/browser запустить Python с абсолютным путём к preview/serve.py и портом 4358. Затем из корня (PLAYWRIGHT_MODULE и CHROME_PATH задают установленные Playwright/Chrome):

```powershell
node docs/vacancy-redesign/preview/visual-acceptance.cjs
node docs/vacancy-redesign/preview/skills-acceptance.cjs
```

Отдельная сборка реального приложения с DEV API, без fixture providers:

```powershell
npx ng build social_platform --configuration=development --browser=docs/vacancy-redesign/preview/dev-main.ts --ts-config=docs/vacancy-redesign/preview/tsconfig.dev.json --output-path=tmp/vacancy-dev
```

Из tmp/vacancy-dev/browser запустить Python с абсолютным путём к preview/serve-dev.py и открыть http://127.0.0.1:4360/auth/login. Proxy слушает только loopback, пересылает запросы на фиксированный https://dev.procollab.ru, не записывает credentials/body/query в логи. Нужен вход именно в локальную вкладку. После пересборки переходите напрямую к рабочему маршруту, чтобы загрузить новый набор JS-модулей; не возвращайтесь на login при уже действующей сессии. Proxy отдаёт no-store и 404 для отсутствующих assets. Ошибка прошлой проверки была вызвана stale lazy chunk, а вход и загрузка профиля фактически отвечали 200. Не открывать параллельно новые /auth/login: существующий LoginComponent очищает токены при инициализации. Вспомогательные entry points не включены в production bundle.

Артефакты: [dev-results.json](dev-results.json), [validation-summary.json](validation-summary.json), [visual-results.json](visual-results.json), [skills-results.json](skills-results.json), [skills-regressions-before.json](skills-regressions-before.json), [design-detector.json](design-detector.json).



## Ограничения DEV-проверки

Принудительный обратный порядок ответов проверен на управляемых HTTP fixtures; DEV подтвердил обычный быстрый ввод и сохранение. Реальные решения по чужим откликам и negative backend permissions не выполнялись. На DEV оставлена закрытая, явно помеченная тестовая вакансия [№104](https://dev.procollab.ru/office/vacancies/104); существующая вакансия проекта не изменялась. Скриншоты галереи показывают feature-контент с локальным обрамлением, а рабочая оболочка кабинета имеет собственные отступы и mobile header; полное pixel-for-pixel совпадение оболочки не заявляется.
