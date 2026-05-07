<!-- @format -->

# Module: `project`

Самый большой модуль приложения — проекты. Состоит из 8 sub-доменов на уровне портов и репозиториев:

- `project` — основная CRUD-логика проекта.
- `project-collaborators` — участники команды (delete / switch leader / leave).
- `project-goals` — цели проекта.
- `project-news` — новости проекта.
- `project-partner` — партнёры проекта.
- `project-program` — связь проекта с партнёрской программой.
- `project-rating` — оценка проектов в рамках программы (для экспертов).
- `project-resource` — ресурсы проекта.
- `project-subscription` — подписки на проект.

Плюс много других не-port-овых частей: `dashboard`, `detail/info|work-section|team|vacancies|chat|news-detail`, `edit` с 6 шагами, `list` (my/all/subscriptions/invites). Всего **33 use-case'а**, **9 репозиториев**, **9 файлов DI**, **8 HTTP-адаптеров**, **6 step-компонентов** и куча страниц.

> Канбан-страницы (`pages/projects/detail/kanban/`) физически в файловой системе остаются, но **роуты и кнопка "открыть доску задач" закомментированы** (см. [`docs/PROJECT.md`](../PROJECT.md#точки-входа-в-роутинг)). Эта документация канбан **не покрывает**.

## Назначение

- **Дашборд** (`/office/projects/dashboard`) — секции "мои", "подписки", "приглашения", сводка.
- **Списки** (`/office/projects/{my,subscriptions,invites,all}`) — пагинированные списки с фильтрами.
- **Деталь** (`/office/projects/:projectId`) — info / vacancies / team / work-section / chat (через DeatilComponent + child routes).
- **Редактирование** (`/office/projects/:projectId/edit`) — пошаговая форма (main → contacts → achievements → vacancies → team → additional). За guard'ом `ProjectEditRequiredGuard` ([см. `docs/core/guards-models.md`](../core/guards-models.md#projecteditrequiredguard)).
- **News** — отдельная новость проекта `:projectId/news/:newsId`.
- **Подписка** на проект (для следящих).
- **Оценка проектов** (рейтинг) — для экспертов внутри партнёрской программы.

---

## Domain (`domain/project/`)

### Основные модели

| Файл | Экспорт | Что |
|---|---|---|
| `project.model.ts` | `Project`, `ProjectCount`, `ProjectStep`, `PartnerProgramInfo` | Главная модель — id, name, description, целевая аудитория, регион, deadline, TRL, проблема, achievements (inline), `partners[]`, `resources[]`, `goals[]`, industry id, `links[]`, `imageAddress`/`coverImageAddress`/`presentationAddress`, `numberOfCollaborators`, `viewsCount`, `collaborators[]`, `draft`, `leader` (id), `leaderInfo`, `partnerProgramsTags[]`, `partnerProgram: PartnerProgramInfo \| null`, `vacancies: Vacancy[]`, `isCompany`, `inviteId`. `Project.default()` — статичная заглушка для тестов. |
| `collaborator.model.ts` | `Collaborator` | userId, firstName, lastName, role, skills (id+name+category), avatar. |
| `goals.model.ts` | `Goal`, `ResponsibleInfo` (внутренний) | id, project (id), title, completionDate, responsible (id), responsibleInfo, isDone. |
| `partner.model.ts` | `Partner`, `PartnerDto`, `Company` (внутренний) | id, projectId (sic — `projecId` опечатка в коде), `company: { id, name, inn }`, contribution, decisionMaker. |
| `resource.model.ts` | `Resource`, `ResourceDto` | id, projectId, `type: "infrastructure" \| "staff" \| "financial" \| "information"`, description, partnerCompany (id). |
| `project-news.model.ts` | `FeedNews`, `ProjectNews` | (используется и в feed/, см. [`docs/modules/news.md`](news.md)) |
| `project-additional-fields.model.ts` | — | Дополнительные поля проекта (для партнёрских программ). |
| `project-assign.model.ts` | `ProjectAssign` | Результат `assignProjectToProgram`. |
| `project-rate.ts`, `project-rating-criterion.ts`, `project-rating-criterion-output.ts`, `project-rating-criterion-type.ts` | (rating models) | Структуры для модуля оценки проектов экспертами. |
| `project-subscriber.model.ts` | `ProjectSubscriber` | Подписчик на проект. |
| `step.model.ts` | (steps for edit flow) | Шаги пошагового редактирования. |
| `skill.model.ts`, `skills-group.model.ts`, `specialization.model.ts`, `specializations-group.model.ts` | (re-export wrappers) | Локальные wrapper'ы вокруг `domain/skills` и `domain/specializations` — атавизм. |

### Commands

```ts
interface UpdateFormCommand { id: number; data: Partial<ProjectDto>; }
```

### Domain events

| Event | Payload |
|---|---|
| `ProjectCreated` | `{ projectId }` |
| `ProjectDeleted` | `{ projectId }` |
| `ProjectSubscribed` | `{ projectId }` |
| `ProjectUnSubscribed` | `{ projectId }` (sic — `Unsubscribed` написано через `Sub`) |
| `RemoveProjectCollaborator` | `{ projectId, userId }` |

`ProjectRepository` слушает все эти события **сам себя** (через `EventBus`), плюс события из `vacancy` модуля (`SendVacancyResponse`, `AcceptVacancyResponse`, `RejectVacancyResponse`) — для инвалидации кеша.

### Ports

| Port | Методы |
|---|---|
| `ProjectRepositoryPort` | `count$ BehaviorSubject<ProjectCount>`, `getAll(params?)`, `getOne(id)`, `getMy(params?)`, `postOne()`, `update(id, data)`, `deleteOne(id)`, `refreshCount()`, `invalidate(id)` |
| `ProjectCollaboratorsRepositoryPort` | `deleteCollaborator(projectId, userId)`, `patchSwitchLeader(projectId, userId)`, `deleteLeave(projectId)` |
| `ProjectGoalsRepositoryPort` | `fetchAll(projectId)`, `createGoal(projectId, params: GoalFormData[])`, `editGoal(projectId, goalId, params)`, `deleteGoal(projectId, goalId)` |
| `ProjectNewsRepositoryPort` | `fetchNews`, `fetchNewsDetail`, `addNews`, `readNews`, `delete`, `toggleLike`, `editNews` (зеркало `ProfileNewsRepositoryPort`) |
| `ProjectPartnerRepositoryPort` | `fetchAll`, `createPartner`, `updatePartner` (только `contribution` + `decisionMaker`), `deletePartner` |
| `ProjectProgramRepositoryPort` | `assignProjectToProgram(projectId, partnerProgramId)`, `sendNewProjectFieldsValues(projectId, newValues)` |
| `ProjectRatingRepositoryPort` | `getAll(programId, params?)`, `postFilters(programId, filters, params?)`, `rate(projectId, scores)`, `formValuesToDTO(criteria, outputVals)` |
| `ProjectResourceRepositoryPort` | `fetchAll`, `createResource`, `updateResource`, `deleteResource` |
| `ProjectSubscriptionRepositoryPort` | `getSubscribers`, `addSubscription`, `getSubscriptions(userId, params?)`, `deleteSubscription` |

DI-биндинги (по одному файлу на каждый port, подключаются в `app.config.ts`):

```
project.providers.ts
project-collaborators.providers.ts
project-goals.providers.ts
project-news.providers.ts
project-partner.providers.ts
project-program.providers.ts
project-rating.providers.ts
project-resources.providers.ts
project-subscription.providers.ts
```

---

## Use-cases (33 шт., `api/project/use-cases/`)

| Use-case | Назначение |
|---|---|
| `GetAllProjectsUseCase` | Список всех (`/projects/`). |
| `GetMyProjectsUseCase` | Мои проекты (`/projects/my`). |
| `GetProjectUseCase` | Один проект по id. |
| `CreateProjectUseCase` | Создать черновик проекта. |
| `DeleteProjectUseCase` | Удалить (эмитит `ProjectDeleted`). |
| `LeaveProjectUseCase` | Выйти из проекта. |
| `RemoveProjectCollaboratorUseCase` | Удалить участника (эмитит `RemoveProjectCollaborator`). |
| `SubmitCompetitiveProjectUseCase` | Подать проект на конкурс / партнёрскую программу. |
| `SendProjectAdditionalFieldsUseCase` | Отправить дополнительные поля для партнёрской программы. |
| `GetProjectGoalsUseCase`, `CreateGoalsUseCase`, `DeleteGoalUseCase` | CRUD по целям. |
| `GetProjectPartnersUseCase`, `CreatePartnerUseCase`, `DeletePartnerUseCase` | CRUD по партнёрам. |
| `GetProjectResourcesUseCase`, `CreateResourceUseCase`, `DeleteResourceUseCase` | CRUD по ресурсам. |
| `GetProjectSubscribersUseCase`, `GetProjectSubscriptionsUseCase` | Подписки. |
| `AddProjectSubscriptionUseCase`, `DeleteProjectSubscriptionUseCase` | Подписаться / отписаться (эмитят `ProjectSubscribed`/`ProjectUnSubscribed`). |
| `FetchProjectNewsUseCase`, `GetProjectNewsDetailUseCase`, `AddProjectNewsUseCase`, `EditProjectNewsUseCase`, `DeleteProjectNewsUseCase`, `ReadProjectNewsUseCase`, `ToggleProjectNewsLikeUseCase` | News CRUD (зеркало profile-news). |

Все use-case'ы возвращают `Observable<Result<T, E>>`. Покрытия `*.spec.ts` файлами — частичное (большинство есть).

---

## Facades (`api/project/facades/`)

Структура повторяет фичи UI:

### Verticals

| Facade | Provided | Что |
|---|---|---|
| `ProjectsListInfoService` | страница | Список проектов (my/all/subscriptions/invites) с фильтрацией, пагинацией, инфинит-скроллом. |
| `ProjectsDashboardInfoService` + `ProjectsDashboardUIInfoService` | страница | Дашборд: секции с разными выборками. |
| `ProjectsDetailService` + `ProjectsDetailUIInfoService` | страница | Детальная страница (info + tabs). Хранит `project` signal, `loggedUserId`, `goals`, `collaborators` и computed-значения для UI (`isOwner`, `isMember`, `submissionProjectDateExpired` и т. п.). |
| `ProjectsDetailWorkSectionInfoService` + UI | страница | Раздел `/work-section` — отклики на вакансии, "доска задач" (kanban-кнопка закомментирована). |
| `ProjectsDetailChatService` | страница | Project chat в детальной странице. |
| `ProjectsInfoService` | root | Глобальные операции с проектами (`postOne`, `deleteOne` etc.) — старее, чем use-case'ы; постепенно мигрирует. |
| `ProjectsUIInfoService` | root | Общая UI-info, не привязанная к одной странице. |

### Edit-флоу

`ProjectsEditInfoService` (root-facade координатор) + `ProjectsEditUIInfoService`. Каждый шаг имеет свой service:

| Step | Facade | Что |
|---|---|---|
| Main | `ProjectFormService` (root) + `ProjectFormFactory` + `ProjectFormAutosaveService` | Корневая `FormGroup` + autosave (debounce + `update(id, partial)`). |
| Contacts | `ProjectContactsService` | Шаг "контакты". |
| Achievements | `ProjectAchievementsService` + `ProjectAchievementsUIService` | FormArray. |
| Goals | `ProjectGoalsService` + `ProjectGoalsUIService` | FormArray + responsible-picker. |
| Partner & Resources | `ProjectPartnerService` + `ProjectResourcesService` | Раздельные FormArrays для партнёров и ресурсов. |
| Vacancy | `ProjectVacancyService` + `ProjectVacancyUIService` | Управление вакансиями проекта (CRUD через `Vacancy` модуль). |
| Team | `ProjectTeamService` + `ProjectTeamUIService` | Команда: invites + members. |
| Additional | `ProjectAdditionalService` | Дополнительные поля партнёрской программы. |

> `ProjectFormAutosaveService` — отдельный сервис, который слушает `valueChanges` корневой формы через `debounceTime` и сам дёргает `update()`. Это предотвращает потерю данных, если пользователь закрыл вкладку посреди шага.

### Cross-cutting (старые)

| Сервис | Что |
|---|---|
| `projects.service.ts` (`ProjectsService`) | Legacy старого стиля — постепенно вытесняется use-case'ами. Оставлен ради обратной совместимости. |
| `project-form.service.ts` | Сборка корневой `FormGroup` из 6 шагов. |
| `project-step.service.ts` (`ProjectStepService`) | Управление текущим шагом edit (тип `EditStep`). Используется и в profile-edit. |
| `project-form.factory.ts` (в `facades/edit/`) | Фабрика чистых `FormGroup`-инстансов под каждый шаг. |

---

## Repositories (`infrastructure/repository/project/`)

`ProjectRepository` — самый интересный, остальные тривиальные:

```ts
@Injectable({ providedIn: "root" })
export class ProjectRepository implements ProjectRepositoryPort {
  private readonly entityCache = new EntityCache<Project>();
  readonly count$ = new BehaviorSubject<ProjectCount>({ my: 0, all: 0, subs: 0 });

  constructor() {
    this.initializeEventListeners();   // ← подписки на EventBus
  }

  // Обработчики событий:
  // ProjectCreated → count.my++
  // ProjectDeleted → invalidate(payload.projectId), count.my--
  // ProjectSubscribed → count.subs++
  // ProjectUnSubscribed → invalidate(payload.projectId), count.subs--
  // RemoveProjectCollaborator → invalidate(payload.projectId)
  // SendVacancyResponse / AcceptVacancyResponse / RejectVacancyResponse → invalidate(projectId)
}
```

Это образцовое использование `EventBus` + `EntityCache` (см. [`docs/social-platform/architecture.md`](../social-platform/architecture.md#cross-cutting-блоки)). Все мутации через repo автоматически инвалидируют кеш через события.

`getOne(id)` использует `entityCache.getOrFetch(id, () => adapter.getOne(id))`.

Остальные репо — pass-through к адаптерам с `plainToInstance` где нужно.

---

## Adapters & DTO (`infrastructure/adapters/project/`)

Префиксы:
- `/projects` — все project-эндпоинты.
- `/programs/<programId>/projects/...` — для rating и program-link.

DTO лежат в `dto/`:

| DTO | Что |
|---|---|
| `project.dto.ts` | Полная сериализация Project для API (без вычисляемых полей). |
| `project-collaborators.dto.ts` | Тип ответа на CRUD коллабораторов. |
| `project-goal.dto.ts` | `GoalFormData` (для CreateGoals/EditGoal). |
| `project-partners.dto.ts` | DTO партнёра. |
| `project-program.dto.ts` | Связка проекта с программой. |
| `project-resources.dto.ts` | DTO ресурса. |
| `project-vacancy.dto.ts` | DTO вакансии (создание + обновление). |

HTTP-эндпоинты (укрупнённо):

| Адаптер | Базовый URL | Ключевые операции |
|---|---|---|
| `ProjectHttpAdapter` | `/projects` | `getAll`, `getOne`, `getMy`, `postOne` (создаёт черновик), `update(id, data)`, `deleteOne(id)`, `getCount` |
| `ProjectCollaboratorsHttpAdapter` | `/projects/<id>/collaborators` | DELETE collaborator, PATCH switch_leader, DELETE leave |
| `ProjectGoalsHttpAdapter` | `/projects/<id>/goals` | CRUD |
| `ProjectNewsHttpAdapter` | `/projects/<id>/news` | CRUD + set_viewed + set_liked |
| `ProjectPartnerHttpAdapter` | `/projects/<id>/partners` | CRUD |
| `ProjectProgramHttpAdapter` | `/projects/<id>/...` (assign-to-program) и `/projects/<id>/program-fields/` | assign + send-fields |
| `ProjectRatingHttpAdapter` | `/programs/<programId>/projects` | get rating list, post filters, rate |
| `ProjectResourceHttpAdapter` | `/projects/<id>/resources` | CRUD |

Subscription-репозиторий пользуется `ProjectHttpAdapter` (без отдельного адаптера).

---

## Routes (`ui/routes/projects/`)

### `projects.routes.ts`

```
/office/projects/
  /                      → redirect to dashboard
  /dashboard             → DashboardProjectsComponent (resolve: ProjectsResolver)
  /my                    → ProjectsListComponent (ProjectsMyResolver)
  /subscriptions         → ProjectsListComponent (ProjectsSubscriptionsResolver)
  /invites               → ProjectsListComponent (ProjectsInvitesResolver)
  /all                   → ProjectsListComponent (ProjectsAllResolver)
/office/projects/:projectId/edit  → ProjectEditComponent
                                     resolve: ProjectEditResolver
                                     canActivate: [ProjectEditRequiredGuard]
/office/projects/:projectId       → lazy load ./detail.routes
```

### `detail.routes.ts`

```
/office/projects/:projectId
  resolve: ProjectDetailResolver
  data: { listType: "project" }
  parent: DeatilComponent (виджет)
  /                       → ProjectInfoComponent (resolve: ProjectInfoResolver)
    /news/:newsId         → NewsDetailComponent (resolve: NewsDetailResolver)
  /vacancies              → ProjectVacanciesComponent
  /team                   → ProjectTeamComponent
  /work-section           → ProjectWorkSectionComponent (resolve: ProjectResponsesResolver)
  /chat                   → ProjectChatComponent (resolve: ProjectChatResolver)
  /kanban                 → DISABLED (закомментировано)
```

---

## Pages (`ui/pages/projects/`)

| Page | Файл | Selector | Что |
|---|---|---|---|
| `ProjectsComponent` | `pages/projects/projects.component.ts` | `app-projects` | Корневой layout — табы дашборд / мои / все / подписки / приглашения. |
| `DashboardProjectsComponent` | `pages/projects/dashboard/dashboard.component.ts` | `app-dashboard-projects` | Сводный дашборд с секциями. |
| `DashboardItem` | `dashboard/dashboardItem/dashboardItem.component.ts` | `app-dashboard-item` | Один блок дашборда. |
| `ProjectsListComponent` | `pages/projects/list/list.component.ts` | `app-projects-list` | Универсальный список с пагинацией и инфинит-скроллом — переключается между my/all/subscriptions/invites через resolver-data. |
| `BarNewComponent` | `pages/projects/bar-new/...` | — | Toolbar при создании. |
| `ProjectInfoComponent` | `detail/info/info.component.ts` | `app-project-info` | Главная вкладка детальной — три-колоночный layout (`<app-projects-left-side>` / `<app-projects-mid-side>` / `<app-projects-right-side>`). |
| `ProjectVacanciesComponent` | `detail/vacancies/vacancies.component.ts` | `app-project-vacancies` | Вакансии проекта. |
| `ProjectTeamComponent` | `detail/team/team.component.ts` | `app-project-team` | Команда проекта. |
| `ProjectWorkSectionComponent` | `detail/work-section/work-section.component.html` | `app-project-work-section` | "Рабочая зона" — мои задачи (когда был канбан) + база знаний + отклики. Кнопка "открыть доску задач" сейчас закомментирована. |
| `ProjectChatComponent` | `detail/chat/chat.component.ts` | `app-project-chat` | Чат проекта. Использует `widgets/chat-window`. |
| `NewsDetailComponent` | `detail/news-detail/news-detail.component.ts` | `app-news-detail` | Детальная страница новости проекта. |
| `ProjectEditComponent` | `edit/edit.component.ts` | `app-project-edit` | Корневой компонент edit с навигацией по шагам через `<app-project-navigation>`. |
| `ProjectMainStepComponent` | `edit/components/project-main-step/...` | `app-project-main-step` | Step 1: основные данные. |
| `ProjectPartnerResourcesStepComponent` | `edit/components/project-partner-resources-step/...` | `app-project-partner-resources-step` | Step 2: партнёры + ресурсы (один экран). |
| `ProjectAchievementStepComponent` | `edit/components/project-achievement-step/...` | `app-project-achievement-step` | Step 3: достижения. |
| `ProjectVacancyStepComponent` | `edit/components/project-vacancy-step/...` | `app-project-vacancy-step` | Step 4: вакансии. |
| `ProjectTeamStepComponent` | `edit/components/project-team-step/...` | `app-project-team-step` | Step 5: команда + invite-card + collaborator-card. |
| `ProjectAdditionalStepComponent` | `edit/components/project-additional-step/...` | `app-project-additional-step` | Step 6: дополнительные поля программы. |

### Resolvers

- `ProjectsResolver` — счётчики проектов (count.my/all/subs).
- `ProjectsMyResolver`, `ProjectsAllResolver`, `ProjectsSubscriptionsResolver`, `ProjectsInvitesResolver` — соответствующие списки.
- `ProjectEditResolver` — данные для редактирования.
- `ProjectDetailResolver` (на детальном parent) — `Project.getOne(id)`.
- `ProjectInfoResolver`, `ProjectResponsesResolver`, `ProjectChatResolver`, `NewsDetailResolver` — на child-роутах.

---

## Consumers (за пределами модуля)

| Где | Что использует |
|---|---|
| `widgets/info-card`, `widgets/detail`, `widgets/project-vacancy-card` | Project model и facade'ы. |
| `pages/program/...` | ProjectRating, projects-of-program (через `ProjectRatingRepositoryPort`). |
| `pages/feed/new-project` | `CreateProjectUseCase`. |
| `core/lib/guards/projects-edit/projects-edit.guard.ts` | `ProjectRepositoryPort.getOne()` (для проверки `partnerProgram.isSubmitted`). |
| `core/lib/guards/kanban/kanban.guard.ts` (отключён) | то же. |
| `domain/auth/user.model` | `User.projects: Project[]`, `User.subscribedProjects: Project[]`. |

---

## Известные проблемы

| Что | Где | Заметка |
|---|---|---|
| `Partner.projecId` (sic) — опечатка | `domain/project/partner.model.ts` | Не исправлять — используется в шаблонах и DTO. |
| `ProjectUnSubscribed` (sic) | `events/project-unsubsribed.event.ts` | То же. |
| `domain/project/skill.model.ts`, `skills-group.model.ts`, `specialization.model.ts`, `specializations-group.model.ts` — wrappers вокруг `domain/skills/...` | избыточно | Удалить и использовать напрямую `@domain/skills/...`. |
| Legacy `ProjectsService` (`api/project/projects.service.ts`) рядом с use-case'ами | `api/project/projects.service.ts` | Постепенно мигрировать всю логику в use-case'ы. |
| Размытость edit-флоу — 14+ facade'ов на 6 шагов | `api/project/facades/edit/*` | Реальный архитектурный долг. |
| `ProjectRepository` слушает события из `vacancy` модуля и **сам себя** | `project.repository.ts` | OK как pattern, но смешение ответственности. |
| `ProjectFormAutosaveService` — autosave может потерять данные при оффлайне | `api/project/facades/edit/project-form-autosave.service.ts` | Добавить retry / queue. |
| Тонна `any` в `dashboardItemBuilder` / `directionItemBuilder` | `utils/...` | См. [`docs/social-platform/shared.md`](../social-platform/shared.md). |
