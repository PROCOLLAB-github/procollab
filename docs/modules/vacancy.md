<!-- @format -->

# Module: `vacancy`

Вакансии в проектах: создание / редактирование внутри project-edit, публичный список и детальная страница, отклики (response) пользователей и accept/reject решения лидером проекта.

## Назначение

- **Список всех вакансий** (`/office/vacancies/all`) с фильтрацией и поиском.
- **Список моих откликов** (`/office/vacancies/my`) — отклики текущего пользователя.
- **Детальная страница вакансии** (`/office/vacancies/:vacancyId`) с возможностью отправить `whyMe` мотивацию.
- **CRUD вакансий** для лидера проекта — создаётся в `pages/projects/edit` (step "vacancy"), не в этом модуле.
- **Accept / reject отклика** — у лидера в `pages/projects/detail/work-section`.

Связан с [`project`](project.md) (вакансия принадлежит проекту, accept меняет состав команды) и [`skills`](skills.md) (`requiredSkills`).

---

## Domain (`domain/vacancy/`)

### `vacancy.model.ts`

```ts
export class Vacancy {
  id: number;
  role: string;
  isActive: boolean;
  project: Project; // полная модель проекта (см. domain/project)
  requiredSkills: Skill[]; // см. domain/skills
  description: string;
  requiredExperience: string; // строка из core/consts/lists/work-experience-list
  workFormat: string; // онлайн / гибрид / офис
  salary: string; // строкой "от 50000 до 100000" — без типизации
  workSchedule: string; // полный день / частичная / гибкий
  specialization?: string;
  datetimeCreated: string;
  datetimeUpdated: string;

  getSkillsNames(): string[]; // helper для отображения тегов
}
```

### `vacancy-response.model.ts`

```ts
export class VacancyResponse {
  id: number;
  whyMe: string; // мотивационное письмо
  isApproved?: boolean; // undefined пока решение не принято
  user: User; // отозвавшийся
  vacancy: number; // id вакансии
  accompanyingFile: FileModel; // прикреплённый файл
}
```

### Domain events (`domain/vacancy/events/`)

| Event                   | Payload                     | Кто слушает                                   |
| ----------------------- | --------------------------- | --------------------------------------------- |
| `VacancyCreated`        | `{ projectId }`             | `VacancyRepository` (`invalidate(projectId)`) |
| `VacancyUpdated`        | `{ vacancyId }`             | `VacancyRepository` (`invalidate(vacancyId)`) |
| `VacancyDelete`         | `{ vacancyId }`             | `VacancyRepository` (`invalidate(vacancyId)`) |
| `SendVacancyResponse`   | `{ projectId, vacancyId? }` | `ProjectRepository` (инвалидация проекта)     |
| `AcceptVacancyResponse` | `{ projectId }`             | `ProjectRepository`                           |
| `RejectVacancyResponse` | `{ projectId }`             | `ProjectRepository`                           |

> Событие удаления названо `VacancyDelete` (а не `VacancyDeleted`) — ассиметрия с `VacancyCreated` / `VacancyUpdated`. Не исправлять — события уже эмитятся.

### `ports/vacancy.repository.port.ts`

```ts
abstract class VacancyRepositoryPort {
  // Поиск с фильтрами (для /vacancies/all)
  getForProject(
    limit,
    offset: number,
    projectId?: number,
    requiredExperience?,
    workFormat?,
    workSchedule?,
    salary?,
    searchValue?: string,
  ): Observable<Vacancy[]>;

  getMyVacancies(limit, offset): Observable<VacancyResponse[]>; // мои отклики
  getOne(vacancyId): Observable<Vacancy>;
  postVacancy(projectId, vacancy: CreateVacancyDto): Observable<Vacancy>;
  updateVacancy(vacancyId, vacancy: Partial<Vacancy> | CreateVacancyDto): Observable<Vacancy>;
  deleteVacancy(vacancyId): Observable<void>;

  // Отклики
  sendResponse(vacancyId, body: { whyMe: string }): Observable<VacancyResponse>;
  responsesByProject(projectId): Observable<VacancyResponse[]>;
  acceptResponse(responseId): Observable<VacancyResponse>;
  rejectResponse(responseId): Observable<VacancyResponse>;
}
```

DI-биндинг (`infrastructure/di/vacancy.providers.ts`):

```ts
{ provide: VacancyRepositoryPort, useExisting: VacancyRepository }
```

---

## Use-cases (`api/vacancy/use-cases/`)

| Use-case                     | Параметры                                                                                           | Возвращает                         | Эмитит событие          |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------- |
| `GetVacanciesUseCase`        | `limit, offset, projectId?, requiredExperience?, workFormat?, workSchedule?, salary?, searchValue?` | `Result<Vacancy[], error>`         | —                       |
| `GetVacancyDetailUseCase`    | `vacancyId`                                                                                         | `Result<Vacancy, error>`           | —                       |
| `GetMyVacanciesUseCase`      | `limit, offset`                                                                                     | `Result<VacancyResponse[], error>` | —                       |
| `PostVacancyUseCase`         | `projectId, vacancy`                                                                                | `Result<Vacancy, error>`           | `VacancyCreated`        |
| `UpdateVacancyUseCase`       | `vacancyId, vacancy`                                                                                | `Result<Vacancy, error>`           | `VacancyUpdated`        |
| `DeleteVacancyUseCase`       | `vacancyId, projectId`                                                                              | `Result<void, error>`              | `VacancyDelete`         |
| `SendVacancyResponseUseCase` | `vacancyId, body, projectId?`                                                                       | `Result<VacancyResponse, error>`   | `SendVacancyResponse`   |
| `GetProjectResponsesUseCase` | `projectId`                                                                                         | `Result<VacancyResponse[], error>` | —                       |
| `AcceptResponseUseCase`      | `responseId, projectId`                                                                             | `Result<VacancyResponse, error>`   | `AcceptVacancyResponse` |
| `RejectResponseUseCase`      | `responseId, projectId`                                                                             | `Result<VacancyResponse, error>`   | `RejectVacancyResponse` |

10 use-case'ов. Все мутации эмитят события — потребители (`ProjectRepository`, `VacancyRepository`) сами решают что инвалидировать.

---

## Facades (`api/vacancy/facades/`)

| Facade                       | Provided                  | Что                                                                                                                                                                                                                                                    |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VacancyInfoService`         | страница `/vacancies`     | Список — реактивный поиск/фильтрация через `searchForm` + `filterForm`, query-param sync (`role_contains`, `required_experience`, `work_format` и т. п.), debounce, инфинит-скролл.                                                                    |
| `VacancyUIInfoService`       | страница `/vacancies`     | UI-info — `vacancies$ AsyncState`, `listType` (`"all" \| "my"`), `searchForm`, `filterForm`, `vacanciesTake`, `vacanciesPage`.                                                                                                                         |
| `VacancyDetailInfoService`   | страница `/vacancies/:id` | Детальная страница — `initializeDetailInfo()` подписка на `route.data`, `initializeDetailInfoQueryParams()` (модалка результата отправки отклика), `onSubmitForm()` через `SendVacancyResponseUseCase`, проверка валидности через `ValidationService`. |
| `VacancyDetailUIInfoService` | страница `/vacancies/:id` | `vacancy: signal<Vacancy>`, `sendForm: { whyMe }`, `sendFormIsSubmitting$ AsyncState`, computed для модалок и состояния отклика.                                                                                                                       |

Также используется `ExpandService` (см. cross-cutting) для раскрытия описания вакансии.

---

## Repository (`infrastructure/repository/vacancy/vacancy.repository.ts`)

`VacancyRepository implements VacancyRepositoryPort`. Pass-through к адаптеру с `plainToInstance(Vacancy, ...)` / `plainToInstance(VacancyResponse, ...)`. Использует `EntityCache<Vacancy>` для `getOne`.

В конструкторе подписывается на свои же события через `EventBus`:

```ts
this.eventBus
  .on<VacancyCreated>("VacancyCreated")
  .subscribe(event => this.invalidate(event.payload.projectId));
this.eventBus
  .on<VacancyUpdated>("VacancyUpdated")
  .subscribe(event => this.invalidate(event.payload.vacancyId));
this.eventBus
  .on<VacancyDelete>("VacancyDelete")
  .subscribe(event => this.invalidate(event.payload.vacancyId));
```

> `VacancyCreated` инвалидирует **по projectId**, `Updated`/`Delete` — **по vacancyId**. Это потенциально расходящиеся ключи в `EntityCache<Vacancy>` (cache по id вакансии).

---

## HTTP endpoints (`infrastructure/adapters/vacancy/vacancy-http.adapter.ts`)

Префиксы: `/vacancies`, `/projects` (для responses-by-project).

| Метод                                                                                                              | HTTP   | URL                                        | Параметры                                                                                                        | Ответ               |
| ------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------- |
| `getForProject(limit, offset, projectId?, requiredExperience?, workFormat?, workSchedule?, salary?, searchValue?)` | GET    | `/vacancies/`                              | query: `limit, offset, project_id?, required_experience?, work_format?, work_schedule?, salary?, role_contains?` | `Vacancy[]`         |
| `getMyVacancies(limit, offset)`                                                                                    | GET    | `/vacancies/responses/self`                | `?limit, offset`                                                                                                 | `VacancyResponse[]` |
| `getOne(vacancyId)`                                                                                                | GET    | `/vacancies/<vacancyId>`                   | —                                                                                                                | `Vacancy`           |
| `postVacancy(projectId, dto)`                                                                                      | POST   | `/vacancies/`                              | `{ ...dto, project: projectId }`                                                                                 | `Vacancy`           |
| `updateVacancy(vacancyId, dto)`                                                                                    | PATCH  | `/vacancies/<vacancyId>`                   | `Partial<Vacancy>`                                                                                               | `Vacancy`           |
| `deleteVacancy(vacancyId)`                                                                                         | DELETE | `/vacancies/<vacancyId>`                   | —                                                                                                                | `void`              |
| `sendResponse(vacancyId, body)`                                                                                    | POST   | `/vacancies/<vacancyId>/respond`           | `{ whyMe }`                                                                                                      | `VacancyResponse`   |
| `responsesByProject(projectId)`                                                                                    | GET    | `/projects/<projectId>/responses`          | —                                                                                                                | `VacancyResponse[]` |
| `acceptResponse(responseId)`                                                                                       | POST   | `/vacancies/responses/<responseId>/accept` | —                                                                                                                | `VacancyResponse`   |
| `rejectResponse(responseId)`                                                                                       | POST   | `/vacancies/responses/<responseId>/reject` | —                                                                                                                | `VacancyResponse`   |

> Endpoints без trailing slash где-то есть (`getOne`, `updateVacancy`, `deleteVacancy`), в других — с trailing slash. Несогласованно (особенность бэка).

---

## Routes (`ui/routes/vacancy/`)

### `vacancies.routes.ts`

```
/office/vacancies/
  /                   → redirect to all
  /all                → VacanciesListComponent (resolve: VacanciesResolver)
  /my                 → lazy ./list.routes
  /:vacancyId         → lazy ./vacancies-detail.routes
```

### `list.routes.ts` (для `/my`)

```
""  → VacanciesListComponent (resolve: VacanciesMyResolver)
```

> `VacanciesListComponent` переиспользуется для `/all` и `/my`, тип определяется по URL внутри компонента.

### `vacancies-detail.routes.ts`

```
""  → VacanciesDetailComponent (resolve: VacanciesDetailResolver)
  ""  → VacancyInfoComponent (default child)
```

---

## Pages (`ui/pages/vacancies/`)

| Page                                                        | Файл                                                            | Selector                  | Что                                                                                                                                                     |
| ----------------------------------------------------------- | --------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VacanciesComponent`                                        | `pages/vacancies/vacancies.component.ts`                        | `app-vacancies`           | Корневой layout — табы all/my.                                                                                                                          |
| `VacanciesListComponent`                                    | `pages/vacancies/list/list.component.ts`                        | `app-vacancies-list`      | Список вакансий или откликов (по URL). Подключает `<app-vacancy-filter>`, `<app-vacancy-card>`. Provides `VacancyInfoService` + `VacancyUIInfoService`. |
| `ResponseCardComponent`                                     | `pages/vacancies/list/response-card/response-card.component.ts` | `app-response-card`       | Карточка отклика (для `/my`).                                                                                                                           |
| `VacanciesDetailComponent`                                  | `pages/vacancies/detail/vacancies-detail.component.ts`          | `app-vacancies-detail`    | Корневой layout детальной страницы.                                                                                                                     |
| `VacancyInfoComponent`                                      | `pages/vacancies/detail/info/info.component.ts`                 | `app-vacancy-info`        | Информация о вакансии — два-колоночный layout (`<app-vacancies-left-side>` / `<app-vacancies-right-side>`).                                             |
| `VacanciesLeftSideComponent`, `VacanciesRightSideComponent` | `detail/info/components/...`                                    | соответствующие селекторы | Колонки detail-страницы.                                                                                                                                |

### Resolvers

- `VacanciesResolver` — `GetVacanciesUseCase.execute(0, 20)` для `/all`.
- `VacanciesMyResolver` — `GetMyVacanciesUseCase.execute(0, 20)` для `/my`.
- `VacanciesDetailResolver` — `GetVacancyDetailUseCase.execute(vacancyId)` для детальной.

---

## Widgets, потребляющие вакансии

| Widget                       | Где документирован                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `<app-vacancy-card>`         | [`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md) — карточка вакансии. |
| `<app-project-vacancy-card>` | то же — карточка вакансии в контексте проекта.                                                |
| `<app-vacancy-filter>`       | то же — фильтры.                                                                              |

---

## Consumers (за пределами модуля)

| Где                                                   | Как использует                                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `pages/projects/edit/components/project-vacancy-step` | CRUD вакансий проекта через `VacancyRepositoryPort.postVacancy/updateVacancy/deleteVacancy`. |
| `pages/projects/detail/vacancies`                     | Список вакансий проекта через `Project.vacancies` (полная модель из `getOne(projectId)`).    |
| `pages/projects/detail/work-section`                  | Отклики на вакансии проекта через `responsesByProject(projectId)` + accept/reject.           |
| `pages/feed/open-vacancy`                             | Создание вакансии из ленты.                                                                  |
| `widgets/info-card` (с `type="rating"`)               | Отображает информацию о вакансии в карточке проекта.                                         |
| `domain/project/project.model.ts`                     | `Project.vacancies: Vacancy[]`.                                                              |
| `core/lib/services/...`                               | через `EventBus` слушает `VacancyCreated/Updated/Delete`/Send/Accept/Reject.                 |

---
