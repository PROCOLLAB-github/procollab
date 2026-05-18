<!-- @format -->

# Module: `program`

Партнёрские программы — крупные мероприятия с проектами, участниками, сроками регистрации, оценкой проектов экспертами. Связан с [`project`](project.md) (проект подаётся в программу), [`courses`](courses.md) (программа может иметь привязанный курс), [`news`](news.md) (программа имеет свою ленту новостей).

## Назначение

- **Список программ** (`/office/program/all`).
- **Деталь программы** (`/office/program/:programId`) с детьми:
  - main (по умолчанию) — описание + новости + действия.
  - projects — список проектов программы.
  - members — список участников.
  - projects-rating — оценка проектов экспертами.
- **Регистрация в программе** (`/office/program/:programId/register`) — динамическая форма с полями, заданными организатором.
- **Подача проекта в программу** через `applyProjectToProgram()`.
- **Программные новости** — отдельная лента (`pages/program/detail/main` рендерит через `<app-news-card>`).

---

## Domain (`domain/program/`)

### `program.model.ts`

```ts
export class Program {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  city: string;
  tag: string; // строка-категория (например "хакатон")
  year: number;

  // Изображения
  imageAddress: string;
  coverImageAddress: string;
  presentationAddress: string;
  advertisementImageAddress: string;

  // Ссылки и материалы
  links: string[];
  registrationLink: string | null; // URL внешней регистрации (если есть)
  materials: { title: string; url: string }[];

  // Даты
  datetimeRegistrationEnds: string;
  datetimeStarted: string;
  datetimeFinished: string;
  datetimeProjectSubmissionEnds: string;
  datetimeEvaluationEnds: string;

  // Метрики
  viewsCount: number;
  likesCount: number;
  isUserLiked: boolean;

  // Роли пользователя в программе
  isUserManager: boolean; // организатор
  isUserMember: boolean; // участник

  // Связь с курсом (опционально)
  publishProjectsAfterFinish: boolean;
  courseId: number | null;
  courses: { id: number; title: string; isAvailable: boolean }[];

  static default(): Program;
}

export class ProgramDataSchema {
  [key: string]: { type: "text"; name: string; placeholder: string };
}

export class ProgramTag {
  id: number;
  name: string; // отображаемое название
  tag: string; // системный slug
}
```

### `partner-program-fields.model.ts`

Динамические поля, которые программа требует от подающихся проектов:

```ts
class PartnerProgramFields {
  id: number;
  name: string;
  label: string;
  fieldType: "text" | "textarea" | "checkbox" | "select" | "radio" | "file";
  isRequired: boolean;
  helpText: string;
  options: string[]; // для select/radio
  showFilter?: boolean;
}

class PartnerProgramFieldsValues {
  fieldName: string;
  value: string;
}

class ProjectNewAdditionalProgramFields {
  field_id: number; // snake_case в типе — атавизм
  value_text: string | boolean;
}
```

> Поле `value_text` называется `text`, но тип может быть `boolean` — проблема нейминга. Для `checkbox` поля приходит `boolean`. Лучше `value: string | boolean`.

### `program-create.model.ts`, `programs-result.model.ts`

Используются для создания программы (внутри административных страниц — за пределами текущего UI).

### Ports

| Port                      | Файл                                       | Методы                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProgramRepositoryPort`   | `ports/program.repository.port.ts`         | `getAll(skip, take, params?)`, `getActualPrograms()`, `getOne(id)`, `create(program)`, `getDataSchema(id)`, `register(id, data)`, `getAllProjects(id, params?)`, `getAllMembers(id, skip, take)`, `getProgramFilters(id)`, `getProgramProjectAdditionalFields(id)`, `applyProjectToProgram(id, body)`, `createProgramFilters(id, filters, params?)`, `submitCompettetiveProject(relationId)` (sic — опечатка) |
| `PROGRAM_NEWS_REPOSITORY` | `domain/news/port/news.repository.port.ts` | `NewsRepositoryPort<FeedNews>`: `fetchNews`, `fetchNewsDetail`, `addNews`, `readNews`, `delete`, `toggleLike`, `editNews`                                                                                                                                                                                                                                                                                     |

DI-биндинги (`infrastructure/di/program/`):

- `program.providers.ts` — `ProgramRepositoryPort` ↔ `ProgramRepository`.
- `program-news.providers.ts` — `PROGRAM_NEWS_REPOSITORY` ↔ `ProgramNewsRepository`.

---

## Use-cases (22 шт., `api/program/use-cases/`)

| Use-case                                                   | Назначение                                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `GetProgramsUseCase`                                       | Список всех программ с пагинацией.                                                                                                          |
| `GetActualProgramsUseCase`                                 | Только актуальные (текущие) программы.                                                                                                      |
| `GetProgramUseCase`                                        | Одна программа по id.                                                                                                                       |
| `RegisterProgramUseCase`                                   | Регистрация в программу с динамическими полями.                                                                                             |
| `GetProgramDataSchemaUseCase`                              | Схема полей для регистрации.                                                                                                                |
| `GetProgramFiltersUseCase` / `CreateProgramFiltersUseCase` | Фильтры проектов в программе.                                                                                                               |
| `GetAllProjectsUseCase` (program-scope)                    | Проекты программы.                                                                                                                          |
| `GetAllMembersUseCase` (program-scope)                     | Участники программы.                                                                                                                        |
| `ApplyProjectToProgramUseCase`                             | Подать проект в программу.                                                                                                                  |
| `AssignProjectProgramUseCase`                              | Закрепить проект за программой (админ-операция).                                                                                            |
| `ParticipatingProgramUseCase`                              | Участие в программе.                                                                                                                        |
| `GetProjectRatingsUseCase`                                 | Список рейтингов проектов программы.                                                                                                        |
| `FilterProjectRatingsUseCase`                              | Фильтрация рейтингов.                                                                                                                       |
| `RateProjectUseCase`                                       | Оценить проект (для эксперта).                                                                                                              |
| News (6 шт.)                                               | `FetchNewsUseCase`, `AddNewsUseCase`, `EditNewsUseCase`, `DeleteNewsUseCase`, `ReadNewsUseCase`, `ToggleLikeUseCase` — программные новости. |

---

## Facades (`api/program/facades/`)

| Facade                                                            | Provided                                                   | Что                                                                                                                                                                                   |
| ----------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProgramInfoService`                                              | root                                                       | Глобальные операции (cross-pages).                                                                                                                                                    |
| `ProgramMainInfoService` + `ProgramMainUIInfoService`             | страница `/all`                                            | Список всех программ — пагинация, бесконечный скролл.                                                                                                                                 |
| `ProgramDetailMainService` + `ProgramDetailMainUIInfoService`     | страница `/program/:id` (main child)                       | Детальная — подгрузка программы + новости через `PROGRAM_NEWS_REPOSITORY`. Использует `ExpandService` для раскрытия описания. Эмитит подачу проекта через `ProjectAdditionalService`. |
| `ProgramDetailListInfoService` + `ProgramDetailListUIInfoService` | страница `/program/:id/{projects,members,projects-rating}` | Универсальный список (тип определяется по `route.data.listType`). Фильтрация через `<app-program-projects-filter>`.                                                                   |

---

## Repositories (`infrastructure/repository/program/`)

| Repo                    | Что                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProgramRepository`     | Pass-through к `ProgramHttpAdapter`. `EntityCache<Program>` для `getOne`.                                                                                |
| `ProgramNewsRepository` | Pass-through к `ProgramNewsHttpAdapter` для новостей. `readNews()` использует `StorageService` для дедупликации (как в `profile-news` и `project-news`). |

---

## HTTP endpoints

### `program-http.adapter.ts` (префикс `/programs`)

| Метод                                               | HTTP | URL                                  | Параметры                   | Ответ                     |
| --------------------------------------------------- | ---- | ------------------------------------ | --------------------------- | ------------------------- |
| `getAll(skip, take, params?)`                       | GET  | `/programs/`                         | `?limit, offset, ...params` | `ApiPagination<Program>`  |
| `getActualPrograms()`                               | GET  | `/programs/actual/`                  | —                           | `ApiPagination<Program>`  |
| `getOne(programId)`                                 | GET  | `/programs/<programId>/`             | —                           | `Program`                 |
| `create(program)`                                   | POST | `/programs/`                         | `ProgramCreate`             | `Program`                 |
| `getDataSchema(programId)`                          | GET  | `/programs/<programId>/data_schema/` | —                           | `ProgramDataSchema`       |
| `register(programId, data)`                         | POST | `/programs/<programId>/register/`    | `Record<string, string>`    | `ProgramDataSchema`       |
| `getAllProjects(programId, params?)`                | GET  | `/programs/<programId>/projects/`    | `?...params`                | `ApiPagination<Project>`  |
| `getAllMembers(programId, skip, take)`              | GET  | `/programs/<programId>/members/`     | `?limit, offset`            | `ApiPagination<User>`     |
| `getProgramFilters(programId)`                      | GET  | `/programs/<programId>/filters/`     | —                           | `PartnerProgramFields[]`  |
| `getProgramProjectAdditionalFields(programId)`      | GET  | `/programs/<programId>/...`          | —                           | `ProjectAdditionalFields` |
| `applyProjectToProgram(programId, body)`            | POST | `/programs/<programId>/apply/`       | `body`                      | `any`                     |
| `createProgramFilters(programId, filters, params?)` | POST | `/programs/<programId>/filters/`     | `Record<string, string[]>`  | `ApiPagination<Project>`  |
| `submitCompettetiveProject(relationId)`             | POST | `/programs/.../submit/`              | —                           | `Project`                 |

### `program-news-http.adapter.ts`

| Метод                                  | HTTP   | URL                                               | Параметры           | Ответ                     |
| -------------------------------------- | ------ | ------------------------------------------------- | ------------------- | ------------------------- |
| `fetchNews(limit, offset, programId)`  | GET    | `/programs/<programId>/news/`                     | `?limit, offset`    | `ApiPagination<FeedNews>` |
| `setNewsViewed(programId, newsId)`     | POST   | `/programs/<programId>/news/<newsId>/set_viewed/` | `{}`                | `void`                    |
| `toggleLike(programId, newsId, state)` | POST   | `/programs/<programId>/news/<newsId>/set_liked/`  | `{ is_liked }`      | `void`                    |
| `addNews(programId, obj)`              | POST   | `/programs/<programId>/news/`                     | `{ text, files }`   | `FeedNews`                |
| `editNews(programId, newsId, item)`    | PATCH  | `/programs/<programId>/news/<newsId>/`            | `Partial<FeedNews>` | `FeedNews`                |
| `deleteNews(programId, newsId)`        | DELETE | `/programs/<programId>/news/<newsId>/`            | —                   | `void`                    |

Зеркало profile-news / project-news, только префикс `/programs/<id>/news`.

---

## Routes (`ui/routes/program/`)

### `program.routes.ts`

```
/office/program/
  /                   → redirect to all
  /all                → ProgramMainComponent (список всех)
/office/program/:programId  → lazy ./detail.routes
```

### `detail.routes.ts`

```
/office/program/:programId
  resolve: ProgramDetailResolver
  data: { listType: "program" }
  parent: DeatilComponent (виджет)
  /                       → ProgramDetailMainComponent
  /projects               → ProgramListComponent (resolve: ProgramProjectsResolver, data: { listType: "projects" })
  /members                → ProgramListComponent (resolve: ProgramMembersResolver, data: { listType: "members" })
  /projects-rating        → ProgramListComponent (data: { listType: "rating" })  // без resolver
/office/program/:programId/register  → ProgramRegisterComponent (resolve: ProgramRegisterResolver)  // вне DeatilComponent
```

> `ProgramListComponent` переиспользуется для трёх типов списков (projects/members/rating) — переключается по `route.data.listType`.

> `register` лежит вне `DeatilComponent` (как `/auth/verification` в auth-модуле) — отдельный экран регистрации, не вкладка детальной.

---

## Pages (`ui/pages/program/`)

| Page                             | Файл                                                                       | Selector                      | Что                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| `ProgramComponent`               | `pages/program/program.component.ts`                                       | `app-program`                 | Корневой layout.                                                                       |
| `ProgramMainComponent`           | `pages/program/main/main.component.ts`                                     | `app-program-main`            | Список всех программ с пагинацией.                                                     |
| `ProgramCardComponent`           | `pages/program/main/program-card/program-card.component.ts`                | `app-program-card`            | Карточка программы в списке.                                                           |
| `ProgramDetailMainComponent`     | `pages/program/detail/main/main.component.ts`                              | `app-main`                    | Главная вкладка детальной — описание, новости, кнопки действий, partner-program-links. |
| `ProgramListComponent`           | `pages/program/detail/list/list.component.ts`                              | `app-program-list`            | Универсальный список (projects/members/rating).                                        |
| `ProgramProjectsFilterComponent` | `detail/list/program-projects-filter/program-projects-filter.component.ts` | `app-program-projects-filter` | Фильтры на странице projects/rating через `PartnerProgramFields`.                      |
| `RatingCardComponent`            | `detail/list/rating-card/rating-card.component.ts`                         | `app-rating-card`             | Карточка проекта в рейтинге.                                                           |
| `ProjectRatingComponent`         | `detail/list/rating-card/project-rating/project-rating.component.ts`       | `app-project-rating`          | Форма оценки проекта по критериям.                                                     |
| `ProgramRegisterComponent`       | `pages/program/detail/register/register.component.ts`                      | `app-program-register`        | Динамическая форма регистрации в программу (поля из `getDataSchema`).                  |

### Resolvers

- `ProgramDetailResolver` — `Program.getOne(id)`.
- `ProgramProjectsResolver` — `getAllProjects(programId)`.
- `ProgramMembersResolver` — `getAllMembers(programId, 0, 20)`.
- `ProgramRegisterResolver` — `getDataSchema(programId)` для построения формы.

---

## Widgets

| Widget                            | Где                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<app-detail listType="program">` | универсальная шапка ([`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md)).                                                       |
| `<app-program-links>`             | блок «контакты» / «материалы» ([`docs/social-platform/ui-widgets.md`](../social-platform/ui-widgets.md#programlinkscomponent--courseaboutcomponent)). |
| `<app-news-card>`                 | карточка новости в ленте программы.                                                                                                                   |
| `<app-news-form>`                 | создание новости (для менеджера).                                                                                                                     |
| `<app-info-card type="rating">`   | карточка проекта в рейтинге.                                                                                                                          |

---

## Consumers

| Где                                                      | Как использует                                                                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `pages/projects/edit/components/project-additional-step` | Использует `ProgramRepositoryPort.getProgramProjectAdditionalFields()` — определяет дополнительные поля проекта в программе. |
| `pages/projects/detail/info`                             | `Project.partnerProgram` — связь с программой.                                                                               |
| `pages/courses/detail/...`                               | `course.partnerProgramId` — связь курса с программой.                                                                        |
| `widgets/detail`                                         | `listType: "program"` режим.                                                                                                 |
| `domain/auth/user.model.ts`                              | `User.programs: Program[]` — программы пользователя.                                                                         |

---
