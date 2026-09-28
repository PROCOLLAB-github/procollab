<!-- @format -->

# Lifecycle проекта и роль в «Моих проектах»

База DEV после #360: `358e818c7ebd8b7d5916e56167a402e2848177d6`.

Правила отображения в базе уже в основном соответствовали требованиям.
Эта доработка явно связывает доступ с фактом сдачи, типизирует lifecycle labels,
убирает постоянный CTA из presentation model и закрепляет восемь сочетаний
в общих fixtures, component/list/dashboard tests и визуальной приёмке.

## Источники и независимые правила

В существующем `InfoCardComponent.myProjectPresentation`:

- Lifecycle использует только `Project`: `partnerProgram?.isSubmitted === true`
  → `partnerProgram != null` → `draft === true` → опубликованный проект.
  Связь с программой имеет приоритет над draft; при сдаче побеждает submitted.
- Факт сдачи — только `isSubmitted`. `canSubmit` не участвует: запрет отправки
  может означать закрытый срок и не доказывает, что проект сдан.
- Роль: известный `loggedUserId` совпадает с `project.leader` → «Лидер»;
  иначе «Участник». Отсутствующие ID не считаются совпадением.
- Текущий пользователь по-прежнему приходит из `ProfileInfoService.profile()?.id`
  в Dashboard и ProjectsList. Новых запросов, чтения JWT/localStorage нет.
- `canEdit = isLeader && (project.partnerProgram == null || project.partnerProgram.isSubmitted === false)`
  определяет только подпись доступа.
  Она не вычисляется из lifecycle label и не предоставляет новых прав.

| Lifecycle        | Лидер               | Участник        |
| ---------------- | ------------------- | --------------- |
| Черновик         | можно редактировать | только просмотр |
| Опубликован      | можно редактировать | только просмотр |
| В программе      | можно редактировать | только просмотр |
| Сдан в программу | только просмотр     | только просмотр |

При незагруженном профиле все четыре lifecycle сохраняются, роль — «Участник»,
доступ — «только просмотр».

CTA теперь непосредственно в шаблоне: **«Открыть» →
`AppRoutes.projects.detail(project.id)`** без query params. Нативная ссылка,
одиночная навигация и отдельная кнопка подписки из #360 сохранены.
Редактор открывается со страницы проекта штатным действием.

Эта presentation model применяется только к `type="projects"` и
`appereance="my"` (написание существующего input сохранено).
Подписки/витрина сохраняют отрасль и «Открыть», остальные типы карточек
не получают role/access. Permissions, guards и бизнес-правила не менялись.

## Внешний вид

SCSS не менялся. «В программе» — `--accent-light/dark`, «Сдан в программу» —
`--gold-light/dark`. В текущей палитре есть `--blue-dark`, но нет `--blue-light`,
поэтому сохранена разрешённая золотая пара. Эти два состояния проверены рядом
для лидера и для участника, различаются и цветом, и текстом.

Скриншот снят с реальных Angular InfoCard на локальном стенде с тестовыми данными
через DI. Верхний ряд — четыре lifecycle лидера, нижний — те же lifecycle
участника. Это не авторизованная проверка развёрнутого DEV; backend и реальные
проекты не использовались. Целевые detail-страницы в стенде заменены выводом маршрута.

![Восемь состояний lifecycle × роль](eight-states.png)

Все восемь карточек: **156×180 px**, аватар **70×70 px**. Названия и описания
центрированы и ограничены двумя строками существующим CSS. Измерения, цвета,
подписи и href: [acceptance.json](acceptance.json).

Дополнительно в браузере проверено отсутствие профиля: lifecycle не меняется,
все карточки показывают «Участник / только просмотр» и detail route.

## Проверки исходной доработки

Node 20.20.2, npm 10.8.2.

- `npm ci`: exit 0.
- `npx vitest run --pool=forks info-card projects/list/list.component.spec.ts projects/dashboard/dashboard.component.spec.ts`:
  44/44, три файла, exit 0. Покрыты все восемь сочетаний, одинаковый lifecycle
  при смене роли, неизвестный пользователь, submitted > draft для обеих ролей,
  canSubmit, постоянный CTA/detail, неизменность остальных контекстов.
- `npm run lint:ts`: exit 0; шесть существующих warnings вне изменённых файлов.
- `npx stylelint projects/social_platform/src/app/ui/widgets/info-card/info-card.component.scss`:
  exit 0; изменённых SCSS нет, проверен используемый stylesheet.
- `npm run test:ci`: exit 1, прежний NG0401 в setupTestBed до выполнения тестов,
  371 файл. Test harness не исправлялся, ошибки не подавлялись, исключения тестов
  и зависимости не менялись.

- `npm run test:ci -- --pool=forks`: **1696/1696, 371 файл, exit 0**,
  без NG0401 и unhandled errors. Известный teardown ngx-autosize в этом запуске
  не воспроизвёлся.
- `npm run format:check`: exit 0.
- `npm run build:prod`: exit 0; существующие Sass/CommonJS warnings.
- `git diff --check`: exit 0.

В браузере Enter для лидера «В программе» и «Сдан в программу» открыл
соответствующий detail (103 и 104) без параметров редактора. Ошибок консоли нет.

**Backend untouched. React untouched. Permissions untouched. Card size unchanged.**
Merge/deploy не выполнялись.

## Исправление приоритета — 28.09.2026

Исходная база: `origin/dev`, `69f84902`; перед PR ветка обновлена до `cda836a2`.
Изменено только вычисление lifecycle:
`submitted > program > draft > published`. Шаблон и SCSS не менялись:
одна статусная плашка сверху, независимая роль и подпись доступа снизу.
`canEdit`, guards, API приглашений и поиск с `partner_program` не менялись.
`partnerProgramsTags` не участвует в определении lifecycle.

В component tests проверены все шесть сочетаний draft / связи / сдачи для
лидера, участника и неизвестного профиля, включая `canEdit` и единственную плашку.
В HTTP contract test воспроизведён переданный пользователем DEV-кейс:
проект 286, связь 105, программа 9, `draft=true`, `is_submitted=false`,
`partner_program_tags=[]` → «В программе / Лидер / можно редактировать».
До исправления четыре регрессионные проверки падали; после него проходят.

Проверки на Node 24.18.0 / npm 11.16.0:

- `npm run test:ci -- --pool=forks info-card projects/list/list.component.spec.ts projects/dashboard/dashboard.component.spec.ts`:
  67 тестов в 5 файлах, exit 0.
- `npm run test:ci -- --pool=forks`: два запуска, каждый — 1879 успешных тестов
  в 395 файлах, но exit 1 из-за unhandled `window is not defined` после teardown
  в `ngx-autosize`. Первый запуск: `news-form.component.spec.ts`; повторный:
  также `profile-mid-side.component.spec.ts`. Эти файлы не изменены.
  Три уже исключённых файла из `vitest.config.ts` не запускались; конфигурация не менялась.
- `npm run build:prod`: exit 0; для существующего glob использован
  `npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`.
  Сохраняются Sass/CommonJS/budget warnings.
- `npm run lint:ts`: exit 0, шесть прежних warnings вне изменённых файлов.
- Prettier для пяти изменённых файлов: exit 0.
  `npm run format:check`: exit 1, 1567 файлов при Windows checkout с CRLF;
  `npm run format:check -- --end-of-line auto`: exit 0 без изменения файлов.
- `git diff --check`: exit 0.

В браузере проверен реальный Angular `InfoCardComponent` на локальных фикстурах:
desktop 1280, mobile 390 и 320 px; все шесть состояний для обеих ролей.
Карточки сохранили 156×180 px и Mont, горизонтального переполнения нет.
Tab фокусирует ссылку проекта с видимым outline; ошибок консоли нет.
Проверка развёрнутого DEV и фактическое редактирование проекта 286 не выполнялись:
его параметры проверены через HTTP mock и локальный браузерный стенд.

После обновления до `cda836a2` с новой конфигурацией Vitest из `dev`:

- `npm run test:ci -- --pool=forks`: **1940/1940, 400 файлов, exit 0**,
  без unhandled errors. Ошибки teardown предыдущих запусков не повторились.
- `npm run build:prod`: exit 0; прежние предупреждения сборки.
- `npm run lint:ts`: exit 0; прежние шесть warnings.

В этой задаче конфигурация Vitest и соседние формы не изменялись.
Review не выявил дефектов в изменённой логике; requirements и ограничения scope соблюдены.
