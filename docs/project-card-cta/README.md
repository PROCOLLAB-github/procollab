<!-- @format -->

# Единый CTA карточек проектов

База DEV после #359: `ec822d13b4f55b0718335ac7f0f9e64d69ed05da`.

Все заполненные project cards используют «Открыть» и
`AppRoutes.projects.detail(project.id)`: черновик, опубликованный, в программе,
сданный; лидер и участник. Редактирование открывается штатно с detail-страницы.
`canEdit` продолжает определять только текст доступа. Lifecycle, роль, права,
аватар, название и описание не изменены. `editingStep` в CTA удалён.

## Навигация

В `InfoCardComponent` одна настоящая ссылка объединяет контент карточки и
визуальный CTA. CTA — неинтерактивный `span` внутри этой ссылки: нет вложенной
кнопки, второй ссылки, дополнительного tab stop или двойной навигации.
Ссылка поддерживает Enter и стандартные действия браузера со ссылками.
Кнопка подписки и модальное окно находятся вне неё.

Удалены внешние ссылки для project cards в Dashboard, полном списке
my/subscriptions/all и списке проектов программы. Приглашения, участники
программы, рейтинг и пустые карточки сохраняют прежнее поведение.
Shared Button/Modal/Avatar не менялись.

## Локальная визуальная проверка

Реальные Angular-компоненты рендерились с тестовыми данными через DI,
без backend и пользовательских данных. Detail в стенде заменён выводом маршрута.
Это локальная UI-проверка, не авторизованная проверка развёрнутого DEV.

На viewport 1440 и 320 px сравнили dashboard, my, subscriptions и all с базой.
Размеры и координаты карточки, аватара, названия, описания, role/access и CTA
совпали во всех восьми сравнениях. Карточка 156×180 px, аватар 70×70 px;
my CTA 134×21 px, access y=117, CTA y=150 относительно карточки.
Проверены длинные названия, Enter черновика → detail 101, открытие/отмена
отписки без навигации и клик CTA подписки → detail 201. Ошибок консоли нет.
Измерения: [geometry.json](geometry.json).

![Шесть сочетаний lifecycle и роли](six-states.png)

![Длинные названия на 320 px](long-mobile.png)

## Проверки

Node 20.20.2, npm 10.8.2; зависимости, workflows и test setup не менялись.

- `npm ci`: exit 0.
- `npx vitest run --pool=forks info-card projects/list/list.component.spec.ts projects/dashboard/dashboard.component.spec.ts program/detail/list/list.component.spec.ts`:
  42/42, четыре файла, exit 0. Проверены шесть сочетаний lifecycle/роли,
  detail без query params, одиночная навигация, отсутствие вложенных
  интерактивных элементов, подписки и прежние действия приглашений.
- `npm run test:ci`: exit 1, NG0401 в setupTestBed, до выполнения тестов
  (известное ограничение стандартного пула в локальном окружении).
- `npm run test:ci -- --pool=forks`: 371 файл и 1692/1692 теста прошли,
  но exit 1: один известный unhandled teardown `ngx-autosize`
  (`window is not defined`, `news-form.component.spec.ts`). Это не GREEN;
  ошибка не подавлялась, тесты не исключались.
- `npm run format:check`, `npm run lint:ts`, scoped Stylelint,
  `npm run build:prod`, `git diff --check`: exit 0. Lint: шесть прежних
  предупреждений вне изменённых файлов; build: прежние Sass/CommonJS warnings.

Backend, React, permissions, зависимости и workflows не менялись.
Merge/deploy не выполнялись.
