<!-- @format -->

После responsive-адаптации одинаковые элементы платформы использовали отдельные реализации и локальные цвета, размеры и состояния. Общий UI Kit теперь задаёт кнопки и поля от 44 px, типографику, карточки, вкладки, диалоги, сообщения и заголовки страниц. Например, loading сохраняет название действия и блокирует повторную отправку; короткие подписи и CTA в карточках помещаются на mobile и desktop.

**База PR:** `dev` на момент создания PR — `9acb7ce2`. Включены предыдущий responsive-коммит `bc4940c5`, UI Kit `74a94c9b` и финальные проверки. Скриншоты «до» показывают responsive baseline, «после» — UI Kit. Предыдущий этап описан в [responsive README](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/responsive/README.md).

### Компоненты

| Семейства                                                        | Общий источник и миграция                                                                                                                                         |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button, Icon, Avatar, Loader                                     | Одна реализация в `@uilib`; старые импорты реэкспортируют тот же класс. Native ButtonDirective использует тот же foundation, сохраняя form/ARIA/HTMLElement refs. |
| Input, Textarea, Select, Dropdown, Search, Autocomplete          | Общие control tokens, focus/error/disabled; сохранены CVA/валидация/overlay. Select поддерживает клавиатурное открытие и disabled.                                |
| Checkbox, Radio                                                  | Общие состояния; семантический Checkbox с клавиатурой и native/rich radio adapters.                                                                               |
| Tabs, Page Header, Back                                          | Общие Tabs с active/disabled/mobile scroll; Bar/BarNew и navigation adapters. PageHeader поддерживает title/description/breadcrumbs/actions.                      |
| Modal/Dialog, Drawer, Card                                       | Общие sizes/surface/padding/scroll/focus; DialogHeader/Body/Footer и Card/Drawer adapters, сохранены доменные layouts и правила закрытия.                         |
| Badge/Tag, Table, Pagination                                     | VacancyStatus и старый kanban Badge — адаптеры; доступность курса — Badge; таблицы и пагинация аналитики используют общие стили.                                  |
| Filters, Form layouts, Empty/Loading/Error, Alerts/Notifications | Общие adapters, StateComponent и семантические tokens; существующий Snackbar.                                                                                     |

Переведены 80 HTML-шаблонов; удалены 6 дублирующих HTML/SCSS. Аудит подтверждает 10 канонических компонентов и отсутствие локальных hex/rgb/hsl цветов в component SCSS. Полные списки и правила: [UI-KIT.md](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/UI-KIT.md), [audit.json](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/audit.json), [REPORT.md](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/REPORT.md).

<details>
<summary>Все 80 переведённых HTML-шаблонов</summary>

1. `projects/social_platform/src/app/ui/pages/auth/email-verification/email-verification.component.html`
2. `projects/social_platform/src/app/ui/pages/auth/login/login.component.html`
3. `projects/social_platform/src/app/ui/pages/auth/register/register.component.html`
4. `projects/social_platform/src/app/ui/pages/auth/reset-password/reset-password.component.html`
5. `projects/social_platform/src/app/ui/pages/auth/set-password/set-password.component.html`
6. `projects/social_platform/src/app/ui/pages/courses/courses.component.html`
7. `projects/social_platform/src/app/ui/pages/courses/lesson/shared/radio-select-task/radio-select-task.component.html`
8. `projects/social_platform/src/app/ui/pages/courses/list/course/course.component.html`
9. `projects/social_platform/src/app/ui/pages/courses/list/list.component.html`
10. `projects/social_platform/src/app/ui/pages/feed/feed.component.html`
11. `projects/social_platform/src/app/ui/pages/members/member-card/member-card.component.html`
12. `projects/social_platform/src/app/ui/pages/members/member-filters-dialog/member-filters-dialog.component.html`
13. `projects/social_platform/src/app/ui/pages/members/members-filters/members-filters.component.html`
14. `projects/social_platform/src/app/ui/pages/members/members.component.html`
15. `projects/social_platform/src/app/ui/pages/office/nav/nav.component.html`
16. `projects/social_platform/src/app/ui/pages/onboarding/stage-zero/stage-zero.component.html`
17. `projects/social_platform/src/app/ui/pages/profile/edit/edit.component.html`
18. `projects/social_platform/src/app/ui/pages/program/detail/analytics/analytics.component.html`
19. `projects/social_platform/src/app/ui/pages/program/detail/analytics/drilldown/analytics-drilldown.component.html`
20. `projects/social_platform/src/app/ui/pages/program/detail/list/list.component.html`
21. `projects/social_platform/src/app/ui/pages/program/detail/list/program-projects-filter/program-projects-filter.component.html`
22. `projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/components/boolean-criterion/boolean-criterion.component.html`
23. `projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/components/range-criterion-input/range-criterion-input.component.html`
24. `projects/social_platform/src/app/ui/pages/program/detail/list/rating-card/project-rating/project-rating.component.html`
25. `projects/social_platform/src/app/ui/pages/program/detail/main/role-widget/program-role-widget.component.html`
26. `projects/social_platform/src/app/ui/pages/program/detail/register/register.component.html`
27. `projects/social_platform/src/app/ui/pages/program/main/program-card/program-card.component.html`
28. `projects/social_platform/src/app/ui/pages/program/program.component.html`
29. `projects/social_platform/src/app/ui/pages/projects/bar-new/bar.component.html`
30. `projects/social_platform/src/app/ui/pages/projects/detail/info/components/projects-mid-side/projects-mid-side.component.html`
31. `projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/cancel-task-form/cancel-task-form.component.html`
32. `projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/create-board-form/create-board-form.component.html`
33. `projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/create-tag-form/create-tag-form.component.html`
34. `projects/social_platform/src/app/ui/pages/projects/detail/kanban/components/task/detail/task-detail.component.html`
35. `projects/social_platform/src/app/ui/pages/projects/detail/kanban/pages/archive/kanban-archive.component.html`
36. `projects/social_platform/src/app/ui/pages/projects/edit/components/project-achievement-step/project-achievement-step.component.html`
37. `projects/social_platform/src/app/ui/pages/projects/edit/components/project-additional-step/project-additional-step.component.html`
38. `projects/social_platform/src/app/ui/pages/projects/edit/components/project-navigation/project-navigation.component.html`
39. `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/collaborator-card/collaborator-card.component.html`
40. `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/invite-card/invite-card.component.html`
41. `projects/social_platform/src/app/ui/pages/projects/edit/components/project-team-step/project-team-step.component.html`
42. `projects/social_platform/src/app/ui/pages/projects/edit/components/project-vacancy-step/project-vacancy-step.component.html`
43. `projects/social_platform/src/app/ui/pages/projects/edit/edit.component.html`
44. `projects/social_platform/src/app/ui/pages/projects/list/list.component.html`
45. `projects/social_platform/src/app/ui/pages/projects/projects.component.html`
46. `projects/social_platform/src/app/ui/pages/vacancies/detail/info/components/vacancy-responses/vacancy-responses.component.html`
47. `projects/social_platform/src/app/ui/pages/vacancies/detail/info/info.component.html`
48. `projects/social_platform/src/app/ui/pages/vacancies/list/list.component.html`
49. `projects/social_platform/src/app/ui/pages/vacancies/vacancies.component.html`
50. `projects/social_platform/src/app/ui/primitives/bar/bar.component.html`
51. `projects/social_platform/src/app/ui/primitives/checkbox/checkbox.component.html`
52. `projects/social_platform/src/app/ui/primitives/input/input.component.html`
53. `projects/social_platform/src/app/ui/primitives/modal/modal.component.html`
54. `projects/social_platform/src/app/ui/primitives/select/select.component.html`
55. `projects/social_platform/src/app/ui/primitives/upload-file/upload-file.component.html`
56. `projects/social_platform/src/app/ui/widgets/chat-window/chat-window.component.html`
57. `projects/social_platform/src/app/ui/widgets/detail/detail.component.html`
58. `projects/social_platform/src/app/ui/widgets/feed-filter/feed-filter.component.html`
59. `projects/social_platform/src/app/ui/widgets/info-card/info-card.component.html`
60. `projects/social_platform/src/app/ui/widgets/message-input/message-input.component.html`
61. `projects/social_platform/src/app/ui/widgets/news-card/carousel/carousel.component.html`
62. `projects/social_platform/src/app/ui/widgets/news-card/feed-news-modal/feed-news-modal.component.html`
63. `projects/social_platform/src/app/ui/widgets/news-card/feed-news-preview/feed-news-preview.component.html`
64. `projects/social_platform/src/app/ui/widgets/news-form/news-form.component.html`
65. `projects/social_platform/src/app/ui/widgets/project-invite/profile-project-invite-modal.component.html`
66. `projects/social_platform/src/app/ui/widgets/project-invite/project-invite-dialog.component.html`
67. `projects/social_platform/src/app/ui/widgets/project-invite/project-invite-role-input.component.html`
68. `projects/social_platform/src/app/ui/widgets/project-invite/project-member-invite-modal.component.html`
69. `projects/social_platform/src/app/ui/widgets/project-vacancy-card/project-vacancy-card.component.html`
70. `projects/social_platform/src/app/ui/widgets/projects-filter/projects-filter.component.html`
71. `projects/social_platform/src/app/ui/widgets/region-select/region-select.component.html`
72. `projects/social_platform/src/app/ui/widgets/skills-basket/skills-basket.component.html`
73. `projects/social_platform/src/app/ui/widgets/vacancy-card/vacancy-card.component.html`
74. `projects/social_platform/src/app/ui/widgets/vacancy-created-dialog/vacancy-created-dialog.component.html`
75. `projects/social_platform/src/app/ui/widgets/vacancy-filter/vacancy-filter.component.html`
76. `projects/ui/src/lib/components/primitives/avatar/avatar.component.html`
77. `projects/ui/src/lib/components/primitives/back/back.component.html`
78. `projects/ui/src/lib/components/primitives/button/button.component.html`
79. `projects/ui/src/lib/components/primitives/icon/icon.component.html`
80. `projects/ui/src/lib/components/primitives/loader/loader.component.html`

</details>

<details>
<summary>Изменённые shared-компоненты и адаптеры: 59 исходников</summary>

Список включает канонические компоненты, compatibility reexports, общие form controls и переиспользуемые widgets. Для компонентов, изменённых только в HTML/SCSS, указан соответствующий TS-источник. В `ui-adapters.directive.ts` находятся Card, Field, Choice, Table, FormLayout, Filters, DialogBody, DialogFooter, Drawer и Alert. Foundations: `_ui-tokens.scss`, `_ui-foundation.scss`, `_ui-system.scss`, `_typography.scss`.

- `projects/social_platform/src/app/ui/primitives/autocomplete-input/autocomplete-input.component.ts`
- `projects/social_platform/src/app/ui/primitives/avatar-control/avatar-control.component.ts`
- `projects/social_platform/src/app/ui/primitives/avatar/avatar.component.ts`
- `projects/social_platform/src/app/ui/primitives/bar/bar.component.ts`
- `projects/social_platform/src/app/ui/primitives/button/button.component.ts`
- `projects/social_platform/src/app/ui/primitives/checkbox/checkbox.component.ts`
- `projects/social_platform/src/app/ui/primitives/dropdown/dropdown.component.ts`
- `projects/social_platform/src/app/ui/primitives/icon/icon.component.ts`
- `projects/social_platform/src/app/ui/primitives/input/input.component.ts`
- `projects/social_platform/src/app/ui/primitives/loader/loader.component.ts`
- `projects/social_platform/src/app/ui/primitives/modal/modal.component.ts`
- `projects/social_platform/src/app/ui/primitives/search/search.component.ts`
- `projects/social_platform/src/app/ui/primitives/select/select.component.ts`
- `projects/social_platform/src/app/ui/primitives/tag/tag.component.ts`
- `projects/social_platform/src/app/ui/primitives/textarea/textarea.component.ts`
- `projects/social_platform/src/app/ui/primitives/tooltip/tooltip.component.ts`
- `projects/social_platform/src/app/ui/primitives/upload-file/upload-file.component.ts`
- `projects/social_platform/src/app/ui/widgets/chat-window/chat-message/chat-message.component.ts`
- `projects/social_platform/src/app/ui/widgets/chat-window/chat-window.component.ts`
- `projects/social_platform/src/app/ui/widgets/detail/detail.component.ts`
- `projects/social_platform/src/app/ui/widgets/feed-filter/feed-filter.component.ts`
- `projects/social_platform/src/app/ui/widgets/header/header.component.ts`
- `projects/social_platform/src/app/ui/widgets/info-card/info-card.component.ts`
- `projects/social_platform/src/app/ui/widgets/message-input/message-input.component.ts`
- `projects/social_platform/src/app/ui/widgets/news-card/carousel/carousel.component.ts`
- `projects/social_platform/src/app/ui/widgets/news-card/feed-news-modal/feed-news-modal.component.ts`
- `projects/social_platform/src/app/ui/widgets/news-card/feed-news-preview/feed-news-preview.component.ts`
- `projects/social_platform/src/app/ui/widgets/news-card/news-card.component.ts`
- `projects/social_platform/src/app/ui/widgets/news-form/news-form.component.ts`
- `projects/social_platform/src/app/ui/widgets/project-invite/profile-project-invite-modal.component.ts`
- `projects/social_platform/src/app/ui/widgets/project-invite/project-invite-dialog.component.ts`
- `projects/social_platform/src/app/ui/widgets/project-invite/project-invite-role-input.component.ts`
- `projects/social_platform/src/app/ui/widgets/project-invite/project-member-invite-modal.component.ts`
- `projects/social_platform/src/app/ui/widgets/project-navigation/project-navigation.component.ts`
- `projects/social_platform/src/app/ui/widgets/project-vacancy-card/project-vacancy-card.component.ts`
- `projects/social_platform/src/app/ui/widgets/projects-filter/projects-filter.component.ts`
- `projects/social_platform/src/app/ui/widgets/region-select/region-select.component.ts`
- `projects/social_platform/src/app/ui/widgets/skills-basket/skills-basket.component.ts`
- `projects/social_platform/src/app/ui/widgets/skills-group/skills-group.component.ts`
- `projects/social_platform/src/app/ui/widgets/specializations-group/specializations-group.component.ts`
- `projects/social_platform/src/app/ui/widgets/vacancy-card/vacancy-card.component.ts`
- `projects/social_platform/src/app/ui/widgets/vacancy-created-dialog/vacancy-created-dialog.component.ts`
- `projects/social_platform/src/app/ui/widgets/vacancy-filter/vacancy-filter.component.ts`
- `projects/social_platform/src/app/ui/widgets/vacancy-letter/vacancy-letter.component.ts`
- `projects/social_platform/src/app/ui/widgets/vacancy-skills/vacancy-skills.component.ts`
- `projects/social_platform/src/app/ui/widgets/vacancy-status/vacancy-status.component.ts`
- `projects/ui/src/lib/components/layout/dialog-header/dialog-header.component.ts`
- `projects/ui/src/lib/components/layout/page-header/page-header.component.ts`
- `projects/ui/src/lib/components/layout/state/state.component.ts`
- `projects/ui/src/lib/components/layout/ui-adapters.directive.ts`
- `projects/ui/src/lib/components/primitives/avatar/avatar.component.ts`
- `projects/ui/src/lib/components/primitives/back/back.component.ts`
- `projects/ui/src/lib/components/primitives/badge/badge.component.ts`
- `projects/ui/src/lib/components/primitives/button/button.component.ts`
- `projects/ui/src/lib/components/primitives/button/button.directive.ts`
- `projects/ui/src/lib/components/primitives/icon/icon.component.ts`
- `projects/ui/src/lib/components/primitives/loader/loader.component.ts`
- `projects/ui/src/lib/components/primitives/pagination/pagination.component.ts`
- `projects/ui/src/lib/components/primitives/tabs/tabs.component.ts`

</details>

### Граница бизнес-логики

**Унификация UI Kit сохраняет бизнес-правила:** не меняет API/DTO, доменные use cases, permissions, router declarations и обработчики отправки форм. Сравнение `bc4940c5..74a94c9b`: 284 UI-файла, 0 изменений защищённых слоёв. Сравнение AST существующих методов выявило 7 UI-классов; изменения вручную проверены как keyboard/disabled guards, делегирование прежних events и удаление дублирующих presentation-классов. Данные проверки: [business-boundary.json](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/business-boundary.json). Финальный CSS-fix auth влияет только на desktop-отступ регистрации.

Весь PR также содержит предыдущий responsive-коммит с **двумя явно раскрытыми правками инициализации onboarding**: `onboarding-stage-zero-info.service.ts` загружает профиль перед инициализацией, сохраняя draft; `onboarding-stage-one-ui-info.service.ts` использует `emitEvent: false` при заполнении формы. Это исполняемая логика инициализации, поэтому утверждение «во всём PR нет изменений вне presentation» было бы неточным. Контракты, правила валидации, права и бизнес-действия сохранены; обе правки покрыты regression tests.

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

- Финальная проверка шести запрошенных разделов и состояний — **64/64 passed** на 320/390/768/1440 px: 32 проверки проектов, вакансий, программ, курсов, профиля/редактора и onboarding 0/1 + 32 проверки loading/empty/error/disabled/validation. HTTP 500 и успешный retry проверены отдельно. Визуальный просмотр подтверждён скриншотами. Найденный desktop-отступ регистрации исправлен до merge и повторно проверен. [FINAL-CHECKS.md](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/FINAL-CHECKS.md).
- Production build и development build (`build:pr`) после финального CSS-fix — успешно. CI-equivalent Prettier — 0 нарушений; на Windows учтены checkout CRLF и локальный ignored dist.
- Полный Vitest — **2002 тестов / 406 файлов**, затем **30 тестов** затронутых финальными layout-правками компонентов.
- ESLint — 0 ошибок (6 прежних warnings); Stylelint — 0 ошибок.
- **912 измерений**: 57 URL/состояний форм × 16 ширин (320, 360, 375, 390, 430, 749, 750, 768, 820, 999, 1000, 1001, 1024, 1280, 1440, 1920 px); без overflow/pageerror/console.error. Последние изменения дополнительно проверены на 12 основных экранах.
- **24 функциональных запусков** (12 сценариев × 320/390 px), включая формы, отправку, загрузку файлов, select/datepicker, задания курсов и таблицы. Редактор профиля повторно проверен после финальной компоновки заголовка.
- **36 проверок геометрии**: цели ≥44 px, CTA внутри карточек, иконка меню не сжата, короткие подписи не переносятся.
- **24 пар скриншотов** до/после на 320/390/1440 px. Логи, JSON и все пары — в [REPORT.md](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/REPORT.md).

### Проверка после merge

По запросу пользователя после merge #401 в dev требуется smoke-test на **реальных iOS Safari и Android Chrome** на dev-стенде, перед prod. Сейчас этот пункт **не выполнен**: доступ к устройствам/облачному сервису, точный frontend URL и тестовый аккаунт не предоставлены. [Чек-лист и форма результата](https://github.com/PROCOLLAB-github/procollab/blob/feat/dev-ui-kit-unification/docs/ui-kit/IOS-ANDROID-SMOKE.md). Найденные после merge проблемы исправляются отдельными PR в dev. До успешного физического smoke-test унификация не считается полностью закрытой.

### Скриншоты

<details>
<summary>Лента: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                              | После (UI Kit)                                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Лента до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/feed-390.png">   | <img width="270" alt="Лента после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/feed-390.png">   |
| 1440 px  | <img width="540" alt="Лента до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/feed-1440.png"> | <img width="540" alt="Лента после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/feed-1440.png"> |

</details>

<details>
<summary>Проекты: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                    | После (UI Kit)                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Проекты до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/projects-390.png">   | <img width="270" alt="Проекты после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/projects-390.png">   |
| 1440 px  | <img width="540" alt="Проекты до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/projects-1440.png"> | <img width="540" alt="Проекты после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/projects-1440.png"> |

</details>

<details>
<summary>Вакансии: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                      | После (UI Kit)                                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Вакансии до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/vacancies-390.png">   | <img width="270" alt="Вакансии после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/vacancies-390.png">   |
| 1440 px  | <img width="540" alt="Вакансии до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/vacancies-1440.png"> | <img width="540" alt="Вакансии после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/vacancies-1440.png"> |

</details>

<details>
<summary>Программы: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                      | После (UI Kit)                                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Программы до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/programs-390.png">   | <img width="270" alt="Программы после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/programs-390.png">   |
| 1440 px  | <img width="540" alt="Программы до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/programs-1440.png"> | <img width="540" alt="Программы после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/programs-1440.png"> |

</details>

<details>
<summary>Курсы: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                 | После (UI Kit)                                                                                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 390 px   | <img width="270" alt="Курсы до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/courses-390.png">   | <img width="270" alt="Курсы после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/courses-390.png">   |
| 1440 px  | <img width="540" alt="Курсы до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/courses-1440.png"> | <img width="540" alt="Курсы после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/courses-1440.png"> |

</details>

<details>
<summary>Участники: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                     | После (UI Kit)                                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Участники до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/members-390.png">   | <img width="270" alt="Участники после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/members-390.png">   |
| 1440 px  | <img width="540" alt="Участники до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/members-1440.png"> | <img width="540" alt="Участники после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/members-1440.png"> |

</details>

<details>
<summary>Профиль: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                   | После (UI Kit)                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Профиль до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/profile-390.png">   | <img width="270" alt="Профиль после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/profile-390.png">   |
| 1440 px  | <img width="540" alt="Профиль до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/profile-1440.png"> | <img width="540" alt="Профиль после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/profile-1440.png"> |

</details>

<details>
<summary>Редактирование профиля: до/после</summary>

| Viewport | До (responsive baseline)                                                                                                                                                                                       | После (UI Kit)                                                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 390 px   | <img width="270" alt="Редактирование профиля до, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/profile-edit-390.png">   | <img width="270" alt="Редактирование профиля после, 390 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/profile-edit-390.png">   |
| 1440 px  | <img width="540" alt="Редактирование профиля до, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/before/profile-edit-1440.png"> | <img width="540" alt="Редактирование профиля после, 1440 px" src="https://raw.githubusercontent.com/PROCOLLAB-github/procollab/feat/dev-ui-kit-unification/docs/ui-kit/screenshots/after/profile-edit-1440.png"> |

</details>

### Известные ограничения

Browser QA выполнена в Chrome с синтетическими API fixtures: записи в реальный backend, письма, WebSocket и права конкретного аккаунта не проверялись. Физические Safari iOS/Chrome Android, клавиатура и системные pickers требуют проверки на устройствах. Некоторые внешние изображения fixtures недоступны на обеих версиях. В build остаются прежние Sass/CommonJS/budget warnings. Канбан остаётся отключён существующими маршрутами; адаптеры проверены сборкой/unit suite. Специальный контент карточек, графиков и заданий сохраняет доменные layouts поверх общего UI Kit.
