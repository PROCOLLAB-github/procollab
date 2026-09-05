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

## Детализация экспертного оценивания в аналитике

На `/office/program/:programId/analytics` организатор открывает назначения из трёх
метрик: «Назначений всего», «Выполнено», «Ожидает». Нулевые метрики остаются видимыми,
но неактивными. Доступ окончательно проверяет backend. Новых маршрутов нет.

### API и архитектура

- `GET /programs/:programId/manager-overview/` — сводка, включая `attention.delayedExperts`.
- `GET /programs/:programId/manager-overview/assignments/?scope=all|completed|pending` — массив назначений.
- `GET /programs/:programId/manager-overview/assignments/:assignmentId/scores/` — поля назначения и все критерии в `scores`.

Backend API в этом PR не изменялся. Данные проходят через существующий
`CamelcaseInterceptor`: `assignment_id → assignmentId`, `criteria_total → criteriaTotal`,
`criteria_scored → criteriaScored`, `waiting_seconds → waitingSeconds`,
`delayed_experts → delayedExperts`. Важно: установленный camelcase-keys преобразует
`overdue_24h → overdue24H` и `overdue_48h → overdue48H` (заглавная H).
Ручного преобразования SLA-полей нет.

Путь данных: `ProgramRepositoryPort → ProgramHttpAdapter / ProgramRepository →
GetProgramManagerAssignmentsUseCase / GetProgramManagerAssignmentScoresUseCase →
ProgramAnalyticsDrilldownService → AnalyticsDrilldownComponent`.
Use cases возвращают `Result` с `ProgramAnalyticsError`; сырой текст HTTP-ошибки не попадает в UI.

### Назначения, статусы и оценки

| Scope       | Заголовок                | Содержимое                            |
| ----------- | ------------------------ | ------------------------------------- |
| `all`       | Все назначения экспертов | Все физически существующие назначения |
| `completed` | Выполненные назначения   | Завершённое оценивание                |
| `pending`   | Ожидают оценки           | `not_ready`, `pending`, `in_progress` |

Статусы backend отображаются без пересчёта:

- `not_ready` — «Проект не сдан»;
- `pending` — «Не начал оценивание»;
- `in_progress` — «В процессе»;
- `completed` — «Выполнено».

Прогресс — например, «2 из 5 критериев»; при отсутствии критериев — «Нет критериев»,
для несданного проекта — «—». В open-режиме показываются реальные назначения,
но frontend не синтезирует задержки экспертов. В distributed-режиме
«Частично оценено» означает, что хотя бы один назначенный эксперт полностью оценил
проект, но не все назначенные эксперты завершили оценивание.

«Посмотреть оценку» открывает detail внутри той же модалки. Возврат к списку
не перезагружает назначения. Отображаются все критерии и их описания; диапазон
min/max показан отдельно от значения. Булевы строки True/False — «Да/Нет»,
числа и текст — как присланы backend. `isScored=false` — «Не оценено»;
существующая запись с `value=null` или пустой строкой — «Пустое значение».
Общий балл, среднее и итоговый рейтинг не вычисляются.

### Задержки и backlog

Третья метрика «Требует внимания» использует `attention.delayedExperts.total`.
При всех трёх нулевых значениях сохраняется зелёный empty state.
Список экспертов использует backend order, счётчики и severity:
`warning` — «Требует внимания», `critical` — «Критическая задержка».
Backend SLA: минимум два ожидания 24 часа либо одно 48 часов; UI не проверяет пороги.

При открытии списка задержек один раз запрашивается `scope=pending` для backlog.
Ошибка этого запроса не скрывает экспертов из overview. Backlog фильтруется строго
по `assignment.expert.expertId`, а не по userId или имени. `not_ready` отделён
в нижнюю секцию «Ещё не сданы»; порядок внутри групп сохранён.

Ожидание форматируется только из authoritative `waitingSeconds`:
менее часа — «< 1 ч», 7 часов — «7 ч», 30 часов — «1 д 6 ч»,
52 часа — «2 д 4 ч». Таймера и вычисления SLA по датам нет.
При `null`: несданный проект — «Проект не сдан», выполненное назначение — «—»,
остальные — «Нет данных». Неизвестная дата не подменяется нулевым ожиданием.

### Состояние, ошибки и доступность

Facade создаётся для одной модалки. До пользовательского действия запросов нет;
повторное открытие загружает свежие данные. Закрытие, смена программы и destroy
отменяют запросы и очищают detail/selected expert. Поздние ответы не обновляют
текущую программу. Ошибки 401, 403, 404 и сети показываются локально с retry,
не закрывая модалку и не скрывая основную аналитику.

Используется неизменённый shared `app-modal`. Analytics-specific компонент получает
его public `overlayRef` через ViewChild после `ngAfterViewInit` и подписывается
на attachments/detachments/keydownEvents с `takeUntilDestroyed`.
`openChange` обслуживает только backdrop, не lifecycle overlay.

Один `role=dialog`, `aria-modal=true`, динамический `aria-labelledby` и один CDK
focus trap охватывают list/detail/delayed/backlog. Initial focus на close button
выставляется только после attachment. Переходы сохраняют trap и переводят focus
на heading через Angular render lifecycle. AutoCapture/automatic restore CDK выключены.

Escape через overlay keyboard events закрывает всю модалку, не выполняет Back.
Backdrop, Escape и close button используют `closeAnalyticsModal()`.
Возврат фокуса происходит на detach только на сохранённый HTMLElement-trigger,
если он `isConnected`. Смена программы/destroy очищают ссылку. Учитывается
bottom-up destroy Angular: дочерний modal может detach до cleanup родителя;
проверяется DestroyRef владельца view, без изменения shared primitive.
Таймеров, polling, MutationObserver и document-global Escape handler нет.

Desktop: таблица внутри модалки шириной до 880px. Mobile/tablet: stacked cards,
перенос длинных имён и названий, ограничение высоты с вертикальным скроллом.
Сохранены Mont, токены и существующие zero states аналитики.

### Проверка

Regression tests покрывают adapter/repository/use cases/facade/interceptor,
scope/status/progress, nullable ожидание, критерии, задержки, смену программы,
отмену запросов и настоящий CDK Overlay lifecycle. Focus tests не подменяют
attachment событием openChange и не добавляют ручной detectChanges после клика.

Ручной smoke после доступного DEV окружения: все три scope, detail/back,
delayed/backlog/back, loading/error/retry, длинные имена на desktop/mobile,
Tab/Shift+Tab, Escape, backdrop, возврат на конкретный trigger и смена программы.
Backend, React, shared modal, зависимости, workflows/Docker и deploy вне изменений.
