<!-- @format -->

# Module: `program`

## Выбор системного кейса в проекте

Backend contract: DEV `77c8d41e2139c5902f2c7958d499fe26b9c4ef79` (merged/deployed #729).
Системное поле определяется **только** точным `name="case"`, через общую константу
`PROGRAM_CASE_FIELD_NAME`. Это `PartnerProgramField`, не отдельная Case entity.

При initial apply из программы поле case полностью исключается из
`programFieldValues`: не отправляется ни первый option, ни пустая строка/null.
Generic select сохраняет прежний первый placeholder, checkbox — `"false"`,
file по-прежнему исключается. Backend может создать draft без кейса.

После apply навигация ведёт на `/office/projects/:projectId/edit` с query
`editingStep=additional`, `fromProgram=true`, `programLinkId` из ответа apply.
Дополнительные определения/значения далее загружаются canonical GET конкретной связи,
а не берутся из встроенного `partnerProgram.programFields/programFieldValues`.

Для системного select используется обычный `app-select`, label поля и options backend,
но неизменный placeholder «Выберите кейс». Не выбранный кейс — пустой required control.
Draft save пропускает пустой/whitespace case в partial PUT; выбранный option сохраняется
и может быть изменён до сдачи. Пустое значение не является командой удалить ранее
сохранённый кейс. Повторное открытие восстанавливает canonical value; `fromProgram`
не подставляет первый option и не очищает уже сохранённый кейс.

Сдача требует заполнения обязательных полей: PUT полей и POST submit используют один
проверенный `programLinkId`. Missing/stale case 400 показываются контролируемым текстом;
stale case обновляет canonical options, сохраняя остальные локальные правки.
При `submitted=true` поля read-only. Аналитика, фильтры и статистика по кейсам не меняются.

### Canonical submission metadata / multi-program safety

Canonical GET конкретного programLinkId содержит `isCompetitive`, `submissionOpen`,
`submissionDeadline: string | null`, `canSubmit` и `submitted`. Metadata backend
является authoritative context: frontend не рассчитывает сроки/доступность заново
и не использует legacy `project.partnerProgram.canSubmit` для submission decision.
Legacy singular link остаётся только fallback для ID, если валидный query ID отсутствует.

Неконкурсная связь сохраняется без submit; сданная — без PUT и повторного submit.
Конкурсная несданная связь с `canSubmit=true` проходит validation → confirmation →
PUT fields → POST submit → обычное сохранение Project. При закрытой подаче показывается
существующая deadline modal, без PUT/POST и без перехода в обычный publish.

Backend submit остаётся последней authoritative validation при гонках: известные 400
мапятся в `submission_closed`, `already_submitted`, `not_competitive`. Первый открывает
deadline UI; последние два обновляют canonical GET без автоматического повторного submit
или success. Если обновлённый snapshot сдан, controls становятся read-only.

Обычное сохранение в verified canonical context исключает `partnerProgramId` из копии
Project payload: поле иначе означало бы legacy bind/unbind command и могло удалить
другую связь проекта. Сам FormControl не меняется; explicit dedicated assignment и
обычные legacy flows вне canonical context сохранены.

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

| Где                                                      | Как использует                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pages/projects/edit/components/project-additional-step` | Использует canonical GET/PUT через `ProjectProgramRepositoryPort` для активного `programLinkId`. |
| `pages/projects/detail/info`                             | `Project.partnerProgram` — связь с программой.                                                   |
| `pages/courses/detail/...`                               | `course.partnerProgramId` — связь курса с программой.                                            |
| `widgets/detail`                                         | `listType: "program"` режим.                                                                     |
| `domain/auth/user.model.ts`                              | `User.programs: Program[]` — программы пользователя.                                             |

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
focus trap охватывают list/detail/delayed/backlog. Trap расположен внутри
проецируемого dialog-wrapper, поэтому его anchors переносятся вместе с содержимым
при повторном открытии portal. Initial focus на close button выставляется только
после attachment. Переходы сохраняют trap и переводят focus
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

## Детализация «Требует внимания»: участники и работы (v1)

Контракт — backend PR #725 (merge `bc1fffb16071935cfce449e6c59202251cb860c6`).
Два дополнительных root-view расширяют существующий `AnalyticsDrilldownComponent`:
`participants-without-team` и `projects-awaiting-evaluation`. Все три строки внимания
теперь кнопки; нулевая строка неактивна, а при всех нулях сохранено «Ничего не требует внимания».
Tooltip — соседний контрол, его нажатие не открывает детализацию.

### API и типы

- `getManagerParticipantsWithoutTeam` / `GetProgramManagerParticipantsWithoutTeamUseCase`:
  `GET /programs/:programId/manager-overview/participants-without-team/`.
- `getManagerProjectsAwaitingEvaluation` / `GetProgramManagerProjectsAwaitingEvaluationUseCase`:
  `GET /programs/:programId/manager-overview/projects-awaiting-evaluation/`.

Оба метода принимают `ProgramAnalyticsAttentionQuery` (`search`, `limit`, `offset`).
Путь данных сохраняет port → HTTP adapter → repository → use case → page-local facade.
Компонент не использует HttpClient. Use cases возвращают `Result<…, ProgramAnalyticsError>`.
Тип страницы переиспользует `ApiPagination`, уточняя nullable `next`/`previous` только
в analytics contract; общая модель пагинации не меняется. Ручного snake_case parser нет.
Общий interceptor преобразует `user_id`, `registered_at`, `program_project_id`,
`submitted_at`, `reason_label`, `assignments_total`, `assignments_completed` в camelCase.

`ProgramAnalyticsAttentionParticipant` содержит только `userId`, `fullName`, `avatar`,
`city`, `registeredAt`. Дата означает регистрацию в программе, не создание аккаунта.
Legacy city показывается как прислано. Отсутствующие город/дата: «Не указано» / «Нет данных».
Отсутствие команды не означает заявленный статус «Ищет команду».

`ProgramAnalyticsAttentionProject` — одна сданная работа программы: `programProjectId`,
`project`, nullable `leader`/`submittedAt`, `status`, `reason`, `reasonLabel` и nullable
assignment-счётчики. Режим берётся из `mode` ответа списка, не из старого overview.
Пустой руководитель — «Не указан», неизвестная дата — «Дата сдачи неизвестна».

Причины backend (код используется как стабильный идентификатор, label — для отображения):

- `no_assignments` — «Эксперты не назначены»;
- `no_completed_evaluations` — «Нет завершённых оценок»;
- `partially_evaluated` — «Частично оценено»;
- `awaiting_first_evaluation` — «Ожидает первой оценки» (open).

В distributed прогресс: «Завершили: X из Y» из `assignmentsCompleted/assignmentsTotal`;
при total=0 — «Нет назначений». В open — «—», null не становится нулём.
Нет расчёта процентов, SLA, средних баллов или требуемого числа экспертов.
Несданные работы исключены backend и не добавляются обратно через assignments.

### Поиск, страницы, ошибки и отмена

Данные не кешируются между открытиями. Нажатие root-trigger очищает прошлый контекст,
поиск и offset и делает один запрос. Вместе с overview списки не загружаются.
Черновик поиска применяется по Enter/«Найти», сервер получает trimmed search.
«Очистить» возвращает полный список. Новый поиск всегда начинает с offset=0.
Размер страницы фиксирован: 25. «Назад»/«Далее» меняют offset, диапазон и count
отображаются из актуального detail response. Ссылки backend next/previous не открываются
напрямую. Расхождение со старым числом overview не ошибка; overview циклически не обновляется.

Loading, успешный список, empty без поиска и search-empty — разные состояния.
При пустом поиске: «Все зарегистрированные участники уже состоят в командах.» либо
«Нет работ, ожидающих оценивания.» При применённом поиске: «По вашему запросу ничего не найдено.»
Ошибки 401/403/404/network локальны и не скрывают основную аналитику. Показываются
только контролируемые сообщения, не HTTP body. Retry сохраняет view/program/search/limit/offset.

`cancelAttention` + `takeUntilDestroyed` отписывают активный запрос при закрытии,
другом root-open, новом поиске, смене страницы/программы и destroy. Поздний ответ
не может перезаписать новую страницу. Перед загрузкой старые results очищаются.
Сохраняется реактивный parent `ActivatedRoute.paramMap` из #332: смена 12 → 13 сразу
обнуляет публичный programId, отменяет overview и через signal input закрывает drilldown.
До соответствующего resolver Program(13) новый overview не запрашивается; новый attention
список не запрашивается и после resolver, пока пользователь снова не нажмёт строку.

### Общая модалка, навигация и ограничения

Shared `app-modal` не меняется. У всех views один overlay/dialog/focus trap.
Focus на close только после attachments, Escape через overlay keydownEvents,
backdrop и close используют единый flow; при detach возврат на конкретный connected trigger.
Смена программы/destroy не возвращают focus в старый контекст. Сохранён bottom-up cleanup.
Новых таймеров, polling, глобальных keyboard handlers или второго trap нет.

Явные RouterLink-действия: «Открыть профиль» → `/office/profile/:userId`,
«Открыть проект» → `/office/projects/:projectId`. При уходе ссылка-trigger очищается,
модалка закрывается, запросы отменяются. Новых маршрутов и вложенных modal нет.
На desktop — таблицы; mobile/tablet — stacked cards с подписями, переносом длинных
значений и вертикальным скроллом внутри существующего dialog до 880px шириной.

V1 не добавляет вуз/роль/кейс, contact/team actions, напоминания, назначения,
несданные работы, exports или fake data. Контракт/семантика backend не расширяются.
Targeted tests покрывают pipeline, camelcase/null, поиск/страницы/retry/races,
реальный overlay lifecycle и observable route change до resolver.
Ручной DEV smoke и mobile/keyboard проверяются отдельно от unit/component tests.

## Детализация «Проекты не сдали решение»

Backend #726 смержен как `4dea5bd8893839e46800f5c9ee20646fc6307aab`; успешный
DEV deploy подтверждён для этого exact SHA. Angular база —
`ed06dff90feff709737b7c47ab405ec99623167f`.

### Единицы воронок

Строка «Сдали проект» удалена только из `participantFunnel` computed UI.
`participantFunnel.submittedProjectCreators` остаётся частью domain/API contract:
это уникальные зарегистрированные руководители, а не число сданных проектов.
Два руководителя могут сдать шесть проектов. Воронка участников содержит три стадии:
«Зарегистрировались» (`uniqueParticipants`), «В команде» (`withTeam`),
«Создали проект» (`projectCreators`). Техническое поле `registrations` сохранено в
domain/API contract, но не отображается отдельной метрикой. Для данных 11 / 7 / 4 / 3
пользователь видит 7 → 4 → 3. Нулевые пользовательские метрики сохраняют zero state,
даже если техническое количество регистрационных записей ненулевое.
Tooltip первой стадии: «Уникальные зарегистрированные участники программы.»
Tooltip карточки: «Путь участников от регистрации до создания проекта.»
Сдача относится к воронке проектов.
Её стадии и значения не меняются: «Создано», «Черновик / не сдано», «Сдано»,
«Оценено». «Сдано» по-прежнему использует `solutionFunnel.submitted`.

Подписи evaluation, assignment и attention metrics используют существующий
`text-body-10` (10px), как подписи воронки. Текст «Максимум экспертов на проект»
также 10px. Конфликтующие scoped font-size удалены; глобальная типографика,
размеры заголовков и акцентных числовых значений не меняются. Число лимита сохраняет 13px.

### Применимость и путь данных

Overview `attention.projectsNotSubmitted: { applicable: boolean; total: number }`
задаёт применимость. При `applicable=false` строки нет и detail не запрашивается,
даже если старый `solutionFunnel.notSubmitted` ненулевой. При true строка
«Проекты не сдали решение» стоит после работ, ожидающих оценивания, перед экспертами.
Нулевой total виден неактивной кнопкой; сообщение «Ничего не требует внимания»
сохраняется при всех нулевых метриках. Tooltip — отдельный соседний контрол:
«Проекты конкурсной программы, которые ещё не отправили решение.»

`GetProgramManagerProjectsNotSubmittedUseCase` вызывает repository port → repository
→ HTTP adapter → `GET /programs/:programId/manager-overview/projects-not-submitted/`.
Компоненты не используют HttpClient. `ProgramAnalyticsNotSubmittedProjectsPage`
расширяет существующий `ProgramAnalyticsAttentionPage<ProgramAnalyticsNotSubmittedProject>`.
Новые общие pagination-модели и manual snake_case преобразования не добавлены.
`CamelcaseInterceptor` преобразует `projects_not_submitted`, `program_project_id`,
`user_id`, `full_name`, `linked_at`, `submission_deadline`, `submission_open`.

Строка содержит `programProjectId`, безопасные `project` и nullable `leader`,
`linkedAt` — дату связи с программой, не создания проекта. Unknown leader —
«Не указан», пустой avatar использует существующий placeholder. Никаких email,
кейсов, предполагаемых процентов готовности или дополнительных пользовательских
запросов нет.

### View, сроки и страницы

Новый root-view `projects-not-submitted` расширяет ту же модалку, overlay, dialog
и единственный CdkTrapFocus. Desktop — таблица, mobile/tablet — stacked rows с
подписями; длинные имена переносятся. Колонки: проект, руководитель, «В программе с»
(`dd.MM.yyyy`), статус, «Открыть проект» (`RouterLink /office/projects/:projectId`).

Metadata берётся из detail, не из потенциально устаревшего overview:

- известный `submissionDeadline` и `submissionOpen=true`: «Сдача открыта до …»;
- известный срок и false: «Срок сдачи завершён …»;
- null: «Срок сдачи не указан».

Дата отображается DatePipe в локальном часовом поясе браузера как
`dd.MM.yyyy, HH:mm`. Статус строки — «Не сдано» или «Срок сдачи завершён» строго
по backend `submissionOpen`, не по Date.now(). Клиент не рассчитывает SLA,
оставшиеся часы или severity. Если detail сообщает `applicable=false`, UI
показывает «Для этой программы сдача решения не требуется.», не утверждает,
что все проекты сданы.

Поиск по названию отправляется только Enter/«Найти». «Очистить» сбрасывает search
и offset; limit=25. Диапазон, count и «Назад»/«Далее» берутся из detail. По next URL
клиент не переходит. Retry сохраняет program/search/offset. Loading: «Загружаем список…»;
empty: «Все проекты программы уже сданы.»; search-empty: «По вашему запросу ничего
не найдено.» Ошибки 401/403/404/network контролируемые, raw HTTP body не выводится
и основная аналитика не скрывается.

### Отмена, доступность и проверки

Повторно используется `cancelAttention`/`takeUntilDestroyed`: close, другой root,
search, page, смена программы, destroy и RouterLink отменяют запрос и очищают
старую страницу. Нет второго механизма race-control. Observable parent paramMap
12 → 13 обнуляет exposed programId до resolver, закрывает модалку, отписывает
старый Subject. Program(13) запускает только overview; detail ждёт нового клика.

Сохранены initial focus только после attachments, Escape/backdrop/close через
единый flow, возврат на connected trigger, отсутствие возврата при RouterLink,
смене программы, disconnected trigger и bottom-up destroy. Новый view включён
в parameterized lifecycle, search/pagination/race и SPA regression tests.

V1 не меняет backend, React, shared modal, submission/scoring lifecycle, зависимости,
workflows, Docker или deploy. Unit/component tests с реальным CDK Overlay не
заменяют отдельную браузерную desktop/mobile/keyboard/E2E проверку.

## Кейсы в manager overview

Карточка «Кейсы» напрямую использует обязательный `ProgramAnalyticsOverview.cases`
из того же `GET /programs/:programId/manager-overview/`, без дополнительного запроса.
Backend contract deployed: `63ebc4accdb147cf1e02feaaf141d79e7d92966b`.
Global CamelcaseInterceptor преобразует `submission_applicable`, `without_case`,
`participants_total`, `projects_total`, `not_submitted` в соответствующие camelCase-поля.
Ручного парсера и пересчёта backend counts нет; вычисляются только проценты ширины полосы.

- `configured=false`: «Кейсы не настроены для этой программы», без строк или withoutCase.
- Backend order `items` сохраняется, в том числе все настроенные варианты с нулевыми
  счётчиками. Для `configured=true, items=[]` — controlled empty state
  «Для программы пока не настроены варианты кейсов».
- `withoutCase` добавляется последней строкой «Без выбранного кейса» только при
  `projectsTotal > 0` и наличии настроенных вариантов. Legacy/missing choices не скрываются.
- При `submissionApplicable=false` видны только название, проекты и участники:
  submitted/notSubmitted остаются в модели, но их подписи и segmented bar скрыты.
- Participants уникальны внутри каждого кейса, но могут повторяться в разных кейсах.
  Их нельзя складывать в global unique. Это поясняет tooltip карточки.
- Полоса показывает submitted/projectsTotal и notSubmitted/projectsTotal; при нуле
  проектов обе ширины равны нулю. Доступное текстовое описание содержит все метрики;
  строки не кликабельны, без drilldown/export/filter/sorting.

Локальная типографика: заголовок 16/22, 600; имя 12/18, 600 (две строки, полный текст
в DOM); главное число 17/20, 700; служебные подписи и empty state 10px.
Global tokens и размеры других карточек не меняются. Название и total разделены
grid `minmax(0, 1fr) auto`; метрики переносятся на узкой ширине.
Карточка сохраняет min-height 250px и ограничена max-height 380px; внутренний список
имеет bounded vertical scroll при большом числе кейсов и доступен с клавиатуры.
На mobile карточка занимает ширину существующей сетки, без отдельного компонента.
