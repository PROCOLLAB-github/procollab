<!-- @format -->

## Что изменено

UI Kit после #401 менял desktop layout, карточки, типографику и расположение действий. При ширине ≥1000 px восстановлена композиция dev до merge #401; mobile/tablet <1000 px сохраняет адаптив и исправления мобильной компоновки, включая светлую нейтральную шапку.

## Зачем

Существующий desktop не должен меняться при responsive/UI Kit миграции. Эталон: **5fe4d5c6db435488fffa688d0fa6bd713d6eb7a0**, первый родитель merge #401. Mobile-эталон для этой проверки: **1138fe0cad35a90551be8451b2b2df0d24aacd8f**.

## Реализация

- Responsive/UI Kit styles, Card/Field/Form/Filters adapters и общие geometry rules ограничены <1000 px. Desktop Button/Avatar/Icon/PageHeader и consumer styles сохраняют прежние размеры, Mont, отступы и сетки.
- Office, Feed/FeedFilter, проекты/InfoCard, Programs/ProgramCard, Detail профиля/проекта/программы, Members, Vacancies, Courses и оба редактора восстановлены по desktop-эталону.
- DesktopLayoutService управляет presentation-границей. Корни страниц/router outlets, поиск и формы сохраняются при resize; изменяется нужная presentation-разметка.
- Mobile: ровные Detail actions и metadata, компактные карточки, activity над списком, работающие категории, полные навыки и читаемая география программы.
- Pixel comparison gate проверяет **точное RGB совпадение и размеры**; overflow является отдельной проверкой.

## API

Не менялся. **Бизнес-логика не изменена**: нет diff в API/domain/infrastructure, DTO, payloads, routes, package/dependencies или backend. Прежние save/autosave/filter services, logout handler, IDs, role conditions, deadlines/status precedence сохранены.

## UI

Новый desktop-дизайн не вводился. [Отчёт и воспроизведение](https://github.com/PROCOLLAB-github/procollab/blob/fix/dev-mobile-ui-composition/docs/desktop-regression/README.md), [pixel results](https://github.com/PROCOLLAB-github/procollab/blob/fix/dev-mobile-ui-composition/docs/desktop-regression/comparison-desktop-after.json), [review / AC audit](https://github.com/PROCOLLAB-github/procollab/blob/fix/dev-mobile-ui-composition/docs/desktop-regression/review.md).

Изменённые shared components: **Button, Icon, Avatar, Loader, Badge, Back, PageHeader, ProfileControlPanel, Tabs**, Card/Field/Form/Filters/Drawer/Dialog/Alert stylesheet adapters; social **Avatar adapter, Bar, Input, Select, Textarea, AutocompleteInput, Search, Checkbox, Dropdown, FileItem, Modal, Switch, Tag, UploadFile**; widgets **Detail, FeedFilter, InfoCard, VacancySkills/Status, ProjectsFilter/VacancyFilter, ProjectInviteDialog, ProjectVacancyCard/VacancyCard, News, RegionSelect, SkillsGroup/SpecializationsGroup, step navigation** и общие style mixins. [Полный список исходных файлов восстановления](https://github.com/PROCOLLAB-github/procollab/blob/fix/dev-mobile-ui-composition/docs/desktop-regression/source-files.json).

Для прослеживаемости миграции #401 ниже сохранён её исходный список 80 переведённых шаблонов; это список этапа UI Kit, а не число файлов текущего восстановления.

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

## Permissions

Не менялись. Existing guards/role conditions/server-owned permissions сохранены; server-side authorization заново не менялась и не аудировалась.

## Проверки

- [x] **Checked in browser:** 36 desktop пары (14 экранов + 3 empty states + loading action × 1440/1920), **0 отличающихся RGB-пикселей**. Повтор desktop эталона: 36/36, 0 пикселей. Без masks.
- [x] **Checked in browser:** 42 mobile/tablet пары (14 экранов × 320/390/768), **0 отличающихся RGB-пикселей** относительно mobile-эталона.
- [x] **Checked in browser:** 48 state checks (loading, empty, HTTP 500/retry, disabled, validation), 18 mobile interactions и 6 resize checks через 1000 px. Поиск/filter query/DOM routed roots сохраняются.
- [x] **Checked by tests:** npm run test:ci — 2006 tests / 406 files. Три существующих runner exclusions сохранены.
- [x] **Checked by build:** npm run build:social:prod — успешно, budgets не увеличены.
- [x] **Checked by source/lint:** API/domain/infrastructure/dependencies diff пустой; ESLint 0 errors, 6 существующих warnings; SCSS проверен.

## Acceptance criteria

- [x] Desktop ≥1000 сохраняет legacy composition, shared styles не навязывают новую геометрию.
- [x] Ключевые разделы проверены на 1440 и 1920 px **pixel/visual regression**, а не только overflow.
- [x] Mobile/tablet 320/390/768 сохранён, states/interactions повторно проверены.
- [x] API, permissions и бизнес-логика сохранены.

## Не проверено

- [ ] Реальные iOS/Android на dev-стенде после merge, перед prod. Доступа к физическим устройствам нет. Найденные проблемы — отдельными PR.
- Полный live backend/role matrix и каждый скрытый scroll section/popup. Снимки фиксируют видимую композицию при viewport height 844 px; внутренний scroll Office не превращается в full-document screenshot. Desktop pixel states включают empty и loading action; остальные состояния проверены mobile state harness.

## Риски / migration

Два presentation-каскада сохраняют legacy desktop и responsive mobile, поэтому дальнейшие изменения shared styles требуют обеих pixel matrices. Build содержит Angular/template/CommonJS и component-size warnings, error budgets не увеличены. API/data migration не нужны. PR направлен в dev; production merge/deploy не входят в задачу. **READY TO MERGE INTO DEV** для реализации, device smoke-test остаётся этапом dev acceptance.
