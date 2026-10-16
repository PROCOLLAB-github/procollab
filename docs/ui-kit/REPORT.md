<!-- @format -->

# Унификация UI Kit PROCOLLAB

Существующий интерфейс переведён на общие компоненты и foundation styles: единые кнопки и поля от 44 px, состояния focus/error/disabled/loading, поверхность карточек, типографика, вкладки, диалоги, заголовки и сообщения. Палитра использует семантические aliases существующих tokens; структура данных и назначение разделов сохранены.

UI Kit в коммите `74a94c9b` изменяет 284 исходных файлов относительно responsive-коммита `bc4940c5`: 80 существующих HTML-шаблонов переведены на общую основу, 6 дублирующих шаблонов удалены. Финальная проверка добавила CSS-fix desktop-отступа регистрации (285 UI-исходников суммарно). Новые компоненты с inline template также включены в [полный аудит](audit.json). API, facades, router declarations и permissions в этапе UI Kit не менялись. Граница бизнес-логики, включая две правки инициализации onboarding предыдущего responsive-коммита, раскрыта в [финальном отчёте](FINAL-CHECKS.md).

Работа выполнена в локальной `dev`. Ветка PR `feat/dev-ui-kit-unification` содержит responsive-коммит `bc4940c5` и последующий UI Kit. На момент создания PR удалённая `dev` заканчивалась на `9acb7ce2` и не изменялась в процессе реализации. Merge PR #401 в `dev` авторизован пользователем после финальных проверок. Изменения предыдущего этапа описаны в [responsive README](../responsive/README.md).

Финальная визуальная проверка запрошенных разделов и состояний: [FINAL-CHECKS.md](FINAL-CHECKS.md), [64 результата](final-results.json). Smoke-test на реальных устройствах после merge: [IOS-ANDROID-SMOKE.md](IOS-ANDROID-SMOKE.md), ещё не выполнен.

## Компоненты и правила

[UI-KIT.md](UI-KIT.md) описывает источники, совместимость и использование всех семейств из ТЗ: Button; Input/Select/Dropdown; Checkbox/Radio; Tabs; Modal/Dialog/Drawer; Card; Badge/Tag; Table/Pagination; Filters; Empty/Loading/Error; Alerts; Page Header; Form layouts.

Канонические реализации, проверяемые аудитом:

- `app-button`: [projects/ui/src/lib/components/primitives/button/button.component.ts](../../projects/ui/src/lib/components/primitives/button/button.component.ts)
- `[appIcon]`: [projects/ui/src/lib/components/primitives/icon/icon.component.ts](../../projects/ui/src/lib/components/primitives/icon/icon.component.ts)
- `app-avatar`: [projects/ui/src/lib/components/primitives/avatar/avatar.component.ts](../../projects/ui/src/lib/components/primitives/avatar/avatar.component.ts)
- `app-loader`: [projects/ui/src/lib/components/primitives/loader/loader.component.ts](../../projects/ui/src/lib/components/primitives/loader/loader.component.ts)
- `app-project-navigation`: [projects/social_platform/src/app/ui/pages/projects/edit/components/project-navigation/project-navigation.component.ts](../../projects/social_platform/src/app/ui/pages/projects/edit/components/project-navigation/project-navigation.component.ts)
- `app-tabs`: [projects/ui/src/lib/components/primitives/tabs/tabs.component.ts](../../projects/ui/src/lib/components/primitives/tabs/tabs.component.ts)
- `app-state`: [projects/ui/src/lib/components/layout/state/state.component.ts](../../projects/ui/src/lib/components/layout/state/state.component.ts)
- `app-page-header`: [projects/ui/src/lib/components/layout/page-header/page-header.component.ts](../../projects/ui/src/lib/components/layout/page-header/page-header.component.ts)
- `app-badge`: [projects/ui/src/lib/components/primitives/badge/badge.component.ts](../../projects/ui/src/lib/components/primitives/badge/badge.component.ts)
- `app-pagination`: [projects/ui/src/lib/components/primitives/pagination/pagination.component.ts](../../projects/ui/src/lib/components/primitives/pagination/pagination.component.ts)

Дополнительно унифицированы Back, DialogHeader, native ButtonDirective, Card/Field/Choice/Table/FormLayout/Filters/DialogBody/DialogFooter/Alert/Drawer adapters, Input/Textarea/Autocomplete/Search/Select/Dropdown/Checkbox/Modal/Tag и Snackbar. Старые импорты Button/Avatar/Icon/Loader/Badge реэкспортируют тот же класс. Bar/BarNew, VacancyStatus и project/profile navigation делегируют общему компоненту. Список всех изменений — [audit.json](audit.json).

## Страницы

| Раздел                       | Переведённые элементы                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Office feed                  | Фильтры, новостные карточки и диалог, формы, состояния                                                                                           |
| Projects                     | Общий PageHeader с CTA; dashboard/my/subscriptions/invites/all; карточки; формы создания/редактирования и их шаги; приглашения; вакансии проекта |
| Vacancies                    | PageHeader и Tabs, списки, карточки, фильтры, формы и диалог отклика, статусы                                                                    |
| Programs                     | PageHeader, список и карточки, заявка, команда, оценка эксперта, таблицы и пагинация аналитики                                                   |
| Courses                      | PageHeader, карточки и availability Badge, задания с radio/checkbox/файлами, загрузка/ошибки/результаты                                          |
| Members                      | PageHeader, фильтры и их диалог, карточки, состояния                                                                                             |
| Profile                      | PageHeader с длинным ФИО, вкладки редактирования, формы, приглашения                                                                             |
| Auth/Onboarding/Office shell | Общие поля, действия, состояния, drawer; сохранены формы и переходы                                                                              |
| Дополнительные widgets       | Чат, новости, загрузка файлов, region/skills selectors; канбан адаптеры сохранены для совместимости                                              |

## Проверки

| Проверка                    | Результат                                                                                  | Данные                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Production build            | Успешно                                                                                    | [build-prod.log](build-prod.log)                                                         |
| Полный Vitest               | 2002 тестов, 406 файлов — успешно                                                          | [unit-tests.log](unit-tests.log)                                                         |
| Финальные изменения layouts | 30 тестов затронутых компонентов — успешно                                                 | [filters/cards](targeted-tests.log), [profile/members/region](targeted-layout-tests.log) |
| ESLint                      | 0 ошибок, 6 прежних warnings                                                               | [eslint.log](eslint.log)                                                                 |
| Stylelint                   | 0 ошибок                                                                                   | [stylelint.log](stylelint.log)                                                           |
| Аудит источников            | 10 канонических компонентов; нет дублей и hex/rgb/hsl цветов в component SCSS              | [audit.json](audit.json)                                                                 |
| Browser matrix              | 912 измерений: 57 URL/состояний форм × 16 ширин; нет overflow/pageerror/console.error      | [browser-results.json](browser-results.json)                                             |
| Пользовательские сценарии   | 24 запусков: 12 сценариев × 320/390 px — успешно                                           | [flows-results.json](flows-results.json)                                                 |
| Геометрия действий          | 36 проверок: 12 экранов × 320/390/1440 px; цели ≥44 px, CTA не обрезаны, menu icon не сжат | [ui-check.json](ui-check.json)                                                           |
| Скриншоты                   | 24 пар до/после, 48 файлов                                                                 | Таблица ниже                                                                             |

Ширины матрицы: 320, 360, 375, 390, 430, 749, 750, 768, 820, 999, 1000, 1001, 1024, 1280, 1440, 1920 px. После финальной визуальной проверки дополнительно перепроверены 12 основных экранов на всех 16 ширинах, геометрия действий и сценарий редактирования профиля; итоговые данные хранят последние результаты без двойного подсчёта.

Функциональные сценарии: регистрация, вход/drawer, профиль/select/datepicker/autocomplete/сохранение, заявка/команда/подтверждение, экспертная оценка, отклик с файлом, создание проекта/принятие отклика, прохождение курса, onboarding, альтернативные виды заданий, длинный контент/валидация/загрузка/ошибки и аналитика/подсказки. Запросы перехватываются синтетическими fixtures.

Дополнительные [скриншоты форм и диалогов](screenshots/flows/) сняты в проверках UI Kit. Визуальная проверка основных экранов выполнена на 320/390/1440 px. Скриншоты до — responsive baseline `bc4940c5`, после — финальный UI Kit; данные и размеры совпадают.

| Экран                  | 320 px                                                                                          | 390 px                                                                                          | 1440 px                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Лента                  | [до](screenshots/before/feed-320.png) / [после](screenshots/after/feed-320.png)                 | [до](screenshots/before/feed-390.png) / [после](screenshots/after/feed-390.png)                 | [до](screenshots/before/feed-1440.png) / [после](screenshots/after/feed-1440.png)                 |
| Проекты                | [до](screenshots/before/projects-320.png) / [после](screenshots/after/projects-320.png)         | [до](screenshots/before/projects-390.png) / [после](screenshots/after/projects-390.png)         | [до](screenshots/before/projects-1440.png) / [после](screenshots/after/projects-1440.png)         |
| Вакансии               | [до](screenshots/before/vacancies-320.png) / [после](screenshots/after/vacancies-320.png)       | [до](screenshots/before/vacancies-390.png) / [после](screenshots/after/vacancies-390.png)       | [до](screenshots/before/vacancies-1440.png) / [после](screenshots/after/vacancies-1440.png)       |
| Программы              | [до](screenshots/before/programs-320.png) / [после](screenshots/after/programs-320.png)         | [до](screenshots/before/programs-390.png) / [после](screenshots/after/programs-390.png)         | [до](screenshots/before/programs-1440.png) / [после](screenshots/after/programs-1440.png)         |
| Курсы                  | [до](screenshots/before/courses-320.png) / [после](screenshots/after/courses-320.png)           | [до](screenshots/before/courses-390.png) / [после](screenshots/after/courses-390.png)           | [до](screenshots/before/courses-1440.png) / [после](screenshots/after/courses-1440.png)           |
| Участники              | [до](screenshots/before/members-320.png) / [после](screenshots/after/members-320.png)           | [до](screenshots/before/members-390.png) / [после](screenshots/after/members-390.png)           | [до](screenshots/before/members-1440.png) / [после](screenshots/after/members-1440.png)           |
| Профиль                | [до](screenshots/before/profile-320.png) / [после](screenshots/after/profile-320.png)           | [до](screenshots/before/profile-390.png) / [после](screenshots/after/profile-390.png)           | [до](screenshots/before/profile-1440.png) / [после](screenshots/after/profile-1440.png)           |
| Редактирование профиля | [до](screenshots/before/profile-edit-320.png) / [после](screenshots/after/profile-edit-320.png) | [до](screenshots/before/profile-edit-390.png) / [после](screenshots/after/profile-edit-390.png) | [до](screenshots/before/profile-edit-1440.png) / [после](screenshots/after/profile-edit-1440.png) |

## Известные ограничения

- Chrome automation использует синтетический backend. Доставка писем, сохранение в реальной базе, реальные WebSocket и права конкретного аккаунта не проверялись.
- Физические Safari iOS и Chrome Android, системные file/date pickers и экранная клавиатура требуют проверки на устройствах. Viewport/touch эмуляция их не заменяет.
- Некоторые внешние изображения fixtures недоступны; это видно и на baseline, и после изменений. Layout проверен с теми же данными.
- В production build остаются прежние предупреждения Sass `@import`, CommonJS и budgets. ESLint сообщает шесть прежних unused-disable warnings.
- Доменный контент карточек, графики, учебные задания и специальные блоки диалогов сохраняют свои layouts поверх общих tokens/foundation. Канбан остаётся отключён существующими маршрутами; его адаптеры проверены сборкой и unit suite, без изменения доступности раздела.

## Воспроизведение

Команды build/unit/lint и настройка Playwright описаны в [UI-KIT.md](UI-KIT.md). Запустить production preview через `node docs/responsive/serve.cjs`, затем batch проверки `browser-check.cjs`: mobile (320/360/375/390/430/749/750), tablet (768/820/999/1000/1024/1280), desktop (1001/1440/1920) без `RESPONSIVE_ROUTES`. Дополнительные projects/main batches используют все 16 ширин и пять/двенадцать маршрутов из соответствующих JSON. `RESPONSIVE_OUTPUT` задаётся как `../ui-kit/browser-{batch}.json`, `RESPONSIVE_SCREENSHOTS='../ui-kit/screenshots/matrix'`; пути относятся к `docs/responsive`.

Для полного flow-check используются `RESPONSIVE_FLOW_OUTPUT='../ui-kit/flows.json'`, `RESPONSIVE_SCREENSHOTS='../ui-kit/screenshots/flows'`, без `RESPONSIVE_FLOWS`. Повторная проверка редактора: `RESPONSIVE_FLOWS='profile-controls'` и `RESPONSIVE_FLOW_OUTPUT='../ui-kit/flows-layout.json'`.

После browser-проверок: `node docs/ui-kit/ui-check.cjs`, `node docs/ui-kit/screenshots.cjs after`, `node docs/ui-kit/audit.cjs`, `node docs/ui-kit/report.cjs`. Report проверяет полноту матрицы, успех сценариев и соответствие пар скриншотов.

## Изменённые HTML-шаблоны

- [projects/social_platform/src/app/ui/pages/auth/email-verification/email-verification.component.html](../../projects/social_platform/src/app/ui/pages/auth/email-verification/email-verification.component.html)
- [projects/social_platform/src/app/ui/pages/auth/login/login.component.html](../../projects/social_platform/src/app/ui/pages/auth/login/login.component.html)
- [projects/social_platform/src/app/ui/pages/auth/register/register.component.html](../../projects/social_platform/src/app/ui/pages/auth/register/register.component.html)
- [projects/social_platform/src/app/ui/pages/auth/reset-password/reset-password.component.html](../../projects/social_platform/src/app/ui/pages/auth/reset-password/reset-password.component.html)
- [projects/social_platform/src/app/ui/pages/auth/set-password/set-password.component.html](../../projects/social_platform/src/app/ui/pages/auth/set-password/set-password.component.html)
- [projects/social_platform/src/app/ui/pages/courses/courses.component.html](../../projects/social_platform/src/app/ui/pages/courses/courses.component.html)
- [projects/social_platform/src/app/ui/pages/courses/lesson/shared/radio-select-task/radio-select-task.component.html](../../projects/social_platform/src/app/ui/pages/courses/lesson/shared/radio-select-task/radio-select-task.component.html)
- [projects/social_platform/src/app/ui/pages/courses/list/course/course.component.html](../../projects/social_platform/src/app/ui/pages/courses/list/course/course.component.html)
- [projects/social_platform/src/app/ui/pages/courses/list/list.component.html](../../projects/social_platform/src/app/ui/pages/courses/list/list.component.html)
- [projects/social_platform/src/app/ui/pages/feed/feed.component.html](../../projects/social_platform/src/app/ui/pages/feed/feed.component.html)
- [projects/social_platform/src/app/ui/pages/members/member-card/member-card.component.html](../../projects/social_platform/src/app/ui/pages/members/member-card/member-card.component.html)
- [projects/social_platform/src/app/ui/pages/members/member-filters-dialog/member-filters-dialog.component.html](../../projects/social_platform/src/app/ui/pages/members/member-filters-dialog/member-filters-dialog.component.html)
- [projects/social_platform/src/app/ui/pages/members/members-filters/members-filters.component.html](../../projects/social_platform/src/app/ui/pages/members/members-filters/members-filters.component.html)
- [projects/social_platform/src/app/ui/pages/members/members.component.html](../../projects/social_platform/src/app/ui/pages/members/members.component.html)
- [projects/social_platform/src/app/ui/pages/office/nav/nav.component.html](../../projects/social_platform/src/app/ui/pages/office/nav/nav.component.html)
- [projects/social_platform/src/app/ui/pages/onboarding/stage-zero/stage-zero.component.html](../../projects/social_platform/src/app/ui/pages/onboarding/stage-zero/stage-zero.component.html)
- [projects/social_platform/src/app/ui/pages/profile/edit/edit.component.html](../../projects/social_platform/src/app/ui/pages/profile/edit/edit.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/analytics/analytics.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/analytics/analytics.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/analytics/drilldown/analytics-drilldown.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/analytics/drilldown/analytics-drilldown.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/list/list.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/list/list.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/list/program-projects-filter/program-projects-filter.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/list/program-projects-filter/program-projects-filter.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/components/boolean-criterion/boolean-criterion.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/components/boolean-criterion/boolean-criterion.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/components/range-criterion-input/range-criterion-input.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/components/range-criterion-input/range-criterion-input.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/project-rating.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/project-rating.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/main/role-widget/program-role-widget.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/main/role-widget/program-role-widget.component.html)
- [projects/social_platform/src/app/ui/pages/program/detail/register/register.component.html](../../projects/social_platform/src/app/ui/pages/program/detail/register/register.component.html)
- [projects/social_platform/src/app/ui/pages/program/main/program-card/program-card.component.html](../../projects/social_platform/src/app/ui/pages/program/main/program-card/program-card.component.html)
- [projects/social_platform/src/app/ui/pages/program/program.component.html](../../projects/social_platform/src/app/ui/pages/program/program.component.html)
- [projects/social_platform/src/app/ui/pages/projects/bar-new/bar.component.html](../../projects/social_platform/src/app/ui/pages/projects/bar-new/bar.component.html)
- [projects/social_platform/src/app/ui/pages/projects/detail/info/components/projects-mid-side/projects-mid-side.component.html](../../projects/social_platform/src/app/ui/pages/projects/detail/info/components/projects-mid-side/projects-mid-side.component.html)
- [projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/cancel-task-form/cancel-task-form.component.html](../../projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/cancel-task-form/cancel-task-form.component.html)
- [projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/create-board-form/create-board-form.component.html](../../projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/create-board-form/create-board-form.component.html)
- [projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/create-tag-form/create-tag-form.component.html](../../projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/create-tag-form/create-tag-form.component.html)
- [projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/task/detail/task-detail.component.html](../../projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/task/detail/task-detail.component.html)
- [projects/social_platform/src/app/ui/pages/projects/detail/kanban/pages/archive/kanban-archive.component.html](../../projects/social_platform/src/app/ui/pages/projects/detail/kanban/pages/archive/kanban-archive.component.html)
- [projects/social_platform/src/app/ui/pages/projects/edit/components/project-achievement-step/project-achievement-step.component.html](../../projects/social_platform/src/app/ui/pages/projects/edit/components/project-achievement-step/project-achievement-step.component.html)
- [projects/social_platform/src/app/ui/pages/projects/edit/components/project-additional-step/project-additional-step.component.html](../../projects/social_platform/src/app/ui/pages/projects/edit/components/project-additional-step/project-additional-step.component.html)
- [projects/social_platform/src/app/ui/pages/projects/edit/components/project-navigation/project-navigation.component.html](../../projects/social_platform/src/app/ui/pages/projects/edit/components/project-navigation/project-navigation.component.html)
- [projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/collaborator-card/collaborator-card.component.html](../../projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/collaborator-card/collaborator-card.component.html)
- [projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/invite-card/invite-card.component.html](../../projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/invite-card/invite-card.component.html)
- [projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/project-team-step.component.html](../../projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/project-team-step.component.html)
- [projects/social_platform/src/app/ui/pages/projects/edit/components/project-vacancy-step/project-vacancy-step.component.html](../../projects/social_platform/src/app/ui/pages/projects/edit/components/project-vacancy-step/project-vacancy-step.component.html)
- [projects/social_platform/src/app/ui/pages/projects/edit/edit.component.html](../../projects/social_platform/src/app/ui/pages/projects/edit/edit.component.html)
- [projects/social_platform/src/app/ui/pages/projects/list/list.component.html](../../projects/social_platform/src/app/ui/pages/projects/list/list.component.html)
- [projects/social_platform/src/app/ui/pages/projects/projects.component.html](../../projects/social_platform/src/app/ui/pages/projects/projects.component.html)
- [projects/social_platform/src/app/ui/pages/vacancies/detail/info/components/vacancy-responses/vacancy-responses.component.html](../../projects/social_platform/src/app/ui/pages/vacancies/detail/info/components/vacancy-responses/vacancy-responses.component.html)
- [projects/social_platform/src/app/ui/pages/vacancies/detail/info/info.component.html](../../projects/social_platform/src/app/ui/pages/vacancies/detail/info/info.component.html)
- [projects/social_platform/src/app/ui/pages/vacancies/list/list.component.html](../../projects/social_platform/src/app/ui/pages/vacancies/list/list.component.html)
- [projects/social_platform/src/app/ui/pages/vacancies/vacancies.component.html](../../projects/social_platform/src/app/ui/pages/vacancies/vacancies.component.html)
- [projects/social_platform/src/app/ui/primitives/bar/bar.component.html](../../projects/social_platform/src/app/ui/primitives/bar/bar.component.html)
- [projects/social_platform/src/app/ui/primitives/checkbox/checkbox.component.html](../../projects/social_platform/src/app/ui/primitives/checkbox/checkbox.component.html)
- [projects/social_platform/src/app/ui/primitives/input/input.component.html](../../projects/social_platform/src/app/ui/primitives/input/input.component.html)
- [projects/social_platform/src/app/ui/primitives/modal/modal.component.html](../../projects/social_platform/src/app/ui/primitives/modal/modal.component.html)
- [projects/social_platform/src/app/ui/primitives/select/select.component.html](../../projects/social_platform/src/app/ui/primitives/select/select.component.html)
- [projects/social_platform/src/app/ui/primitives/upload-file/upload-file.component.html](../../projects/social_platform/src/app/ui/primitives/upload-file/upload-file.component.html)
- [projects/social_platform/src/app/ui/widgets/chat-window/chat-window.component.html](../../projects/social_platform/src/app/ui/widgets/chat-window/chat-window.component.html)
- [projects/social_platform/src/app/ui/widgets/detail/detail.component.html](../../projects/social_platform/src/app/ui/widgets/detail/detail.component.html)
- [projects/social_platform/src/app/ui/widgets/feed-filter/feed-filter.component.html](../../projects/social_platform/src/app/ui/widgets/feed-filter/feed-filter.component.html)
- [projects/social_platform/src/app/ui/widgets/info-card/info-card.component.html](../../projects/social_platform/src/app/ui/widgets/info-card/info-card.component.html)
- [projects/social_platform/src/app/ui/widgets/message-input/message-input.component.html](../../projects/social_platform/src/app/ui/widgets/message-input/message-input.component.html)
- [projects/social_platform/src/app/ui/widgets/news-card/carousel/carousel.component.html](../../projects/social_platform/src/app/ui/widgets/news-card/carousel/carousel.component.html)
- [projects/social_platform/src/app/ui/widgets/news-card/feed-news-modal/feed-news-modal.component.html](../../projects/social_platform/src/app/ui/widgets/news-card/feed-news-modal/feed-news-modal.component.html)
- [projects/social_platform/src/app/ui/widgets/news-card/feed-news-preview/feed-news-preview.component.html](../../projects/social_platform/src/app/ui/widgets/news-card/feed-news-preview/feed-news-preview.component.html)
- [projects/social_platform/src/app/ui/widgets/news-form/news-form.component.html](../../projects/social_platform/src/app/ui/widgets/news-form/news-form.component.html)
- [projects/social_platform/src/app/ui/widgets/project-invite/profile-project-invite-modal.component.html](../../projects/social_platform/src/app/ui/widgets/project-invite/profile-project-invite-modal.component.html)
- [projects/social_platform/src/app/ui/widgets/project-invite/project-invite-dialog.component.html](../../projects/social_platform/src/app/ui/widgets/project-invite/project-invite-dialog.component.html)
- [projects/social_platform/src/app/ui/widgets/project-invite/project-invite-role-input.component.html](../../projects/social_platform/src/app/ui/widgets/project-invite/project-invite-role-input.component.html)
- [projects/social_platform/src/app/ui/widgets/project-invite/project-member-invite-modal.component.html](../../projects/social_platform/src/app/ui/widgets/project-invite/project-member-invite-modal.component.html)
- [projects/social_platform/src/app/ui/widgets/project-vacancy-card/project-vacancy-card.component.html](../../projects/social_platform/src/app/ui/widgets/project-vacancy-card/project-vacancy-card.component.html)
- [projects/social_platform/src/app/ui/widgets/projects-filter/projects-filter.component.html](../../projects/social_platform/src/app/ui/widgets/projects-filter/projects-filter.component.html)
- [projects/social_platform/src/app/ui/widgets/region-select/region-select.component.html](../../projects/social_platform/src/app/ui/widgets/region-select/region-select.component.html)
- [projects/social_platform/src/app/ui/widgets/skills-basket/skills-basket.component.html](../../projects/social_platform/src/app/ui/widgets/skills-basket/skills-basket.component.html)
- [projects/social_platform/src/app/ui/widgets/vacancy-card/vacancy-card.component.html](../../projects/social_platform/src/app/ui/widgets/vacancy-card/vacancy-card.component.html)
- [projects/social_platform/src/app/ui/widgets/vacancy-created-dialog/vacancy-created-dialog.component.html](../../projects/social_platform/src/app/ui/widgets/vacancy-created-dialog/vacancy-created-dialog.component.html)
- [projects/social_platform/src/app/ui/widgets/vacancy-filter/vacancy-filter.component.html](../../projects/social_platform/src/app/ui/widgets/vacancy-filter/vacancy-filter.component.html)
- [projects/ui/src/lib/components/primitives/avatar/avatar.component.html](../../projects/ui/src/lib/components/primitives/avatar/avatar.component.html)
- [projects/ui/src/lib/components/primitives/back/back.component.html](../../projects/ui/src/lib/components/primitives/back/back.component.html)
- [projects/ui/src/lib/components/primitives/button/button.component.html](../../projects/ui/src/lib/components/primitives/button/button.component.html)
- [projects/ui/src/lib/components/primitives/icon/icon.component.html](../../projects/ui/src/lib/components/primitives/icon/icon.component.html)
- [projects/ui/src/lib/components/primitives/loader/loader.component.html](../../projects/ui/src/lib/components/primitives/loader/loader.component.html)

Удалены дублирующие HTML/SCSS для: `projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/task/detail/badge/badge.component.html`, `projects/social_platform/src/app/ui/primitives/avatar/avatar.component.html`, `projects/social_platform/src/app/ui/primitives/button/button.component.html`, `projects/social_platform/src/app/ui/primitives/icon/icon.component.html`, `projects/social_platform/src/app/ui/primitives/loader/loader.component.html`, `projects/social_platform/src/app/ui/widgets/project-navigation/project-navigation.component.html`. TypeScript импорты совместимы через реэкспорт/адаптер.
