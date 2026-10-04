# Checklist маршрутов PROCOLLAB

Извлечено 63 объявления компонентов/оболочек и 9 redirects. Повторяющиеся оболочки не считаются отдельными URL. Проверены 57 конкретных URL/состояний формы на контрольных ширинах 320–1920 px. Всего 657 измерений; ошибок: 0. Дополнительные размеры возле breakpoint: 749, 750, 999, 1000, 1001.

OK: компонент присутствует в DOM подходящего URL, видимое содержимое непустое, отсутствуют внешние переполнения, расширение страницы и ошибки браузера. Для plain-text и portal страниц host может не иметь собственной геометрии. Это проверка Chrome с синтетическим API. ‘—’ означает отсутствие отдельного экрана или недостижимую декларацию; пояснения ниже. Контент со скроллом внутри tabs/списка/диалога допускается.

| Route / компонент | Desktop 1280–1920 | Tablet 768–1024 | 390 px | 320 px | Проблемы / исправление |
| --- | --- | --- | --- | --- | --- |
| `/` AppComponent | OK | OK | OK | OK | Общая оболочка, drawer, controls, safe area |
| `/auth/` AuthComponent | OK | OK | OK | OK | Контейнер, динамическая высота, формы, иллюстрации |
| `/auth/login` LoginComponent | OK | OK | OK | OK | Контейнер, динамическая высота, формы, иллюстрации |
| `/auth/register` RegisterComponent | OK | OK | OK | OK | Контейнер, динамическая высота, формы, иллюстрации |
| `/auth/verification/email` EmailVerificationComponent | OK | OK | OK | OK | Контейнер, динамическая высота, формы, иллюстрации |
| `/auth/reset_password/send_email` ResetPasswordComponent | OK | OK | OK | OK | Контейнер, динамическая высота, формы, иллюстрации |
| `/auth/reset_password` SetPasswordComponent | OK | OK | OK | OK | Контейнер, динамическая высота, формы, иллюстрации |
| `/auth/reset_password/confirm` ConfirmPasswordResetComponent | OK | OK | OK | OK | Контейнер, динамическая высота, формы, иллюстрации |
| `/auth/verification` ConfirmEmailComponent | — | — | — | — | Декларация/redirect: см. пояснения |
| `/error/` ErrorComponent | OK | OK | OK | OK | Убрана фиксированная ширина 580 px |
| `/error/404` ErrorNotFoundComponent | OK | OK | OK | OK | Убрана фиксированная ширина 580 px |
| `/error/:code` ErrorCodeComponent | OK | OK | OK | OK | Убрана фиксированная ширина 580 px |
| `/office/onboarding/` OnboardingComponent | OK | OK | OK | OK | Одна колонка, высота, popup; устранён цикл черновика шага 1 |
| `/office/onboarding/stage-0` OnboardingStageZeroComponent | OK | OK | OK | OK | Одна колонка, высота, popup; устранён цикл черновика шага 1 |
| `/office/onboarding/stage-1` OnboardingStageOneComponent | OK | OK | OK | OK | Одна колонка, высота, popup; устранён цикл черновика шага 1 |
| `/office/onboarding/stage-2` OnboardingStageTwoComponent | OK | OK | OK | OK | Одна колонка, высота, popup; устранён цикл черновика шага 1 |
| `/office/onboarding/stage-3` OnboardingStageThreeComponent | OK | OK | OK | OK | Одна колонка, высота, popup; устранён цикл черновика шага 1 |
| `/office/` OfficeComponent | OK | OK | OK | OK | Общая оболочка, drawer, controls, safe area |
| `/office/feed/` FeedComponent | OK | OK | OK | OK | Фильтры, news form, shared cards/dialogs |
| `/office/vacancies/` VacanciesComponent | OK | OK | OK | OK | Shared controls/dialogs; существующая mobile сетка |
| `/office/vacancies/my/` VacanciesListComponent | OK | OK | OK | OK | Shared controls/dialogs; существующая mobile сетка |
| `/office/vacancies/all` VacanciesListComponent | OK | OK | OK | OK | Shared controls/dialogs; существующая mobile сетка |
| `/office/vacancies/:vacancyId/` VacanciesDetailComponent | OK | OK | OK | OK | Shared controls/dialogs; существующая mobile сетка |
| `/office/vacancies/:vacancyId/` VacancyInfoComponent | OK | OK | OK | OK | Shared controls/dialogs; существующая mobile сетка |
| `/office/projects/` ProjectsComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/dashboard` DashboardProjectsComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/my` ProjectsListComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/subscriptions` ProjectsListComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/invites` ProjectsListComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/all` ProjectsListComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/:projectId/edit` ProjectEditComponent | OK | OK | OK | OK | Поля, действия, горизонтальные tabs, validation, диалоги |
| `/office/projects/:projectId/` DeatilComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/:projectId/` ProjectInfoComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/:projectId/news/:newsId` NewsDetailComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/:projectId/vacancies` ProjectVacanciesComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/:projectId/team` ProjectTeamComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/:projectId/work-section` ProjectWorkSectionComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/projects/:projectId/chat` ProjectChatComponent | OK | OK | OK | OK | Карточки, команда, popup, детали; загрузка dashboard |
| `/office/program/` ProgramComponent | OK | OK | OK | OK | Карточки, роли на mobile, фильтры, рейтинг и диалоги |
| `/office/program/all` ProgramMainComponent | OK | OK | OK | OK | Карточки, роли на mobile, фильтры, рейтинг и диалоги |
| `/office/program/:programId/` DeatilComponent | OK | OK | OK | OK | Карточки, роли на mobile, фильтры, рейтинг и диалоги |
| `/office/program/:programId/` ProgramDetailMainComponent | OK | OK | OK | OK | Карточки, роли на mobile, фильтры, рейтинг и диалоги |
| `/office/program/:programId/projects` ProgramListComponent | OK | OK | OK | OK | Карточки, роли на mobile, фильтры, рейтинг и диалоги |
| `/office/program/:programId/members` ProgramListComponent | OK | OK | OK | OK | Карточки, роли на mobile, фильтры, рейтинг и диалоги |
| `/office/program/:programId/projects-rating` ProgramListComponent | OK | OK | OK | OK | Карточки, роли на mobile, фильтры, рейтинг и диалоги |
| `/office/program/:programId/analytics` ProgramAnalyticsComponent | OK | OK | OK | OK | Существующие mobile cards таблиц, viewport диалогов и tooltip |
| `/office/courses/` CoursesComponent | OK | OK | OK | OK | Детали и урок, поля, CTA, доступный контент |
| `/office/courses/all` CoursesListComponent | OK | OK | OK | OK | Детали и урок, поля, CTA, доступный контент |
| `/office/courses/:courseId/` CourseDetailComponent | OK | OK | OK | OK | Детали и урок, поля, CTA, доступный контент |
| `/office/courses/:courseId/` CourseInfoComponent | OK | OK | OK | OK | Детали и урок, поля, CTA, доступный контент |
| `/office/courses/:courseId/lesson/:lessonId` LessonComponent | OK | OK | OK | OK | Детали и урок, поля, CTA, доступный контент |
| `/office/courses/:courseId/lesson/:lessonId/results` TaskCompleteComponent | OK | OK | OK | OK | Детали и урок, поля, CTA, доступный контент |
| `/office/members` MembersComponent | OK | OK | OK | OK | Общая оболочка, drawer, controls, safe area |
| `/office/profile/edit` ProfileEditComponent | OK | OK | OK | OK | Поля, действия, горизонтальные tabs, validation, диалоги |
| `/office/profile/:id/` DeatilComponent | OK | OK | OK | OK | Детали, новости, перенос длинного контента |
| `/office/profile/:id/` ProfileMainComponent | OK | OK | OK | OK | Детали, новости, перенос длинного контента |
| `/office/profile/:id/news/:newsId` ProfileNewsComponent | OK | OK | OK | OK | Детали, новости, перенос длинного контента |
| `/office/courses/` CourseDetailComponent | OK | OK | OK | OK | Детали и урок, поля, CTA, доступный контент |
| `/office/courses/` CourseInfoComponent | OK | OK | OK | OK | Детали и урок, поля, CTA, доступный контент |
| `/office/courses/lesson/:lessonId` LessonComponent | — | — | — | — | Декларация/redirect: см. пояснения |
| `/office/courses/lesson/:lessonId/results` TaskCompleteComponent | — | — | — | — | Декларация/redirect: см. пояснения |
| `/office/vacancies/` VacanciesDetailComponent | OK | OK | OK | OK | Shared controls/dialogs; существующая mobile сетка |
| `/office/vacancies/` VacancyInfoComponent | OK | OK | OK | OK | Shared controls/dialogs; существующая mobile сетка |

## Пояснения

- `/auth/verification` выполняет подтверждение и переход; отдельный устойчивый UI не предусмотрен.
- Вторые декларации `/office/courses/lesson/:id` и `/office/courses/lesson/:id/results` перекрыты первым lazy-модулем `courses`. Браузер подтверждает переход в `/office/courses/all`. Рабочие адреса — `/office/courses/:courseId/lesson/:lessonId`.
- Экран результатов урока проверен с завершённым уроком; также пройден переход к результатам после отправки ответа.
- Root и layout проверены через дочерние экраны. Redirects проверяются как переходы, не как самостоятельные страницы.
- В Angular router нет интерфейса staff/superuser/admin и CRUD мероприятий. Самостоятельные chats отключены в office.routes; route чата проекта проверен, но его CTA помечен продуктом как недоступный. Новые routes/permissions не добавлены.

## Функциональные проверки 320 / 390

| Сценарий | 320 | 390 |
| --- | --- | --- |
| registration | OK | OK |
| navigation-login | OK | OK |
| profile-controls | OK | OK |
| participant-application-team | OK | OK |
| expert-rating | OK | OK |
| vacancy-response | OK | OK |
| manager-project-and-responses | OK | OK |
| course-lesson | OK | OK |
| onboarding-first-step | OK | OK |
| course-alternative-inputs | OK | OK |
| long-content-and-states | OK | OK |
| analytics-tables-and-tooltip | OK | OK |
